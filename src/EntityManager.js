var ArtemiJS = ArtemiJS || {};

ArtemiJS.EntityManager = function(_world, _id) {
    var entities = [];
    
    /**
     * @TODO
     */
    var disabled;
    
    var active;
    var added;
    var created;
    var deleted;  
    var identifierPool = new IdentifierPool();
    
    this.initialize = function() {
        
    };
    
    this.createEntityInstance = function() {
        var entity = new ArtemiJS.Entity(this.world, identifierPool.checkOut());
        created++;
        return entity;
    };
    
    this.added = function(e) {
        active++;
        added++;
        entities.set(e.getId(), e);
    };
    
    this.enabled = function(e) {
            disabled.clear(e.getId());
    };
    
    this.disabled = function(e) {
            disabled.set(e.getId());
    };
    
    this.deleted = function(e) {
        entities.set(e.getId(), null);
        
        disabled.clear(e.getId());
        
        identifierPool.checkIn(e.getId());
        
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
        var ids = [];
        var nextAvailableId = 0;
        
        this.checkOut = function() {
            if(ids.length) {
                return ids.removeLast();
            }
            return nextAvailableId++;
        };
        
        this.checkIn = function(id) {
            ids.push(id);
        };
    }
};

ArtemiJS.EntityManager.prototype = Object.create(ArtemiJS.Manager.prototype);