(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    var Position = function Position() {
        Component.call(this);

        /**
         * @property cords
         * @type {THREE.Vector2}
         */
        this.cords;
    };

    Position.prototype = Object.create(Component.prototype);
    Position.prototype.constructor = Position;
    module.exports = Position;
})();