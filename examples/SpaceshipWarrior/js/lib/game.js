(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SpaceshipWarrior = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
(function() {
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
},{"./Constants":1,"./components/Bounds":5,"./components/ColorAnimation":6,"./components/Expires":7,"./components/Health":8,"./components/ParallaxStar":9,"./components/Player":10,"./components/Position":11,"./components/ScaleAnimation":12,"./components/Sprite":13,"./components/Velocity":14,"./utils/MathUtils":27}],3:[function(require,module,exports){
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
},{"./EntityFactory":2,"./systems/CollisionSystem":15,"./systems/ColorAnimationSystem":16,"./systems/EntitySpawningTimerSystem":17,"./systems/ExpiringSystem":18,"./systems/HealthRenderSystem":19,"./systems/HudRenderSystem":20,"./systems/MovementSystem":21,"./systems/ParallaxStarRepeatingSystem":22,"./systems/PlayerInputSystem":23,"./systems/RemoveOffscreenShipsSystem":24,"./systems/ScaleAnimationSystem":25,"./systems/SpriteRenderSystem":26}],4:[function(require,module,exports){
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
},{"./GameScreen":3}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        Position = require('./../components/Position'),
        Bounds = require('./../components/Bounds');

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
},{"./../components/Bounds":5,"./../components/Position":11}],16:[function(require,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ColorAnimation = require('./../components/ColorAnimation'),
        Sprite = require('./../components/Sprite');

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
},{"./../components/ColorAnimation":6,"./../components/Sprite":13}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
(function() {
    'use strict';

    var Aspect = ArtemiJS.Aspect,
        DelayedEntityProcessingSystem = ArtemiJS.Systems.DelayedEntityProcessingSystem,
        Expires = require('./../components/Expires');

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
},{"./../components/Expires":7}],19:[function(require,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Position = require('./../components/Position'),
        Health = require('./../components/Health');

    var HealthRenderSystem = function HealthRenderSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Health.klass));

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
},{"./../components/Health":8,"./../components/Position":11}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
(function() {
    /*global ArtemiJS*/
    
    'use strict';
        var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
            Aspect = ArtemiJS.Aspect,
            Position = require('./../components/Position'),
            Velocity = require('./../components/Velocity');
        
    var MovementSystem = function MovementSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Velocity.klass));
        
        var pm, vm;

        this.initialize = function() {
            pm = this.world.getMapper(Position.klass);
            vm = this.world.getMapper(Velocity.klass);
        };
        
        this.process = function(entity) {
            if(!entity) {
                return;
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
},{"./../components/Position":11,"./../components/Velocity":14}],22:[function(require,module,exports){
(function() {
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ParallaxStar = require('./../components/ParallaxStar'),
        Position = require('./../components/Position');

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
},{"./../components/ParallaxStar":9,"./../components/Position":11}],23:[function(require,module,exports){
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
},{"./../EntityFactory":2,"./../components/Player":10,"./../components/Position":11,"./../components/Velocity":14}],24:[function(require,module,exports){
(function(){
    'use strict';

    var IntervalEntityProcessingSystem = ArtemiJS.Systems.IntervalEntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Velocity = require("./../components/Velocity"),
        Position = require("./../components/Position"),
        Health = require("./../components/Health"),
        Bounds = require("./../components/Bounds"),
        Player = require("./../components/Player");

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
},{"./../components/Bounds":5,"./../components/Health":8,"./../components/Player":10,"./../components/Position":11,"./../components/Velocity":14}],25:[function(require,module,exports){
(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        ScaleAnimation = require('./../components/ScaleAnimation');

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
},{"./../components/ScaleAnimation":12}],26:[function(require,module,exports){
(function() {
    'use strict';

    var EntitySystem = ArtemiJS.EntitySystem,
        Aspect = ArtemiJS.Aspect,
        MathUtils = require('./../utils/MathUtils'),
        Position = require('./../components/Position'),
        Sprite = require('./../components/Sprite');

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
},{"./../components/Position":11,"./../components/Sprite":13,"./../utils/MathUtils":27}],27:[function(require,module,exports){
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
},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MC4xMi43L2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL3NyYy9Db25zdGFudHMuanMiLCJqcy9zcmMvRW50aXR5RmFjdG9yeS5qcyIsImpzL3NyYy9HYW1lU2NyZWVuLmpzIiwianMvc3JjL1NwYWNlc2hpcFdhcnJpb3IuanMiLCJqcy9zcmMvY29tcG9uZW50cy9Cb3VuZHMuanMiLCJqcy9zcmMvY29tcG9uZW50cy9Db2xvckFuaW1hdGlvbi5qcyIsImpzL3NyYy9jb21wb25lbnRzL0V4cGlyZXMuanMiLCJqcy9zcmMvY29tcG9uZW50cy9IZWFsdGguanMiLCJqcy9zcmMvY29tcG9uZW50cy9QYXJhbGxheFN0YXIuanMiLCJqcy9zcmMvY29tcG9uZW50cy9QbGF5ZXIuanMiLCJqcy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbi5qcyIsImpzL3NyYy9jb21wb25lbnRzL1NjYWxlQW5pbWF0aW9uLmpzIiwianMvc3JjL2NvbXBvbmVudHMvU3ByaXRlLmpzIiwianMvc3JjL2NvbXBvbmVudHMvVmVsb2NpdHkuanMiLCJqcy9zcmMvc3lzdGVtcy9Db2xsaXNpb25TeXN0ZW0uanMiLCJqcy9zcmMvc3lzdGVtcy9Db2xvckFuaW1hdGlvblN5c3RlbS5qcyIsImpzL3NyYy9zeXN0ZW1zL0VudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0uanMiLCJqcy9zcmMvc3lzdGVtcy9FeHBpcmluZ1N5c3RlbS5qcyIsImpzL3NyYy9zeXN0ZW1zL0hlYWx0aFJlbmRlclN5c3RlbS5qcyIsImpzL3NyYy9zeXN0ZW1zL0h1ZFJlbmRlclN5c3RlbS5qcyIsImpzL3NyYy9zeXN0ZW1zL01vdmVtZW50U3lzdGVtLmpzIiwianMvc3JjL3N5c3RlbXMvUGFyYWxsYXhTdGFyUmVwZWF0aW5nU3lzdGVtLmpzIiwianMvc3JjL3N5c3RlbXMvUGxheWVySW5wdXRTeXN0ZW0uanMiLCJqcy9zcmMvc3lzdGVtcy9SZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbS5qcyIsImpzL3NyYy9zeXN0ZW1zL1NjYWxlQW5pbWF0aW9uU3lzdGVtLmpzIiwianMvc3JjL3N5c3RlbXMvU3ByaXRlUmVuZGVyU3lzdGVtLmpzIiwianMvc3JjL3V0aWxzL01hdGhVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcblxuICAgIHZhciBDb25zdGFudHMgPSB7XG4gICAgICAgIEdyb3Vwczoge1xuICAgICAgICAgICAgUExBWUVSX0JVTExFVFM6IFwicGxheWVyIGJ1bGxldHNcIixcbiAgICAgICAgICAgIFBMQVlFUl9TSElQOiBcInBsYXllciBzaGlwXCIsXG4gICAgICAgICAgICBFTkVNWV9TSElQUzogXCJlbmVteSBzaGlwc1wiLFxuICAgICAgICAgICAgRU5FTVlfQlVMTEVUUzogXCJlbmVteSBidWxsZXRzXCJcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvbnN0YW50cztcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEdyb3VwTWFuYWdlciA9IEFydGVtaUpTLk1hbmFnZXJzLkdyb3VwTWFuYWdlcixcbiAgICAgICAgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKSxcbiAgICAgICAgTWF0aFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9NYXRoVXRpbHMnKSxcbiAgICAgICAgQm91bmRzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0JvdW5kcycpLFxuICAgICAgICBDb2xvckFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9Db2xvckFuaW1hdGlvbicpLFxuICAgICAgICBFeHBpcmVzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0V4cGlyZXMnKSxcbiAgICAgICAgSGVhbHRoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0hlYWx0aCcpLFxuICAgICAgICBQYXJhbGxheFN0YXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUGFyYWxsYXhTdGFyJyksXG4gICAgICAgIFBsYXllciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9QbGF5ZXInKSxcbiAgICAgICAgUG9zaXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUG9zaXRpb24nKSxcbiAgICAgICAgU2NhbGVBbmltYXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU2NhbGVBbmltYXRpb24nKSxcbiAgICAgICAgU3ByaXRlID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1Nwcml0ZScpLFxuICAgICAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9WZWxvY2l0eScpO1xuXG4gICAgdmFyIEVudGl0eUZhY3RvcnkgPSB7XG4gICAgICAgIGNyZWF0ZVBsYXllcjogZnVuY3Rpb24od29ybGQsIHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBlID0gd29ybGQuY3JlYXRlRW50aXR5KCk7XG5cbiAgICAgICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgICAgICB5ID0geSB8fCAwO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChwb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgU3ByaXRlKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCBcImltYWdlcy9maWdodGVyLnBuZ1wiICk7XG4gICAgICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoIHsgbWFwOiBtYXAgfSApO1xuICAgICAgICAgICAgdmFyIF9zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKCBtYXRlcmlhbCApO1xuICAgICAgICAgICAgX3Nwcml0ZS5wb3NpdGlvbi5zZXQoIDAsIDAsIDAgKTtcbiAgICAgICAgICAgIF9zcHJpdGUuc2NhbGUuc2V0KCAzNSwgNDMsIDEgKVxuXG4gICAgICAgICAgICBzcHJpdGUuc291cmNlID0gX3Nwcml0ZTtcblxuICAgICAgICAgICAgLy9zcHJpdGUubGF5ZXIgPSBTcHJpdGUuTGF5ZXIuQUNUT1JTXzM7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChzcHJpdGUpO1xuXG4gICAgICAgICAgICB2YXIgdmVsb2NpdHkgPSBuZXcgVmVsb2NpdHkoKTtcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclggPSAwO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWSA9IDA7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudCh2ZWxvY2l0eSk7XG5cbiAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgQm91bmRzKCk7XG4gICAgICAgICAgICBib3VuZHMucmFkaXVzID0gNDM7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChib3VuZHMpO1xuXG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChuZXcgUGxheWVyKCkpO1xuXG4gICAgICAgICAgICB3b3JsZC5nZXRNYW5hZ2VyKEdyb3VwTWFuYWdlci5rbGFzcykuYWRkKGUsIENvbnN0YW50cy5Hcm91cHMuUExBWUVSX1NISVApO1xuXG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVQbGF5ZXJCdWxsZXQ6IGZ1bmN0aW9uKHdvcmxkLCB4LCB5KSB7XG4gICAgICAgICAgICB2YXIgZSA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpO1xuXG4gICAgICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICAgICAgeSA9IHkgfHwgMDtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0geDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSB5O1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQocG9zaXRpb24pO1xuXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IFNwcml0ZSgpO1xuXG4gICAgICAgICAgICB2YXIgbWFwID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJpbWFnZXMvYnVsbGV0LnBuZ1wiICk7XG4gICAgICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoIHsgbWFwOiBtYXAgfSApO1xuICAgICAgICAgICAgdmFyIF9zcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKCBtYXRlcmlhbCApO1xuICAgICAgICAgICAgX3Nwcml0ZS5wb3NpdGlvbi5zZXQoIHgsIHksIDAgKTtcbiAgICAgICAgICAgIF9zcHJpdGUuc2NhbGUuc2V0KCAzMCwgNDAsIDEgKVxuXG4gICAgICAgICAgICBzcHJpdGUuc291cmNlID0gX3Nwcml0ZTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNwcml0ZSk7XG5cbiAgICAgICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBWZWxvY2l0eSgpO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWSA9IDgwMDtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHZlbG9jaXR5KTtcblxuICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBCb3VuZHMoKTtcbiAgICAgICAgICAgIGJvdW5kcy5yYWRpdXMgPSA1O1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoYm91bmRzKTtcblxuICAgICAgICAgICAgdmFyIGV4cGlyZXMgPSBuZXcgRXhwaXJlcygpO1xuICAgICAgICAgICAgZXhwaXJlcy5kZWxheSA9IDU7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChleHBpcmVzKTtcblxuICAgICAgICAgICAgd29ybGQuZ2V0TWFuYWdlcihHcm91cE1hbmFnZXIua2xhc3MpLmFkZChlLCBDb25zdGFudHMuR3JvdXBzLlBMQVlFUl9CVUxMRVRTKTtcblxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRW5lbXlTaGlwOiBmdW5jdGlvbih3b3JsZCwgbmFtZSwgbGF5ZXIsIGhlYWx0aCwgeCwgeSwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIGJvdW5kc1JhZGl1cykge1xuICAgICAgICAgICAgdmFyIGUgPSB3b3JsZC5jcmVhdGVFbnRpdHkoKTtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0geDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSB5O1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQocG9zaXRpb24pO1xuXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IFNwcml0ZSgpO1xuICAgICAgICAgICAgc3ByaXRlLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgc3ByaXRlLnIgPSAyNTUvMjU1O1xuICAgICAgICAgICAgc3ByaXRlLmcgPSAwLzI1NTtcbiAgICAgICAgICAgIHNwcml0ZS5iID0gMTQyLzI1NTtcbiAgICAgICAgICAgIHNwcml0ZS5sYXllciA9IGxheWVyO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoc3ByaXRlKTtcblxuICAgICAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFZlbG9jaXR5KCk7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JYID0gdmVsb2NpdHlYO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWSA9IHZlbG9jaXR5WTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHZlbG9jaXR5KTtcblxuICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBCb3VuZHMoKTtcbiAgICAgICAgICAgIGJvdW5kcy5yYWRpdXMgPSBib3VuZHNSYWRpdXM7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChib3VuZHMpO1xuXG4gICAgICAgICAgICB2YXIgaCA9IG5ldyBIZWFsdGgoKTtcbiAgICAgICAgICAgIGguaGVhbHRoID0gaC5tYXhpbXVtSGVhbHRoID0gaGVhbHRoO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoaCk7XG5cbiAgICAgICAgICAgIHdvcmxkLmdldE1hbmFnZXIoR3JvdXBNYW5hZ2VyLmtsYXNzKS5hZGQoZSwgQ29uc3RhbnRzLkdyb3Vwcy5FTkVNWV9TSElQUyk7XG5cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUV4cGxvc2lvbjogZnVuY3Rpb24od29ybGQsIHgsIHksIHNjYWxlKSB7XG4gICAgICAgICAgICB2YXIgZSA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChwb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgU3ByaXRlKCk7XG4gICAgICAgICAgICBzcHJpdGUubmFtZSA9IFwiZXhwbG9zaW9uXCI7XG4gICAgICAgICAgICBzcHJpdGUuc2NhbGVYID0gc3ByaXRlLnNjYWxlWSA9IHNjYWxlO1xuICAgICAgICAgICAgc3ByaXRlLnIgPSAxO1xuICAgICAgICAgICAgc3ByaXRlLmcgPSAyMTYvMjU1O1xuICAgICAgICAgICAgc3ByaXRlLmIgPSAwO1xuICAgICAgICAgICAgc3ByaXRlLmEgPSAwLjU7XG4gICAgICAgICAgICAvL3Nwcml0ZS5sYXllciA9IFNwcml0ZS5MYXllci5QQVJUSUNMRVM7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChzcHJpdGUpO1xuXG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IG5ldyBFeHBpcmVzKCk7XG4gICAgICAgICAgICBleHBpcmVzLmRlbGF5ID0gMC41O1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQoZXhwaXJlcyk7XG5cblxuICAgICAgICAgICAgdmFyIHNjYWxlQW5pbWF0aW9uID0gbmV3IFNjYWxlQW5pbWF0aW9uKCk7XG4gICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc2NhbGVBbmltYXRpb24ubWF4ID0gc2NhbGU7XG4gICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5taW4gPSBzY2FsZS8xMDA7XG4gICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5zcGVlZCA9IC0zLjA7XG4gICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5yZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNjYWxlQW5pbWF0aW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU3RhcjogZnVuY3Rpb24od29ybGQpIHtcbiAgICAgICAgICAgIHZhciBlID0gd29ybGQuY3JlYXRlRW50aXR5KCk7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCA9IE1hdGhVdGlscy5yYW5kb20oLVNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfV0lEVEgvMiwgU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9XSURUSC8yKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBNYXRoVXRpbHMucmFuZG9tKC1TcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVC8yLCBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVC8yKTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBTcHJpdGUoKTtcbiAgICAgICAgICAgIHNwcml0ZS5uYW1lID0gXCJwYXJ0aWNsZVwiO1xuICAgICAgICAgICAgc3ByaXRlLnNjYWxlWCA9IHNwcml0ZS5zY2FsZVkgPSBNYXRoVXRpbHMucmFuZG9tKDAuNSwgMSk7XG4gICAgICAgICAgICBzcHJpdGUuYSA9IE1hdGhVdGlscy5yYW5kb20oMC4xLCAwLjUpO1xuICAgICAgICAgICAgLy9zcHJpdGUubGF5ZXIgPSBTcHJpdGUuTGF5ZXIuQkFDS0dST1VORDtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KHNwcml0ZSk7XG5cbiAgICAgICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBWZWxvY2l0eSgpO1xuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWSA9IE1hdGhVdGlscy5yYW5kb20oLTEwLCAtNjApO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQodmVsb2NpdHkpO1xuXG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChuZXcgUGFyYWxsYXhTdGFyKCkpO1xuXG4gICAgICAgICAgICB2YXIgY29sb3JBbmltYXRpb24gPSBuZXcgQ29sb3JBbmltYXRpb24oKTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhQW5pbWF0ZSA9IHRydWU7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5yZXBlYXQgPSB0cnVlO1xuICAgICAgICAgICAgY29sb3JBbmltYXRpb24uYWxwaGFTcGVlZCA9IE1hdGhVdGlscy5yYW5kb20oMC4yLCAwLjcpO1xuICAgICAgICAgICAgY29sb3JBbmltYXRpb24uYWxwaGFNaW4gPSAwLjE7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYU1heCA9IDAuNTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGNvbG9yQW5pbWF0aW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlUGFydGljbGU6IGZ1bmN0aW9uKHdvcmxkLCB4LCB5KSB7XG4gICAgICAgICAgICB2YXIgZSA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChwb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgU3ByaXRlKCk7XG4gICAgICAgICAgICBzcHJpdGUubmFtZSA9IFwicGFydGljbGVcIjtcbiAgICAgICAgICAgIHNwcml0ZS5zY2FsZVggPSBzcHJpdGUuc2NhbGVZID0gTWF0aFV0aWxzLnJhbmRvbSgwLjMsIDAuNik7XG4gICAgICAgICAgICBzcHJpdGUuciA9IDE7XG4gICAgICAgICAgICBzcHJpdGUuZyA9IDIxNi8yNTU7XG4gICAgICAgICAgICBzcHJpdGUuYiA9IDA7XG4gICAgICAgICAgICBzcHJpdGUuYSA9IDAuNTtcbiAgICAgICAgICAgIHNwcml0ZS5sYXllciA9IFNwcml0ZS5MYXllci5QQVJUSUNMRVM7XG4gICAgICAgICAgICBlLmFkZENvbXBvbmVudChzcHJpdGUpO1xuXG4gICAgICAgICAgICB2YXIgdmVsb2NpdHkgPSBuZXcgVmVsb2NpdHkoKTtcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclggPSBNYXRoVXRpbHMucmFuZG9tKC00MDAsIDQwMCk7XG4gICAgICAgICAgICB2ZWxvY2l0eS52ZWN0b3JZID0gTWF0aFV0aWxzLnJhbmRvbSgtNDAwLCA0MDApO1xuICAgICAgICAgICAgZS5hZGRDb21wb25lbnQodmVsb2NpdHkpO1xuXG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IG5ldyBFeHBpcmVzKCk7XG4gICAgICAgICAgICBleHBpcmVzLmRlbGF5ID0gMTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGV4cGlyZXMpO1xuXG4gICAgICAgICAgICB2YXIgY29sb3JBbmltYXRpb24gPSBuZXcgQ29sb3JBbmltYXRpb24oKTtcbiAgICAgICAgICAgIGNvbG9yQW5pbWF0aW9uLmFscGhhQW5pbWF0ZSA9IHRydWU7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYVNwZWVkID0gLTE7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYU1pbiA9IDA7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5hbHBoYU1heCA9IDE7XG4gICAgICAgICAgICBjb2xvckFuaW1hdGlvbi5yZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGUuYWRkQ29tcG9uZW50KGNvbG9yQW5pbWF0aW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlGYWN0b3J5O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFdvcmxkID0gQXJ0ZW1pSlMuV29ybGQsXG4gICAgICAgIEdyb3VwTWFuYWdlciA9IEFydGVtaUpTLk1hbmFnZXJzLkdyb3VwTWFuYWdlcixcbiAgICAgICAgRW50aXR5RmFjdG9yeSA9IHJlcXVpcmUgKCcuL0VudGl0eUZhY3RvcnknKSxcbiAgICAgICAgTW92ZW1lbnRTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvTW92ZW1lbnRTeXN0ZW0nKSxcbiAgICAgICAgUGxheWVySW5wdXRTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvUGxheWVySW5wdXRTeXN0ZW0nKSxcbiAgICAgICAgQ29sbGlzaW9uU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0NvbGxpc2lvblN5c3RlbScpLFxuICAgICAgICBFeHBpcmluZ1N5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9FeHBpcmluZ1N5c3RlbScpLFxuICAgICAgICBFbnRpdHlTcGF3bmluZ1RpbWVyU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0VudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0nKSxcbiAgICAgICAgUGFyYWxsYXhTdGFyUmVwZWF0aW5nU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL1BhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbScpLFxuICAgICAgICBDb2xvckFuaW1hdGlvblN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9Db2xvckFuaW1hdGlvblN5c3RlbScpLFxuICAgICAgICBTY2FsZUFuaW1hdGlvblN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9TY2FsZUFuaW1hdGlvblN5c3RlbScpLFxuICAgICAgICBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9SZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbScpLFxuICAgICAgICBTcHJpdGVSZW5kZXJTeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbXMvU3ByaXRlUmVuZGVyU3lzdGVtJyksXG4gICAgICAgIEhlYWx0aFJlbmRlclN5c3RlbSA9IHJlcXVpcmUoJy4vc3lzdGVtcy9IZWFsdGhSZW5kZXJTeXN0ZW0nKSxcbiAgICAgICAgSHVkUmVuZGVyU3lzdGVtID0gcmVxdWlyZSgnLi9zeXN0ZW1zL0h1ZFJlbmRlclN5c3RlbScpO1xuXG4gICAgdmFyIEdhbWVTY3JlZW4gPSBmdW5jdGlvbiBHYW1lU2NyZWVuKCkge1xuICAgICAgICB2YXIgd29ybGQ7XG5cbiAgICAgICAgdmFyIHdlYmdsID0ge1xuICAgICAgICAgICAgXCJzY2VuZVwiOiBudWxsLFxuICAgICAgICAgICAgXCJjYW1lcmFcIjogbnVsbCxcbiAgICAgICAgICAgIFwicmVuZGVyZXJcIjogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzcHJpdGVSZW5kZXJTeXN0ZW07XG4gICAgICAgIHZhciBoZWFsdGhSZW5kZXJTeXN0ZW07XG4gICAgICAgIHZhciBodWRSZW5kZXJTeXN0ZW07XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgICAgICAgICAgd29ybGQgPSBuZXcgV29ybGQoKTtcblxuICAgICAgICAgICAgd29ybGQuc2V0TWFuYWdlcihuZXcgR3JvdXBNYW5hZ2VyKCkpO1xuXG4gICAgICAgICAgICBpbml0U3lzdGVtcygpO1xuICAgICAgICAgICAgaW5pdFRocmVlKCk7XG5cbiAgICAgICAgICAgIHdvcmxkLmluaXRpYWxpemUoKTtcblxuICAgICAgICAgICAgRW50aXR5RmFjdG9yeS5jcmVhdGVQbGF5ZXIod29ybGQsIDAsIDApLmFkZFRvV29ybGQoKTtcblxuICAgICAgICAgICAgLyoqZm9yKHZhciBpID0gMDsgNTAwID4gaTsgaSsrKSB7XG4gICAgICAgICAgICBFbnRpdHlGYWN0b3J5LmNyZWF0ZVN0YXIod29ybGQpLmFkZFRvV29ybGQoKTtcbiAgICAgICAgfSovXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0U3lzdGVtcygpIHtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgTW92ZW1lbnRTeXN0ZW0oKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IFBsYXllcklucHV0U3lzdGVtKHdlYmdsKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IENvbGxpc2lvblN5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgRXhwaXJpbmdTeXN0ZW0oKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW0oKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IFBhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbSgpKTtcbiAgICAgICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgQ29sb3JBbmltYXRpb25TeXN0ZW0oKSk7XG4gICAgICAgICAgICB3b3JsZC5zZXRTeXN0ZW0obmV3IFNjYWxlQW5pbWF0aW9uU3lzdGVtKCkpO1xuICAgICAgICAgICAgd29ybGQuc2V0U3lzdGVtKG5ldyBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbSgpKTtcblxuICAgICAgICAgICAgc3ByaXRlUmVuZGVyU3lzdGVtID0gd29ybGQuc2V0U3lzdGVtKG5ldyBTcHJpdGVSZW5kZXJTeXN0ZW0od2ViZ2wpLCB0cnVlKTtcbiAgICAgICAgICAgIC8vaGVhbHRoUmVuZGVyU3lzdGVtID0gd29ybGQuc2V0U3lzdGVtKG5ldyBIZWFsdGhSZW5kZXJTeXN0ZW0oY2FtZXJhKSwgdHJ1ZSk7XG4gICAgICAgICAgICBodWRSZW5kZXJTeXN0ZW0gPSB3b3JsZC5zZXRTeXN0ZW0obmV3IEh1ZFJlbmRlclN5c3RlbSh3ZWJnbCksIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdFRocmVlKCkge1xuICAgICAgICAgICAgdmFyIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgICAgICAgICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgICAgICAgICAgICAgIDc1LFxuICAgICAgICAgICAgICAgIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfV0lEVEggLyBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVCxcbiAgICAgICAgICAgICAgICAwLjEsXG4gICAgICAgICAgICAgICAgMTAwMFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhbWVyYS5sb29rQXQoIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICkgKTtcbiAgICAgICAgICAgIGNhbWVyYS5wb3NpdGlvbi5zZXQoMCwwLDQwMCk7XG5cbiAgICAgICAgICAgIHZhciBheGlzSGVscGVyID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoIDUgKTtcbiAgICAgICAgICAgIHNjZW5lLmFkZCggYXhpc0hlbHBlciApO1xuXG4gICAgICAgICAgICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFscGhhOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICByZW5kZXJlci5zZXRTaXplKCBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX1dJRFRILCBTcGFjZXNoaXBXYXJyaW9yLkZSQU1FX0hFSUdIVCApO1xuICAgICAgICAgICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggMHhmZmZmZmYsIDEpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuXG5cbiAgICAgICAgICAgIHdlYmdsLnNjZW5lID0gc2NlbmU7XG4gICAgICAgICAgICB3ZWJnbC5jYW1lcmEgPSBjYW1lcmE7XG4gICAgICAgICAgICB3ZWJnbC5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICAgICAgd29ybGQuc2V0RGVsdGEoZGVsdGEpO1xuICAgICAgICAgICAgd29ybGQucHJvY2VzcygpO1xuXG4gICAgICAgICAgICBzcHJpdGVSZW5kZXJTeXN0ZW0ucHJvY2VzcygpO1xuICAgICAgICAgICAgLy9oZWFsdGhSZW5kZXJTeXN0ZW0ucHJvY2VzcygpO1xuICAgICAgICAgICAgaHVkUmVuZGVyU3lzdGVtLnByb2Nlc3MoKTtcblxuICAgICAgICAgICAgd2ViZ2wucmVuZGVyZXIucmVuZGVyKHdlYmdsLnNjZW5lLCB3ZWJnbC5jYW1lcmEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGluaXQoKTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NyZWVuO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgLyogZ2xvYmFsIHJlcXVlc3RBbmltYXRpb25GcmFtZSwgQXJ0ZW1pSlMqL1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEdhbWVTY3JlZW4gPSByZXF1aXJlKCcuL0dhbWVTY3JlZW4nKTtcblxuICAgIHZhciBTcGFjZXNoaXBXYXJyaW9yID0gZnVuY3Rpb24gU3BhY2VzaGlwV2FycmlvcigpIHtcblxuICAgICAgICB2YXIgc3RhdHM7XG5cbiAgICAgICAgdmFyIGdhbWVTY3JlZW47XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gRmxvYXQgZGVsdGFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFN0YXRzKCk7XG5cbiAgICAgICAgICAgIGdhbWVTY3JlZW4gPSBuZXcgR2FtZVNjcmVlbigpO1xuXG4gICAgICAgICAgICByZW5kZXIoMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0U3RhdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0YXRzID0gbmV3IFN0YXRzKCk7XG4gICAgICAgICAgICBzdGF0cy5zZXRNb2RlKDEpOyAvLyAwOiBmcHMsIDE6IG1zXG5cbiAgICAgICAgICAgIC8vIEFsaWduIHRvcC1sZWZ0XG4gICAgICAgICAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICAgICAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggc3RhdHMuZG9tRWxlbWVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlcihkZWx0YSkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgICAgICAgZ2FtZVNjcmVlbi5yZW5kZXIoZGVsdGEpO1xuICAgICAgICAgICAgc3RhdHMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9XSURUSCA9IDEyMDA7XG4gICAgU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9IRUlHSFQgPSA5MDA7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNwYWNlc2hpcFdhcnJpb3I7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gQXJ0ZW1pSlMuQ29tcG9uZW50O1xuXG4gICAgZnVuY3Rpb24gQm91bmRzKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHJhZGl1c1xuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yYWRpdXM7XG4gICAgfVxuXG4gICAgQm91bmRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgQm91bmRzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvdW5kcztcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJvdW5kcztcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBAY2xhc3MgQ29sb3JBbmltYXRpb25cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgQ29sb3JBbmltYXRpb24gPSBmdW5jdGlvbiBDb2xvckFuaW1hdGlvbigpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG5cblxuICAgICAgICB0aGlzLnJlZE1pbixcbiAgICAgICAgICAgIHRoaXMucmVkTWF4LFxuICAgICAgICAgICAgdGhpcy5yZWRTcGVlZDtcbiAgICAgICAgdGhpcy5ncmVlbk1pbixcbiAgICAgICAgICAgIHRoaXMuZ3JlZW5NYXgsXG4gICAgICAgICAgICB0aGlzLmdyZWVuU3BlZWQ7XG4gICAgICAgIHRoaXMuYmx1ZU1pbixcbiAgICAgICAgICAgIHRoaXMuYmx1ZU1heCxcbiAgICAgICAgICAgIHRoaXMuYmx1ZVNwZWVkO1xuICAgICAgICB0aGlzLmFscGhhTWluLFxuICAgICAgICAgICAgdGhpcy5hbHBoYU1heCxcbiAgICAgICAgICAgIHRoaXMuYWxwaGFTcGVlZDtcblxuICAgICAgICB0aGlzLnJlZEFuaW1hdGUsXG4gICAgICAgICAgICB0aGlzLmdyZWVuQW5pbWF0ZSxcbiAgICAgICAgICAgIHRoaXMuYmx1ZUFuaW1hdGUsXG4gICAgICAgICAgICB0aGlzLmFscGhhQW5pbWF0ZSxcbiAgICAgICAgICAgIHRoaXMucmVwZWF0O1xuXG4gICAgfTtcblxuICAgIENvbG9yQW5pbWF0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgQ29sb3JBbmltYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sb3JBbmltYXRpb247XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb2xvckFuaW1hdGlvbjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBFeHBpcmVzKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGF5XG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGF5O1xuICAgIH1cblxuICAgIEV4cGlyZXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBFeHBpcmVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cGlyZXM7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFeHBpcmVzO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIGZ1bmN0aW9uIEhlYWx0aCgpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBoZWFsdGhcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaGVhbHRoO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgbWF4aW11bUhlYWx0aFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tYXhpbXVtSGVhbHRoO1xuICAgIH1cblxuICAgIEhlYWx0aC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIEhlYWx0aC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFsdGg7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIZWFsdGg7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gQXJ0ZW1pSlMuQ29tcG9uZW50O1xuXG4gICAgZnVuY3Rpb24gUGFyYWxsYXhTdGFyKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBQYXJhbGxheFN0YXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBQYXJhbGxheFN0YXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGFyYWxsYXhTdGFyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGFyYWxsYXhTdGFyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IEFydGVtaUpTLkNvbXBvbmVudDtcblxuICAgIGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgUGxheWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXllcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICB2YXIgUG9zaXRpb24gPSBmdW5jdGlvbiBQb3NpdGlvbigpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjb3Jkc1xuICAgICAgICAgKiBAdHlwZSB7VEhSRUUuVmVjdG9yMn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29yZHM7XG4gICAgfTtcblxuICAgIFBvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgUG9zaXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9zaXRpb247XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBTY2FsZUFuaW1hdGlvbigpIHtcbiAgICAgICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtaW5cbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWluO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgbWF4XG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm1heDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHNwZWVkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNwZWVkO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgcmVwZWF0XG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZXBlYXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFjdGl2ZTtcbiAgICB9XG5cbiAgICBTY2FsZUFuaW1hdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIFNjYWxlQW5pbWF0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjYWxlQW5pbWF0aW9uO1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2NhbGVBbmltYXRpb247XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSBBcnRlbWlKUy5Db21wb25lbnQ7XG5cbiAgICB2YXIgU3ByaXRlID0gZnVuY3Rpb24gU3ByaXRlKCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgICAgICB0aGlzLnNvdXJjZSA9IG51bGw7XG4gICAgfTtcblxuICAgIFNwcml0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNwcml0ZS5wcm90b3R5cGUpO1xuICAgIFNwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcHJpdGU7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gQXJ0ZW1pSlMuQ29tcG9uZW50O1xuXG4gICAgZnVuY3Rpb24gVmVsb2NpdHkoKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgdmVjdG9yXG4gICAgICAgICAqIEB0eXBlIHtUSFJFRS5WZWN0b3IyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy52ZWN0b3I7XG4gICAgfVxuXG4gICAgVmVsb2NpdHkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBWZWxvY2l0eS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWxvY2l0eTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlbG9jaXR5O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IEFydGVtaUpTLkVudGl0eVN5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBQb3NpdGlvbiA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Qb3NpdGlvbicpLFxuICAgICAgICBCb3VuZHMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQm91bmRzJyk7XG5cbiAgICB2YXIgQ29sbGlzaW9uU3lzdGVtID0gZnVuY3Rpb24gQ29sbGlzaW9uU3lzdGVtKCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKFBvc2l0aW9uLmtsYXNzLCBCb3VuZHMua2xhc3MpKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGNvbGxpc2lvblBhaXJzXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgY29sbGlzaW9uUGFpcnM7XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgY29sbGlzaW9uUGFpcnMuc2l6ZSgpID4gaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29sbGlzaW9uUGFpcnMuZ2V0KGkpLmNoZWNrRm9yQ29sbGlzaW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgQ29sbGlzaW9uSGFuZGxlciA9IGZ1bmN0aW9uIENvbGxpc2lvbkhhbmRsZXIoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlQ29sbGlzaW9uID0gZnVuY3Rpb24oZm9vLCBiYXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZ1bmN0aW9uIGhhbmRsZUNvbGxpc2lvbiBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29sbGlzaW9uU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgQ29sbGlzaW9uU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbGxpc2lvblN5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvblN5c3RlbTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBBcnRlbWlKUy5TeXN0ZW1zLkVudGl0eVByb2Nlc3NpbmdTeXN0ZW0sXG4gICAgICAgIEFzcGVjdCA9IEFydGVtaUpTLkFzcGVjdCxcbiAgICAgICAgQ29sb3JBbmltYXRpb24gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQ29sb3JBbmltYXRpb24nKSxcbiAgICAgICAgU3ByaXRlID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Nwcml0ZScpO1xuXG4gICAgdmFyIENvbG9yQW5pbWF0aW9uU3lzdGVtID0gZnVuY3Rpb24gQ29sb3JBbmltYXRpb25TeXN0ZW0oKSB7XG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKENvbG9yQW5pbWF0aW9uLmtsYXNzLCBTcHJpdGUua2xhc3MpKTtcblxuICAgICAgICB2YXIgY2FtO1xuICAgICAgICB2YXIgc207XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYW0gPSB0aGlzLndvcmxkLmdldE1hcHBlcihDb2xvckFuaW1hdGlvbi5rbGFzcyk7XG4gICAgICAgICAgICBzbSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKFNwcml0ZS5rbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgY1xuICAgICAgICAgICAgICogQHR5cGUge0NvbG9yQW5pbWF0aW9ufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgYyA9IGNhbS5nZXQoZW50aXR5KSxcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBzcHJpdGVcbiAgICAgICAgICAgICAgICAgKiBAdHlwZSB7U3ByaXRlfVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHNtLmdldChlbnRpdHkpO1xuXG4gICAgICAgICAgICBpZighYyB8fCAhc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihjLmFscGhhQW5pbWF0ZSkge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5hICs9IGMuYWxwaGFTcGVlZCAqIHRoaXMud29ybGQuZ2V0RGVsdGEoKTtcblxuICAgICAgICAgICAgICAgIGlmKHNwcml0ZS5hID4gYy5hbHBoYU1heCB8fCBzcHJpdGUuYSA8IGMuYWxwaGFNaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYy5yZXBlYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYWxwaGFTcGVlZCA9IC1jLmFscGhhU3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmFscGhhQW5pbWF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbG9yQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIENvbG9yQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbG9yQW5pbWF0aW9uU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29sb3JBbmltYXRpb25TeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgVm9pZEVudGl0eVN5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuVm9pZEVudGl0eVN5c3RlbSxcbiAgICAgICAgVGltZXIgPSBBcnRlbWlKUy5VdGlscy5UaW1lcjtcblxuICAgIHZhciBFbnRpdHlTcGF3bmluZ1RpbWVyU3lzdGVtID0gZnVuY3Rpb24gRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbSgpIHtcbiAgICAgICAgVm9pZEVudGl0eVN5c3RlbS5jYWxsKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgdGltZXIxXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtUaW1lcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciB0aW1lcjFcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHRpbWVyMlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAdHlwZSB7VGltZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgdGltZXIyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgdGltZXIzXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtUaW1lcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciB0aW1lcjM7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aW1lcjEudXBkYXRlKHRoaXMud29ybGQuZ2V0RGVsdGEoKSk7XG4gICAgICAgICAgICB0aW1lcjIudXBkYXRlKHRoaXMud29ybGQuZ2V0RGVsdGEoKSk7XG4gICAgICAgICAgICB0aW1lcjMudXBkYXRlKHRoaXMud29ybGQuZ2V0RGVsdGEoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRW50aXR5U3Bhd25pbmdUaW1lclN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZvaWRFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBFbnRpdHlTcGF3bmluZ1RpbWVyU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eVNwYXduaW5nVGltZXJTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0sXG4gICAgICAgIEV4cGlyZXMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvRXhwaXJlcycpO1xuXG4gICAgdmFyIEV4cGlyaW5nU3lzdGVtID0gZnVuY3Rpb24gRXhwaXJpbmdTeXN0ZW0oKSB7XG4gICAgICAgIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChFeHBpcmVzLmtsYXNzKSk7XG5cbiAgICAgICAgdmFyIGVtO1xuXG4gICAgICAgIHRoaXMucHJvY2Vzc0RlbHRhID0gZnVuY3Rpb24oZW50aXR5LCBhY2N1bXVsYXRlZERlbHRhKSB7XG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IGVtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgZXhwaXJlcy5kZWxheSAtPSBhY2N1bXVsYXRlZERlbHRhO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucHJvY2Vzc0V4cGlyZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGVudGl0eS5kZWxldGVGcm9tV29ybGQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFJlbWFpbmluZ0RlbGF5ID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IGVtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgcmV0dXJuIGV4cGlyZXMuZGVsYXk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRXhwaXJpbmdTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIEV4cGlyaW5nU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cGlyaW5nU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRXhwaXJpbmdTeXN0ZW07XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gQXJ0ZW1pSlMuU3lzdGVtcy5FbnRpdHlQcm9jZXNzaW5nU3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIEhlYWx0aCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9IZWFsdGgnKTtcblxuICAgIHZhciBIZWFsdGhSZW5kZXJTeXN0ZW0gPSBmdW5jdGlvbiBIZWFsdGhSZW5kZXJTeXN0ZW0oKSB7XG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKFBvc2l0aW9uLmtsYXNzLCBIZWFsdGgua2xhc3MpKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUgQ29tcG9uZW50TWFwcGVyXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlclxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGhtO1xuXG4gICAgICAgIHZhciBoZWFsdGhUZXh0O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaGVhbHRoVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAvL3RleHQyLnN0eWxlLnpJbmRleCA9IDE7ICAgIC8vIGlmIHlvdSBzdGlsbCBkb24ndCBzZWUgdGhlIGxhYmVsLCB0cnkgdW5jb21tZW50aW5nIHRoaXNcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUud2lkdGggPSAxMDA7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLmhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUudG9wID0gMjAwICsgJ3B4JztcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUubGVmdCA9IDIwMCArICdweCc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGhlYWx0aFRleHQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbFByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgdmFyIGhlYWx0aCA9IGhtLmdldChlbnRpdHkpO1xuXG4gICAgICAgICAgICB2YXIgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoaGVhbHRoLmhlYWx0aC9oZWFsdGgubWF4aW11bUhlYWx0aCoxMDApO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5pbm5lckhUTUwgPSBwZXJjZW50YWdlK1wiJVwiO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS50b3AgPSBwb3NpdGlvbi54O1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS5sZWZ0ID0gcG9zaXRpb24ueTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgSGVhbHRoUmVuZGVyU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIEhlYWx0aFJlbmRlclN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFsdGhSZW5kZXJTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIZWFsdGhSZW5kZXJTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgVm9pZEVudGl0eVN5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuVm9pZEVudGl0eVN5c3RlbTtcblxuICAgIHZhciBIdWRSZW5kZXJTeXN0ZW0gPSBmdW5jdGlvbiBIdWRSZW5kZXJTeXN0ZW0oY2FtZXIpIHtcbiAgICAgICAgVm9pZEVudGl0eVN5c3RlbS5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHZhciBoZWFsdGhUZXh0O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaGVhbHRoVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGVhbHRoVGV4dC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAvL3RleHQyLnN0eWxlLnpJbmRleCA9IDE7ICAgIC8vIGlmIHlvdSBzdGlsbCBkb24ndCBzZWUgdGhlIGxhYmVsLCB0cnkgdW5jb21tZW50aW5nIHRoaXNcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUud2lkdGggPSAxMDA7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLmhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUudG9wID0gMjAwICsgJ3B4JztcbiAgICAgICAgICAgIGhlYWx0aFRleHQuc3R5bGUubGVmdCA9IDIwMCArICdweCc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGhlYWx0aFRleHQpO1xuICAgICAgICB9O2R3XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzU3lzdGVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LmlubmVySFRNTCA9IFwiQWN0aXZlIGVudGl0aWVzOiBcIiArIHRoaXMud29ybGQuZ2V0RW50aXR5TWFuYWdlcigpLmdldEFjdGl2ZUVudGl0eUNvdW50KCk7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLnRvcCA9IC0oU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9XSURUSCAvIDIpICsgMjA7XG4gICAgICAgICAgICBoZWFsdGhUZXh0LnN0eWxlLmxlZnQgPSAgU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9IRUlHSFQgLyAyIC0gNDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSHVkUmVuZGVyU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVm9pZEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEh1ZFJlbmRlclN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIdWRSZW5kZXJTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIdWRSZW5kZXJTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAvKmdsb2JhbCBBcnRlbWlKUyovXG4gICAgXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgICAgIEFzcGVjdCA9IEFydGVtaUpTLkFzcGVjdCxcbiAgICAgICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgICAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9WZWxvY2l0eScpO1xuICAgICAgICBcbiAgICB2YXIgTW92ZW1lbnRTeXN0ZW0gPSBmdW5jdGlvbiBNb3ZlbWVudFN5c3RlbSgpIHtcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoUG9zaXRpb24ua2xhc3MsIFZlbG9jaXR5LmtsYXNzKSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgcG0sIHZtO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcG0gPSB0aGlzLndvcmxkLmdldE1hcHBlcihQb3NpdGlvbi5rbGFzcyk7XG4gICAgICAgICAgICB2bSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKFZlbG9jaXR5LmtsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoIWVudGl0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5ID0gdm0uZ2V0KGVudGl0eSk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgcG9zaXRpb24ueCArPSB2ZWxvY2l0eS52ZWN0b3JYKnRoaXMud29ybGQuZ2V0RGVsdGEoKTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgKz0gdmVsb2NpdHkudmVjdG9yWSp0aGlzLndvcmxkLmdldERlbHRhKCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICBNb3ZlbWVudFN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBNb3ZlbWVudFN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlbWVudFN5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1vdmVtZW50U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIFBhcmFsbGF4U3RhciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9QYXJhbGxheFN0YXInKSxcbiAgICAgICAgUG9zaXRpb24gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvUG9zaXRpb24nKTtcblxuICAgIHZhciBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW0gPSBmdW5jdGlvbiBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW0oKSB7XG4gICAgICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoUGFyYWxsYXhTdGFyLmtsYXNzLCBQb3NpdGlvbi5rbGFzcyksIDEpO1xuXG5cbiAgICAgICAgdmFyIHBtO1xuXG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uLnkgPCAtU3BhY2VzaGlwV2Fycmlvci5GUkFNRV9IRUlHSFQgLyAyKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24ueSA9IFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hUIC8gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFBhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFBhcmFsbGF4U3RhclJlcGVhdGluZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQYXJhbGxheFN0YXJSZXBlYXRpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBFbnRpdHlGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlGYWN0b3J5JyksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1ZlbG9jaXR5JyksXG4gICAgICAgIFBsYXllciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9QbGF5ZXInKTtcblxuICAgIGZ1bmN0aW9uIFBsYXllcklucHV0U3lzdGVtKF93ZWJnbCkge1xuICAgICAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChQb3NpdGlvbi5rbGFzcywgVmVsb2NpdHkua2xhc3MsIFBsYXllci5rbGFzcykpO1xuXG4gICAgICAgIHZhciB1cCwgZG93biwgbGVmdCwgcmlnaHQ7XG5cbiAgICAgICAgdmFyIHdlYmdsID0gX3dlYmdsO1xuXG4gICAgICAgIHZhciBtb3VzZTNkO1xuXG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgdmFyIGtleWJvYXJkO1xuXG4gICAgICAgIHZhciBwcm9qZWN0b3I7XG5cbiAgICAgICAgdmFyIGZpcmUgPSBmYWxzZTtcblxuICAgICAgICB2YXIgcG9zID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHBtXG4gICAgICAgICAqIEB0eXBlIHtDb21wb25lbnRNYXBwZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB2bVxuICAgICAgICAgKiBAdHlwZSB7Q29tcG9uZW50TWFwcGVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHZtO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAga2V5Ym9hcmQgPSBuZXcgVEhSRUV4LktleWJvYXJkU3RhdGUoKTtcbiAgICAgICAgICAgIHBtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoUG9zaXRpb24ua2xhc3MpO1xuICAgICAgICAgICAgdm0gPSB0aGlzLndvcmxkLmdldE1hcHBlcihWZWxvY2l0eS5rbGFzcyk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ29uZGJsY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNhbnZhcyA9IHdlYmdsLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cbiAgICAgICAgICAgIHByb2plY3RvciA9IG5ldyBUSFJFRS5Qcm9qZWN0b3IoKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGNhbGN1bGF0ZU1vdXNlM2QsIGZhbHNlKTtcbiAgICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCkge1xuICAgICAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoZXZlbnQpIHtcbiAgICAgICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZU1vdXNlM2QoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjYW1lcmEgPSB3ZWJnbC5jYW1lcmE7XG4gICAgICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgKCBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGggKSAqIDIgLSAxLFxuICAgICAgICAgICAgICAgIC0gKCBldmVudC5jbGllbnRZIC8gd2luZG93LmlubmVySGVpZ2h0ICkgKiAyICsgMSxcbiAgICAgICAgICAgICAgICAwLjUgKTtcblxuICAgICAgICAgICAgcHJvamVjdG9yLnVucHJvamVjdFZlY3RvciggdmVjdG9yLCBjYW1lcmEgKTtcbiAgICAgICAgICAgIHZhciBkaXIgPSB2ZWN0b3Iuc3ViKCBjYW1lcmEucG9zaXRpb24gKS5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IC0gY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgICAgIG1vdXNlM2QgPSBjYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoIGRpci5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2hlY2tQcmVzcygpIHtcbiAgICAgICAgICAgIGlmKGtleWJvYXJkLnByZXNzZWQoXCJXXCIpKSB7XG4gICAgICAgICAgICAgICAgcG9zLnkgPSAyLjFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGtleWJvYXJkLnByZXNzZWQoXCJBXCIpKSB7XG4gICAgICAgICAgICAgICAgcG9zLnggPSAtMi4xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoa2V5Ym9hcmQucHJlc3NlZChcIlNcIikpIHtcbiAgICAgICAgICAgICAgICBwb3MueSA9IC0yLjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihrZXlib2FyZC5wcmVzc2VkKFwiRFwiKSkge1xuICAgICAgICAgICAgICAgIHBvcy54ID0gMi4xXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjbGVhclBvcygpIHtcbiAgICAgICAgICAgIHBvcy54ID0gMDtcbiAgICAgICAgICAgIHBvcy55ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoIWVudGl0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5ID0gdm0uZ2V0KGVudGl0eSk7XG5cbiAgICAgICAgICAgIGlmKCFwb3NpdGlvbiB8fCAhdmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhclBvcygpO1xuICAgICAgICAgICAgY2hlY2tQcmVzcygpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCArPSBwb3MueDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgKz0gcG9zLnk7XG4gICAgICAgICAgICBwb3NpdGlvbi56ID0gMDtcbiAgICAgICAgICAgIHBvc2l0aW9uLnZlY3RvciA9IG1vdXNlM2Q7XG4gICAgICAgICAgICBpZihmaXJlKSB7XG4gICAgICAgICAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIEVudGl0eUZhY3RvcnkuY3JlYXRlUGxheWVyQnVsbGV0KHRoaXMud29ybGQsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpLmFkZFRvV29ybGQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIFBsYXllcklucHV0U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFBsYXllcklucHV0U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXllcklucHV0U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGxheWVySW5wdXRTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBBcnRlbWlKUy5TeXN0ZW1zLkludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBWZWxvY2l0eSA9IHJlcXVpcmUoXCIuLy4uL2NvbXBvbmVudHMvVmVsb2NpdHlcIiksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZShcIi4vLi4vY29tcG9uZW50cy9Qb3NpdGlvblwiKSxcbiAgICAgICAgSGVhbHRoID0gcmVxdWlyZShcIi4vLi4vY29tcG9uZW50cy9IZWFsdGhcIiksXG4gICAgICAgIEJvdW5kcyA9IHJlcXVpcmUoXCIuLy4uL2NvbXBvbmVudHMvQm91bmRzXCIpLFxuICAgICAgICBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9jb21wb25lbnRzL1BsYXllclwiKTtcblxuICAgIHZhciBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbSA9IGZ1bmN0aW9uIFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtKCkge1xuICAgICAgICBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKFxuICAgICAgICAgICAgVmVsb2NpdHkua2xhc3MsXG4gICAgICAgICAgICBQb3NpdGlvbi5rbGFzcyxcbiAgICAgICAgICAgIEhlYWx0aC5rbGFzcyxcbiAgICAgICAgICAgIEJvdW5kcy5rbGFzc1xuICAgICAgICApLmV4Y2x1ZGUoUGxheWVyLmtsYXNzKSwgNSk7XG5cbiAgICAgICAgdmFyIHBtO1xuICAgICAgICB2YXIgYm07XG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlKSxcbiAgICAgICAgICAgICAgICBib3VuZHMgPSBibS5nZXQoZSk7XG5cbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLnkgPCAtIFNwYWNlc2hpcFdhcnJpb3IuRlJBTUVfSEVJR0hULzItYm91bmRzLnJhZGl1cykge1xuICAgICAgICAgICAgICAgIGUuZGVsZXRlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBSZW1vdmVPZmZzY3JlZW5TaGlwc1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbW92ZU9mZnNjcmVlblNoaXBzU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUmVtb3ZlT2Zmc2NyZWVuU2hpcHNTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IEFydGVtaUpTLlN5c3RlbXMuRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSxcbiAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0LFxuICAgICAgICBTY2FsZUFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TY2FsZUFuaW1hdGlvbicpO1xuXG4gICAgdmFyIFNjYWxlQW5pbWF0aW9uU3lzdGVtID0gZnVuY3Rpb24gU2NhbGVBbmltYXRpb25TeXN0ZW0oKSB7XG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0QXNwZWN0Rm9yT25lKFNjYWxlQW5pbWF0aW9uLmtsYXNzKSk7XG5cbiAgICAgICAgdmFyIHNhO1xuICAgICAgICB2YXIgc207XG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZUFuaW1hdGlvbiA9IHNhLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYgKHNjYWxlQW5pbWF0aW9uLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBzbS5nZXQoZW50aXR5KTtcblxuICAgICAgICAgICAgICAgIHNwcml0ZS5zY2FsZVggKz0gc2NhbGVBbmltYXRpb24uc3BlZWQgKiB0aGlzLndvcmxkLmdldERlbHRhKCk7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnNjYWxlWSA9IHNwcml0ZS5zY2FsZVg7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlLnNjYWxlWCA+IHNjYWxlQW5pbWF0aW9uLm1heCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc2NhbGVYID0gc2NhbGVBbmltYXRpb24ubWF4O1xuICAgICAgICAgICAgICAgICAgICBzY2FsZUFuaW1hdGlvbi5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNwcml0ZS5zY2FsZVggPCBzY2FsZUFuaW1hdGlvbi5taW4pIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNjYWxlWCA9IHNjYWxlQW5pbWF0aW9uLm1pbjtcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVBbmltYXRpb24uYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNjYWxlQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUpO1xuICAgIFNjYWxlQW5pbWF0aW9uU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjYWxlQW5pbWF0aW9uU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2NhbGVBbmltYXRpb25TeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5U3lzdGVtID0gQXJ0ZW1pSlMuRW50aXR5U3lzdGVtLFxuICAgICAgICBBc3BlY3QgPSBBcnRlbWlKUy5Bc3BlY3QsXG4gICAgICAgIE1hdGhVdGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvTWF0aFV0aWxzJyksXG4gICAgICAgIFBvc2l0aW9uID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1Bvc2l0aW9uJyksXG4gICAgICAgIFNwcml0ZSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TcHJpdGUnKTtcblxuICAgIHZhciBTcHJpdGVSZW5kZXJTeXN0ZW0gPSBmdW5jdGlvbiBTcHJpdGVSZW5kZXJTeXN0ZW0od2ViZ2wpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgQXNwZWN0LmdldEFzcGVjdEZvckFsbChQb3NpdGlvbi5rbGFzcywgU3ByaXRlLmtsYXNzKSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlcjxQb3NpdGlvbj47XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIENvbXBvbmVudE1hcHBlcjxTcHJpdGU+XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc207XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwbSA9IHRoaXMud29ybGQuZ2V0TWFwcGVyKFBvc2l0aW9uLmtsYXNzKTtcbiAgICAgICAgICAgIHNtID0gdGhpcy53b3JsZC5nZXRNYXBwZXIoU3ByaXRlLmtsYXNzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGkgPSBlbnRpdGllcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyhlbnRpdGllcy5nZXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZighcG0uaGFzKGVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHBtLmdldChlbnRpdHkpO1xuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IHNtLmdldChlbnRpdHkpO1xuXG4gICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56KTtcbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLnZlY3Rvcikge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5zb3VyY2UubWF0ZXJpYWwucm90YXRpb24gPSBNYXRoVXRpbHMuYW5nbGUoXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnZlY3Rvci54LFxuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnZlY3Rvci55LFxuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc291cmNlLnBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5zZXJ0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBzbS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKHNwcml0ZSkge1xuICAgICAgICAgICAgICAgIHdlYmdsLnNjZW5lLmFkZChzcHJpdGUuc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTcHJpdGVSZW5kZXJTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBTcHJpdGVSZW5kZXJTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ByaXRlUmVuZGVyU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIE1hdGhVdGlscyA9IHtcbiAgICAgICAgcmFuZG9tOiBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoobWF4LW1pbisxKSttaW4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZzJyYWQ6IGZ1bmN0aW9uKGRlZykge1xuICAgICAgICAgICAgcmV0dXJuIGRlZyAqIE1hdGguUEkvMTgwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFuZ2xlOiBmdW5jdGlvbih4MSx4Mix5MSx5Mikge1xuICAgICAgICAgICAgdmFyIGRlZyA9IE1hdGguYXRhbjIoKHkxIC0geTIpLCh4MSAtIHgyKSkgKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVnMnJhZChkZWcpLSBNYXRoLlBJLzI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXRoVXRpbHM7XG59KSgpOyJdfQ==
