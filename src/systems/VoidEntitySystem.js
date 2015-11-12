'use strict';

var Aspect = require('./../Aspect'),
    EntitySystem = require('./../EntitySystem');

/**
 * Object to manage components
 *
 * @class VoidEntitySystem
 * @extemds EntitySystem
 * @constructor
 * @memberof Systems
 */
var VoidEntitySystem = function VoidEntitySystem() {
    EntitySystem.call(this, Aspect.getEmpty());

    /**
     * @param entities
     */
    this.processEntities = function(entities) {
        this.processSystem();
    };

    /**
     *
     */
    this.processSystem = function() {};

    /**
     * @returns {boolean}
     */
    this.checkProcessing = function() {
        return true;
    };
};

VoidEntitySystem.prototype = Object.create(EntitySystem.prototype);
VoidEntitySystem.prototype.constructor = VoidEntitySystem;
module.exports = VoidEntitySystem;