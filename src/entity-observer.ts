import {Entity} from './entity';

export interface EntityObserver {
	setAdded(entity: Entity): void;

	setChanged(entity: Entity): void;

	setDeleted(entity: Entity): void;

	setEnabled(entity: Entity): void;

	setDisabled(entity: Entity): void;
}
