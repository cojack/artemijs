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

        /**
         *
         * @param {Entity} entity
         */
        this.innerProcess = function(entity) {
            // litle difference between original framework, js doesn't allow to overload methods :<
        };

        /**
         *
         * @param {Bag} entities
         */
        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };
        
        this.checkProcessing = function() {
            return true;   
        };
    };
    
    EntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    EntityProcessingSystem.prototype.constructor = EntityProcessingSystem;
    module.exports = EntityProcessingSystem;
})();