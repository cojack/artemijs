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
	public abstract initialize(): void;

	public setWorld(world: World): void {
		this.world = world;
	}

	protected getWorld(): World | undefined {
		return this.world;
	}

	public setAdded(entity: Entity): void {

	}

	public setChanged(entity: Entity): void {

	}

	public setDeleted(entity: Entity): void {

	}

	public setEnabled(entity: Entity): void {

	}

	public  setDisabled(entity: Entity): void {

	}
}
