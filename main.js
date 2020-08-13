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



document.addEventListener("touchstart", touchHandler, {passive:false});
document.addEventListener("touchmove", touchHandler, {passive:false});
document.addEventListener("touchend", touchHandler, {passive:false});
document.addEventListener("touchcancel", touchHandler, {passive:false});



function click_mouse(event)
{
    let y = event.clientY/document.documentElement.clientHeight

    console.log(y)

    if (y>0.74 && y<0.85) {
        download()
    }



}

document.addEventListener('mousedown',click_mouse);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

let wh = 800

ctx.canvas.width = wh
ctx.canvas.height = wh

var img = new Image();
img.crossOrigin = "anonymous"
img.onload = function(){

    ctx.drawImage(img,0,0,img.width,img.width,0,0,wh,wh);

    var over = new Image();
    over.onload = function () {
        ctx.drawImage(over,0,0,over.width,over.height,0,wh/2-(over.height*wh/over.width)/2,wh,over.height*wh/over.width)
    }

    over.src = 'overlay.png'

};

img.src = 'https://sun9-59.userapi.com/c850608/v850608070/4afc1/jdIMfsh1SvI.jpg';


