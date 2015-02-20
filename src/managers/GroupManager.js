(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Bag = require('./../utils/Bag'),
        Manager = require('./../Manager');
    
    /**
     * If you need to group your entities together, e.g. tanks going into 
     * "units" group or explosions into "effects",
     * then use this manager. You must retrieve it using world instance.
     * 
     * A entity can be assigned to more than one group.
     * 
     * @module ArtemiJS
     * @submodule Managers
     * @class GroupManager
     * @namespace Managers
     * @constructor
     * @extends Manager
     */
    var GroupManager = function GroupManager() {
        Manager.call(this);
        
        /**
         * @private
         * @property entitiesByGroup
         * @type {HashMap}
         */
        var entitiesByGroup = new HashMap(),
        
        /**
         * @private
         * @property groupsByEntity
         * @type {HashMap}
         */
        groupsByEntity = new HashMap();
            
        /**
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * Set the group of the entity.
         * 
         * @method add
         * @param {Entity} entity to add into the group
         * @param {String} group to add the entity into
         */
        this.add = function(entity, group) {
            console.assert(!!entity, "Entity is null or undefined");
            console.assert(group.length > 0, "Group is empty");
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new Bag();
                entitiesByGroup.put(group, entities);
            }
            entities.add(entity);
            
            var groups = groupsByEntity.get(entity);
            if(groups === null) {
                groups = new Bag();
                groupsByEntity.put(entity, groups);
            }
            groups.add(group);
        };
        
        /**
         * Remove the entity from the group.
         * 
         * @method remove
         * @param {Entity} entity to remove from the group
         * @param {String} group to remove from them entity
         */
        this.remove = function(entity, group) {
            console.assert(!!entity, "Entity is null or undefined");
            console.assert(group.length > 0, "Group is empty");
            var entities = entitiesByGroup.get(group);
            if(entities !== null) {
                entities.remove(entity);
            }
            
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                groups.remove(group);
            }
        };
        
        /**
         * Remove the entity from the all groups.
         * 
         * @method removeFromAllGroups
         * @param {Entity} entity to remove from the group
         */
        this.removeFromAllGroups = function(entity) {
            console.assert(!!entity, "Entity is null or undefined");
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                var i = groups.size();
                while(i--) {
                    var entities = entitiesByGroup.get(groups.get(i));
                    if(entities !== null) {
                        entities.remove(entity);
                    }
                }
                groups.clear();
            }
        };
        
        /**
         * Get all entities that belong to the provided group.
         * 
         * @method getEntities
         * @param {String} group name of the group
         * @return {Bag} entities
         */
        this.getEntities = function(group) {
            console.assert(group.length > 0, "Group is empty");
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new Bag();
                entitiesByGroup.put(group, entities);
            }
            return entities;
        };
        
        /**
         * Get all entities from the group
         * 
         * @method getGroups
         * @param {Entity} entity
         */
        this.getGroups = function(entity) {
            console.assert(!!entity, "Entity is null or undefined");
            return groupsByEntity.get(entity);
        };

        /**
         * Check is Entity in any group
         *
         * @param {Entity} entity
         * @returns {boolean}
         */
        this.isInAnyGroup = function(entity) {
            console.assert(!!entity, "Entity is null or undefined");
            return this.getGroups(entity) !== null;
        };

        /**
         * Check is entity in group
         *
         * @param {Entity} entity
         * @param {String} group
         * @returns {boolean}
         */
        this.isInGroup = function(entity, group) {
            console.assert(!!entity, "Entity is null or undefined");
            if(!group) {
                return false;   
            }
            var groups = groupsByEntity.get(entity);
            var i = groups.size();
            while(i--) {
                if(group === groups.get(i)) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Remove entity from all groups related to
         *
         * @param entity
         */
        this.deleted = function(entity) {
            console.assert(!!entity, "Entity is null or undefined");
            this.removeFromAllGroups(entity);
        };
    }; 

    GroupManager.prototype = Object.create(Manager.prototype);
    GroupManager.prototype.constructor = GroupManager;
    module.exports = GroupManager;
})();