const method = $request.method;
const url = $request.url;
const status = $response.status;
let headers = $response.headers;
const notifiTitle = "百度搜索防跳轉AppStore錯誤";

if (method !== "GET" || status !== 302 || !headers.hasOwnProperty('Location')) {
    console.log(`method:${method},status:${status},url:${url}`);
    $notification.post(notifiTitle, "百度防跳轉AppStore", "method/status有誤");
} else {
    if (headers.Location.indexOf('.apple.com') !== -1) {
        let tokenData = getUrlParamValue(url, 'tokenData');
        if (tokenData == null) {
            console.log(`未獲取到tokenData,url:${url}`);
            $notification.post(notifiTitle, "getUrlParamValue", "未獲取到tokenData");
        } else {
            let tokenDataObj = JSON.parse(decodeURIComponent(tokenData));
            headers.Location = tokenDataObj.url;
            console.log('成功');
        }
    } else {
        console.log('無需修改Location');
    }
}
$done({
    headers
});

/**
 * 根據參數名稱獲取url地址中的參數值
 * @param {*} url url
 * @param {*} queryName 參數名稱
 * @returns 參數值 未獲取到返回null
 */
function getUrlParamValue(url, queryName) {
    let i = url.indexOf("?");
    if (i != -1 && i != url.length - 1) {
        let arr = url.substring(i + 1).split('&');
        for (let x = 0; x < arr.length; x++) {
            let pair = arr[x].split('=');
            if (pair.length == 2) {
                if (pair[0] == queryName) {
                    return pair[1];
                }
            } else {
                console.log('url:' + url);
                $notification.post(notifiTitle, '獲取url參數', "pair錯誤");
            }
        }
    } else {
        console.log('url:' + url);
        $notification.post(notifiTitle, '獲取url參數', "i錯誤");
        return null;
    }
    // 未匹配到queryName
    return null;
}
