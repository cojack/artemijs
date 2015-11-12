(function() {
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ParallaxStar = require('./../components/ParallaxStar'),
        Position = require('./../components/Position');

    var ParallaxStarRepeatingSystem = function ParallaxStarRepeatingSystem() {
        IntervalEntityProcessingSystem.call(this, Aspect.getAspectForAll(ParallaxStar.klass, Position.klass), 1);


        var pm;


        this.innerProcess = function(entity) {
            var position = pm.get(entity);
            if (position.y < -SpaceshipWarrior.FRAME_HEIGHT / 2) {
                position.y = SpaceshipWarrior.FRAME_HEIGHT / 2;
            }
        }

    };

    ParallaxStarRepeatingSystem.prototype = Object.create(IntervalEntityProcessingSystem.prototype);
    ParallaxStarRepeatingSystem.prototype.constructor = ParallaxStarRepeatingSystem;
    module.exports = ParallaxStarRepeatingSystem;
})();