'use strict';

var Bag = require('./utils/Bag'),
    EntityObserver = require('./EntityObserver');

/**
 * Used to generate a unique bit for each system.
 * Only used internally in EntitySystem.
 *
 * @class SystemIndexManager
 * @constructor
 * @memberof EntitySystem
 */
var SystemIndexManager = {

    /**
     * @property INDEX
     * @type {Number}
     */
    INDEX: 0,

    /**
     * @property indices
     * @type {Array}
     */
    indices: {},

    /**
     * @param {EntitySystem} entitySystem
     * @return {Number} index
     */
    getIndexFor: function(entitySystem) {
        var index = this.indices[entitySystem];
        if(!index) {
            index = this.INDEX++;
            this.indices[entitySystem] = index;
        }
        return index;
    }
};

/**
 * The most raw entity system. It should not typically be used, but you can
 * create your own entity system handling by extending this. It is
 * recommended that you use the other provided entity system implementations
 *
 * @class EntitySystem
 * @extends EntityObserver
 * @constructor
 * @param {ArtemiJS.Aspect} aspect Creates an entity system that uses the specified
 *      aspect as a matcher against entities.
 * @memberof ArtemiJS
 */
function EntitySystem(aspect) {
    EntityObserver.call(this);

    /**
     * @property {ArtemiJS.World} world
     * @property {Number} systemIndex
     * @property {Utils.Bag} actives
     * @property {Utils.BitSet} allSet
     * @property {Utils.BitSet} exclusionSet
     * @property {Utils.BitSet} oneSet
     * @property {boolean} passive
     * @property {boolean} dummy
     */

    this.world = null;

    var systemIndex = SystemIndexManager.getIndexFor(this.getClass()),
        actives = new Bag(),
        allSet = aspect.getAllSet(),
        exclusionSet = aspect.getExclusionSet(),
        oneSet = aspect.getOneSet(),
        passive,
        dummy = allSet.isEmpty() && oneSet.isEmpty(),
        self = this;

    /**
     * @private
     * @param {ArtemiJS.Entity} entity
     */
    function removeFromSystem(entity) {
        actives.remove(entity);
        entity.getSystemBits().clear(systemIndex);
        self.removed(entity);
    }

    /**
     * @private
     * @param {ArtemiJS.Entity} entity
     */
    function insertToSystem(entity) {
        actives.add(entity);
        entity.getSystemBits().set(systemIndex);
        self.inserted(entity);
    }

    /**
     * Called before processing of entities begins
     *
     */
    this.begin = function() {};

    /**
     * Process the entities
     *
     */
    this.process = function() {
        if(this.checkProcessing()) {
            this.begin();
            this.processEntities(actives);
            this.end();
        }
    };

    /**
     * Called after the processing of entities ends
     *
     */
    this.end = function() {};

    /**
     * Any implementing entity system must implement this method and the
     * logic to process the given entities of the system.
     *
     * @param {Utils.Bag} entities - other entities this system contains
     */
    this.processEntities = function() {};

    /**
     * Check the system should processing
     *
     * @return {Boolean} true if the system should be processed, false if not
     */
    this.checkProcessing = function() {};

    /**
     * Override to implement code that gets executed when systems are
     * initialized.
     *
     */
    this.initialize = function() {};

    /**
     * Called if the system has received a entity it is interested in,
     * e.g. created or a component was added to it.
     *
     * @param {ArtemiJS.Entity} entity - the entity that was added to this system
     */
    this.inserted = function() {};

    /**
     * Called if a entity was removed from this system, e.g. deleted
     * or had one of it's components removed.
     *
     * @param {ArtemiJS.Entity} entity - the entity that was removed from this system.
     */
    this.removed = function() {};

    /**
     * Will check if the entity is of interest to this system.
     *
     * @param {ArtemiJS.Entity} entity the entity to check
     */
    this.check = function(entity) {
        if(dummy) {
            return;
        }
        var contains = entity.getSystemBits().get(systemIndex);
        var interested = true;
        var componentBits = entity.getComponentBits();

        if(!allSet.isEmpty()) {
            for (var i = allSet.nextSetBit(0); i >= 0; i = allSet.nextSetBit(i+1)) {
                if(!componentBits.get(i)) {
                    interested = false;
                    break;
                }
            }
        }
        if(!exclusionSet.isEmpty() && interested) {
            interested = !exclusionSet.intersects(componentBits);
        }

        // Check if the entity possesses ANY of the components in the oneSet. If so, the system is interested.
        if(!oneSet.isEmpty()) {
            interested = oneSet.intersects(componentBits);
        }

        if (interested && !contains) {
            insertToSystem(entity);
        } else if (!interested && contains) {
            removeFromSystem(entity);
        }
    };

    /**
     * @param {ArtemiJS.Entity} entity
     */
    this.added = function(entity) {
        this.check(entity);
    };

    /**
     * @param {ArtemiJS.Entity} entity
     */
    this.changed = function(entity) {
        this.check(entity);
    };

    /**
     * @param {ArtemiJS.Entity} entity
     */
    this.deleted = function(entity) {
        if(entity.getSystemBits().get(systemIndex)) {
            removeFromSystem(entity);
        }
    };

    /**
     * @param {ArtemiJS.Entity} entity
     */
    this.disabled = function(entity) {
        if(entity.getSystemBits().get(systemIndex)) {
            removeFromSystem(entity);
        }
    };

    /**
     * @param {ArtemiJS.Entity} entity
     */
    this.enabled = function(entity) {
        this.check(entity);
    };

    /**
     * @param {ArtemiJS.World} world
     */
    this.setWorld = function(world) {
        this.world = world;
    };

    /**
     * @return {boolean}
     */
    this.isPassive = function() {
        return passive;
    };

    /**
     * @param {boolean} _passive
     */
    this.setPassive = function(_passive) {
        passive = _passive;
    };

    /**
     * @return {Utils.Bag} actives
     */
    this.getActives = function() {
        return actives;
    };
}

EntitySystem.prototype = Object.create(EntityObserver.prototype);
EntitySystem.prototype.constructor = EntitySystem;
module.exports = EntitySystem;