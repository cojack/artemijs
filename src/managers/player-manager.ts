import {Entity} from '../entity';
import {Manager} from '../manager';
import {Bag} from '../utils';


export class PlayerManager extends Manager {

	private readonly playerByEntity = new Map<Entity, string>();
	private readonly entitiesByPlayer = new Map<string, Bag<Entity>>();

	public initialize() {
	}

	public setPlayer(entity: Entity, player: string): void {
		this.playerByEntity.set(entity, player);
		let entities = this.getEntitiesOfPlayer(player);
		entities.add(entity);
	}

	public getEntitiesOfPlayer(player: string): Bag<Entity> {
		let entities = this.entitiesByPlayer.get(player);
		if (!entities) {
			entities = new Bag<Entity>();
			this.entitiesByPlayer.set(player, entities);
		}
		return entities;
	}

	public removeFromPlayer(entity: Entity): void {
		const player = this.playerByEntity.get(entity);
		if (player) {
			const entities = this.entitiesByPlayer.get(player);
			if (entities) {
				entities.remove(entity);
			}
		}
	}

	public getPlayer(entity: Entity): string | undefined {
		return this.playerByEntity.get(entity);
	}

	public setDeleted(entity: Entity): void {
		this.removeFromPlayer(entity);
	}

}
