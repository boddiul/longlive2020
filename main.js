function toDataURL(url) {
    return fetch(url).then((response) => {
        return response.blob();
    }).then(blob => {
        return URL.createObjectURL(blob);
    });
}

async function download() {
    const a = document.createElement("a");
    a.href = await canvas.toDataURL()
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //                screenX, screenY, clientX, clientY, ctrlKey,
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}


let t = -1

document.addEventListener("touchstart", touchHandler, {passive:false});
document.addEventListener("touchmove", touchHandler, {passive:false});
document.addEventListener("touchend", touchHandler, {passive:false});
document.addEventListener("touchcancel", touchHandler, {passive:false});






let crop = {x:4.93,x2:89.43,y:0,y2:100}

document.addEventListener('mousedown',click_mouse);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

let wh = 800

ctx.canvas.width = wh
ctx.canvas.height = wh

var img = new Image();
img.crossOrigin = "anonymous"
img.onload = function(){


    let h_center = (img.height*crop.y2/100-img.height*crop.y/100)/2
    let old_w = (img.width*crop.x2/100-img.width*crop.x/100)

    ctx.drawImage(img,img.width*crop.x/100,h_center-old_w/2,old_w,old_w,0,0,wh,wh);

    var over = new Image();
    over.onload = function () {
        ctx.drawImage(over,0,0,over.width,over.height,0,wh/2-(over.height*wh/over.width)/2,wh,over.height*wh/over.width)
    }

    over.src = 'overlay.png'

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

        if (event.detail.data.request_id === "0")
        {
            crop = event.detail.data.response[0].crop_photo.crop
            var sz = event.detail.data.response[0].crop_photo.photo.sizes
            photo_url = sz[sz.length-1].url
            img.src = photo_url
        }
        else if (event.detail.data.request_id === "1") {

            let upload_url = event.detail.data.response[0].upload_url


            var xhr = new XMLHttpRequest();
            xhr.open('POST', upload_url, true);
            xhr.onload = function (e) {
                // do something to response
                console.log(e);
            };
            xhr.send(canvas.toDataURL());



        }



    }


}

function click_mouse(event)
{
    let y = event.clientY/document.documentElement.clientHeight

    console.log(y)

    if (y>0.74 && y<0.85) {
        //download()

        send("VKWebAppCallAPIMethod", {
            "method":"photos.getOwnerPhotoUploadServer",
            "request_id":"1",
            "params": {
                "access_token":t,
                "v":"5.122"
            }});
    }



}





send("VKWebAppInit", {});
send("VKWebAppGetAuthToken", {"app_id": 7565667,"scope":""});
subscribe(checker)










