import {Entity} from './entity';
import {EntityObserver} from './entity-observer';
import {World} from './world';

/**
 * The entity class. Cannot be instantiated outside the framework, you must
 * create new entities using World.
 */
export abstract class Manager implements EntityObserver {
	protected world: World | undefined;

	/**
	 * Override to implement code that gets executed when systems are
	 * initialized.
	 */
	protected abstract initialize(): void;

	protected setWorld(world: World) {
		this.world = world;
	};

	protected getWorld(): World | undefined {
		return this.world;
	};

	public added(entity: Entity): void {

	}

	public changed(entity: Entity): void {

	}

	public deleted(entity: Entity): void {

	}

	public enabled(entity: Entity): void {

	}

	public  disabled(entity: Entity): void {

	}
}
