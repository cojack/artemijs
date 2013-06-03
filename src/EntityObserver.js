var ArtemiJS = ArtemiJS || {};

ArtemiJS.EntityObserver = function() {
    this.added = function(entity) {
        throw new Error('EntityObserver function added not implemented');
    };
    
    this.changed = function(entity)  {
        throw new Error('EntityObserver function changed not implemented');
    };
    
    this.deleted = function(entity)  {
        throw new Error('EntityObserver function deleted not implemented');
    };
    
    this.enabled = function(entity)  {
        throw new Error('EntityObserver function enabled not implemented');
    };
    
    this.disabled = function(entity)  {
        throw new Error('EntityObserver function disabled not implemented');
    };
};