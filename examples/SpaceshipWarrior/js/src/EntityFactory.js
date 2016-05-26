(function(ArtemiJS, THREE) {
   'use strict';

    var GroupManager = ArtemiJS.Managers.GroupManager,
        Constants = require('./Constants'),
        MathUtils = require('./utils/MathUtils'),
        Bounds = require('./components/Bounds'),
        ColorAnimation = require('./components/ColorAnimation'),
        Expires = require('./components/Expires'),
        Health = require('./components/Health'),
        ParallaxStar = require('./components/ParallaxStar'),
        Player = require('./components/Player'),
        Bullet = require('./components/Bullet'),
        Position = require('./components/Position'),
        ScaleAnimation = require('./components/ScaleAnimation'),
        Sprite = require('./components/Sprite'),
        Velocity = require('./components/Velocity');

    var EntityFactory = {
        createPlayer: function(world, x, y) {
            var e = world.createEntity();

            x = x || 0;
            y = y || 0;

            var position = new Position();
            position.x = x;
            position.y = y;
            e.addComponent(position);

            var sprite = new Sprite();

            var map = THREE.ImageUtils.loadTexture( "images/fighter.png" );
            var material = new THREE.SpriteMaterial( { map: map } );
            var _sprite = new THREE.Sprite( material );
            _sprite.position.set( 0, 0, 0 );
            _sprite.scale.set( 35, 43, 1 )

            sprite.source = _sprite;

            //sprite.layer = Sprite.Layer.ACTORS_3;
            e.addComponent(sprite);

            var velocity = new Velocity();
            velocity.vectorX = 0;
            velocity.vectorY = 0;
            e.addComponent(velocity);

            var bounds = new Bounds();
            bounds.radius = 43;
            e.addComponent(bounds);

            e.addComponent(new Player());

            world.getManager(GroupManager.klass).add(e, Constants.Groups.PLAYER_SHIP);

            return e;
        },

        createPlayerBullet: function(world, x, y) {
            var e = world.createEntity();

            x = x || 0;
            y = y || 0;

            var position = new Position();
            position.x = x;
            position.y = y;
            e.addComponent(position);

            var sprite = new Sprite();

            var map = THREE.ImageUtils.loadTexture( "images/bullet.png" );
            var material = new THREE.SpriteMaterial( { map: map } );
            var _sprite = new THREE.Sprite( material );
            _sprite.position.set( x, y, 0 );
            _sprite.scale.set( 30, 40, 1 );

            sprite.source = _sprite;
            e.addComponent(sprite);

            var velocity = new Velocity();
            velocity.vectorY = 800;
            e.addComponent(velocity);

            var bounds = new Bounds();
            bounds.radius = 5;
            e.addComponent(bounds);

            var expires = new Expires();
            expires.delay = 5;
            e.addComponent(expires);
            
            e.addComponent(new Bullet());

            world.getManager(GroupManager.klass).add(e, Constants.Groups.PLAYER_BULLETS);

            return e;
        },

        createEnemyShip: function(world, name, layer, health, x, y, velocityX, velocityY, boundsRadius) {
            var e = world.createEntity();

            var position = new Position();
            position.x = x;
            position.y = y;
            e.addComponent(position);

            var sprite = new Sprite();
            sprite.name = name;
            sprite.r = 255/255;
            sprite.g = 0/255;
            sprite.b = 142/255;
            sprite.layer = layer;
            e.addComponent(sprite);

            var velocity = new Velocity();
            velocity.vectorX = velocityX;
            velocity.vectorY = velocityY;
            e.addComponent(velocity);

            var bounds = new Bounds();
            bounds.radius = boundsRadius;
            e.addComponent(bounds);

            var h = new Health();
            h.health = h.maximumHealth = health;
            e.addComponent(h);

            world.getManager(GroupManager.klass).add(e, Constants.Groups.ENEMY_SHIPS);

            return e;
        },

        createExplosion: function(world, x, y, scale) {
            var e = world.createEntity();

            var position = new Position();
            position.x = x;
            position.y = y;
            e.addComponent(position);

            var sprite = new Sprite();
            sprite.name = "explosion";
            sprite.scaleX = sprite.scaleY = scale;
            sprite.r = 1;
            sprite.g = 216/255;
            sprite.b = 0;
            sprite.a = 0.5;
            //sprite.layer = Sprite.Layer.PARTICLES;
            e.addComponent(sprite);

            var expires = new Expires();
            expires.delay = 0.5;
            e.addComponent(expires);


            var scaleAnimation = new ScaleAnimation();
            scaleAnimation.active = true;
            scaleAnimation.max = scale;
            scaleAnimation.min = scale/100;
            scaleAnimation.speed = -3.0;
            scaleAnimation.repeat = false;
            e.addComponent(scaleAnimation);

            return e;
        },

        createStar: function(world) {
            var e = world.createEntity();

            var position = new Position();
            position.x = MathUtils.random(-window.SpaceshipWarrior.FRAME_WIDTH/2, window.SpaceshipWarrior.FRAME_WIDTH/2);
            position.y = MathUtils.random(-window.SpaceshipWarrior.FRAME_HEIGHT/2, window.SpaceshipWarrior.FRAME_HEIGHT/2);
            e.addComponent(position);

            var sprite = new Sprite();
            sprite.name = "particle";
            sprite.scaleX = sprite.scaleY = MathUtils.random(0.5, 1);
            sprite.a = MathUtils.random(0.1, 0.5);
            //sprite.layer = Sprite.Layer.BACKGROUND;
            e.addComponent(sprite);

            var velocity = new Velocity();
            velocity.vectorY = MathUtils.random(-10, -60);
            e.addComponent(velocity);

            e.addComponent(new ParallaxStar());

            var colorAnimation = new ColorAnimation();
            colorAnimation.alphaAnimate = true;
            colorAnimation.repeat = true;
            colorAnimation.alphaSpeed = MathUtils.random(0.2, 0.7);
            colorAnimation.alphaMin = 0.1;
            colorAnimation.alphaMax = 0.5;
            e.addComponent(colorAnimation);

            return e;
        },

        createParticle: function(world, x, y) {
            var e = world.createEntity();

            var position = new Position();
            position.x = x;
            position.y = y;
            e.addComponent(position);

            var sprite = new Sprite();
            sprite.name = "particle";
            sprite.scaleX = sprite.scaleY = MathUtils.random(0.3, 0.6);
            sprite.r = 1;
            sprite.g = 216/255;
            sprite.b = 0;
            sprite.a = 0.5;
            sprite.layer = Sprite.Layer.PARTICLES;
            e.addComponent(sprite);

            var velocity = new Velocity();
            velocity.vectorX = MathUtils.random(-400, 400);
            velocity.vectorY = MathUtils.random(-400, 400);
            e.addComponent(velocity);

            var expires = new Expires();
            expires.delay = 1;
            e.addComponent(expires);

            var colorAnimation = new ColorAnimation();
            colorAnimation.alphaAnimate = true;
            colorAnimation.alphaSpeed = -1;
            colorAnimation.alphaMin = 0;
            colorAnimation.alphaMax = 1;
            colorAnimation.repeat = false;
            e.addComponent(colorAnimation);

            return e;
        }
    };

    module.exports = EntityFactory;
}(window.ArtemiJS, window.THREE));