
var oldCreateElement = document.createElement;
document.createElement = function (name) {
    if (name === "canvas") {
        return window.__canvas;
    }
    return oldCreateElement(name);
}
CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
}
CanvasRenderingContext2D.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
}
CanvasRenderingContext2D.prototype.clip = function() {   
}
CanvasRenderingContext2D.prototype.setTransform = function (a,b,c,d,e,f) {
}
CanvasRenderingContext2D.prototype.createPattern = function(image, repetition) {    
}

require("js/createjs.js");
require("js/RTStageGL.js");
require("js/game.js");

