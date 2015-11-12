(function(){
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Velocity = require("./../components/Velocity"),
        Position = require("./../components/Position"),
        Health = require("./../components/Health"),
        Bounds = require("./../components/Bounds"),
        Player = require("./../components/Player");

    var RemoveOffscreenShipsSystem = function RemoveOffscreenShipsSystem() {
        IntervalEntityProcessingSystem.call(this, Aspect.getAspectForAll(
            Velocity.klass,
            Position.klass,
            Health.klass,
            Bounds.klass
        ).exclude(Player.klass), 5);

        var pm;
        var bm;

        this.innerProcess = function() {
            var position = pm.get(e),
                bounds = bm.get(e);

            if(position.y < - SpaceshipWarrior.FRAME_HEIGHT/2-bounds.radius) {
                e.deleteFromWorld();
            }
        }

    };

    RemoveOffscreenShipsSystem.prototype = Object.create(IntervalEntityProcessingSystem.prototype);
    RemoveOffscreenShipsSystem.prototype.constructor = RemoveOffscreenShipsSystem;
    module.exports = RemoveOffscreenShipsSystem;
})();