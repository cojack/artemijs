import {Aspect} from '../aspect';
import {Entity} from '../entity';
import {EntitySystem} from '../entity-system';
import {Bag} from '../utils';

/**
 * This system has an empty aspect so it processes no entities, but it still gets invoked.
 * You can use this system if you need to execute some game logic and not have to concern
 * yourself about aspects or entities.
 *
 * @author Arni Arent
 *
 */
export abstract class VoidEntitySystem extends EntitySystem {

	constructor() {
		super(Aspect.getEmpty());
	}

	protected processEntities(entities: Bag<Entity>): void {
		this.processSystem();
	}

	protected abstract processSystem(): void;

	protected checkProcessing(): boolean {
		return true;
	}

}
