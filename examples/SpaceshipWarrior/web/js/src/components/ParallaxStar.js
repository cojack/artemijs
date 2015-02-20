(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function ParallaxStar() {
        Component.call(this);
    }

    ParallaxStar.prototype = Object.create(Component.prototype);
    ParallaxStar.prototype.constructor = ParallaxStar;
    module.exports = ParallaxStar;
})();