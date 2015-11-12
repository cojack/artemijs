var BitSet = require('./utils/BitSet'),
    ComponentType = require('./ComponentType');

/**
 * An Aspects is used by systems as a matcher against entities, to check if a system is
 * interested in an entity. Aspects define what sort of component types an entity must
 * possess, or not possess.
 *
 * This creates an aspect where an entity must possess A and B and C:
 * Aspect.getAspectForAll(A.klass, B.klass, C.klass)
 *
 * This creates an aspect where an entity must possess A and B and C, but must not possess U or V.
 * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass)
 *
 * This creates an aspect where an entity must possess A and B and C, but must not possess U or V, but must possess one of X or Y or Z.
 * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass).one(X.klass, Y.klass, Z.klass)
 *
 * You can create and compose aspects in many ways:
 * Aspect.getEmpty().one(X.klass, Y.klass, Z.klass).all(A.klass, B.klass, C.klass).exclude(U.klass, V.klass)
 * is the same as:
 * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass).one(X.klass, Y.klass, Z.klass)
 *
 * @class Aspect
 * @constructor
 * @memberof ArtemiJS
 */
var Aspect = function Aspect() {

    /**
     * @private
     * @property allSet
     * @type {Utils.BitSet}
     */
    var allSet = new BitSet(),

    /**
     * @private
     * @property exclusionSet
     * @type {Utils.BitSet}
     */
    exclusionSet = new BitSet(),

    /**
     * @private
     * @property exclusionSet
     * @type {Utils.BitSet}
     */
    oneSet = new BitSet();

    /**
     * @return {Utils.BitSet}
     */
    this.getAllSet = function() {
        return allSet;
    };

    /**
     * @return {Utils.BitSet}
     */
    this.getExclusionSet = function() {
        return exclusionSet;
    };

    /**
     * @return {Utils.BitSet}
     */
    this.getOneSet = function() {
        return oneSet;
    };

    /**
     * Returns an aspect where an entity must possess all of the specified component types.
     *
     * @param {...string} type - a required component type
     * @return {ArtemiJS.Aspect}
     */
    this.all = function() {
        var len = arguments.length;
        while(len--) {
            allSet.set(ComponentType.getIndexFor(arguments[len]));
        }
        return this;
    };

    /**
     * Excludes all of the specified component types from the aspect. A system will not be
     * interested in an entity that possesses one of the specified exclusion component types.
     *
     * @param {...string} type - component type to exclude
     * @return {Aspect}
     */
    this.exclude = function() {
        var len = arguments.length;
        while(len--) {
            exclusionSet.set(ComponentType.getIndexFor(arguments[len]));
        }
        return this;
    };

    /**
     * Returns an aspect where an entity must possess one of the specified component types.
     *
     * @param {...string} type - one of the types the entity must possess
     * @return {Aspect}
     */
    this.one = function() {
        var len = arguments.length;
        while(len--) {
            oneSet.set(ComponentType.getIndexFor(arguments[len]));
        }
        return this;
    };
};

/**
 * Creates an aspect where an entity must possess all of the specified component types.
 *
 * @param {...string} type - a required component type
 * @return {Aspect} an aspect that can be matched against entities
 */
Aspect.getAspectForAll = function(type) {
    var aspect = new Aspect();
    aspect.all(arguments);
    return aspect;
};


/**
 * Creates an aspect where an entity must possess one of the specified component types.
 *
 * @param {...string} type - one of the types the entity must possess
 * @return {Aspect} an aspect that can be matched against entities
 */
Aspect.getAspectForOne = function(type) {
    var aspect = new Aspect();
    aspect.one(arguments);
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
 * @return {Aspect} an empty Aspect that will reject all entities.
 */
Aspect.getEmpty = function() {
    return new Aspect();
};

module.exports = Aspect;