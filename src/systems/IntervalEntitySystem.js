(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * A system that processes entities at a interval in milliseconds.
     * A typical usage would be a collision system or physics system.
     * 
     * @module ArtemiJS
     * @class IntervalEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     * @author Arni Arent
     */
    var IntervalEntitySystem = function IntervalEntitySystem(_aspect, _interval) {

        var acc;

        var interval = _interval;

        EntitySystem.call(this, _aspect);

        this.checkProcessing = function() {
            acc += this.world.getDelta();
            if(acc >= interval) {
                acc -= interval;
                return true;
            }
            return false;
        }
    };
    
    IntervalEntitySystem.prototype = Object.create(EntitySystem.prototype);
    IntervalEntitySystem.prototype.constructor = IntervalEntitySystem;
    module.exports = IntervalEntitySystem;
})();