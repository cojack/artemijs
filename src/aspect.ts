import BitSet from 'fast-bitset';
import {Component} from './component';
import {ComponentType} from './component-type';
import {BITS_PER_WORD, Constructor} from './utils';

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
 */
export class Aspect {

	private readonly allSet = new BitSet(BITS_PER_WORD);

	private readonly exclusionSet = new BitSet(BITS_PER_WORD);

	private readonly oneSet = new BitSet(BITS_PER_WORD);

	public getAllSet(): BitSet {
		return this.allSet;
	}

	public getExclusionSet(): BitSet {
		return this.exclusionSet;
	}

	public getOneSet(): BitSet {
		return this.oneSet;
	}

	/**
	 * Returns an aspect where an entity must possess all of the specified component types.
	 */
	public all(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		this.allSet.set(ComponentType.getIndexFor(type));

		for (const t of types) {
			this.allSet.set(ComponentType.getIndexFor(t));
		}
		return this;
	}

	/**
	 * Excludes all of the specified component types from the aspect. A system will not be
	 * interested in an entity that possesses one of the specified exclusion component types.
	 */
	public exclude(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		this.exclusionSet.set(ComponentType.getIndexFor(type));

		for (const t of types) {
			this.exclusionSet.set(ComponentType.getIndexFor(t));
		}
		return this;
	}

	/**
	 * Returns an aspect where an entity must possess one of the specified component types.
	 */
	public one(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		this.oneSet.set(ComponentType.getIndexFor(type));

		for (const t of types) {
			this.oneSet.set(ComponentType.getIndexFor(t));
		}
		return this;
	}

	public static getAspectFor(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		return this.getAspectForAll(type, ...types);
	}

	/**
	 * Creates an aspect where an entity must possess all of the specified component types.
	 */
	public static getAspectForAll(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		const aspect = new Aspect();
		aspect.all(type, ...types);
		return aspect;
	}


	/**
	 * Creates an aspect where an entity must possess one of the specified component types.
	 */
	public static getAspectForOne(type: Constructor<Component>, ...types: Constructor<Component>[]): Aspect {
		const aspect = new Aspect();
		aspect.one(type, ...types);
		return aspect;
	}

	/**
	 * Creates and returns an empty aspect. This can be used if you want a system that processes no entities, but
	 * still gets invoked. Typical usages is when you need to create special purpose systems for debug rendering,
	 * like rendering FPS, how many entities are active in the world, etc.
	 *
	 * You can also use the all, one and exclude methods on this aspect, so if you wanted to create a system that
	 * processes only entities possessing just one of the components A or B or C, then you can do:
	 * Aspect.getEmpty().one(A,B,C);
	 */
	public getEmpty(): Aspect {
		return new Aspect();
	}
}
