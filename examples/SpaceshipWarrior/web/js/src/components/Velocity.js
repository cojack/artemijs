(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Velocity() {
        Component.call(this);

        /**
         * @property vector
         * @type {THREE.Vector2}
         */
        this.vector;
    }

    Velocity.prototype = Object.create(Component.prototype);
    Velocity.prototype.constructor = Velocity;
    module.exports = Velocity;
})();