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
         * @type {Utils.HashMap}
         */
        var entitiesByGroup = new HashMap(),
        
        /**
         * @private
         * @property groupsByEntity
         * @type {Utils.HashMap}
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
         * @param {String} name of the group
         * @return {Utils.Bag} entities
         */
        this.getEntities = function(group) {
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
            return groupsByEntity.get(entity);
        };
        
        this.isInAnyGroup = function(entity) {
            return this.getGroups(entity) !== null;
        };
        
        this.isInGroup = function(entity, group) {
            group = group || null;
            if(group === null) {
                return false;   
            }
            var groups = groupsByEntity.get(entity);
            var i = groups.size();
            while(i--) {
                if(group === groups.get(i)) {
                    return true;
                }
            }
        };
        
        this.deleted = function(entity) {
            this.removeFromAllGroups(entity);
        };
    }; 

    GroupManager.prototype = Object.create(Manager.prototype);
    module.exports = GroupManager;
})();