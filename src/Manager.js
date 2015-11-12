var EntityObserver = require('./EntityObserver');

/**
 * The entity class. Cannot be instantiated outside the framework, you must
 * create new entities using World.
 *
 * @class Manager
 * @extends EntityObserver
 * @constructor
 * @memberof ArtemiJS
 */
function Manager() {
    EntityObserver.call(this);

    /**
     * @property world
     * @type {ArtemiJS.World}
     */
    this.world = null;

   /**
     * Override to implement code that gets executed when systems are
     * initialized.
     *
     */
    this.initialize = function() {};

    /**
     * @param {ArtemiJS.World} world
     */
    this.setWorld = function(world) {
        this.world = world;
    };

    /**
     * @return {ArtemiJS.World} world
     */
    this.getWorld = function() {
        return this.world;
    };

    /**
     * Abstract method added
     *
     * @abstract
     * @param {ArtemiJS.Entity} entity
     */
    this.added = function(entity) {};

    /**
     * Abstract method changed
     *
     * @abstract
     * @param {ArtemiJS.Entity} entity
     */
    this.changed = function(entity)  {};

    /**
     * Abstract method deleted
     *
     * @abstract
     * @param {ArtemiJS.Entity} entity
     */
    this.deleted = function(entity)  {};

    /**
     * Abstract method enabled
     *
     * @abstract
     * @param {ArtemiJS.Entity} entity
     */
    this.enabled = function(entity)  {};

    /**
     * Abstract method disabled
     *
     * @abstract
     * @param {ArtemiJS.Entity} entity
     */
    this.disabled = function(entity)  {};
}

Manager.prototype = Object.create(EntityObserver.prototype);
Manager.prototype.constructor = Manager;
module.exports = Manager;