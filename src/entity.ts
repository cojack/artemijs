import BitSet from 'fast-bitset';
import {Component} from './component';
import {ComponentManager} from './component-manager';
import {ComponentType} from './component-type';
import {EntityManager} from './entity-manager';
import {Bag, BITS_PER_WORD, Constructor, uuid} from './utils';
import {World} from './world';

/**
 * The entity class. Cannot be instantiated outside the framework, you must
 * create new entities using World.
 */
export class Entity {

	private uuid: string | undefined;

	private readonly componentBits = new BitSet(BITS_PER_WORD);

	private readonly systemBits = new BitSet(BITS_PER_WORD);

	private readonly entityManager: EntityManager;

	private readonly componentManager: ComponentManager;

	constructor(private readonly world: World, private readonly id: number) {
		this.entityManager = this.world.getEntityManager();
		this.componentManager = this.world.getComponentManager();
		this.reset();
	}

	/**
	 * The internal id for this entity within the framework. No other entity
	 * will have the same ID, but ID's are however reused so another entity may
	 * acquire this ID if the previous entity was deleted.
	 */
	public getId() {
		return this.id;
	};

	/**
	 * Returns a BitSet instance containing bits of the components the entity possesses.
	 */
	public getComponentBits() {
		return this.componentBits;
	};

	/**
	 * Returns a BitSet instance containing bits of the components the entity possesses.
	 */
	public getSystemBits() {
		return this.systemBits;
	};

	/**
	 * Make entity ready for re-use.
	 * Will generate a new uuid for the entity.
	 */
	public toString() {
		return 'Entity [' + this.id + ']';
	};

	/**
	 * Add a component to this entity.
	 */
	public addComponent(component: Component, type: ComponentType | undefined): Entity {
		if (!(type instanceof ComponentType)) {
			type = ComponentType.getTypeFor(component.getClass());
		}
		this.componentManager.addComponent(this, type, component);
		return this;
	};

	/**
	 * Remove component by its type.
	 */
	public removeComponent(component: Component | ComponentType): Entity {
		let componentType;
		if (!(component instanceof ComponentType)) {
			componentType = ComponentType.getTypeFor(component.getClass());
		} else {
			componentType = component;
		}
		this.componentManager.removeComponent(this, componentType);
		return this;
	};

	/**
	 * Checks if the entity has been added to the world and has not been deleted from it.
	 * If the entity has been disabled this will still return true.
	 */
	public isActive() {
		return this.entityManager.isActive(this.id);
	};

	public isEnabled() {
		return this.entityManager.isEnabled(this.id);
	};

	/**
	 * This is the preferred method to use when retrieving a component from a
	 * entity. It will provide good performance.
	 * But the recommended way to retrieve components from an entity is using
	 * the ComponentMapper.
	 */
	public getComponent(type: Constructor<Component>): Component | null;
	public getComponent(type: ComponentType): Component | null;
	public getComponent(type: ComponentType | Constructor<Component>): Component | null {
		let componentType;
		if (!(type instanceof ComponentType)) {
			componentType = ComponentType.getTypeFor(type);
		} else {
			componentType = type;
		}
		return this.componentManager.getComponent(this, componentType);
	};

	/**
	 * Returns a bag of all components this entity has.
	 * You need to reset the bag yourself if you intend to fill it more than once.
	 */
	public getComponents(fillBag: Bag<Component>) {
		return this.componentManager.getComponentsFor(this, fillBag);
	};

	/**
	 * Refresh all changes to components for this entity. After adding or
	 * removing components, you must call this method. It will update all
	 * relevant systems. It is typical to call this after adding components to a
	 * newly created entity.
	 */
	public addToWorld() {
		this.world.addEntity(this);
	};

	/**
	 * This entity has changed, a component added or deleted.
	 *
	 * @method changedInWorld
	 */
	public changedInWorld() {
		this.world.changedEntity(this);
	};

	/**
	 * Delete this entity from the world.
	 *
	 * @method deleteFromWorl
	 */
	public deleteFromWorld() {
		this.world.deleteEntity(this);
	};

	/**
	 * (Re)enable the entity in the world, after it having being disabled.
	 * Won't do anything unless it was already disabled.
	 *
	 * @method enable
	 */
	public enable() {
		this.world.enableEntity(this);
	};

	/**
	 * Disable the entity from being processed. Won't delete it, it will
	 * continue to exist but won't get processed.
	 *
	 * @method disable
	 */
	public disable() {
		this.world.disableEntity(this);
	};

	/**
	 * Get the UUID for this entity.
	 * This UUID is unique per entity (re-used entities get a new UUID).
	 */
	public getUuid(): string | undefined {
		return this.uuid;
	};

	/**
	 * Returns the world this entity belongs to.
	 */
	public getWorld(): World {
		return this.world;
	};

	/**
	 * Reset
	 */
	private reset() {
		this.systemBits.clear();
		this.componentBits.clear();
		this.uuid = uuid();
	}
}
