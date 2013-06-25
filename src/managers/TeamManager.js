(function(ArtemiJS) {
    'use strict';
    
    /**
     * Use this class together with PlayerManager.
     * 
     * You may sometimes want to create teams in your game, so that
     * some players are team mates.
     * 
     * A player can only belong to a single team.
     * 
     * @module ArtemiJS
     * @submodule Managers
     * @class TeamManager
     * @namespace Managers
     * @constructor
     * @extends ArtemiJS.Manager
     */
    var TeamManager = function() {
        
        /**
         * @property playersByTeam
         * @type {ArtemiJS.Utils.HashMap}
         */
        var playersByTeam = new ArtemiJS.Utils.HashMap(),
        
        /**
         * @property teamByPlayer
         * @type {ArtemiJS.Utils.HashMap}
         */
            teamByPlayer = new ArtemiJS.Utils.HashMap();
        
        /**
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * @method getTeam
         * @param {String} player Name of the player
         * @return {String}
         */
        this.getTeam = function(player) {
            return teamByPlayer.get(player);
        };
        
        /**
         * Set team to a player
         * 
         * @method setTeam
         * @param {String} player Name of the player
         * @param {String} team Name of the team
         */
        this.setTeam = function(player, team) {
            this.removeFromTeam(player);
            
            teamByPlayer.put(player, team);
            
            var players = playersByTeam.get(team);
            if(players === null) {
                players = new ArtemiJS.Utils.Bag();
                playersByTeam.put(team, players);
            }
            players.add(player);
        };
        
        /**
         * @method getPlayers
         * @param {String} team Name of the team
         * @return {ArtemiJS.Utils.Bag} Bag of players
         */
        this.getPlayers = function(team) {
            return playersByTeam.get(team);
        };
        
        /**
         * @method removeFromTeam
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
    }; 

    ArtemiJS.Managers.TeamManager = TeamManager;
    ArtemiJS.Managers.TeamManager.prototype = Object.create(ArtemiJS.Manager.prototype);
})(window.ArtemiJS || {});