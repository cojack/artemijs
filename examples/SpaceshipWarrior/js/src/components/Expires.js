(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Expires() {
        Component.call(this);

        /**
         * @property delay
         * @type {Number}
         */
        this.delay;
    }

    Expires.prototype = Object.create(Component.prototype);
    Expires.prototype.constructor = Expires;
    module.exports = Expires;
})();