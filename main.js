function toDataURL(url) {
    return fetch(url).then((response) => {
        return response.blob();
    }).then(blob => {
        return URL.createObjectURL(blob);
    });
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

        if (event.detail.data.request_id === "0")
        {
            crop = event.detail.data.response[0].crop_photo.crop
            var sz = event.detail.data.response[0].crop_photo.photo.sizes
            photo_url = sz[sz.length-1].url
            img.src = photo_url
        }
        else if (event.detail.data.request_id === "2") {

            console.log("_________")
            VK.callMethod("showProfilePhotoBox",event.detail.data.response.photo_hash)
        }
        else if (event.detail.data.request_id === "1") {

            function jsonp(url, callback) {
                var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[callbackName] = function(data) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    callback(data);
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
                document.body.appendChild(script);
            }




            let upload_url = event.detail.data.response.upload_url
            let dataURL = canvas.toDataURL()

            console.log(dataURL)

            $.ajax({
                type: "POST",
                url: "https://longlive2020.herokuapp.com/index.php",
                data: {
                    upload_url: upload_url,
                    imgBase64: dataURL
                }
            }).done(function(o) {
                console.log('saved');

                console.log(o)

                img_hash = o.hash

                send("VKWebAppCallAPIMethod", {
                    "method":"photos.saveOwnerPhoto",
                    "request_id":"2",
                   "params": {
                        "server":o.server,
                        "photo":o.photo,
                        "hash":o.hash,

                        "access_token":t,
                        "v":"5.122"
                    }});



            });





            //jsonp(upload_url, function(userInfo) {
            //    console.log(userInfo);
            //});


            /*
            canvas.toBlob( function(blob) {
                var formData = new FormData()
                formData.append('photo', blob)

                var xhr = new XMLHttpRequest();
                xhr.open( 'POST', upload_url, true )
                xhr.onload = xhr.onerror = function() {
                    console.log( xhr.responseText )
                };
                xhr.send( formData )

            },'image/jpeg')*/






            //var xhr = new XMLHttpRequest();
            //xhr.open('POST', upload_url, true);
            //xhr.onload = function (e) {
                // do something to response
            //    console.log(e);
            //};
            //xhr.send(canvas.toDataURL());



        }



    }


}

async function downloadFile(url, fetchProps) {
    try {
        const response = await fetch(url, fetchProps);

        if (!response.ok) {
            throw new Error(response);
        }

        // Extract filename from header
        const filename = response.headers.get('content-disposition')
            .split(';')
            .find(n => n.includes('filename='))
            .replace('filename=', '')
            .trim()
        ;

        const blob = await response.blob();

        // Download the file
        saveAs(blob, filename);

    } catch (error) {
        throw new Error(error);
    }
}





// Save | Download image
function downloadImage(data, filename = 'untitled.jpeg') {

    var url = data;
    var elem = document.createElement('a');
    elem.href = url;
    elem.target = 'hiddenIframe';
    elem.download = filename
    elem.click();
}


function click_mouse(event)
{
    let y = event.clientY/document.documentElement.clientHeight
    let x = event.clientX/document.documentElement.clientWidth

    console.log(y)

    if (y>0.74 && y<0.85) {


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



        if (x>0.5)
        {

            if  (supports("VKWebAppDownloadFile"))
            {
                send("VKWebAppDownloadFile", {
                    "url":canvas.toDataURL(),
                    "filename":"new_ava.jpg"

                })
            }
            else
            {
                canvas.toBlob(function(blob) {
                    saveAs(blob, "new_ava.png");
                });
            }


        }
        else
        {

            canvas.toBlob( function(blob) {


                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64String = reader.result;


                    send("VKWebAppShowStoryBox", {
                        "background_type":"image",
                        "blob":base64String

                    })

                }




            });
        }

    }
    else if (y>0.90 && x<0.6 && x>0.4)
    {
        window.open("https://vk.com/wall-29534144_13983231","_blank")
    }



}





send("VKWebAppInit", {});
send("VKWebAppGetAuthToken", {"app_id": 7565667,"scope":"photos"});
subscribe(checker)



img.src = "https://sun9-40.userapi.com/0nxkMuog4RcbrOXG-o2iQ_cw54IVlgbRQMDw-g/1Y3nh3Wb5hQ.jpg"



