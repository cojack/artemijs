'use strict';

var EntityManager = require('./EntityManager'),
    ComponentManager = require('./ComponentManager'),
    ComponentMapper = require('./ComponentMapper'),
    Bag = require('./utils/Bag');

/**
 * The primary instance for the framework. It contains all the managers.
 * You must use this to create, delete and retrieve entities.
 * It is also important to set the delta each game loop iteration,
 * and initialize before game loop.
 *
 * @class World
 * @constructor
 * @memberof ArtemiJS
 */
function World() {

    console.info("Welcome to ArtemiJS, component oriented framework!");

    /**
     * @property {ArtemiJS.EntityManager} entityManager
     * @property {ArtemiJS.ComponentManager} componentManager
     * @property {Object} manager
     * @property {Utils.Bag} managersBag
     * @property {Object} systems
     * @property {Utils.Bag} systemsBag
     * @property {Utils.Bag} added
     * @property {Utils.Bag} changed
     * @property {Utils.Bag} deleted
     * @property {Utils.Bag} enable
     * @property {Utils.Bag} disable
     * @property {Number} delta
     */

    var entityManager = new EntityManager(),
    componentManager = new ComponentManager(),
    managers = {},
    managersBag = new Bag(),
    systems = {},
    systemsBag = new Bag(),
    added = new Bag(),
    changed = new Bag(),
    deleted = new Bag(),
    enable = new Bag(),
    disable = new Bag(),
    delta = 0;

    /**
     * Makes sure all managers systems are initialized in the order
     * they were added
     *
     */
    this.initialize = function() {
        console.timeStamp("Managers initialization");
        console.groupCollapsed("Managers initialization");
        var i = managersBag.size();
        while(i--) {
            managersBag.get(i).initialize();

        }
        i = systemsBag.size();
        while(i--) {
            systemsBag.get(i).initialize();
        }
        console.groupEnd();
    };

    /**
     * Returns a manager that takes care of all the entities in the world.
     * entities of this world
     *
     * @return {ArtemiJS.EntityManager} entityManager
     */
    this.getEntityManager = function() {
        return entityManager;
    };

    /**
     * Returns a manager that takes care of all the components in the world.
     *
     * @return {ArtemiJS.ComponentManager} componentManager
     */
    this.getComponentManager = function() {
        return componentManager;
    };

    /**
     * Add a manager into this world. It can be retrieved later.
     * World will notify this manager of changes to entity.
     *
     * @param {ArtemiJS.Manager} manager manager to be added
     * @return {ArtemiJS.Manager} manager
     */
    this.setManager = function(manager) {
        manager.setWorld(this);

        managers[manager.getClass()] = manager;
        managersBag.add(manager);

        return manager;
    };

    /**
     * Returns a manager of the specified type.
     *
     * @param {string} managerType class type of the manager
     * @return {ArtemiJS.Manager} manager
     */
    this.getManager = function(managerType) {
        return managers[managerType] || false;
    };

    /**
     * Deletes the manager from this world.
     *
     * @param {ArtemiJS.Manager} manager manager to delete.
     */
    this.deleteManager = function(manager) {
        delete managers[manager.getClass()];
        managersBag.remove(manager);
    };

    /**
     * You must specify the delta for the game here.
     *
     * @param {Number} d time since last game loop.
     */
    this.setDelta = function(d) {
        delta = d;
    };

    /**
     *
     * @return {Number} delta time since last game loop.
     */
    this.getDelta = function() {
        return delta;
    };

    /**
     * Adds a entity to this world.
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.addEntity = function(entity) {
        added.add(entity);
    };

    /**
     * Ensure all systems are notified of changes to this entity.
     * If you're adding a component to an entity after it's been
     * added to the world, then you need to invoke this method.
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.changedEntity = function(entity) {
        changed.add(entity);
    };

    /**
     * Delete the entity from the world.
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.deleteEntity = function(entity) {
        added.remove(entity);
    };

    /**
     * (Re)enable the entity in the world, after it having being disabled.
     * Won't do anything unless it was already disabled.
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.enableEntity = function(entity) {
        enable.add(entity);
    };

    /**
     * Disable the entity from being processed. Won't delete it, it will
     * continue to exist but won't get processed.
     *
     * @param {ArtemiJS.Entity} entity
     */
    this.disableEntity = function(entity) {
        disable.add(entity);
    };

    /**
     * Create and return a new or reused entity instance.
     * Will NOT add the entity to the world, use World.addEntity(Entity) for that.
     *
     * @return {ArtemiJS.Entity} entity
     */
    this.createEntity = function() {
        return entityManager.createEntityInstance();
    };

    /**
     * Get a entity having the specified id.
     *
     * @param {Number} id entity id
     * @return {ArtemiJS.Entity} entity
     */
    this.getEntity = function(id) {
        return entityManager.getEntity(id);
    };

    /**
     * Gives you all the systems in this world for possible iteration.
     *
     * @return {*} all entity systems in world, other false
     */
    this.getSystems = function() {
        return systemsBag;
    };

    /**
     * Adds a system to this world that will be processed by World.process()
     *
     * @param {ArtemiJS.EntitySystem} system the system to add.
     * @param {boolean} [passive] whether or not this system will be processed by World.process()
     * @return {ArtemiJS.EntitySystem} the added system.
     */
    this.setSystem = function(system, passive) {
        passive = passive || false;

        system.setWorld(this);
        system.setPassive(passive);

        systems[system.getClass()] = system;
        systemsBag.add(system);

        return system;
    };

    /**
     * Retrieve a system for specified system type.
     *
     * @param {string} systemType type of system.
     * @return {ArtemiJS.EntitySystem} instance of the system in this world.
     */
    this.getSystem = function(systemType) {
        return systems[systemType] || false;
    };

    /**
     * Removed the specified system from the world.
     *
     * @param system to be deleted from world.
     */
    this.deleteSystem = function(system) {
        delete systems[system.getClass()];
        systemsBag.remove(system);
    };

    /**
     * Notify all the systems
     *
     * @private
     * @param {Object} performer Object with callback perform
     * @param {ArtemiJS.Entity} entity
     */
    function notifySystems(performer, entity) {
        var i = systemsBag.size();
        while(i--) {
            performer.perform(systemsBag.get(i), entity);
        }
    }

    /**
     * Notify all the managers
     *
     * @private
     * @param {Object} performer Object with callback perform
     * @param {ArtemiJS.Entity} entity
     */
    function notifyManagers(performer, entity) {
        var i = managersBag.size();
        while(i--) {
            performer.perform(managersBag.get(i), entity);
        }
    }

    /**
     * Performs an action on each entity.
     *
     * @private
     * @param {Utils.Bag} entities
     * @param {Object} performer
     */
    function check(entities, performer) {
        if(!entities.size()) {
            return;
        }
        var i = entities.size();
        while(i--) {
            var entity = entities.get(i);
            notifyManagers(performer, entity);
            notifySystems(performer, entity);
        }

        entities.clear();
    }

    /**
     * Process all non-passive systems.
     *
     */
    this.process = function() {
        check(added, {
            perform: function(observer, entity) {
                observer.added(entity);
            }
        });

        check(changed, {
            perform: function(observer, entity) {
                observer.changed(entity);
            }
        });

        check(disable, {
            perform: function(observer, entity) {
                observer.disabled(entity);
            }
        });

        check(enable, {
            perform: function(observer, entity) {
                observer.enabled(entity);
            }
        });

        check(deleted, {
            perform: function (observer, entity) {
                observer.deleted(entity);
            }
        });

        componentManager.clean();

        var i = systemsBag.size();
        while(i--) {
            var system = systemsBag.get(i);
            if(!system.isPassive()) {
                system.process();
            }
        }
    };

    /**
     * Retrieves a ComponentMapper instance for fast retrieval
     * of components from entities.
     *
     * @param {Object} type of component to get mapper for.
     * @return {ComponentMapper} mapper for specified component type.
     */
    this.getMapper = function(type) {
        return ComponentMapper.getFor(type, this);
    };

    this.setManager(componentManager);
    this.setManager(entityManager);
}

module.exports = World;