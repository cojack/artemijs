(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class IntervalEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var IntervalEntityProcessingSystem = function IntervalEntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
    };
    
    IntervalEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = IntervalEntityProcessingSystem;
})();