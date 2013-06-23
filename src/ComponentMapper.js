(function(ArtemiJS) {
    'use strict';

    var ComponentMapper = function(_type, _world) {
        var type = ArtemiJS.ComponentType.getTypeFor(_type),
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
    
    ComponentMapper.getFor = function(type, world) {
        return new ComponentMapper(type, world);
    };
    
    ArtemiJS.ComponentMapper = ComponentMapper;
    ArtemiJS.ComponentMapper.prototype = Object.create(ArtemiJS.Component.prototype);
})(window.ArtemiJS || {});