'use strict';

var IntervalEntitySystem = require('./IntervalEntitySystem');

/**
 * If you need to process entities at a certain interval then use this.
 * A typical usage would be to regenerate ammo or health at certain intervals, no need
 * to do that every game loop, but perhaps every 100 ms. or every second.
 *
 * @class IntervalEntityProcessingSystem
 * @extend IntervalEntitySystem
 * @constructor
 * @memberof Systems
 * @param {Aspect} _aspect Creates an entity system that uses the specified
 *      aspect as a matcher against entities.
 * @param {number} interval
 */
function IntervalEntityProcessingSystem(_aspect, interval) {
    IntervalEntitySystem.call(this, _aspect, interval);

    /**
     * @param entity
     */
    this.innerProcess = function(entity) {};

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
}

IntervalEntityProcessingSystem.prototype = Object.create(IntervalEntitySystem.prototype);
IntervalEntityProcessingSystem.prototype.constructor = IntervalEntityProcessingSystem;
module.exports = IntervalEntityProcessingSystem;