(function(ArtemiJS) {
    'use strict';
    
    var PlayerManager = function() {
        var playerByEntity = new ArtemiJS.Utils.HashMap(),
            entitiesByPlayer = new ArtemiJS.Utils.HashMap();
            
        this.setPlayer = function(entity, player) {
            playerByEntity.put(entity, player);
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new ArtemiJS.Utils.Bag();
                entitiesByPlayer.put(player, entities);
            }
            entities.add(entity);
        };
        
        this.getEntitiesOfPlayer = function(player) {
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new ArtemiJS.Utils.Bag();
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
    
    ArtemiJS.Managers.PlayerManager = PlayerManager;
    ArtemiJS.Managers.PlayerManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});