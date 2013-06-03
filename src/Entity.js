var ArtemiJS = ArtemiJS || {};

ArtemiJS.Entity = function(_world, _id) {
    var uuid;
    
    var id;
    
    /**
     * @TODO
     */
    var componentBits;
    
    /**
     * @TODO
     */
    var systemBits;
    
    var world;
    var entityManager;
    var componentManager;

    world = _world;
    id = _id;
    entityManager = world.getEntityManager();
    componentManager = world.getComponentManager();
    systemBits = 0;
    componentBits = 0;
    
    reset();
    
    this.getId = function() {
        return id;
    };
    
    this.getComponentBits = function() {
        return componentBits;
    };
    
    this.getSystemBits = function() {
        return systemBits;
    }
    
    function reset() {
        systemBits = 0;
        componentBits = 0;
        uuid = Math.uuid();
    }
    
    this.toString = function() {
        return "Entity [" + id + "]";
    }
    
    this.addComponent = function(component, type) {
        if(!(type instanceof ArtemiJS.ComponentType)) {
            type = ArtemiJS.ComponentType.getTypeFor(component.getClass());
        }
        componentManager.addComponent(this, type, component);
        return this;
    };
    
    this.removeComponent = function(component) {
        var componentType;
        if(!(component instanceof ArtemiJS.ComponentType)) {
            componentType = ArtemiJS.ComponentType.getTypeFor(component);
        } else {
            componentType = component;
        }
        componentManager.removeComponent(this, componentType);
    };
    
    
    this.isActive = function() {
        return entityManager.isActive(this.id);
    };
    
    this.isEnabled = function() {
        return entityManager.isEnabled(this.id);
    };
    
    this.getComponent = function(type) {
        var componentType;
        if(!(type instanceof ArtemiJS.ComponentType)) {
            componentType = ArtemiJS.ComponentType.getTypeFor(type);
        } else {
            componentType = type;
        }
        return componentManager.getComponent(this, componentType);
    };
    
    this.getComponents = function(fillBag) {
        return componentManager.getComponentsFor(this, fillBag);
    };
    
    this.addToWorld = function() {
        world.addEntity(this);
    };
    
    this.changedInWorld = function() {
        world.changedEntity(this);
    };
    
    this.deleteFromWorld = function() {
        world.deleteEntity(this);
    };
    
    this.enable = function() {
        world.enable(this);
    };
    
    this.disable = function() {
        world.disable(this);
    };
    
    this.getUuid = function() {
        return uuid;
    };
    
    this.getWorld = function() {
        return world;
    };
};