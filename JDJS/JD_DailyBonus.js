/*************************

京東多合一簽到腳本

更新時間: 2021.09.09 20:20 v2.1.3
有效接口: 20+
腳本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
電報頻道: @NobyDa 
問題反饋: @NobyDa_bot 
如果轉載: 請注明出處

*************************
【 QX, Surge, Loon 說明 】 :
*************************

初次使用時, app配置文件添加腳本配置, 並啓用Mitm後:

Safari瀏覽器打開登錄 https://home.m.jd.com/myJd/newhome.action 點擊"我的"頁面
或者使用舊版網址 https://bean.m.jd.com/bean/signIndex.action 點擊簽到並且出現簽到日曆
如果通知獲取Cookie成功, 則可以使用此簽到腳本. 注: 請勿在京東APP內獲取!!!

獲取京東金融簽到Body說明: 正確添加腳本配置後, 進入"京東金融"APP, 在"首頁"點擊"簽到"並簽到一次, 待通知提示成功即可.

由於cookie的有效性(經測試網頁Cookie有效週期最長31天)，如果腳本後續彈出cookie無效的通知，則需要重復上述步驟。 
簽到腳本將在每天的凌晨0:05執行, 您可以修改執行時間。 因部分接口京豆限量領取, 建議調整為凌晨簽到。

BoxJs或QX Gallery訂閱地址: https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json

*************************
【 配置多京東賬號簽到說明 】 : 
*************************

正確配置QX、Surge、Loon後, 並使用此腳本獲取"賬號1"Cookie成功後, 請勿點擊退出賬號(可能會導致Cookie失效), 需清除瀏覽器資料或更換瀏覽器登錄"賬號2"獲取即可; 賬號3或以上同理.
注: 如需清除所有Cookie, 您可開啓腳本內"DeleteCookie"選項 (第114行)

*************************
【 JSbox, Node.js 說明 】 :
*************************

開啓抓包app後, Safari瀏覽器登錄 https://home.m.jd.com/myJd/newhome.action 點擊個人中心頁面後, 返回抓包app搜索關鍵字 info/GetJDUserInfoUnion 複製請求頭Cookie字段填入json串數據內即可

如需獲取京東金融簽到Body, 可進入"京東金融"APP (iOS), 在"首頁"點擊"簽到"並簽到一次, 返回抓包app搜索關鍵字 h5/m/appSign 複製請求體填入json串數據內即可
*/

var Key = ''; //該參數已廢棄; 僅用於下游腳本的兼容, 請使用json串數據 ↓

var DualKey = ''; //該參數已廢棄; 僅用於下游腳本的兼容, 請使用json串數據  ↓

var OtherKey = ``; //無限賬號Cookie json串數據, 請嚴格按照json格式填寫, 具體格式請看以下樣例:

/*以下樣例為雙賬號("cookie"為必須,其他可選), 第一個賬號僅包含Cookie, 第二個賬號包含Cookie和金融簽到Body: 

var OtherKey = `[{
  "cookie": "pt_key=xxx;pt_pin=yyy;"
}, {
  "cookie": "pt_key=yyy;pt_pin=xxx;",
  "jrBody": "reqData=xxx"
}]`

   注1: 以上選項僅針對於JsBox或Node.js, 如果使用QX,Surge,Loon, 請使用腳本獲取Cookie.
   注2: 多賬號用戶抓取"賬號1"Cookie後, 請勿點擊退出賬號(可能會導致Cookie失效), 需清除瀏覽器資料或更換瀏覽器登錄"賬號2"抓取.
   注3: 如果使用Node.js, 需自行安裝'request'模塊. 例: npm install request -g
   注4: Node.js或JSbox環境下已配置數據持久化, 填寫Cookie運行一次後, 後續更新腳本無需再次填寫, 待Cookie失效後重新抓取填寫即可.
   注5: 腳本將自動處理"持久化數據"和"手動填寫cookie"之間的重復關係, 例如填寫多個賬號Cookie後, 後續其中一個失效, 僅需填寫該失效賬號的新Cookie即可, 其他賬號不會被清除.

*************************
【Surge 4.2+ 腳本配置】:
*************************

[Script]
京東多合一簽到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=60,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

獲取京東Cookie = type=http-request,requires-body=1,pattern=^https:\/\/(api\.m|me-api|ms\.jr)\.jd\.com\/(client\.action\?functionId=signBean|user_new\/info\/GetJDUserInfoUnion\?|gw\/generic\/hy\/h5\/m\/appSign\?),script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = ms.jr.jd.com, me-api.jd.com, api.m.jd.com

*************************
【Loon 2.1+ 腳本配置】:
*************************

[Script]
cron "5 0 * * *" tag=京東多合一簽到, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

http-request ^https:\/\/(api\.m|me-api|ms\.jr)\.jd\.com\/(client\.action\?functionId=signBean|user_new\/info\/GetJDUserInfoUnion\?|gw\/generic\/hy\/h5\/m\/appSign\?) tag=獲取京東Cookie, requires-body=true, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = ms.jr.jd.com, me-api.jd.com, api.m.jd.com

*************************
【 QX 1.0.10+ 腳本配置 】 :
*************************

[task_local]
# 京東多合一簽到
5 0 * * * https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js, tag=京東多合一簽到, img-url=https://raw.githubusercontent.com/NobyDa/mini/master/Color/jd.png,enabled=true

[rewrite_local]
# 獲取京東Cookie. 
^https:\/\/(api\.m|me-api)\.jd\.com\/(client\.action\?functionId=signBean|user_new\/info\/GetJDUserInfoUnion\?) url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

# 獲取鋼鏰簽到body. 
^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/hy\/h5\/m\/appSign\? url script-request-body https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[mitm]
hostname = ms.jr.jd.com, me-api.jd.com, api.m.jd.com

*************************/

var LogDetails = false; //是否開啓響應日誌, true則開啓

var stop = '0'; //自定義延遲簽到, 單位毫秒. 默認分批併發無延遲; 該參數接受隨機或指定延遲(例: '2000'則表示延遲2秒; '2000-5000'則表示延遲最小2秒,最大5秒內的隨機延遲), 如填入延遲則切換順序簽到(耗時較長), Surge用戶請注意在SurgeUI界面調整腳本超時; 注: 該參數Node.js或JSbox環境下已配置數據持久化, 留空(var stop = '')即可清除.

var DeleteCookie = false; //是否清除所有Cookie, true則開啓.

var boxdis = true; //是否開啓自動禁用, false則關閉. 腳本運行崩潰時(如VPN斷連), 下次運行時將自動禁用相關崩潰接口(僅部分接口啓用), 崩潰時可能會誤禁用正常接口. (該選項僅適用於QX,Surge,Loon)

var ReDis = false; //是否移除所有禁用列表, true則開啓. 適用於觸發自動禁用後, 需要再次啓用接口的情況. (該選項僅適用於QX,Surge,Loon)

var out = 0; //接口超時退出, 用於可能發生的網絡不穩定, 0則關閉. 如QX日誌出現大量"JS Context timeout"後腳本中斷時, 建議填寫6000

var $nobyda = nobyda();

var merge = {};

var KEY = '';

