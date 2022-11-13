// Process block-level uml diagrams
//
'use strict';

const zopfli = require('./zopfli.raw.min.js')

function generateSourceDefault(umlCode, options) {
    var imageFormat = options.imageFormat || 'svg';
    var server = options.server || 'https://www.plantuml.com/plantuml';
    
    var charCodes = [];
    var unscaped = unescape(encodeURIComponent(umlCode));
    for (var i = 0; i < unscaped.length; i++) {
        charCodes.push(unscaped.charCodeAt(i));
    }
    var compressed = new zopfli.Zopfli.RawDeflate(charCodes).compress();
    var zippedCode = encode64(compressed);
    return server + '/' + imageFormat + '/' + zippedCode;
}


function PlantUMLHighlighter() {
    this.options = {
        server: 'https://www.plantuml.com/plantuml',
        lang: 'plantuml'
    }
}


PlantUMLHighlighter.prototype.handle = function (str, lang) {
    if (lang !== this.options.lang) {
        return str
    }
    const core = (umlCode) => {
        return generateSourceDefault(umlCode, this.options)
    }

    return "<img src='" + str.replace(/(@startuml[\w\W]*?@enduml)/g, core) +"'/>"
}

module.exports = PlantUMLHighlighter


function encode64(data) {
    var r = '';
    for (var i = 0; i < data.length; i += 3) {
        if (i + 2 == data.length) {
        r += append3bytes(data[i], data[i + 1], 0);
        } else if (i + 1 == data.length) {
        r += append3bytes(data[i], 0, 0);
        } else {
        r += append3bytes(data[i], data[i + 1], data[i + 2]);
        }
    }
    return r;
}
  
function append3bytes(b1, b2, b3) {
    var c1 = b1 >> 2;
    var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    var c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    var c4 = b3 & 0x3F;
    var r = '';
    r += encode6bit(c1 & 0x3F);
    r += encode6bit(c2 & 0x3F);
    r += encode6bit(c3 & 0x3F);
    r += encode6bit(c4 & 0x3F);
    return r;
}
  
function encode6bit(b) {
    if (b < 10) {
        return String.fromCharCode(48 + b);
    }
    b -= 10;
    if (b < 26) {
        return String.fromCharCode(65 + b);
    }
    b -= 26;
    if (b < 26) {
        return String.fromCharCode(97 + b);
    }
    b -= 26;
    if (b == 0) {
        return '-';
    }
    if (b == 1) {
        return '_';
    }
    return '?';
}