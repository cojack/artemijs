(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        Position = require('./../components/Position'),
        Bounds = require('./../components/Bounds');

    var CollisionSystem = function CollisionSystem() {
        EntitySystem.call(this, Aspect.getAspectForAll(Position.klass, Bounds.klass));

        /**
         * @property collisionPairs
         * @private
         * @type {Bag}
         */
        var collisionPairs;

        this.processEntities = function(entities) {
            return;
            for(var i = 0; collisionPairs.size() > i; i++) {
                collisionPairs.get(i).checkForCollisions();
            }
        };

        this.checkProcessing = function() {
            return true;
        }
    };

    var CollisionHandler = function CollisionHandler() {
        this.handleCollision = function(foo, bar) {
            throw new Error("Function handleCollision not implemented");
        }
    };

    CollisionSystem.prototype = Object.create(EntitySystem.prototype);
    CollisionSystem.prototype.constructor = CollisionSystem;
    module.exports = CollisionSystem;

})();