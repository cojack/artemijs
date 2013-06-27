(function(ArtemiJS) {
    'use strict';

    /**
     * The entity class. Cannot be instantiated outside the framework, you must
     * create new entities using World.
     * 
     * @module ArtemiJS
     * @class Entity
     * @constructor
     * @param {ArtemiJS.World} _world
     * @param {Number} _id
     */ 
    var Entity = function(_world, _id) {
        
        /**
         * @private
         * @property uuid
         * @type {String}
         */
        var uuid,
        
        /**
         * @private
         * @property componentBits
         * @type {ArtemiJS.BitSet}
         */
        componentBits = new ArtemiJS.BitSet(),

        /**
         * @private
         * @property systemBits
         * @type {ArtemiJS.BitSet}
         */
        systemBits = new ArtemiJS.BitSet(),
        
        /**
         * @private
         * @property world
         * @type {ArtemiJS.World}
         */
        world = _world,
        
        /**
         * @private
         * @property id
         * @type {Number}
         */
        id = _id,
        
        /**
         * @private
         * @property entityManager
         * @type {ArtemiJS.EntityManager}
         */
        entityManager = world.getEntityManager(),
        
        /**
         * @private
         * @property componentManager
         * @type {ArtemiJS.ComponentManager}
         */
        componentManager = world.getComponentManager();
        
        reset();
        
        /**
         * The internal id for this entity within the framework. No other entity
         * will have the same ID, but ID's are however reused so another entity may
         * acquire this ID if the previous entity was deleted.
         * 
         * @method getId
         * @return {Number}
         */
        this.getId = function() {
            return id;
        };
        
        /**
         * Returns a BitSet instance containing bits of the components the entity possesses.
         * 
         * @method getComponentBits
         * @return {ArtemiJS.Utils.BitSet}
         */
        this.getComponentBits = function() {
            return componentBits;
        };
        
        /**
         * Returns a BitSet instance containing bits of the components the entity possesses.
         * 
         * @method getSystemBits
         * @return {ArtemiJS.Utils.BitSet}
         */
        this.getSystemBits = function() {
            return systemBits;
        };
        
        /**
         * Get systems BitSet
         * 
         * @private
         * @method reset
         */
        function reset() {
            systemBits.reset();
            componentBits.reset();
            uuid = Math.uuid();
        }
        
        /**
         * Make entity ready for re-use.
         * Will generate a new uuid for the entity.
         * 
         * @method toString
         * @return {String}
         */
        this.toString = function() {
            return "Entity [" + id + "]";
        }
        
        /**
         * Add a component to this entity.
         * 
         * @method addComponent
         * @chainable
         * @param {ArtemiJS.Component} component
         * @param {Component.Type} type
         */
        this.addComponent = function(component, type) {
            if(!(type instanceof ArtemiJS.ComponentType)) {
                type = ArtemiJS.ComponentType.getTypeFor(component.getClass());
            }
            componentManager.addComponent(this, type, component);
            return this;
        };
        
        /**
         * Remove component by its type.
         * 
         * @method removeComponent
         * @param {ArtemiJS.Component}
         */
        this.removeComponent = function(component) {
            var componentType;
            if(!(component instanceof ArtemiJS.ComponentType)) {
                componentType = ArtemiJS.ComponentType.getTypeFor(component);
            } else {
                componentType = component;
            }
            componentManager.removeComponent(this, componentType);
        };
        
        /**
         * Checks if the entity has been added to the world and has not been deleted from it.
         * If the entity has been disabled this will still return true.
         * 
         * @method isActive
         * @return {Boolean}
         */
        this.isActive = function() {
            return entityManager.isActive(this.id);
        };
        
        /**
         * @method isEnabled
         * @return {Boolean}
         */
        this.isEnabled = function() {
            return entityManager.isEnabled(this.id);
        };
        
        /**
         * This is the preferred method to use when retrieving a component from a
         * entity. It will provide good performance.
         * But the recommended way to retrieve components from an entity is using
         * the ComponentMapper.
         * 
         * @method getComponent
         * @param {ArtemiJS.ComponentType} 
         *      in order to retrieve the component fast you must provide a
         *      ComponentType instance for the expected component.
         * @return {ArtemiJS.Component}
         */
        this.getComponent = function(type) {
            var componentType;
            if(!(type instanceof ArtemiJS.ComponentType)) {
                componentType = ArtemiJS.ComponentType.getTypeFor(type);
            } else {
                componentType = type;
            }
            return componentManager.getComponent(this, componentType);
        };
        
        /**
         * Returns a bag of all components this entity has.
         * You need to reset the bag yourself if you intend to fill it more than once.
         * 
         * @method getComponents
         * @param {ArtemiJS.Utils.Bag} fillBag the bag to put the components into.
         * @return {ArtemiJS.Utils.Bag} the fillBag with the components in.
         */
        this.getComponents = function(fillBag) {
            return componentManager.getComponentsFor(this, fillBag);
        };
        
        /**
         * Refresh all changes to components for this entity. After adding or
         * removing components, you must call this method. It will update all
         * relevant systems. It is typical to call this after adding components to a
         * newly created entity.
         * 
         * @method addToWorld
         */
        this.addToWorld = function() {
            world.addEntity(this);
        };
        
        /**
         * This entity has changed, a component added or deleted.
         * 
         * @method changedInWorld
         */
        this.changedInWorld = function() {
            world.changedEntity(this);
        };
        
        /**
         * Delete this entity from the world.
         * 
         * @method deleteFromWorl
         */
        this.deleteFromWorld = function() {
            world.deleteEntity(this);
        };
        
        /**
         * (Re)enable the entity in the world, after it having being disabled.
         * Won't do anything unless it was already disabled.
         * 
         * @method enable
         */
        this.enable = function() {
            world.enable(this);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disable
         */
        this.disable = function() {
            world.disable(this);
        };
        
        /**
         * Get the UUID for this entity.
         * This UUID is unique per entity (re-used entities get a new UUID).
         * 
         * @method getUuid
         * @return {String} uuid instance for this entity.
         */
        this.getUuid = function() {
            return uuid;
        };
        
        /**
         * Returns the world this entity belongs to.
         * 
         * @method getWorld
         * @return {ArtemiJS.World} world of entity.
         */
        this.getWorld = function() {
            return world;
        };
    };

    ArtemiJS.Entity = Entity;
})(window.ArtemiJS || {});