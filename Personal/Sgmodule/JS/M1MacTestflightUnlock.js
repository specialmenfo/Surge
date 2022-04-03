/*
M1 系列 Mac 解除 iOS TestFlight 軟件限制
***************************
Surge:
[Script]
ForceInstallTF= type=http-response,pattern=^https:\/\/testflight\.apple\.com((\/v3\/accounts\/.+?\/apps$)|(\/v2\/accounts\/.+?\/apps\/.+?\/builds\/.+)),script-path=https://raw.githubusercontent.com/specialmenfo/Surge/master/Personal/Sgmodule/JS/Skyxim-ForceInstall.js, requires-body=true, timeout=10

[MITM]
hostname = %APPEND% testflight.apple.com
**************************/
/**

 * ^https:\/\/testflight\.apple\.com\/v2\/accounts\/.+?\/apps\/.+?\/builds\/.+
 * ^https:\/\/testflight\.apple\.com\/v3\/accounts\/.+?\/apps$
 * ^https:\/\/testflight\.apple\.com\/v2\/accounts\/.+?\/apps\/.+?\/platforms\/ios\/trains\/.+?\/builds
 */
 const url = $request.url
 const responseBody = $response.body
 
     ; (async () => {
         const regeList = /.*?\/v3\/accounts\/.+?\/apps$/
         const regeMainPage = /.*?\/v2\/accounts\/.+?\/apps\/.+?\/builds\/.+/
         const regBiulds = /.*?\/v2\/accounts\/.+?\/apps\/.+?\/platforms\/ios\/trains\/.+?\/builds/
         if (regeList.test(url)) {
             $done({ body: list(responseBody) })
             return
         }
 
         if (regeMainPage.test(url)) {
             if (url.endsWith("install")) {
                 console.log("is install")
                 $done({ body: responseBody })
                 return
             }
 
             $done({ body: info(responseBody) })
             return
         }
 
         if (regBiulds.test(url)) {
             $done({ body: builds(responseBody) })
             return
         }
     })()
         .catch(error => {
             console.log(error)
         }).finally(() => $done())
 
 function info(responseBody) {
     let body = JSON.parse(responseBody)
     let family = {
         "name": "Mac",
         "unsupportedDevices": [
         ],
         "minimumSupportedDevice": null
     }
 
     for (const build of body.data.builds) {
         build.platformCompatible = true
         build.hardwareCompatible = true
         build.compatible = true
         build.permission = "install"
 
 
         build.compatibilityData.compatibleDeviceFamilies.push(family)
     }
 
     let build = body.data.currentBuild
     build.platformCompatible = true
     build.hardwareCompatible = true
     build.compatible = true
     build.permission = "install"
 
 
     build.compatibilityData.compatibleDeviceFamilies.push(family)
     return JSON.stringify(body)
 }
 
 function list(responseBody) {
     if (responseBody === "") {
         $done({ body: responseBody })
     }
 
     let body = JSON.parse(responseBody)
 
     for (const app of body.data) {
         for (const p of app.platforms) {
             if (p.name === "ios") {
                 console.log(p.build.name)
                 p.build.hardwareCompatible = true
                 p.build.compatible = true
             }
         }
     }
 
     return JSON.stringify(body)
 }
 
 function builds(responseBody) {
     let body = JSON.parse(responseBody)
     if (body.error === null) {
         for (const build of body.data) {
             if (build.platform === "ios") {
                 build.compatible = true
             }
         }
     }
 
     return JSON.stringify(body)
 }
