var ArtemiJS = ArtemiJS || {};

ArtemiJS.ComponentMapper = function(_type, _world) {
    var type = ArtemiJS.ComponentType.getTypeFor(type),
        components = _world.getComponentManager().getComponentsByType(type);
        
    this.get = function(entity) {
        return components.get(entity.getId());
    };
    
    this.getSafe = function(entity) {
        if(components.isIndexWithinBounds(entity.getId())) {
            return components.get(entity.getId());
        }
        return null;
    };
    
    this.has = function(entity) {
        return this.getSafe(entity) !== null;
    };
};

ArtemiJS.ComponentMapper.getFor = function(type, world) {
    return new ArtemiJS.ComponentMapper(type, world);
};

ArtemiJS.ComponentMapper.prototype = Object.create(ArtemiJS.Component.prototype);