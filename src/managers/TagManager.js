(function(ArtemiJS) {
    'use strict';
    
    var TagManager = function() {
        var entitiesByTag = new ArtemiJS.Utils.HashMap(),
            tagsByEntity = new ArtemiJS.Utils.HashMap();

        this.register = function(tag, entity) {
            entitiesByTag.put(tag, entity);
            tagsByEntity.put(entity, tag);
        };

        this.unregister = function(tag) {
            tagsByEntity.remove(entitiesByTag.remove(tag));
        };

        this.isRegistered = function(tag) {
            return entitiesByTag.containsKey(tag);
        };

        this.getEntity = function(tag) {
            return entitiesByTag.get(tag);
        };
        
        this.getRegisteredTags = function() {
            return tagsByEntity.values();
        };
        
        this.deleted = function(entity) {
            var removedTag = tagsByEntity.remove(entity);
            if(removedTag !== null) {
                entitiesByTag.remove(removedTag);
            }
        };

        this.initialize = function() {}
    }; 

    ArtemiJS.Managers.TagManager = TagManager;
    ArtemiJS.Managers.TagManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});