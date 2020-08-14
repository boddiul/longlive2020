function toDataURL(url) {
    return fetch(url).then((response) => {
        return response.blob();
    }).then(blob => {
        return URL.createObjectURL(blob);
    });
}





let t = -1



let crop = {x:4.93,x2:89.43,y:0,y2:100}

//document.addEventListener('mousedown',click_mouse);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

let wh = 800

ctx.canvas.width = wh
ctx.canvas.height = wh

var img = new Image();
img.crossOrigin = "anonymous"
img.onload = function(){


    let h_center = (img.height*crop.y2/100+img.height*crop.y/100)/2
    let old_w = (img.width*crop.x2/100-img.width*crop.x/100)

    ctx.drawImage(img,img.width*crop.x/100,h_center-old_w/2,old_w,old_w,0,0,wh,wh);

    var over = new Image();
    over.onload = function () {
        ctx.drawImage(over,0,0,over.width,over.height,0,wh/2-(over.height*wh/over.width)/2,wh,over.height*wh/over.width)
    }

    over.src = 'overlay.png'


    //document.getElementById("button_wall").style.display = "inline-block"
    //document.getElementById("button_stories").style.display = "inline-block"
    //document.getElementById("button_download").style.display = "inline-block"

    document.getElementById("load").style.display = "none"
};



var FUNCTION = 'function';
var UNDEFINED = 'undefined';
var subscribers = [];
var webFrameId = null;
var connectVersion = '1.2.0';
var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
var eventType = isWeb ? 'message' : 'VKWebAppEvent';

if (typeof window !== UNDEFINED) {

    //polyfill
    if (!window.CustomEvent) {
        (function() {
            function CustomEvent(event, params) {
                params = params || {bubbles: false, cancelable: false, detail: undefined};
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        })();
    }

    window.addEventListener(eventType, function() {
        var args = Array.prototype.slice.call(arguments);
        var _subscribers = subscribers.slice();
        if (isWeb) {
            if (args[0].data.hasOwnProperty('webFrameId')) {
                delete args[0].data.webFrameId;
            }
            if (args[0].data.hasOwnProperty('connectVersion')) {
                delete args[0].data.connectVersion;
            }
            if (args[0].data.type && args[0].data.type === 'VKWebAppSettings') {
                webFrameId = args[0].data.frameId;
            } else {
                _subscribers.forEach(function(fn) {
                    fn({
                        detail: args[0].data
                    });
                });
            }
        } else {
            _subscribers.forEach(function(fn) {
                fn.apply(null, args);
            });
        }
    });
}

/**
 * Sends a message to native client
 *
 * @example
 * message.send('VKWebAppInit');
 *
 * @param {String} handler Message type
 * @param {Object} params Message data
 * @returns {void}
 */
function send(handler, params) {
    if (!params) {
        params = {};
    }

    var isClient = typeof window !== UNDEFINED;
    var androidBridge = isClient && window.AndroidBridge;
    var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
    var isDesktop = !androidBridge && !iosBridge;

    if (androidBridge && typeof androidBridge[handler] == FUNCTION) {
        androidBridge[handler](JSON.stringify(params));
    }
    if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
        iosBridge[handler].postMessage(params);
    }

    if (isDesktop) {
        parent.postMessage({
            handler: handler,
            params: params,
            type: 'vk-connect',
            webFrameId: webFrameId,
            connectVersion
        }, '*');
    }
};
/**
 * Subscribe on VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function subscribe(fn) {
    subscribers.push(fn);
};
/**
 * Unsubscribe on VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function unsubscribe(fn) {
    var index = subscribers.indexOf(fn);

    if (index > -1) {
        subscribers.splice(index, 1);
    }
};

/**
 * Checks if native client supports handler
 *
 * @param {String} handler Handler name
 * @returns {boolean}
 */
function supports(handler) {

    var isClient = typeof window !== UNDEFINED;
    var androidBridge = isClient && window.AndroidBridge;
    var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
    var desktopEvents = [
        "VKWebAppInit",
        "VKWebAppGetCommunityAuthToken",
        "VKWebAppAddToCommunity",
        "VKWebAppGetUserInfo",
        "VKWebAppSetLocation",
        "VKWebAppGetClientVersion",
        "VKWebAppGetPhoneNumber",
        "VKWebAppGetEmail",
        "VKWebAppGetGeodata",
        "VKWebAppSetTitle",
        "VKWebAppGetAuthToken",
        "VKWebAppCallAPIMethod",
        "VKWebAppJoinGroup",
        "VKWebAppAllowMessagesFromGroup",
        "VKWebAppDenyNotifications",
        "VKWebAppAllowNotifications",
        "VKWebAppOpenPayForm",
        "VKWebAppOpenApp",
        "VKWebAppShare",
        "VKWebAppShowWallPostBox",
        "VKWebAppScroll",
        "VKWebAppResizeWindow",
    ];

    if (androidBridge && typeof androidBridge[handler] == FUNCTION) return true;

    if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) return true;

    if (!iosBridge && !androidBridge && ~desktopEvents.indexOf(handler)) return true;

    return false;
};
function handleStuff(e) {
    console.log(e)
}


