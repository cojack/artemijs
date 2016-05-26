(function(ArtemiJS) {
    'use strict';

    var Component = ArtemiJS.Component;

    function Bullet() {
        Component.call(this);
    }

    Bullet.prototype = Object.create(Component.prototype);
    Bullet.prototype.constructor = Bullet;
    module.exports = Bullet;
}(window.ArtemiJS));