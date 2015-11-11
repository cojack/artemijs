(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Manager = require('./../Manager');
    
    var TagManager = function TagManager() {
        Manager.call(this);
        
        var entitiesByTag = new HashMap(),
            tagsByEntity = new HashMap();

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

        this.initialize = function() {};
    }; 

    TagManager.prototype = Object.create(Manager.prototype);
    TagManager.prototype.constructor = TagManager;
    module.exports = TagManager;
})();