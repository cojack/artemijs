export * from './uuid';
export * from './bag';

export type Constructor<T> = new(...args: any[]) => Function;

const ADDRESS_BITS_PER_WORD = 5;
export const BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;

