export * from './uuid';
export * from './bag';

export interface Constructor<T> extends Function {
	prototype: T;
}

const ADDRESS_BITS_PER_WORD = 5;
export const BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;
