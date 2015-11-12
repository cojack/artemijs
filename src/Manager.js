var EntityObserver = require('./EntityObserver');

/**
 * The entity class. Cannot be instantiated outside the framework, you must
 * create new entities using World.
 *
 * @module ArtemiJS
 * @class Manager
 * @constructor
 */
function Manager() {
    EntityObserver.call(this);

    /**
     * @property world
     * @type {World}
     */
    this.world = null;

   /**
     * Override to implement code that gets executed when systems are
     * initialized.
     *
     */
    this.initialize = function() {};

    /**
     * @param {World} world
     */
    this.setWorld = function(world) {
        this.world = world;
    };

    /**
     * @return {World} world
     */
    this.getWorld = function() {
        return this.world;
    };

    /**
     * Abstract method added
     *
     * @abstract
     * @param {Entity} entity
     */
    this.added = function(entity) {};

    /**
     * Abstract method changed
     *
     * @abstract
     * @param {Entity} entity
     */
    this.changed = function(entity)  {};

    /**
     * Abstract method deleted
     *
     * @abstract
     * @param {Entity} entity
     */
    this.deleted = function(entity)  {};

    /**
     * Abstract method enabled
     *
     * @abstract
     * @param {Entity} entity
     */
    this.enabled = function(entity)  {};

    /**
     * Abstract method disabled
     *
     * @abstract
     * @param {Entity} entity
     */
    this.disabled = function(entity)  {};
}

Manager.prototype = Object.create(EntityObserver.prototype);
Manager.prototype.constructor = Manager;
module.exports = Manager;