// Process block-level uml diagrams
//
'use strict';

const deflate = require('markdown-it-plantuml/lib/deflate.js');

function generateSourceDefault(umlCode, options) {
    var imageFormat = options.imageFormat || 'svg';
    var server = options.server || 'https://www.plantuml.com/plantuml';
    var zippedCode = deflate.encode64(
      deflate.zip_deflate(
        unescape(encodeURIComponent(umlCode)),
        9
      )
    );

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
