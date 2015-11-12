'use strict';

var Bag = require('./utils/Bag'),
    BitSet = require('./utils/BitSet'),
    Entity = require('./Entity'),
    Manager = require('./Manager');

/**
 * The entity manager class.
 *
 * @class EntityManager
 * @extends Manager
 * @constructor
 * @memberof ArtemiJS
 */
var EntityManager = function EntityManager() {
    Manager.call(this);

    /**
     * @private
     * @property {Utils.Bag} entities
     */
    var entities = new Bag(),

    /**
     * @private
     * @property {Utils.BitSet} disabled
     */
    disabled = new BitSet(),

    /**
     * @private
     * @property {Number} active
     */
    active = 0,

    /**
     * @private
     * @property {Number} added
     */
    added = 0,

    /**
     * @private
     * @property {Number} created
     */
    created = 0,

    /**
     * @private
     * @property {Number} deleted
     */
    deleted = 0,

    /**
     * @private
     * @property {IdentifierPool} identifierPool
     */
    identifierPool = new IdentifierPool();

    /**
     * Initialize
     *
     */
    this.initialize = function() {};

    /**
     * Create new entity instance
     *
     * @return {ArtemiJS.Entity}
     */
    this.createEntityInstance = function() {
        var entity = new Entity(this.world, identifierPool.checkOut());
        ++created;
        return entity;
    };

    /**
     * Set entity as added for future process
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.added = function(entity) {
        ++active;
        ++added;
        entities.set(entity.getId(), entity);
    };

    /**
     * Set entity as enabled for future process
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.enabled = function(entity) {
        disabled.clear(entity.getId());
    };

    /**
     * Set entity as disabled for future process
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.disabled = function(entity) {
        disabled.set(entity.getId());
    };

    /**
     * Set entity as deleted for future process
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.deleted = function(entity) {
        entities.set(entity.getId(), null);

        disabled.clear(entity.getId());

        identifierPool.checkIn(entity.getId());

        --active;
        ++deleted;
    };

    /**
     * Check if this entity is active.
     * Active means the entity is being actively processed.
     *
     * @param {Number} entityId
     * @return {Boolean} true if active, false if not
     */
    this.isActive = function(entityId) {
        return entities.get(entityId) !== null;
    };

    /**
     * Check if the specified entityId is enabled.
     *
     * @param {Number} entityId
     * @return {Boolean} true if enabled, false if it is disabled
     */
    this.isEnabled = function(entityId) {
        return !disabled.get(entityId);
    };

    /**
     * Get a entity with this id.
     *
     * @param {Number} entityId
     * @return {ArtemiJS.Entity}
     */
    this.getEntity = function(entityId) {
        return entities.get(entityId);
    };

    /**
     * Get how many entities are active in this world.
     *
     * @return {Number} how many entities are currently active.
     */
    this.getActiveEntityCount = function() {
        return active;
    };

   /**
     * Get how many entities have been created in the world since start.
     * Note: A created entity may not have been added to the world, thus
     * created count is always equal or larger than added count.
     *
     * @return {Number} how many entities have been created since start.
     */
    this.getTotalCreated = function() {
        return created;
    };

    /**
     * Get how many entities have been added to the world since start.
     *
     * @return {Number} how many entities have been added.
     */
    this.getTotalAdded = function() {
        return added;
    };

    /**
     * Get how many entities have been deleted from the world since start.
     *
     * @return {Number} how many entities have been deleted since start.
     */
    this.getTotalDeleted = function() {
        return deleted;
    };

    /**
     * Used only internally in EntityManager to generate distinct ids for
     * entities and reuse them
     *
     * @class IdentifierPool
     * @constructor
     */
    function IdentifierPool() {

        /**
         * @property {Utils.Bag} ids
         */
        var ids = new Bag(),

        /**
         * @property {Number} nextAvailableId
         */
        nextAvailableId = 0;

        /**
         * Check an available id
         *
         * @return {Number} next available id
         */
        this.checkOut = function() {
            if(ids.size()) {
                return ids.removeLast();
            }
            return ++nextAvailableId;
        };

        /**
         * Add new id in ids {Bag}
         *
         * @param {Number} id
         */
        this.checkIn = function(id) {
            ids.push(id);
        };
    }
};

EntityManager.prototype = Object.create(Manager.prototype);
EntityManager.prototype.constructor = EntityManager;
module.exports = EntityManager;