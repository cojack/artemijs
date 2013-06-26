(function(ArtemiJS) {
    'use strict';

    /**
     * 
     * @module ArtemiJS
     * @class ComponentManager
     * @constructor
     */
    var ComponentManager = function() {
        
        /**
         * @private
         * @property componentsByType
         * @type {ArtemiJS.Utils.Bag}
         */
        var componentsByType = new ArtemiJS.Utils.Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {ArtemiJS.Utils.Bag}
         */
        deleted = new ArtemiJS.Utils.Bag();
            
        /**
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * @private
         * @method removeComponentsOfEntity
         * @property {ArtemiJS.Entity} entity
         */
        var removeComponentsOfEntity = function (entity) {
            var componentBits = entity.getComponentBits();
            for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
                componentsByType.get(i).set(entity.getId(), null);
            }
            componentBits.clear();
        };
        
        /**
         * Add component by type
         * 
         * @method addComponent
         * @property {ArtemiJS.Entity} entity
         * @property {ArtemiJS.ComponentType} type
         * @property {ArtemiJS.Component} component
         */
        this.addComponent = function(entity, type, component) {        
            var components = componentsByType.get(type.getIndex());
            if(components === null) {
                components = [];
                componentsByType.set(type.getIndex(), components);
            }
            
            components.set(entity.getId(), component);
    
            entity.getComponentBits().set(type.getIndex());
        };
        
        /**
         * Remove component by type
         * 
         * @method removeComponent
         * @property {ArtemiJS.Entity} entity
         * @property {ArtemiJS.ComponentType} type
         */
        this.removeComponent = function(entity, type) {
            if(entity.getComponentBits().get(type.getIndex())) {
                componentsByType.get(type.getIndex()).set(entity.getId(), null);
                entity.getComponentBits().clear(type.getIndex());
            }
        };
        
        /**
         * Get component by type
         * 
         * @method getComponentsByType
         * @property {ArtemiJS.ComponentType} type
         * @return {ArtemiJS.Utils.Bag} Bag of components
         */        
        this.getComponentsByType = function(type) {
            var components = componentsByType.get(type.getIndex());
            if(components === null) {
                components = new ArtemiJS.Utils.Bag();
                componentsByType.set(type.getIndex(), components);
            }
            return components;
        };
        
        /**
         * Get component
         * 
         * @method getComponent
         * @property {ArtemiJS.Entity} entity
         * @property {ArtemiJS.ComponentType} type
         * @return {ArtemiJS.Component}|null
         */
        this.getComponent = function(entity, type) {
            var components = componentsByType.get(type.getIndex());
            if(components !== null) {
                return components.get(entity.getId());
            }
            return null;
        };
        
        /**
         * Get component for
         * 
         * @method getComponentsFor
         * @property {ArtemiJS.Entity} entity
         * @property {ArtemiJS.Utils.Bag} Bag of components
         * @return {ArtemiJS.Utils.Bag} Bag of components
         */
        this.getComponentsFor = function(entity, fillBag) {
            var componentBits = entity.getComponentBits();
    
            for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
                fillBag.add(componentsByType.get(i).get(entity.getId()));
            }
            
            return fillBag;
        };
        
        /**
         * Add entity to delete componenets of them
         * 
         * @method deleted
         * @property {ArtemiJS.Entity} entity
         */
        this.deleted = function(entity) {
            deleted.add(entity);
        };
        
        /**
         * Clean deleted componenets of entities
         * 
         * @method clean
         */
        this.clean = function() {
            if(deleted.size() > 0) {
                for(var i = 0; deleted.size() > i; i++) {
                    removeComponentsOfEntity(deleted.get(i));
                }
                deleted.clear();
            }
        };
    };
    
    ArtemiJS.ComponentManager = ComponentManager;
    ArtemiJS.ComponentManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});