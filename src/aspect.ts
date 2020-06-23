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
import {ComponentType} from './component-type';
import {Bag} from './utils';

export class Aspect {

        private readonly allSet = new Bag();

        private readonly exclusionSet = new Bag();

        private readonly oneSet = new Bag();

        public getAllSet() {
            return this.allSet;
        };

        public getExclusionSet() {
            return this.exclusionSet;
        };

        public getOneSet() {
            return this.oneSet;
        };

        /**
         * Returns an aspect where an entity must possess all of the specified component types.
         *
         * @method all
         * @chainable
         * @param {String} type* a required component type
         */
        public all(type: string) {
            const idx = ComponentType.getIndexFor(type);
            const component = ComponentType.getTypeFor(type);
            this.allSet.set(idx, component);
            var len = arguments.length;
            while(len--) {
                this.allSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };

        /**
         * Excludes all of the specified component types from the aspect. A system will not be
         * interested in an entity that possesses one of the specified exclusion component types.
         *
         * @method exclude
         * @chainable
         * @param {String} type* component type to exclude
         */
        public exclude(type) {
            this.exclusionSet.set(ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                this.exclusionSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };

        /**
         * Returns an aspect where an entity must possess one of the specified component types.
         *
         * @method one
         * @chainable
         * @param {String} type* one of the types the entity must possess
         */
        public one(type) {
            this.oneSet.set(ComponentType.getIndexFor(type));
            let len = arguments.length;
            while(len--) {
                this.oneSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };

        /**
         * Creates an aspect where an entity must possess all of the specified component types.
         *
         * @method getAspectForAll
         * @param {String} type* a required component type
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        public getAspectForAll(type) {
            var aspect = new Aspect();
            aspect.all(type, arguments);
            return aspect;
        };


        /**
         * Creates an aspect where an entity must possess one of the specified component types.
         *
         * @method getAspectForOne
         * @param {String} type* one of the types the entity must possess
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        public getAspectForOne(type) {
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
        public getEmpty() {
            return new Aspect();
        };
    }
