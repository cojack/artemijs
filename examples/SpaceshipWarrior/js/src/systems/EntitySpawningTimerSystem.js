(function() {
    'use strict';

    var VoidEntitySystem = ArtemiJS.Systems.VoidEntitySystem,
        Timer = ArtemiJS.Utils.Timer;

    var EntitySpawningTimerSystem = function EntitySpawningTimerSystem() {
        VoidEntitySystem.call(this);

        /**
         * @property timer1
         * @private
         * @type {Timer}
         */
        var timer1

        /**
         * @property timer2
         * @private
         * @type {Timer}
         */
        var timer2;

        /**
         * @property timer3
         * @private
         * @type {Timer}
         */
        var timer3;

        this.initialize = function() {

        }

        this.processEntities = function() {
            return;
            timer1.update(this.world.getDelta());
            timer2.update(this.world.getDelta());
            timer3.update(this.world.getDelta());
        }
    };

    EntitySpawningTimerSystem.prototype = Object.create(VoidEntitySystem.prototype);
    EntitySpawningTimerSystem.prototype.constructor = EntitySpawningTimerSystem;

    module.exports = EntitySpawningTimerSystem;
})();