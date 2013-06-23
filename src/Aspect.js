(function(ArtemiJS) {
    'use strict';
    
    var Aspect = function() {
        var allSet = new ArtemiJS.Bag(),
            exclusionSet = new ArtemiJS.Bag(),
            oneSet = new ArtemiJS.Bag();
            
        this.getAllSet = function() {
            return allSet;
        };
        
        this.getExclusionSet = function() {
            return exclusionSet;
        };
        
        this.getOneSet = function() {
            return oneSet;
        };
        
        this.all = function(type) {
            allSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                allSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        this.exclude = function(type) {
            exclusionSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                exclusionSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        this.one = function(type) {
            oneSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                oneSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        this.getAspectFor = function() {
            return this.getAspectForAll.apply(arguments);
        };
        
        this.getAspectForAll = function(type) {
            var aspect = new Aspect();
            aspect.all(type, arguments);
            return aspect;
        };
        
        this.getAspectForOne = function(type) {
            var aspect = new Aspect();
            aspect.one(type, arguments);
            return aspect;
        };
        
        this.getEmpty = function() {
            return new Aspect();
        };
    };
    
    ArtemiJS.Aspect = Aspect;
})(window.ArtemiJS || {});