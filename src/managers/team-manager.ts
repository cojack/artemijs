import {Manager} from '../manager';
import {Bag} from '../utils';

/**
 * Use this class together with PlayerManager.
 *
 * You may sometimes want to create teams in your game, so that
 * some players are team mates.
 *
 * A player can only belong to a single team.
 */
export class TeamManager extends Manager {

	private playersByTeam = new Map<string, Bag<string>>();

	private teamByPlayer = new Map<string, string>();

	public async initialize(): Promise<void> {
	}

	public getTeam(player: string): string | undefined {
		return this.teamByPlayer.get(player);
	}

	public setTeam(player: string, team: string): void {
		this.removeFromTeam(player);

		this.teamByPlayer.set(player, team);

		let players = this.playersByTeam.get(team);
		if (!players) {
			players = new Bag<string>();
			this.playersByTeam.set(team, players);
		}
		players.add(player);
	}

	public getPlayers(team: string): Bag<string> | undefined {
		return this.playersByTeam.get(team);
	}

	/**
	 * @method removeFromTeam
	 * @param {String} player Name of the player
	 */
	public removeFromTeam(player: string): void {
		if (!this.teamByPlayer.has(player)) {
			return;
		}
		const team = this.teamByPlayer.get(player);
		this.teamByPlayer.delete(player);
		if (team) {
			const players = this.playersByTeam.get(team);
			if (players) {
				players.remove(player);
			}
		}
	}
}
