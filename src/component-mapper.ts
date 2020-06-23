import {Component} from './component';
import {ComponentType} from './component-type';
import {Entity} from './entity';
import {Bag, Constructor} from './utils';
import {World} from './world';

/**
 * High performance component retrieval from entities. Use this wherever you
 * need to retrieve components from entities often and fast.
 */
export class ComponentMapper {

	private readonly type: ComponentType;
	private readonly components: Bag<Component>;

	constructor(type: Constructor<Component>, private readonly world: World) {
		this.type = ComponentType.getTypeFor(type);
		this.components = this.world.getComponentManager().getComponentsByType(this.type);
	}

	/**
	 * Returns a component mapper for this type of components.
	 */
	public static getFor(type: Constructor<Component>, world: World): ComponentMapper {
		return new ComponentMapper(type, world);
	}

	/**
	 * Fast but unsafe retrieval of a component for this entity.
	 * No bounding checks, so this could return null,
	 * however in most scenarios you already know the entity possesses this component.
	 */
	public get(entity: Entity): Component | null {
		return this.components.get(entity.getId());
	}

	/**
	 * Fast and safe retrieval of a component for this entity.
	 * If the entity does not have this component then null is returned.
	 */
	public getSafe(entity: Entity): Component | null {
		return this.components.get(entity.getId());
	}

	/**
	 * Checks if the entity has this type of component.
	 */
	public has(entity: Entity): boolean {
		return this.getSafe(entity) !== null;
	}
}
