(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        MathUtils = require('./../utils/MathUtils'),
        Position = require('./../components/Position'),
        Sprite = require('./../components/Sprite');

    var SpriteRenderSystem = function SpriteRenderSystem(webgl) {
        EntitySystem.call(this, Aspect.getAspectForAll(Position.klass, Sprite.klass));

        /**
         * @type ComponentMapper<Position>;
         */
        var pm;

        /**
         * @type ComponentMapper<Sprite>
         */
        var sm;

        this.initialize = function() {
            pm = this.world.getMapper(Position.klass);
            sm = this.world.getMapper(Sprite.klass);
        };

        this.checkProcessing = function() {
            return true;
        };

        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };

        this.innerProcess = function(entity) {
            if(!pm.has(entity)) {
                return;
            }

            var position = pm.get(entity);
            var sprite = sm.get(entity);

            sprite.source.position.set(position.x, position.y, position.z);
            if(position.vector) {
                sprite.source.material.rotation = MathUtils.angle(
                    position.vector.x,
                    sprite.source.position.x,
                    position.vector.y,
                    sprite.source.position.y
                );
            }
        };

        this.inserted = function(entity) {
            var sprite = sm.get(entity);
            if(sprite) {
                webgl.scene.add(sprite.source);
            }
        }
    };

    SpriteRenderSystem.prototype = Object.create(EntitySystem.prototype);
    SpriteRenderSystem.prototype.constructor = SpriteRenderSystem;
    module.exports = SpriteRenderSystem;
})();