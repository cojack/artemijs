'use strict';

var Manager = require('./../Manager');

/**
 * If you need to tag any entity, use this. A typical usage would be to tag
 * entities such as "PLAYER", "BOSS" or something that is very unique.
 *
 * @class TagManager
 * @extends Manager
 * @constructor
 * @memberof Managers
 */
function TagManager() {
    Manager.call(this);

    /**
     * @private
     * @member {WeakMap}
     */
    var entitiesByTag = new WeakMap(),

    /**
     * @private
     * @member {Map}
     */
    tagsByEntity = new Map();

    /**
     *
     * @param {string} tag
     * @param {Entity} entity
     */
    this.register = function(tag, entity) {
        entitiesByTag.set(tag, entity);
        tagsByEntity.set(entity, tag);
    };

    /**
     * @param {string} tag
     */
    this.unregister = function(tag) {
        var entity = entitiesByTag.get(tag);
        tagsByEntity.delete(entity);
        entitiesByTag.delete(tag);
    };

    /**
     *
     * @param {string} tag
     * @returns {boolean}
     */
    this.isRegistered = function(tag) {
        return entitiesByTag.has(tag);
    };

    /**
     * @param {string} tag
     * @returns {Entity}
     */
    this.getEntity = function(tag) {
        return entitiesByTag.get(tag);
    };

    /**
     *
     * @returns {Iterator.<Entity>}
     */
    this.getRegisteredTags = function() {
        return tagsByEntity.values();
    };

    /**
     *
     * @override
     * @param entity
     */
    this.deleted = function(entity) {
        var removedTag = tagsByEntity.delete(entity);
        if(removedTag !== null) {
            entitiesByTag.delete(removedTag);
        }
    };
}

TagManager.prototype = Object.create(Manager.prototype);
TagManager.prototype.constructor = TagManager;
module.exports = TagManager;