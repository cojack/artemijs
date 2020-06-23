import {iterate} from 'iterare';
import {Aspect} from '../aspect';
import {Entity} from '../entity';
import {Bag} from '../utils';
import {IntervalEntitySystem} from './interval-entity-system';

/**
 * A system that processes entities at a interval in milliseconds.
 * A typical usage would be a collision system or physics system.
 *
 * @author Arni Arent
 *
 */
export abstract class IntervalEntityProcessingSystem extends IntervalEntitySystem {

	constructor(aspect: Aspect, interval: number) {
		super(aspect, interval);
	}

	/**
	 * Process a entity this system is interested in.
	 */
	public abstract process(entity: Entity): void;

	protected processEntities(entities: Bag<Entity>): void {
		iterate(entities)
			.forEach(entity => this.process(entity));
	}

}
