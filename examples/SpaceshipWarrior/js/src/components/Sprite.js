(function() {
   'use strict';

    var Component = ArtemiJS.Component;

    var Sprite = function Sprite() {
        Component.call(this);

        this.source = null;
    };

    Sprite.prototype = Object.create(Sprite.prototype);
    Sprite.prototype.constructor = Sprite;
    module.exports = Sprite;
})();