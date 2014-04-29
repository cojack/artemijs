(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class DelayedEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var DelayedEntityProcessingSystem = function DelayedEntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
    };
    
    DelayedEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = DelayedEntityProcessingSystem;
})();