(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        EntityFactory = require('./../EntityFactory'),
        Position = require('./../components/Position'),
        Velocity = require('./../components/Velocity'),
        Player = require('./../components/Player');

    function PlayerInputSystem(_webgl) {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Velocity.klass, Player.klass));

        var up, down, left, right;

        var webgl = _webgl;

        var mouse3d;

        var canvas;

        var keyboard;

        var projector;

        var fire = false;

        var pos = {
            x: 0,
            y: 0
        };

        /**
         * @property pm
         * @type {ComponentMapper}
         */
        var pm;

        /**
         * @property vm
         * @type {ComponentMapper}
         */
        var vm;

        this.initialize = function() {
            keyboard = new THREEx.KeyboardState();
            pm = this.world.getMapper(Position.klass);
            vm = this.world.getMapper(Velocity.klass);

            document.addEventListener('ondblclick', function(e) {
                e.preventDefault();
            });

            canvas = webgl.renderer.domElement;

            projector = new THREE.Projector();

            canvas.addEventListener('mousemove', calculateMouse3d, false);
            canvas.addEventListener('mousedown', onMouseDown, false);
            canvas.addEventListener('mouseup', onMouseUp, false);
        };

        function onMouseDown(event) {
            fire = true;
        }

        function onMouseUp(event) {
            fire = false;
        }

        function calculateMouse3d(event) {
            var camera = webgl.camera;
            var vector = new THREE.Vector3(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1,
                0.5 );

            projector.unprojectVector( vector, camera );
            var dir = vector.sub( camera.position ).normalize();
            var distance = - camera.position.z / dir.z;
            mouse3d = camera.position.clone().add( dir.multiplyScalar( distance ) );
        }

        function checkPress() {
            if(keyboard.pressed("W")) {
                pos.y = 2.1
            }
            if(keyboard.pressed("A")) {
                pos.x = -2.1;
            }
            if(keyboard.pressed("S")) {
                pos.y = -2.1;
            }
            if(keyboard.pressed("D")) {
                pos.x = 2.1
            }
        }

        function clearPos() {
            pos.x = 0;
            pos.y = 0;
        }

        /**
         * Process entity
         * @param {Entity} entity
         */
        this.innerProcess = function(entity) {
            if(!entity) {
                return;
            }
            var position = pm.get(entity),
                velocity = vm.get(entity);

            if(!position || !velocity) {
                return;
            }
            clearPos();
            checkPress();
            position.x += pos.x;
            position.y += pos.y;
            position.z = 0;
            position.vector = mouse3d;
            if(fire) {
                fire = false;
                EntityFactory.createPlayerBullet(this.world, position.x, position.y).addToWorld();
            }
        }
    }

    PlayerInputSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    PlayerInputSystem.prototype.constructor = PlayerInputSystem;
    module.exports = PlayerInputSystem;
})();