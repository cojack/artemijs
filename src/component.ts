/**
 * A tag class. All components in the system must extend this class.
 */
import {Constructor} from './utils';

export abstract class Component {
	public getClass(): Constructor<Component> {
		return this.constructor as FunctionConstructor;
	}
	public abstract getSimpleName(): string;
	public abstract getIndex(): number;
}
