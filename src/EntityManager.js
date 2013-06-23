(function(ArtemiJS) {
    'use strict';

    var EntityManager = function(_world, _id) {
        var entities = new ArtemiJS.Bag(),
            disabled = new ArtemiJS.BitSet(),
            active,
            added,
            created,
            deleted,  
            identifierPool = new IdentifierPool();
        
        this.initialize = function() {
            
        };
        
        this.createEntityInstance = function() {
            var entity = new ArtemiJS.Entity(this.world, identifierPool.checkOut());
            created++;
            return entity;
        };
        
        this.added = function(entity) {
            active++;
            added++;
            entities.set(entity.getId(), entity);
        };
        
        this.enabled = function(entity) {
            disabled.clear(entity.getId());
        };
        
        this.disabled = function(entity) {
            disabled.set(entity.getId());
        };
        
        this.deleted = function(entity) {
            entities.set(entity.getId(), null);
            
            disabled.clear(entity.getId());
            
            identifierPool.checkIn(entity.getId());
            
            active--;
            deleted++;
        };
        
        this.isActive = function(entityId) {
            return entities.get(entityId) !== null;
        };
        
        this.isEnabled = function(entityId) {
            return !disabled.get(entityId);
        };
        
        this.getEntity = function(entityId) {
            return entities.get(entityId);
        };
        
        this.getActiveEntityCount = function() {
            return active;
        };
    
        this.getTotalCreated = function() {
            return created;
        };
    
        this.getTotalAdded = function() {
            return added;
        };
    
        this.getTotalDeleted = function() {
            return deleted;
        };
      
        function IdentifierPool() {
            var ids = new ArtemiJS.Bag(),
                nextAvailableId = 0;
            
            this.checkOut = function() {
                if(ids.size()) {
                    return ids.removeLast();
                }
                return nextAvailableId++;
            };
            
            this.checkIn = function(id) {
                ids.push(id);
            };
        }
    };
    
    ArtemiJS.EntityManager = EntityManager;
    ArtemiJS.EntityManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});