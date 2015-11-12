'use strict';

var Bag = require('./../utils/Bag'),
    Manager = require("./../Manager");

/**
 * You may sometimes want to specify to which player an entity belongs to.
 *
 * An entity can only belong to a single player at a time.
 *
 * @class PlayerManager
 * @extends Manager
 * @constructor
 * @memberof Managers
 */
function PlayerManager() {
    Manager.call(this);

    /**
     * @private
     * @member {WeakMap}
     */
    var playerByEntity = new WeakMap(),

    /**
     * @private
     * @member {Map}
     */
    entitiesByPlayer = new Map();

    /**
     * @param {Entity} entity
     * @param {string} player
     */
    this.setPlayer = function(entity, player) {
        playerByEntity.put(entity, player);
        var entities = entitiesByPlayer.get(player);
        if(entities === null) {
            entities = new Bag();
            entitiesByPlayer.put(player, entities);
        }
        entities.add(entity);
    };

    /**
     *
     * @param {string} player
     * @returns {Bag}
     */
    this.getEntitiesOfPlayer = function(player) {
        var entities = entitiesByPlayer.get(player);
        if(entities === null) {
            entities = new Bag();
        }
        return entities;
    };

    /**
     * @param {Entity} entity
     */
    this.removeFromPlayer = function(entity) {
        var player = playerByEntity.get(entity);
        if(player !== null) {
            var entities = entitiesByPlayer.get(player);
            if(entities !== null) {
                entities.remove(entity);
            }
        }
    };

    /**
     * @param {Entity} entity
     * @returns {string}
     */
    this.getPlayer = function(entity) {
        return playerByEntity.get(entity);
    };

    /**
     * Remove entity from all players related to
     *
     * @param {Entity} entity
     */
    this.deleted = function(entity) {
        this.removeFromPlayer(entity);
    };
}

PlayerManager.prototype = Object.create(Manager.prototype);
PlayerManager.prototype.constructor = PlayerManager;
module.exports = PlayerManager;