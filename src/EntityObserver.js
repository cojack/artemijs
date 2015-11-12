'use strict';

/**
 * The entity observer class.
 *
 * @module ArtemiJS
 * @class EntityObserver
 * @constructor
 */
function EntityObserver() {

    /**
     * Abstract method added
     *
     * @abstract
     * @param {Entity} entity
     */
    this.added = function(entity) {
        throw new Error('EntityObserver function added not implemented');
    };

    /**
     * Abstract method changed
     *
     * @abstract
     * @param {Entity} entity
     */
    this.changed = function(entity)  {
        throw new Error('EntityObserver function changed not implemented');
    };

    /**
     * Abstract method deleted
     *
     * @abstract
     * @param {Entity} entity
     */
    this.deleted = function(entity)  {
        throw new Error('EntityObserver function deleted not implemented');
    };

    /**
     * Abstract method enabled
     *
     * @abstract
     * @param {Entity} entity
     */
    this.enabled = function(entity)  {
        throw new Error('EntityObserver function enabled not implemented');
    };

    /**
     * Abstract method disabled
     *
     * @abstract
     * @param {Entity} entity
     */
    this.disabled = function(entity)  {
        throw new Error('EntityObserver function disabled not implemented');
    };
}

module.exports = EntityObserver;