(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    /**
     * @class ColorAnimation
     * @constructor
     */
    var ColorAnimation = function ColorAnimation() {
        Component.call(this);


        this.redMin,
            this.redMax,
            this.redSpeed;
        this.greenMin,
            this.greenMax,
            this.greenSpeed;
        this.blueMin,
            this.blueMax,
            this.blueSpeed;
        this.alphaMin,
            this.alphaMax,
            this.alphaSpeed;

        this.redAnimate,
            this.greenAnimate,
            this.blueAnimate,
            this.alphaAnimate,
            this.repeat;

    };

    ColorAnimation.prototype = Object.create(Component.prototype);
    ColorAnimation.prototype.constructor = ColorAnimation;
    module.exports = ColorAnimation;
})();