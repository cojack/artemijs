import iterate from 'iterare';
import {Entity} from '../entity';
import {Manager} from '../manager';

export class TagManager extends Manager {

	private readonly entitiesByTag = new Map<string, Entity>();
	private readonly tagsByEntity = new Map<Entity, string>();

	public initialize(): void {
	}

	public register(tag: string, entity: Entity): void {
		this.entitiesByTag.set(tag, entity);
		this.tagsByEntity.set(entity, tag);
	}

	public unregister(tag: string): void {
		if (!this.entitiesByTag.has(tag)) {
			return;
		}
		const entity = this.entitiesByTag.get(tag) as Entity;
		this.entitiesByTag.delete(tag);
		this.tagsByEntity.delete(entity);
	}

	public isRegistered(tag: string): boolean {
		return iterate(this.entitiesByTag.keys()).includes(tag);
	}

	public getEntity(tag: string): Entity | undefined {
		return this.entitiesByTag.get(tag);
	}

	public getRegisteredTags(): IterableIterator<string> {
		return this.tagsByEntity.values();
	}

	public setDeleted(entity: Entity): void {
		if (!this.tagsByEntity.has(entity)) {
			return;
		}
		const tag = this.tagsByEntity.get(entity) as string;
		this.tagsByEntity.delete(entity);
		this.entitiesByTag.delete(tag);
	}

}
