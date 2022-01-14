var LogDetails = false; // 響應日誌

var out = 0; // 超時 (毫秒) 如填寫, 則不少於3000

var $nobyda = nobyda();

(async () => {
  out = $nobyda.read("iQIYI_TimeOut") || out
  cookie = cookie || $nobyda.read("CookieQY")
  LogDetails = $nobyda.read("iQIYI_LogDetails") === "true" ? true : LogDetails
  if ($nobyda.isRequest) {
    GetCookie()
  } else if (cookie) {
    await login();
    await Checkin();
    await Lottery(500);
    await $nobyda.time();
  } else {
    $nobyda.notify("愛奇藝會員", "", "簽到終止, 未獲取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})

function login() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://cards.iqiyi.com/views_category/3.0/vip_home?secure_p=iPhone&scrn_scale=0&dev_os=0&ouid=0&layout_v=6&psp_cki=' + cookie + '&page_st=suggest&app_k=8e48946f144759d86a50075555fd5862&dev_ua=iPhone8%2C2&net_sts=1&cupid_uid=0&xas=1&init_type=6&app_v=11.4.5&idfa=0&app_t=0&platform_id=0&layout_name=0&req_sn=0&api_v=0&psp_status=0&psp_uid=451953037415627&qyid=0&secure_v=0&req_times=0',
      headers: {
        sign: '7fd8aadd90f4cfc99a858a4b087bcc3a',
        t: '479112291'
      }
    }
    $nobyda.get(URL, function(error, response, data) {
      const Details = LogDetails ? data ? `response:\n${data}` : '' : ''
      if (!error && data.match(/\"text\":\"\d.+?\u5230\u671f\"/)) {
        $nobyda.expire = data.match(/\"text\":\"(\d.+?\u5230\u671f)\"/)[1]
        console.log(`愛奇藝-查詢成功: ${$nobyda.expire} ${Details}`)
      } else {
        console.log(`愛奇藝-查詢失敗${error || ': 無到期數據 ⚠️'} ${Details}`)
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Checkin() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?autoSign=yes&P00001=' + cookie
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        $nobyda.data = "簽到失敗: 接口請求出錯 ‼️"
        console.log(`愛奇藝-${$nobyda.data} ${error}`)
      } else {
        const obj = JSON.parse(data)
        const Details = LogDetails ? `response:\n${data}` : ''
        if (obj.msg == "成功") {
          if (obj.data.signInfo.code == "A00000") {
            var AwardName = obj.data.signInfo.data.rewards[0].name;
            var quantity = obj.data.signInfo.data.rewards[0].value;
            var continued = obj.data.signInfo.data.cumulateSignDaysSum;
            $nobyda.data = "簽到成功: " + AwardName + quantity + ", 累計簽到" + continued + "天 🎉"
            console.log(`愛奇藝-${$nobyda.data} ${Details}`)
          } else {
            $nobyda.data = "簽到失敗: " + obj.data.signInfo.msg + " ⚠️"
            console.log(`愛奇藝-${$nobyda.data} ${Details}`)
          }
        } else {
          $nobyda.data = "簽到失敗: Cookie無效 ⚠️"
          console.log(`愛奇藝-${$nobyda.data} ${Details}`)
        }
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Lottery(s) {
  return new Promise(resolve => {
    $nobyda.times++
      const URL = {
        url: 'https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=0&dev_os=0&dev_ua=0&net_sts=0&qyid=0&psp_uid=0&psp_cki=' + cookie + '&psp_status=0&secure_p=0&secure_v=0&req_sn=0'
      }
    setTimeout(() => {
      $nobyda.get(URL, async function(error, response, data) {
        if (error) {
          $nobyda.data += "\n抽獎失敗: 接口請求出錯 ‼️"
          console.log(`愛奇藝-抽獎失敗: 接口請求出錯 ‼️ ${error} (${$nobyda.times})`)
          //$nobyda.notify("愛奇藝", "", $nobyda.data)
        } else {
          const obj = JSON.parse(data);
          const Details = LogDetails ? `response:\n${data}` : ''
          $nobyda.last = data.match(/(機會|已經)用完/) ? true : false
          if (obj.awardName && obj.code == 0) {
            $nobyda.data += !$nobyda.last ? `\n抽獎成功: ${obj.awardName.replace(/《.+》/, "未中獎")} 🎉` : `\n抽獎失敗: 今日已抽獎 ⚠️`
            console.log(`愛奇藝-抽獎明細: ${obj.awardName.replace(/《.+》/, "未中獎")} 🎉 (${$nobyda.times}) ${Details}`)
          } else if (data.match(/\"errorReason\"/)) {
            const msg = data.match(/msg=.+?\)/) ? data.match(/msg=(.+?)\)/)[1].replace(/用戶(未登錄|不存在)/, "Cookie無效") : ""
            $nobyda.data += `\n抽獎失敗: ${msg || `未知錯誤`} ⚠️`
            console.log(`愛奇藝-抽獎失敗: ${msg || `未知錯誤`} ⚠️ (${$nobyda.times}) ${msg ? Details : `response:\n${data}`}`)
          } else {
            $nobyda.data += "\n抽獎錯誤: 已輸出日誌 ⚠️"
            console.log(`愛奇藝-抽獎失敗: \n${data} (${$nobyda.times})`)
          }
        }
        if (!$nobyda.last && $nobyda.times < 3) {
          await Lottery(s)
        } else {
          const expires = $nobyda.expire ? $nobyda.expire.replace(/\u5230\u671f/, "") : "獲取失敗 ⚠️"
          if (!$nobyda.isNode) $nobyda.notify("愛奇藝", "到期時間: " + expires, $nobyda.data);
          if (barkKey) await BarkNotify($nobyda, barkKey, '愛奇藝', `到期時間: ${expires}\n${$nobyda.data}`);
        }
        resolve()
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  })
}

function GetCookie() {
  var CKA = $request.url.match(/(psp_cki=|P00001=|authcookie=)([A-Za-z0-9]+)/)
  var CKB = JSON.stringify($request.headers).match(/(psp_cki=|P00001=|authcookie=)([A-Za-z0-9]+)/)
  var iQIYI = CKA || CKB || null
  var RA = $nobyda.read("CookieQY")
  if (iQIYI) {
    if (RA != iQIYI[2]) {
      var OldTime = $nobyda.read("CookieQYTime")
      if (!$nobyda.write(iQIYI[2], "CookieQY")) {
        $nobyda.notify(`${RA?`更新`:`首次寫入`}愛奇藝簽到Cookie失敗‼️`, "", "")
      } else {
        if (!OldTime || OldTime && (Date.now() - OldTime) / 1000 >= 21600) {
          $nobyda.write(JSON.stringify(Date.now()), "CookieQYTime")
          $nobyda.notify(`${RA?`更新`:`首次寫入`}愛奇藝簽到Cookie成功 🎉`, "", "")
        } else {
          console.log(`\n更新愛奇藝Cookie成功! 🎉\n檢測到頻繁通知, 已轉為輸出日誌`)
        }
      }
    } else {
      console.log("\n愛奇藝-與本機儲存Cookie相同, 跳過寫入 ⚠️")
    }
  } else {
    console.log("\n愛奇藝-請求不含Cookie, 跳過寫入 ‼️")
  }
}

async function BarkNotify(c,k,t,b){for(let i=0;i<3;i++){console.log(`🔷Bark notify >> Start push (${i+1})`);const s=await new Promise((n)=>{c.post({url:'https://api.day.app/push',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:t,body:b,device_key:k,ext_params:{group:t}})},(e,r,d)=>r&&r.status==200?n(1):n(d||e))});if(s===1){console.log('✅Push success!');break}else{console.log(`❌Push failed! >> ${s.message||s}`)}}}

function nobyda() {
  const times = 0
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const node = (() => {
    if (isNode) {
      const request = require('request');
      return ({
        request
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }

  const log = (message) => console.log(message)
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n簽到用時: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    log,
    time,
    times,
    done
  }
};