(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * If you need to process entities at a certain interval then use this.
     * A typical usage would be to regenerate ammo or health at certain intervals, no need
     * to do that every game loop, but perhaps every 100 ms. or every second.
     * 
     * @module ArtemiJS
     * @class IntervalEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified
     *      aspect as a matcher against entities.
     *
     * @author Arni Arent
     */
    var IntervalEntityProcessingSystem = function IntervalEntityProcessingSystem(_aspect, interval) {
        EntitySystem.call(this, _aspect, interval);

        this.innerProcess = function(entity) {};

        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };
    };
    
    IntervalEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    IntervalEntityProcessingSystem.prototype.constructor = IntervalEntityProcessingSystem;
    module.exports = IntervalEntityProcessingSystem;
})();