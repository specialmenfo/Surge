/*
README嚗冴ttps://github.com/yichahucha/surge/tree/master
 */

const $tool = new Tool()
const consoleLog = false;
const imdbApikeyCacheKey = "ImdbApikeyCacheKey";
const netflixTitleCacheKey = "NetflixTitleCacheKey";

if (!$tool.isResponse) {
    let url = $request.url;
    const urlDecode = decodeURIComponent(url);
    const videos = urlDecode.match(/"videos","(\d+)"/);
    const videoID = videos[1];
    const map = getTitleMap();
    const title = map[videoID];
    const isEnglish = url.match(/languages=en/) ? true : false;
    if (!title && !isEnglish) {
        const currentSummary = urlDecode.match(/\["videos","(\d+)","current","summary"\]/);
        if (currentSummary) {
            url = url.replace("&path=" + encodeURIComponent(currentSummary[0]), "");
        }
        url = url.replace(/&languages=(.*?)&/, "&languages=en-US&");
    }
    url += "&path=" + encodeURIComponent(`[${videos[0]},"details"]`);
    $done({ url });
} else {
    var IMDbApikeys = IMDbApikeys();
    var IMDbApikey = $tool.read(imdbApikeyCacheKey);
    if (!IMDbApikey) updateIMDbApikey();
    let obj = JSON.parse($response.body);
    if (consoleLog) console.log("Netflix Original Body:\n" + $response.body);
    if (typeof(obj.paths[0][1]) == "string") {
    const videoID = obj.paths[0][1];
    const video = obj.value.videos[videoID];
    const map = getTitleMap();
    let title = map[videoID];
    if (!title) {
        title = video.summary.title;
        setTitleMap(videoID, title, map);
    }
    let year = null;
    let type = video.summary.type;
    if (type == "show") {
        type = "series";
    }
    if (type == "movie") {
        year = video.details.releaseYear;
    }
    delete video.details;
    const requestRatings = async () => {
        const IMDb = await requestIMDbRating(title, year, type);
        const Douban = await requestDoubanRating(IMDb.id);
        const IMDbrating = IMDb.msg.rating;
        const tomatoes = IMDb.msg.tomatoes;
        const country = IMDb.msg.country;
        const doubanRating = Douban.rating;
        const message = `${country}\n${IMDbrating}\n${doubanRating}${tomatoes.length > 0 ? "\n" + tomatoes + "\n" : "\n"}`;
        return message;
    }
    let msg = "";
    requestRatings()
        .then(message => msg = message)
        .catch(error => msg = error + "\n")
        .finally(() => {
            let summary = obj.value.videos[videoID].summary;
            summary["supplementalMessage"] = `${msg}${summary && summary.supplementalMessage ? "\n" + summary.supplementalMessage : ""}`;
            if (consoleLog) console.log("Netflix Modified Body:\n" + JSON.stringify(obj));
            $done({ body: JSON.stringify(obj) });
        });
    } else {
        $done({});
    }
}

function getTitleMap() {
    const map = $tool.read(netflixTitleCacheKey);
    return map ? JSON.parse(map) : {};
}

function setTitleMap(id, title, map) {
    map[id] = title;
    $tool.write(JSON.stringify(map), netflixTitleCacheKey);
}

function requestDoubanRating(imdbId) {
    return new Promise(function (resolve, reject) {
        const url = "https://api.douban.com/v2/movie/imdb/" + imdbId + "?apikey=0df993c66c0c636e29ecbb5344252a4a";
        if (consoleLog) console.log("Netflix Douban Rating URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Netflix Douban Rating Data:\n" + data);
                if (response.status == 200) {
                    const obj = JSON.parse(data);
                    const rating = get_douban_rating_message(obj);
                    resolve({ rating });
                } else {
                    resolve({ rating: "Douban:  " + errorTip().noData });
                }
            } else {
                if (consoleLog) console.log("Netflix Douban Rating Error:\n" + error);
                resolve({ rating: "Douban:  " + errorTip().error });
            }
        });
    });
}

