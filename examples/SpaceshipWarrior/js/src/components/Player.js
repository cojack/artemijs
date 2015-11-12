(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Player() {
        Component.call(this);
    }

    Player.prototype = Object.create(Component.prototype);
    Player.prototype.constructor = Player;
    module.exports = Player;
})();