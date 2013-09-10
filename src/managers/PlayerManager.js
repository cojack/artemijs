(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Bag = require('./../utils/Bag'),
        Manager = require("./../Manager");
    
    var PlayerManager = function PlayerManager() {
        Manager.call(this);
        
        var playerByEntity = new HashMap(),
            entitiesByPlayer = new HashMap();
            
        this.setPlayer = function(entity, player) {
            playerByEntity.put(entity, player);
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new Bag();
                entitiesByPlayer.put(player, entities);
            }
            entities.add(entity);
        };
        
        this.getEntitiesOfPlayer = function(player) {
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new Bag();
            }
            return entities;
        };
        
        this.removeFromPlayer = function(entity) {
            var player = playerByEntity.get(entity);
            if(player !== null) {
                var entities = entitiesByPlayer.get(player);
                if(entities !== null) {
                    entities.remove(entity);
                }
            }
        };
        
        this.getPlayer = function(entity) {
            return playerByEntity.get(entity);
        };

        this.initialize = function() {};

        this.deleted = function(entity) {
            this.removeFromPlayer(entity);
        };

    };
    
    PlayerManager.prototype = Object.create(Manager.prototype);
    module.exports = PlayerManager;
})();