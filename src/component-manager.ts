import {Component} from './component';
import {ComponentType} from './component-type';
import {Entity} from './entity';
import {Manager} from './manager';
import {Bag} from './utils';

export class ComponentManager extends Manager {

	private readonly componentsByType = new Bag<Bag<Component>>();

	private readonly deletedEntities = new Bag<Entity>();

	public async initialize(): Promise<void> {
	}

	public addComponent(entity: Entity, type: ComponentType, component: Component): void {
		let components = this.componentsByType.get(type.getIndex());
		if (!components) {
			components = new Bag<Component>();
			this.componentsByType.set(type.getIndex(), components);
		}

		components.set(entity.getId(), component);

		entity.getComponentBits().set(type.getIndex());
	}

	public removeComponent(entity: Entity, type: ComponentType): void {
		if (entity.getComponentBits().get(type.getIndex())) {
			this.componentsByType.get(type.getIndex())?.remove(entity.getId());
			entity.getComponentBits().unset(type.getIndex());
		}
	}

	public getComponentsByType(type: ComponentType): Bag<Component> {
		let components = this.componentsByType.get(type.getIndex());
		if (!components) {
			components = new Bag<Component>();
			this.componentsByType.set(type.getIndex(), components);
		}
		return components;
	}

	public getComponent(entity: Entity, type: ComponentType): Component | null {
		const components = this.componentsByType.get(type.getIndex());
		if (components) {
			return components.get(entity.getId());
		}
		return null;
	}

	public getComponentsFor(entity: Entity, fillBag: Bag<any>): Bag<Component> {
		const componentBits = entity.getComponentBits();

		for (let i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i + 1)) {
			fillBag.add(this.componentsByType.get(i)?.get(entity.getId()));
		}

		return fillBag;
	}

	/**
	 * Add entity to delete components of them
	 */
	public setDeleted(entity: Entity): void {
		this.deletedEntities.add(entity);
	}

	/**
	 * Clean deleted componenets of entities
	 */
	public clean(): void {
		const size = this.deletedEntities.size();
		if (!size) {
			return;
		}
		for (let i = 0; i < size; i++) {
			this.removeComponentsOfEntity(this.deletedEntities.get(i) as Entity);
		}
		this.deletedEntities.clear();
	}

	private removeComponentsOfEntity(entity: Entity): void {
		const componentBits = entity.getComponentBits();
		for (let i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i + 1)) {
			this.componentsByType.get(i)?.remove(entity.getId());
		}
		componentBits.clear();
	}
}
