const chavy = init()
const cookieName = '騰訊視頻'
const KEY_signcookie = 'chavy_cookie_videoqq'
const KEY_loginurl = 'chavy_auth_url_videoqq'
const KEY_loginheader = 'chavy_auth_header_videoqq'
const KEY_mh5signurl = 'chavy_msign_url_videoqq'
const KEY_mh5signheader = 'chavy_msign_header_videoqq'

const signinfo = {}
let VAL_signcookie = chavy.getdata(KEY_signcookie)
let VAL_loginurl = chavy.getdata(KEY_loginurl)
let VAL_loginheader = chavy.getdata(KEY_loginheader)
let VAL_mh5signurl = chavy.getdata(KEY_mh5signurl)
let VAL_mh5signheader = chavy.getdata(KEY_mh5signheader)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await login()
  await signapp()
  await getexp()
  showmsg()
})()
.catch((e) => chavy.log(`❌ ${cookieName} 簽到失敗: ${e}`))
.finally(() => chavy.done())

function login() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_loginurl, headers: JSON.parse(VAL_loginheader) }
    chavy.get(url, (error, response, data) => {
      try {
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `簽到結果: 失敗`, `說明: ${e}`)
        chavy.log(`❌ ${cookieName} login - 登錄失敗: ${e}`)
        chavy.log(`❌ ${cookieName} login - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function signapp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const VAL_signurl = `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=hierarchical_task_system&cmd=2&_=${timestamp}`
    let url = { url: VAL_signurl, headers: {} }
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.signapp = JSON.parse(data.match(/\((.*)\);/)[1])
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `簽到結果: 失敗`, `說明: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - 簽到失敗: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getexp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const VAL_getexpurl = `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=spp_PropertyNum&cmd=1&growth_value=1&otype=json&_=${timestamp}`
    let url = { url: VAL_getexpurl, headers: {} }
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.expinfo = JSON.parse(data.match(/\((.*)\);/)[1])
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `簽到結果: 失敗`, `說明: ${e}`)
        chavy.log(`❌ ${cookieName} getexp - 簽到失敗: ${e}`)
        chavy.log(`❌ ${cookieName} getexp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  if (signinfo.signapp) {
    let subTitle, detail
    if (signinfo.signapp.ret == 0) {
      subTitle = '簽到結果: 成功'
      if (signinfo.expinfo) {
        subTitle += !signinfo.signapp.checkin_score ? ' (重復簽到)' : ''
        detail = `V力值: ${signinfo.expinfo.GrowthValue.num} (+${signinfo.signapp.checkin_score}), 觀影券: ${signinfo.expinfo.MovieTicket.num}, 贈片資格: ${signinfo.expinfo.GiveMovie.num}`
      }
    } else if (signinfo.signapp.ret == -10006) {
      subTitle = '簽到結果: 失敗'
      detail = `原因: 未登錄, 說明: ${signinfo.signapp.msg}`
    } else if (signinfo.signapp.ret == -10019) {
      subTitle = '簽到結果: 失敗'
      detail = `原因: 非會員, 說明: ${signinfo.signapp.msg}`
    } else {
      subTitle = '簽到結果: 未知'
      detail = `編碼: ${signinfo.signapp.ret}, 說明: ${signinfo.signapp.msg}`
    }
    chavy.msg(cookieName, subTitle, detail)
  }
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
