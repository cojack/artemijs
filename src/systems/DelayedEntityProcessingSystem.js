'use strict';

var EntitySystem = require('./../EntitySystem');

/**
 * Object to manage components
 *
 * @class DelayedEntityProcessingSystem
 * @extends EntitySystem
 * @constructor
 * @memberof Systems
 * @param {Aspect} aspect Creates an entity system that uses the specified
 *      aspect as a matcher against entities.
 */
function DelayedEntityProcessingSystem(aspect) {
    EntitySystem.call(this, aspect);
}

DelayedEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
DelayedEntityProcessingSystem.prototype.constructor = DelayedEntityProcessingSystem;
module.exports = DelayedEntityProcessingSystem;