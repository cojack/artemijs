(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Bounds() {
        Component.call(this);

        /**
         * @property radius
         * @type {Number}
         */
        this.radius;
    }

    Bounds.prototype = Object.create(Component.prototype);
    Bounds.prototype.constructor = Bounds;
    module.exports = Bounds;
})();