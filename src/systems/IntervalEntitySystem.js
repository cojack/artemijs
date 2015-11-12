'use strict';

var EntitySystem = require('./../EntitySystem');

/**
 * A system that processes entities at a interval in milliseconds.
 * A typical usage would be a collision system or physics system.
 *
 * @class IntervalEntitySystem
 * @extends EntitySystem
 * @constructor
 * @param {Aspect} _aspect Creates an entity system that uses the specified
 *      aspect as a matcher against entities.
 * @param {number} interval
 */
var IntervalEntitySystem = function IntervalEntitySystem(aspect, interval) {

    /**
     * @private
     * @member {number}
     */
    interval = interval || 0;

    /**
     * @private
     * @type {number}
     */
    var acc = 0;

    /**
     *
     * @returns {boolean}
     */
    this.checkProcessing = function() {
        acc += this.world.getDelta();
        if(acc >= interval) {
            acc -= interval;
            return true;
        }
        return false;
    };
};

IntervalEntitySystem.prototype = Object.create(EntitySystem.prototype);
IntervalEntitySystem.prototype.constructor = IntervalEntitySystem;
module.exports = IntervalEntitySystem;