async function all(cookie, jrBody) {
  KEY = cookie;
  merge = {};
  $nobyda.num++;
  switch (stop) {
    case 0:
      await Promise.all([
        JingDongBean(stop), //京東京豆
        JingDongStore(stop), //京東超市
        JingRongSteel(stop, jrBody), //金融鋼鏰
        JingDongTurn(stop), //京東轉盤
        JDFlashSale(stop), //京東閃購
        JingDongCash(stop), //京東現金紅包
        JDMagicCube(stop, 2), //京東小魔方
        JingDongSubsidy(stop), //京東金貼
        JingDongGetCash(stop), //京東領現金
        JingDongShake(stop), //京東搖一搖
        JDSecKilling(stop), //京東秒殺
        // JingRongDoll(stop, 'JRDoll', '京東金融-簽壹', '4D25A6F482'),
        // JingRongDoll(stop, 'JRThreeDoll', '京東金融-簽叄', '69F5EC743C'),
        // JingRongDoll(stop, 'JRFourDoll', '京東金融-簽肆', '30C4F86264'),
        // JingRongDoll(stop, 'JRFiveDoll', '京東金融-簽伍', '1D06AA3B0F')
      ]);
      await Promise.all([
        JDUserSignPre(stop, 'JDUndies', '京東商城-內衣', '4PgpL1xqPSW1sVXCJ3xopDbB1f69'), //京東內衣館
        JDUserSignPre(stop, 'JDCard', '京東商城-卡包', '7e5fRnma6RBATV9wNrGXJwihzcD'), //京東卡包
        // JDUserSignPre(stop, 'JDCustomized', '京東商城-定制', '2BJK5RBdvc3hdddZDS1Svd5Esj3R'), //京東定制
        JDUserSignPre(stop, 'JDaccompany', '京東商城-陪伴', 'kPM3Xedz1PBiGQjY4ZYGmeVvrts'), //京東陪伴
        JDUserSignPre(stop, 'JDShoes', '京東商城-鞋靴', '4RXyb1W4Y986LJW8ToqMK14BdTD'), //京東鞋靴
        JDUserSignPre(stop, 'JDChild', '京東商城-童裝', '3Af6mZNcf5m795T8dtDVfDwWVNhJ'), //京東童裝館
        JDUserSignPre(stop, 'JDBaby', '京東商城-母嬰', '3BbAVGQPDd6vTyHYjmAutXrKAos6'), //京東母嬰館
        JDUserSignPre(stop, 'JD3C', '京東商城-數碼', '4SWjnZSCTHPYjE5T7j35rxxuMTb6'), //京東數碼電器館
        JDUserSignPre(stop, 'JDWomen', '京東商城-女裝', 'DpSh7ma8JV7QAxSE2gJNro8Q2h9'), //京東女裝館
        JDUserSignPre(stop, 'JDBook', '京東商城-圖書', '3SC6rw5iBg66qrXPGmZMqFDwcyXi'), //京東圖書
        // JDUserSignPre(stop, 'ReceiveJD', '京東商城-領豆', 'Ni5PUSK7fzZc4EKangHhqPuprn2'), //京東-領京豆
        JingRongDoll(stop, 'JTDouble', '京東金貼-雙簽', '1DF13833F7'), //京東金融 金貼雙簽
        // JingRongDoll(stop, 'XJDouble', '金融現金-雙簽', 'F68B2C3E71', '', '', '', 'xianjin') //京東金融 現金雙簽
      ]);
      await Promise.all([
        JDUserSignPre(stop, 'JDStory', '京東失眠-補貼', 'UcyW9Znv3xeyixW1gofhW2DAoz4'), //失眠補貼
        JDUserSignPre(stop, 'JDPhone', '京東手機-小時', '4Vh5ybVr98nfJgros5GwvXbmTUpg'), //手機小時達
        JDUserSignPre(stop, 'JDEsports', '京東商城-電競', 'CHdHQhA5AYDXXQN9FLt3QUAPRsB'), //京東電競
        JDUserSignPre(stop, 'JDClothing', '京東商城-服飾', '4RBT3H9jmgYg1k2kBnHF8NAHm7m8'), //京東服飾
        JDUserSignPre(stop, 'JDSuitcase', '京東商城-箱包', 'ZrH7gGAcEkY2gH8wXqyAPoQgk6t'), //京東箱包館
        JDUserSignPre(stop, 'JDSchool', '京東商城-校園', '2QUxWHx5BSCNtnBDjtt5gZTq7zdZ'), //京東校園
        JDUserSignPre(stop, 'JDHealth', '京東商城-健康', 'w2oeK5yLdHqHvwef7SMMy4PL8LF'), //京東健康
        JDUserSignPre(stop, 'JDShand', '京東拍拍-二手', '3S28janPLYmtFxypu37AYAGgivfp'), //京東拍拍二手
        JDUserSignPre(stop, 'JDClean', '京東商城-清潔', '2Tjm6ay1ZbZ3v7UbriTj6kHy9dn6'), //京東清潔館
        JDUserSignPre(stop, 'JDCare', '京東商城-個護', '2tZssTgnQsiUqhmg5ooLSHY9XSeN'), //京東個人護理館
        JDUserSignPre(stop, 'JDJiaDian', '京東商城-家電', '3uvPyw1pwHARGgndatCXddLNUxHw'), // 京東小家電
        // JDUserSignPre(stop, 'JDJewels', '京東商城-珠寶', 'zHUHpTHNTaztSRfNBFNVZscyFZU'), //京東珠寶館
        // JDUserSignPre(stop, 'JDMakeup', '京東商城-美妝', '2smCxzLNuam5L14zNJHYu43ovbAP'), //京東美妝館
        JDUserSignPre(stop, 'JDVege', '京東商城-菜場', 'Wcu2LVCFMkBP3HraRvb7pgSpt64'), //京東菜場
        // JDUserSignPre(stop, 'JDLive', '京東智能-生活', 'KcfFqWvhb5hHtaQkS4SD1UU6RcQ') //京東智能生活
      ]);
      await JingRongDoll(stop, 'JDDouble', '金融京豆-雙簽', 'F68B2C3E71', '', '', '', 'jingdou'); //京東金融 京豆雙簽
      break;
    default:
      await JingDongBean(0); //京東京豆
      await JingDongStore(Wait(stop)); //京東超市
      await JingRongSteel(Wait(stop), jrBody); //金融鋼鏰
      await JingDongTurn(Wait(stop)); //京東轉盤
      await JDFlashSale(Wait(stop)); //京東閃購
      await JingDongCash(Wait(stop)); //京東現金紅包
      await JDMagicCube(Wait(stop), 2); //京東小魔方
      await JingDongGetCash(Wait(stop)); //京東領現金
      await JingDongSubsidy(Wait(stop)); //京東金貼
      await JingDongShake(Wait(stop)); //京東搖一搖
      await JDSecKilling(Wait(stop)); //京東秒殺
      // await JingRongDoll(Wait(stop), 'JRThreeDoll', '京東金融-簽叄', '69F5EC743C');
      // await JingRongDoll(Wait(stop), 'JRFourDoll', '京東金融-簽肆', '30C4F86264');
      // await JingRongDoll(Wait(stop), 'JRFiveDoll', '京東金融-簽伍', '1D06AA3B0F');
      // await JingRongDoll(Wait(stop), 'JRDoll', '京東金融-簽壹', '4D25A6F482');
      // await JingRongDoll(Wait(stop), 'XJDouble', '金融現金-雙簽', 'F68B2C3E71', '', '', '', 'xianjin'); //京東金融 現金雙簽
      await JingRongDoll(Wait(stop), 'JTDouble', '京東金貼-雙簽', '1DF13833F7'); //京東金融 金貼雙簽
      await JDUserSignPre(Wait(stop), 'JDStory', '京東失眠-補貼', 'UcyW9Znv3xeyixW1gofhW2DAoz4'); //失眠補貼
      await JDUserSignPre(Wait(stop), 'JDPhone', '京東手機-小時', '4Vh5ybVr98nfJgros5GwvXbmTUpg'); //手機小時達
      await JDUserSignPre(Wait(stop), 'JDCard', '京東商城-卡包', '7e5fRnma6RBATV9wNrGXJwihzcD'); //京東卡包
      await JDUserSignPre(Wait(stop), 'JDUndies', '京東商城-內衣', '4PgpL1xqPSW1sVXCJ3xopDbB1f69'); //京東內衣館
      await JDUserSignPre(Wait(stop), 'JDEsports', '京東商城-電競', 'CHdHQhA5AYDXXQN9FLt3QUAPRsB'); //京東電競
      // await JDUserSignPre(Wait(stop), 'JDCustomized', '京東商城-定制', '2BJK5RBdvc3hdddZDS1Svd5Esj3R'); //京東定制
      await JDUserSignPre(Wait(stop), 'JDSuitcase', '京東商城-箱包', 'ZrH7gGAcEkY2gH8wXqyAPoQgk6t'); //京東箱包館
      await JDUserSignPre(Wait(stop), 'JDClothing', '京東商城-服飾', '4RBT3H9jmgYg1k2kBnHF8NAHm7m8'); //京東服飾
      await JDUserSignPre(Wait(stop), 'JDSchool', '京東商城-校園', '2QUxWHx5BSCNtnBDjtt5gZTq7zdZ'); //京東校園 
      await JDUserSignPre(Wait(stop), 'JDHealth', '京東商城-健康', 'w2oeK5yLdHqHvwef7SMMy4PL8LF'); //京東健康
      await JDUserSignPre(Wait(stop), 'JDShoes', '京東商城-鞋靴', '4RXyb1W4Y986LJW8ToqMK14BdTD'); //京東鞋靴
      await JDUserSignPre(Wait(stop), 'JDChild', '京東商城-童裝', '3Af6mZNcf5m795T8dtDVfDwWVNhJ'); //京東童裝館
      await JDUserSignPre(Wait(stop), 'JDBaby', '京東商城-母嬰', '3BbAVGQPDd6vTyHYjmAutXrKAos6'); //京東母嬰館
      await JDUserSignPre(Wait(stop), 'JD3C', '京東商城-數碼', '4SWjnZSCTHPYjE5T7j35rxxuMTb6'); //京東數碼電器館
      await JDUserSignPre(Wait(stop), 'JDWomen', '京東商城-女裝', 'DpSh7ma8JV7QAxSE2gJNro8Q2h9'); //京東女裝館
      await JDUserSignPre(Wait(stop), 'JDBook', '京東商城-圖書', '3SC6rw5iBg66qrXPGmZMqFDwcyXi'); //京東圖書
      await JDUserSignPre(Wait(stop), 'JDShand', '京東拍拍-二手', '3S28janPLYmtFxypu37AYAGgivfp'); //京東拍拍二手
      // await JDUserSignPre(Wait(stop), 'JDMakeup', '京東商城-美妝', '2smCxzLNuam5L14zNJHYu43ovbAP'); //京東美妝館
      await JDUserSignPre(Wait(stop), 'JDVege', '京東商城-菜場', 'Wcu2LVCFMkBP3HraRvb7pgSpt64'); //京東菜場
      await JDUserSignPre(Wait(stop), 'JDaccompany', '京東商城-陪伴', 'kPM3Xedz1PBiGQjY4ZYGmeVvrts'); //京東陪伴
      // await JDUserSignPre(Wait(stop), 'JDLive', '京東智能-生活', 'KcfFqWvhb5hHtaQkS4SD1UU6RcQ'); //京東智能生活
      await JDUserSignPre(Wait(stop), 'JDClean', '京東商城-清潔', '2Tjm6ay1ZbZ3v7UbriTj6kHy9dn6'); //京東清潔館
      await JDUserSignPre(Wait(stop), 'JDCare', '京東商城-個護', '2tZssTgnQsiUqhmg5ooLSHY9XSeN'); //京東個人護理館
      await JDUserSignPre(Wait(stop), 'JDJiaDian', '京東商城-家電', '3uvPyw1pwHARGgndatCXddLNUxHw'); // 京東小家電館
      // await JDUserSignPre(Wait(stop), 'ReceiveJD', '京東商城-領豆', 'Ni5PUSK7fzZc4EKangHhqPuprn2'); //京東-領京豆
      // await JDUserSignPre(Wait(stop), 'JDJewels', '京東商城-珠寶', 'zHUHpTHNTaztSRfNBFNVZscyFZU'); //京東珠寶館
      await JingRongDoll(Wait(stop), 'JDDouble', '金融京豆-雙簽', 'F68B2C3E71', '', '', '', 'jingdou'); //京東金融 京豆雙簽
      break;
  }
  await Promise.all([
    TotalSteel(), //總鋼鏰查詢
    TotalCash(), //總紅包查詢
    TotalBean(), //總京豆查詢
    TotalSubsidy(), //總金貼查詢
    TotalMoney() //總現金查詢
  ]);
  await notify(); //通知模塊
}

