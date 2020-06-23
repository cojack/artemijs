import BitSet from 'fast-bitset';
import {Entity} from './entity';
import {IdentifierPool} from './identifier-pool';
import {Manager} from './manager';
import {Bag, BITS_PER_WORD} from './utils';
import {World} from './world';

export class EntityManager extends Manager {

	private readonly entities = new Bag<Entity>();

	private readonly identifierPool = new IdentifierPool();

	private readonly disabled = new BitSet(BITS_PER_WORD);

	private readonly stats = {
		active: 0,
		added: 0,
		created: 0,
		changed: 0,
		deleted: 0
	}

	/**
	 * Initialize
	 */
	public initialize(): void {

	}

	/**
	 * Create new entity instance
	 */
	public createEntityInstance(): Entity {
		const entity = new Entity(this.world as World, this.identifierPool.checkOut() as number);
		this.stats.created++;
		return entity;
	}

	/**
	 * Set entity as added for future process
	 */
	public setAdded(entity: Entity): void {
		this.stats.active++;
		this.stats.added++;
		this.entities.set(entity.getId(), entity);
	}

	/**
	 * Set entity as enabled for future process
	 */
	public setEnabled(entity: Entity): void {
		this.disabled.unset(entity.getId());
	}

	/**
	 * Set entity as disabled for future process
	 */
	public setDisabled(entity: Entity): void {
		this.disabled.set(entity.getId());
	}

	/**
	 * Set entity as deleted for future process
	 */
	public setDeleted(entity: Entity): void {
		this.entities.remove(entity.getId());

		this.disabled.unset(entity.getId());

		this.identifierPool.checkIn(entity.getId());

		this.stats.active--;
		this.stats.deleted++;
	}

	/**
	 * Check if this entity is active.
	 * Active means the entity is being actively processed.
	 */
	public isActive(entityId: number): boolean {
		return this.entities.get(entityId) !== null;
	}

	/**
	 * Check if the specified entityId is enabled.
	 */
	public isEnabled(entityId: number): boolean {
		return !this.disabled.get(entityId);
	}

	/**
	 * Get a entity with this id.
	 */
	public getEntity(entityId: number): Entity | null {
		return this.entities.get(entityId);
	}

	/**
	 * Get how many entities are active in this world.
	 */
	public getActiveEntityCount(): number {
		return this.stats.active;
	}

	/**
	 * Get how many entities have been created in the world since start.
	 * Note: A created entity may not have been added to the world, thus
	 * created count is always equal or larger than added count.
	 */
	public getTotalCreated(): number {
		return this.stats.created;
	}

	/**
	 * Get how many entities have been added to the world since start.
	 */
	public getTotalAdded(): number {
		return this.stats.added;
	}

	/**
	 * Get how many entities have been deleted from the world since start.
	 */
	public getTotalDeleted(): number {
		return this.stats.deleted;
	}
}