function requestIMDbRating(title, year, type) {
    return new Promise(function (resolve, reject) {
        let url = "https://www.omdbapi.com/?t=" + encodeURI(title) + "&apikey=" + IMDbApikey;
        if (year) url += "&y=" + year;
        if (type) url += "&type=" + type;
        if (consoleLog) console.log("Netflix IMDb Rating URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Netflix IMDb Rating Data:\n" + data);
                if (response.status == 200) {
                    const obj = JSON.parse(data);
                    if (obj.Response != "False") {
                        const id = obj.imdbID;
                        const msg = get_IMDb_message(obj);
                        resolve({ id, msg });
                    } else {
                        reject(errorTip().noData);
                    }
                } else if (response.status == 401) {
                    if (IMDbApikeys.length > 1) {
                        updateIMDbApikey();
                        requestIMDbRating(title, year, type);
                    } else {
                        reject(errorTip().noData);
                    }
                } else {
                    reject(errorTip().noData);
                }
            } else {
                if (consoleLog) console.log("Netflix IMDb Rating Error:\n" + error);
                reject(errorTip().error);
            }
        });
    });
}

function updateIMDbApikey() {
    if (IMDbApikey) IMDbApikeys.splice(IMDbApikeys.indexOf(IMDbApikey), 1);
    const index = Math.floor(Math.random() * IMDbApikeys.length);
    IMDbApikey = IMDbApikeys[index];
    $tool.write(IMDbApikey, imdbApikeyCacheKey);
}

function get_IMDb_message(data) {
    let rating_message = "IMDb:  潃琜� N/A";
    let tomatoes_message = "";
    let country_message = "";
    let ratings = data.Ratings;
    if (ratings.length > 0) {
        const imdb_source = ratings[0]["Source"];
        if (imdb_source == "Internet Movie Database") {
            const imdb_votes = data.imdbVotes;
            const imdb_rating = ratings[0]["Value"];
            rating_message = "IMDb:  潃琜� " + imdb_rating + "   " + imdb_votes;
            if (data.Type == "movie") {
                if (ratings.length > 1) {
                    const source = ratings[1]["Source"];
                    if (source == "Rotten Tomatoes") {
                        const tomatoes = ratings[1]["Value"];
                        tomatoes_message = "Tomatoes:  �� " + tomatoes;
                    }
                }
            }
        }
    }
    country_message = get_country_message(data.Country);
    return { rating: rating_message, tomatoes: tomatoes_message, country: country_message }
}

function get_douban_rating_message(data) {
    const average = data.rating.average;
    const numRaters = data.rating.numRaters;
    const rating_message = `Douban:  潃琜� ${average.length > 0 ? average + "/10" : "N/A"}   ${numRaters == 0 ? "" : parseFloat(numRaters).toLocaleString()}`;
    return rating_message;
}

function get_country_message(data) {
    const country = data;
    const countrys = country.split(", ");
    let emoji_country = "";
    countrys.forEach(item => {
        emoji_country += countryEmoji(item) + " " + item + ", ";
    });
    return emoji_country.slice(0, -2);
}

function errorTip() {
    return { noData: "潃琜� N/A", error: "�� N/A" }
}

function IMDbApikeys() {
    const apikeys = [
        "f75e0253", "d8bb2d6b",
        "ae64ce8d", "7218d678",
        "b2650e38", "8c4a29ab",
        "9bd135c2", "953dbabe",
        "1a66ef12", "3e7ea721",
        "457fc4ff", "d2131426",
        "9cc1a9b7", "e53c2c11",
        "f6dfce0e", "b9db622f",
        "e6bde2b9", "d324dbab",
        "d7904fa3", "aeaf88b9",
        "4e89234e",];
    return apikeys;
}

