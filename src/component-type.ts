import {Component} from './component';
import {Constructor} from './utils';

export class ComponentType {

	private static INDEX = 0;

	private readonly index: number;

	private constructor(private readonly type: Constructor<Component>) {
		this.index = ComponentType.INDEX++;
	}

	public getIndex(): number {
		return this.index;
	}

	public toString(): string {
		return 'ComponentType[' + this.type.name + '] (' + this.index + ')';
	}

	private static componentTypes = new Map<Constructor<Component>, ComponentType>();

	public static getTypeFor<T extends Component>(component: Constructor<T>): ComponentType {
		let type = this.componentTypes.get(component);
		if (!type) {
			type = new ComponentType(component);
			ComponentType.componentTypes.set(component, type);
		}
		return type;
	}

	public static getIndexFor<T extends Component>(component: Constructor<T>): number {
		return ComponentType.getTypeFor(component).getIndex();
	}
}
