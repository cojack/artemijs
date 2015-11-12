(function() {
    'use strict';

    var World = ArtemiJS.World,
        GroupManager = ArtemiJS.Managers.GroupManager,
        EntityFactory = require ('./EntityFactory'),
        MovementSystem = require('./systems/MovementSystem'),
        PlayerInputSystem = require('./systems/PlayerInputSystem'),
        CollisionSystem = require('./systems/CollisionSystem'),
        ExpiringSystem = require('./systems/ExpiringSystem'),
        EntitySpawningTimerSystem = require('./systems/EntitySpawningTimerSystem'),
        ParallaxStarRepeatingSystem = require('./systems/ParallaxStarRepeatingSystem'),
        ColorAnimationSystem = require('./systems/ColorAnimationSystem'),
        ScaleAnimationSystem = require('./systems/ScaleAnimationSystem'),
        RemoveOffscreenShipsSystem = require('./systems/RemoveOffscreenShipsSystem'),
        SpriteRenderSystem = require('./systems/SpriteRenderSystem'),
        HealthRenderSystem = require('./systems/HealthRenderSystem'),
        HudRenderSystem = require('./systems/HudRenderSystem');

    var GameScreen = function GameScreen() {
        var world;

        var webgl = {
            "scene": null,
            "camera": null,
            "renderer": null
        };

        var spriteRenderSystem;
        var healthRenderSystem;
        var hudRenderSystem;

        function init() {

            world = new World();

            world.setManager(new GroupManager());

            initSystems();
            initThree();

            world.initialize();

            EntityFactory.createPlayer(world, 0, 0).addToWorld();

            /**for(var i = 0; 500 > i; i++) {
            EntityFactory.createStar(world).addToWorld();
        }*/
        }

        function initSystems() {
            world.setSystem(new MovementSystem());
            world.setSystem(new PlayerInputSystem(webgl));
            world.setSystem(new CollisionSystem());
            world.setSystem(new ExpiringSystem());
            world.setSystem(new EntitySpawningTimerSystem());
            world.setSystem(new ParallaxStarRepeatingSystem());
            world.setSystem(new ColorAnimationSystem());
            world.setSystem(new ScaleAnimationSystem());
            world.setSystem(new RemoveOffscreenShipsSystem());

            spriteRenderSystem = world.setSystem(new SpriteRenderSystem(webgl), true);
            //healthRenderSystem = world.setSystem(new HealthRenderSystem(camera), true);
            hudRenderSystem = world.setSystem(new HudRenderSystem(webgl), true);
        }

        function initThree() {
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(
                75,
                SpaceshipWarrior.FRAME_WIDTH / SpaceshipWarrior.FRAME_HEIGHT,
                0.1,
                1000
            );
            camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
            camera.position.set(0,0,400);

            var axisHelper = new THREE.AxisHelper( 5 );
            scene.add( axisHelper );

            var renderer = new THREE.WebGLRenderer({ alpha: true });

            renderer.setSize( SpaceshipWarrior.FRAME_WIDTH, SpaceshipWarrior.FRAME_HEIGHT );
            renderer.setClearColor( 0xffffff, 1);
            document.body.appendChild( renderer.domElement );


            webgl.scene = scene;
            webgl.camera = camera;
            webgl.renderer = renderer;
        }

        this.render = function(delta) {
            world.setDelta(delta);
            world.process();

            spriteRenderSystem.process();
            //healthRenderSystem.process();
            hudRenderSystem.process();

            webgl.renderer.render(webgl.scene, webgl.camera);
        };

        init();
    };

    module.exports = GameScreen;
})();