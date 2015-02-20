(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ScaleAnimation = require('./../components/ScaleAnimation');

    var ScaleAnimationSystem = function ScaleAnimationSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForOne(ScaleAnimation.klass));

        var sa;
        var sm;

        this.innerProcess = function(entity) {
            var scaleAnimation = sa.get(entity);
            if (scaleAnimation.active) {
                var sprite = sm.get(entity);

                sprite.scaleX += scaleAnimation.speed * this.world.getDelta();
                sprite.scaleY = sprite.scaleX;

                if (sprite.scaleX > scaleAnimation.max) {
                    sprite.scaleX = scaleAnimation.max;
                    scaleAnimation.active = false;
                } else if (sprite.scaleX < scaleAnimation.min) {
                    sprite.scaleX = scaleAnimation.min;
                    scaleAnimation.active = false;
                }
            }
        }
    };

    ScaleAnimationSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    ScaleAnimationSystem.prototype.constructor = ScaleAnimationSystem;
    module.exports = ScaleAnimationSystem;
})();