function countryEmoji(name) {
    const emojiMap = {
        "Chequered": "��",
        "Triangular": "�鹻",
        "Crossed": "��",
        "Black": "�螱",
        "White": "�𢰧",
        "Rainbow": "�𢰧儭謿�㵵��",
        "Pirate": "�螱�𨧀�儭�",
        "Ascension Island": "�𨤍�𠪊",
        "Andorra": "�𨤍�𣉞",
        "United Arab Emirates": "�𨤍�䌊",
        "Afghanistan": "�𨤍�蒄",
        "Antigua & Barbuda": "�𨤍�龖",
        "Anguilla": "�𨤍�䤰",
        "Albania": "�𨤍�靊",
        "Armenia": "�𨤍�鈘",
        "Angola": "�𨤍�稲",
        "Antarctica": "�𨤍�権",
        "Argentina": "�𨤍�袝",
        "American Samoa": "�𨤍�瑌",
        "Austria": "�𨤍�篅",
        "Australia": "�𨤍�枂",
        "Aruba": "�𨤍�剏",
        "�land Islands": "�𨤍�遆",
        "Azerbaijan": "�𨤍�珄",
        "Bosnia & Herzegovina": "�𣇪�𨤍",
        "Barbados": "�𣇪�𣇪",
        "Bangladesh": "�𣇪�𣉞",
        "Belgium": "�𣇪�䌊",
        "Burkina Faso": "�𣇪�蒄",
        "Bulgaria": "�𣇪�龖",
        "Bahrain": "�𣇪�鐯",
        "Burundi": "�𣇪�䤰",
        "Benin": "�𣇪�蘓",
        "St. Barth矇lemy": "�𣇪�靊",
        "Bermuda": "�𣇪�鈘",
        "Brunei": "�𣇪�秐",
        "Bolivia": "�𣇪�稲",
        "Caribbean Netherlands": "�𣇪�権",
        "Brazil": "�𣇪�袝",
        "Bahamas": "�𣇪�瑌",
        "Bhutan": "�𣇪�篅",
        "Bouvet Island": "�𣇪�稬",
        "Botswana": "�𣇪�剏",
        "Belarus": "�𣇪�㓦",
        "Belize": "�𣇪�珄",
        "Canada": "�𠪊�𨤍",
        "Cocos (Keeling) Islands": "�𠪊�𠪊",
        "Congo - Kinshasa": "�𠪊�𣉞",
        "Congo": "�𠪊�𣉞",
        "Central African Republic": "�𠪊�蒄",
        "Congo - Brazzaville": "�𠪊�龖",
        "Switzerland": "�𠪊�鐯",
        "C繫te d�窼voire": "�𠪊�䤰",
        "Cook Islands": "�𠪊�墖",
        "Chile": "�𠪊�靊",
        "Cameroon": "�𠪊�鈘",
        "China": "�𠪊�秐",
        "Colombia": "�𠪊�稲",
        "Clipperton Island": "�𠪊�晠",
        "Costa Rica": "�𠪊�袝",
        "Cuba": "�𠪊�枂",
        "Cape Verde": "�𠪊�稬",
        "Cura癟ao": "�𠪊�剏",
        "Christmas Island": "�𠪊�遆",
        "Cyprus": "�𠪊�㓦",
        "Czechia": "�𠪊�珄",
        "Czech Republic": "�𠪊�珄",
        "Germany": "�𣉞�䌊",
        "Diego Garcia": "�𣉞�龖",
        "Djibouti": "�𣉞�蘓",
        "Denmark": "�𣉞�墖",
        "Dominica": "�𣉞�鈘",
        "Dominican Republic": "�𣉞�稲",
        "Algeria": "�𣉞�珄",
        "Ceuta & Melilla": "�䌊�𨤍",
        "Ecuador": "�䌊�𠪊",
        "Estonia": "�䌊�䌊",
        "Egypt": "�䌊�龖",
        "Western Sahara": "�䌊�鐯",
        "Eritrea": "�䌊�袝",
        "Spain": "�䌊�瑌",
        "Ethiopia": "�䌊�篅",
        "European Union": "�䌊�枂",
        "Finland": "�蒄�䤰",
        "Fiji": "�蒄�蘓",
        "Falkland Islands": "�蒄�墖",
        "Micronesia": "�蒄�鈘",
        "Faroe Islands": "�蒄�稲",
        "France": "�蒄�袝",
        "Gabon": "�龖�𨤍",
        "United Kingdom": "�龖�𣇪",
        "UK": "�龖�𣇪",
        "Grenada": "�龖�𣉞",
        "Georgia": "�龖�䌊",
        "French Guiana": "�龖�蒄",
        "Guernsey": "�龖�龖",
        "Ghana": "�龖�鐯",
        "Gibraltar": "�龖�䤰",
        "Greenland": "�龖�靊",
        "Gambia": "�龖�鈘",
        "Guinea": "�龖�秐",
        "Guadeloupe": "�龖�晠",
        "Equatorial Guinea": "�龖�権",
        "Greece": "�龖�袝",
        "South Georgia & South Sandwich Is lands": "�龖�瑌",
        "Guatemala": "�龖�篅",
        "Guam": "�龖�枂",
        "Guinea-Bissau": "�龖�剏",
        "Guyana": "�龖�㓦",
        "Hong Kong SAR China": "�鐯�墖",
        "Hong Kong": "�鐯�墖",
        "Heard & McDonald Islands": "�鐯�鈘",
        "Honduras": "�鐯�秐",
        "Croatia": "�鐯�袝",
        "Haiti": "�鐯�篅",
        "Hungary": "�鐯�枂",
        "Canary Islands": "�䤰�𠪊",
        "Indonesia": "�䤰�𣉞",
        "Ireland": "�䤰�䌊",
        "Israel": "�䤰�靊",
        "Isle of Man": "�䤰�鈘",
        "India": "�䤰�秐",
        "British Indian Ocean Territory": "�䤰�稲",
        "Iraq": "�䤰�権",
        "Iran": "�䤰�袝",
        "Iceland": "�䤰�瑌",
        "Italy": "�䤰�篅",
        "Jersey": "�蘓�䌊",
        "Jamaica": "�蘓�鈘",
        "Jordan": "�蘓�稲",
        "Japan": "�蘓�晠",
        "Kenya": "�墖�䌊",
        "Kyrgyzstan": "�墖�龖",
        "Cambodia": "�墖�鐯",
        "Kiribati": "�墖�䤰",
        "Comoros": "�墖�鈘",
        "St. Kitts & Nevis": "�墖�秐",
        "North Korea": "�墖�晠",
        "South Korea": "�墖�袝",
        "Kuwait": "�墖�剏",
        "Cayman Islands": "�墖�㓦",
        "Kazakhstan": "�墖�珄",
        "Laos": "�靊�𨤍",
        "Lebanon": "�靊�𣇪",
        "St. Lucia": "�靊�𠪊",
        "Liechtenstein": "�靊�䤰",
        "Sri Lanka": "�靊�墖",
        "Liberia": "�靊�袝",
        "Lesotho": "�靊�瑌",
        "Lithuania": "�靊�篅",
        "Luxembourg": "�靊�枂",
        "Latvia": "�靊�稬",
        "Libya": "�靊�㓦",
        "Morocco": "�鈘�𨤍",
        "Monaco": "�鈘�𠪊",
        "Moldova": "�鈘�𣉞",
        "Montenegro": "�鈘�䌊",
        "St. Martin": "�鈘�蒄",
        "Madagascar": "�鈘�龖",
        "Marshall Islands": "�鈘�鐯",
        "North Macedonia": "�鈘�墖",
        "Mali": "�鈘�靊",
        "Myanmar (Burma)": "�鈘�鈘",
        "Mongolia": "�鈘�秐",
        "Macau Sar China": "�鈘�稲",
        "Northern Mariana Islands": "�鈘�晠",
        "Martinique": "�鈘�権",
        "Mauritania": "�鈘�袝",
        "Montserrat": "�鈘�瑌",
        "Malta": "�鈘�篅",
        "Mauritius": "�鈘�枂",
        "Maldives": "�鈘�稬",
        "Malawi": "�鈘�剏",
        "Mexico": "�鈘�遆",
        "Malaysia": "�鈘�㓦",
        "Mozambique": "�鈘�珄",
        "Namibia": "�秐�𨤍",
        "New Caledonia": "�秐�𠪊",
        "Niger": "�秐�䌊",
        "Norfolk Island": "�秐�蒄",
        "Nigeria": "�秐�龖",
        "Nicaragua": "�秐�䤰",
        "Netherlands": "�秐�靊",
        "Norway": "�秐�稲",
        "Nepal": "�秐�晠",
        "Nauru": "�秐�袝",
        "Niue": "�秐�枂",
        "New Zealand": "�秐�珄",
        "Oman": "�稲�鈘",
        "Panama": "�晠�𨤍",
        "Peru": "�晠�䌊",
        "French Polynesia": "�晠�蒄",
        "Papua New Guinea": "�晠�龖",
        "Philippines": "�晠�鐯",
        "Pakistan": "�晠�墖",
        "Poland": "�晠�靊",
        "St. Pierre & Miquelon": "�晠�鈘",
        "Pitcairn Islands": "�晠�秐",
        "Puerto Rico": "�晠�袝",
        "Palestinian Territories": "�晠�瑌",
        "Portugal": "�晠�篅",
        "Palau": "�晠�剏",
        "Paraguay": "�晠�㓦",
        "Qatar": "�権�𨤍",
        "R矇union": "�袝�䌊",
        "Romania": "�袝�稲",
        "Serbia": "�袝�瑌",
        "Russia": "�袝�枂",
        "Rwanda": "�袝�剏",
        "Saudi Arabia": "�瑌�𨤍",
        "Solomon Islands": "�瑌�𣇪",
        "Seychelles": "�瑌�𠪊",
        "Sudan": "�瑌�𣉞",
        "Sweden": "�瑌�䌊",
        "Singapore": "�瑌�龖",
        "St. Helena": "�瑌�鐯",
        "Slovenia": "�瑌�䤰",
        "Svalbard & Jan Mayen": "�瑌�蘓",
        "Slovakia": "�瑌�墖",
        "Sierra Leone": "�瑌�靊",
        "San Marino": "�瑌�鈘",
        "Senegal": "�瑌�秐",
        "Somalia": "�瑌�稲",
        "Suriname": "�瑌�袝",
        "South Sudan": "�瑌�瑌",
        "S瓊o Tom矇 & Pr穩ncipe": "�瑌�篅",
        "El Salvador": "�瑌�稬",
        "Sint Maarten": "�瑌�遆",
        "Syria": "�瑌�㓦",
        "Swaziland": "�瑌�珄",
        "Tristan Da Cunha": "�篅�𨤍",
        "Turks & Caicos Islands": "�篅�𠪊",
        "Chad": "�篅�𣉞",
        "French Southern Territories": "�篅�蒄",
        "Togo": "�篅�龖",
        "Thailand": "�篅�鐯",
        "Tajikistan": "�篅�蘓",
        "Tokelau": "�篅�墖",
        "Timor-Leste": "�篅�靊",
        "Turkmenistan": "�篅�鈘",
        "Tunisia": "�篅�秐",
        "Tonga": "�篅�稲",
        "Turkey": "�篅�袝",
        "Trinidad & Tobago": "�篅�篅",
        "Tuvalu": "�篅�稬",
        "Taiwan": "�篅�剏",
        "Tanzania": "�篅�珄",
        "Ukraine": "�枂�𨤍",
        "Uganda": "�枂�龖",
        "U.S. Outlying Islands": "�枂�鈘",
        "United Nations": "�枂�秐",
        "United States": "�枂�瑌",
        "USA": "�枂�瑌",
        "Uruguay": "�枂�㓦",
        "Uzbekistan": "�枂�珄",
        "Vatican City": "�稬�𨤍",
        "St. Vincent & Grenadines": "�稬�𠪊",
        "Venezuela": "�稬�䌊",
        "British Virgin Islands": "�稬�龖",
        "U.S. Virgin Islands": "�稬�䤰",
        "Vietnam": "�稬�秐",
        "Vanuatu": "�稬�枂",
        "Wallis & Futuna": "�剏�蒄",
        "Samoa": "�剏�瑌",
        "Kosovo": "�遆�墖",
        "Yemen": "�㓦�䌊",
        "Mayotte": "�㓦�篅",
        "South Africa": "�珄�𨤍",
        "Zambia": "�珄�鈘",
        "Zimbabwe": "�珄�剏",
        "England": "�螱������������",
        "Scotland": "�螱������������",
        "Wales": "�螱������������",
    }
    return emojiMap[name] ? emojiMap[name] : emojiMap["Chequered"];
}

function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}
