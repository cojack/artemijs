!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SpaceshipWarrior=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function() {

    var Constants = {
        Groups: {
            PLAYER_BULLETS: "player bullets",
            PLAYER_SHIP: "player ship",
            ENEMY_SHIPS: "enemy ships",
            ENEMY_BULLETS: "enemy bullets"
        }
    };

    module.exports = Constants;
})();
},{}],2:[function(_dereq_,module,exports){
(function() {
   'use strict';

    var GroupManager = ArtemiJS.Managers.GroupManager,
        Constants = _dereq_('./Constants'),
        MathUtils = _dereq_('./utils/MathUtils'),
        Bounds = _dereq_('./components/Bounds'),
        ColorAnimation = _dereq_('./components/ColorAnimation'),
        Expires = _dereq_('./components/Expires'),
        Health = _dereq_('./components/Health'),
        ParallaxStar = _dereq_('./components/ParallaxStar'),
        Player = _dereq_('./components/Player'),
        Position = _dereq_('./components/Position'),
        ScaleAnimation = _dereq_('./components/ScaleAnimation'),
        Sprite = _dereq_('./components/Sprite'),
        Velocity = _dereq_('./components/Velocity');

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
            _sprite.scale.set( 30, 40, 1 )

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
            position.x = MathUtils.random(-SpaceshipWarrior.FRAME_WIDTH/2, SpaceshipWarrior.FRAME_WIDTH/2);
            position.y = MathUtils.random(-SpaceshipWarrior.FRAME_HEIGHT/2, SpaceshipWarrior.FRAME_HEIGHT/2);
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
})();
},{"./Constants":1,"./components/Bounds":5,"./components/ColorAnimation":6,"./components/Expires":7,"./components/Health":8,"./components/ParallaxStar":9,"./components/Player":10,"./components/Position":11,"./components/ScaleAnimation":12,"./components/Sprite":13,"./components/Velocity":14,"./utils/MathUtils":27}],3:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var World = ArtemiJS.World,
        GroupManager = ArtemiJS.Managers.GroupManager,
        EntityFactory = _dereq_ ('./EntityFactory'),
        MovementSystem = _dereq_('./systems/MovementSystem'),
        PlayerInputSystem = _dereq_('./systems/PlayerInputSystem'),
        CollisionSystem = _dereq_('./systems/CollisionSystem'),
        ExpiringSystem = _dereq_('./systems/ExpiringSystem'),
        EntitySpawningTimerSystem = _dereq_('./systems/EntitySpawningTimerSystem'),
        ParallaxStarRepeatingSystem = _dereq_('./systems/ParallaxStarRepeatingSystem'),
        ColorAnimationSystem = _dereq_('./systems/ColorAnimationSystem'),
        ScaleAnimationSystem = _dereq_('./systems/ScaleAnimationSystem'),
        RemoveOffscreenShipsSystem = _dereq_('./systems/RemoveOffscreenShipsSystem'),
        SpriteRenderSystem = _dereq_('./systems/SpriteRenderSystem'),
        HealthRenderSystem = _dereq_('./systems/HealthRenderSystem'),
        HudRenderSystem = _dereq_('./systems/HudRenderSystem');

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
},{"./EntityFactory":2,"./systems/CollisionSystem":15,"./systems/ColorAnimationSystem":16,"./systems/EntitySpawningTimerSystem":17,"./systems/ExpiringSystem":18,"./systems/HealthRenderSystem":19,"./systems/HudRenderSystem":20,"./systems/MovementSystem":21,"./systems/ParallaxStarRepeatingSystem":22,"./systems/PlayerInputSystem":23,"./systems/RemoveOffscreenShipsSystem":24,"./systems/ScaleAnimationSystem":25,"./systems/SpriteRenderSystem":26}],4:[function(_dereq_,module,exports){
(function() {
    /* global requestAnimationFrame, ArtemiJS*/

    'use strict';

    var GameScreen = _dereq_('./GameScreen');

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
},{"./GameScreen":3}],5:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Bounds() {
        Component.call(this);

        /**
         * @property radius
         * @type {Number}
         */
        this.radius;
    }

    Bounds.prototype = Object.create(Component.prototype);
    Bounds.prototype.constructor = Bounds;
    module.exports = Bounds;
})();
},{}],6:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    /**
     * @class ColorAnimation
     * @constructor
     */
    var ColorAnimation = function ColorAnimation() {
        Component.call(this);


        this.redMin,
            this.redMax,
            this.redSpeed;
        this.greenMin,
            this.greenMax,
            this.greenSpeed;
        this.blueMin,
            this.blueMax,
            this.blueSpeed;
        this.alphaMin,
            this.alphaMax,
            this.alphaSpeed;

        this.redAnimate,
            this.greenAnimate,
            this.blueAnimate,
            this.alphaAnimate,
            this.repeat;

    };

    ColorAnimation.prototype = Object.create(Component.prototype);
    ColorAnimation.prototype.constructor = ColorAnimation;
    module.exports = ColorAnimation;
})();
},{}],7:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Expires() {
        Component.call(this);

        /**
         * @property delay
         * @type {Number}
         */
        this.delay;
    }

    Expires.prototype = Object.create(Component.prototype);
    Expires.prototype.constructor = Expires;
    module.exports = Expires;
})();
},{}],8:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Health() {
        Component.call(this);

        /**
         * @property health
         * @type {Number}
         */
        this.health;

        /**
         * @property maximumHealth
         * @type {Number}
         */
        this.maximumHealth;
    }

    Health.prototype = Object.create(Component.prototype);
    Health.prototype.constructor = Health;
    module.exports = Health;
})();
},{}],9:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function ParallaxStar() {
        Component.call(this);
    }

    ParallaxStar.prototype = Object.create(Component.prototype);
    ParallaxStar.prototype.constructor = ParallaxStar;
    module.exports = ParallaxStar;
})();
},{}],10:[function(_dereq_,module,exports){
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
},{}],11:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    var Position = function Position() {
        Component.call(this);

        /**
         * @property cords
         * @type {THREE.Vector2}
         */
        this.cords;
    };

    Position.prototype = Object.create(Component.prototype);
    Position.prototype.constructor = Position;
    module.exports = Position;
})();
},{}],12:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function ScaleAnimation() {
        Component.call(this);

        /**
         * @property min
         * @type {Number}
         */
        this.min;

        /**
         * @property max
         * @type {Number}
         */
        this.max;

        /**
         * @property speed
         * @type {Number}
         */
        this.speed;

        /**
         * @property repeat
         * @type {boolean}
         */
        this.repeat;

        /**
         * @property active
         * @type {boolean}
         */
        this.active;
    }

    ScaleAnimation.prototype = Object.create(Component.prototype);
    ScaleAnimation.prototype.constructor = ScaleAnimation;
    module.exports = ScaleAnimation;
})();
},{}],13:[function(_dereq_,module,exports){
(function() {
   'use strict';

    var Component = ArtemiJS.Component;

    var Sprite = function Sprite() {
        Component.call(this);

        this.source = null;
    };

    Sprite.prototype = Object.create(Sprite.prototype);
    Sprite.prototype.constructor = Sprite;
    module.exports = Sprite;
})();
},{}],14:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var Component = ArtemiJS.Component;

    function Velocity() {
        Component.call(this);

        /**
         * @property vector
         * @type {THREE.Vector2}
         */
        this.vector;
    }

    Velocity.prototype = Object.create(Component.prototype);
    Velocity.prototype.constructor = Velocity;
    module.exports = Velocity;
})();
},{}],15:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        Position = _dereq_('./../components/Position'),
        Bounds = _dereq_('./../components/Bounds');

    var CollisionSystem = function CollisionSystem() {
        EntitySystem.call(this, Aspect.getAspectForAll(Position.klass, Bounds.klass));

        /**
         * @property collisionPairs
         * @private
         * @type {Bag}
         */
        var collisionPairs;

        this.processEntities = function(entities) {
            return;
            for(var i = 0; collisionPairs.size() > i; i++) {
                collisionPairs.get(i).checkForCollisions();
            }
        };

        this.checkProcessing = function() {
            return true;
        }
    };

    var CollisionHandler = function CollisionHandler() {
        this.handleCollision = function(foo, bar) {
            throw new Error("Function handleCollision not implemented");
        }
    };

    CollisionSystem.prototype = Object.create(EntitySystem.prototype);
    CollisionSystem.prototype.constructor = CollisionSystem;
    module.exports = CollisionSystem;

})();
},{"./../components/Bounds":5,"./../components/Position":11}],16:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ColorAnimation = _dereq_('./../components/ColorAnimation'),
        Sprite = _dereq_('./../components/Sprite');

    var ColorAnimationSystem = function ColorAnimationSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(ColorAnimation.klass, Sprite.klass));

        var cam;
        var sm;

        this.initialize = function() {
            cam = this.world.getMapper(ColorAnimation.klass);
            sm = this.world.getMapper(Sprite.klass);
        }

        this.innerProcess = function(entity) {
            /**
             * @property c
             * @type {ColorAnimation}
             */
            var c = cam.get(entity),

                /**
                 * @property sprite
                 * @type {Sprite}
                 */
                sprite = sm.get(entity);

            if(!c || !sprite) {
                return;
            }

            if(c.alphaAnimate) {
                sprite.a += c.alphaSpeed * this.world.getDelta();

                if(sprite.a > c.alphaMax || sprite.a < c.alphaMin) {
                    if(c.repeat) {
                        c.alphaSpeed = -c.alphaSpeed;
                    } else {
                        c.alphaAnimate = false;
                    }
                }
            }
        }
    };

    ColorAnimationSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    ColorAnimationSystem.prototype.constructor = ColorAnimationSystem;
    module.exports = ColorAnimationSystem;
})();
},{"./../components/ColorAnimation":6,"./../components/Sprite":13}],17:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var VoidEntitySystem = ArtemiJS.Systems.VoidEntitySystem,
        Timer = ArtemiJS.Utils.Timer;

    var EntitySpawningTimerSystem = function EntitySpawningTimerSystem() {
        VoidEntitySystem.call(this);

        /**
         * @property timer1
         * @private
         * @type {Timer}
         */
        var timer1

        /**
         * @property timer2
         * @private
         * @type {Timer}
         */
        var timer2;

        /**
         * @property timer3
         * @private
         * @type {Timer}
         */
        var timer3;

        this.initialize = function() {

        }

        this.processEntities = function() {
            return;
            timer1.update(this.world.getDelta());
            timer2.update(this.world.getDelta());
            timer3.update(this.world.getDelta());
        }
    };

    EntitySpawningTimerSystem.prototype = Object.create(VoidEntitySystem.prototype);
    EntitySpawningTimerSystem.prototype.constructor = EntitySpawningTimerSystem;

    module.exports = EntitySpawningTimerSystem;
})();
},{}],18:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var DelayedEntityProcessingSystem = ArtemiJS.Systems.DelayedEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Expires = _dereq_('./../components/Expires');

    var ExpiringSystem = function ExpiringSystem() {
        DelayedEntityProcessingSystem.call(this, Aspect.getAspectForAll(Expires.klass));

        var em;

        this.processDelta = function(entity, accumulatedDelta) {
            var expires = em.get(entity);
            expires.delay -= accumulatedDelta;
        };

        this.processExpired = function(entity) {
            entity.deleteFromWorld();
        };

        this.getRemainingDelay = function(entity) {
            var expires = em.get(entity);
            return expires.delay;
        }
    };

    ExpiringSystem.prototype = Object.create(DelayedEntityProcessingSystem.prototype);
    ExpiringSystem.prototype.constructor = ExpiringSystem;
    module.exports = ExpiringSystem;

})();
},{"./../components/Expires":7}],19:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Position = _dereq_('./../components/Position'),
        Health = _dereq_('./../components/Health');

    var HealthRenderSystem = function HealthRenderSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Health.klass))

        /**
         * @type ComponentMapper
         */
        var pm;

        /**
         * @type ComponentMapper
         */
        var hm;

        var healthText;

        this.initialize = function() {
            healthText = document.createElement('div');
            healthText.style.position = 'absolute';
            //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
            healthText.style.width = 100;
            healthText.style.height = 100;
            healthText.innerHTML = "";
            healthText.style.top = 200 + 'px';
            healthText.style.left = 200 + 'px';
            document.body.appendChild(healthText);
        };

        this.initialProcess = function(entity) {
            var position = pm.get(entity);
            var health = hm.get(entity);

            var percentage = Math.round(health.health/health.maximumHealth*100);
            healthText.innerHTML = percentage+"%";
            healthText.style.top = position.x;
            healthText.style.left = position.y;
        };
    };

    HealthRenderSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    HealthRenderSystem.prototype.constructor = HealthRenderSystem;
    module.exports = HealthRenderSystem;
})();
},{"./../components/Health":8,"./../components/Position":11}],20:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var VoidEntitySystem = ArtemiJS.Systems.VoidEntitySystem;

    var HudRenderSystem = function HudRenderSystem(camer) {
        VoidEntitySystem.call(this);

        var healthText;

        this.initialize = function() {
            healthText = document.createElement('div');
            healthText.style.position = 'absolute';
            //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
            healthText.style.width = 100;
            healthText.style.height = 100;
            healthText.innerHTML = "";
            healthText.style.top = 200 + 'px';
            healthText.style.left = 200 + 'px';
            document.body.appendChild(healthText);
        };

        this.processSystem = function() {
            healthText.innerHTML = "Active entities: " + this.world.getEntityManager().getActiveEntityCount();
            healthText.style.top = -(SpaceshipWarrior.FRAME_WIDTH / 2) + 20;
            healthText.style.left =  SpaceshipWarrior.FRAME_HEIGHT / 2 - 40;
        }
    };

    HudRenderSystem.prototype = Object.create(VoidEntitySystem.prototype);
    HudRenderSystem.prototype.constructor = HudRenderSystem;
    module.exports = HudRenderSystem;
})();
},{}],21:[function(_dereq_,module,exports){
(function() {
    /*global ArtemiJS*/
    
    'use strict';
        var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
            Aspect = ArtemiJS.Aspect,
            Position = _dereq_('./../components/Position'),
            Velocity = _dereq_('./../components/Velocity');
        
    var MovementSystem = function MovementSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Velocity.klass));
        
        var pm, vm;

        this.initialize = function() {
            pm = this.world.getMapper(Position.klass);
            vm = this.world.getMapper(Velocity.klass);
        };
        
        this.process = function(entity) {
            if(!entity) {
                return;0
            }
            var position = pm.get(entity),
                velocity = vm.get(entity);
           
            position.x += velocity.vectorX*this.world.getDelta();
            position.y += velocity.vectorY*this.world.getDelta();
        };
    };
    
    
    MovementSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    MovementSystem.prototype.constructor = MovementSystem;
    module.exports = MovementSystem;
})();
},{"./../components/Position":11,"./../components/Velocity":14}],22:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ParallaxStar = _dereq_('./../components/ParallaxStar'),
        Position = _dereq_('./../components/Position');

    var ParallaxStarRepeatingSystem = function ParallaxStarRepeatingSystem() {
        IntervalEntityProcessingSystem.call(this, Aspect.getAspectForAll(ParallaxStar.klass, Position.klass), 1);


        var pm;


        this.innerProcess = function(entity) {
            var position = pm.get(entity);
            if (position.y < -SpaceshipWarrior.FRAME_HEIGHT / 2) {
                position.y = SpaceshipWarrior.FRAME_HEIGHT / 2;
            }
        }

    };

    ParallaxStarRepeatingSystem.prototype = Object.create(IntervalEntityProcessingSystem.prototype);
    ParallaxStarRepeatingSystem.prototype.constructor = ParallaxStarRepeatingSystem;
    module.exports = ParallaxStarRepeatingSystem;
})();
},{"./../components/ParallaxStar":9,"./../components/Position":11}],23:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        EntityFactory = _dereq_('./../EntityFactory'),
        Position = _dereq_('./../components/Position'),
        Velocity = _dereq_('./../components/Velocity'),
        Player = _dereq_('./../components/Player');

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
},{"./../EntityFactory":2,"./../components/Player":10,"./../components/Position":11,"./../components/Velocity":14}],24:[function(_dereq_,module,exports){
(function(){
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Velocity = _dereq_("./../components/Velocity"),
        Position = _dereq_("./../components/Position"),
        Health = _dereq_("./../components/Health"),
        Bounds = _dereq_("./../components/Bounds"),
        Player = _dereq_("./../components/Player");

    var RemoveOffscreenShipsSystem = function RemoveOffscreenShipsSystem() {
        IntervalEntityProcessingSystem.call(this, Aspect.getAspectForAll(
            Velocity.klass,
            Position.klass,
            Health.klass,
            Bounds.klass
        ).exclude(Player.klass), 5);

        var pm;
        var bm;

        this.innerProcess = function() {
            var position = pm.get(e),
                bounds = bm.get(e);

            if(position.y < - SpaceshipWarrior.FRAME_HEIGHT/2-bounds.radius) {
                e.deleteFromWorld();
            }
        }

    };

    RemoveOffscreenShipsSystem.prototype = Object.create(IntervalEntityProcessingSystem.prototype);
    RemoveOffscreenShipsSystem.prototype.constructor = RemoveOffscreenShipsSystem;
    module.exports = RemoveOffscreenShipsSystem;
})();
},{"./../components/Bounds":5,"./../components/Health":8,"./../components/Player":10,"./../components/Position":11,"./../components/Velocity":14}],25:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ScaleAnimation = _dereq_('./../components/ScaleAnimation');

    var ScaleAnimationSystem = function ScaleAnimationSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForOne(ScaleAnimation.klass));

        var sa;
        var sm;

        this.innerProcess = function(entity) {
            var scaleAnimation = sa.get(entity);
            if (scaleAnimation.active) {
                var sprite = sm.get(entity);

                sprite.scaleX += scaleAnimation.speed * this.world.getDelta();
                sprite.scaleY = sprite.scaleX;

                if (sprite.scaleX > scaleAnimation.max) {
                    sprite.scaleX = scaleAnimation.max;
                    scaleAnimation.active = false;
                } else if (sprite.scaleX < scaleAnimation.min) {
                    sprite.scaleX = scaleAnimation.min;
                    scaleAnimation.active = false;
                }
            }
        }
    };

    ScaleAnimationSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    ScaleAnimationSystem.prototype.constructor = ScaleAnimationSystem;
    module.exports = ScaleAnimationSystem;
})();
},{"./../components/ScaleAnimation":12}],26:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        MathUtils = _dereq_('./../utils/MathUtils'),
        Position = _dereq_('./../components/Position'),
        Sprite = _dereq_('./../components/Sprite');

    var SpriteRenderSystem = function SpriteRenderSystem(webgl) {
        EntitySystem.call(this, Aspect.getAspectForAll(Position.klass, Sprite.klass));

        /**
         * @type ComponentMapper<Position>;
         */
        var pm;

        /**
         * @type ComponentMapper<Sprite>
         */
        var sm;

        this.initialize = function() {
            pm = this.world.getMapper(Position.klass);
            sm = this.world.getMapper(Sprite.klass);
        };

        this.checkProcessing = function() {
            return true;
        };

        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };

        this.innerProcess = function(entity) {
            if(!pm.has(entity)) {
                return;
            }

            var position = pm.get(entity);
            var sprite = sm.get(entity);

            sprite.source.position.set(position.x, position.y, position.z);
            if(position.vector) {
                sprite.source.material.rotation = MathUtils.angle(
                    position.vector.x,
                    sprite.source.position.x,
                    position.vector.y,
                    sprite.source.position.y
                );
            }
        };

        this.inserted = function(entity) {
            var sprite = sm.get(entity);
            if(sprite) {
                webgl.scene.add(sprite.source);
            }
        }
    };

    SpriteRenderSystem.prototype = Object.create(EntitySystem.prototype);
    SpriteRenderSystem.prototype.constructor = SpriteRenderSystem;
    module.exports = SpriteRenderSystem;
})();
},{"./../components/Position":11,"./../components/Sprite":13,"./../utils/MathUtils":27}],27:[function(_dereq_,module,exports){
(function() {
    'use strict';

    var MathUtils = {
        random: function(min, max) {
            return Math.floor(Math.random()*(max-min+1)+min);
        },

        deg2rad: function(deg) {
            return deg * Math.PI/180;
        },

        angle: function(x1,x2,y1,y2) {
            var deg = Math.atan2((y1 - y2),(x1 - x2)) * 180 / Math.PI;
            return this.deg2rad(deg)- Math.PI/2;
        }
    };

    module.exports = MathUtils;
})();
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9jb2phY2svLm52bS92MC4xMC4yNi9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9Db25zdGFudHMuanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9FbnRpdHlGYWN0b3J5LmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvR2FtZVNjcmVlbi5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL1NwYWNlc2hpcFdhcnJpb3IuanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9jb21wb25lbnRzL0JvdW5kcy5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL2NvbXBvbmVudHMvQ29sb3JBbmltYXRpb24uanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9jb21wb25lbnRzL0V4cGlyZXMuanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9jb21wb25lbnRzL0hlYWx0aC5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL2NvbXBvbmVudHMvUGFyYWxsYXhTdGFyLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvY29tcG9uZW50cy9QbGF5ZXIuanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9jb21wb25lbnRzL1Bvc2l0aW9uLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvY29tcG9uZW50cy9TY2FsZUFuaW1hdGlvbi5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL2NvbXBvbmVudHMvU3ByaXRlLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvY29tcG9uZW50cy9WZWxvY2l0eS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvQ29sbGlzaW9uU3lzdGVtLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvc3lzdGVtcy9Db2xvckFuaW1hdGlvblN5c3RlbS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvRXhwaXJpbmdTeXN0ZW0uanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9zeXN0ZW1zL0hlYWx0aFJlbmRlclN5c3RlbS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvSHVkUmVuZGVyU3lzdGVtLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvc3lzdGVtcy9Nb3ZlbWVudFN5c3RlbS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvUGFyYWxsYXhTdGFyUmVwZWF0aW5nU3lzdGVtLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvc3lzdGVtcy9QbGF5ZXJJbnB1dFN5c3RlbS5qcyIsIi9ob21lL2NvamFjay9Qcm9qZWN0cy9zcmMvYXJ0ZW1panMvZXhhbXBsZXMvU3BhY2VzaGlwV2Fycmlvci93ZWIvanMvc3JjL3N5c3RlbXMvUmVtb3ZlT2Zmc2NyZWVuU2hpcHNTeXN0ZW0uanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy9zeXN0ZW1zL1NjYWxlQW5pbWF0aW9uU3lzdGVtLmpzIiwiL2hvbWUvY29qYWNrL1Byb2plY3RzL3NyYy9hcnRlbWlqcy9leGFtcGxlcy9TcGFjZXNoaXBXYXJyaW9yL3dlYi9qcy9zcmMvc3lzdGVtcy9TcHJpdGVSZW5kZXJTeXN0ZW0uanMiLCIvaG9tZS9jb2phY2svUHJvamVjdHMvc3JjL2FydGVtaWpzL2V4YW1wbGVzL1NwYWNlc2hpcFdhcnJpb3Ivd2ViL2pzL3NyYy91dGlscy9NYXRoVXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIENvbnN0YW50cyA9IHtcbiAgICAgICAgR3JvdXBzOiB7XG4gICAgICAgICAgICBQTEFZRVJfQlVMTEVUUzogXCJwbGF5ZXIgYnVsbGV0c1wiLFxuICAgICAgICAgICAgUExBWUVSX1NISVA6IFwicGxheWVyIHNoaXBcIixcbiAgICAgICAgICAgIEVORU1ZX1NISVBTOiBcImVuZW15IHNoaXBzXCIsXG4gICAgICAgICAgICBFTkVNWV9CVUxMRVRTOiBcImVuZW15IGJ1bGxldHNcIlxuICAgICAgICB9XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29uc3RhbnRzO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgR3JvdXBNYW5hZ2VyID0gQXJ0ZW1pSlMuTWFuYWdlcnMuR3JvdXBNYW5hZ2VyLFxuICAgICAgICBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpLFxuICAgICAgICBNYXRoVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL01hdGhVdGlscycpLFxuICAgICAgICBCb3VuZHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQm91bmRzJyksXG4gICAgICAgIENvbG9yQW5pbWF0aW9uID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbG9yQW5pbWF0aW9uJyksXG4gICAgICAgIEV4cGlyZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvRXhwaXJlcycpLFxuICAgICAgICBIZWFsdGggPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvSGVhbHRoJyksXG4gICAgICAgIFBhcmFsbGF4U3RhciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9QYXJhbGxheFN0YXInKSxcbiAgICAgICAgUGxheWVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1BsYXllcicpLFxuICAgICAgICBQb3NpdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9Qb3NpdGlvbicpLFxuICAgICAgICBTY2FsZUFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9TY2FsZUFuaW1hdGlvbicpLFxuICAgICAgICBTcHJpdGUgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU3ByaXRlJyksXG4gICAgICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1ZlbG9jaXR5Jyk7XG5cbiAgICB2YXIgRW50aXR5RmFjdG9yeSA9IHtcbiAgICAgICAgY3JlYXRlUGxheWVyOiBmdW5jdGlvbih3b3JsZCwgeCwgeSkge1xuICAgICAgICAgICAgdmFyIGUgPSB3b3JsZC5jcmVhdGVFbnRpdHkoKTtcblxuICAgICAgICAgICAgeCA9IHggfHwgMDtcbiAgICAgICAgICAgIHkgPSB5IHx8IDA7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCA9IHg7XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0geTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBTcHJpdGUoKTtcblxuICAgICAgICAgICAgdmFyIG1hcCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoIFwiaW1hZ2VzL2ZpZ2h0ZXIucG5nXCIgKTtcbiAgICAgICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVNYXRlcmlhbCggeyBtYXA6IG1hcCB9ICk7XG4gICAgICAgICAgICB2YXIgX3Nwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUoIG1hdGVyaWFsICk7XG4gICAgICAgICAgICBfc3ByaXRlLnBvc2l0aW9uLnNldCggMCwgMCwgMCApO1xuICAgICAgICAgICAgX3Nwcml0ZS5zY2FsZS5zZXQoIDM1LCA0MywgMSApXG5cbiAgICAgICAgICAgIHNwcml0ZS5zb3VyY2UgPSBfc3ByaXRlO1xuXG4gICAgICAgICAgICAvL3Nwcml0ZS5sYXllciA9IFNwcml0ZS5MYXllci5BQ1RPUlNfMztcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNwcml0ZSk7XG5cbiAgICAgICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBWZWxvY2l0eSgpO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWCA9IDA7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JZID0gMDtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHZlbG9jaXR5KTtcblxuICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBCb3VuZHMoKTtcbiAgICAgICAgICAgIGJvdW5kcy5yYWRpdXMgPSA0MztcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGJvdW5kcyk7XG5cbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KG5ldyBQbGF5ZXIoKSk7XG5cbiAgICAgICAgICAgIHdvcmxkLmdldE1hbmFnZXIoR3JvdXBNYW5hZ2VyLmNsYXNzKS5hZGQoZSwgQ29uc3RhbnRzLkdyb3Vwcy5QTEFZRVJfU0hJUCk7XG5cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVBsYXllckJ1bGxldDogZnVuY3Rpb24od29ybGQsIHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBlID0gd29ybGQuY3JlYXRlRW50aXR5KCk7XG5cbiAgICAgICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgICAgICB5ID0geSB8fCAwO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChwb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgU3ByaXRlKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCBcImltYWdlcy9idWxsZXQucG5nXCIgKTtcbiAgICAgICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVNYXRlcmlhbCggeyBtYXA6IG1hcCB9ICk7XG4gICAgICAgICAgICB2YXIgX3Nwcml0ZSA9IG5ldyBUSFJFRS5TcHJpdGUoIG1hdGVyaWFsICk7XG4gICAgICAgICAgICBfc3ByaXRlLnBvc2l0aW9uLnNldCggeCwgeSwgMCApO1xuICAgICAgICAgICAgX3Nwcml0ZS5zY2FsZS5zZXQoIDMwLCA0MCwgMSApXG5cbiAgICAgICAgICAgIHNwcml0ZS5zb3VyY2UgPSBfc3ByaXRlO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoc3ByaXRlKTtcblxuICAgICAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFZlbG9jaXR5KCk7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JZID0gODAwO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQodmVsb2NpdHkpO1xuXG4gICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IEJvdW5kcygpO1xuICAgICAgICAgICAgYm91bmRzLnJhZGl1cyA9IDU7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChib3VuZHMpO1xuXG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IG5ldyBFeHBpcmVzKCk7XG4gICAgICAgICAgICBleHBpcmVzLmRlbGF5ID0gNTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGV4cGlyZXMpO1xuXG4gICAgICAgICAgICB3b3JsZC5nZXRNYW5hZ2VyKEdyb3VwTWFuYWdlci5jbGFzcykuYWRkKGUsIENvbnN0YW50cy5Hcm91cHMuUExBWUVSX0JVTExFVFMpO1xuXG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFbmVteVNoaXA6IGZ1bmN0aW9uKHdvcmxkLCBuYW1lLCBsYXllciwgaGVhbHRoLCB4LCB5LCB2ZWxvY2l0eVgsIHZlbG9jaXR5WSwgYm91bmRzUmFkaXVzKSB7XG4gICAgICAgICAgICB2YXIgZSA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChwb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgU3ByaXRlKCk7XG4gICAgICAgICAgICBzcHJpdGUubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBzcHJpdGUuciA9IDI1NS8yNTU7XG4gICAgICAgICAgICBzcHJpdGUuZyA9IDAvMjU1O1xuICAgICAgICAgICAgc3ByaXRlLmIgPSAxNDIvMjU1O1xuICAgICAgICAgICAgc3ByaXRlLmxheWVyID0gbGF5ZXI7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChzcHJpdGUpO1xuXG4gICAgICAgICAgICB2YXIgdmVsb2NpdHkgPSBuZXcgVmVsb2NpdHkoKTtcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclggPSB2ZWxvY2l0eVg7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JZID0gdmVsb2NpdHlZO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQodmVsb2NpdHkpO1xuXG4gICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IEJvdW5kcygpO1xuICAgICAgICAgICAgYm91bmRzLnJhZGl1cyA9IGJvdW5kc1JhZGl1cztcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGJvdW5kcyk7XG5cbiAgICAgICAgICAgIHZhciBoID0gbmV3IEhlYWx0aCgpO1xuICAgICAgICAgICAgaC5oZWFsdGggPSBoLm1heGltdW1IZWFsdGggPSBoZWFsdGg7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChoKTtcblxuICAgICAgICAgICAgd29ybGQuZ2V0TWFuYWdlcihHcm91cE1hbmFnZXIuY2xhc3MpLmFkZChlLCBDb25zdGFudHMuR3JvdXBzLkVORU1ZX1NISVBTKTtcblxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXhwbG9zaW9uOiBmdW5jdGlvbih3b3JsZCwgeCwgeSwgc2NhbGUpIHtcbiAgICAgICAgICAgIHZhciBlID0gd29ybGQuY3JlYXRlRW50aXR5KCk7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCA9IHg7XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0geTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBTcHJpdGUoKTtcbiAgICAgICAgICAgIHNwcml0ZS5uYW1lID0gXCJleHBsb3Npb25cIjtcbiAgICAgICAgICAgIHNwcml0ZS5zY2FsZVggPSBzcHJpdGUuc2NhbGVZID0gc2NhbGU7XG4gICAgICAgICAgICBzcHJpdGUuciA9IDE7XG4gICAgICAgICAgICBzcHJpdGUuZyA9IDIxNi8yNTU7XG4gICAgICAgICAgICBzcHJpdGUuYiA9IDA7XG4gICAgICAgICAgICBzcHJpdGUuYSA9IDAuNTtcbiAgICAgICAgICAgIC8vc3ByaXRlLmxheWVyID0gU3ByaXRlLkxheWVyLlBBUlRJQ0xFUztcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNwcml0ZSk7XG5cbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gbmV3IEV4cGlyZXMoKTtcbiAgICAgICAgICAgIGV4cGlyZXMuZGVsYXkgPSAwLjU7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChleHBpcmVzKTtcblxuXG4gICAgICAgICAgICB2YXIgc2NhbGVBbmltYXRpb24gPSBuZXcgU2NhbGVBbmltYXRpb24oKTtcbiAgICAgICAgICAgIHNjYWxlQW5pbWF0aW9uLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5tYXggPSBzY2FsZTtcbiAgICAgICAgICAgIHNjYWxlQW5pbWF0aW9uLm1pbiA9IHNjYWxlLzEwMDtcbiAgICAgICAgICAgIHNjYWxlQW5pbWF0aW9uLnNwZWVkID0gLTMuMDtcbiAgICAgICAgICAgIHNjYWxlQW5pbWF0aW9uLnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoc2NhbGVBbmltYXRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTdGFyOiBmdW5jdGlvbih3b3JsZCkge1xuICAgICAgICAgICAgdmFyIGUgPSB3b3JsZC5jcmVhdGVFbnRpdHkoKTtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gTWF0aFV0aWxzLnJhbmRvbSgtU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9XSURUSC8yLCBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX1dJRFRILzIpO1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IE1hdGhVdGlscy5yYW5kb20oLVNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hULzIsIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hULzIpO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQocG9zaXRpb24pO1xuXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IFNwcml0ZSgpO1xuICAgICAgICAgICAgc3ByaXRlLm5hbWUgPSBcInBhcnRpY2xlXCI7XG4gICAgICAgICAgICBzcHJpdGUuc2NhbGVYID0gc3ByaXRlLnNjYWxlWSA9IE1hdGhVdGlscy5yYW5kb20oMC41LCAxKTtcbiAgICAgICAgICAgIHNwcml0ZS5hID0gTWF0aFV0aWxzLnJhbmRvbSgwLjEsIDAuNSk7XG4gICAgICAgICAgICAvL3Nwcml0ZS5sYXllciA9IFNwcml0ZS5MYXllci5CQUNLR1JPVU5EO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoc3ByaXRlKTtcblxuICAgICAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFZlbG9jaXR5KCk7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JZID0gTWF0aFV0aWxzLnJhbmRvbSgtMTAsIC02MCk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudCh2ZWxvY2l0eSk7XG5cbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KG5ldyBQYXJhbGxheFN0YXIoKSk7XG5cbiAgICAgICAgICAgIHZhciBjb2xvckFuaW1hdGlvbiA9IG5ldyBDb2xvckFuaW1hdGlvbigpO1xuICAgICAgICAgICAgY29sb3JBbmltYXRpb24uYWxwaGFBbmltYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLnJlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYVNwZWVkID0gTWF0aFV0aWxzLnJhbmRvbSgwLjIsIDAuNyk7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYU1pbiA9IDAuMTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhTWF4ID0gMC41O1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoY29sb3JBbmltYXRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVQYXJ0aWNsZTogZnVuY3Rpb24od29ybGQsIHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBlID0gd29ybGQuY3JlYXRlRW50aXR5KCk7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCA9IHg7XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0geTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBTcHJpdGUoKTtcbiAgICAgICAgICAgIHNwcml0ZS5uYW1lID0gXCJwYXJ0aWNsZVwiO1xuICAgICAgICAgICAgc3ByaXRlLnNjYWxlWCA9IHNwcml0ZS5zY2FsZVkgPSBNYXRoVXRpbHMucmFuZG9tKDAuMywgMC42KTtcbiAgICAgICAgICAgIHNwcml0ZS5yID0gMTtcbiAgICAgICAgICAgIHNwcml0ZS5nID0gMjE2LzI1NTtcbiAgICAgICAgICAgIHNwcml0ZS5iID0gMDtcbiAgICAgICAgICAgIHNwcml0ZS5hID0gMC41O1xuICAgICAgICAgICAgc3ByaXRlLmxheWVyID0gU3ByaXRlLkxheWVyLlBBUlRJQ0xFUztcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNwcml0ZSk7XG5cbiAgICAgICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBWZWxvY2l0eSgpO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWCA9IE1hdGhVdGlscy5yYW5kb20oLTQwMCwgNDAwKTtcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclkgPSBNYXRoVXRpbHMucmFuZG9tKC00MDAsIDQwMCk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudCh2ZWxvY2l0eSk7XG5cbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gbmV3IEV4cGlyZXMoKTtcbiAgICAgICAgICAgIGV4cGlyZXMuZGVsYXkgPSAxO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoZXhwaXJlcyk7XG5cbiAgICAgICAgICAgIHZhciBjb2xvckFuaW1hdGlvbiA9IG5ldyBDb2xvckFuaW1hdGlvbigpO1xuICAgICAgICAgICAgY29sb3JBbmltYXRpb24uYWxwaGFBbmltYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhU3BlZWQgPSAtMTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhTWluID0gMDtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhTWF4ID0gMTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoY29sb3JBbmltYXRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eUZhY3Rvcnk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgV29ybGQgPSBBcnRlbWlKUy5Xb3JsZCxcbiAgICAgICAgR3JvdXBNYW5hZ2VyID0gQXJ0ZW1pSlMuTWFuYWdlcnMuR3JvdXBNYW5hZ2VyLFxuICAgICAgICBFbnRpdHlGYWN0b3J5ID0gcmVxdWlyZSAoJy4vRW50aXR5RmFjdG9yeScpLFxuICAgICAgICBNb3ZlbWVudFN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9Nb3ZlbWVudFN5c3RlbScpLFxuICAgICAgICBQbGF5ZXJJbnB1dFN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9QbGF5ZXJJbnB1dFN5c3RlbScpLFxuICAgICAgICBDb2xsaXNpb25TeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvQ29sbGlzaW9uU3lzdGVtJyksXG4gICAgICAgIEV4cGlyaW5nU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0V4cGlyaW5nU3lzdGVtJyksXG4gICAgICAgIEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbScpLFxuICAgICAgICBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvUGFyYWxsYXhTdGFyUmVwZWF0aW5nU3lzdGVtJyksXG4gICAgICAgIENvbG9yQW5pbWF0aW9uU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0NvbG9yQW5pbWF0aW9uU3lzdGVtJyksXG4gICAgICAgIFNjYWxlQW5pbWF0aW9uU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL1NjYWxlQW5pbWF0aW9uU3lzdGVtJyksXG4gICAgICAgIFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL1JlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtJyksXG4gICAgICAgIFNwcml0ZVJlbmRlclN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9TcHJpdGVSZW5kZXJTeXN0ZW0nKSxcbiAgICAgICAgSGVhbHRoUmVuZGVyU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0hlYWx0aFJlbmRlclN5c3RlbScpLFxuICAgICAgICBIdWRSZW5kZXJTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvSHVkUmVuZGVyU3lzdGVtJyk7XG5cbiAgICB2YXIgR2FtZVNjcmVlbiA9IGZ1bmN0aW9uIEdhbWVTY3JlZW4oKSB7XG4gICAgICAgIHZhciB3b3JsZDtcblxuICAgICAgICB2YXIgd2ViZ2wgPSB7XG4gICAgICAgICAgICBcInNjZW5lXCI6IG51bGwsXG4gICAgICAgICAgICBcImNhbWVyYVwiOiBudWxsLFxuICAgICAgICAgICAgXCJyZW5kZXJlclwiOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNwcml0ZVJlbmRlclN5c3RlbTtcbiAgICAgICAgdmFyIGhlYWx0aFJlbmRlclN5c3RlbTtcbiAgICAgICAgdmFyIGh1ZFJlbmRlclN5c3RlbTtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgICAgICAgICB3b3JsZCA9IG5ldyBXb3JsZCgpO1xuXG4gICAgICAgICAgICB3b3JsZC5zZXRNYW5hZ2VyKG5ldyBHcm91cE1hbmFnZXIoKSk7XG5cbiAgICAgICAgICAgIGluaXRTeXN0ZW1zKCk7XG4gICAgICAgICAgICBpbml0VGhyZWUoKTtcblxuICAgICAgICAgICAgd29ybGQuaW5pdGlhbGl6ZSgpO1xuXG4gICAgICAgICAgICBFbnRpdHlGYWN0b3J5LmNyZWF0ZVBsYXllcih3b3JsZCwgMCwgMCkuYWRkVG9Xb3JsZCgpO1xuXG4gICAgICAgICAgICAvKipmb3IodmFyIGkgPSAwOyA1MDAgPiBpOyBpKyspIHtcbiAgICAgICAgICAgIEVudGl0eUZhY3RvcnkuY3JlYXRlU3Rhcih3b3JsZCkuYWRkVG9Xb3JsZCgpO1xuICAgICAgICB9Ki9cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRTeXN0ZW1zKCkge1xuICAgICAgICAgICAgd29ybGQuc2V0U3lzdGVtKG5ldyBNb3ZlbWVudFN5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgUGxheWVySW5wdXRTeXN0ZW0od2ViZ2wpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgQ29sbGlzaW9uU3lzdGVtKCkpO1xuICAgICAgICAgICAgd29ybGQuc2V0U3lzdGVtKG5ldyBFeHBpcmluZ1N5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgUGFyYWxsYXhTdGFyUmVwZWF0aW5nU3lzdGVtKCkpO1xuICAgICAgICAgICAgd29ybGQuc2V0U3lzdGVtKG5ldyBDb2xvckFuaW1hdGlvblN5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgU2NhbGVBbmltYXRpb25TeXN0ZW0oKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtKCkpO1xuXG4gICAgICAgICAgICBzcHJpdGVSZW5kZXJTeXN0ZW0gPSB3b3JsZC5zZXRTeXN0ZW0obmV3IFNwcml0ZVJlbmRlclN5c3RlbSh3ZWJnbCksIHRydWUpO1xuICAgICAgICAgICAgLy9oZWFsdGhSZW5kZXJTeXN0ZW0gPSB3b3JsZC5zZXRTeXN0ZW0obmV3IEhlYWx0aFJlbmRlclN5c3RlbShjYW1lcmEpLCB0cnVlKTtcbiAgICAgICAgICAgIGh1ZFJlbmRlclN5c3RlbSA9IHdvcmxkLnNldFN5c3RlbShuZXcgSHVkUmVuZGVyU3lzdGVtKHdlYmdsKSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0VGhyZWUoKSB7XG4gICAgICAgICAgICB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgICAgIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgICAgICAgICAgNzUsXG4gICAgICAgICAgICAgICAgU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9XSURUSCAvIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hULFxuICAgICAgICAgICAgICAgIDAuMSxcbiAgICAgICAgICAgICAgICAxMDAwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FtZXJhLmxvb2tBdCggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKSApO1xuICAgICAgICAgICAgY2FtZXJhLnBvc2l0aW9uLnNldCgwLDAsNDAwKTtcblxuICAgICAgICAgICAgdmFyIGF4aXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhpc0hlbHBlciggNSApO1xuICAgICAgICAgICAgc2NlbmUuYWRkKCBheGlzSGVscGVyICk7XG5cbiAgICAgICAgICAgIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYWxwaGE6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIHJlbmRlcmVyLnNldFNpemUoIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfV0lEVEgsIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hUICk7XG4gICAgICAgICAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKCAweGZmZmZmZiwgMSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XG5cblxuICAgICAgICAgICAgd2ViZ2wuc2NlbmUgPSBzY2VuZTtcbiAgICAgICAgICAgIHdlYmdsLmNhbWVyYSA9IGNhbWVyYTtcbiAgICAgICAgICAgIHdlYmdsLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGRlbHRhKSB7XG4gICAgICAgICAgICB3b3JsZC5zZXREZWx0YShkZWx0YSk7XG4gICAgICAgICAgICB3b3JsZC5wcm9jZXNzKCk7XG5cbiAgICAgICAgICAgIHNwcml0ZVJlbmRlclN5c3RlbS5wcm9jZXNzKCk7XG4gICAgICAgICAgICAvL2hlYWx0aFJlbmRlclN5c3RlbS5wcm9jZXNzKCk7XG4gICAgICAgICAgICBodWRSZW5kZXJTeXN0ZW0ucHJvY2VzcygpO1xuXG4gICAgICAgICAgICB3ZWJnbC5yZW5kZXJlci5yZW5kZXIod2ViZ2wuc2NlbmUsIHdlYmdsLmNhbWVyYSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaW5pdCgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdhbWVTY3JlZW47XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAvKiBnbG9iYWwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBBcnRlbWlKUyovXG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgR2FtZVNjcmVlbiA9IHJlcXVpcmUoJy4vR2FtZVNjcmVlbicpO1xuXG4gICAgdmFyIFNwYWNlc2hpcFdhcnJpb3IgPSBmdW5jdGlvbiBTcGFjZXNoaXBXYXJyaW9yKCkge1xuXG4gICAgICAgIHZhciBzdGF0cztcblxuICAgICAgICB2YXIgZ2FtZVNjcmVlbjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBGbG9hdCBkZWx0YVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbml0U3RhdHMoKTtcblxuICAgICAgICAgICAgZ2FtZVNjcmVlbiA9IG5ldyBHYW1lU2NyZWVuKCk7XG5cbiAgICAgICAgICAgIHJlbmRlcigwKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgICAgICAgICAgIHN0YXRzLnNldE1vZGUoMSk7IC8vIDA6IGZwcywgMTogbXNcblxuICAgICAgICAgICAgLy8gQWxpZ24gdG9wLWxlZnRcbiAgICAgICAgICAgIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICAgICAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBzdGF0cy5kb21FbGVtZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyKGRlbHRhKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgICAgICAgICBnYW1lU2NyZWVuLnJlbmRlcihkZWx0YSk7XG4gICAgICAgICAgICBzdGF0cy51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX1dJRFRIID0gMTIwMDtcbiAgICBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVCA9IDkwMDtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU3BhY2VzaGlwV2Fycmlvcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBCb3VuZHMoKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgcmFkaXVzXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJhZGl1cztcbiAgICB9XG5cbiAgICBCb3VuZHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBCb3VuZHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm91bmRzO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQm91bmRzO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBDb2xvckFuaW1hdGlvblxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBDb2xvckFuaW1hdGlvbiA9IGZ1bmN0aW9uIENvbG9yQW5pbWF0aW9uKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuXG4gICAgICAgIHRoaXMucmVkTWluLFxuICAgICAgICAgICAgdGhpcy5yZWRNYXgsXG4gICAgICAgICAgICB0aGlzLnJlZFNwZWVkO1xuICAgICAgICB0aGlzLmdyZWVuTWluLFxuICAgICAgICAgICAgdGhpcy5ncmVlbk1heCxcbiAgICAgICAgICAgIHRoaXMuZ3JlZW5TcGVlZDtcbiAgICAgICAgdGhpcy5ibHVlTWluLFxuICAgICAgICAgICAgdGhpcy5ibHVlTWF4LFxuICAgICAgICAgICAgdGhpcy5ibHVlU3BlZWQ7XG4gICAgICAgIHRoaXMuYWxwaGFNaW4sXG4gICAgICAgICAgICB0aGlzLmFscGhhTWF4LFxuICAgICAgICAgICAgdGhpcy5hbHBoYVNwZWVkO1xuXG4gICAgICAgIHRoaXMucmVkQW5pbWF0ZSxcbiAgICAgICAgICAgIHRoaXMuZ3JlZW5BbmltYXRlLFxuICAgICAgICAgICAgdGhpcy5ibHVlQW5pbWF0ZSxcbiAgICAgICAgICAgIHRoaXMuYWxwaGFBbmltYXRlLFxuICAgICAgICAgICAgdGhpcy5yZXBlYXQ7XG5cbiAgICB9O1xuXG4gICAgQ29sb3JBbmltYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBDb2xvckFuaW1hdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2xvckFuaW1hdGlvbjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvbG9yQW5pbWF0aW9uO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIGZ1bmN0aW9uIEV4cGlyZXMoKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgZGVsYXlcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsYXk7XG4gICAgfVxuXG4gICAgRXhwaXJlcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIEV4cGlyZXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwaXJlcztcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEV4cGlyZXM7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gQXJ0ZW1pSlMuQ29tcG9uZW50O1xuXG4gICAgZnVuY3Rpb24gSGVhbHRoKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGhlYWx0aFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oZWFsdGg7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYXhpbXVtSGVhbHRoXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm1heGltdW1IZWFsdGg7XG4gICAgfVxuXG4gICAgSGVhbHRoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgSGVhbHRoLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWx0aDtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhlYWx0aDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBQYXJhbGxheFN0YXIoKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIFBhcmFsbGF4U3Rhci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIFBhcmFsbGF4U3Rhci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQYXJhbGxheFN0YXI7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQYXJhbGxheFN0YXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gQXJ0ZW1pSlMuQ29tcG9uZW50O1xuXG4gICAgZnVuY3Rpb24gUGxheWVyKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBQbGF5ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBQbGF5ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxheWVyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIHZhciBQb3NpdGlvbiA9IGZ1bmN0aW9uIFBvc2l0aW9uKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGNvcmRzXG4gICAgICAgICAqIEB0eXBlIHtUSFJFRS5WZWN0b3IyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb3JkcztcbiAgICB9O1xuXG4gICAgUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBQb3NpdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb3NpdGlvbjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBvc2l0aW9uO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIGZ1bmN0aW9uIFNjYWxlQW5pbWF0aW9uKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IG1pblxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5taW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYXhcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWF4O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgc3BlZWRcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3BlZWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSByZXBlYXRcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlcGVhdDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGFjdGl2ZVxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWN0aXZlO1xuICAgIH1cblxuICAgIFNjYWxlQW5pbWF0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgU2NhbGVBbmltYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2NhbGVBbmltYXRpb247XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTY2FsZUFuaW1hdGlvbjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIHZhciBTcHJpdGUgPSBmdW5jdGlvbiBTcHJpdGUoKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc291cmNlID0gbnVsbDtcbiAgICB9O1xuXG4gICAgU3ByaXRlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3ByaXRlLnByb3RvdHlwZSk7XG4gICAgU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwcml0ZTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNwcml0ZTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBWZWxvY2l0eSgpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB2ZWN0b3JcbiAgICAgICAgICogQHR5cGUge1RIUkVFLlZlY3RvcjJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnZlY3RvcjtcbiAgICB9XG5cbiAgICBWZWxvY2l0eS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIFZlbG9jaXR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZlbG9jaXR5O1xuICAgIG1vZHVsZS5leHBvcnRzID0gVmVsb2NpdHk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5U3lzdGVtID0gQXJ0ZW1pSlMuRW50aXR5U3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIEJvdW5kcyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Cb3VuZHMnKTtcblxuICAgIHZhciBDb2xsaXNpb25TeXN0ZW0gPSBmdW5jdGlvbiBDb2xsaXNpb25TeXN0ZW0oKSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoUG9zaXRpb24uY2xhc3MsIEJvdW5kcy5jbGFzcykpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgY29sbGlzaW9uUGFpcnNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBjb2xsaXNpb25QYWlycztcblxuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBjb2xsaXNpb25QYWlycy5zaXplKCkgPiBpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb25QYWlycy5nZXQoaSkuY2hlY2tGb3JDb2xsaXNpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jaGVja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBDb2xsaXNpb25IYW5kbGVyID0gZnVuY3Rpb24gQ29sbGlzaW9uSGFuZGxlcigpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVDb2xsaXNpb24gPSBmdW5jdGlvbihmb28sIGJhcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVuY3Rpb24gaGFuZGxlQ29sbGlzaW9uIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb2xsaXNpb25TeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBDb2xsaXNpb25TeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sbGlzaW9uU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uU3lzdGVtO1xuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBDb2xvckFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Db2xvckFuaW1hdGlvbicpLFxuICAgICAgICBTcHJpdGUgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvU3ByaXRlJyk7XG5cbiAgICB2YXIgQ29sb3JBbmltYXRpb25TeXN0ZW0gPSBmdW5jdGlvbiBDb2xvckFuaW1hdGlvblN5c3RlbSgpIHtcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQ29sb3JBbmltYXRpb24uY2xhc3MsIFNwcml0ZS5jbGFzcykpO1xuXG4gICAgICAgIHZhciBjYW07XG4gICAgICAgIHZhciBzbTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNhbSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKENvbG9yQW5pbWF0aW9uLmNsYXNzKTtcbiAgICAgICAgICAgIHNtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoU3ByaXRlLmNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBjXG4gICAgICAgICAgICAgKiBAdHlwZSB7Q29sb3JBbmltYXRpb259XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciBjID0gY2FtLmdldChlbnRpdHkpLFxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQHByb3BlcnR5IHNwcml0ZVxuICAgICAgICAgICAgICAgICAqIEB0eXBlIHtTcHJpdGV9XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgc3ByaXRlID0gc20uZ2V0KGVudGl0eSk7XG5cbiAgICAgICAgICAgIGlmKCFjIHx8ICFzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGMuYWxwaGFBbmltYXRlKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLmEgKz0gYy5hbHBoYVNwZWVkICogdGhpcy53b3JsZC5nZXREZWx0YSgpO1xuXG4gICAgICAgICAgICAgICAgaWYoc3ByaXRlLmEgPiBjLmFscGhhTWF4IHx8IHNwcml0ZS5hIDwgYy5hbHBoYU1pbikge1xuICAgICAgICAgICAgICAgICAgICBpZihjLnJlcGVhdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5hbHBoYVNwZWVkID0gLWMuYWxwaGFTcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYWxwaGFBbmltYXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29sb3JBbmltYXRpb25TeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSk7XG4gICAgQ29sb3JBbmltYXRpb25TeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sb3JBbmltYXRpb25TeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb2xvckFuaW1hdGlvblN5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBWb2lkRW50aXR5U3lzdGVtID0gQXJ0ZW1pSlMuU3lzdGVtcy5Wb2lkRW50aXR5U3lzdGVtLFxuICAgICAgICBUaW1lciA9IEFydGVtaUpTLlV0aWxzLlRpbWVyO1xuXG4gICAgdmFyIEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0gPSBmdW5jdGlvbiBFbnRpdHlTcGF3bmluZ1RpbWVyU3lzdGVtKCkge1xuICAgICAgICBWb2lkRW50aXR5U3lzdGVtLmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB0aW1lcjFcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge1RpbWVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHRpbWVyMVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgdGltZXIyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtUaW1lcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciB0aW1lcjI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB0aW1lcjNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge1RpbWVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHRpbWVyMztcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRpbWVyMS51cGRhdGUodGhpcy53b3JsZC5nZXREZWx0YSgpKTtcbiAgICAgICAgICAgIHRpbWVyMi51cGRhdGUodGhpcy53b3JsZC5nZXREZWx0YSgpKTtcbiAgICAgICAgICAgIHRpbWVyMy51cGRhdGUodGhpcy53b3JsZC5nZXREZWx0YSgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBFbnRpdHlTcGF3bmluZ1RpbWVyU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVm9pZEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0sXG4gICAgICAgIEFzcGVjdCA9IEFydGVtaUpTLkFzcGVjdCxcbiAgICAgICAgRXhwaXJlcyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9FeHBpcmVzJyk7XG5cbiAgICB2YXIgRXhwaXJpbmdTeXN0ZW0gPSBmdW5jdGlvbiBFeHBpcmluZ1N5c3RlbSgpIHtcbiAgICAgICAgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKEV4cGlyZXMuY2xhc3MpKTtcblxuICAgICAgICB2YXIgZW07XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRGVsdGEgPSBmdW5jdGlvbihlbnRpdHksIGFjY3VtdWxhdGVkRGVsdGEpIHtcbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gZW0uZ2V0KGVudGl0eSk7XG4gICAgICAgICAgICBleHBpcmVzLmRlbGF5IC09IGFjY3VtdWxhdGVkRGVsdGE7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRXhwaXJlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXR5LmRlbGV0ZUZyb21Xb3JsZCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0UmVtYWluaW5nRGVsYXkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gZW0uZ2V0KGVudGl0eSk7XG4gICAgICAgICAgICByZXR1cm4gZXhwaXJlcy5kZWxheTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBFeHBpcmluZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSk7XG4gICAgRXhwaXJpbmdTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwaXJpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFeHBpcmluZ1N5c3RlbTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBBcnRlbWlKUy5TeXN0ZW1zLkVudGl0eVByb2Nlc3NpbmdTeXN0ZW0sXG4gICAgICAgIEFzcGVjdCA9IEFydGVtaUpTLkFzcGVjdCxcbiAgICAgICAgUG9zaXRpb24gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvUG9zaXRpb24nKSxcbiAgICAgICAgSGVhbHRoID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0hlYWx0aCcpO1xuXG4gICAgdmFyIEhlYWx0aFJlbmRlclN5c3RlbSA9IGZ1bmN0aW9uIEhlYWx0aFJlbmRlclN5c3RlbSgpIHtcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoUG9zaXRpb24uY2xhc3MsIEhlYWx0aC5jbGFzcykpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlclxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHBtO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSBDb21wb25lbnRNYXBwZXJcbiAgICAgICAgICovXG4gICAgICAgIHZhciBobTtcblxuICAgICAgICB2YXIgaGVhbHRoVGV4dDtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGhlYWx0aFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgLy90ZXh0Mi5zdHlsZS56SW5kZXggPSAxOyAgICAvLyBpZiB5b3Ugc3RpbGwgZG9uJ3Qgc2VlIHRoZSBsYWJlbCwgdHJ5IHVuY29tbWVudGluZyB0aGlzXG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLndpZHRoID0gMTAwO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS5oZWlnaHQgPSAxMDA7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLnRvcCA9IDIwMCArICdweCc7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLmxlZnQgPSAyMDAgKyAncHgnO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoZWFsdGhUZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBwbS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIHZhciBoZWFsdGggPSBobS5nZXQoZW50aXR5KTtcblxuICAgICAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKGhlYWx0aC5oZWFsdGgvaGVhbHRoLm1heGltdW1IZWFsdGgqMTAwKTtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuaW5uZXJIVE1MID0gcGVyY2VudGFnZStcIiVcIjtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUudG9wID0gcG9zaXRpb24ueDtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUubGVmdCA9IHBvc2l0aW9uLnk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIEhlYWx0aFJlbmRlclN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBIZWFsdGhSZW5kZXJTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVhbHRoUmVuZGVyU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gSGVhbHRoUmVuZGVyU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFZvaWRFbnRpdHlTeXN0ZW0gPSBBcnRlbWlKUy5TeXN0ZW1zLlZvaWRFbnRpdHlTeXN0ZW07XG5cbiAgICB2YXIgSHVkUmVuZGVyU3lzdGVtID0gZnVuY3Rpb24gSHVkUmVuZGVyU3lzdGVtKGNhbWVyKSB7XG4gICAgICAgIFZvaWRFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzKTtcblxuICAgICAgICB2YXIgaGVhbHRoVGV4dDtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGhlYWx0aFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgLy90ZXh0Mi5zdHlsZS56SW5kZXggPSAxOyAgICAvLyBpZiB5b3Ugc3RpbGwgZG9uJ3Qgc2VlIHRoZSBsYWJlbCwgdHJ5IHVuY29tbWVudGluZyB0aGlzXG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLndpZHRoID0gMTAwO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS5oZWlnaHQgPSAxMDA7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLnRvcCA9IDIwMCArICdweCc7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLmxlZnQgPSAyMDAgKyAncHgnO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoZWFsdGhUZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnByb2Nlc3NTeXN0ZW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuaW5uZXJIVE1MID0gXCJBY3RpdmUgZW50aXRpZXM6IFwiICsgdGhpcy53b3JsZC5nZXRFbnRpdHlNYW5hZ2VyKCkuZ2V0QWN0aXZlRW50aXR5Q291bnQoKTtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUudG9wID0gLShTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX1dJRFRIIC8gMikgKyAyMDtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUubGVmdCA9ICBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVCAvIDIgLSA0MDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBIdWRSZW5kZXJTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWb2lkRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgSHVkUmVuZGVyU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEh1ZFJlbmRlclN5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEh1ZFJlbmRlclN5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIC8qZ2xvYmFsIEFydGVtaUpTKi9cbiAgICBcbiAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gQXJ0ZW1pSlMuU3lzdGVtcy5FbnRpdHlQcm9jZXNzaW5nU3lzdGVtLFxuICAgICAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICAgICAgUG9zaXRpb24gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvUG9zaXRpb24nKSxcbiAgICAgICAgICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1ZlbG9jaXR5Jyk7XG4gICAgICAgIFxuICAgIHZhciBNb3ZlbWVudFN5c3RlbSA9IGZ1bmN0aW9uIE1vdmVtZW50U3lzdGVtKCkge1xuICAgICAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChQb3NpdGlvbi5jbGFzcywgVmVsb2NpdHkuY2xhc3MpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwbSwgdm07XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwbSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKFBvc2l0aW9uLmNsYXNzKTtcbiAgICAgICAgICAgIHZtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoVmVsb2NpdHkuY2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZighZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOzBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5ID0gdm0uZ2V0KGVudGl0eSk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgcG9zaXRpb24ueCArPSB2ZWxvY2l0eS52ZWN0b3JYKnRoaXMud29ybGQuZ2V0RGVsdGEoKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgKz0gdmVsb2NpdHkudmVjdG9yWSp0aGlzLndvcmxkLmdldERlbHRhKCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICBNb3ZlbWVudFN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBNb3ZlbWVudFN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlbWVudFN5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1vdmVtZW50U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIFBhcmFsbGF4U3RhciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9QYXJhbGxheFN0YXInKSxcbiAgICAgICAgUG9zaXRpb24gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvUG9zaXRpb24nKTtcblxuICAgIHZhciBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW0gPSBmdW5jdGlvbiBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW0oKSB7XG4gICAgICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoUGFyYWxsYXhTdGFyLmNsYXNzLCBQb3NpdGlvbi5jbGFzcyksIDEpO1xuXG5cbiAgICAgICAgdmFyIHBtO1xuXG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uLnkgPCAtU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9IRUlHSFQgLyAyKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24ueSA9IFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hUIC8gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFBhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFBhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBFbnRpdHlGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlGYWN0b3J5JyksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1ZlbG9jaXR5JyksXG4gICAgICAgIFBsYXllciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9QbGF5ZXInKTtcblxuICAgIGZ1bmN0aW9uIFBsYXllcklucHV0U3lzdGVtKF93ZWJnbCkge1xuICAgICAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChQb3NpdGlvbi5jbGFzcywgVmVsb2NpdHkuY2xhc3MsIFBsYXllci5jbGFzcykpO1xuXG4gICAgICAgIHZhciB1cCwgZG93biwgbGVmdCwgcmlnaHQ7XG5cbiAgICAgICAgdmFyIHdlYmdsID0gX3dlYmdsO1xuXG4gICAgICAgIHZhciBtb3VzZTNkO1xuXG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgdmFyIGtleWJvYXJkO1xuXG4gICAgICAgIHZhciBwcm9qZWN0b3I7XG5cbiAgICAgICAgdmFyIGZpcmUgPSBmYWxzZTtcblxuICAgICAgICB2YXIgcG9zID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHBtXG4gICAgICAgICAqIEB0eXBlIHtDb21wb25lbnRNYXBwZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB2bVxuICAgICAgICAgKiBAdHlwZSB7Q29tcG9uZW50TWFwcGVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHZtO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAga2V5Ym9hcmQgPSBuZXcgVEhSRUV4LktleWJvYXJkU3RhdGUoKTtcbiAgICAgICAgICAgIHBtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoUG9zaXRpb24uY2xhc3MpO1xuICAgICAgICAgICAgdm0gPSB0aGlzLndvcmxkLmdldE1hcHBlcihWZWxvY2l0eS5jbGFzcyk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ29uZGJsY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNhbnZhcyA9IHdlYmdsLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cbiAgICAgICAgICAgIHByb2plY3RvciA9IG5ldyBUSFJFRS5Qcm9qZWN0b3IoKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGNhbGN1bGF0ZU1vdXNlM2QsIGZhbHNlKTtcbiAgICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCkge1xuICAgICAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoZXZlbnQpIHtcbiAgICAgICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZU1vdXNlM2QoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjYW1lcmEgPSB3ZWJnbC5jYW1lcmE7XG4gICAgICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgKCBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGggKSAqIDIgLSAxLFxuICAgICAgICAgICAgICAgIC0gKCBldmVudC5jbGllbnRZIC8gd2luZG93LmlubmVySGVpZ2h0ICkgKiAyICsgMSxcbiAgICAgICAgICAgICAgICAwLjUgKTtcblxuICAgICAgICAgICAgcHJvamVjdG9yLnVucHJvamVjdFZlY3RvciggdmVjdG9yLCBjYW1lcmEgKTtcbiAgICAgICAgICAgIHZhciBkaXIgPSB2ZWN0b3Iuc3ViKCBjYW1lcmEucG9zaXRpb24gKS5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IC0gY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgICAgIG1vdXNlM2QgPSBjYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoIGRpci5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2hlY2tQcmVzcygpIHtcbiAgICAgICAgICAgIGlmKGtleWJvYXJkLnByZXNzZWQoXCJXXCIpKSB7XG4gICAgICAgICAgICAgICAgcG9zLnkgPSAyLjFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGtleWJvYXJkLnByZXNzZWQoXCJBXCIpKSB7XG4gICAgICAgICAgICAgICAgcG9zLnggPSAtMi4xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoa2V5Ym9hcmQucHJlc3NlZChcIlNcIikpIHtcbiAgICAgICAgICAgICAgICBwb3MueSA9IC0yLjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihrZXlib2FyZC5wcmVzc2VkKFwiRFwiKSkge1xuICAgICAgICAgICAgICAgIHBvcy54ID0gMi4xXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjbGVhclBvcygpIHtcbiAgICAgICAgICAgIHBvcy54ID0gMDtcbiAgICAgICAgICAgIHBvcy55ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoIWVudGl0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5ID0gdm0uZ2V0KGVudGl0eSk7XG5cbiAgICAgICAgICAgIGlmKCFwb3NpdGlvbiB8fCAhdmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhclBvcygpO1xuICAgICAgICAgICAgY2hlY2tQcmVzcygpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCArPSBwb3MueDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgKz0gcG9zLnk7XG4gICAgICAgICAgICBwb3NpdGlvbi56ID0gMDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnZlY3RvciA9IG1vdXNlM2Q7XG4gICAgICAgICAgICBpZihmaXJlKSB7XG4gICAgICAgICAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIEVudGl0eUZhY3RvcnkuY3JlYXRlUGxheWVyQnVsbGV0KHRoaXMud29ybGQsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpLmFkZFRvV29ybGQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIFBsYXllcklucHV0U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFBsYXllcklucHV0U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXllcklucHV0U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGxheWVySW5wdXRTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBBcnRlbWlKUy5TeXN0ZW1zLkludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBWZWxvY2l0eSA9IHJlcXVpcmUoXCIuLy4uL2NvbXBvbmVudHMvVmVsb2NpdHlcIiksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZShcIi4vLi4vY29tcG9uZW50cy9Qb3NpdGlvblwiKSxcbiAgICAgICAgSGVhbHRoID0gcmVxdWlyZShcIi4vLi4vY29tcG9uZW50cy9IZWFsdGhcIiksXG4gICAgICAgIEJvdW5kcyA9IHJlcXVpcmUoXCIuLy4uL2NvbXBvbmVudHMvQm91bmRzXCIpLFxuICAgICAgICBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9jb21wb25lbnRzL1BsYXllclwiKTtcblxuICAgIHZhciBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbSA9IGZ1bmN0aW9uIFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtKCkge1xuICAgICAgICBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKFxuICAgICAgICAgICAgVmVsb2NpdHkuY2xhc3MsXG4gICAgICAgICAgICBQb3NpdGlvbi5jbGFzcyxcbiAgICAgICAgICAgIEhlYWx0aC5jbGFzcyxcbiAgICAgICAgICAgIEJvdW5kcy5jbGFzc1xuICAgICAgICApLmV4Y2x1ZGUoUGxheWVyLmNsYXNzKSwgNSk7XG5cbiAgICAgICAgdmFyIHBtO1xuICAgICAgICB2YXIgYm07XG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlKSxcbiAgICAgICAgICAgICAgICBib3VuZHMgPSBibS5nZXQoZSk7XG5cbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLnkgPCAtIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hULzItYm91bmRzLnJhZGl1cykge1xuICAgICAgICAgICAgICAgIGUuZGVsZXRlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUmVtb3ZlT2Zmc2NyZWVuU2hpcHNTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBTY2FsZUFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TY2FsZUFuaW1hdGlvbicpO1xuXG4gICAgdmFyIFNjYWxlQW5pbWF0aW9uU3lzdGVtID0gZnVuY3Rpb24gU2NhbGVBbmltYXRpb25TeXN0ZW0oKSB7XG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yT25lKFNjYWxlQW5pbWF0aW9uLmNsYXNzKSk7XG5cbiAgICAgICAgdmFyIHNhO1xuICAgICAgICB2YXIgc207XG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZUFuaW1hdGlvbiA9IHNhLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYgKHNjYWxlQW5pbWF0aW9uLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBzbS5nZXQoZW50aXR5KTtcblxuICAgICAgICAgICAgICAgIHNwcml0ZS5zY2FsZVggKz0gc2NhbGVBbmltYXRpb24uc3BlZWQgKiB0aGlzLndvcmxkLmdldERlbHRhKCk7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnNjYWxlWSA9IHNwcml0ZS5zY2FsZVg7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlLnNjYWxlWCA+IHNjYWxlQW5pbWF0aW9uLm1heCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc2NhbGVYID0gc2NhbGVBbmltYXRpb24ubWF4O1xuICAgICAgICAgICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNwcml0ZS5zY2FsZVggPCBzY2FsZUFuaW1hdGlvbi5taW4pIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNjYWxlWCA9IHNjYWxlQW5pbWF0aW9uLm1pbjtcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVBbmltYXRpb24uYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNjYWxlQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFNjYWxlQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjYWxlQW5pbWF0aW9uU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2NhbGVBbmltYXRpb25TeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5U3lzdGVtID0gQXJ0ZW1pSlMuRW50aXR5U3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIE1hdGhVdGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvTWF0aFV0aWxzJyksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIFNwcml0ZSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TcHJpdGUnKTtcblxuICAgIHZhciBTcHJpdGVSZW5kZXJTeXN0ZW0gPSBmdW5jdGlvbiBTcHJpdGVSZW5kZXJTeXN0ZW0od2ViZ2wpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChQb3NpdGlvbi5jbGFzcywgU3ByaXRlLmNsYXNzKSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlcjxQb3NpdGlvbj47XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlcjxTcHJpdGU+XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc207XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwbSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKFBvc2l0aW9uLmNsYXNzKTtcbiAgICAgICAgICAgIHNtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoU3ByaXRlLmNsYXNzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGkgPSBlbnRpdGllcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyhlbnRpdGllcy5nZXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZighcG0uaGFzKGVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IHNtLmdldChlbnRpdHkpO1xuXG4gICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56KTtcbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLnZlY3Rvcikge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5zb3VyY2UubWF0ZXJpYWwucm90YXRpb24gPSBNYXRoVXRpbHMuYW5nbGUoXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnZlY3Rvci54LFxuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnZlY3Rvci55LFxuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5zZXJ0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBzbS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKHNwcml0ZSkge1xuICAgICAgICAgICAgICAgIHdlYmdsLnNjZW5lLmFkZChzcHJpdGUuc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTcHJpdGVSZW5kZXJTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBTcHJpdGVSZW5kZXJTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ByaXRlUmVuZGVyU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIE1hdGhVdGlscyA9IHtcbiAgICAgICAgcmFuZG9tOiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoobWF4LW1pbisxKSttaW4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZzJyYWQ6IGZ1bmN0aW9uKGRlZykge1xuICAgICAgICAgICAgcmV0dXJuIGRlZyAqIE1hdGguUEkvMTgwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFuZ2xlOiBmdW5jdGlvbih4MSx4Mix5MSx5Mikge1xuICAgICAgICAgICAgdmFyIGRlZyA9IE1hdGguYXRhbjIoKHkxIC0geTIpLCh4MSAtIHgyKSkgKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVnMnJhZChkZWcpLSBNYXRoLlBJLzI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXRoVXRpbHM7XG59KSgpOyJdfQ==
(4)
});
