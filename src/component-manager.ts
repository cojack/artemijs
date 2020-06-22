import {Component} from './component';
import {ComponentType} from './component-type';
import {Entity} from './entity';
import {Manager} from './manager';
import {Bag} from './utils';

export class ComponentManager extends Manager {

	private readonly componentsByType = new Bag<Bag<Component>>();

	private readonly deleted1 = new Bag<Entity>();

	public initialize() {
	};

	public added(entity: Entity): void {
		throw new Error("Method not implemented.");
	}
	public changed(entity: Entity) {
		throw new Error("Method not implemented.");
	}
	public enabled(entity: Entity) {
		throw new Error("Method not implemented.");
	}
	public disabled(entity: Entity) {
		throw new Error("Method not implemented.");
	}

	/**
	 * Add component by type
	 */
	public addComponent(entity: Entity, type: ComponentType, component: Component): void {
		let components = this.componentsByType.get(type.getIndex());
		if (!components) {
			components = new Bag<Component>();
			this.componentsByType.set(type.getIndex(), components);
		}

		components.set(entity.getId(), component);

		entity.getComponentBits().set(type.getIndex());
	}

	/**
	 * Remove component by type
	 */
	public removeComponent(entity: Entity, type: ComponentType): void {
		if (entity.getComponentBits().get(type.getIndex())) {
			this.componentsByType.get(type.getIndex())?.remove(entity.getId());
			entity.getComponentBits().clear(type.getIndex());
		}
	}

	/**
	 * Get component by type
	 */
	public getComponentsByType(type: ComponentType) {
		let components = this.componentsByType.get(type.getIndex());
		if (!components) {
			components = new Bag<Component>();
			this.componentsByType.set(type.getIndex(), components);
		}
		return components;
	}

	/**
	 * Get component
	 */
	public getComponent(entity: Entity, type: ComponentType): Component | null {
		const components = this.componentsByType.get(type.getIndex());
		if (components) {
			return components.get(entity.getId());
		}
		return null;
	}

	/**
	 * Get component for
	 *
	 * @method getComponentsFor
	 */
	public getComponentsFor(entity: Entity, fillBag: Bag<any>) {
		const componentBits = entity.getComponentBits();

		for (let i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i + 1)) {
			fillBag.add(this.componentsByType.get(i)?.get(entity.getId()));
		}

		return fillBag;
	}

	/**
	 * Add entity to delete components of them
	 */
	public deleted(entity: Entity) {
		this.deleted1.add(entity);
	}

	/**
	 * Clean deleted componenets of entities
	 *
	 * @method clean
	 */
	public clean() {
		const size = this.deleted1.size();
		if (!size) {
			return
		}
		for (let i = 0; i < size; i++) {
			this.removeComponentsOfEntity(this.deleted1.get(i) as Entity);
		}
		this.deleted1.clear();
	}

	private removeComponentsOfEntity(entity: Entity) {
		const componentBits = entity.getComponentBits();
		for (let i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i + 1)) {
			this.componentsByType.get(i)?.remove(entity.getId());
		}
		componentBits.clear();
	}
}
