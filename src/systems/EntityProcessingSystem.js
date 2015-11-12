'use strict';

var EntitySystem = require('./../EntitySystem');

/**
 * Object to manage components
 *
 * @class EntityProcessingSystem
 * @extends EntitySystem
 * @constructor
 * @memberof Systems
 * @param {Aspect} aspect Creates an entity system that uses the specified
 *      aspect as a matcher against entities.
 */
function EntityProcessingSystem(aspect) {
    EntitySystem.call(this, aspect);

    /**
     * @param {Entity} entity
     */
    this.innerProcess = function(entity) {
        // little difference between original framework, js doesn't allow to overload methods :<
    };

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

    /**
     *
     * @returns {boolean}
     */
    this.checkProcessing = function() {
        return true; // because
    };
}

EntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
EntityProcessingSystem.prototype.constructor = EntityProcessingSystem;
module.exports = EntityProcessingSystem;