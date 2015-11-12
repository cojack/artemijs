(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function ScaleAnimation() {
        Component.call(this);

        /**
         * @property min
         * @type {Number}
         */
        this.min;

        /**
         * @property max
         * @type {Number}
         */
        this.max;

        /**
         * @property speed
         * @type {Number}
         */
        this.speed;

        /**
         * @property repeat
         * @type {boolean}
         */
        this.repeat;

        /**
         * @property active
         * @type {boolean}
         */
        this.active;
    }

    ScaleAnimation.prototype = Object.create(Component.prototype);
    ScaleAnimation.prototype.constructor = ScaleAnimation;
    module.exports = ScaleAnimation;
})();