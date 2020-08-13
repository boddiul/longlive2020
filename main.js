function toDataURL(url) {
    return fetch(url).then((response) => {
        return response.blob();
    }).then(blob => {
        return URL.createObjectURL(blob);
    });
}

async function download() {
    const a = document.createElement("a");
    a.href = await toDataURL("img_final.jpg");
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
    let y = event.clientY/window.innerHeight

    console.log(y)

    if (y>0.54 && y<0.74) {
        download()
    }



}

document.addEventListener('mousedown',click_mouse);