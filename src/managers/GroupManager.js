(function(ArtemiJS) {
    'use strict';
    
    var GroupManager = function() {
        var entitiesByGroup = new ArtemiJS.Utils.HashMap(),
            groupsByEntity = new ArtemiJS.Utils.HashMap();
            
        this.initialize = function() {};
        
        this.add = function(entity, group) {
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new ArtemiJS.Bag();
                entitiesByGroup.put(group, entities);
            }
            entities.add(entity);
            
            var groups = groupsByEntity.get(entity);
            if(groups === null) {
                groups = new ArtemiJS.Bag();
                groupsByEntity.put(entity, groups);
            }
            groups.add(group);
        };
        
        this.remove = function(entity, group) {
            var entities = entitiesByGroup.get(group);
            if(entities !== null) {
                entities.remove(entity);
            }
            
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                groups.remove(group);
            }
        };
        
        this.removeFromAllGroups = function(entity) {
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                var i = groups.size();
                while(i--) {
                    var entities = entitiesByGroup.get(groups.get(i));
                    if(entities !== null) {
                        entities.remove(entity);
                    }
                }
                groups.clear();
            }
        };
        
        this.getEntities = function(group) {
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new ArtemiJS.Utils.Bag();
                entitiesByGroup.put(group, entities);
            }
            return entities;
        };
        
        this.getGroups = function(entity) {
            return groupsByEntity.get(entity);
        };
        
        this.isInAnyGroup = function(entity) {
            return this.getGroups(entity) !== null;
        };
        
        this.isInGroup = function(entity, group) {
            group = group || null;
            if(group === null) {
                return false;   
            }
            var groups = groupsByEntity.get(entity);
            var i = groups.size();
            while(i--) {
                if(group === groups.get(i)) {
                    return true;
                }
            }
        };
        
        this.deleted = function(entity) {
            this.removeFromAllGroups(entity);
        };
    }; 

    ArtemiJS.Managers.GroupManager = GroupManager;
    ArtemiJS.Managers.GroupManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});