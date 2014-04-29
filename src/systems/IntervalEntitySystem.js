(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class IntervalEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var IntervalEntitySystem = function IntervalEntitySystem(_aspect, _interval) {
        EntitySystem.call(this, _aspect);
    };
    
    IntervalEntitySystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = IntervalEntitySystem;
})();