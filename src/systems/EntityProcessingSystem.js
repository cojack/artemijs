(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class EntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var EntityProcessingSystem = function EntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
        
        this.process = function() {
            
        };
        
        this.processEntities = function(entities) {
            var i = entities.size();
            while(--i) {
                process(entities.get(i));
            }
        };
        
        this.checkProcessing = function() {
            return true;   
        };
    };
    
    EntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = EntityProcessingSystem;
})();