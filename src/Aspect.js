(function(ArtemiJS) {
    'use strict';

    /**
     * An Aspects is used by systems as a matcher against entities, to check if a system is
     * interested in an entity. Aspects define what sort of component types an entity must
     * possess, or not possess.
     * 
     * This creates an aspect where an entity must possess A and B and C:
     * Aspect.getAspectForAll(A.class, B.class, C.class)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V.
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V, but must possess one of X or Y or Z.
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
     *
     * You can create and compose aspects in many ways:
     * Aspect.getEmpty().one(X.class, Y.class, Z.class).all(A.class, B.class, C.class).exclude(U.class, V.class)
     * is the same as:
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
     * 
     * @module ArtemiJS
     * @class Aspect
     * @constructor
     */
    var Aspect = function() {
        
        /**
         * @private
         * @property allSet
         * @type {ArtemiJS.Utils.Bag}
         */
        var allSet = new ArtemiJS.Utils.Bag(),
        
        /**
         * @private
         * @property exclusionSet
         * @type {ArtemiJS.Utils.Bag}
         */        
        exclusionSet = new ArtemiJS.Utils.Bag(),
            
        /**
         * @private
         * @property exclusionSet
         * @type {ArtemiJS.Utils.Bag}
         */                
        oneSet = new ArtemiJS.Utils.Bag();
            
        /**
         * @method getAllSet
         * @return {ArtemiJS.Utils.Bag}
         */
        this.getAllSet = function() {
            return allSet;
        };
        
        /**
         * @method getExclusionSet
         * @return {ArtemiJS.Utils.Bag}
         */
        this.getExclusionSet = function() {
            return exclusionSet;
        };
        
        /**
         * @method getOneSet
         * @return {ArtemiJS.Utils.Bag}
         */
        this.getOneSet = function() {
            return oneSet;
        };
        
        /**
         * Returns an aspect where an entity must possess all of the specified component types.
         * 
         * @method all
         * @chainable
         * @param {String} type a required component type
         * @param {String} ...types a required component types
         */
        this.all = function(type) {
            allSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                allSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Excludes all of the specified component types from the aspect. A system will not be
         * interested in an entity that possesses one of the specified exclusion component types.
         * 
         * @method exclude
         * @chainable
         * @param {String} type component type to exclude
         * @param {String} ...types components type to exclude
         */
        this.exclude = function(type) {
            exclusionSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                exclusionSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Returns an aspect where an entity must possess one of the specified component types.
         * 
         * @method one
         * @chainable
         * @param {String} type one of the types the entity must possess
         * @param {String} ...types one of the types the entity must possess
         */
        this.one = function(type) {
            oneSet.set(ArtemiJS.ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                oneSet.set(ArtemiJS.ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Creates an aspect where an entity must possess all of the specified component types.
         * 
         * @method getAspectForAll
         * @param {String} type a required component type
         * @param {String} ...types a required component type
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        this.getAspectForAll = function(type) {
            var aspect = new Aspect();
            aspect.all(type, arguments);
            return aspect;
        };
        
        
        /**
         * Creates an aspect where an entity must possess one of the specified component types.
         * 
         * @method getAspectForOne
         * @param {String} type one of the types the entity must possess
         * @param {String} ...types one of the types the entity must possess
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        this.getAspectForOne = function(type) {
            var aspect = new Aspect();
            aspect.one(type, arguments);
            return aspect;
        };
        
        /**
         * Creates and returns an empty aspect. This can be used if you want a system that processes no entities, but
         * still gets invoked. Typical usages is when you need to create special purpose systems for debug rendering,
         * like rendering FPS, how many entities are active in the world, etc.
         * 
         * You can also use the all, one and exclude methods on this aspect, so if you wanted to create a system that
         * processes only entities possessing just one of the components A or B or C, then you can do:
         * Aspect.getEmpty().one(A,B,C);
         * 
         * @method getEmpty
         * @return {ArtemiJS.Aspect} an empty Aspect that will reject all entities.
         */
        this.getEmpty = function() {
            return new Aspect();
        };
    };
    
    ArtemiJS.Aspect = Aspect;
})(window.ArtemiJS || {});