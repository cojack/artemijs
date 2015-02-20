(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Health() {
        Component.call(this);

        /**
         * @property health
         * @type {Number}
         */
        this.health;

        /**
         * @property maximumHealth
         * @type {Number}
         */
        this.maximumHealth;
    }

    Health.prototype = Object.create(Component.prototype);
    Health.prototype.constructor = Health;
    module.exports = Health;
})();