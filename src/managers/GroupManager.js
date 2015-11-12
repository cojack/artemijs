'use strict';

var Bag = require('./../utils/Bag'),
    Manager = require('./../Manager');

/**
 * If you need to group your entities together, e.g. tanks going into
 * "units" group or explosions into "effects",
 * then use this manager. You must retrieve it using world instance.
 *
 * A entity can be assigned to more than one group.
 *
 * @class GroupManager
 * @extends Manager
 * @constructor
 * @memberof Managers
 */
function GroupManager() {
    Manager.call(this);

    /**
     * @private
     * @member {Map}
     */
    var entitiesByGroup = new Map(),

    /**
     * @private
     * @member {WeakMap}
     */
    groupsByEntity = new WeakMap();

    /**
     * Set the group of the entity.
     *
     * @param {Entity} entity to add into the group
     * @param {string} group to add the entity into
     */
    this.add = function (entity, group) {
        console.assert(!!entity, "Entity is null or undefined");
        console.assert(group.length > 0, "Group is empty");

        var entities = entitiesByGroup.get(group);
        if (!entities) {
            entities = new Bag();
            entitiesByGroup.set(group, entities);
        }
        entities.add(entity);

        var groups = groupsByEntity.get(entity);
        if (!groups) {
            groups = new Bag();
            groupsByEntity.set(entity, groups);
        }
        groups.add(group);
    };

    /**
     * Remove the entity from the group.
     *
     * @param {Entity} entity to remove from the group
     * @param {string} group to remove from them entity
     */
    this.remove = function (entity, group) {
        console.assert(!!entity, "Entity is null or undefined");
        console.assert(group.length > 0, "Group is empty");
        var entities = entitiesByGroup.get(group);
        if (entities) {
            entities.delete(entity);
        }

        var groups = groupsByEntity.get(entity);
        if (groups) {
            groups.delete(group);
        }
    };

    /**
     * Remove the entity from the all groups.
     *
     * @param {Entity} entity to remove from the group
     */
    this.removeFromAllGroups = function (entity) {
        console.assert(!!entity, "Entity is null or undefined");
        var groups = groupsByEntity.get(entity);
        if (!groups) {
            return this;
        }
        var i = groups.size();
        while (i--) {
            var entities = entitiesByGroup.get(groups.get(i));
            if (entities) {
                entities.remove(entity);
            }
        }
        groups.clear();
    };

    /**
     * Get all entities that belong to the provided group.
     *
     * @param {string} group name of the group
     * @return {Bag} entities
     */
    this.getEntities = function (group) {
        console.assert(group.length > 0, "Group is empty");
        var entities = entitiesByGroup.get(group);
        if (!entities) {
            entities = new Bag();
            entitiesByGroup.put(group, entities);
        }
        return entities;
    };

    /**
     * Get all entities from the group
     *
     * @param {Entity} entity
     * @return {Bag} entities
     */
    this.getGroups = function (entity) {
        console.assert(!!entity, "Entity is null or undefined");
        return groupsByEntity.get(entity);
    };

    /**
     * Check is Entity in any group
     *
     * @param {Entity} entity
     * @returns {boolean}
     */
    this.isInAnyGroup = function (entity) {
        console.assert(!!entity, "Entity is null or undefined");
        return groupsByEntity.has(entity);
    };

    /**
     * Check if entity is in group
     *
     * @param {Entity} entity
     * @param {string} group
     * @returns {boolean}
     */
    this.isInGroup = function (entity, group) {
        console.assert(!!entity, "Entity is null or undefined");
        if (!group) {
            return false;
        }
        var groups = groupsByEntity.get(entity);
        var i = groups.size();
        while (i--) {
            if (group === groups.get(i)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Remove entity from all groups related to
     *
     * @param {Entity} entity
     */
    this.deleted = function (entity) {
        this.removeFromAllGroups(entity);
    };
}

GroupManager.prototype = Object.create(Manager.prototype);
GroupManager.prototype.constructor = GroupManager;
module.exports = GroupManager;