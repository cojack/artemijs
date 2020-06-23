import {Aspect} from './aspect';
import {Entity} from './entity';
import {EntityObserver} from './entity-observer';
import {Bag, Constructor} from './utils';
import {World} from './world';

class SystemIndexManager {

	private static INDEX = 0;

	private static indices = new Map<Constructor<EntitySystem>, number>();

	public static getIndexFor(entitySystem: Constructor<EntitySystem>) {
		let index = this.indices.get(entitySystem);
		if (!index) {
			index = this.INDEX++;
			this.indices.set(entitySystem, index);
		}
		return index;
	}
}

/**
 * The most raw entity system. It should not typically be used, but you can
 * create your own entity system handling by extending this. It is
 * recommended that you use the other provided entity system implementations
 */
export abstract class EntitySystem implements EntityObserver {

	protected world: World | undefined;

	private readonly systemIndex: number;

	private readonly actives = new Bag<Entity>();

	private readonly allSet = this.aspect.getAllSet();

	private readonly exclusionSet = this.aspect.getExclusionSet();

	private readonly oneSet = this.aspect.getOneSet();

	private passive: boolean | undefined;

	private readonly dummy = this.allSet.isEmpty() && this.oneSet.isEmpty();

	constructor(private readonly aspect: Aspect) {
		this.systemIndex = SystemIndexManager.getIndexFor(this.getClass());
	}

	private removeFromSystem(entity: Entity): void {
		this.actives.remove(entity);
		entity.getSystemBits().unset(this.systemIndex);
		this.removed(entity);
	}

	private insertToSystem(entity: Entity): void {
		this.actives.add(entity);
		entity.getSystemBits().set(this.systemIndex);
		this.inserted(entity);
	}

	/**
	 * Called before processing of entities begins
	 */
	protected begin(): void {
	};

	/**
	 * Process the entities
	 */
	public process() {
		if (this.checkProcessing()) {
			this.begin();
			this.processEntities(this.actives);
			this.end();
		}
	};

	/**
	 * Called after the processing of entities ends
	 *
	 * @method end
	 */
	protected end(): void {
	};

	/**
	 * Any implementing entity system must implement this method and the
	 * logic to process the given entities of the system.
	 */
	protected abstract processEntities(entities: Bag<Entity>): void;

	/**
	 * Check the system should processing
	 *
	 * @method checkProcessing
	 * @return {Boolean} true if the system should be processed, false if not
	 */
	protected abstract checkProcessing(): boolean;

	/**
	 * Override to implement code that gets executed when systems are
	 * initialized.
	 *
	 * @method initialize
	 */
	public initialize(): void {
	};

	/**
	 * Called if the system has received a entity it is interested in,
	 * e.g. created or a component was added to it.
	 */
	protected inserted(entity: Entity): void {
	};

	/**
	 * Called if a entity was removed from this system, e.g. deleted
	 * or had one of it's components removed.
	 */
	protected removed(entity: Entity): void {
	};

	/**
	 * Will check if the entity is of interest to this system.
	 */
	public check(entity: Entity): void {
		if (this.dummy) {
			return;
		}
		const contains = entity.getSystemBits().get(this.systemIndex);
		let interested = true;
		const componentBits = entity.getComponentBits();

		if (!this.allSet.isEmpty()) {
			for (let i = this.allSet.nextSetBit(0); i >= 0; i = this.allSet.nextSetBit(i + 1)) {
				if (!componentBits.get(i)) {
					interested = false;
					break;
				}
			}
		}
		if (!this.exclusionSet.isEmpty() && interested) {
			interested = !this.exclusionSet.isSubsetOf(componentBits);
		}

		// Check if the entity possesses ANY of the components in the oneSet. If so, the system is interested.
		if (!this.oneSet.isEmpty()) {
			interested = this.oneSet.isSubsetOf(componentBits);
		}

		if (interested && !contains) {
			this.insertToSystem(entity);
		} else if (!interested && contains) {
			this.removeFromSystem(entity);
		}
	};

	public setAdded(entity: Entity): void {
		this.check(entity);
	};

	public setChanged(entity: Entity): void {
		this.check(entity);
	};

	public setDeleted(entity: Entity): void {
		if (entity.getSystemBits().get(this.systemIndex)) {
			this.removeFromSystem(entity);
		}
	};

	public setDisabled(entity: Entity): void {
		if (entity.getSystemBits().get(this.systemIndex)) {
			this.removeFromSystem(entity);
		}
	};

	public setEnabled(entity: Entity): void {
		this.check(entity);
	};

	public setWorld(world: World): void {
		this.world = world;
	};

	public isPassive(): boolean {
		return !!this.passive;
	};

	public setPassive(passive: boolean): void {
		this.passive = passive;
	};

	public getActives(): Bag<Entity> {
		return this.actives;
	};

	public getClass(): Constructor<EntitySystem> {
		return this.constructor as FunctionConstructor;
	}
}
