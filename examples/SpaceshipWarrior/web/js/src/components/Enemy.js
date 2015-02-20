(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Enemy() {
        Component.call(this);
    }

    Enemy.prototype = Object.create(Component.prototype);
    Enemy.prototype.constructor = Enemy;
    module.exports = Enemy;
})();