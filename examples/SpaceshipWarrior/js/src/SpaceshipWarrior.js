(function() {
    /* global requestAnimationFrame, ArtemiJS*/

    'use strict';

    var GameScreen = require('./GameScreen');

    var SpaceshipWarrior = function SpaceshipWarrior() {

        var stats;

        var gameScreen;
        /**
         * @param Float delta
         */
        this.start = function() {
            this.initStats();

            gameScreen = new GameScreen();

            render(0);
        };

        this.initStats = function() {
            stats = new Stats();
            stats.setMode(1); // 0: fps, 1: ms

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.body.appendChild( stats.domElement );
        };

        function render(delta) {
            window.requestAnimationFrame(render);
            gameScreen.render(delta);
            stats.update();
        }
    };

    SpaceshipWarrior.FRAME_WIDTH = 1200;
    SpaceshipWarrior.FRAME_HEIGHT = 900;

    module.exports = SpaceshipWarrior;
})();