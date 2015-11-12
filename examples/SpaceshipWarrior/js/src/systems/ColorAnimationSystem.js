(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ColorAnimation = require('./../components/ColorAnimation'),
        Sprite = require('./../components/Sprite');

    var ColorAnimationSystem = function ColorAnimationSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(ColorAnimation.klass, Sprite.klass));

        var cam;
        var sm;

        this.initialize = function() {
            cam = this.world.getMapper(ColorAnimation.klass);
            sm = this.world.getMapper(Sprite.klass);
        }

        this.innerProcess = function(entity) {
            /**
             * @property c
             * @type {ColorAnimation}
             */
            var c = cam.get(entity),

                /**
                 * @property sprite
                 * @type {Sprite}
                 */
                sprite = sm.get(entity);

            if(!c || !sprite) {
                return;
            }

            if(c.alphaAnimate) {
                sprite.a += c.alphaSpeed * this.world.getDelta();

                if(sprite.a > c.alphaMax || sprite.a < c.alphaMin) {
                    if(c.repeat) {
                        c.alphaSpeed = -c.alphaSpeed;
                    } else {
                        c.alphaAnimate = false;
                    }
                }
            }
        }
    };

    ColorAnimationSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    ColorAnimationSystem.prototype.constructor = ColorAnimationSystem;
    module.exports = ColorAnimationSystem;
})();