img_hash = -1
function checker(event)
{

    console.log(event)



    if (event.detail.type==="VKWebAppAccessTokenReceived"){
        t = event.detail.data.access_token

        send("VKWebAppCallAPIMethod", {
            "method":"users.get",
            "request_id":"0",
            "params": {
                "fields":"crop_photo",
                "access_token":t,
                "v":"5.122"
            }});
    }


    if (event.detail.type==="VKWebAppCallAPIMethodResult") {

        if (event.detail.data.request_id === "0") {

            document.getElementById("load").style.display = "none"
            try {
                crop = event.detail.data.response[0].crop_photo.crop
                var sz = event.detail.data.response[0].crop_photo.photo.sizes
                photo_url = sz[sz.length - 1].url
                img.src = photo_url
            }
            catch (e) {
                img.src = "white.jpg"
            }



        }
        else if (event.detail.data.request_id === "1") {


            let upload_url = event.detail.data.response.upload_url
            let dataURL = canvas.toDataURL()

            console.log(dataURL)

            $.ajax({
                type: "POST",
                url: "https://lentachimg.aaaaa.team/",
                data: {
                    upload_url: upload_url,
                    imgBase64: dataURL
                }
            }).done(function(o) {

                console.log(o)

                img_hash = o.hash

                send("VKWebAppCallAPIMethod", {
                    "method":"photos.saveWallPhoto",
                    "request_id":"2",
                   "params": {
                        "server":o.server,
                        "photo":o.photo,
                        "hash":o.hash,

                        "access_token":t,
                        "v":"5.122"
                    }});



            });


        }
        else if (event.detail.data.request_id === "2") {

            console.log("_________")

            var owner_id = event.detail.data.response[0].owner_id;
            var photo_id = event.detail.data.response[0].id;
            console.log
            //VK.callMethod("showProfilePhotoBox",event.detail.data.response.photo_hash)


            send("VKWebAppShowWallPostBox", {
                "message":"#ЖывеБеларусь",
                "attachments":"photo"+owner_id+"_"+photo_id+",https://vk.com/app7565667"
                });

        }


    }


    if (event.detail.type==="VKWebAppShowStoryBoxResult" ||
        event.detail.type==="VKWebAppShowStoryBoxFailed") {
        document.getElementById("load").style.display = "none"
    }


    if (event.detail.type==="VKWebAppShowWallPostBoxResult" ||
        event.detail.type==="VKWebAppShowWallPostBoxFailed") {
        document.getElementById("load").style.display = "none"
    }
}


function button_lentach()
{
    console.log("lentach")
    window.open("https://vk.com/wall-29534144_13983231","_blank")
}

function button_wall()
{
    console.log("wall")
    document.getElementById("load").style.display = "inline-block"
    //var canvas = document.querySelector('#canvas');
    //var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    //downloadImage(dataURL, 'ava.jpeg');


    //send("VKWebAppCallAPIMethod", {
    //    "method":"photos.getOwnerPhotoUploadServer",
    //    "request_id":"1",
    //    "params": {
    //        "access_token":t,
    //        "v":"5.122"
    //    }});


    send("VKWebAppCallAPIMethod", {
            "method":"photos.getWallUploadServer",
            "request_id":"1",
            "params": {
                "access_token":t,
                "v":"5.122"
            }});
    }



function button_stories()
{
    console.log("stories")

    document.getElementById("load").style.display = "inline-block"
    canvas.toBlob( function(blob) {


        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            var base64String = reader.result;


            send("VKWebAppShowStoryBox", {
                "background_type":"image",
                "blob":base64String,
                "attachment": {
                    "text":"Жыве Беларусь!",
                    "type":"url",
                    "url":"https://vk.com/app7565667"
                }

            })

        }




    });
}

function button_download()
{
    console.log("download")
    if  (supports("VKWebAppDownloadFile"))
    {
        send("VKWebAppDownloadFile", {
            "url":canvas.toDataURL(),
            "filename":"belarus_ava.jpg"

        })
    }
    else if ((typeof window !== UNDEFINED) && window.AndroidBridge)
    {
        button_stories()
    }
    else
    {

        canvas.toBlob(function(blob) {
            saveAs(blob, "belarus_ava.png");
        });
    }



}

document.getElementById("button_wall").onclick = button_wall;
document.getElementById("button_stories").onclick = button_stories;
document.getElementById("button_download").onclick = button_download;
document.getElementById("button_lentach").onclick = button_lentach;

/*
function click_mouse(event)
{
    let y = event.clientY/document.documentElement.clientHeight
    let x = event.clientX/document.documentElement.clientWidth

    console.log(y)


    if (y>0.63 && y<0.69)
    {
        button_wall()
    }

    if (y>0.63+0.09 && y<0.69+0.09)
    {
        button_stories()
    }

    if (y>0.63+0.09*2 && y<0.69+0.09*2)
    {
        button_download()
    }

    if (y>0.9 && x>0.4 && x<0.6)
    {
        button_lentach()
    }

    if (y>0.74 && y<0.85) {
            if (x>0.5)
            {
            }
            else
            {
            }
    }
    else if (y>0.90 && x<0.6 && x>0.4)
    {
    }

}
*/




send("VKWebAppInit", {});
send("VKWebAppGetAuthToken", {"app_id": 7565667,"scope":"photos"});
subscribe(checker)



//img.src = "https://sun9-40.userapi.com/0nxkMuog4RcbrOXG-o2iQ_cw54IVlgbRQMDw-g/1Y3nh3Wb5hQ.jpg"



