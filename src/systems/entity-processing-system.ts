import {iterate} from 'iterare';
import {Aspect} from '../aspect';
import {Entity} from '../entity';
import {EntitySystem} from '../entity-system';
import {Bag} from '../utils';

/**
 * A typical entity system. Use this when you need to process entities possessing the
 * provided component types.
 */
export abstract class EntityProcessingSystem extends EntitySystem {

	constructor(aspect: Aspect) {
		super(aspect);
	}

	/**
	 * Process a entity this system is interested in.
	 */
	protected abstract action(entity: Entity): void;

	protected processEntities(entities: Bag<Entity>): void {
		iterate(entities)
			.forEach(entity => this.action(entity));
	}

	protected checkProcessing(): boolean {
		return true;
	}

}
