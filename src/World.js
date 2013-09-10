(function() {
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
     * @module ArtemiJS
     * @class World
     * @constructor
     */
    var World = function World() {
        
        /**
         * @private
         * @property entityManager
         * @type {EntityManager}
         */
        var entityManager = new EntityManager(),
        
        /**
         * @private
         * @property componentManager
         * @type {ComponentManager}
         */
        componentManager = new ComponentManager(),
        
        /**
         * @private
         * @property manager
         * @type {Object}
         */
        managers = {},
        
        /**
         * @private
         * @property managersBag
         * @type {Utils.Bag}
         */
        managersBag = new Bag(),
        
        /**
         * @private
         * @property systems
         * @type {Object}
         */
        systems = {},
        
        /**
         * @private
         * @property systemsBag
         * @type {Utils.Bag}
         */
        systemsBag = new Bag(),
    
        /**
         * @private
         * @property added
         * @type {Utils.Bag}
         */
        added = new Bag(),
        
        /**
         * @private
         * @property changed
         * @type {Utils.Bag}
         */
        changed = new Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {Utils.Bag}
         */
        deleted = new Bag(),
        
        /**
         * @private
         * @property enable
         * @type {Utils.Bag}
         */
        enable = new Bag(),
        
        /**
         * @private
         * @property disable
         * @type {Utils.Bag}
         */
        disable = new Bag(),
    
        /**
         * @private
         * @property delta
         * @type {Number}
         */
        delta = 0;

        /**
         * Makes sure all managers systems are initialized in the order 
         * they were added
         * 
         * @method initialize
         */
        this.initialize = function() {
            var i = managersBag.size();
            while(i--) {
                managersBag.get(i).initialize();
            }
            i = systemsBag.size();
            while(i--) {
                systemsBag.get(i).initialize();
            }
        };
        
        /**
         * Returns a manager that takes care of all the entities in the world.
         * entities of this world
         * 
         * @method getEntityManager
         * @return {EntityManager} entityManager
         */
        this.getEntityManager = function() {
            return entityManager;
        };
        
        /**
         * Returns a manager that takes care of all the components in the world.
         * 
         * @method getComponentManager
         * @return {ComponentManager} componentManager
         */
        this.getComponentManager = function() {
            return componentManager;
        };
        
        /**
         * Add a manager into this world. It can be retrieved later.
         * World will notify this manager of changes to entity.
         * 
         * @method setManager
         * @param {Manager} manager manager to be added
         * @return {Manager} manager
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
         * @param {String} managerType class type of the manager
         * @return {Manager} manager
         */
        this.getManager = function(managerType) {        
            return managers[managerType] || false;
        };
        
        /**
         * Deletes the manager from this world.
         * 
         * @method deleteManager
         * @param {Manager} manager manager to delete.
         */
        this.deleteManager = function(manager) {
            delete managers[manager.getClass()];
            managersBag.remove(manager);
        };
        
        /**
         * You must specify the delta for the game here.
         * 
         * @method setDelta
         * @param {Number} d time since last game loop.
         */
        this.setDelta = function(d) {
            delta = d;
        };
        
        /**
         * 
         * @method getDelta
         * @return {Number} delta time since last game loop.
         */
        this.getDelta = function() {
            return delta;
        };
        
        /**
         * Adds a entity to this world.
         * 
         * @method addEntity
         * @param {Entity} entity
         */
        this.addEntity = function(entity) {
            added.add(entity);
        };
        
        /**
         * Ensure all systems are notified of changes to this entity.
         * If you're adding a component to an entity after it's been
         * added to the world, then you need to invoke this method.
         * 
         * @method changedEntity
         * @param {Entity} entity
         */
        this.changedEntity = function(entity) {
            changed.add(entity);
        };
        
        /**
         * Delete the entity from the world.
         * 
         * @method deleteEntity
         * @param {Entity} entity
         */
        this.deleteEntity = function(entity) {
            added.remove(entity);
        };
        
        /**
         * (Re)enable the entity in the world, after it having being disabled.
         * Won't do anything unless it was already disabled.
         * 
         * @method enableEntity
         * @param {Entity} entity
         */
        this.enableEntity = function(entity) {
            enable.add(entity);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disableEntity
         * @param {Entity} entity
         */
        this.disableEntity = function(entity) {
            disable.add(entity);
        };
        
        /**
         * Create and return a new or reused entity instance.
         * Will NOT add the entity to the world, use World.addEntity(Entity) for that.
         * 
         * @method createEntity
         * @return {Entity} entity
         */
        this.createEntity = function() {
            return entityManager.createEntityInstance();
        };
        
        /**
         * Get a entity having the specified id.
         * 
         * @method getEntity
         * @param {Number} entityId
         * @return {Entity} entity
         */
        this.getEntity = function(id) {
            return entityManager.getEntity(id);
        };
        
        /**
         * Gives you all the systems in this world for possible iteration.
         * 
         * @method getSystems
         * @return {Mixed} all entity systems in world, other false
         */
        this.getSystems = function() {
            return systemsBag;
        };
        
        /**
         * Adds a system to this world that will be processed by World.process()
         * 
         * @method setSystem
         * @param {EntitySystem} system the system to add.
         * @param {Boolean} [passive] wether or not this system will be processed by World.process()
         * @return {EntitySystem} the added system.
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
         * @method getSystem
         * @param {String} systemType type of system.
         * @return {EntitySystem} instance of the system in this world.
         */
        this.getSystem = function(systemType) {        
            return systems[systemType] || false;
        };
        
        /**
         * Removed the specified system from the world.
         * 
         * @method deleteSystem
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
         * @method notifySystems
         * @param {Object} performer Object with callback perform
         * @param {Entity} entity
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
         * @method notifySystems
         * @param {Object} performer Object with callback perform
         * @param {Entity} entity
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
         * @method check
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
         * @method process
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
         * @method getMapper
         * @param {Object} type of component to get mapper for.
         * @return {ComponentMapper} mapper for specified component type.
         */
        this.getMapper = function(type) {
            return ComponentMapper.getFor(type, this);
        };
        
        this.setManager(componentManager);
        this.setManager(entityManager);
    };
    
    module.exports = World;
})();