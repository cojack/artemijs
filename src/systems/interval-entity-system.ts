import {Aspect} from '../aspect';
import {EntitySystem} from '../entity-system';

/**
 * A system that processes entities at a interval in milliseconds.
 * A typical usage would be a collision system or physics system.
 *
 * @author Arni Arent
 */
export abstract class IntervalEntitySystem extends EntitySystem {
	private acc = 0;
	private readonly interval: number;

	constructor(aspect: Aspect, interval: number) {
		super(aspect);
		this.interval = interval;
	}

	protected checkProcessing(): boolean {
		if (!this.world) {
			return false;
		}
		this.acc += this.world.getDelta();
		if (this.acc >= this.interval) {
			this.acc -= this.interval;
			return true;
		}
		return false;
	}

}
