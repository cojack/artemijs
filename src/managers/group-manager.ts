import {iterate} from 'iterare';
import {Entity} from '../entity';
import {Manager} from '../manager';
import {Bag} from '../utils';

/**
 * If you need to group your entities together, e.g. tanks going into
 * "units" group or explosions into "effects",
 * then use this manager. You must retrieve it using world instance.
 *
 * A entity can be assigned to more than one group.
 */
export class GroupManager extends Manager {

	private entitiesByGroup = new Map<string, Bag<Entity>>();

	private groupsByEntity = new Map<Entity, Bag<string>>();

	public async initialize(): Promise<void> {
	}

	/**
	 * Set the group of the entity.
	 */
	public add(entity: Entity, group: string): void {
		let entities = this.entitiesByGroup.get(group);
		if (!entities) {
			entities = new Bag<Entity>();
			this.entitiesByGroup.set(group, entities);
		}
		entities.add(entity);

		let groups = this.groupsByEntity.get(entity);
		if (!groups) {
			groups = new Bag();
			this.groupsByEntity.set(entity, groups);
		}
		groups.add(group);
	}

	/**
	 * Remove the entity from the group.
	 */
	public remove(entity: Entity, group: string): void {
		this.entitiesByGroup.get(group)?.remove(entity);
		this.groupsByEntity.get(entity)?.remove(group);
	}

	/**
	 * Remove the entity from the all groups.
	 */
	public removeFromAllGroups(entity: Entity): void {
		const groups = this.groupsByEntity.get(entity);
		if (!groups) {
			return;
		}

		iterate(groups)
			.map(group => this.entitiesByGroup.get(group)?.remove(entity));

		groups.clear();
	}

	/**
	 * Get all entities that belong to the provided group.
	 */
	public getEntities(group: string): Bag<Entity> {
		let entities = this.entitiesByGroup.get(group);
		if (!entities) {
			entities = new Bag();
			this.entitiesByGroup.set(group, entities);
		}
		return entities;
	}

	/**
	 * Get all entities from the group
	 */
	public getGroups(entity: Entity): Bag<string> | undefined {
		return this.groupsByEntity.get(entity);
	}

	public isInAnyGroup(entity: Entity): boolean {
		return this.getGroups(entity) !== null;
	}

	public isInGroup(entity: Entity, group: string): boolean {
		const groups = this.groupsByEntity.get(entity);
		if (!groups) {
			return false;
		}
		return iterate(groups)
			.includes(group);
	}

	public setDeleted(entity: Entity): void {
		this.removeFromAllGroups(entity);
	}
}