function notify() {
  return new Promise(resolve => {
    try {
      var bean = 0;
      var steel = 0;
      var cash = 0;
      var money = 0;
      var subsidy = 0;
      var success = 0;
      var fail = 0;
      var err = 0;
      var notify = '';
      for (var i in merge) {
        bean += merge[i].bean ? Number(merge[i].bean) : 0
        steel += merge[i].steel ? Number(merge[i].steel) : 0
        cash += merge[i].Cash ? Number(merge[i].Cash) : 0
        money += merge[i].Money ? Number(merge[i].Money) : 0
        subsidy += merge[i].subsidy ? Number(merge[i].subsidy) : 0
        success += merge[i].success ? Number(merge[i].success) : 0
        fail += merge[i].fail ? Number(merge[i].fail) : 0
        err += merge[i].error ? Number(merge[i].error) : 0
        notify += merge[i].notify ? "\n" + merge[i].notify : ""
      }
      var Cash = merge.TotalCash && merge.TotalCash.TCash ? `${merge.TotalCash.TCash}紅包` : ""
      var Steel = merge.TotalSteel && merge.TotalSteel.TSteel ? `${merge.TotalSteel.TSteel}鋼鏰` : ``
      var beans = merge.TotalBean && merge.TotalBean.Qbear ? `${merge.TotalBean.Qbear}京豆${Steel?`, `:``}` : ""
      var Money = merge.TotalMoney && merge.TotalMoney.TMoney ? `${merge.TotalMoney.TMoney}現金${Cash?`, `:``}` : ""
      var Subsidy = merge.TotalSubsidy && merge.TotalSubsidy.TSubsidy ? `${merge.TotalSubsidy.TSubsidy}金貼${Money||Cash?", ":""}` : ""
      var Tbean = bean ? `${bean.toFixed(0)}京豆${steel?", ":""}` : ""
      var TSteel = steel ? `${steel.toFixed(2)}鋼鏰` : ""
      var TCash = cash ? `${cash.toFixed(2)}紅包${subsidy||money?", ":""}` : ""
      var TSubsidy = subsidy ? `${subsidy.toFixed(2)}金貼${money?", ":""}` : ""
      var TMoney = money ? `${money.toFixed(2)}現金` : ""
      var Ts = success ? `成功${success}個${fail||err?`, `:``}` : ``
      var Tf = fail ? `失敗${fail}個${err?`, `:``}` : ``
      var Te = err ? `錯誤${err}個` : ``
      var one = `【簽到概覽】:  ${Ts+Tf+Te}${Ts||Tf||Te?`\n`:`獲取失敗\n`}`
      var two = Tbean || TSteel ? `【簽到獎勵】:  ${Tbean+TSteel}\n` : ``
      var three = TCash || TSubsidy || TMoney ? `【其他獎勵】:  ${TCash+TSubsidy+TMoney}\n` : ``
      var four = `【賬號總計】:  ${beans+Steel}${beans||Steel?`\n`:`獲取失敗\n`}`
      var five = `【其他總計】:  ${Subsidy+Money+Cash}${Subsidy||Money||Cash?`\n`:`獲取失敗\n`}`
      var DName = merge.TotalBean && merge.TotalBean.nickname ? merge.TotalBean.nickname : "獲取失敗"
      var cnNum = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
      const Name = DualKey || OtherKey.length > 1 ? `【簽到號${cnNum[$nobyda.num]||$nobyda.num}】:  ${DName}\n` : ``
      const disables = $nobyda.read("JD_DailyBonusDisables")
      const amount = disables ? disables.split(",").length : 0
      const disa = !notify || amount ? `【溫馨提示】:  檢測到${$nobyda.disable?`上次執行意外崩潰, `:``}已禁用${notify?`${amount}個`:`所有`}接口, 如需開啓請前往BoxJs或查看腳本內第118行注釋.\n` : ``
      $nobyda.notify("", "", Name + one + two + three + four + five + disa + notify, {
        'media-url': $nobyda.headUrl || 'https://cdn.jsdelivr.net/gh/NobyDa/mini@master/Color/jd.png'
      });
      $nobyda.headUrl = null;
      if ($nobyda.isJSBox) {
        $nobyda.st = (typeof($nobyda.st) == 'undefined' ? '' : $nobyda.st) + Name + one + two + three + four + five + "\n"
      }
    } catch (eor) {
      $nobyda.notify("通知模塊 " + eor.name + "‼️", JSON.stringify(eor), eor.message)
    } finally {
      resolve()
    }
  });
}

(async function ReadCookie() {
  const EnvInfo = $nobyda.isJSBox ? "JD_Cookie" : "CookieJD";
  const EnvInfo2 = $nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2";
  const EnvInfo3 = $nobyda.isJSBox ? "JD_Cookies" : "CookiesJD";
  const move = CookieMove($nobyda.read(EnvInfo) || Key, $nobyda.read(EnvInfo2) || DualKey, EnvInfo, EnvInfo2, EnvInfo3);
  const cookieSet = $nobyda.read(EnvInfo3);
  if (DeleteCookie) {
    const write = $nobyda.write("", EnvInfo3);
    throw new Error(`Cookie清除${write?`成功`:`失敗`}, 請手動關閉腳本內"DeleteCookie"選項`);
  } else if ($nobyda.isRequest) {
    GetCookie()
  } else if (Key || DualKey || (OtherKey || cookieSet || '[]') != '[]') {
    if (($nobyda.isJSBox || $nobyda.isNode) && stop !== '0') $nobyda.write(stop, "JD_DailyBonusDelay");
    out = parseInt($nobyda.read("JD_DailyBonusTimeOut")) || out;
    stop = Wait($nobyda.read("JD_DailyBonusDelay"), true) || Wait(stop, true);
    boxdis = $nobyda.read("JD_Crash_disable") === "false" || $nobyda.isNode || $nobyda.isJSBox ? false : boxdis;
    LogDetails = $nobyda.read("JD_DailyBonusLog") === "true" || LogDetails;
    ReDis = ReDis ? $nobyda.write("", "JD_DailyBonusDisables") : "";
    $nobyda.num = 0;
    if (Key) await all(Key);
    if (DualKey && DualKey !== Key) await all(DualKey);
    if ((OtherKey || cookieSet || '[]') != '[]') {
      try {
        OtherKey = checkFormat([...JSON.parse(OtherKey || '[]'), ...JSON.parse(cookieSet || '[]')]);
        const updateSet = OtherKey.length ? $nobyda.write(JSON.stringify(OtherKey, null, 2), EnvInfo3) : '';
        for (let i = 0; i < OtherKey.length; i++) {
          const ck = OtherKey[i].cookie;
          const jr = OtherKey[i].jrBody;
          if (ck != Key && ck != DualKey) {
            await all(ck, jr)
          }
        }
      } catch (e) {
        throw new Error(`賬號Cookie讀取失敗, 請檢查Json格式. \n${e.message}`)
      }
    }
    $nobyda.time();
  } else {
    throw new Error('腳本終止, 未獲取Cookie ‼️')
  }
})().catch(e => {
  $nobyda.notify("京東簽到", "", e.message || JSON.stringify(e))
}).finally(() => {
  if ($nobyda.isJSBox) $intents.finish($nobyda.st);
  $nobyda.done();
})

