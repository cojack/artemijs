var Bag = require('./utils/Bag'),
    Manager = require('./Manager');

/**
 * Object to manage components
 *
 * @class ComponentManager
 * @extends ArtemiJS.Manager
 * @constructor
 * @memberof ArtemiJS
 */
function ComponentManager() {
    Manager.call(this);

    /**
     * @private
     * @property {Utils.Bag} componentsByType
     */
    var componentsByType = new Bag(),

    /**
     * @private
     * @property {Utils.Bag} deleted
     */
    deleted = new Bag();

    /**
     * @private
     * @param {ArtemiJS.Entity} entity
     */
    function removeComponentsOfEntity(entity) {
        var componentBits = entity.getComponentBits();
        for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
            componentsByType.get(i).set(entity.getId(), null);
        }
        componentBits.clear();
    }

    /**
     * Add component by type
     *
     * @param {ArtemiJS.Entity} entity
     * @param {ArtemiJS.ComponentType} type
     * @param {ArtemiJS.Component} component
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
     * @param {ArtemiJS.Entity} entity
     * @param {ArtemiJS.ComponentType} type
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
     * @param {ArtemiJS.ComponentType} type
     * @return {Utils.Bag} Bag of components
     */
    this.getComponentsByType = function(type) {
        var components = componentsByType.get(type.getIndex());
        if(components === null) {
            components = new Bag();
            componentsByType.set(type.getIndex(), components);
        }
        return components;
    };

    /**
     * Get component
     *
     * @param {ArtemiJS.Entity} entity
     * @param {ArtemiJS.ComponentType} type
     * @return {ArtemiJS.Component|null} Mixed Component on success, null on false
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
     * @param {ArtemiJS.Entity} entity
     * @param {Utils.Bag} fillBag Bag of components
     * @return {Utils.Bag} Bag of components
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
     * @param {ArtemiJS.Entity} entity
     */
    this.deleted = function(entity) {
        deleted.add(entity);
    };

    /**
     * Clean deleted components of entities
     */
    this.clean = function() {
        if(deleted.size() > 0) {
            for(var i = 0; deleted.size() > i; i++) {
                removeComponentsOfEntity(deleted.get(i));
            }
            deleted.clear();
        }
    };
}

ComponentManager.prototype = Object.create(Manager.prototype);
ComponentManager.prototype.constructor = ComponentManager;
module.exports = ComponentManager;