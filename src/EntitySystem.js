(function(ArtemiJS) {
    'use strict';
    
    var SystemIndexManager = {
        INDEX: 0,
        indices: {},
        getIndexFor: function(entitySystem) {
            var index = this.indices[entitySystem];
            if(!index) {
                index = this.INDEX++;
                this.indices[entitySystem] = index;
            }
            return index;
        }
    };
    
    var EntitySystem = function(_aspect) {
        this.world;
        
        var systemIndex = SystemIndexManager.getIndexFor(this.getClass()),
            actives = new ArtemiJS.Bag(),
            aspect = _aspect,
            allSet = aspect.getAllSet(),
            exclusionSet = aspect.getExclusionSet(),
            oneSet = aspect.getOneSet(),
            passive,
            dummy = allSet.isEmpty() && oneSet.isEmpty();
        
        var removeFromSystem = function(entity) {
            actives.remove(entity);
            entity.getSystemBits().clear(systemIndex);
            this.removed(entity);
        };
    
        var insertToSystem = function(entity) {
            actives.add(entity);
            entity.getSystemBits().set(systemIndex);
            this.inserted(entity);
        };
        
        this.begin = function() {};
        
        this.process = function() {
            if(this.checkProcessing()) {
                this.begin();
                this.processEntities(actives);
                this.end();
            }
        };
        
        this.end = function() {};
        
        this.processEntities = function(entities) {};
        
        this.checkProcessing = function() {};
        
        this.inserted = function(entity) {};
        
        this.removed = function(entity) {};
        
        this.check = function(entity) {
            if(dummy) {
                return;
            }
            var contains = entity.getSystemBits().get(systemIndex);
            var interested = true;
            var componentBits = entity.getComponentBits();
            
            if(!allSet.isEmpty()) {
                for (var i = allSet.nextSetBit(0); i >= 0; i = allSet.nextSetBit(i+1)) {
                    if(!componentBits.get(i)) {
                        interested = false;
                        break;
                    }
                }
            }        
            if(!exclusionSet.isEmpty() && interested) {
                    interested = !exclusionSet.intersects(componentBits);
            }
            
            // Check if the entity possesses ANY of the components in the oneSet. If so, the system is interested.
            if(!oneSet.isEmpty()) {
                    interested = oneSet.intersects(componentBits);
            }
    
            if (interested && !contains) {
                    insertToSystem(entity);
            } else if (!interested && contains) {
                    removeFromSystem(entity);
            }
        };
        
        this.added = function(entity) {
                this.check(entity);
        };
        
        this.changed = function(entity) {
            this.check(entity);
        };
        
        this.deleted = function(entity) {
            if(entity.getSystemBits().get(systemIndex)) {
                removeFromSystem(entity);
            }
        };
        
        this.disabled = function(entity) {
            if(entity.getSystemBits().get(systemIndex)) {
                removeFromSystem(entity);
            }
        };
        
        this.enabled = function(entity) {
            this.check(entity);
        };
        
    
        this.setWorld = function(world) {
            this.world = world;
        };
        
        this.isPassive = function() {
            return passive;
        };
    
        this.setPassive = function(passive) {
            this.passive = passive;
        };
        
        this.getActives = function() {
            return actives;
        };
    };
    
    ArtemiJS.EntitySystem = EntitySystem;
    ArtemiJS.EntitySystem.prototype = Object.create(ArtemiJS.EntityObserver.prototype);
})(window.ArtemiJS || {});