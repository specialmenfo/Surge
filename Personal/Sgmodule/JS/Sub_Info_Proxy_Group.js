/*

[Proxy Group]
AmyInfo = select, policy-path=http://sub.info?url=機場節點鏈接&reset_day=1&alert=1, update-interval=3600

[Script]
Sub_info = type=http-request,pattern=http://sub\.info,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/sub_info.js,timeout=10
----------------------------------------

先將帶有流量信息的節點訂閱鏈接encode，用encode後的鏈接替換"url="後面的[機場節點鏈接]

可選參數 &reset_day，後面的數字替換成流量每月重置的日期，如1號就寫1，8號就寫8。如"&reset_day=8",不加該參數不顯示流量重置信息。

可選參數 &expire，機場鏈接不帶expire信息的，可以手動傳入expire參數，如"&expire=2022-02-01",注意一定要按照yyyy-MM-dd的格式。

可選參數 &alert，流量用量超過80%、流量重置2天前、流量重置、套餐快到期，這四種情況會發送通知，參數"title=xxx" 可以自定義通知的標題。如"&alert=1&title=AmyInfo",多個機場信息，且需要通知的情況，一定要加 title 參數，不然通知判斷會出現問題
----------------------------------------
*/

let now = new Date();
let today = now.getDate();
let month = now.getMonth();
let year = now.getFullYear();
let args = getArgs($request.url);
let resetDay = parseInt(args["due_day"] || args["reset_day"]);
let resetDayLeft = getRmainingDays(resetDay);

(async () => {
  let is_enhanced = await is_enhanced_mode();
  if (is_enhanced) await sleep(2000)
  let usage = await getDataInfo(args.url);
  if (!usage) {
    $done({})
    return;
  }
  let used = usage.download + usage.upload;
  let total = usage.total;
  let expire = usage.expire || args.expire;
  let localProxy = ['=http, localhost, 6152','=http, 127.0.0.1, 6152','=socks5,127.0.0.1, 6153']
  let infoList = [`${bytesToSize(used)} | ${bytesToSize(total)}`];

  if (resetDayLeft) {
    infoList.push(`代理重置：剩餘${resetDayLeft}天`);
  }
  if (expire) {
    if (/^[\d.]+$/.test(expire)) expire *= 1000;
    infoList.push(`代理到期：${formatTime(expire)}`);
  }
  sendNotification(used / total, expire, infoList);
  let body = infoList.map((item, index) => item+localProxy[index]).join("\n");
  $done({ response: { body } });
})();

function getArgs(url) {
  return Object.fromEntries(
    url
      .slice(url.indexOf("?") + 1)
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url };
  return new Promise((resolve, reject) =>
    $httpClient.head(request, (err, resp) => {
      if (err != null) {
        reject(err);
        return;
      }
      if (resp.status !== 200) {
        reject("Not Available");
        return;
      }
      let header = Object.keys(resp.headers).find(
        (key) => key.toLowerCase() === "subscription-userinfo"
      );
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("鏈接響應頭不帶有流量信息");
    })
  );
}

async function getDataInfo(url) {
  const [err, data] = await getUserInfo(url)
    .then((data) => [null, data])
    .catch((err) => [err, null]);
  if (err) {
    console.log(err);
    return;
  }

  return Object.fromEntries(
    data
      .match(/\w+=\d+/g)
      .map((item) => item.split("="))
      .map(([k, v]) => [k, parseInt(v)])
  );
}

function getRmainingDays(resetDay) {
  if (!resetDay) return 0;
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  if (resetDay > today) daysInMonth = 0;

  return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "年" + month + "月" + day + "日";
}

function sendNotification(usageRate, expire, infoList) {
  if (!args.alert) return;
  let title = args.title || "Sub Info";
  let subtitle = infoList[0];
  let body = infoList.slice(1).join("\n");
  usageRate = usageRate * 100;

  if (resetDay <= today) month += 1;
  let resetTime = new Date(year, month, resetDay);
  //通知計數器，每月重置日重置
  let notifyCounter = JSON.parse($persistentStore.read(title) || "{}");
  if (!notifyCounter[resetTime]) {
    notifyCounter = {
      [resetTime]: { usageRate: 80, resetDayLeft: 3, expire: 31, resetDay: 1 },
    };
  }

  let count = notifyCounter[resetTime];

  if (usageRate > count.usageRate && resetDay != today) {
    $notification.post(
      `${title} | 目前代理不足${Math.ceil(100 - usageRate)}%`,
      subtitle,
      body
    );
    while (usageRate > count.usageRate) {
      if (count.usageRate < 95) {
        count.usageRate += 5;
      } else {
        count.usageRate += 4;
      }
    }
  }
  if (resetDayLeft && resetDayLeft < count.resetDayLeft && resetDay != today) {
    $notification.post(
      `${title} | 代理將在${resetDayLeft}天後重置`,
      subtitle,
      body
    );
    count.resetDayLeft = resetDayLeft;
  }
  if (resetDay == today && count.resetDay && usageRate < 5) {
    $notification.post(`${title} | 代理已重置`, subtitle, body);
    count.resetDay = 0;
  }
  if (expire) {
    let diff = (new Date(expire) - now) / (1000 * 3600 * 24);
    if (diff < count.expire) {
      $notification.post(
        `${title} | 剩餘時間不足${Math.ceil(diff)}天`,
        subtitle,
        body
      );
      count.expire -= 5;
    }
  }
  $persistentStore.write(JSON.stringify(notifyCounter), title);
}

function is_enhanced_mode() {
  return new Promise((resolve) =>
    $httpAPI("GET", "v1/features/enhanced_mode", null, (data) => {
      resolve(data.enabled);
    })
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
