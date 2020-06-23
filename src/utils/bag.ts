function isNumber(x: any): x is number {
	return !isNaN(x);
}

/**
 * Collection type a bit like ArrayList but does not preserve the order of its
 * entities, speedwise it is very good, especially suited for games.
 */
export class Bag<T> {

	/**
	 * Contains all of the elements
	 */
	private data: T[] = [];

	/**
	 * Removes the element at the specified position in this Bag. does this by
	 * overwriting it was last element then removing last element
	 */
	public remove(index: T|number): T | boolean {
		let response: T | boolean = false;
		if (typeof index === 'object') {
			index = this.data.indexOf(index);
		}
		if (isNumber(index) && index !== -1) {
			response = this.data[index];
			this.data.splice(index, 1);
		}
		return response;
	}

	/**
	 * Remove and return the last object in the bag.
	 */
	public removeLast(): T | null {
		if (this.data.length) {
			const obj = this.data[this.data.length - 1];
			this.data.splice(this.data.length - 1, 1);
			return obj;
		}
		return null;
	}

	/**
	 * Check if bag contains this element.
	 */
	public contains(obj: T) {
		return this.data.indexOf(obj) !== -1;
	}

	/**
	 * Removes from this Bag all of its elements that are contained in the
	 * specified Bag.
	 */
	public removeAll(bag: Bag<T>): boolean {
		let modified = false,
			n = bag.size();
		for (let i = 0; i !== n; ++i) {
			const obj = bag.get(i);
			let index = -1;
			if (obj) {
				index = this.data.indexOf(obj);
			}

			if (index !== -1) {
				this.remove(index);
				modified = true;
			}
		}
		return modified;
	}

	/**
	 * Returns the element at the specified position in Bag.
	 */
	public get(index: number): T | null {
		return this.data[index] ?? null;
	}

	/**
	 * Returns the number of elements in this bag.
	 */
	public size(): number {
		return this.data.length;
	}

	/**
	 * Returns the number of elements the bag can hold without growing.
	 */
	public capacity(): number {
		return Number.MAX_VALUE; // slightly fixed ^^
	}

	/**
	 * Checks if the internal storage supports this index.
	 */
	public isIndexWithinBounds(index: number): boolean {
		return index < this.capacity();
	}

	/**
	 * Returns true if this list contains no elements.
	 */
	public isEmpty(): boolean {
		return this.data.length === 0;
	}

	/**
	 * Adds the specified element to the end of this bag. if needed also
	 * increases the capacity of the bag.
	 */
	public add(obj: T) {
		this.data.push(obj);
	}

	/**
	 * Set element at specified index in the bag.
	 */
	public set(index: number, obj: T) {
		this.data[index] = obj;
	}

	/**
	 * Removes all of the elements from this bag. The bag will be empty after
	 * this call returns.
	 *
	 * @method clear
	 */
	public clear() {
		this.data.length = 0;
		this.data = [];
	}

	/**
	 * Add all items into this bag.
	 *
	 * @method addAll
	 * @param {Bag} bag added
	 */
	public addAll(bag: Bag<T>) {
		let i = bag.size();
		while (i--) {
			const element = bag.get(i);
			if (element) {
				this.add(element);
			}
		}
	}

	[Symbol.iterator]() {
		let idx = 0;
		return {
			next: () => {
				const done = idx === this.data.length;
				return {
					value: this.data[idx++],
					done
				}
			}
		}
	}
}
