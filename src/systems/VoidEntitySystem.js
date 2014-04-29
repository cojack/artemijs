(function() {
    'use strict';
    
    var Aspect = require('./../Aspect'),
        EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class VoidEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var VoidEntitySystem = function VoidEntitySystem(_aspect) {
        EntitySystem.call(this, Aspect.getEmpty());
        
        this.processEntities = function(entities) {
            this.processSystem();
        };
        
        this.processSystem = function() {};
        
        this.checkProcessing = function() {
            return true;
        };
    };
    
    VoidEntitySystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = VoidEntitySystem;
})();