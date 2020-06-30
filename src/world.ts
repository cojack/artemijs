import {iterate} from 'iterare';
import {Component} from './component';
import {ComponentManager} from './component-manager';
import {ComponentMapper} from './component-mapper';
import {Entity} from './entity';
import {EntityManager} from './entity-manager';
import {EntitySystem} from './entity-system';
import {Manager} from './manager';
import {Bag, Constructor} from './utils';

interface Performer {
	perform: (system: EntitySystem | Manager, entity: Entity) => void;
}

/**
 * The primary instance for the framework. It contains all the managers.
 * You must use this to create, delete and retrieve entities.
 * It is also important to set the delta each game loop iteration,
 * and initialize before game loop.
 */
export class World {

	private readonly entityManager = new EntityManager();

	private readonly componentManager = new ComponentManager();

	private readonly managers = new Map<Constructor<Manager>, Manager>();

	private readonly managersBag = new Bag<Manager>();

	private readonly systems = new Map<Constructor<EntitySystem>, EntitySystem>();

	private readonly systemsBag = new Bag<EntitySystem>();

	private readonly added = new Bag<Entity>();

	private readonly changed = new Bag<Entity>();

	private readonly deleted = new Bag<Entity>();

	private readonly enable = new Bag<Entity>();

	private readonly disable = new Bag<Entity>();

	private delta = 0;

	/**
	 * Makes sure all managers systems are initialized in the order
	 * they were added
	 */
	public initialize(): void {
		iterate(this.managersBag).forEach(manager => manager.initialize());
		iterate(this.systemsBag).forEach(system => system.initialize());
	}

	/**
	 * Returns a manager that takes care of all the entities in the world.
	 * entities of this world
	 */
	public getEntityManager(): EntityManager {
		return this.entityManager;
	}

	/**
	 * Returns a manager that takes care of all the components in the world.
	 */
	public getComponentManager(): ComponentManager {
		return this.componentManager;
	}

	/**
	 * Add a manager into this world. It can be retrieved later.
	 * World will notify this manager of changes to entity.
	 */
	public setManager(manager: Manager): Manager {
		manager.setWorld(this);
		this.managers.set(manager.getClass(), manager);
		this.managersBag.add(manager);

		return manager;
	}

	/**
	 * Returns a manager of the specified type.
	 */
	public getManager(manager: Constructor<Manager>): Manager | undefined {
		return this.managers.get(manager);
	}

	/**
	 * Deletes the manager from this world.
	 */
	public deleteManager(manager: Manager): void {
		this.managers.delete(manager.getClass());
		this.managersBag.remove(manager);
	}

	/**
	 * You must specify the delta for the game here.
	 */
	public setDelta(d: number): void {
		this.delta = d;
	}

	public getDelta(): number {
		return this.delta;
	}

	/**
	 * Adds a entity to this world.
	 */
	public addEntity(entity: Entity): void {
		this.added.add(entity);
	}

	/**
	 * Ensure all systems are notified of changes to this entity.
	 * If you're adding a component to an entity after it's been
	 * added to the world, then you need to invoke this method.
	 */
	public changedEntity(entity: Entity): void {
		this.changed.add(entity);
	}

	/**
	 * Delete the entity from the world.
	 */
	public deleteEntity(entity: Entity): void {
		this.added.remove(entity);
	}

	/**
	 * (Re)enable the entity in the world, after it having being disabled.
	 * Won't do anything unless it was already disabled.
	 */
	public enableEntity(entity: Entity): void {
		this.enable.add(entity);
	}

	/**
	 * Disable the entity from being processed. Won't delete it, it will
	 * continue to exist but won't get processed.
	 */
	public disableEntity(entity: Entity): void {
		this.disable.add(entity);
	}

	/**
	 * Create and return a new or reused entity instance.
	 * Will NOT add the entity to the world, use World.addEntity(Entity) for that.
	 */
	public createEntity(): Entity {
		return this.entityManager.createEntityInstance();
	}

	/**
	 * Get a entity having the specified id.
	 */
	public getEntity(id: number): Entity | null {
		return this.entityManager.getEntity(id);
	}

	/**
	 * Gives you all the systems in this world for possible iteration.
	 */
	public getSystems(): Bag<EntitySystem> {
		return this.systemsBag;
	}

	/**
	 * Adds a system to this world that will be processed by World.process()
	 *
	 * @method setSystem
	 * @param {EntitySystem} system the system to add.
	 * @param {Boolean} [passive] wether or not this system will be processed by World.process()
	 * @return {EntitySystem} the added system.
	 */
	public setSystem(system: EntitySystem, passive = false): EntitySystem {
		system.setWorld(this);
		system.setPassive(passive);

		this.systems.set(system.getClass(), system);
		this.systemsBag.add(system);

		return system;
	}

	/**
	 * Retrieve a system for specified system type.
	 */
	public getSystem(systemType: Constructor<EntitySystem>): EntitySystem | undefined {
		return this.systems.get(systemType);
	}

	/**
	 * Removed the specified system from the world.
	 */
	public deleteSystem(system: EntitySystem): void {
		this.systems.delete(system.getClass());
		this.systemsBag.remove(system);
	}

	/**
	 * Notify all the systems
	 */
	private notifySystems(performer: Performer, entity: Entity) {
		iterate(this.systemsBag).forEach(system => performer.perform(system, entity));
	}

	/**
	 * Notify all the managers
	 */
	private notifyManagers(performer: Performer, entity: Entity) {
		iterate(this.managersBag).forEach(manager => performer.perform(manager, entity));
	}

	/**
	 * Performs an action on each entity.
	 */
	private check(entities: Bag<Entity>, performer: Performer) {
		iterate(entities)
			.forEach(entity => {
				this.notifyManagers(performer, entity);
				this.notifySystems(performer, entity);
			});

		entities.clear();
	}

	/**
	 * Process all non-passive systems.
	 */
	public process(): void {

		this.check(this.added, {
			perform: (observer, entity) => observer.setAdded(entity)
		});

		this.check(this.changed, {
			perform: (observer, entity) => observer.setChanged(entity)
		});

		this.check(this.disable, {
			perform: (observer, entity) => observer.setDisabled(entity)
		});

		this.check(this.enable, {
			perform: (observer, entity) => observer.setEnabled(entity)
		});

		this.check(this.deleted, {
			perform: (observer, entity) => observer.setDeleted(entity)
		});

		this.componentManager.clean();

		iterate(this.systemsBag)
			.filter(system => !system.isPassive())
			.forEach(system => system.process());
	}

	/**
	 * Retrieves a ComponentMapper instance for fast retrieval
	 * of components from entities.
	 */
	public getMapper<K extends Component>(type: Constructor<Component>): ComponentMapper<K> {
		return ComponentMapper.getFor<K>(type, this);
	}
}
