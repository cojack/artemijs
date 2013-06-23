(function(ArtemiJS) {
    'use strict';
    
    var Manager = function() {
        this.world;
        
        this.initialize = function() {};
    
        this.setWorld = function(world) {
                this.world = world;
        };
    
        this.getWorld = function() {
                return this.world;
        };
        
        this.added = function(entity) {};
        
        this.changed = function(entity)  {};
        
        this.deleted = function(entity)  {};
        
        this.enabled = function(entity)  {};
        
        this.disabled = function(entity)  {}; 
    };
    
    ArtemiJS.Manager = Manager;
    ArtemiJS.Manager.prototype = Object.create(ArtemiJS.EntityObserver.prototype);
})(window.ArtemiJS || {});