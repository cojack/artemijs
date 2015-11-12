(function() {
    /*global ArtemiJS*/
    
    'use strict';
        var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
            Aspect = ArtemiJS.Aspect,
            Position = require('./../components/Position'),
            Velocity = require('./../components/Velocity');
        
    var MovementSystem = function MovementSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Velocity.klass));
        
        var pm, vm;

        this.initialize = function() {
            pm = this.world.getMapper(Position.klass);
            vm = this.world.getMapper(Velocity.klass);
        };
        
        this.process = function(entity) {
            if(!entity) {
                return;
            }
            var position = pm.get(entity),
                velocity = vm.get(entity);
           
            position.x += velocity.vectorX*this.world.getDelta();
            position.y += velocity.vectorY*this.world.getDelta();
        };
    };
    
    
    MovementSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    MovementSystem.prototype.constructor = MovementSystem;
    module.exports = MovementSystem;
})();