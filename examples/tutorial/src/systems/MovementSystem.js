(function() {
    /*global ArtemiJS*/
    
    'use strict';
        var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
            Aspect = ArtemiJS.Aspect;
        
    var MovementSystem = function MovementSystem() {
        EntityProcessingSystem.call(this, Aspect.getEmpty());
        
        var pm, vm;
        
        this.process = function(entity) {
            console.log('what im doing here?');
            
            /*var position = pm.get(entity),
                velocity = vm.get(entity);
           
            position.x += velocity.vectorX*this.world.delta;
            position.y += velocity.vectorY*this.world.delta;*/
        };
    };
    
    
    MovementSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    module.exports = MovementSystem;
})();