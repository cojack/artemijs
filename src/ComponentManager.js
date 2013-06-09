var ArtemiJS = ArtemiJS || {};

ArtemiJS.ComponentManager = function() {
    var componentsByType = [],
        deleted = [];
        
    this.initialize = function() {
        
    };
    
    function removeComponentsOfEntity(entity) {
        var componentBits = entity.getComponentBits();
        for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
            componentsByType.get(i).set(entity.getId(), null);
        }
        componentBits.clear();
    }
    
    this.addComponent = function(entity, type, component) {        
        var components = componentsByType.get(type.getIndex());
        if(components === null) {
            components = [];
            componentsByType.set(type.getIndex(), components);
        }
        
        components.set(entity.getId(), component);

        entity.getComponentBits().set(type.getIndex());
    };
    
    this.removeComponent = function(entity, type) {
        if(entity.getComponentBits().get(type.getIndex())) {
            componentsByType.get(type.getIndex()).set(entity.getId(), null);
            entity.getComponentBits().clear(type.getIndex());
        }
    };
    
    this.getComponentsByType = function(type) {
        var components = componentsByType.get(type.getIndex());
        if(components === null) {
            components = [];
            componentsByType.set(type.getIndex(), components);
        }
        return components;
    };
    
    this.getComponent = function(entity, type) {
        var components = componentsByType.get(type.getIndex());
        if(components !== null) {
            return components.get(entity.getId());
        }
        return null;
    };
    
    this.getComponentsFor = function(entity, fillBag) {
        var componentBits = entity.getComponentBits();

        for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
            fillBag.add(componentsByType.get(i).get(entity.getId()));
        }
        
        return fillBag;
    };
    
    this.deleted = function(entity) {
        deleted.add(entity);
    };
    
    this.clean = function() {
        if(deleted.size() > 0) {
            for(var i = 0; deleted.size() > i; i++) {
                removeComponentsOfEntity(deleted.get(i));
            }
            deleted.clear();
        }
    };
};

ArtemiJS.ComponentManager.prototype = Object.create(ArtemiJS.Manager.prototype);