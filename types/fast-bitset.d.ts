declare module 'fast-bitset' {
	export default class BitSet {
		constructor(nBitsOrKey: number|string);
		public get(idx: number): boolean;
		public set(idx: number): boolean;
		public setRange(from: number, to: number): boolean;
		public unset(idx: number): boolean;
		public unsetRange(from: number, to: number): boolean;
		public toggle(idx: number): boolean;
		public toggleRange(from: number, to: number): boolean;
		public clear(): boolean;
		public clone(): BitSet;
		public dehydrate(): string;
		public and(bsOrIdx: BitSet|number): BitSet;
		public or(bsOrIdx: BitSet|number): BitSet;
		public xor(bsOrIdx: BitSet|number): BitSet;
		public forEach(fn: () => void): void;
		public getCardinality(): number;
		public getIndices(): number[];
		public isSubsetOf(bs: BitSet): boolean;
		public isEmpty(): boolean;
		public isEmpty(): boolean;
		public isEqual(bs: BitSet): boolean;
		public toString(): string;

		/**
		 * Find first set bit (useful for processing queues, breadth-first tree searches, etc.)
		 * @param startWord
		 * @returns the index of the first set bit in the bitset, or -1 if not found
		 */
		public ffs(startWord: number): number;

		/**
		 * Find first zero (unset bit)
		 * @param startWord
		 * @returns the index of the first unset bit in the bitset, or -1 if not found
		 */
		public ffz(startWord: number): number;

		/**
		 * Find last set bit
		 * @param startWord
		 * @returns the index of the last set bit in the bitset, or -1 if not found
		 */
		public fls(startWord: number): number;

		/**
		 * Find last zero (unset bit)
		 * @param startWord
		 * @returns the index of the last unset bit in the bitset, or -1 if not found
		 */
		public flz(startWord: number): number;

		/**
		 * Find first set bit, starting at a given index
		 * @param idx
		 * @returns the index of the next set bit >= idx, or -1 if not found
		 */
		public nextSetBit(idx: number): number;

		/**
		 * Find first unset bit, starting at a given index
		 * @param idx
		 * @returns the index of the next unset bit >= idx, or -1 if not found
		 */
		public nextUnsetBit(idx: number): number;

		/**
		 * Find last set bit, up to a given index
		 * @param idx
		 * @returns the index of the next unset bit <= idx, or -1 if not found
		 */
		public previousSetBit(idx: number): number;

		/**
		 * Find last unset bit, up to a given index
		 * @param idx
		 * @returns the index of the next unset bit <= idx, or -1 if not found
		 */
		public previousUnsetBit(idx: number): number;

	}
}
