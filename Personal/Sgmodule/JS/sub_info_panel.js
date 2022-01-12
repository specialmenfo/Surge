/*

示例↓↓↓ 
----------------------------------------

[Script]
Sub_info = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/specialmenfo/Surge/master/Personal/Sgmodule/JS/sub_info_panel.js,script-update-interval=0,argument=url=[URL encode 后的机场节点链接]&reset_day=1&title=AmyInfo&icon=bonjour&color=#007aff

[Panel]
Sub_info = script-name=Sub_info,update-interval=600

----------------------------------------
*/

(async () => {
    let args = getArgs();
    let info = await getDataInfo(args.url);
    if (!info) $done();
    let resetDayLeft = getRmainingDays(parseInt(args["reset_day"]));
  
    let used = info.download + info.upload;
    let total = info.total;
    let expire = args.expire || info.expire;
    let content = [`用量：${bytesToSize(used)} | ${bytesToSize(total)}`];
  
    if (resetDayLeft) {
      content.push(`重置：剩餘${resetDayLeft}天`);
    }
    if (expire) {
      if (/^[\d]+$/.test(expire)) expire *= 1000;
      content.push(`到期：${formatTime(expire)}`);
    }
  
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;
  
    $done({
      title: `${args.title} | ${hour}:${minutes}`,
      content: content.join("\n"),
      icon: "xserve",
      "icon-color": "#336774",
    });
  })();
  
  function getArgs() {
    return Object.fromEntries(
      $argument
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
        reject("連結內容不帶有網路用量資訊");
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
    if (!resetDay) return;
  
    let now = new Date();
    let today = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    let daysInMonth;
  
    if (resetDay > today) {
      daysInMonth = 0;
    } else {
      daysInMonth = new Date(year, month + 1, 0).getDate();
    }
  
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
