(function() {
    'use strict';

    var Component = require('./Component'),
        ComponentType = require('./ComponentType');

    /**
     * High performance component retrieval from entities. Use this wherever you
     * need to retrieve components from entities often and fast.
     * 
     * @module ArtemiJS
     * @class ComponentMapper
     * @constructor
     * @param {Object} _type
     * @param {ArtemiJS.World} _world
     */
    var ComponentMapper = function ComponentMapper(_type, _world) {
        Component.call(this);
        
        /**
         * @private
         * @property {ArtemiJS.ComponentType} type Type of component
         */
        var type = ComponentType.getTypeFor(_type),
        
        /**
         * @private
         * @param {ArtemiJS.Utils.Bag} components Bag of components
         */
        components = _world.getComponentManager().getComponentsByType(type);
            
        /**
         * Fast but unsafe retrieval of a component for this entity.
         * No bounding checks, so this could return null,
         * however in most scenarios you already know the entity possesses this component.
         * 
         * @method get
         * @param {ArtemiJS.Entity} entity
         * @return {ArtemiJS.Component}|null
         */
        this.get = function(entity) {
            return components.get(entity.getId());
        };
        
        /**
         * Fast and safe retrieval of a component for this entity.
         * If the entity does not have this component then null is returned.
         * 
         * @method getSafe
         * @param {ArtemiJS.Entity} entity
         * @return {ArtemiJS.Component}|null
         */
        this.getSafe = function(entity) {
            if(components.isIndexWithinBounds(entity.getId())) {
                return components.get(entity.getId());
            }
            return null;
        };
        
        /**
         * Checks if the entity has this type of component.
         * 
         * @method has
         * @param {ArtemiJS.Entity} entity
         * @return boolean true if the entity has this component type, false if it doesn't.
         */
        this.has = function(entity) {
            return this.getSafe(entity) !== null;
        };
    };
    
    /**
     * Returns a component mapper for this type of components.
     * 
     * @method getFor
     * @static
     * @param {Object} type the type of components this mapper uses
     * @param {ArtemiJS.World} the world that this component mapper should use
     * @return {ArtemiJS.ComponentMapper}
     */
    ComponentMapper.getFor = function(type, world) {
        return new ComponentMapper(type, world);
    };
    
    ComponentMapper.prototype = Object.create(Component.prototype);
    module.exports.ComponentMapper = ComponentMapper;
})();