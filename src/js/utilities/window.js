'use strict'

export const getBrowser = () => {

    // Opera 8.0+
    // Firefox 1.0+
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    // Internet Explorer 6-11
    // Edge 20+
    // Chrome 1 - 71
    // Blink engine detection
    
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
    var isFirefox = typeof InstallTrigger !== 'undefined'
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]" })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))
    var isIE = /*@cc_on!@*/false || !!document.documentMode
    var isEdge = !isIE && !!window.StyleMedia
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
    var isBlink = (isChrome || isOpera) && !!window.CSS

    if (isOpera) return 'opera'
    else if (isFirefox) return 'firefox'
    else if (isSafari) return 'safari'
    else if (isIE) return 'internet-explorer'
    else if (isEdge) return 'edge'
    else if (isChrome) return 'chrome'
    else if (isBlink) return 'blink'

    console.warn('Browser couldn\'t be detected')
    
}

export const isNode = (o) => {

    return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    )

}

export const isElement = (o) => {

    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    )

}