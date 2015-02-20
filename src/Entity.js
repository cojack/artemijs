(function() {
    'use strict';
    
    var BitSet = require('./utils/BitSet'),
        ComponentType = require('./ComponentType');

    /**
     * The entity class. Cannot be instantiated outside the framework, you must
     * create new entities using World.
     * 
     * @module ArtemiJS
     * @class Entity
     * @constructor
     * @param {World} _world
     * @param {Number} _id
     */ 
    function Entity(_world, _id) {
        
        /**
         * @private
         * @property uuid
         * @type {String}
         */
        var uuid,
        
        /**
         * @private
         * @property componentBits
         * @type {Utils.BitSet}
         */
        componentBits = new BitSet(),

        /**
         * @private
         * @property systemBits
         * @type {Utils.BitSet}
         */
        systemBits = new BitSet(),
        
        /**
         * @private
         * @property world
         * @type {World}
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
         * @type {EntityManager}
         */
        entityManager = world.getEntityManager(),
        
        /**
         * @private
         * @property componentManager
         * @type {ComponentManager}
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
         * @return {Utils.BitSet}
         */
        this.getComponentBits = function() {
            return componentBits;
        };
        
        /**
         * Returns a BitSet instance containing bits of the components the entity possesses.
         * 
         * @method getSystemBits
         * @return {Utils.BitSet}
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
            systemBits.clear();
            componentBits.clear();
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
        };
        
        /**
         * Add a component to this entity.
         * 
         * @method addComponent
         * @chainable
         * @param {Component} component
         * @param {ComponentType} [type]
         */
        this.addComponent = function(component, type) {
            if(!(type instanceof ComponentType)) {
                type = ComponentType.getTypeFor(component.getClass());
            }
            componentManager.addComponent(this, type, component);
            return this;
        };
        
        /**
         * Remove component by its type.
         * 
         * @method removeComponent
         * @param {Component} [component]
         */
        this.removeComponent = function(component) {
            var componentType;
            if(!(component instanceof ComponentType)) {
                componentType = ComponentType.getTypeFor(component);
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
         * @param {ComponentType} [type]
         *      in order to retrieve the component fast you must provide a
         *      ComponentType instance for the expected component.
         * @return {ArtemiJS.Component}
         */
        this.getComponent = function(type) {
            var componentType;
            if(!(type instanceof ComponentType)) {
                componentType = ComponentType.getTypeFor(type);
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
         * @param {Utils.Bag} fillBag the bag to put the components into.
         * @return {Utils.Bag} the fillBag with the components in.
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
         * @method deleteFromWorld
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
            world.enableEntity(this);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disable
         */
        this.disable = function() {
            world.disableEntity(this);
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
         * @return {World} world of entities.
         */
        this.getWorld = function() {
            return world;
        };
    }

    module.exports = Entity;
})();