import {Bag} from './utils';

/**
 * Used only internally in EntityManager to generate distinct ids for
 * entities and reuse them
 */
export class IdentifierPool {

	private readonly ids = new Bag<number>();

	private nextAvailableId = 0;

	/**
	 * Check an available id
	 */
	public checkOut(): number | null {
		if (this.ids.size()) {
			return this.ids.removeLast();
		}
		return this.nextAvailableId++;
	}

	/**
	 * Add new id in ids {Bag}
	 */
	public checkIn(id: number): void {
		this.ids.add(id);
	}
}