function JingDongBean(s) {
  merge.JDBean = {};
  return new Promise(resolve => {
    if (disable("JDBean")) return resolve()
    setTimeout(() => {
      const JDBUrl = {
        url: 'https://api.m.jd.com/client.action',
        headers: {
          Cookie: KEY
        },
        body: 'functionId=signBeanIndex&appid=ld'
      };
      $nobyda.post(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            if (cc.code == 3) {
              console.log("\n" + "京東商城-京豆Cookie失效 " + Details)
              merge.JDBean.notify = "京東商城-京豆: 失敗, 原因: Cookie失效‼️"
              merge.JDBean.fail = 1
            } else if (data.match(/跳轉至拼圖/)) {
              merge.JDBean.notify = "京東商城-京豆: 失敗, 需要拼圖驗證 ⚠️"
              merge.JDBean.fail = 1
            } else if (data.match(/\"status\":\"?1\"?/)) {
              console.log("\n" + "京東商城-京豆簽到成功 " + Details)
              if (data.match(/dailyAward/)) {
                merge.JDBean.notify = "京東商城-京豆: 成功, 明細: " + cc.data.dailyAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.dailyAward.beanAward.beanCount
              } else if (data.match(/continuityAward/)) {
                merge.JDBean.notify = "京東商城-京豆: 成功, 明細: " + cc.data.continuityAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.continuityAward.beanAward.beanCount
              } else if (data.match(/新人簽到/)) {
                const quantity = data.match(/beanCount\":\"(\d+)\".+今天/)
                merge.JDBean.bean = quantity ? quantity[1] : 0
                merge.JDBean.notify = "京東商城-京豆: 成功, 明細: " + (quantity ? quantity[1] : "無") + "京豆 🐶"
              } else {
                merge.JDBean.notify = "京東商城-京豆: 成功, 明細: 無京豆 🐶"
              }
              merge.JDBean.success = 1
            } else {
              merge.JDBean.fail = 1
              console.log("\n" + "京東商城-京豆簽到失敗 " + Details)
              if (data.match(/(已簽到|新人簽到)/)) {
                merge.JDBean.notify = "京東商城-京豆: 失敗, 原因: 已簽過 ⚠️"
              } else if (data.match(/人數較多|S101/)) {
                merge.JDBean.notify = "京東商城-京豆: 失敗, 簽到人數較多 ⚠️"
              } else {
                merge.JDBean.notify = "京東商城-京豆: 失敗, 原因: 未知 ⚠️"
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

// function JingDongTurn(s) {
//   merge.JDTurn = {}, merge.JDTurn.notify = "", merge.JDTurn.success = 0, merge.JDTurn.bean = 0;
//   return new Promise((resolve, reject) => {
//     if (disable("JDTurn")) return reject()
//     const JDTUrl = {
//       url: 'https://api.m.jd.com/client.action?functionId=wheelSurfIndex&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%7D&appid=ld',
//       headers: {
//         Cookie: KEY,
//       }
//     };
//     $nobyda.get(JDTUrl, async function(error, response, data) {
//       try {
//         if (error) {
//           throw new Error(error)
//         } else {
//           const cc = JSON.parse(data)
//           const Details = LogDetails ? "response:\n" + data : '';
//           if (cc.data && cc.data.lotteryCode) {
//             console.log("\n" + "京東商城-轉盤查詢成功 " + Details)
//             return resolve(cc.data.lotteryCode)
//           } else {
//             merge.JDTurn.notify = "京東商城-轉盤: 失敗, 原因: 查詢錯誤 ⚠️"
//             merge.JDTurn.fail = 1
//             console.log("\n" + "京東商城-轉盤查詢失敗 " + Details)
//           }
//         }
//       } catch (eor) {
//         $nobyda.AnError("京東轉盤-查詢", "JDTurn", eor, response, data)
//       } finally {
//         reject()
//       }
//     })
//     if (out) setTimeout(reject, out + s)
//   }).then(data => {
//     return JingDongTurnSign(s, data);
//   }, () => {});
// }

function JingDongTurn(s) {
  if (!merge.JDTurn) merge.JDTurn = {}, merge.JDTurn.notify = "", merge.JDTurn.success = 0, merge.JDTurn.bean = 0;
  return new Promise(resolve => {
    if (disable("JDTurn")) return resolve();
    setTimeout(() => {
      const JDTUrl = {
        url: `https://api.m.jd.com/client.action?functionId=babelGetLottery`,
        headers: {
          Cookie: KEY
        },
        body: 'body=%7B%22enAwardK%22%3A%2295d235f2a09578c6613a1a029b26d12d%22%2C%22riskParam%22%3A%7B%7D%7D&client=wh5'
      };
      $nobyda.post(JDTUrl, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            const also = merge.JDTurn.notify ? true : false
            if (cc.code == 3) {
              console.log("\n" + "京東轉盤Cookie失效 " + Details)
              merge.JDTurn.notify = "京東商城-轉盤: 失敗, 原因: Cookie失效‼️"
              merge.JDTurn.fail = 1
            } else if (data.match(/(\"T216\"|活動結束)/)) {
              merge.JDTurn.notify = "京東商城-轉盤: 失敗, 原因: 活動結束 ⚠️"
              merge.JDTurn.fail = 1
            } else if (data.match(/\d+京豆/)) {
              console.log("\n" + "京東商城-轉盤簽到成功 " + Details)
              merge.JDTurn.bean += (cc.prizeName && cc.prizeName.split(/(\d+)/)[1]) || 0
              merge.JDTurn.notify += `${also?`\n`:``}京東商城-轉盤: ${also?`多次`:`成功`}, 明細: ${merge.JDTurn.bean||`無`}京豆 🐶`
              merge.JDTurn.success += 1
              if (cc.chances > 0) {
                await JingDongTurnSign(2000)
              }
            } else if (data.match(/未中獎|擦肩而過/)) {
              merge.JDTurn.notify += `${also?`\n`:``}京東商城-轉盤: ${also?`多次`:`成功`}, 狀態: 未中獎 🐶`
              merge.JDTurn.success += 1
              if (cc.chances > 0) {
                await JingDongTurnSign(2000)
              }
            } else {
              console.log("\n" + "京東商城-轉盤簽到失敗 " + Details)
              merge.JDTurn.fail = 1
              if (data.match(/(機會已用完|次數為0)/)) {
                merge.JDTurn.notify = "京東商城-轉盤: 失敗, 原因: 已轉過 ⚠️"
              } else if (data.match(/(T210|密碼)/)) {
                merge.JDTurn.notify = "京東商城-轉盤: 失敗, 原因: 無支付密碼 ⚠️"
              } else {
                merge.JDTurn.notify += `${also?`\n`:``}京東商城-轉盤: 失敗, 原因: 未知 ⚠️${also?` (多次)`:``}`
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-轉盤", "JDTurn", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingRongSteel(s, body) {
  merge.JRSteel = {};
  return new Promise(resolve => {
    if (disable("JRSteel")) return resolve();
    if (!body) {
      merge.JRSteel.fail = 1;
      merge.JRSteel.notify = "京東金融-鋼鏰: 失敗, 未獲取簽到Body ⚠️";
      return resolve();
    }
    setTimeout(() => {
      const JRSUrl = {
        url: 'https://ms.jr.jd.com/gw/generic/hy/h5/m/appSign',
        headers: {
          Cookie: KEY
        },
        body: body || ''
      };
      $nobyda.post(JRSUrl, function(error, response, data) {
        try {
          if (error) throw new Error(error)
          const cc = JSON.parse(data)
          const Details = LogDetails ? "response:\n" + data : '';
          if (cc.resultCode == 0 && cc.resultData && cc.resultData.resBusiCode == 0) {
            console.log("\n" + "京東金融-鋼鏰簽到成功 " + Details)
            merge.JRSteel.notify = `京東金融-鋼鏰: 成功, 獲得鋼鏰獎勵 💰`
            merge.JRSteel.success = 1
          } else {
            console.log("\n" + "京東金融-鋼鏰簽到失敗 " + Details)
            merge.JRSteel.fail = 1
            if (cc.resultCode == 0 && cc.resultData && cc.resultData.resBusiCode == 15) {
              merge.JRSteel.notify = "京東金融-鋼鏰: 失敗, 原因: 已簽過 ⚠️"
            } else if (data.match(/未實名/)) {
              merge.JRSteel.notify = "京東金融-鋼鏰: 失敗, 賬號未實名 ⚠️"
            } else if (cc.resultCode == 3) {
              merge.JRSteel.notify = "京東金融-鋼鏰: 失敗, 原因: Cookie失效‼️"
            } else {
              const ng = (cc.resultData && cc.resultData.resBusiMsg) || cc.resultMsg
              merge.JRSteel.notify = `京東金融-鋼鏰: 失敗, ${`原因: ${ng||`未知`}`} ⚠️`
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東金融-鋼鏰", "JRSteel", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongShake(s) {
  if (!merge.JDShake) merge.JDShake = {}, merge.JDShake.success = 0, merge.JDShake.bean = 0, merge.JDShake.notify = '';
  return new Promise(resolve => {
    if (disable("JDShake")) return resolve()
    setTimeout(() => {
      const JDSh = {
        url: 'https://api.m.jd.com/client.action?appid=vip_h5&functionId=vvipclub_shaking',
        headers: {
          Cookie: KEY,
        }
      };
      $nobyda.get(JDSh, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            const also = merge.JDShake.notify ? true : false
            if (data.match(/prize/)) {
              console.log("\n" + "京東商城-搖一搖簽到成功 " + Details)
              merge.JDShake.success += 1
              if (cc.data.prizeBean) {
                merge.JDShake.bean += cc.data.prizeBean.count || 0
                merge.JDShake.notify += `${also?`\n`:``}京東商城-搖搖: ${also?`多次`:`成功`}, 明細: ${merge.JDShake.bean || `無`}京豆 🐶`
              } else if (cc.data.prizeCoupon) {
                merge.JDShake.notify += `${also?`\n`:``}京東商城-搖搖: ${also?`多次, `:``}獲得滿${cc.data.prizeCoupon.quota}減${cc.data.prizeCoupon.discount}優惠券→ ${cc.data.prizeCoupon.limitStr}`
              } else {
                merge.JDShake.notify += `${also?`\n`:``}京東商城-搖搖: 成功, 明細: 未知 ⚠️${also?` (多次)`:``}`
              }
              if (cc.data.luckyBox.freeTimes != 0) {
                await JingDongShake(s)
              }
            } else {
              console.log("\n" + "京東商城-搖一搖簽到失敗 " + Details)
              if (data.match(/true/)) {
                merge.JDShake.notify += `${also?`\n`:``}京東商城-搖搖: 成功, 明細: 無獎勵 🐶${also?` (多次)`:``}`
                merge.JDShake.success += 1
                if (cc.data.luckyBox.freeTimes != 0) {
                  await JingDongShake(s)
                }
              } else {
                merge.JDShake.fail = 1
                if (data.match(/(無免費|8000005|9000005)/)) {
                  merge.JDShake.notify = "京東商城-搖搖: 失敗, 原因: 已搖過 ⚠️"
                } else if (data.match(/(未登錄|101)/)) {
                  merge.JDShake.notify = "京東商城-搖搖: 失敗, 原因: Cookie失效‼️"
                } else {
                  merge.JDShake.notify += `${also?`\n`:``}京東商城-搖搖: 失敗, 原因: 未知 ⚠️${also?` (多次)`:``}`
                }
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-搖搖", "JDShake", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JDUserSignPre(s, key, title, ac) {
  merge[key] = {};
  if ($nobyda.isJSBox) {
    return JDUserSignPre2(s, key, title, ac);
  } else {
    return JDUserSignPre1(s, key, title, ac);
  }
}

function JDUserSignPre1(s, key, title, acData, ask) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject()
    const JDUrl = {
      url: 'https://api.m.jd.com/?client=wh5&functionId=qryH5BabelFloors',
      headers: {
        Cookie: KEY
      },
      opts: {
        'filter': 'try{var od=JSON.parse(body);var params=(od.floatLayerList||[]).filter(o=>o.params&&o.params.match(/enActK/)).map(o=>o.params).pop()||(od.floorList||[]).filter(o=>o.template=="signIn"&&o.signInfos&&o.signInfos.params&&o.signInfos.params.match(/enActK/)).map(o=>o.signInfos&&o.signInfos.params).pop();var tId=(od.floorList||[]).filter(o=>o.boardParams&&o.boardParams.turnTableId).map(o=>o.boardParams.turnTableId).pop();var page=od.paginationFlrs;return JSON.stringify({qxAct:params||null,qxTid:tId||null,qxPage:page||null})}catch(e){return `=> 過濾器發生錯誤: ${e.message}`}'
      },
      body: `body=${encodeURIComponent(`{"activityId":"${acData}"${ask?`,"paginationParam":"2","paginationFlrs":"${ask}"`:``}}`)}`
    };
    $nobyda.post(JDUrl, async function(error, response, data) {
      try {
        if (error) {
          throw new Error(error)
        } else {
          const od = JSON.parse(data || '{}');
          const turnTableId = od.qxTid || (od.floorList || []).filter(o => o.boardParams && o.boardParams.turnTableId).map(o => o.boardParams.turnTableId).pop();
          const page = od.qxPage || od.paginationFlrs;
          if (data.match(/enActK/)) { // 含有簽到活動數據
            let params = od.qxAct || (od.floatLayerList || []).filter(o => o.params && o.params.match(/enActK/)).map(o => o.params).pop()
            if (!params) { // 第一處找到簽到所需數據
              // floatLayerList未找到簽到所需數據，從floorList中查找
              let signInfo = (od.floorList || []).filter(o => o.template == 'signIn' && o.signInfos && o.signInfos.params && o.signInfos.params.match(/enActK/))
                .map(o => o.signInfos).pop();
              if (signInfo) {
                if (signInfo.signStat == '1') {
                  console.log(`\n${title}重復簽到`)
                  merge[key].notify = `${title}: 失敗, 原因: 已簽過 ⚠️`
                  merge[key].fail = 1
                } else {
                  params = signInfo.params;
                }
              } else {
                merge[key].notify = `${title}: 失敗, 活動查找異常 ⚠️`
                merge[key].fail = 1
              }
            }
            if (params) {
              return resolve({
                params: params
              }); // 執行簽到處理
            }
          } else if (turnTableId) { // 無簽到數據, 但含有關注店鋪簽到
            const boxds = $nobyda.read("JD_Follow_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}關注店鋪`)
              return resolve(parseInt(turnTableId))
            } else {
              merge[key].notify = `${title}: 失敗, 需要關注店鋪 ⚠️`
              merge[key].fail = 1
            }
          } else if (page && !ask) { // 無簽到數據, 嘗試帶參查詢
            const boxds = $nobyda.read("JD_Retry_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}二次查詢`)
              return resolve(page)
            } else {
              merge[key].notify = `${title}: 失敗, 請嘗試開啓增強 ⚠️`
              merge[key].fail = 1
            }
          } else {
            merge[key].notify = `${title}: 失敗, ${!data ? `需要手動執行` : `不含活動數據`} ⚠️`
            merge[key].fail = 1
          }
        }
        reject()
      } catch (eor) {
        $nobyda.AnError(title, key, eor, response, data)
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    disable(key, title, 2)
    if (typeof(data) == "object") return JDUserSign1(s, key, title, encodeURIComponent(JSON.stringify(data)));
    if (typeof(data) == "number") return JDUserSign2(s, key, title, data);
    if (typeof(data) == "string") return JDUserSignPre1(s, key, title, acData, data);
  }, () => disable(key, title, 2))
}

function JDUserSignPre2(s, key, title, acData) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject()
    const JDUrl = {
      url: `https://pro.m.jd.com/mall/active/${acData}/index.html`,
      headers: {
        Cookie: KEY,
      }
    };
    $nobyda.get(JDUrl, async function(error, response, data) {
      try {
        if (error) {
          throw new Error(error)
        } else {
          const act = data.match(/\"params\":\"\{\\\"enActK.+?\\\"\}\"/)
          const turnTable = data.match(/\"turnTableId\":\"(\d+)\"/)
          const page = data.match(/\"paginationFlrs\":\"(\[\[.+?\]\])\"/)
          if (act) { // 含有簽到活動數據
            return resolve(act)
          } else if (turnTable) { // 無簽到數據, 但含有關注店鋪簽到
            const boxds = $nobyda.read("JD_Follow_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}關注店鋪`)
              return resolve(parseInt(turnTable[1]))
            } else {
              merge[key].notify = `${title}: 失敗, 需要關注店鋪 ⚠️`
              merge[key].fail = 1
            }
          } else if (page) { // 無簽到數據, 嘗試帶參查詢
            const boxds = $nobyda.read("JD_Retry_disable") === "false" ? false : true
            if (boxds) {
              console.log(`\n${title}二次查詢`)
              return resolve(page[1])
            } else {
              merge[key].notify = `${title}: 失敗, 請嘗試開啓增強 ⚠️`
              merge[key].fail = 1
            }
          } else {
            merge[key].notify = `${title}: 失敗, ${!data ? `需要手動執行` : `不含活動數據`} ⚠️`
            merge[key].fail = 1
          }
        }
        reject()
      } catch (eor) {
        $nobyda.AnError(title, key, eor, response, data)
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    disable(key, title, 2)
    if (typeof(data) == "object") return JDUserSign1(s, key, title, encodeURIComponent(`{${data}}`));
    if (typeof(data) == "number") return JDUserSign2(s, key, title, data)
    if (typeof(data) == "string") return JDUserSignPre1(s, key, title, acData, data)
  }, () => disable(key, title, 2))
}

function JDUserSign1(s, key, title, body) {
  return new Promise(resolve => {
    setTimeout(() => {
      const JDUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=userSign',
        headers: {
          Cookie: KEY
        },
        body: `body=${body}&client=wh5`
      };
      $nobyda.post(JDUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? `response:\n${data}` : '';
            if (data.match(/簽到成功/)) {
              console.log(`\n${title}簽到成功(1)${Details}`)
              if (data.match(/\"text\":\"\d+京豆\"/)) {
                merge[key].bean = data.match(/\"text\":\"(\d+)京豆\"/)[1]
              }
              merge[key].notify = `${title}: 成功, 明細: ${merge[key].bean || '無'}京豆 🐶`
              merge[key].success = 1
            } else {
              console.log(`\n${title}簽到失敗(1)${Details}`)
              if (data.match(/(已簽到|已領取)/)) {
                merge[key].notify = `${title}: 失敗, 原因: 已簽過 ⚠️`
              } else if (data.match(/(不存在|已結束|未開始)/)) {
                merge[key].notify = `${title}: 失敗, 原因: 活動已結束 ⚠️`
              } else if (data.match(/\"code\":\"?3\"?/)) {
                merge[key].notify = `${title}: 失敗, 原因: Cookie失效‼️`
              } else {
                const ng = data.match(/\"(errorMessage|subCodeMsg)\":\"(.+?)\"/)
                merge[key].notify = `${title}: 失敗, ${ng?ng[2]:`原因: 未知`} ⚠️`
              }
              merge[key].fail = 1
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

async function JDUserSign2(s, key, title, tid) {
  return console.log(`\n${title} >> 可能需要拼圖驗證, 跳過簽到 ⚠️`);
  await new Promise(resolve => {
    $nobyda.get({
      url: `https://jdjoy.jd.com/api/turncard/channel/detail?turnTableId=${tid}&invokeKey=ztmFUCxcPMNyUq0P`,
      headers: {
        Cookie: KEY
      }
    }, function(error, response, data) {
      resolve()
    })
    if (out) setTimeout(resolve, out + s)
  });
  return new Promise(resolve => {
    setTimeout(() => {
      const JDUrl = {
        url: 'https://jdjoy.jd.com/api/turncard/channel/sign?invokeKey=ztmFUCxcPMNyUq0P',
        headers: {
          lkt: '1629984131120',
          lks: 'd7db92cf40ad5a8d54b9da2b561c5f84',
          Cookie: KEY
        },
        body: `turnTableId=${tid}`
      };
      $nobyda.post(JDUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? `response:\n${data}` : '';
            if (data.match(/\"success\":true/)) {
              console.log(`\n${title}簽到成功(2)${Details}`)
              if (data.match(/\"jdBeanQuantity\":\d+/)) {
                merge[key].bean = data.match(/\"jdBeanQuantity\":(\d+)/)[1]
              }
              merge[key].notify = `${title}: 成功, 明細: ${merge[key].bean || '無'}京豆 🐶`
              merge[key].success = 1
            } else {
              const captcha = /請進行驗證/.test(data);
              if (data.match(/(已經簽到|已經領取)/)) {
                merge[key].notify = `${title}: 失敗, 原因: 已簽過 ⚠️`
              } else if (data.match(/(不存在|已結束|未開始)/)) {
                merge[key].notify = `${title}: 失敗, 原因: 活動已結束 ⚠️`
              } else if (data.match(/(沒有登錄|B0001)/)) {
                merge[key].notify = `${title}: 失敗, 原因: Cookie失效‼️`
              } else if (!captcha) {
                const ng = data.match(/\"(errorMessage|subCodeMsg)\":\"(.+?)\"/)
                merge[key].notify = `${title}: 失敗, ${ng?ng[2]:`原因: 未知`} ⚠️`
              }
              if (!captcha) merge[key].fail = 1;
              console.log(`\n${title}簽到失敗(2)${captcha?`\n需要拼圖驗證, 跳過通知記錄 ⚠️`:``}${Details}`)
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor, response, data)
        } finally {
          resolve()
        }
      })
    }, 200 + s)
    if (out) setTimeout(resolve, out + s + 200)
  });
}

function JDFlashSale(s) {
  merge.JDFSale = {};
  return new Promise(resolve => {
    if (disable("JDFSale")) return resolve()
    setTimeout(() => {
      const JDPETUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=partitionJdSgin',
        headers: {
          Cookie: KEY
        },
        body: "body=%7B%22version%22%3A%22v2%22%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=6768e2cf625427615dd89649dd367d41&st=1597248593305&sv=121"
      };
      $nobyda.post(JDPETUrl, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            if (cc.result && cc.result.code == 0) {
              console.log("\n" + "京東商城-閃購簽到成功 " + Details)
              merge.JDFSale.bean = cc.result.jdBeanNum || 0
              merge.JDFSale.notify = "京東商城-閃購: 成功, 明細: " + (merge.JDFSale.bean || "無") + "京豆 🐶"
              merge.JDFSale.success = 1
            } else {
              console.log("\n" + "京東商城-閃購簽到失敗 " + Details)
              if (data.match(/(已簽到|已領取|\"2005\")/)) {
                merge.JDFSale.notify = "京東商城-閃購: 失敗, 原因: 已簽過 ⚠️"
              } else if (data.match(/不存在|已結束|\"2008\"|\"3001\"/)) {
                await FlashSaleDivide(s); //瓜分京豆
                return
              } else if (data.match(/(\"code\":\"3\"|\"1003\")/)) {
                merge.JDFSale.notify = "京東商城-閃購: 失敗, 原因: Cookie失效‼️"
              } else {
                const msg = data.match(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/)
                merge.JDFSale.notify = `京東商城-閃購: 失敗, ${msg ? msg[1] : `原因: 未知`} ⚠️`
              }
              merge.JDFSale.fail = 1
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-閃購", "JDFSale", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function FlashSaleDivide(s) {
  return new Promise(resolve => {
    setTimeout(() => {
      const Url = {
        url: 'https://api.m.jd.com/client.action?functionId=partitionJdShare',
        headers: {
          Cookie: KEY
        },
        body: "body=%7B%22version%22%3A%22v2%22%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=49baa3b3899b02bbf06cdf41fe191986&st=1597682588351&sv=111"
      };
      $nobyda.post(Url, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            if (cc.result.code == 0) {
              merge.JDFSale.success = 1
              merge.JDFSale.bean = cc.result.jdBeanNum || 0
              merge.JDFSale.notify = "京東閃購-瓜分: 成功, 明細: " + (merge.JDFSale.bean || "無") + "京豆 🐶"
              console.log("\n" + "京東閃購-瓜分簽到成功 " + Details)
            } else {
              merge.JDFSale.fail = 1
              console.log("\n" + "京東閃購-瓜分簽到失敗 " + Details)
              if (data.match(/已參與|已領取|\"2006\"/)) {
                merge.JDFSale.notify = "京東閃購-瓜分: 失敗, 原因: 已瓜分 ⚠️"
              } else if (data.match(/不存在|已結束|未開始|\"2008\"|\"2012\"/)) {
                merge.JDFSale.notify = "京東閃購-瓜分: 失敗, 原因: 活動已結束 ⚠️"
              } else if (data.match(/\"code\":\"1003\"|未獲取/)) {
                merge.JDFSale.notify = "京東閃購-瓜分: 失敗, 原因: Cookie失效‼️"
              } else {
                const msg = data.match(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/)
                merge.JDFSale.notify = `京東閃購-瓜分: 失敗, ${msg ? msg[1] : `原因: 未知`} ⚠️`
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東閃購-瓜分", "JDFSale", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongCash(s) {
  merge.JDCash = {};
  return new Promise(resolve => {
    if (disable("JDCash")) return resolve()
    setTimeout(() => {
      const JDCAUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=ccSignInNew',
        headers: {
          Cookie: KEY
        },
        body: "body=%7B%22pageClickKey%22%3A%22CouponCenter%22%2C%22eid%22%3A%22O5X6JYMZTXIEX4VBCBWEM5PTIZV6HXH7M3AI75EABM5GBZYVQKRGQJ5A2PPO5PSELSRMI72SYF4KTCB4NIU6AZQ3O6C3J7ZVEP3RVDFEBKVN2RER2GTQ%22%2C%22shshshfpb%22%3A%22v1%5C%2FzMYRjEWKgYe%2BUiNwEvaVlrHBQGVwqLx4CsS9PH1s0s0Vs9AWk%2B7vr9KSHh3BQd5NTukznDTZnd75xHzonHnw%3D%3D%22%2C%22childActivityUrl%22%3A%22openapp.jdmobile%253a%252f%252fvirtual%253fparams%253d%257b%255c%2522category%255c%2522%253a%255c%2522jump%255c%2522%252c%255c%2522des%255c%2522%253a%255c%2522couponCenter%255c%2522%257d%22%2C%22monitorSource%22%3A%22cc_sign_ios_index_config%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&d_model=iPhone8%2C2&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&scope=11&screen=1242%2A2208&sign=1cce8f76d53fc6093b45a466e93044da&st=1581084035269&sv=102"
      };
      $nobyda.post(JDCAUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            if (cc.busiCode == "0") {
              console.log("\n" + "京東現金-紅包簽到成功 " + Details)
              merge.JDCash.success = 1
              merge.JDCash.Cash = cc.result.signResult.signData.amount || 0
              merge.JDCash.notify = `京東現金-紅包: 成功, 明細: ${merge.JDCash.Cash || `無`}紅包 🧧`
            } else {
              console.log("\n" + "京東現金-紅包簽到失敗 " + Details)
              merge.JDCash.fail = 1
              if (data.match(/(\"busiCode\":\"1002\"|完成簽到)/)) {
                merge.JDCash.notify = "京東現金-紅包: 失敗, 原因: 已簽過 ⚠️"
              } else if (data.match(/(不存在|已結束)/)) {
                merge.JDCash.notify = "京東現金-紅包: 失敗, 原因: 活動已結束 ⚠️"
              } else if (data.match(/(\"busiCode\":\"3\"|未登錄)/)) {
                merge.JDCash.notify = "京東現金-紅包: 失敗, 原因: Cookie失效‼️"
              } else {
                const msg = data.split(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/)[1];
                merge.JDCash.notify = `京東現金-紅包: 失敗, ${msg||`原因: 未知`} ⚠️`
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東現金-紅包", "JDCash", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JDMagicCube(s, sign) {
  merge.JDCube = {};
  return new Promise((resolve, reject) => {
    if (disable("JDCube")) return reject()
    const JDUrl = {
      url: `https://api.m.jd.com/client.action?functionId=getNewsInteractionInfo&appid=smfe${sign?`&body=${encodeURIComponent(`{"sign":${sign}}`)}`:``}`,
      headers: {
        Cookie: KEY,
      }
    };
    $nobyda.get(JDUrl, async (error, response, data) => {
      try {
        if (error) throw new Error(error)
        const Details = LogDetails ? "response:\n" + data : '';
        console.log(`\n京東魔方-嘗試查詢活動(${sign}) ${Details}`)
        if (data.match(/\"interactionId\":\d+/)) {
          resolve({
            id: data.match(/\"interactionId\":(\d+)/)[1],
            sign: sign || null
          })
        } else if (data.match(/配置異常/) && sign) {
          await JDMagicCube(s, sign == 2 ? 1 : null)
          reject()
        } else {
          resolve(null)
        }
      } catch (eor) {
        $nobyda.AnError("京東魔方-查詢", "JDCube", eor, response, data)
        reject()
      }
    })
    if (out) setTimeout(reject, out + s)
  }).then(data => {
    return JDMagicCubeSign(s, data)
  }, () => {});
}

function JDMagicCubeSign(s, id) {
  return new Promise(resolve => {
    setTimeout(() => {
      const JDMCUrl = {
        url: `https://api.m.jd.com/client.action?functionId=getNewsInteractionLotteryInfo&appid=smfe${id?`&body=${encodeURIComponent(`{${id.sign?`"sign":${id.sign},`:``}"interactionId":${id.id}}`)}`:``}`,
        headers: {
          Cookie: KEY,
        }
      };
      $nobyda.get(JDMCUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            if (data.match(/(\"name\":)/)) {
              console.log("\n" + "京東商城-魔方簽到成功 " + Details)
              merge.JDCube.success = 1
              if (data.match(/(\"name\":\"京豆\")/)) {
                merge.JDCube.bean = cc.result.lotteryInfo.quantity || 0
                merge.JDCube.notify = `京東商城-魔方: 成功, 明細: ${merge.JDCube.bean || `無`}京豆 🐶`
              } else {
                merge.JDCube.notify = `京東商城-魔方: 成功, 明細: ${cc.result.lotteryInfo.name || `未知`} 🎉`
              }
            } else {
              console.log("\n" + "京東商城-魔方簽到失敗 " + Details)
              merge.JDCube.fail = 1
              if (data.match(/(一閃而過|已簽到|已領取)/)) {
                merge.JDCube.notify = "京東商城-魔方: 失敗, 原因: 無機會 ⚠️"
              } else if (data.match(/(不存在|已結束)/)) {
                merge.JDCube.notify = "京東商城-魔方: 失敗, 原因: 活動已結束 ⚠️"
              } else if (data.match(/(\"code\":3)/)) {
                merge.JDCube.notify = "京東商城-魔方: 失敗, 原因: Cookie失效‼️"
              } else {
                merge.JDCube.notify = "京東商城-魔方: 失敗, 原因: 未知 ⚠️"
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-魔方", "JDCube", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongSubsidy(s) {
  merge.subsidy = {};
  return new Promise(resolve => {
    if (disable("subsidy")) return resolve()
    setTimeout(() => {
      const subsidyUrl = {
        url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/signIn7',
        headers: {
          Referer: "https://active.jd.com/forever/cashback/index",
          Cookie: KEY
        }
      };
      $nobyda.get(subsidyUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const Details = LogDetails ? "response:\n" + data : '';
            const cc = JSON.parse(data)
            if (cc.resultCode == 0 && cc.resultData.data && cc.resultData.data.thisAmount) {
              console.log("\n" + "京東商城-金貼簽到成功 " + Details)
              merge.subsidy.subsidy = cc.resultData.data.thisAmountStr
              merge.subsidy.notify = `京東商城-金貼: 成功, 明細: ${merge.subsidy.subsidy||`無`}金貼 💰`
              merge.subsidy.success = 1
            } else {
              console.log("\n" + "京東商城-金貼簽到失敗 " + Details)
              merge.subsidy.fail = 1
              if (data.match(/已存在|"thisAmount":0/)) {
                merge.subsidy.notify = "京東商城-金貼: 失敗, 原因: 無金貼 ⚠️"
              } else if (data.match(/請先登錄/)) {
                merge.subsidy.notify = "京東商城-金貼: 失敗, 原因: Cookie失效‼️"
              } else {
                const msg = data.split(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/)[1];
                merge.subsidy.notify = `京東商城-金貼: 失敗, ${msg||`原因: 未知`} ⚠️`
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-金貼", "subsidy", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingRongDoll(s, key, title, code, type, num, award, belong) {
  merge[key] = {};
  return new Promise(resolve => {
    if (disable(key)) return resolve()
    setTimeout(() => {
      const DollUrl = {
        url: "https://nu.jr.jd.com/gw/generic/jrm/h5/m/process",
        headers: {
          Cookie: KEY
        },
        body: `reqData=${encodeURIComponent(`{"actCode":"${code}","type":${type?type:`3`}${code=='F68B2C3E71'?`,"frontParam":{"belong":"${belong}"}`:code==`1DF13833F7`?`,"frontParam":{"channel":"JR","belong":4}`:``}}`)}`
      };
      $nobyda.post(DollUrl, async function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            var cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            if (cc.resultCode == 0) {
              if (cc.resultData.data.businessData != null) {
                console.log(`\n${title}查詢成功 ${Details}`)
                if (cc.resultData.data.businessData.pickStatus == 2) {
                  if (data.match(/\"rewardPrice\":\"\d.*?\"/)) {
                    const JRDoll_bean = data.match(/\"rewardPrice\":\"(\d.*?)\"/)[1]
                    const JRDoll_type = data.match(/\"rewardName\":\"金貼獎勵\"/) ? true : false
                    await JingRongDoll(s, key, title, code, '4', JRDoll_bean, JRDoll_type)
                  } else {
                    merge[key].success = 1
                    merge[key].notify = `${title}: 成功, 明細: 無獎勵 🐶`
                  }
                } else if (code == 'F68B2C3E71' || code == '1DF13833F7') {
                  if (!data.match(/"businessCode":"30\dss?q"/)) {
                    merge[key].success = 1
                    const ct = data.match(/\"count\":\"?(\d.*?)\"?,/)
                    if (code == 'F68B2C3E71' && belong == 'xianjin') {
                      merge[key].Money = ct ? ct[1] > 9 ? `0.${ct[1]}` : `0.0${ct[1]}` : 0
                      merge[key].notify = `${title}: 成功, 明細: ${merge[key].Money||`無`}現金 💰`
                    } else if (code == 'F68B2C3E71' && belong == 'jingdou') {
                      merge[key].bean = ct ? ct[1] : 0;
                      merge[key].notify = `${title}: 成功, 明細: ${merge[key].bean||`無`}京豆 🐶`
                    } else if (code == '1DF13833F7') {
                      merge[key].subsidy = ct ? ct[1] : 0;
                      merge[key].notify = `${title}: 成功, 明細: ${merge[key].subsidy||`無`}金貼 💰`
                    }
                  } else {
                    const es = cc.resultData.data.businessMsg
                    const ep = cc.resultData.data.businessData.businessMsg
                    const tp = data.match(/已領取|300ss?q/) ? `已簽過` : `${ep||es||cc.resultMsg||`未知`}`
                    merge[key].notify = `${title}: 失敗, 原因: ${tp} ⚠️`
                    merge[key].fail = 1
                  }
                } else {
                  merge[key].notify = `${title}: 失敗, 原因: 已簽過 ⚠️`;
                  merge[key].fail = 1
                }
              } else if (cc.resultData.data.businessCode == 200) {
                console.log(`\n${title}簽到成功 ${Details}`)
                if (!award) {
                  merge[key].bean = num ? num.match(/\d+/)[0] : 0
                } else {
                  merge[key].subsidy = num || 0
                }
                merge[key].success = 1
                merge[key].notify = `${title}: 成功, 明細: ${(award?num:merge[key].bean)||`無`}${award?`金貼 💰`:`京豆 🐶`}`
              } else {
                console.log(`\n${title}領取異常 ${Details}`)
                if (num) console.log(`\n${title} 請嘗試手動領取, 預計可得${num}${award?`金貼`:`京豆`}: \nhttps://uf1.jr.jd.com/up/redEnvelopes/index.html?actCode=${code}\n`);
                merge[key].fail = 1;
                merge[key].notify = `${title}: 失敗, 原因: 領取異常 ⚠️`;
              }
            } else {
              console.log(`\n${title}簽到失敗 ${Details}`)
              const redata = typeof(cc.resultData) == 'string' ? cc.resultData : ''
              merge[key].notify = `${title}: 失敗, ${cc.resultCode==3?`原因: Cookie失效‼️`:`${redata||'原因: 未知 ⚠️'}`}`
              merge[key].fail = 1;
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongGetCash(s) {
  merge.JDGetCash = {};
  return new Promise(resolve => {
    if (disable("JDGetCash")) return resolve()
    setTimeout(() => {
      const GetCashUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=cash_sign&body=%7B%22remind%22%3A0%2C%22inviteCode%22%3A%22%22%2C%22type%22%3A0%2C%22breakReward%22%3A0%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=7e2f8bcec13978a691567257af4fdce9&st=1596954745073&sv=111',
        headers: {
          Cookie: KEY,
        }
      };
      $nobyda.get(GetCashUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : '';
            if (cc.data.success && cc.data.result) {
              console.log("\n" + "京東商城-現金簽到成功 " + Details)
              merge.JDGetCash.success = 1
              merge.JDGetCash.Money = cc.data.result.signCash || 0
              merge.JDGetCash.notify = `京東商城-現金: 成功, 明細: ${cc.data.result.signCash||`無`}現金 💰`
            } else {
              console.log("\n" + "京東商城-現金簽到失敗 " + Details)
              merge.JDGetCash.fail = 1
              if (data.match(/\"bizCode\":201|已經簽過/)) {
                merge.JDGetCash.notify = "京東商城-現金: 失敗, 原因: 已簽過 ⚠️"
              } else if (data.match(/\"code\":300|退出登錄/)) {
                merge.JDGetCash.notify = "京東商城-現金: 失敗, 原因: Cookie失效‼️"
              } else {
                merge.JDGetCash.notify = "京東商城-現金: 失敗, 原因: 未知 ⚠️"
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-現金", "JDGetCash", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JingDongStore(s) {
  merge.JDGStore = {};
  return new Promise(resolve => {
    if (disable("JDGStore")) return resolve()
    setTimeout(() => {
      $nobyda.get({
        url: 'https://api.m.jd.com/api?appid=jdsupermarket&functionId=smtg_sign&clientVersion=8.0.0&client=m&body=%7B%7D',
        headers: {
          Cookie: KEY,
          Origin: `https://jdsupermarket.jd.com`
        }
      }, (error, response, data) => {
        try {
          if (error) throw new Error(error);
          const cc = JSON.parse(data);
          const Details = LogDetails ? "response:\n" + data : '';
          if (cc.data && cc.data.success === true && cc.data.bizCode === 0) {
            console.log(`\n京東商城-超市簽到成功 ${Details}`)
            merge.JDGStore.success = 1
            merge.JDGStore.bean = cc.data.result.jdBeanCount || 0
            merge.JDGStore.notify = `京東商城-超市: 成功, 明細: ${merge.JDGStore.bean||`無`}京豆 🐶`
          } else {
            if (!cc.data) cc.data = {}
            console.log(`\n京東商城-超市簽到失敗 ${Details}`)
            const tp = cc.data.bizCode == 811 ? `已簽過` : cc.data.bizCode == 300 ? `Cookie失效` : `${cc.data.bizMsg||`未知`}`
            merge.JDGStore.notify = `京東商城-超市: 失敗, 原因: ${tp}${cc.data.bizCode==300?`‼️`:` ⚠️`}`
            merge.JDGStore.fail = 1
          }
        } catch (eor) {
          $nobyda.AnError("京東商城-超市", "JDGStore", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function JDSecKilling(s) { //領券中心
  merge.JDSecKill = {};
  return new Promise((resolve, reject) => {
    if (disable("JDSecKill")) return reject();
    setTimeout(() => {
      $nobyda.post({
        url: 'https://api.m.jd.com/client.action',
        headers: {
          Cookie: KEY,
          Origin: 'https://h5.m.jd.com'
        },
        body: 'functionId=homePageV2&appid=SecKill2020'
      }, (error, response, data) => {
        try {
          if (error) throw new Error(error);
          const Details = LogDetails ? "response:\n" + data : '';
          const cc = JSON.parse(data);
          if (cc.code == 203 || cc.code == 3 || cc.code == 101) {
            merge.JDSecKill.notify = `京東秒殺-紅包: 失敗, 原因: Cookie失效‼️`;
          } else if (cc.result && cc.result.projectId && cc.result.taskId) {
            console.log(`\n京東秒殺-紅包查詢成功 ${Details}`)
            return resolve({
              projectId: cc.result.projectId,
              taskId: cc.result.taskId
            })
          } else {
            merge.JDSecKill.notify = `京東秒殺-紅包: 失敗, 暫無有效活動 ⚠️`;
          }
          merge.JDSecKill.fail = 1;
          console.log(`\n京東秒殺-紅包查詢失敗 ${Details}`)
          reject()
        } catch (eor) {
          $nobyda.AnError("京東秒殺-查詢", "JDSecKill", eor, response, data)
          reject()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  }).then(async (id) => {
    await new Promise(resolve => {
      $nobyda.post({
        url: 'https://api.m.jd.com/client.action',
        headers: {
          Cookie: KEY,
          Origin: 'https://h5.m.jd.com'
        },
        body: `functionId=doInteractiveAssignment&body=%7B%22encryptProjectId%22%3A%22${id.projectId}%22%2C%22encryptAssignmentId%22%3A%22${id.taskId}%22%2C%22completionFlag%22%3Atrue%7D&client=wh5&appid=SecKill2020`
      }, (error, response, data) => {
        try {
          if (error) throw new Error(error);
          const Details = LogDetails ? "response:\n" + data : '';
          const cc = JSON.parse(data);
          if (cc.code == 0 && cc.subCode == 0) {
            console.log(`\n京東秒殺-紅包簽到成功 ${Details}`);
            const qt = data.match(/"discount":(\d.*?),/);
            merge.JDSecKill.success = 1;
            merge.JDSecKill.Cash = qt ? qt[1] : 0;
            merge.JDSecKill.notify = `京東秒殺-紅包: 成功, 明細: ${merge.JDSecKill.Cash||`無`}紅包 🧧`;
          } else {
            console.log(`\n京東秒殺-紅包簽到失敗 ${Details}`);
            merge.JDSecKill.fail = 1;
            merge.JDSecKill.notify = `京東秒殺-紅包: 失敗, ${cc.subCode==103?`原因: 已領取`:cc.msg?cc.msg:`原因: 未知`} ⚠️`;
          }
        } catch (eor) {
          $nobyda.AnError("京東秒殺-領取", "JDSecKill", eor, response, data);
        } finally {
          resolve();
        }
      })
    })
  }, () => {});
}

function TotalSteel() {
  merge.TotalSteel = {};
  return new Promise(resolve => {
    if (disable("TSteel")) return resolve()
    $nobyda.get({
      url: 'https://coin.jd.com/m/gb/getBaseInfo.html',
      headers: {
        Cookie: KEY
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        if (data.match(/(\"gbBalance\":\d+)/)) {
          console.log("\n" + "京東-總鋼鏰查詢成功 " + Details)
          const cc = JSON.parse(data)
          merge.TotalSteel.TSteel = cc.gbBalance
        } else {
          console.log("\n" + "京東-總鋼鏰查詢失敗 " + Details)
        }
      } catch (eor) {
        $nobyda.AnError("賬戶鋼鏰-查詢", "TotalSteel", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function TotalBean() {
  merge.TotalBean = {};
  return new Promise(resolve => {
    if (disable("Qbear")) return resolve()
    $nobyda.get({
      url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion',
      headers: {
        Cookie: KEY
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        const cc = JSON.parse(data)
        if (cc.msg == 'success' && cc.retcode == 0) {
          merge.TotalBean.nickname = cc.data.userInfo.baseInfo.nickname || ""
          merge.TotalBean.Qbear = cc.data.assetInfo.beanNum || 0
          $nobyda.headUrl = cc.data.userInfo.baseInfo.headImageUrl || ""
          console.log(`\n京東-總京豆查詢成功 ${Details}`)
        } else {
          const name = decodeURIComponent(KEY.split(/pt_pin=(.+?);/)[1] || '');
          merge.TotalBean.nickname = cc.retcode == 1001 ? `${name} (CK失效‼️)` : "";
          console.log(`\n京東-總京豆查詢失敗 ${Details}`)
        }
      } catch (eor) {
        $nobyda.AnError("賬戶京豆-查詢", "TotalBean", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function TotalCash() {
  merge.TotalCash = {};
  return new Promise(resolve => {
    if (disable("TCash")) return resolve()
    $nobyda.post({
      url: 'https://api.m.jd.com/client.action?functionId=myhongbao_balance',
      headers: {
        Cookie: KEY
      },
      body: "body=%7B%22fp%22%3A%22-1%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22country%22%3A%22cn%22%2C%22openId%22%3A%22-1%22%2C%22childActivityId%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22platformId%22%3A%22appHongBao%22%2C%22isRvc%22%3A%22-1%22%2C%22orgType%22%3A%222%22%2C%22activityType%22%3A%221%22%2C%22shshshfpb%22%3A%22-1%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22organization%22%3A%22JD%22%2C%22pageClickKey%22%3A%22-1%22%2C%22platform%22%3A%221%22%2C%22eid%22%3A%22-1%22%2C%22appId%22%3A%22appHongBao%22%2C%22childActiveName%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&networklibtype=JDNetworkBaseAF&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=fdc04c3ab0ee9148f947d24fb087b55d&st=1581245397648&sv=120"
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        if (data.match(/(\"totalBalance\":\d+)/)) {
          console.log("\n" + "京東-總紅包查詢成功 " + Details)
          const cc = JSON.parse(data)
          merge.TotalCash.TCash = cc.totalBalance
        } else {
          console.log("\n" + "京東-總紅包查詢失敗 " + Details)
        }
      } catch (eor) {
        $nobyda.AnError("賬戶紅包-查詢", "TotalCash", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function TotalSubsidy() {
  merge.TotalSubsidy = {};
  return new Promise(resolve => {
    if (disable("TotalSubsidy")) return resolve()
    $nobyda.get({
      url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance',
      headers: {
        Cookie: KEY,
        Referer: 'https://active.jd.com/forever/cashback/index?channellv=wojingqb'
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const cc = JSON.parse(data)
        const Details = LogDetails ? "response:\n" + data : '';
        if (cc.resultCode == 0 && cc.resultData && cc.resultData.data) {
          console.log("\n京東-總金貼查詢成功 " + Details)
          merge.TotalSubsidy.TSubsidy = cc.resultData.data.balance || 0
        } else {
          console.log("\n京東-總金貼查詢失敗 " + Details)
        }
      } catch (eor) {
        $nobyda.AnError("賬戶金貼-查詢", "TotalSubsidy", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function TotalMoney() {
  merge.TotalMoney = {};
  return new Promise(resolve => {
    if (disable("TotalMoney")) return resolve()
    $nobyda.get({
      url: 'https://api.m.jd.com/client.action?functionId=cash_exchangePage&body=%7B%7D&build=167398&client=apple&clientVersion=9.1.9&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=762a8e894dea8cbfd91cce4dd5714bc5&st=1602179446935&sv=102',
      headers: {
        Cookie: KEY
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const cc = JSON.parse(data)
        const Details = LogDetails ? "response:\n" + data : '';
        if (cc.code == 0 && cc.data && cc.data.bizCode == 0 && cc.data.result) {
          console.log("\n京東-總現金查詢成功 " + Details)
          merge.TotalMoney.TMoney = cc.data.result.totalMoney || 0
        } else {
          console.log("\n京東-總現金查詢失敗 " + Details)
        }
      } catch (eor) {
        $nobyda.AnError("賬戶現金-查詢", "TotalMoney", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function disable(Val, name, way) {
  const read = $nobyda.read("JD_DailyBonusDisables")
  const annal = $nobyda.read("JD_Crash_" + Val)
  if (annal && way == 1 && boxdis) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
    if (read) {
      if (read.indexOf(Val) == -1) {
        var Crash = $nobyda.write(`${read},${Val}`, "JD_DailyBonusDisables")
        console.log(`\n${name}-觸發自動禁用 ‼️`)
        merge[Val].notify = `${name}: 崩潰, 觸發自動禁用 ‼️`
        merge[Val].error = 1
        $nobyda.disable = 1
      }
    } else {
      var Crash = $nobyda.write(Val, "JD_DailyBonusDisables")
      console.log(`\n${name}-觸發自動禁用 ‼️`)
      merge[Val].notify = `${name}: 崩潰, 觸發自動禁用 ‼️`
      merge[Val].error = 1
      $nobyda.disable = 1
    }
    return true
  } else if (way == 1 && boxdis) {
    var Crash = $nobyda.write(name, "JD_Crash_" + Val)
  } else if (way == 2 && annal) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
  }
  if (read && read.indexOf(Val) != -1) {
    return true
  } else {
    return false
  }
}

function Wait(readDelay, ini) {
  if (!readDelay || readDelay === '0') return 0
  if (typeof(readDelay) == 'string') {
    var readDelay = readDelay.replace(/"|＂|'|＇/g, ''); //prevent novice
    if (readDelay.indexOf('-') == -1) return parseInt(readDelay) || 0;
    const raw = readDelay.split("-").map(Number);
    const plan = parseInt(Math.random() * (raw[1] - raw[0] + 1) + raw[0], 10);
    if (ini) console.log(`\n初始化隨機延遲: 最小${raw[0]/1000}秒, 最大${raw[1]/1000}秒`);
    // else console.log(`\n預計等待: ${(plan / 1000).toFixed(2)}秒`);
    return ini ? readDelay : plan
  } else if (typeof(readDelay) == 'number') {
    return readDelay > 0 ? readDelay : 0
  } else return 0
}

function CookieMove(oldCk1, oldCk2, oldKey1, oldKey2, newKey) {
  let update;
  const move = (ck, del) => {
    console.log(`京東${del}開始遷移!`);
    update = CookieUpdate(null, ck).total;
    update = $nobyda.write(JSON.stringify(update, null, 2), newKey);
    update = $nobyda.write("", del);
  }
  if (oldCk1) {
    const write = move(oldCk1, oldKey1);
  }
  if (oldCk2) {
    const write = move(oldCk2, oldKey2);
  }
}

function checkFormat(value) { //check format and delete duplicates
  let n, k, c = {};
  return value.reduce((t, i) => {
    k = ((i.cookie || '').match(/(pt_key|pt_pin)=.+?;/g) || []).sort();
    if (k.length == 2) {
      if ((n = k[1]) && !c[n]) {
        i.userName = i.userName ? i.userName : decodeURIComponent(n.split(/pt_pin=(.+?);/)[1]);
        i.cookie = k.join('')
        if (i.jrBody && !i.jrBody.includes('reqData=')) {
          console.log(`異常鋼鏰Body已過濾: ${i.jrBody}`)
          delete i.jrBody;
        }
        c[n] = t.push(i);
      }
    } else {
      console.log(`異常京東Cookie已過濾: ${i.cookie}`)
    }
    return t;
  }, [])
}

function CookieUpdate(oldValue, newValue, path = 'cookie') {
  let item, type, name = (oldValue || newValue || '').split(/pt_pin=(.+?);/)[1];
  let total = $nobyda.read('CookiesJD');
  try {
    total = checkFormat(JSON.parse(total || '[]'));
  } catch (e) {
    $nobyda.notify("京東簽到", "", "Cookie JSON格式不正確, 即將清空\n可前往日誌查看該數據內容!");
    console.log(`京東簽到Cookie JSON格式異常: ${e.message||e}\n舊數據內容: ${total}`);
    total = [];
  }
  for (let i = 0; i < total.length; i++) {
    if (total[i].cookie && new RegExp(`pt_pin=${name};`).test(total[i].cookie)) {
      item = i;
      break;
    }
  }
  if (newValue && item !== undefined) {
    type = total[item][path] === newValue ? -1 : 2;
    total[item][path] = newValue;
    item = item + 1;
  } else if (newValue && path === 'cookie') {
    total.push({
      cookie: newValue
    });
    type = 1;
    item = total.length;
  }
  return {
    total: checkFormat(total),
    type, //-1: same, 1: add, 2:update
    item,
    name: decodeURIComponent(name)
  };
}

function GetCookie() {
  const req = $request;
  if (req.method != 'OPTIONS' && req.headers) {
    const CV = (req.headers['Cookie'] || req.headers['cookie'] || '');
    const ckItems = CV.match(/(pt_key|pt_pin)=.+?;/g);
    if (/^https:\/\/(me-|)api(\.m|)\.jd\.com\/(client\.|user_new)/.test(req.url)) {
      if (ckItems && ckItems.length == 2) {
        const value = CookieUpdate(null, ckItems.join(''))
        if (value.type !== -1) {
          const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
          $nobyda.notify(`用戶名: ${value.name}`, ``, `${value.type==2?`更新`:`寫入`}京東 [賬號${value.item}] Cookie${write?`成功 🎉`:`失敗 ‼️`}`)
        } else {
          console.log(`\n用戶名: ${value.name}\n與歷史京東 [賬號${value.item}] Cookie相同, 跳過寫入 ⚠️`)
        }
      } else {
        throw new Error("寫入Cookie失敗, 關鍵值缺失\n可能原因: 非網頁獲取 ‼️");
      }
    } else if (/^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/hy\/h5\/m\/appSign\?/.test(req.url) && req.body) {
      const value = CookieUpdate(CV, req.body, 'jrBody');
      if (value.type) {
        const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
        $nobyda.notify(`用戶名: ${value.name}`, ``, `獲取京東 [賬號${value.item}] 鋼鏰Body${write?`成功 🎉`:`失敗 ‼️`}`)
      } else {
        throw new Error("寫入鋼鏰Body失敗\n未獲取該賬號Cookie或關鍵值缺失‼️");
      }
    } else if (req.url === 'http://www.apple.com/') {
      throw new Error("類型錯誤, 手動運行請選擇上下文環境為Cron ⚠️");
    }
  } else if (!req.headers) {
    throw new Error("寫入Cookie失敗, 請檢查匹配URL或配置內腳本類型 ⚠️");
  }
}

// Modified from yichahucha
function nobyda() {
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = 'CookieSet.json'
  const node = (() => {
    if (isNode) {
      const request = require('request');
      const fs = require("fs");
      const path = require("path");
      return ({
        request,
        fs,
        path
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message, rawopts) => {
    const Opts = (rawopts) => { //Modified from https://github.com/chavyleung/scripts/blob/master/Env.js
      if (!rawopts) return rawopts
      if (typeof rawopts === 'string') {
        if (isLoon) return rawopts
        else if (isQuanX) return {
          'open-url': rawopts
        }
        else if (isSurge) return {
          url: rawopts
        }
        else return undefined
      } else if (typeof rawopts === 'object') {
        if (isLoon) {
          let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
          let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
          return {
            openUrl,
            mediaUrl
          }
        } else if (isQuanX) {
          let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
          let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
          return {
            'open-url': openUrl,
            'media-url': mediaUrl
          }
        } else if (isSurge) {
          let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
          return {
            url: openUrl
          }
        }
      } else {
        return undefined
      }
    }
    console.log(`${title}\n${subtitle}\n${message}`)
    if (isQuanX) $notify(title, subtitle, message, Opts(rawopts))
    if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts))
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet)))
          node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify({}));
        const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)));
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify(dataValue));
      } catch (er) {
        return AnError('Node.js持久化寫入', null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value
        }),
        path: `shared://${key}.txt`
      })
    }
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet))) return null;
        const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)))
        return dataValue[key]
      } catch (er) {
        return AnError('Node.js持久化讀取', null, er)
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string
    }
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
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
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
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (options.body) options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      //options["opts"] = {
      //  "hints": false
      //}
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
  const AnError = (name, keyname, er, resp, body) => {
    if (typeof(merge) != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 異常, 已輸出日誌 ‼️`
      } else {
        merge[keyname].notify += `\n${name}: 異常, 已輸出日誌 ‼️ (2)`
      }
      merge[keyname].error = 1
    }
    return console.log(`\n‼️${name}發生錯誤\n‼️名稱: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/\"line\"/)?`\n‼️行列: ${JSON.stringify(er)}`:``}${resp&&resp.status?`\n‼️狀態: ${resp.status}`:``}${body?`\n‼️響應: ${resp&&resp.status!=503?body:`Omit.`}`:``}`)
  }
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n簽到用時: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    AnError,
    isRequest,
    isJSBox,
    isSurge,
    isQuanX,
    isLoon,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    time,
    done
  }
};
