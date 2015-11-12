'use strict';

var Bag = require('./../utils/Bag'),
    Manager = require('./../Manager');

/**
 * Use this class together with PlayerManager.
 *
 * You may sometimes want to create teams in your game, so that
 * some players are team mates.
 *
 * A player can only belong to a single team.
 *
 * @class TeamManager
 * @extends Manager
 * @constructor
 * @memberof Managers
 */
function TeamManager() {
    Manager.call(this);

    /**
     * @private
     * @member {WeakMap}
     */
    var playersByTeam = new WeakMap(),

    /**
     * @private
     * @member {WeakMap}
     */
    teamByPlayer = new WeakMap();

    /**
     * @param {string} player Name of the player
     * @return {string}
     */
    this.getTeam = function(player) {
        return teamByPlayer.get(player);
    };

    /**
     * Set team to a player
     *
     * @param {string} player Name of the player
     * @param {string} team Name of the team
     */
    this.setTeam = function(player, team) {
        this.removeFromTeam(player);

        teamByPlayer.set(player, team);

        var players = playersByTeam.get(team);
        if(players === null) {
            players = new Bag();
            playersByTeam.set(team, players);
        }
        players.add(player);
    };

    /**
     * @param {string} team Name of the team
     * @return {Bag} Bag of players
     */
    this.getPlayers = function(team) {
        return playersByTeam.get(team);
    };

    /**
     * @param {String} player Name of the player
     */
    this.removeFromTeam = function(player) {
        var team = teamByPlayer.remove(player);
        if(team !== null) {
            var players = playersByTeam.get(team);
            if(players !== null) {
                players.remove(player);
            }
        }
    };
}

TeamManager.prototype = Object.create(Manager.prototype);
TeamManager.prototype.constructor = TeamManager;
module.exports = TeamManager;