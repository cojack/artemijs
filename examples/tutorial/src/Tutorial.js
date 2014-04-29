(function() {
    /* global requestAnimationFrame, ArtemiJS*/
    
    'use strict';
    
    var MovementSystem = require("./systems/MovementSystem");
    
    var Tutorial = function Tutorial() {
        var world = new ArtemiJS.World();
        
        world.setManager(new ArtemiJS.Managers.GroupManager());
        
        world.setSystem(new MovementSystem());

        world.initialize();
        
        var entity = world.createEntity();
        
        entity.addToWorld();


        /**
         * @param Float delta
         */
        this.render = function(delta) {
            world.setDelta(delta);
            world.process();
        };
    };
    
    var game = new Tutorial();
    requestAnimationFrame(game.render);
})();