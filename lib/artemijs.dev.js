Array.prototype.get = function(index) {
  return this[index];
};

Array.prototype.set = function(index, value) {
  this[index] = value;
};/**
 * For an rfc4122 version 4 compliant solution
 * 
 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 * @author broofa
 */
Math.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
};Object.prototype.getClass = function() {
    return this.constructor.name;
};(function(e){if("function"==typeof bootstrap)bootstrap("artemijs",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeArtemiJS=e}else"undefined"!=typeof window?window.ArtemiJS=e():global.ArtemiJS=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    'use strict';
    
    // this file have to be included first in yuicompressor
    
    /**
     * Entity Framework
     * 
     * @module ArtemiJS
     * @class ArtemiJS
     * @main ArtemiJS
     */
    var ArtemiJS = {
        
        /**
         * @property {Float} version
         */
        version: 0.1,
        
        /**
         * @property {String} source
         */
        source: 'https://github.com/cojack/artemijs',
        
        /**
         * @property {String} license
         */
        license: 'GPLv2',
        
        /**
         * @property {Number} env
         */
        env: 1 // 1 - dev, 2 - test, 4 - prod
    };
    
    ArtemiJS.Managers = {
        GroupManager: require('./managers/GroupManager'),
        PlayerManager: require('./managers/PlayerManager'),
        TagManager: require('./managers/TagManager'),
        TeamManager: require('./managers/TeamManager')
    };
    
    ArtemiJS.Systems = {
        DelayedEntityProcessingSystem: require('./systems/DelayedEntityProcessingSystem'),
        EntityProcessingSystem: require('./systems/EntityProcessingSystem'),
        IntervalEntityProcessingSystem: require('./systems/IntervalEntityProcessingSystem'),
        IntervalEntitySystem: require('./systems/IntervalEntitySystem'),
        VoidEntitySystem: require('./systems/VoidEntitySystem')
    };
    
    ArtemiJS.Utils = {
        Bag: require('./utils/Bag'),
        BitSet: require('./utils/BitSet'),
        HashMap: require('./utils/HashMap')
    };
    
    ArtemiJS.Aspect = require('./Aspect');
    ArtemiJS.Component = require('./Component');
    ArtemiJS.ComponentManager = require('./ComponentManager');
    ArtemiJS.ComponentMapper = require('./ComponentMapper');
    ArtemiJS.ComponentType = require('./ComponentType');
    ArtemiJS.Entity = require('./Entity');
    ArtemiJS.EntityManager = require('./EntityManager');
    ArtemiJS.EntityObserver = require('./EntityObserver');
    ArtemiJS.EntitySystem = require('./EntityObserver');
    ArtemiJS.Manager = require('./Manager');
    ArtemiJS.World = require('./World');
    
    module.exports = ArtemiJS;
})();
},{"./Aspect":2,"./Component":3,"./ComponentManager":4,"./ComponentMapper":5,"./ComponentType":6,"./Entity":7,"./EntityManager":8,"./EntityObserver":9,"./Manager":11,"./World":12,"./managers/GroupManager":13,"./managers/PlayerManager":14,"./managers/TagManager":15,"./managers/TeamManager":16,"./systems/DelayedEntityProcessingSystem":17,"./systems/EntityProcessingSystem":18,"./systems/IntervalEntityProcessingSystem":19,"./systems/IntervalEntitySystem":20,"./systems/VoidEntitySystem":21,"./utils/Bag":22,"./utils/BitSet":23,"./utils/HashMap":24}],2:[function(require,module,exports){
(function() {
    'use strict';

    var BitSet = require('./utils/BitSet'),
        ComponentType = require('./ComponentType');

    /**
     * An Aspects is used by systems as a matcher against entities, to check if a system is
     * interested in an entity. Aspects define what sort of component types an entity must
     * possess, or not possess.
     * 
     * This creates an aspect where an entity must possess A and B and C:
     * Aspect.getAspectForAll(A.class, B.class, C.class)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V.
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V, but must possess one of X or Y or Z.
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
     *
     * You can create and compose aspects in many ways:
     * Aspect.getEmpty().one(X.class, Y.class, Z.class).all(A.class, B.class, C.class).exclude(U.class, V.class)
     * is the same as:
     * Aspect.getAspectForAll(A.class, B.class, C.class).exclude(U.class, V.class).one(X.class, Y.class, Z.class)
     * 
     * @module ArtemiJS
     * @class Aspect
     * @constructor
     */
    var Aspect = function Aspect() {
        
        /**
         * @private
         * @property allSet
         * @type {Utils.BitSet}
         */
        var allSet = new BitSet(),
        
        /**
         * @private
         * @property exclusionSet
         * @type {Utils.BitSet}
         */        
        exclusionSet = new BitSet(),
            
        /**
         * @private
         * @property exclusionSet
         * @type {Utils.BitSet}
         */                
        oneSet = new BitSet();
            
        /**
         * @method getAllSet
         * @return {Utils.BitSet}
         */
        this.getAllSet = function() {
            return allSet;
        };
        
        /**
         * @method getExclusionSet
         * @return {Utils.BitSet}
         */
        this.getExclusionSet = function() {
            return exclusionSet;
        };
        
        /**
         * @method getOneSet
         * @return {Utils.BitSet}
         */
        this.getOneSet = function() {
            return oneSet;
        };
        
        /**
         * Returns an aspect where an entity must possess all of the specified component types.
         * 
         * @method all
         * @chainable
         * @param {String} type* a required component type
         */
        this.all = function(type) {
            allSet.set(ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                allSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Excludes all of the specified component types from the aspect. A system will not be
         * interested in an entity that possesses one of the specified exclusion component types.
         * 
         * @method exclude
         * @chainable
         * @param {String} type* component type to exclude
         */
        this.exclude = function(type) {
            exclusionSet.set(ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                exclusionSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Returns an aspect where an entity must possess one of the specified component types.
         * 
         * @method one
         * @chainable
         * @param {String} type* one of the types the entity must possess
         */
        this.one = function(type) {
            oneSet.set(ComponentType.getIndexFor(type));
            var len = arguments.length;
            while(len--) {
                oneSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
        
        /**
         * Creates an aspect where an entity must possess all of the specified component types.
         * 
         * @method getAspectForAll
         * @param {String} type* a required component type
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        this.getAspectForAll = function(type) {
            var aspect = new Aspect();
            aspect.all(type, arguments);
            return aspect;
        };
        
        
        /**
         * Creates an aspect where an entity must possess one of the specified component types.
         * 
         * @method getAspectForOne
         * @param {String} type* one of the types the entity must possess
         * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
         */
        this.getAspectForOne = function(type) {
            var aspect = new Aspect();
            aspect.one(type, arguments);
            return aspect;
        };
    };
    
    /**
     * Creates and returns an empty aspect. This can be used if you want a system that processes no entities, but
     * still gets invoked. Typical usages is when you need to create special purpose systems for debug rendering,
     * like rendering FPS, how many entities are active in the world, etc.
     * 
     * You can also use the all, one and exclude methods on this aspect, so if you wanted to create a system that
     * processes only entities possessing just one of the components A or B or C, then you can do:
     * Aspect.getEmpty().one(A,B,C);
     * 
     * @method getEmpty
     * @return {ArtemiJS.Aspect} an empty Aspect that will reject all entities.
     */
    Aspect.getEmpty = function() {
        return new Aspect();
    };

    module.exports = Aspect;
})();
},{"./ComponentType":6,"./utils/BitSet":23}],3:[function(require,module,exports){
(function() {
    'use strict';
    
    /**
     * A tag class. All components in the system must extend this class.
     * 
     * @module ArtemiJS
     * @class Component
     * @constructor
     */
    var Component = function Component() {};

    module.exports = Component;
})();
},{}],4:[function(require,module,exports){
(function() {
    'use strict';
    
    var Bag = require('./utils/Bag'),
        Manager = require('./Manager');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class ComponentManager
     * @constructor
     */
    var ComponentManager = function ComponentManager() {
        Manager.call(this);
        
        /**
         * @private
         * @property componentsByType
         * @type {Utils.Bag}
         */
        var componentsByType = new Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {Utils.Bag}
         */
        deleted = new Bag();
            
        /**
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * @private
         * @method removeComponentsOfEntity
         * @param {Entity} entity
         */
        var removeComponentsOfEntity = function (entity) {
            var componentBits = entity.getComponentBits();
            for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
                componentsByType.get(i).set(entity.getId(), null);
            }
            componentBits.clear();
        };
        
        /**
         * Add component by type
         * 
         * @method addComponent
         * @param {Entity} entity
         * @param {ComponentType} type
         * @param {Component} component
         */
        this.addComponent = function(entity, type, component) {        
            var components = componentsByType.get(type.getIndex());
            if(components === null) {
                components = [];
                componentsByType.set(type.getIndex(), components);
            }
            
            components.set(entity.getId(), component);
    
            entity.getComponentBits().set(type.getIndex());
        };
        
        /**
         * Remove component by type
         * 
         * @method removeComponent
         * @param {Entity} entity
         * @param {ComponentType} type
         */
        this.removeComponent = function(entity, type) {
            if(entity.getComponentBits().get(type.getIndex())) {
                componentsByType.get(type.getIndex()).set(entity.getId(), null);
                entity.getComponentBits().clear(type.getIndex());
            }
        };
        
        /**
         * Get component by type
         * 
         * @method getComponentsByType
         * @param {ComponentType} type
         * @return {Utils.Bag} Bag of components
         */        
        this.getComponentsByType = function(type) {
            var components = componentsByType.get(type.getIndex());
            if(components === null) {
                components = new Bag();
                componentsByType.set(type.getIndex(), components);
            }
            return components;
        };
        
        /**
         * Get component
         * 
         * @method getComponent
         * @param {Entity} entity
         * @param {ComponentType} type
         * @return Mixed Component on success, null on false
         */
        this.getComponent = function(entity, type) {
            var components = componentsByType.get(type.getIndex());
            if(components !== null) {
                return components.get(entity.getId());
            }
            return null;
        };
        
        /**
         * Get component for
         * 
         * @method getComponentsFor
         * @param {Entity} entity
         * @param {Utils.Bag} Bag of components
         * @return {Utils.Bag} Bag of components
         */
        this.getComponentsFor = function(entity, fillBag) {
            var componentBits = entity.getComponentBits();
    
            for (var i = componentBits.nextSetBit(0); i >= 0; i = componentBits.nextSetBit(i+1)) {
                fillBag.add(componentsByType.get(i).get(entity.getId()));
            }
            
            return fillBag;
        };
        
        /**
         * Add entity to delete componenets of them
         * 
         * @method deleted
         * @param {Entity} entity
         */
        this.deleted = function(entity) {
            deleted.add(entity);
        };
        
        /**
         * Clean deleted componenets of entities
         * 
         * @method clean
         */
        this.clean = function() {
            if(deleted.size() > 0) {
                for(var i = 0; deleted.size() > i; i++) {
                    removeComponentsOfEntity(deleted.get(i));
                }
                deleted.clear();
            }
        };
    };
    
    ComponentManager.prototype = Object.create(Manager.prototype);
    module.exports = ComponentManager;
})();
},{"./Manager":11,"./utils/Bag":22}],5:[function(require,module,exports){
(function() {
    'use strict';

    var Component = require('./Component'),
        ComponentType = require('./ComponentType');

    /**
     * High performance component retrieval from entities. Use this wherever you
     * need to retrieve components from entities often and fast.
     * 
     * @module ArtemiJS
     * @class ComponentMapper
     * @constructor
     * @param {Object} _type
     * @param {ArtemiJS.World} _world
     */
    var ComponentMapper = function ComponentMapper(_type, _world) {
        Component.call(this);
        
        /**
         * @private
         * @property {ArtemiJS.ComponentType} type Type of component
         */
        var type = ComponentType.getTypeFor(_type),
        
        /**
         * @private
         * @param {ArtemiJS.Utils.Bag} components Bag of components
         */
        components = _world.getComponentManager().getComponentsByType(type);
            
        /**
         * Fast but unsafe retrieval of a component for this entity.
         * No bounding checks, so this could return null,
         * however in most scenarios you already know the entity possesses this component.
         * 
         * @method get
         * @param {ArtemiJS.Entity} entity
         * @return {ArtemiJS.Component}|null
         */
        this.get = function(entity) {
            return components.get(entity.getId());
        };
        
        /**
         * Fast and safe retrieval of a component for this entity.
         * If the entity does not have this component then null is returned.
         * 
         * @method getSafe
         * @param {ArtemiJS.Entity} entity
         * @return {ArtemiJS.Component}|null
         */
        this.getSafe = function(entity) {
            if(components.isIndexWithinBounds(entity.getId())) {
                return components.get(entity.getId());
            }
            return null;
        };
        
        /**
         * Checks if the entity has this type of component.
         * 
         * @method has
         * @param {ArtemiJS.Entity} entity
         * @return boolean true if the entity has this component type, false if it doesn't.
         */
        this.has = function(entity) {
            return this.getSafe(entity) !== null;
        };
    };
    
    /**
     * Returns a component mapper for this type of components.
     * 
     * @method getFor
     * @static
     * @param {Object} type the type of components this mapper uses
     * @param {ArtemiJS.World} the world that this component mapper should use
     * @return {ArtemiJS.ComponentMapper}
     */
    ComponentMapper.getFor = function(type, world) {
        return new ComponentMapper(type, world);
    };
    
    ComponentMapper.prototype = Object.create(Component.prototype);
    module.exports.ComponentMapper = ComponentMapper;
})();
},{"./Component":3,"./ComponentType":6}],6:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./utils/HashMap');
    
    /**
     * 
     * @static
     * @class ComponentType
     */
    var ComponentType = (function ComponentType() {
        
        /**
         * @private
         * @property type
         * @type {ArtemiJS.Component}
         */
        var type,
        
        /**
         * @private
         * @static
         * @property INDEX
         * @type {Integer}
         */
        INDEX = 0,
        
        /**
         * @private
         * @property index
         * @type {Integer}
         */
        index,
        
        /**
         * 
         *
         */
        componentTypes = new HashMap();
           
        /**
         * 
         *
         */
        function Constructor(_type) {
            this.index = INDEX++;
            this.type = _type;
        };

        return {
            
            index: 0,
            type: null,
            
            getIndex: function() {
                return this.index;
            },
            
            /**
             * 
             *
             */
            getFor: function(component) {
                var _type = componentTypes.get(component);
                if(_type === null) {
                    _type = Constructor.call(this, _type);
                    componentTypes.put(component, _type);
                }
                return _type;
            },
            
            /**
             * 
             */
            getIndexFor: function(component) {
                return this.getTypeFor(component).getIndex();
            },
            
            toString: function() {
                return "ComponentType["+type.getSimpleName()+"] ("+index+")";
            }
        };
    })();
    
    module.exports = ComponentType;
})();
},{"./utils/HashMap":24}],7:[function(require,module,exports){
(function() {
    'use strict';
    
    var BitSet = require('./utils/BitSet'),
        ComponentType = require('./ComponentType');

    /**
     * The entity class. Cannot be instantiated outside the framework, you must
     * create new entities using World.
     * 
     * @module ArtemiJS
     * @class Entity
     * @constructor
     * @param {World} _world
     * @param {Number} _id
     */ 
    var Entity = function Entity(_world, _id) {
        
        /**
         * @private
         * @property uuid
         * @type {String}
         */
        var uuid,
        
        /**
         * @private
         * @property componentBits
         * @type {Utils.BitSet}
         */
        componentBits = new BitSet(),

        /**
         * @private
         * @property systemBits
         * @type {Utils.BitSet}
         */
        systemBits = new BitSet(),
        
        /**
         * @private
         * @property world
         * @type {World}
         */
        world = _world,
        
        /**
         * @private
         * @property id
         * @type {Number}
         */
        id = _id,
        
        /**
         * @private
         * @property entityManager
         * @type {EntityManager}
         */
        entityManager = world.getEntityManager(),
        
        /**
         * @private
         * @property componentManager
         * @type {ComponentManager}
         */
        componentManager = world.getComponentManager();
        
        reset();
        
        /**
         * The internal id for this entity within the framework. No other entity
         * will have the same ID, but ID's are however reused so another entity may
         * acquire this ID if the previous entity was deleted.
         * 
         * @method getId
         * @return {Number}
         */
        this.getId = function() {
            return id;
        };
        
        /**
         * Returns a BitSet instance containing bits of the components the entity possesses.
         * 
         * @method getComponentBits
         * @return {Utils.BitSet}
         */
        this.getComponentBits = function() {
            return componentBits;
        };
        
        /**
         * Returns a BitSet instance containing bits of the components the entity possesses.
         * 
         * @method getSystemBits
         * @return {Utils.BitSet}
         */
        this.getSystemBits = function() {
            return systemBits;
        };
        
        /**
         * Get systems BitSet
         * 
         * @private
         * @method reset
         */
        function reset() {
            systemBits.reset();
            componentBits.reset();
            uuid = Math.uuid();
        }
        
        /**
         * Make entity ready for re-use.
         * Will generate a new uuid for the entity.
         * 
         * @method toString
         * @return {String}
         */
        this.toString = function() {
            return "Entity [" + id + "]";
        };
        
        /**
         * Add a component to this entity.
         * 
         * @method addComponent
         * @chainable
         * @param {Component} component
         * @param {ComponentType} [type]
         */
        this.addComponent = function(component, type) {
            if(!(type instanceof ComponentType)) {
                type = ComponentType.getTypeFor(component.getClass());
            }
            componentManager.addComponent(this, type, component);
            return this;
        };
        
        /**
         * Remove component by its type.
         * 
         * @method removeComponent
         * @param {Component} [component]
         */
        this.removeComponent = function(component) {
            var componentType;
            if(!(component instanceof ComponentType)) {
                componentType = ComponentType.getTypeFor(component);
            } else {
                componentType = component;
            }
            componentManager.removeComponent(this, componentType);
        };
        
        /**
         * Checks if the entity has been added to the world and has not been deleted from it.
         * If the entity has been disabled this will still return true.
         * 
         * @method isActive
         * @return {Boolean}
         */
        this.isActive = function() {
            return entityManager.isActive(this.id);
        };
        
        /**
         * @method isEnabled
         * @return {Boolean}
         */
        this.isEnabled = function() {
            return entityManager.isEnabled(this.id);
        };
        
        /**
         * This is the preferred method to use when retrieving a component from a
         * entity. It will provide good performance.
         * But the recommended way to retrieve components from an entity is using
         * the ComponentMapper.
         * 
         * @method getComponent
         * @param {ComponentType} [type]
         *      in order to retrieve the component fast you must provide a
         *      ComponentType instance for the expected component.
         * @return {ArtemiJS.Component}
         */
        this.getComponent = function(type) {
            var componentType;
            if(!(type instanceof ComponentType)) {
                componentType = ComponentType.getTypeFor(type);
            } else {
                componentType = type;
            }
            return componentManager.getComponent(this, componentType);
        };
        
        /**
         * Returns a bag of all components this entity has.
         * You need to reset the bag yourself if you intend to fill it more than once.
         * 
         * @method getComponents
         * @param {Utils.Bag} fillBag the bag to put the components into.
         * @return {Utils.Bag} the fillBag with the components in.
         */
        this.getComponents = function(fillBag) {
            return componentManager.getComponentsFor(this, fillBag);
        };
        
        /**
         * Refresh all changes to components for this entity. After adding or
         * removing components, you must call this method. It will update all
         * relevant systems. It is typical to call this after adding components to a
         * newly created entity.
         * 
         * @method addToWorld
         */
        this.addToWorld = function() {
            world.addEntity(this);
        };
        
        /**
         * This entity has changed, a component added or deleted.
         * 
         * @method changedInWorld
         */
        this.changedInWorld = function() {
            world.changedEntity(this);
        };
        
        /**
         * Delete this entity from the world.
         * 
         * @method deleteFromWorl
         */
        this.deleteFromWorld = function() {
            world.deleteEntity(this);
        };
        
        /**
         * (Re)enable the entity in the world, after it having being disabled.
         * Won't do anything unless it was already disabled.
         * 
         * @method enable
         */
        this.enable = function() {
            world.enable(this);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disable
         */
        this.disable = function() {
            world.disable(this);
        };
        
        /**
         * Get the UUID for this entity.
         * This UUID is unique per entity (re-used entities get a new UUID).
         * 
         * @method getUuid
         * @return {String} uuid instance for this entity.
         */
        this.getUuid = function() {
            return uuid;
        };
        
        /**
         * Returns the world this entity belongs to.
         * 
         * @method getWorld
         * @return {ArtemiJS.World} world of entity.
         */
        this.getWorld = function() {
            return world;
        };
    };

    module.exports = Entity;
})();
},{"./ComponentType":6,"./utils/BitSet":23}],8:[function(require,module,exports){
(function() {
    'use strict';

    var Bag = require('./utils/Bag'),
        BitSet = require('./utils/BitSet'),
        Entity = require('./Entity'),
        Manager = require('./Manager');

    /**
     * The entity manager class.
     * 
     * @module ArtemiJS
     * @class EntityManager
     * @constructor
     */ 
    var EntityManager = function EntityManager() {
        Manager.call(this);
        
        /**
         * @private
         * @property entities
         * @type {Utils.Bag}
         */
        var entities = new Bag(),
        
        /**
         * @private
         * @property disabled
         * @type {Utils.BitSet}
         */
        disabled = new BitSet(),
        
        /**
         * @private
         * @property active
         * @type {Number}
         */
        active,
        
        /**
         * @private
         * @property added
         * @type {Number}
         */
        added,
        
        /**
         * @private
         * @property created
         * @type {Number}
         */
        created,
        
        /**
         * @private
         * @property deleted
         * @type {Number}
         */
        deleted,
        
        /**
         * @private
         * @property identifierPool
         * @type {IdentifierPool}
         */
        identifierPool = new IdentifierPool();
        
        /**
         * Initialize
         * 
         * @method initialize
         */
        this.initialize = function() {
            
        };
        
        /**
         * Create new entity instance
         * 
         * @method createEntityInstance
         * @return {Entity}
         */
        this.createEntityInstance = function() {
            var entity = new Entity(this.world, identifierPool.checkOut());
            created++;
            return entity;
        };
        
        /**
         * Set entity as added for future process
         * 
         * @method added
         * @param {Entity} entity
         */
        this.added = function(entity) {
            active++;
            added++;
            entities.set(entity.getId(), entity);
        };
        
        /**
         * Set entity as enabled for future process
         * 
         * @method enabled
         * @param {Entity} entity
         */
        this.enabled = function(entity) {
            disabled.clear(entity.getId());
        };
        
        /**
         * Set entity as disabled for future process
         * 
         * @method disabled
         * @param {Entity} entity
         */
        this.disabled = function(entity) {
            disabled.set(entity.getId());
        };
        
        /**
         * Set entity as deleted for future process
         * 
         * @method deleted
         * @param {Entity} entity
         */
        this.deleted = function(entity) {
            entities.set(entity.getId(), null);
            
            disabled.clear(entity.getId());
            
            identifierPool.checkIn(entity.getId());
            
            active--;
            deleted++;
        };
        
        /**
         * Check if this entity is active.
         * Active means the entity is being actively processed.
         * 
         * @method isActive
         * @param {Number} entityId
         * @return {Boolean} true if active, false if not
         */
        this.isActive = function(entityId) {
            return entities.get(entityId) !== null;
        };
        
        /**
         * Check if the specified entityId is enabled.
         * 
         * @method isEnabled
         * @param {Number} entityId
         * @return {Boolean} true if enabled, false if it is disabled
         */
        this.isEnabled = function(entityId) {
            return !disabled.get(entityId);
        };
        
        /**
         * Get a entity with this id.
         * 
         * @param getEntity
         * @param {Number} entityId
         * @return {Entity}
         */
        this.getEntity = function(entityId) {
            return entities.get(entityId);
        };
        
        /**
         * Get how many entities are active in this world.
         * 
         * @method getActiveEntityCount
         * @return {Number} how many entities are currently active.
         */
        this.getActiveEntityCount = function() {
            return active;
        };
    
       /**
         * Get how many entities have been created in the world since start.
         * Note: A created entity may not have been added to the world, thus
         * created count is always equal or larger than added count.
         * 
         * @method getTotalCreated
         * @return {Number} how many entities have been created since start.
         */
        this.getTotalCreated = function() {
            return created;
        };
    
        /**
         * Get how many entities have been added to the world since start.
         * 
         * @method getTotalAdded
         * @return {Number} how many entities have been added.
         */
        this.getTotalAdded = function() {
            return added;
        };
    
        /**
         * Get how many entities have been deleted from the world since start.
         * 
         * @method getTotalDeleted
         * @return {Number} how many entities have been deleted since start.
         */
        this.getTotalDeleted = function() {
            return deleted;
        };
      
        /**
         * Used only internally in EntityManager to generate distinct ids for
         * entities and reuse them
         * 
         * @module ArtemiJS
         * @class IdentifierPool
         * @for EntityManager
         * @final
         * @constructor
         */
        function IdentifierPool() {
            
            /**
             * @property ids
             * @type {Utils.Bag}
             */
            var ids = new Bag(),
            
            /**
             * @property nextAvailableId
             * @type {Number}
             */
            nextAvailableId = 0;
            
            /**
             * Check an available id
             * 
             * @method checkOut
             * @return {Number} next available id
             */
            this.checkOut = function() {
                if(ids.size()) {
                    return ids.removeLast();
                }
                return nextAvailableId++;
            };
            
            /**
             * Add new id in ids {Bag}
             * 
             * @method checkIn
             * @param {Number} id
             */
            this.checkIn = function(id) {
                ids.push(id);
            };
        }
    };
    
    EntityManager.prototype = Object.create(Manager.prototype);
    module.exports = EntityManager;
})();
},{"./Entity":7,"./Manager":11,"./utils/Bag":22,"./utils/BitSet":23}],9:[function(require,module,exports){
(function() {
    'use strict';
    
    /**
     * The entity observer class.
     * 
     * @module ArtemiJS
     * @class EntityObserver
     * @constructor
     */ 
    var EntityObserver = function EntityObserver() {
        
        /**
         * Abstract method added
         * 
         * @abstract
         * @method added
         * @param {Entity} entity
         */
        this.added = function(entity) {
            throw new Error('EntityObserver function added not implemented');
        };
        
        /**
         * Abstract method changed
         * 
         * @abstract
         * @method changed
         * @param {Entity} entity
         */
        this.changed = function(entity)  {
            throw new Error('EntityObserver function changed not implemented');
        };
        
        /**
         * Abstract method deleted
         * 
         * @abstract
         * @method deleted
         * @param {Entity} entity
         */
        this.deleted = function(entity)  {
            throw new Error('EntityObserver function deleted not implemented');
        };
        
        /**
         * Abstract method enabled
         * 
         * @abstract
         * @method enabled
         * @param {Entity} entity
         */
        this.enabled = function(entity)  {
            throw new Error('EntityObserver function enabled not implemented');
        };
        
        /**
         * Abstract method disabled
         * 
         * @abstract
         * @method disabled
         * @param {Entity} entity
         */
        this.disabled = function(entity)  {
            throw new Error('EntityObserver function disabled not implemented');
        };
    };
    
    module.exports = EntityObserver;
})();
},{}],10:[function(require,module,exports){
(function() {
    'use strict';
    
    var Bag = require('./utils/Bag'),
        EntityObserver = require('./EntityObserver');
    
    /**
     * Used to generate a unique bit for each system.
     * Only used internally in EntitySystem.
     * 
     * @module ArtemiJS
     * @class SystemIndexManager
     * @for EntitySystem
     * @final
     * @constructor
     */
    var SystemIndexManager = {
        
        /**
         * @property INDEX
         * @type {Number}
         */
        INDEX: 0,
        
        /**
         * @property indices
         * @type {Array}
         */
        indices: {},
        
        /**
         * @method getIndexFor
         * @param {EntitySystem} entitySystem
         * @return {Number} index
         */
        getIndexFor: function(entitySystem) {
            var index = this.indices[entitySystem];
            if(!index) {
                index = this.INDEX++;
                this.indices[entitySystem] = index;
            }
            return index;
        }
    };
    
    /**
     * The most raw entity system. It should not typically be used, but you can 
     * create your own entity system handling by extending this. It is 
     * recommended that you use the other provided entity system implementations
     * 
     * @module ArtemiJS
     * @class EntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var EntitySystem = function EntitySystem(_aspect) {
        EntityObserver.call(this);
        
        /**
         * @property world
         * @type {World}
         */
        this.world = null;
        
        /**
         * @private
         * @final
         * @property systemIndex
         * @type {Number}
         */
        var systemIndex = SystemIndexManager.getIndexFor(this.getClass()),
        
        /**
         * @private
         * @property actives
         * @type {Utils.Bag}
         */
        actives = new Bag(),
        
        /**
         * @private
         * @property aspect
         * @type {Aspect}
         */
        aspect = _aspect,
        
        /**
         * @private
         * @property allSet
         * @type {Utils.BitSet}
         */
        allSet = aspect.getAllSet(),
        
        /**
         * @private
         * @property exclusionSet
         * @type {Utils.BitSet}
         */
        exclusionSet = aspect.getExclusionSet(),
        
        /**
         * @private
         * @property oneSet
         * @type {Utils.BitSet}
         */
        oneSet = aspect.getOneSet(),
        
        /**
         * @private
         * @property passive
         * @type {Boolean}
         */
        passive,
        
        /**
         * @private
         * @property dummy
         * @type {Boolean}
         */
        dummy = allSet.isEmpty() && oneSet.isEmpty(),
        
        me = this;
        
        /**
         * @private
         * @method removeFromSystem
         * @param {Entity} entity
         */
        function removeFromSystem(entity) {
            actives.remove(entity);
            entity.getSystemBits().clear(systemIndex);
            me.removed(entity);
        }
    
        /**
         * @private
         * @method insertToSystem
         * @param {Entity} entity
         */
        function insertToSystem(entity) {
            actives.add(entity);
            entity.getSystemBits().set(systemIndex);
            me.inserted(entity);
        }
        
        /**
         * Called before processing of entities begins
         *
         * @method begin
         */
        this.begin = function() {};
        
        /**
         * Process the entities
         * 
         * @method process
         */
        this.process = function() {
            if(this.checkProcessing()) {
                this.begin();
                this.processEntities(actives);
                this.end();
            }
        };
        
        /**
         * Called after the processing of entities ends
         * 
         * @method end
         */
        this.end = function() {};
        
        /**
         * Any implementing entity system must implement this method and the 
         * logic to process the given entities of the system.
         * 
         * @method processEntities
         * @param {Bag} entities athe entities this system contains
         */
        this.processEntities = function(entities) {};
        
        /**
         * Check the system should processing
         * 
         * @method checkProcessing
         * @return {Boolean} true if the system should be processed, false if not
         */
        this.checkProcessing = function() {};
        
        /**
         * Override to implement code that gets executed when systems are 
         * initialized.
         * 
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * Called if the system has received a entity it is interested in, 
         * e.g. created or a component was added to it.
         * 
         * @method inserted
         * @param {Entity} entity the entity that was added to this system
         */
        this.inserted = function(entity) {};
        
        /**
         * Called if a entity was removed from this system, e.g. deleted 
         * or had one of it's components removed.
         * 
         * @method removed
         * @param {Entity} entity the entity that was removed from this system.
         */
        this.removed = function(entity) {};
        
        /**
         * Will check if the entity is of interest to this system.
         * 
         * @method check
         * @param {Entity} entity the entity to check
         */
        this.check = function(entity) {
            if(dummy) {
                return;
            }
            var contains = entity.getSystemBits().get(systemIndex);
            var interested = true;
            var componentBits = entity.getComponentBits();
            
            if(!allSet.isEmpty()) {
                for (var i = allSet.nextSetBit(0); i >= 0; i = allSet.nextSetBit(i+1)) {
                    if(!componentBits.get(i)) {
                        interested = false;
                        break;
                    }
                }
            }        
            if(!exclusionSet.isEmpty() && interested) {
                    interested = !exclusionSet.intersects(componentBits);
            }
            
            // Check if the entity possesses ANY of the components in the oneSet. If so, the system is interested.
            if(!oneSet.isEmpty()) {
                    interested = oneSet.intersects(componentBits);
            }
    
            if (interested && !contains) {
                    insertToSystem(entity);
            } else if (!interested && contains) {
                    removeFromSystem(entity);
            }
        };
        
        /**
         * @method added
         * @param {Entity} entity
         */
        this.added = function(entity) {
                this.check(entity);
        };
        
        /**
         * @method changed
         * @param {Entity} entity
         */
        this.changed = function(entity) {
            this.check(entity);
        };
        
        /**
         * @method deleted
         * @param {Entity} entity
         */
        this.deleted = function(entity) {
            if(entity.getSystemBits().get(systemIndex)) {
                removeFromSystem(entity);
            }
        };
        
        /**
         * @method disabled
         * @param {Entity} entity
         */
        this.disabled = function(entity) {
            if(entity.getSystemBits().get(systemIndex)) {
                removeFromSystem(entity);
            }
        };
        
        /**
         * @method enabled
         * @param {Entity} entity
         */
        this.enabled = function(entity) {
            this.check(entity);
        };
        
        /**
         * @method setWorld
         * @param {World} world
         */
        this.setWorld = function(world) {
            this.world = world;
        };
        
        /**
         * @method isPassive
         * @return {Boolean}
         */
        this.isPassive = function() {
            return passive;
        };
    
        /**
         * @method setPassive
         * @param {Boolean} passive
         */
        this.setPassive = function(passive) {
            this.passive = passive;
        };
        
        /**
         * @method getActives
         * @return {Utils.Bag} actives
         */
        this.getActives = function() {
            return actives;
        };
    };
    
    EntitySystem.prototype = Object.create(EntityObserver.prototype);
    module.exports = EntitySystem;
})();
},{"./EntityObserver":9,"./utils/Bag":22}],11:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntityObserver = require('./EntityObserver');
    
    /**
     * The entity class. Cannot be instantiated outside the framework, you must
     * create new entities using World.
     * 
     * @module ArtemiJS
     * @class Manager
     * @constructor
     */ 
    var Manager = function Manager() {
        EntityObserver.call(this);
        
        /**
         * @property world
         * @type {World}
         */
        this.world = null;
        
       /**
         * Override to implement code that gets executed when systems are 
         * initialized.
         * 
         * @method initialize
         */
        this.initialize = function() {};
    
        /**
         * @method setWorld
         * @param {World} world
         */
        this.setWorld = function(world) {
            this.world = world;
        };

        /**
         * @method getWorld
         * @return {World} world
         */
        this.getWorld = function() {
            return this.world;
        };
        
        /**
         * Abstract method added
         * 
         * @abstract
         * @method added
         * @param {Entity} entity
         */
        this.added = function(entity) {};
        
        /**
         * Abstract method changed
         * 
         * @abstract
         * @method changed
         * @param {Entity} entity
         */
        this.changed = function(entity)  {};
        
        /**
         * Abstract method deleted
         * 
         * @abstract
         * @method deleted
         * @param {Entity} entity
         */
        this.deleted = function(entity)  {};
        
        /**
         * Abstract method enabled
         * 
         * @abstract
         * @method enabled
         * @param {Entity} entity
         */
        this.enabled = function(entity)  {};
        
        /**
         * Abstract method disabled
         * 
         * @abstract
         * @method disabled
         * @param {Entity} entity
         */
        this.disabled = function(entity)  {}; 
    };
    
    Manager.prototype = Object.create(EntityObserver.prototype);
    module.exports = Manager;
})();
},{"./EntityObserver":9}],12:[function(require,module,exports){
(function() {
    'use strict';

    var EntityManager = require('./EntityManager'),
        ComponentManager = require('./ComponentManager'),
        ComponentMapper = require('./ComponentMapper'),
        Bag = require('./utils/Bag');

    /**
     * The primary instance for the framework. It contains all the managers.
     * You must use this to create, delete and retrieve entities.
     * It is also important to set the delta each game loop iteration, 
     * and initialize before game loop.
     *
     * @module ArtemiJS
     * @class World
     * @constructor
     */
    var World = function World() {
        
        /**
         * @private
         * @property entityManager
         * @type {EntityManager}
         */
        var entityManager = new EntityManager(),
        
        /**
         * @private
         * @property componentManager
         * @type {ComponentManager}
         */
        componentManager = new ComponentManager(),
        
        /**
         * @private
         * @property manager
         * @type {Object}
         */
        managers = {},
        
        /**
         * @private
         * @property managersBag
         * @type {Utils.Bag}
         */
        managersBag = new Bag(),
        
        /**
         * @private
         * @property systems
         * @type {Object}
         */
        systems = {},
        
        /**
         * @private
         * @property systemsBag
         * @type {Utils.Bag}
         */
        systemsBag = new Bag(),
    
        /**
         * @private
         * @property added
         * @type {Utils.Bag}
         */
        added = new Bag(),
        
        /**
         * @private
         * @property changed
         * @type {Utils.Bag}
         */
        changed = new Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {Utils.Bag}
         */
        deleted = new Bag(),
        
        /**
         * @private
         * @property enable
         * @type {Utils.Bag}
         */
        enable = new Bag(),
        
        /**
         * @private
         * @property disable
         * @type {Utils.Bag}
         */
        disable = new Bag(),
    
        /**
         * @private
         * @property delta
         * @type {Number}
         */
        delta = 0;

        /**
         * Makes sure all managers systems are initialized in the order 
         * they were added
         * 
         * @method initialize
         */
        this.initialize = function() {
            var i = managersBag.size();
            while(i--) {
                managersBag.get(i).initialize();
            }
            i = systemsBag.size();
            while(i--) {
                systemsBag.get(i).initialize();
            }
        };
        
        /**
         * Returns a manager that takes care of all the entities in the world.
         * entities of this world
         * 
         * @method getEntityManager
         * @return {EntityManager} entityManager
         */
        this.getEntityManager = function() {
            return entityManager;
        };
        
        /**
         * Returns a manager that takes care of all the components in the world.
         * 
         * @method getComponentManager
         * @return {ComponentManager} componentManager
         */
        this.getComponentManager = function() {
            return componentManager;
        };
        
        /**
         * Add a manager into this world. It can be retrieved later.
         * World will notify this manager of changes to entity.
         * 
         * @method setManager
         * @param {Manager} manager manager to be added
         * @return {Manager} manager
         */
        this.setManager = function(manager) {
            manager.setWorld(this);
            
            managers[manager.getClass()] = manager;
            managersBag.add(manager);
    
            return manager;
        };
        
        /**
         * Returns a manager of the specified type.
         * 
         * @param {String} managerType class type of the manager
         * @return {Manager} manager
         */
        this.getManager = function(managerType) {        
            return managers[managerType] || false;
        };
        
        /**
         * Deletes the manager from this world.
         * 
         * @method deleteManager
         * @param {Manager} manager manager to delete.
         */
        this.deleteManager = function(manager) {
            delete managers[manager.getClass()];
            managersBag.remove(manager);
        };
        
        /**
         * You must specify the delta for the game here.
         * 
         * @method setDelta
         * @param {Number} d time since last game loop.
         */
        this.setDelta = function(d) {
            delta = d;
        };
        
        /**
         * 
         * @method getDelta
         * @return {Number} delta time since last game loop.
         */
        this.getDelta = function() {
            return delta;
        };
        
        /**
         * Adds a entity to this world.
         * 
         * @method addEntity
         * @param {Entity} entity
         */
        this.addEntity = function(entity) {
            added.add(entity);
        };
        
        /**
         * Ensure all systems are notified of changes to this entity.
         * If you're adding a component to an entity after it's been
         * added to the world, then you need to invoke this method.
         * 
         * @method changedEntity
         * @param {Entity} entity
         */
        this.changedEntity = function(entity) {
            changed.add(entity);
        };
        
        /**
         * Delete the entity from the world.
         * 
         * @method deleteEntity
         * @param {Entity} entity
         */
        this.deleteEntity = function(entity) {
            added.remove(entity);
        };
        
        /**
         * (Re)enable the entity in the world, after it having being disabled.
         * Won't do anything unless it was already disabled.
         * 
         * @method enableEntity
         * @param {Entity} entity
         */
        this.enableEntity = function(entity) {
            enable.add(entity);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disableEntity
         * @param {Entity} entity
         */
        this.disableEntity = function(entity) {
            disable.add(entity);
        };
        
        /**
         * Create and return a new or reused entity instance.
         * Will NOT add the entity to the world, use World.addEntity(Entity) for that.
         * 
         * @method createEntity
         * @return {Entity} entity
         */
        this.createEntity = function() {
            return entityManager.createEntityInstance();
        };
        
        /**
         * Get a entity having the specified id.
         * 
         * @method getEntity
         * @param {Number} entityId
         * @return {Entity} entity
         */
        this.getEntity = function(id) {
            return entityManager.getEntity(id);
        };
        
        /**
         * Gives you all the systems in this world for possible iteration.
         * 
         * @method getSystems
         * @return {Mixed} all entity systems in world, other false
         */
        this.getSystems = function() {
            return systemsBag;
        };
        
        /**
         * Adds a system to this world that will be processed by World.process()
         * 
         * @method setSystem
         * @param {EntitySystem} system the system to add.
         * @param {Boolean} [passive] wether or not this system will be processed by World.process()
         * @return {EntitySystem} the added system.
         */
        this.setSystem = function(system, passive) {
            passive = passive || false;
            
            system.setWorld(this);
            system.setPassive(passive);
            
            systems[system.getClass()] = system;
            systemsBag.add(system);
            
            return system;
        };
    
        /**
         * Retrieve a system for specified system type.
         * 
         * @method getSystem
         * @param {String} systemType type of system.
         * @return {EntitySystem} instance of the system in this world.
         */
        this.getSystem = function(systemType) {        
            return systems[systemType] || false;
        };
        
        /**
         * Removed the specified system from the world.
         * 
         * @method deleteSystem
         * @param system to be deleted from world.
         */
        this.deleteSystem = function(system) {
            delete systems[system.getClass()];
            systemsBag.remove(system);
        };
        
        /**
         * Notify all the systems
         * 
         * @private
         * @method notifySystems
         * @param {Object} performer Object with callback perform
         * @param {Entity} entity
         */
        function notifySystems(performer, entity) {
            var i = systemsBag.size();
            while(i--) {
                performer.perform(systemsBag.get(i), entity);
            }        
        }
        
        /**
         * Notify all the managers
         * 
         * @private
         * @method notifySystems
         * @param {Object} performer Object with callback perform
         * @param {Entity} entity
         */
        function notifyManagers(performer, entity) {
            var i = managersBag.size();
            while(i--) {
                performer.perform(managersBag.get(i), entity);
            }
        }
        
        /**
         * Performs an action on each entity.
         * 
         * @private
         * @method check
         * @param {Utils.Bag} entities
         * @param {Object} performer
         */
        function check(entities, performer) {
            if(!entities.size()) {
                return;
            }
            var i = entities.size();
            while(i--) {
                var entity = entities.get(i);
                notifyManagers(performer, entity);
                notifySystems(performer, entity);
            }
            
            entities.clear();
        }
        
        /**
         * Process all non-passive systems.
         * 
         * @method process
         */
        this.process = function() {
            
            check(added, {
                perform: function(observer, entity) {
                    observer.added(entity);
                }
            });
            
            check(changed, {
                perform: function(observer, entity) {
                    observer.changed(entity);
                }
            });
            
            check(disable, {
                perform: function(observer, entity) {
                    observer.disabled(entity);
                }
            });
            
            check(enable, {
                perform: function(observer, entity) {
                    observer.enabled(entity);
                }
            });
            
            check(deleted, {
                perform: function (observer, entity) {
                    observer.deleted(entity);
                }
            });
            
            componentManager.clean();
            
            var i = systemsBag.size();
            while(i--) {
                var system = systemsBag.get(i);
                if(!system.isPassive()) {
                    system.process();
                }
            }
        };
        
        /**
         * Retrieves a ComponentMapper instance for fast retrieval 
         * of components from entities.
         * 
         * @method getMapper
         * @param {Object} type of component to get mapper for.
         * @return {ComponentMapper} mapper for specified component type.
         */
        this.getMapper = function(type) {
            return ComponentMapper.getFor(type, this);
        };
        
        this.setManager(componentManager);
        this.setManager(entityManager);
    };
    
    module.exports = World;
})();
},{"./ComponentManager":4,"./ComponentMapper":5,"./EntityManager":8,"./utils/Bag":22}],13:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Bag = require('./../utils/Bag'),
        Manager = require('./../Manager');
    
    /**
     * If you need to group your entities together, e.g. tanks going into 
     * "units" group or explosions into "effects",
     * then use this manager. You must retrieve it using world instance.
     * 
     * A entity can be assigned to more than one group.
     * 
     * @module ArtemiJS
     * @submodule Managers
     * @class GroupManager
     * @namespace Managers
     * @constructor
     * @extends Manager
     */
    var GroupManager = function GroupManager() {
        Manager.call(this);
        
        /**
         * @private
         * @property entitiesByGroup
         * @type {Utils.HashMap}
         */
        var entitiesByGroup = new HashMap(),
        
        /**
         * @private
         * @property groupsByEntity
         * @type {Utils.HashMap}
         */
        groupsByEntity = new HashMap();
            
        /**
         * @method initialize
         */
        this.initialize = function() {};
        
        /**
         * Set the group of the entity.
         * 
         * @method add
         * @param {Entity} entity to add into the group
         * @param {String} group to add the entity into
         */
        this.add = function(entity, group) {
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new Bag();
                entitiesByGroup.put(group, entities);
            }
            entities.add(entity);
            
            var groups = groupsByEntity.get(entity);
            if(groups === null) {
                groups = new Bag();
                groupsByEntity.put(entity, groups);
            }
            groups.add(group);
        };
        
        /**
         * Remove the entity from the group.
         * 
         * @method remove
         * @param {Entity} entity to remove from the group
         * @param {String} group to remove from them entity
         */
        this.remove = function(entity, group) {
            var entities = entitiesByGroup.get(group);
            if(entities !== null) {
                entities.remove(entity);
            }
            
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                groups.remove(group);
            }
        };
        
        /**
         * Remove the entity from the all groups.
         * 
         * @method removeFromAllGroups
         * @param {Entity} entity to remove from the group
         */
        this.removeFromAllGroups = function(entity) {
            var groups = groupsByEntity.get(entity);
            if(groups !== null) {
                var i = groups.size();
                while(i--) {
                    var entities = entitiesByGroup.get(groups.get(i));
                    if(entities !== null) {
                        entities.remove(entity);
                    }
                }
                groups.clear();
            }
        };
        
        /**
         * Get all entities that belong to the provided group.
         * 
         * @method getEntities
         * @param {String} name of the group
         * @return {Utils.Bag} entities
         */
        this.getEntities = function(group) {
            var entities = entitiesByGroup.get(group);
            if(entities === null) {
                entities = new Bag();
                entitiesByGroup.put(group, entities);
            }
            return entities;
        };
        
        /**
         * Get all entities from the group
         * 
         * @method getGroups
         * @param {Entity} entity
         */
        this.getGroups = function(entity) {
            return groupsByEntity.get(entity);
        };
        
        this.isInAnyGroup = function(entity) {
            return this.getGroups(entity) !== null;
        };
        
        this.isInGroup = function(entity, group) {
            group = group || null;
            if(group === null) {
                return false;   
            }
            var groups = groupsByEntity.get(entity);
            var i = groups.size();
            while(i--) {
                if(group === groups.get(i)) {
                    return true;
                }
            }
        };
        
        this.deleted = function(entity) {
            this.removeFromAllGroups(entity);
        };
    }; 

    GroupManager.prototype = Object.create(Manager.prototype);
    module.exports = GroupManager;
})();
},{"./../Manager":11,"./../utils/Bag":22,"./../utils/HashMap":24}],14:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Bag = require('./../utils/Bag'),
        Manager = require("./../Manager");
    
    var PlayerManager = function PlayerManager() {
        Manager.call(this);
        
        var playerByEntity = new HashMap(),
            entitiesByPlayer = new HashMap();
            
        this.setPlayer = function(entity, player) {
            playerByEntity.put(entity, player);
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new Bag();
                entitiesByPlayer.put(player, entities);
            }
            entities.add(entity);
        };
        
        this.getEntitiesOfPlayer = function(player) {
            var entities = entitiesByPlayer.get(player);
            if(entities === null) {
                entities = new Bag();
            }
            return entities;
        };
        
        this.removeFromPlayer = function(entity) {
            var player = playerByEntity.get(entity);
            if(player !== null) {
                var entities = entitiesByPlayer.get(player);
                if(entities !== null) {
                    entities.remove(entity);
                }
            }
        };
        
        this.getPlayer = function(entity) {
            return playerByEntity.get(entity);
        };

        this.initialize = function() {};

        this.deleted = function(entity) {
            this.removeFromPlayer(entity);
        };

    };
    
    PlayerManager.prototype = Object.create(Manager.prototype);
    module.exports = PlayerManager;
})();
},{"./../Manager":11,"./../utils/Bag":22,"./../utils/HashMap":24}],15:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Manager = require('./../Manager');
    
    var TagManager = function TagManager() {
        Manager.call(this);
        
        var entitiesByTag = new HashMap(),
            tagsByEntity = new HashMap();

        this.register = function(tag, entity) {
            entitiesByTag.put(tag, entity);
            tagsByEntity.put(entity, tag);
        };

        this.unregister = function(tag) {
            tagsByEntity.remove(entitiesByTag.remove(tag));
        };

        this.isRegistered = function(tag) {
            return entitiesByTag.containsKey(tag);
        };

        this.getEntity = function(tag) {
            return entitiesByTag.get(tag);
        };
        
        this.getRegisteredTags = function() {
            return tagsByEntity.values();
        };
        
        this.deleted = function(entity) {
            var removedTag = tagsByEntity.remove(entity);
            if(removedTag !== null) {
                entitiesByTag.remove(removedTag);
            }
        };

        this.initialize = function() {}
    }; 

    TagManager.prototype = Object.create(Manager.prototype);
    module.exports = TagManager;
})();
},{"./../Manager":11,"./../utils/HashMap":24}],16:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./../utils/HashMap'),
        Bag = require('./../utils/Bag'),
        Manager = require('./../Manager');
    
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
     * @extends Manager
     */
    var TeamManager = function TeamManager() {
        Manager.call(this);
        
        /**
         * @private
         * @property playersByTeam
         * @type {Utils.HashMap}
         */
        var playersByTeam = new HashMap(),
        
        /**
         * @private
         * @property teamByPlayer
         * @type {Utils.HashMap}
         */
        teamByPlayer = new HashMap();
        
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
                players = new Bag();
                playersByTeam.put(team, players);
            }
            players.add(player);
        };
        
        /**
         * @method getPlayers
         * @param {String} team Name of the team
         * @return {Utils.Bag} Bag of players
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

    TeamManager.prototype = Object.create(Manager.prototype);
    module.exports = TeamManager;
})();
},{"./../Manager":11,"./../utils/Bag":22,"./../utils/HashMap":24}],17:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class DelayedEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var DelayedEntityProcessingSystem = function DelayedEntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
    };
    
    DelayedEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = DelayedEntityProcessingSystem;
})();
},{"./../EntitySystem":10}],18:[function(require,module,exports){
var process=require("__browserify_process");(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class EntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var EntityProcessingSystem = function EntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
        
        this.process = function() {
            
        };
        
        this.processEntities = function(entities) {
            var i = entities.size();
            while(--i) {
                process(entities.get(i));
            }
        };
        
        this.checkProcessing = function() {
            return true;   
        };
    };
    
    EntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = EntityProcessingSystem;
})();
},{"./../EntitySystem":10,"__browserify_process":25}],19:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class IntervalEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var IntervalEntityProcessingSystem = function IntervalEntityProcessingSystem(_aspect) {
        EntitySystem.call(this, _aspect);
    };
    
    IntervalEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = IntervalEntityProcessingSystem;
})();
},{"./../EntitySystem":10}],20:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class IntervalEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var IntervalEntitySystem = function IntervalEntitySystem(_aspect, _interval) {
        EntitySystem.call(this, _aspect);
    };
    
    IntervalEntitySystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = IntervalEntitySystem;
})();
},{"./../EntitySystem":10}],21:[function(require,module,exports){
(function() {
    'use strict';
    
    var Aspect = require('./../Aspect'),
        EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class VoidEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var VoidEntitySystem = function VoidEntitySystem(_aspect) {
        EntitySystem.call(this, Aspect.getEmpty());
        
        this.processEntities = function(entities) {
            this.processSystem();
        };
        
        this.processSystem = function() {};
        
        this.checkProcessing = function() {
            return true;
        };
    };
    
    VoidEntitySystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = VoidEntitySystem;
})();
},{"./../Aspect":2,"./../EntitySystem":10}],22:[function(require,module,exports){
(function() {
    'use strict';

    /**
     * Collection type a bit like ArrayList but does not preserve the order of its
     * entities, speedwise it is very good, especially suited for games.
     * 
     * @module ArtemiJS
     * @submodule Utils
     * @class Bag
     * @namespace Utils
     * @constructor
     */
    var Bag = function Bag() {
        
        /**
         * Contains all of the elements
         * 
         * @private
         * @property data
         * @type {Array}
         */
        var data = [];
            
        /**
         * Removes the element at the specified position in this Bag. does this by
         * overwriting it was last element then removing last element
         * 
         * @method remove
         * @param Mixed index the index of element to be removed
         * @return Mixed element that was removed from the Bag
         */
        this.remove = function(index) {
            var response = true;
            if(typeof index === 'object') {
                index = data.indexOf(index);
            } else if(index !== -1) {
                response = data[index];
            }
            if(index !== -1) {
                data.splice(index, 1);
            } else {
                response = false;
            }
            return response;
        };
        
        /**
         * Remove and return the last object in the bag.
         * 
         * @method removeLast
         * @return Mixed the last object in the bag, null if empty.
         */
        this.removeLast = function() {
            if(data.length > 0) {
                var obj = data[data.length-1];
                data.splice(data.length-1, 1);
                return obj;
            }
            return null;
        };
        
        /**
         * Check if bag contains this element.
         *
         * @method contains
         * @param Mixed
         * @return Mixed
         */
        this.contains = function(obj) {
            return data.indexOf(obj) !== -1;
        };
        
        /**
         * Removes from this Bag all of its elements that are contained in the
         * specified Bag.
         * 
         * @method removeAll
         * @param {Bag} Bag containing elements to be removed from this Bag
         * @return {Boolean} true if this Bag changed as a result of the call, else false
         */
        this.removeAll = function(bag) {
            var modified = false,
                n = bag.size();
            for (var i = 0; i !== n; ++i) {
                var obj = bag.get(i),
                    index = data.indexOf(obj);

                if(index !== -1) {
                    this.remove(index);
                    modified = true;
                }
            }
            return modified;
        };
        
        /**
         * Returns the element at the specified position in Bag.
         * 
         * @method get
         * @param {Number} index index of the element to return
         * @return Mixed the element at the specified position in bag
         */
        this.get = function(index) {
            return data[index] ? data[index] : null;
        };
        
        /**
         * Returns the number of elements in this bag.
         * 
         * @method size
         * @return {Number} the number of elements in this bag
         */
        this.size = function() {
            return data.length;
        };
        
        /**
         * Returns the number of elements the bag can hold without growing.
         * 
         * @method capacity
         * @return {Number} the number of elements the bag can hold without growing.
         */
        this.capacity = function() {
            return Number.MAX_VALUE; // slightly fixed ^^
        };
        
        /**
         * Checks if the internal storage supports this index.
         * 
         * @method isIndexWithinBounds
         * @param {Number} index
         * @return {Boolean}
         */
        this.isIndexWithinBounds = function(index) {
            return index < this.getCapacity();
        };
        
        /**
         * Returns true if this list contains no elements.
         * 
         * @method isEmpty
         * @return {Boolean} true if is empty, else false
         */
        this.isEmpty = function() {
            return data.length === 0;
        };
        
        /**
         * Adds the specified element to the end of this bag. if needed also
         * increases the capacity of the bag.
         * 
         * @method add
         * @param Mixed element to be added to this list
         */
        this.add = function(obj) {
            data.push(obj);
        };
        
        /**
         * Set element at specified index in the bag.
         * 
         * @method set
         * @param {Number} index position of element
         * @param Mixed the element
         */
        this.set = function(index, obj) {
            data[index] = obj;
        };
        
        /**
         * Method verify the capacity of the bag
         * 
         * @method ensureCapacity
         */
        this.ensureCapacity = function() {
            // just for compatibility with oryginal idee
        };
        
        /**
         * Removes all of the elements from this bag. The bag will be empty after
         * this call returns.
         * 
         * @method clear
         */
        this.clear = function() {
            data = [];
        };
        
        /**
         * Add all items into this bag. 
         * 
         * @method addAll
         * @param {Bag} bag added
         */
        this.addAll = function(bag) {
            var i = bag.size();
            while(i--) {
                this.add(bag.get(i));
            }
        };
    };
    
    module.exports = Bag;
})();
},{}],23:[function(require,module,exports){
(function() {
    'use strict';
    
    /**
     * @author inexplicable
     * @see https://github.com/inexplicable/bitset
     */
        
    //constructor
    var BitSet = function BitSet() {
    
        //_words property is an array of 32bits integers, javascript doesn't really have integers separated from Number type
        //it's less performant because of that, number (by default float) would be internally converted to 32bits integer then accepts the bit operations
        //checked Buffer type, but needs to handle expansion/downsize by application, compromised to use number array for now.
        this._words = [];
    };
    
    var BITS_OF_A_WORD = 32,
        SHIFTS_OF_A_WORD = 5;
    
    /**
     *
     * @param pos
     * @return {Number} the index at the words array
     */
    var whichWord = function(pos){
        //assumed pos is non-negative, guarded by #set, #clear, #get etc.
        return pos >> SHIFTS_OF_A_WORD;
    };
    
    /**
     *
     * @param pos
     * @return {Number} a bit mask of 32 bits, 1 bit set at pos % 32, the rest being 0
     */
    var mask = function(pos){
        return 1 << (pos & 31);
    };
    
    BitSet.prototype.set = function(pos) {
    
        console.assert ? console.assert(pos >= 0, "position must be non-negative") : null;
    
        var which = whichWord(pos),
            words = this._words;
        return words[which] = words[which] | mask(pos);
    };
    
    BitSet.prototype.clear = function(pos) {
    
        console.assert(pos >= 0, "position must be non-negative");
    
        var which = whichWord(pos),
            words = this._words;
        return words[which] = words[which] & ~mask(pos);
    };
    
    BitSet.prototype.get = function(pos) {
    
        console.assert(pos >= 0, "position must be non-negative");
    
        var which = whichWord(pos),
            words = this._words;
        return words[which] & mask(pos);
    };
    
    BitSet.prototype.words = function() {
        return this._words.length;
    };
    
    /**
     * count all set bits
     * @return {Number}
     *
     * this is much faster than BitSet lib of CoffeeScript, it fast skips 0 value words
     */
    BitSet.prototype.cardinality = function() {
        var next, sum = 0, arrOfWords = this._words, maxWords = this.words();
        for(next = 0; next < maxWords; next++){
            var nextWord = arrOfWords[next] || 0;
            //this loops only the number of set bits, not 32 constant all the time!
            for(var bits = nextWord; bits !== 0; bits &= (bits - 1)){
                sum++;
            }
        }
        return sum;
    };
    
    BitSet.prototype.reset = function() {
        this._words = [];
    };
    
    BitSet.prototype.or = function(set) {
        if (this === set){
            return this;
        }
    
        var next, commons = Math.min(this.words(), set.words());
        for (next = 0; next < commons; next++) {
            this._words[next] |= set._words[next];
        }
        if (commons < set.words()) {
            this._words = this._words.concat(set._words.slice(commons, set.words()));
        }
        return this;
    };
    
    /**
     *
     * @param set
     * @return {BitSet} this BitSet after and operation
     *
     * this is much more performant than CoffeeScript's BitSet#and operation because we'll chop the zero value words at tail.
     */
    BitSet.prototype.and = function(set) {
        if (this === set) {
            return this;
        }
    
        var next,
            commons = Math.min(this.words(), set.words()),
            words = this._words;
    
        for (next = 0; next < commons; next++) {
            words[next] &= set._words[next];
        }
        if(commons > set.words()){
            var len = commons - set.words();
            while(len--) {
                words.pop();//using pop instead of assign zero to reduce the length of the array, and fasten the subsequent #and operations.
            }
        }
        return this;
    };
    
    BitSet.prototype.xor = function(set) {
        if (this === set){
            return this;
        }
    
        var next, commons = Math.min(this.words(), set.words());
        for (next = 0; next < commons; next++) {
            this._words[next] ^= set._words[next];
        }
        if (commons < set.words()) {
            this._words = this._words.concat(set._words.slice(commons, set.words()));
        }
        return this;
    };
    
    /**
     * this is the critical piece missing from CoffeeScript's BitSet lib, we usually just need to know the next set bit if any.
     * it fast skips 0 value word as #cardinality does, this is esp. important because of our usage, after series of #and operations
     * it's highly likely that most of the words left are zero valued, and by skipping all of such, we could locate the actual bit set much faster.
     * @param pos
     * @return {number}
     */
    BitSet.prototype.nextSetBit = function(pos){
    
        console.assert(pos >= 0, "position must be non-negative");
    
        var next = whichWord(pos),
            words = this._words;
        //beyond max words
        if(next >= words.length){
            return -1;
        }
        //the very first word
        var firstWord = words[next],
            maxWords = this.words(),
            bit;
        if(firstWord){
            for(bit = pos & 31; bit < BITS_OF_A_WORD; bit += 1){
                if((firstWord & mask(bit))){
                    return (next << SHIFTS_OF_A_WORD) + bit;
                }
            }
        }
        for(next = next + 1; next < maxWords; next += 1){
            var nextWord = words[next];
            if(nextWord){
                for(bit = 0; bit < BITS_OF_A_WORD; bit += 1){
                    if((nextWord & mask(bit)) !== 0){
                        return (next << SHIFTS_OF_A_WORD) + bit;
                    }
                }
                console.assert(-1, "it should have found some bit in this word: " + nextWord);
            }
        }
        return -1;
    };
    
    /**
     * An reversed lookup compared with #nextSetBit
     * @param pos
     * @returns {number}
     */
    BitSet.prototype.prevSetBit = function(pos){
    
        console.assert(pos >= 0, "position must be non-negative");
    
        var prev = whichWord(pos),
            words = this._words;
        //beyond max words
        if(prev >= words.length){
            return -1;
        }
        //the very last word
        var lastWord = words[prev],
            bit;
        if(lastWord){
            for(bit = pos & 31; bit >=0; bit--){
                if((lastWord & mask(bit))){
                    return (prev << SHIFTS_OF_A_WORD) + bit;
                }
            }
        }
        for(prev = prev - 1; prev >= 0; prev--){
            var prevWord = words[prev];
            if(prevWord){
                for(bit = BITS_OF_A_WORD - 1; bit >= 0; bit--){
                    if((prevWord & mask(bit)) !== 0){
                        return (prev << SHIFTS_OF_A_WORD) + bit;
                    }
                }
                console.assert(-1, "it should have found some bit in this word: " + prevWord);
            }
        }
        return -1;
    };
    
    BitSet.prototype.toString = function(radix){
        radix = radix || 10;
        return '[' +this._words.toString() + ']';
    };
    
    module.exports = BitSet;
})();
},{}],24:[function(require,module,exports){
/**
 * HashMap
 * @author Ariel Flesler <aflesler@gmail.com>
 * @version 0.9.3
 * Date: 4/3/2013
 * Homepage: https://github.com/flesler/hashmap
 */
(function(){
    'use strict';
    
    /**
     * HashMap
     * 
     * @module ArtemiJS
     * @submodule Utils
     * @class HashMap
     * @namespace Utils
     * @constructor
     */    
    function HashMap() {
		this.clear();
	}

	HashMap.prototype = {
		constructor:HashMap,

		get:function(key) {
			var data = this._data[this.hash(key)];
			return data && data[1];
		},

		put:function(key, value) {
			// Store original key as well (for iteration)
			this._data[this.hash(key)] = [key, value];
		},

		containsKey:function(key) {
			return this.hash(key) in this._data;
		},

		remove:function(key) {
			delete this._data[this.hash(key)];
		},

		type:function(key) {
			var str = Object.prototype.toString.call(key);
			var type = str.slice(8, -1).toLowerCase();
			// Some browsers yield DOMWindow for null and undefined, works fine on Node
			if (type === 'domwindow' && !key) {
				return key + '';
			}
			return type;
		},

		count:function() {
			var n = 0;
			for (var key in this._data) {
				n++;
			}
			return n;
		},

		clear:function() {
			// TODO: Would Object.create(null) make any difference
			this._data = {};
		},

		hash:function(key) {
			switch (this.type(key)) {
				case 'undefined':
				case 'null':
				case 'boolean':
				case 'number':
				case 'regexp':
					return key + '';

				case 'date':
					return ':' + key.getTime();

				case 'string':
					return '"' + key;

				case 'array':
					var hashes = [];
					for (var i = 0; i < key.length; i++)
						hashes[i] = this.hash(key[i]);
					return '[' + hashes.join('|');

				case 'object':
				default:
					// TODO: Don't use expandos when Object.defineProperty is not available?
					if (!key._hmuid_) {
						key._hmuid_ = ++HashMap.uid;
						hide(key, '_hmuid_');
					}

					return '{' + key._hmuid_;
			}
		},

		forEach:function(func) {
			for (var key in this._data) {
				var data = this._data[key];
				func(data[1], data[0]);
			}
		}
	};

	HashMap.uid = 0;


	function hide(obj, prop) {
		// Make non iterable if supported
		if (Object.defineProperty) {
			Object.defineProperty(obj, prop, {enumerable:false});
		}
	}

	module.exports = HashMap;
})();
},{}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvQXJ0ZW1pLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL0FzcGVjdC5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9Db21wb25lbnQuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvQ29tcG9uZW50TWFuYWdlci5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9Db21wb25lbnRNYXBwZXIuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvQ29tcG9uZW50VHlwZS5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9FbnRpdHkuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvRW50aXR5TWFuYWdlci5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9FbnRpdHlPYnNlcnZlci5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9FbnRpdHlTeXN0ZW0uanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvTWFuYWdlci5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9Xb3JsZC5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9tYW5hZ2Vycy9Hcm91cE1hbmFnZXIuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvbWFuYWdlcnMvUGxheWVyTWFuYWdlci5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy9tYW5hZ2Vycy9UYWdNYW5hZ2VyLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL21hbmFnZXJzL1RlYW1NYW5hZ2VyLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL3N5c3RlbXMvRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvc3lzdGVtcy9FbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlTeXN0ZW0uanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvc3lzdGVtcy9Wb2lkRW50aXR5U3lzdGVtLmpzIiwiL3Zhci9saWIvc3RpY2tzaGlmdC81MzVkOGEzYjUwMDQ0NjRlNDQwMDAyMTIvYXBwLXJvb3QvZGF0YS81MTcxMzUvc3JjL3V0aWxzL0JhZy5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvNTE3MTM1L3NyYy91dGlscy9CaXRTZXQuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9zcmMvdXRpbHMvSGFzaE1hcC5qcyIsIi92YXIvbGliL3N0aWNrc2hpZnQvNTM1ZDhhM2I1MDA0NDY0ZTQ0MDAwMjEyL2FwcC1yb290L2RhdGEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIC8vIHRoaXMgZmlsZSBoYXZlIHRvIGJlIGluY2x1ZGVkIGZpcnN0IGluIHl1aWNvbXByZXNzb3JcbiAgICBcbiAgICAvKipcbiAgICAgKiBFbnRpdHkgRnJhbWV3b3JrXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBBcnRlbWlKU1xuICAgICAqIEBtYWluIEFydGVtaUpTXG4gICAgICovXG4gICAgdmFyIEFydGVtaUpTID0ge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7RmxvYXR9IHZlcnNpb25cbiAgICAgICAgICovXG4gICAgICAgIHZlcnNpb246IDAuMSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge1N0cmluZ30gc291cmNlXG4gICAgICAgICAqL1xuICAgICAgICBzb3VyY2U6ICdodHRwczovL2dpdGh1Yi5jb20vY29qYWNrL2FydGVtaWpzJyxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge1N0cmluZ30gbGljZW5zZVxuICAgICAgICAgKi9cbiAgICAgICAgbGljZW5zZTogJ0dQTHYyJyxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge051bWJlcn0gZW52XG4gICAgICAgICAqL1xuICAgICAgICBlbnY6IDEgLy8gMSAtIGRldiwgMiAtIHRlc3QsIDQgLSBwcm9kXG4gICAgfTtcbiAgICBcbiAgICBBcnRlbWlKUy5NYW5hZ2VycyA9IHtcbiAgICAgICAgR3JvdXBNYW5hZ2VyOiByZXF1aXJlKCcuL21hbmFnZXJzL0dyb3VwTWFuYWdlcicpLFxuICAgICAgICBQbGF5ZXJNYW5hZ2VyOiByZXF1aXJlKCcuL21hbmFnZXJzL1BsYXllck1hbmFnZXInKSxcbiAgICAgICAgVGFnTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9UYWdNYW5hZ2VyJyksXG4gICAgICAgIFRlYW1NYW5hZ2VyOiByZXF1aXJlKCcuL21hbmFnZXJzL1RlYW1NYW5hZ2VyJylcbiAgICB9O1xuICAgIFxuICAgIEFydGVtaUpTLlN5c3RlbXMgPSB7XG4gICAgICAgIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0nKSxcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0VudGl0eVByb2Nlc3NpbmdTeXN0ZW0nKSxcbiAgICAgICAgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEludGVydmFsRW50aXR5U3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlTeXN0ZW0nKSxcbiAgICAgICAgVm9pZEVudGl0eVN5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL1ZvaWRFbnRpdHlTeXN0ZW0nKVxuICAgIH07XG4gICAgXG4gICAgQXJ0ZW1pSlMuVXRpbHMgPSB7XG4gICAgICAgIEJhZzogcmVxdWlyZSgnLi91dGlscy9CYWcnKSxcbiAgICAgICAgQml0U2V0OiByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBIYXNoTWFwOiByZXF1aXJlKCcuL3V0aWxzL0hhc2hNYXAnKVxuICAgIH07XG4gICAgXG4gICAgQXJ0ZW1pSlMuQXNwZWN0ID0gcmVxdWlyZSgnLi9Bc3BlY3QnKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnQgPSByZXF1aXJlKCcuL0NvbXBvbmVudCcpO1xuICAgIEFydGVtaUpTLkNvbXBvbmVudE1hbmFnZXIgPSByZXF1aXJlKCcuL0NvbXBvbmVudE1hbmFnZXInKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnRNYXBwZXIgPSByZXF1aXJlKCcuL0NvbXBvbmVudE1hcHBlcicpO1xuICAgIEFydGVtaUpTLkNvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcbiAgICBBcnRlbWlKUy5FbnRpdHkgPSByZXF1aXJlKCcuL0VudGl0eScpO1xuICAgIEFydGVtaUpTLkVudGl0eU1hbmFnZXIgPSByZXF1aXJlKCcuL0VudGl0eU1hbmFnZXInKTtcbiAgICBBcnRlbWlKUy5FbnRpdHlPYnNlcnZlciA9IHJlcXVpcmUoJy4vRW50aXR5T2JzZXJ2ZXInKTtcbiAgICBBcnRlbWlKUy5FbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuL0VudGl0eU9ic2VydmVyJyk7XG4gICAgQXJ0ZW1pSlMuTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFuYWdlcicpO1xuICAgIEFydGVtaUpTLldvcmxkID0gcmVxdWlyZSgnLi9Xb3JsZCcpO1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gQXJ0ZW1pSlM7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQml0U2V0ID0gcmVxdWlyZSgnLi91dGlscy9CaXRTZXQnKSxcbiAgICAgICAgQ29tcG9uZW50VHlwZSA9IHJlcXVpcmUoJy4vQ29tcG9uZW50VHlwZScpO1xuXG4gICAgLyoqXG4gICAgICogQW4gQXNwZWN0cyBpcyB1c2VkIGJ5IHN5c3RlbXMgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMsIHRvIGNoZWNrIGlmIGEgc3lzdGVtIGlzXG4gICAgICogaW50ZXJlc3RlZCBpbiBhbiBlbnRpdHkuIEFzcGVjdHMgZGVmaW5lIHdoYXQgc29ydCBvZiBjb21wb25lbnQgdHlwZXMgYW4gZW50aXR5IG11c3RcbiAgICAgKiBwb3NzZXNzLCBvciBub3QgcG9zc2Vzcy5cbiAgICAgKiBcbiAgICAgKiBUaGlzIGNyZWF0ZXMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgQSBhbmQgQiBhbmQgQzpcbiAgICAgKiBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKEEuY2xhc3MsIEIuY2xhc3MsIEMuY2xhc3MpXG4gICAgICogXG4gICAgICogVGhpcyBjcmVhdGVzIGFuIGFzcGVjdCB3aGVyZSBhbiBlbnRpdHkgbXVzdCBwb3NzZXNzIEEgYW5kIEIgYW5kIEMsIGJ1dCBtdXN0IG5vdCBwb3NzZXNzIFUgb3IgVi5cbiAgICAgKiBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKEEuY2xhc3MsIEIuY2xhc3MsIEMuY2xhc3MpLmV4Y2x1ZGUoVS5jbGFzcywgVi5jbGFzcylcbiAgICAgKiBcbiAgICAgKiBUaGlzIGNyZWF0ZXMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgQSBhbmQgQiBhbmQgQywgYnV0IG11c3Qgbm90IHBvc3Nlc3MgVSBvciBWLCBidXQgbXVzdCBwb3NzZXNzIG9uZSBvZiBYIG9yIFkgb3IgWi5cbiAgICAgKiBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKEEuY2xhc3MsIEIuY2xhc3MsIEMuY2xhc3MpLmV4Y2x1ZGUoVS5jbGFzcywgVi5jbGFzcykub25lKFguY2xhc3MsIFkuY2xhc3MsIFouY2xhc3MpXG4gICAgICpcbiAgICAgKiBZb3UgY2FuIGNyZWF0ZSBhbmQgY29tcG9zZSBhc3BlY3RzIGluIG1hbnkgd2F5czpcbiAgICAgKiBBc3BlY3QuZ2V0RW1wdHkoKS5vbmUoWC5jbGFzcywgWS5jbGFzcywgWi5jbGFzcykuYWxsKEEuY2xhc3MsIEIuY2xhc3MsIEMuY2xhc3MpLmV4Y2x1ZGUoVS5jbGFzcywgVi5jbGFzcylcbiAgICAgKiBpcyB0aGUgc2FtZSBhczpcbiAgICAgKiBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsKEEuY2xhc3MsIEIuY2xhc3MsIEMuY2xhc3MpLmV4Y2x1ZGUoVS5jbGFzcywgVi5jbGFzcykub25lKFguY2xhc3MsIFkuY2xhc3MsIFouY2xhc3MpXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBBc3BlY3RcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgQXNwZWN0ID0gZnVuY3Rpb24gQXNwZWN0KCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhbGxTZXRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhbGxTZXQgPSBuZXcgQml0U2V0KCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGV4Y2x1c2lvblNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi8gICAgICAgIFxuICAgICAgICBleGNsdXNpb25TZXQgPSBuZXcgQml0U2V0KCksXG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBleGNsdXNpb25TZXRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovICAgICAgICAgICAgICAgIFxuICAgICAgICBvbmVTZXQgPSBuZXcgQml0U2V0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0QWxsU2V0XG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0QWxsU2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYWxsU2V0O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0RXhjbHVzaW9uU2V0XG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RXhjbHVzaW9uU2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhjbHVzaW9uU2V0O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0T25lU2V0XG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0T25lU2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gb25lU2V0O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgYWxsIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhbGxcbiAgICAgICAgICogQGNoYWluYWJsZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSogYSByZXF1aXJlZCBjb21wb25lbnQgdHlwZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hbGwgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICBhbGxTZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IodHlwZSkpO1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIGFsbFNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcihhcmd1bWVudHNbbGVuXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRXhjbHVkZXMgYWxsIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzIGZyb20gdGhlIGFzcGVjdC4gQSBzeXN0ZW0gd2lsbCBub3QgYmVcbiAgICAgICAgICogaW50ZXJlc3RlZCBpbiBhbiBlbnRpdHkgdGhhdCBwb3NzZXNzZXMgb25lIG9mIHRoZSBzcGVjaWZpZWQgZXhjbHVzaW9uIGNvbXBvbmVudCB0eXBlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZXhjbHVkZVxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBjb21wb25lbnQgdHlwZSB0byBleGNsdWRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4Y2x1ZGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICBleGNsdXNpb25TZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IodHlwZSkpO1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIGV4Y2x1c2lvblNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcihhcmd1bWVudHNbbGVuXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBvbmUgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIG9uZVxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBvbmUgb2YgdGhlIHR5cGVzIHRoZSBlbnRpdHkgbXVzdCBwb3NzZXNzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIG9uZVNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcih0eXBlKSk7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgb25lU2V0LnNldChDb21wb25lbnRUeXBlLmdldEluZGV4Rm9yKGFyZ3VtZW50c1tsZW5dKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGFuIGFzcGVjdCB3aGVyZSBhbiBlbnRpdHkgbXVzdCBwb3NzZXNzIGFsbCBvZiB0aGUgc3BlY2lmaWVkIGNvbXBvbmVudCB0eXBlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0QXNwZWN0Rm9yQWxsXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBhIHJlcXVpcmVkIGNvbXBvbmVudCB0eXBlXG4gICAgICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkFzcGVjdH0gYW4gYXNwZWN0IHRoYXQgY2FuIGJlIG1hdGNoZWQgYWdhaW5zdCBlbnRpdGllc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRBc3BlY3RGb3JBbGwgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICAgICAgYXNwZWN0LmFsbCh0eXBlLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGFzcGVjdDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBvbmUgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvck9uZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSogb25lIG9mIHRoZSB0eXBlcyB0aGUgZW50aXR5IG11c3QgcG9zc2Vzc1xuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Bc3BlY3R9IGFuIGFzcGVjdCB0aGF0IGNhbiBiZSBtYXRjaGVkIGFnYWluc3QgZW50aXRpZXNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0QXNwZWN0Rm9yT25lID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgdmFyIGFzcGVjdCA9IG5ldyBBc3BlY3QoKTtcbiAgICAgICAgICAgIGFzcGVjdC5vbmUodHlwZSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGFuIGVtcHR5IGFzcGVjdC4gVGhpcyBjYW4gYmUgdXNlZCBpZiB5b3Ugd2FudCBhIHN5c3RlbSB0aGF0IHByb2Nlc3NlcyBubyBlbnRpdGllcywgYnV0XG4gICAgICogc3RpbGwgZ2V0cyBpbnZva2VkLiBUeXBpY2FsIHVzYWdlcyBpcyB3aGVuIHlvdSBuZWVkIHRvIGNyZWF0ZSBzcGVjaWFsIHB1cnBvc2Ugc3lzdGVtcyBmb3IgZGVidWcgcmVuZGVyaW5nLFxuICAgICAqIGxpa2UgcmVuZGVyaW5nIEZQUywgaG93IG1hbnkgZW50aXRpZXMgYXJlIGFjdGl2ZSBpbiB0aGUgd29ybGQsIGV0Yy5cbiAgICAgKiBcbiAgICAgKiBZb3UgY2FuIGFsc28gdXNlIHRoZSBhbGwsIG9uZSBhbmQgZXhjbHVkZSBtZXRob2RzIG9uIHRoaXMgYXNwZWN0LCBzbyBpZiB5b3Ugd2FudGVkIHRvIGNyZWF0ZSBhIHN5c3RlbSB0aGF0XG4gICAgICogcHJvY2Vzc2VzIG9ubHkgZW50aXRpZXMgcG9zc2Vzc2luZyBqdXN0IG9uZSBvZiB0aGUgY29tcG9uZW50cyBBIG9yIEIgb3IgQywgdGhlbiB5b3UgY2FuIGRvOlxuICAgICAqIEFzcGVjdC5nZXRFbXB0eSgpLm9uZShBLEIsQyk7XG4gICAgICogXG4gICAgICogQG1ldGhvZCBnZXRFbXB0eVxuICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkFzcGVjdH0gYW4gZW1wdHkgQXNwZWN0IHRoYXQgd2lsbCByZWplY3QgYWxsIGVudGl0aWVzLlxuICAgICAqL1xuICAgIEFzcGVjdC5nZXRFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEFzcGVjdCgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFzcGVjdDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBBIHRhZyBjbGFzcy4gQWxsIGNvbXBvbmVudHMgaW4gdGhlIHN5c3RlbSBtdXN0IGV4dGVuZCB0aGlzIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudCA9IGZ1bmN0aW9uIENvbXBvbmVudCgpIHt9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKCcuL01hbmFnZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBPYmplY3QgdG8gbWFuYWdlIGNvbXBvbmVudHNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIENvbXBvbmVudE1hbmFnZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgQ29tcG9uZW50TWFuYWdlciA9IGZ1bmN0aW9uIENvbXBvbmVudE1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50c0J5VHlwZVxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNvbXBvbmVudHNCeVR5cGUgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGV0ZWRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJhZ31cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZWQgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVtb3ZlQ29tcG9uZW50c09mRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudEJpdHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNvbXBvbmVudEJpdHMubmV4dFNldEJpdCgwKTsgaSA+PSAwOyBpID0gY29tcG9uZW50Qml0cy5uZXh0U2V0Qml0KGkrMSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLmdldChpKS5zZXQoZW50aXR5LmdldElkKCksIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Qml0cy5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBjb21wb25lbnQgYnkgdHlwZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRDb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudFR5cGV9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUsIGNvbXBvbmVudCkgeyAgICAgICAgXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICBpZihjb21wb25lbnRzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuc2V0KHR5cGUuZ2V0SW5kZXgoKSwgY29tcG9uZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudHMuc2V0KGVudGl0eS5nZXRJZCgpLCBjb21wb25lbnQpO1xuICAgIFxuICAgICAgICAgICAgZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5zZXQodHlwZS5nZXRJbmRleCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgY29tcG9uZW50IGJ5IHR5cGVcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUNvbXBvbmVudCA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xuICAgICAgICAgICAgaWYoZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5nZXQodHlwZS5nZXRJbmRleCgpKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSkuc2V0KGVudGl0eS5nZXRJZCgpLCBudWxsKTtcbiAgICAgICAgICAgICAgICBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpLmNsZWFyKHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNvbXBvbmVudCBieSB0eXBlXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNCeVR5cGVcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJhZ30gQmFnIG9mIGNvbXBvbmVudHNcbiAgICAgICAgICovICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzQnlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5VHlwZS5zZXQodHlwZS5nZXRJbmRleCgpLCBjb21wb25lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEByZXR1cm4gTWl4ZWQgQ29tcG9uZW50IG9uIHN1Y2Nlc3MsIG51bGwgb24gZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICBpZihjb21wb25lbnRzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHMuZ2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnQgZm9yXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNGb3JcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge1V0aWxzLkJhZ30gQmFnIG9mIGNvbXBvbmVudHNcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzRm9yID0gZnVuY3Rpb24oZW50aXR5LCBmaWxsQmFnKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Qml0cyA9IGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCk7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gY29tcG9uZW50Qml0cy5uZXh0U2V0Qml0KDApOyBpID49IDA7IGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoaSsxKSkge1xuICAgICAgICAgICAgICAgIGZpbGxCYWcuYWRkKGNvbXBvbmVudHNCeVR5cGUuZ2V0KGkpLmdldChlbnRpdHkuZ2V0SWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmlsbEJhZztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgZW50aXR5IHRvIGRlbGV0ZSBjb21wb25lbmV0cyBvZiB0aGVtXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkZWxldGVkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFuIGRlbGV0ZWQgY29tcG9uZW5ldHMgb2YgZW50aXRpZXNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKGRlbGV0ZWQuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGRlbGV0ZWQuc2l6ZSgpID4gaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eShkZWxldGVkLmdldChpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIENvbXBvbmVudE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4vQ29tcG9uZW50JyksXG4gICAgICAgIENvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcblxuICAgIC8qKlxuICAgICAqIEhpZ2ggcGVyZm9ybWFuY2UgY29tcG9uZW50IHJldHJpZXZhbCBmcm9tIGVudGl0aWVzLiBVc2UgdGhpcyB3aGVyZXZlciB5b3VcbiAgICAgKiBuZWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcyBvZnRlbiBhbmQgZmFzdC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIENvbXBvbmVudE1hcHBlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBfdHlwZVxuICAgICAqIEBwYXJhbSB7QXJ0ZW1pSlMuV29ybGR9IF93b3JsZFxuICAgICAqL1xuICAgIHZhciBDb21wb25lbnRNYXBwZXIgPSBmdW5jdGlvbiBDb21wb25lbnRNYXBwZXIoX3R5cGUsIF93b3JsZCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkge0FydGVtaUpTLkNvbXBvbmVudFR5cGV9IHR5cGUgVHlwZSBvZiBjb21wb25lbnRcbiAgICAgICAgICovXG4gICAgICAgIHZhciB0eXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKF90eXBlKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0FydGVtaUpTLlV0aWxzLkJhZ30gY29tcG9uZW50cyBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50cyA9IF93b3JsZC5nZXRDb21wb25lbnRNYW5hZ2VyKCkuZ2V0Q29tcG9uZW50c0J5VHlwZSh0eXBlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRmFzdCBidXQgdW5zYWZlIHJldHJpZXZhbCBvZiBhIGNvbXBvbmVudCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIE5vIGJvdW5kaW5nIGNoZWNrcywgc28gdGhpcyBjb3VsZCByZXR1cm4gbnVsbCxcbiAgICAgICAgICogaG93ZXZlciBpbiBtb3N0IHNjZW5hcmlvcyB5b3UgYWxyZWFkeSBrbm93IHRoZSBlbnRpdHkgcG9zc2Vzc2VzIHRoaXMgY29tcG9uZW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRcbiAgICAgICAgICogQHBhcmFtIHtBcnRlbWlKUy5FbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Db21wb25lbnR9fG51bGxcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cy5nZXQoZW50aXR5LmdldElkKCkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhc3QgYW5kIHNhZmUgcmV0cmlldmFsIG9mIGEgY29tcG9uZW50IGZvciB0aGlzIGVudGl0eS5cbiAgICAgICAgICogSWYgdGhlIGVudGl0eSBkb2VzIG5vdCBoYXZlIHRoaXMgY29tcG9uZW50IHRoZW4gbnVsbCBpcyByZXR1cm5lZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U2FmZVxuICAgICAgICAgKiBAcGFyYW0ge0FydGVtaUpTLkVudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkNvbXBvbmVudH18bnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRTYWZlID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihjb21wb25lbnRzLmlzSW5kZXhXaXRoaW5Cb3VuZHMoZW50aXR5LmdldElkKCkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHMuZ2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGUgZW50aXR5IGhhcyB0aGlzIHR5cGUgb2YgY29tcG9uZW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBoYXNcbiAgICAgICAgICogQHBhcmFtIHtBcnRlbWlKUy5FbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgZW50aXR5IGhhcyB0aGlzIGNvbXBvbmVudCB0eXBlLCBmYWxzZSBpZiBpdCBkb2Vzbid0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oYXMgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNhZmUoZW50aXR5KSAhPT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBjb21wb25lbnQgbWFwcGVyIGZvciB0aGlzIHR5cGUgb2YgY29tcG9uZW50cy5cbiAgICAgKiBcbiAgICAgKiBAbWV0aG9kIGdldEZvclxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdHlwZSB0aGUgdHlwZSBvZiBjb21wb25lbnRzIHRoaXMgbWFwcGVyIHVzZXNcbiAgICAgKiBAcGFyYW0ge0FydGVtaUpTLldvcmxkfSB0aGUgd29ybGQgdGhhdCB0aGlzIGNvbXBvbmVudCBtYXBwZXIgc2hvdWxkIHVzZVxuICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkNvbXBvbmVudE1hcHBlcn1cbiAgICAgKi9cbiAgICBDb21wb25lbnRNYXBwZXIuZ2V0Rm9yID0gZnVuY3Rpb24odHlwZSwgd29ybGQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRNYXBwZXIodHlwZSwgd29ybGQpO1xuICAgIH07XG4gICAgXG4gICAgQ29tcG9uZW50TWFwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMuQ29tcG9uZW50TWFwcGVyID0gQ29tcG9uZW50TWFwcGVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi91dGlscy9IYXNoTWFwJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBjbGFzcyBDb21wb25lbnRUeXBlXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudFR5cGUgPSAoZnVuY3Rpb24gQ29tcG9uZW50VHlwZSgpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgdHlwZVxuICAgICAgICAgKiBAdHlwZSB7QXJ0ZW1pSlMuQ29tcG9uZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHR5cGUsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHN0YXRpY1xuICAgICAgICAgKiBAcHJvcGVydHkgSU5ERVhcbiAgICAgICAgICogQHR5cGUge0ludGVnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBJTkRFWCA9IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGluZGV4XG4gICAgICAgICAqIEB0eXBlIHtJbnRlZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgaW5kZXgsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRUeXBlcyA9IG5ldyBIYXNoTWFwKCk7XG4gICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBDb25zdHJ1Y3RvcihfdHlwZSkge1xuICAgICAgICAgICAgdGhpcy5pbmRleCA9IElOREVYKys7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBfdHlwZTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICAgIHR5cGU6IG51bGwsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRleDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRGb3I6IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBfdHlwZSA9IGNvbXBvbmVudFR5cGVzLmdldChjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGlmKF90eXBlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIF90eXBlID0gQ29uc3RydWN0b3IuY2FsbCh0aGlzLCBfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGVzLnB1dChjb21wb25lbnQsIF90eXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90eXBlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0SW5kZXhGb3I6IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFR5cGVGb3IoY29tcG9uZW50KS5nZXRJbmRleCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIkNvbXBvbmVudFR5cGVbXCIrdHlwZS5nZXRTaW1wbGVOYW1lKCkrXCJdIChcIitpbmRleCtcIilcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KSgpO1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50VHlwZTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgQml0U2V0ID0gcmVxdWlyZSgnLi91dGlscy9CaXRTZXQnKSxcbiAgICAgICAgQ29tcG9uZW50VHlwZSA9IHJlcXVpcmUoJy4vQ29tcG9uZW50VHlwZScpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGVudGl0eSBjbGFzcy4gQ2Fubm90IGJlIGluc3RhbnRpYXRlZCBvdXRzaWRlIHRoZSBmcmFtZXdvcmssIHlvdSBtdXN0XG4gICAgICogY3JlYXRlIG5ldyBlbnRpdGllcyB1c2luZyBXb3JsZC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7V29ybGR9IF93b3JsZFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBfaWRcbiAgICAgKi8gXG4gICAgdmFyIEVudGl0eSA9IGZ1bmN0aW9uIEVudGl0eShfd29ybGQsIF9pZCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB1dWlkXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgdXVpZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50Qml0c1xuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50Qml0cyA9IG5ldyBCaXRTZXQoKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbUJpdHNcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHN5c3RlbUJpdHMgPSBuZXcgQml0U2V0KCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHdvcmxkID0gX3dvcmxkLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgaWQgPSBfaWQsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0eU1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge0VudGl0eU1hbmFnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBlbnRpdHlNYW5hZ2VyID0gd29ybGQuZ2V0RW50aXR5TWFuYWdlcigpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRNYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtDb21wb25lbnRNYW5hZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50TWFuYWdlciA9IHdvcmxkLmdldENvbXBvbmVudE1hbmFnZXIoKTtcbiAgICAgICAgXG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGludGVybmFsIGlkIGZvciB0aGlzIGVudGl0eSB3aXRoaW4gdGhlIGZyYW1ld29yay4gTm8gb3RoZXIgZW50aXR5XG4gICAgICAgICAqIHdpbGwgaGF2ZSB0aGUgc2FtZSBJRCwgYnV0IElEJ3MgYXJlIGhvd2V2ZXIgcmV1c2VkIHNvIGFub3RoZXIgZW50aXR5IG1heVxuICAgICAgICAgKiBhY3F1aXJlIHRoaXMgSUQgaWYgdGhlIHByZXZpb3VzIGVudGl0eSB3YXMgZGVsZXRlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0SWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRJZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBCaXRTZXQgaW5zdGFuY2UgY29udGFpbmluZyBiaXRzIG9mIHRoZSBjb21wb25lbnRzIHRoZSBlbnRpdHkgcG9zc2Vzc2VzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRCaXRzXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50Qml0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudEJpdHM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIEJpdFNldCBpbnN0YW5jZSBjb250YWluaW5nIGJpdHMgb2YgdGhlIGNvbXBvbmVudHMgdGhlIGVudGl0eSBwb3NzZXNzZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFN5c3RlbUJpdHNcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRTeXN0ZW1CaXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtQml0cztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgc3lzdGVtcyBCaXRTZXRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgcmVzZXRcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgc3lzdGVtQml0cy5yZXNldCgpO1xuICAgICAgICAgICAgY29tcG9uZW50Qml0cy5yZXNldCgpO1xuICAgICAgICAgICAgdXVpZCA9IE1hdGgudXVpZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTWFrZSBlbnRpdHkgcmVhZHkgZm9yIHJlLXVzZS5cbiAgICAgICAgICogV2lsbCBnZW5lcmF0ZSBhIG5ldyB1dWlkIGZvciB0aGUgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJFbnRpdHkgW1wiICsgaWQgKyBcIl1cIjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYSBjb21wb25lbnQgdG8gdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZENvbXBvbmVudFxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSBbdHlwZV1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50LCB0eXBlKSB7XG4gICAgICAgICAgICBpZighKHR5cGUgaW5zdGFuY2VvZiBDb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IoY29tcG9uZW50LmdldENsYXNzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50TWFuYWdlci5hZGRDb21wb25lbnQodGhpcywgdHlwZSwgY29tcG9uZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZSBjb21wb25lbnQgYnkgaXRzIHR5cGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gW2NvbXBvbmVudF1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlQ29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50VHlwZTtcbiAgICAgICAgICAgIGlmKCEoY29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnRNYW5hZ2VyLnJlbW92ZUNvbXBvbmVudCh0aGlzLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVja3MgaWYgdGhlIGVudGl0eSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQgYW5kIGhhcyBub3QgYmVlbiBkZWxldGVkIGZyb20gaXQuXG4gICAgICAgICAqIElmIHRoZSBlbnRpdHkgaGFzIGJlZW4gZGlzYWJsZWQgdGhpcyB3aWxsIHN0aWxsIHJldHVybiB0cnVlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0FjdGl2ZVxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuaXNBY3RpdmUodGhpcy5pZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpc0VuYWJsZWRcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5pc0VuYWJsZWQodGhpcy5pZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBpcyB0aGUgcHJlZmVycmVkIG1ldGhvZCB0byB1c2Ugd2hlbiByZXRyaWV2aW5nIGEgY29tcG9uZW50IGZyb20gYVxuICAgICAgICAgKiBlbnRpdHkuIEl0IHdpbGwgcHJvdmlkZSBnb29kIHBlcmZvcm1hbmNlLlxuICAgICAgICAgKiBCdXQgdGhlIHJlY29tbWVuZGVkIHdheSB0byByZXRyaWV2ZSBjb21wb25lbnRzIGZyb20gYW4gZW50aXR5IGlzIHVzaW5nXG4gICAgICAgICAqIHRoZSBDb21wb25lbnRNYXBwZXIuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudFR5cGV9IFt0eXBlXVxuICAgICAgICAgKiAgICAgIGluIG9yZGVyIHRvIHJldHJpZXZlIHRoZSBjb21wb25lbnQgZmFzdCB5b3UgbXVzdCBwcm92aWRlIGFcbiAgICAgICAgICogICAgICBDb21wb25lbnRUeXBlIGluc3RhbmNlIGZvciB0aGUgZXhwZWN0ZWQgY29tcG9uZW50LlxuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Db21wb25lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRUeXBlO1xuICAgICAgICAgICAgaWYoISh0eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRNYW5hZ2VyLmdldENvbXBvbmVudCh0aGlzLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgYmFnIG9mIGFsbCBjb21wb25lbnRzIHRoaXMgZW50aXR5IGhhcy5cbiAgICAgICAgICogWW91IG5lZWQgdG8gcmVzZXQgdGhlIGJhZyB5b3Vyc2VsZiBpZiB5b3UgaW50ZW5kIHRvIGZpbGwgaXQgbW9yZSB0aGFuIG9uY2UuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNcbiAgICAgICAgICogQHBhcmFtIHtVdGlscy5CYWd9IGZpbGxCYWcgdGhlIGJhZyB0byBwdXQgdGhlIGNvbXBvbmVudHMgaW50by5cbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSB0aGUgZmlsbEJhZyB3aXRoIHRoZSBjb21wb25lbnRzIGluLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzID0gZnVuY3Rpb24oZmlsbEJhZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudE1hbmFnZXIuZ2V0Q29tcG9uZW50c0Zvcih0aGlzLCBmaWxsQmFnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWZyZXNoIGFsbCBjaGFuZ2VzIHRvIGNvbXBvbmVudHMgZm9yIHRoaXMgZW50aXR5LiBBZnRlciBhZGRpbmcgb3JcbiAgICAgICAgICogcmVtb3ZpbmcgY29tcG9uZW50cywgeW91IG11c3QgY2FsbCB0aGlzIG1ldGhvZC4gSXQgd2lsbCB1cGRhdGUgYWxsXG4gICAgICAgICAqIHJlbGV2YW50IHN5c3RlbXMuIEl0IGlzIHR5cGljYWwgdG8gY2FsbCB0aGlzIGFmdGVyIGFkZGluZyBjb21wb25lbnRzIHRvIGFcbiAgICAgICAgICogbmV3bHkgY3JlYXRlZCBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZFRvV29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkVG9Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuYWRkRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZW50aXR5IGhhcyBjaGFuZ2VkLCBhIGNvbXBvbmVudCBhZGRlZCBvciBkZWxldGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkSW5Xb3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkSW5Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuY2hhbmdlZEVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgdGhpcyBlbnRpdHkgZnJvbSB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZUZyb21Xb3JsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZUZyb21Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuZGVsZXRlRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIChSZSllbmFibGUgdGhlIGVudGl0eSBpbiB0aGUgd29ybGQsIGFmdGVyIGl0IGhhdmluZyBiZWluZyBkaXNhYmxlZC5cbiAgICAgICAgICogV29uJ3QgZG8gYW55dGhpbmcgdW5sZXNzIGl0IHdhcyBhbHJlYWR5IGRpc2FibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5lbmFibGUodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzYWJsZSB0aGUgZW50aXR5IGZyb20gYmVpbmcgcHJvY2Vzc2VkLiBXb24ndCBkZWxldGUgaXQsIGl0IHdpbGxcbiAgICAgICAgICogY29udGludWUgdG8gZXhpc3QgYnV0IHdvbid0IGdldCBwcm9jZXNzZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRpc2FibGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuZGlzYWJsZSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgdGhlIFVVSUQgZm9yIHRoaXMgZW50aXR5LlxuICAgICAgICAgKiBUaGlzIFVVSUQgaXMgdW5pcXVlIHBlciBlbnRpdHkgKHJlLXVzZWQgZW50aXRpZXMgZ2V0IGEgbmV3IFVVSUQpLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRVdWlkXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gdXVpZCBpbnN0YW5jZSBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFV1aWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB1dWlkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIHdvcmxkIHRoaXMgZW50aXR5IGJlbG9uZ3MgdG8uXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFdvcmxkXG4gICAgICAgICAqIEByZXR1cm4ge0FydGVtaUpTLldvcmxkfSB3b3JsZCBvZiBlbnRpdHkuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFdvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gd29ybGQ7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIEJpdFNldCA9IHJlcXVpcmUoJy4vdXRpbHMvQml0U2V0JyksXG4gICAgICAgIEVudGl0eSA9IHJlcXVpcmUoJy4vRW50aXR5JyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKCcuL01hbmFnZXInKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgbWFuYWdlciBjbGFzcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eU1hbmFnZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi8gXG4gICAgdmFyIEVudGl0eU1hbmFnZXIgPSBmdW5jdGlvbiBFbnRpdHlNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0aWVzXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZW50aXRpZXMgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRpc2FibGVkXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlZCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBhY3RpdmUsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFkZGVkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBhZGRlZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY3JlYXRlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGVsZXRlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgaWRlbnRpZmllclBvb2xcbiAgICAgICAgICogQHR5cGUge0lkZW50aWZpZXJQb29sfVxuICAgICAgICAgKi9cbiAgICAgICAgaWRlbnRpZmllclBvb2wgPSBuZXcgSWRlbnRpZmllclBvb2woKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0aWFsaXplXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIG5ldyBlbnRpdHkgaW5zdGFuY2VcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY3JlYXRlRW50aXR5SW5zdGFuY2VcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcmVhdGVFbnRpdHlJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IG5ldyBFbnRpdHkodGhpcy53b3JsZCwgaWRlbnRpZmllclBvb2wuY2hlY2tPdXQoKSk7XG4gICAgICAgICAgICBjcmVhdGVkKys7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBlbnRpdHkgYXMgYWRkZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGFjdGl2ZSsrO1xuICAgICAgICAgICAgYWRkZWQrKztcbiAgICAgICAgICAgIGVudGl0aWVzLnNldChlbnRpdHkuZ2V0SWQoKSwgZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGVuYWJsZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkaXNhYmxlZC5jbGVhcihlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVudGl0eSBhcyBkaXNhYmxlZCBmb3IgZnV0dXJlIHByb2Nlc3NcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZGlzYWJsZWQuc2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGRlbGV0ZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBlbnRpdGllcy5zZXQoZW50aXR5LmdldElkKCksIG51bGwpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkaXNhYmxlZC5jbGVhcihlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkZW50aWZpZXJQb29sLmNoZWNrSW4oZW50aXR5LmdldElkKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhY3RpdmUtLTtcbiAgICAgICAgICAgIGRlbGV0ZWQrKztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiB0aGlzIGVudGl0eSBpcyBhY3RpdmUuXG4gICAgICAgICAqIEFjdGl2ZSBtZWFucyB0aGUgZW50aXR5IGlzIGJlaW5nIGFjdGl2ZWx5IHByb2Nlc3NlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaXNBY3RpdmVcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYWN0aXZlLCBmYWxzZSBpZiBub3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmdW5jdGlvbihlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzLmdldChlbnRpdHlJZCkgIT09IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIHNwZWNpZmllZCBlbnRpdHlJZCBpcyBlbmFibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0VuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgZW5hYmxlZCwgZmFsc2UgaWYgaXQgaXMgZGlzYWJsZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbmFibGVkID0gZnVuY3Rpb24oZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAhZGlzYWJsZWQuZ2V0KGVudGl0eUlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYSBlbnRpdHkgd2l0aCB0aGlzIGlkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGdldEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZW50aXR5SWRcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzLmdldChlbnRpdHlJZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGhvdyBtYW55IGVudGl0aWVzIGFyZSBhY3RpdmUgaW4gdGhpcyB3b3JsZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0QWN0aXZlRW50aXR5Q291bnRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBhcmUgY3VycmVudGx5IGFjdGl2ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0QWN0aXZlRW50aXR5Q291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gY3JlYXRlZCBpbiB0aGUgd29ybGQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqIE5vdGU6IEEgY3JlYXRlZCBlbnRpdHkgbWF5IG5vdCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkLCB0aHVzXG4gICAgICAgICAqIGNyZWF0ZWQgY291bnQgaXMgYWx3YXlzIGVxdWFsIG9yIGxhcmdlciB0aGFuIGFkZGVkIGNvdW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRUb3RhbENyZWF0ZWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gY3JlYXRlZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VG90YWxDcmVhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlZDtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRUb3RhbEFkZGVkXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGFkZGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRUb3RhbEFkZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYWRkZWQ7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGRlbGV0ZWQgZnJvbSB0aGUgd29ybGQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFRvdGFsRGVsZXRlZFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBkZWxldGVkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRUb3RhbERlbGV0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWxldGVkO1xuICAgICAgICB9O1xuICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVc2VkIG9ubHkgaW50ZXJuYWxseSBpbiBFbnRpdHlNYW5hZ2VyIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3JcbiAgICAgICAgICogZW50aXRpZXMgYW5kIHJldXNlIHRoZW1cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgICAgICogQGNsYXNzIElkZW50aWZpZXJQb29sXG4gICAgICAgICAqIEBmb3IgRW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAZmluYWxcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBJZGVudGlmaWVyUG9vbCgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgaWRzXG4gICAgICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQmFnfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgaWRzID0gbmV3IEJhZygpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBuZXh0QXZhaWxhYmxlSWRcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG5leHRBdmFpbGFibGVJZCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2hlY2sgYW4gYXZhaWxhYmxlIGlkXG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqIEBtZXRob2QgY2hlY2tPdXRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gbmV4dCBhdmFpbGFibGUgaWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGVja091dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKGlkcy5zaXplKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkcy5yZW1vdmVMYXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0QXZhaWxhYmxlSWQrKztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQWRkIG5ldyBpZCBpbiBpZHMge0JhZ31cbiAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICogQG1ldGhvZCBjaGVja0luXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGVja0luID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBpZHMucHVzaChpZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5TWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IG9ic2VydmVyIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5T2JzZXJ2ZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi8gXG4gICAgdmFyIEVudGl0eU9ic2VydmVyID0gZnVuY3Rpb24gRW50aXR5T2JzZXJ2ZXIoKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGFkZGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gY2hhbmdlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGRlbGV0ZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBlbmFibGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gZGlzYWJsZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eU9ic2VydmVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBFbnRpdHlPYnNlcnZlciA9IHJlcXVpcmUoJy4vRW50aXR5T2JzZXJ2ZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGdlbmVyYXRlIGEgdW5pcXVlIGJpdCBmb3IgZWFjaCBzeXN0ZW0uXG4gICAgICogT25seSB1c2VkIGludGVybmFsbHkgaW4gRW50aXR5U3lzdGVtLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgU3lzdGVtSW5kZXhNYW5hZ2VyXG4gICAgICogQGZvciBFbnRpdHlTeXN0ZW1cbiAgICAgKiBAZmluYWxcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgU3lzdGVtSW5kZXhNYW5hZ2VyID0ge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBJTkRFWFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgSU5ERVg6IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGluZGljZXNcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgaW5kaWNlczoge30sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRJbmRleEZvclxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eVN5c3RlbX0gZW50aXR5U3lzdGVtXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaW5kZXhcbiAgICAgICAgICovXG4gICAgICAgIGdldEluZGV4Rm9yOiBmdW5jdGlvbihlbnRpdHlTeXN0ZW0pIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kaWNlc1tlbnRpdHlTeXN0ZW1dO1xuICAgICAgICAgICAgaWYoIWluZGV4KSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLklOREVYKys7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzW2VudGl0eVN5c3RlbV0gPSBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIG1vc3QgcmF3IGVudGl0eSBzeXN0ZW0uIEl0IHNob3VsZCBub3QgdHlwaWNhbGx5IGJlIHVzZWQsIGJ1dCB5b3UgY2FuIFxuICAgICAqIGNyZWF0ZSB5b3VyIG93biBlbnRpdHkgc3lzdGVtIGhhbmRsaW5nIGJ5IGV4dGVuZGluZyB0aGlzLiBJdCBpcyBcbiAgICAgKiByZWNvbW1lbmRlZCB0aGF0IHlvdSB1c2UgdGhlIG90aGVyIHByb3ZpZGVkIGVudGl0eSBzeXN0ZW0gaW1wbGVtZW50YXRpb25zXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIEVudGl0eVN5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eU9ic2VydmVyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud29ybGQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBmaW5hbFxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtSW5kZXhcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeXN0ZW1JbmRleCA9IFN5c3RlbUluZGV4TWFuYWdlci5nZXRJbmRleEZvcih0aGlzLmdldENsYXNzKCkpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVzXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICBhY3RpdmVzID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhc3BlY3RcbiAgICAgICAgICogQHR5cGUge0FzcGVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGFzcGVjdCA9IF9hc3BlY3QsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFsbFNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgYWxsU2V0ID0gYXNwZWN0LmdldEFsbFNldCgpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBleGNsdXNpb25TZXRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIGV4Y2x1c2lvblNldCA9IGFzcGVjdC5nZXRFeGNsdXNpb25TZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgb25lU2V0XG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICBvbmVTZXQgPSBhc3BlY3QuZ2V0T25lU2V0KCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHBhc3NpdmVcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBwYXNzaXZlLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkdW1teVxuICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGR1bW15ID0gYWxsU2V0LmlzRW1wdHkoKSAmJiBvbmVTZXQuaXNFbXB0eSgpLFxuICAgICAgICBcbiAgICAgICAgbWUgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbVN5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSkge1xuICAgICAgICAgICAgYWN0aXZlcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgIGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuY2xlYXIoc3lzdGVtSW5kZXgpO1xuICAgICAgICAgICAgbWUucmVtb3ZlZChlbnRpdHkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIGluc2VydFRvU3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGluc2VydFRvU3lzdGVtKGVudGl0eSkge1xuICAgICAgICAgICAgYWN0aXZlcy5hZGQoZW50aXR5KTtcbiAgICAgICAgICAgIGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuc2V0KHN5c3RlbUluZGV4KTtcbiAgICAgICAgICAgIG1lLmluc2VydGVkKGVudGl0eSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgYmVmb3JlIHByb2Nlc3Npbmcgb2YgZW50aXRpZXMgYmVnaW5zXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgYmVnaW5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmVnaW4gPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb2Nlc3MgdGhlIGVudGl0aWVzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHByb2Nlc3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5jaGVja1Byb2Nlc3NpbmcoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmVnaW4oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyhhY3RpdmVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBhZnRlciB0aGUgcHJvY2Vzc2luZyBvZiBlbnRpdGllcyBlbmRzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmQgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFueSBpbXBsZW1lbnRpbmcgZW50aXR5IHN5c3RlbSBtdXN0IGltcGxlbWVudCB0aGlzIG1ldGhvZCBhbmQgdGhlIFxuICAgICAgICAgKiBsb2dpYyB0byBwcm9jZXNzIHRoZSBnaXZlbiBlbnRpdGllcyBvZiB0aGUgc3lzdGVtLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzRW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGVudGl0aWVzIGF0aGUgZW50aXRpZXMgdGhpcyBzeXN0ZW0gY29udGFpbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIHRoZSBzeXN0ZW0gc2hvdWxkIHByb2Nlc3NpbmdcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hlY2tQcm9jZXNzaW5nXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlIHN5c3RlbSBzaG91bGQgYmUgcHJvY2Vzc2VkLCBmYWxzZSBpZiBub3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY29kZSB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbiBzeXN0ZW1zIGFyZSBcbiAgICAgICAgICogaW5pdGlhbGl6ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIGlmIHRoZSBzeXN0ZW0gaGFzIHJlY2VpdmVkIGEgZW50aXR5IGl0IGlzIGludGVyZXN0ZWQgaW4sIFxuICAgICAgICAgKiBlLmcuIGNyZWF0ZWQgb3IgYSBjb21wb25lbnQgd2FzIGFkZGVkIHRvIGl0LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbnNlcnRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRoZSBlbnRpdHkgdGhhdCB3YXMgYWRkZWQgdG8gdGhpcyBzeXN0ZW1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5zZXJ0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBpZiBhIGVudGl0eSB3YXMgcmVtb3ZlZCBmcm9tIHRoaXMgc3lzdGVtLCBlLmcuIGRlbGV0ZWQgXG4gICAgICAgICAqIG9yIGhhZCBvbmUgb2YgaXQncyBjb21wb25lbnRzIHJlbW92ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0aGUgZW50aXR5IHRoYXQgd2FzIHJlbW92ZWQgZnJvbSB0aGlzIHN5c3RlbS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IGZ1bmN0aW9uKGVudGl0eSkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2lsbCBjaGVjayBpZiB0aGUgZW50aXR5IGlzIG9mIGludGVyZXN0IHRvIHRoaXMgc3lzdGVtLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1xuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRoZSBlbnRpdHkgdG8gY2hlY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hlY2sgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGR1bW15KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNvbnRhaW5zID0gZW50aXR5LmdldFN5c3RlbUJpdHMoKS5nZXQoc3lzdGVtSW5kZXgpO1xuICAgICAgICAgICAgdmFyIGludGVyZXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudEJpdHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighYWxsU2V0LmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBhbGxTZXQubmV4dFNldEJpdCgwKTsgaSA+PSAwOyBpID0gYWxsU2V0Lm5leHRTZXRCaXQoaSsxKSkge1xuICAgICAgICAgICAgICAgICAgICBpZighY29tcG9uZW50Qml0cy5nZXQoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVyZXN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICBpZighZXhjbHVzaW9uU2V0LmlzRW1wdHkoKSAmJiBpbnRlcmVzdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVyZXN0ZWQgPSAhZXhjbHVzaW9uU2V0LmludGVyc2VjdHMoY29tcG9uZW50Qml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBlbnRpdHkgcG9zc2Vzc2VzIEFOWSBvZiB0aGUgY29tcG9uZW50cyBpbiB0aGUgb25lU2V0LiBJZiBzbywgdGhlIHN5c3RlbSBpcyBpbnRlcmVzdGVkLlxuICAgICAgICAgICAgaWYoIW9uZVNldC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJlc3RlZCA9IG9uZVNldC5pbnRlcnNlY3RzKGNvbXBvbmVudEJpdHMpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKGludGVyZXN0ZWQgJiYgIWNvbnRhaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc2VydFRvU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpbnRlcmVzdGVkICYmIGNvbnRhaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUZyb21TeXN0ZW0oZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5jaGVjayhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuZ2V0KHN5c3RlbUluZGV4KSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZUZyb21TeXN0ZW0oZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuZ2V0KHN5c3RlbUluZGV4KSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZUZyb21TeXN0ZW0oZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBzZXRXb3JsZFxuICAgICAgICAgKiBAcGFyYW0ge1dvcmxkfSB3b3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRXb3JsZCA9IGZ1bmN0aW9uKHdvcmxkKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpc1Bhc3NpdmVcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNQYXNzaXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFzc2l2ZTtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qgc2V0UGFzc2l2ZVxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHBhc3NpdmVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0UGFzc2l2ZSA9IGZ1bmN0aW9uKHBhc3NpdmUpIHtcbiAgICAgICAgICAgIHRoaXMucGFzc2l2ZSA9IHBhc3NpdmU7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRBY3RpdmVzXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJhZ30gYWN0aXZlc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRBY3RpdmVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYWN0aXZlcztcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIEVudGl0eVN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eU9ic2VydmVyLnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eU9ic2VydmVyID0gcmVxdWlyZSgnLi9FbnRpdHlPYnNlcnZlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgY2xhc3MuIENhbm5vdCBiZSBpbnN0YW50aWF0ZWQgb3V0c2lkZSB0aGUgZnJhbWV3b3JrLCB5b3UgbXVzdFxuICAgICAqIGNyZWF0ZSBuZXcgZW50aXRpZXMgdXNpbmcgV29ybGQuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBNYW5hZ2VyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovIFxuICAgIHZhciBNYW5hZ2VyID0gZnVuY3Rpb24gTWFuYWdlcigpIHtcbiAgICAgICAgRW50aXR5T2JzZXJ2ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgd29ybGRcbiAgICAgICAgICogQHR5cGUge1dvcmxkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53b3JsZCA9IG51bGw7XG4gICAgICAgIFxuICAgICAgIC8qKlxuICAgICAgICAgKiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY29kZSB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbiBzeXN0ZW1zIGFyZSBcbiAgICAgICAgICogaW5pdGlhbGl6ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldFdvcmxkXG4gICAgICAgICAqIEBwYXJhbSB7V29ybGR9IHdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFdvcmxkID0gZnVuY3Rpb24od29ybGQpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRXb3JsZFxuICAgICAgICAgKiBAcmV0dXJuIHtXb3JsZH0gd29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0V29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndvcmxkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307IFxuICAgIH07XG4gICAgXG4gICAgTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eU9ic2VydmVyLnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEVudGl0eU1hbmFnZXIgPSByZXF1aXJlKCcuL0VudGl0eU1hbmFnZXInKSxcbiAgICAgICAgQ29tcG9uZW50TWFuYWdlciA9IHJlcXVpcmUoJy4vQ29tcG9uZW50TWFuYWdlcicpLFxuICAgICAgICBDb21wb25lbnRNYXBwZXIgPSByZXF1aXJlKCcuL0NvbXBvbmVudE1hcHBlcicpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHByaW1hcnkgaW5zdGFuY2UgZm9yIHRoZSBmcmFtZXdvcmsuIEl0IGNvbnRhaW5zIGFsbCB0aGUgbWFuYWdlcnMuXG4gICAgICogWW91IG11c3QgdXNlIHRoaXMgdG8gY3JlYXRlLCBkZWxldGUgYW5kIHJldHJpZXZlIGVudGl0aWVzLlxuICAgICAqIEl0IGlzIGFsc28gaW1wb3J0YW50IHRvIHNldCB0aGUgZGVsdGEgZWFjaCBnYW1lIGxvb3AgaXRlcmF0aW9uLCBcbiAgICAgKiBhbmQgaW5pdGlhbGl6ZSBiZWZvcmUgZ2FtZSBsb29wLlxuICAgICAqXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBXb3JsZFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBXb3JsZCA9IGZ1bmN0aW9uIFdvcmxkKCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBlbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtFbnRpdHlNYW5hZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVudGl0eU1hbmFnZXIgPSBuZXcgRW50aXR5TWFuYWdlcigpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRNYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtDb21wb25lbnRNYW5hZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50TWFuYWdlciA9IG5ldyBDb21wb25lbnRNYW5hZ2VyKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IG1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIG1hbmFnZXJzID0ge30sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IG1hbmFnZXJzQmFnXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICBtYW5hZ2Vyc0JhZyA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtc1xuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgc3lzdGVtcyA9IHt9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzeXN0ZW1zQmFnXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICBzeXN0ZW1zQmFnID0gbmV3IEJhZygpLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFkZGVkXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICBhZGRlZCA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY2hhbmdlZFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgY2hhbmdlZCA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGVsZXRlZFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlZCA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW5hYmxlXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAqL1xuICAgICAgICBlbmFibGUgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRpc2FibGVcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJhZ31cbiAgICAgICAgICovXG4gICAgICAgIGRpc2FibGUgPSBuZXcgQmFnKCksXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGVsdGFcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbHRhID0gMDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFrZXMgc3VyZSBhbGwgbWFuYWdlcnMgc3lzdGVtcyBhcmUgaW5pdGlhbGl6ZWQgaW4gdGhlIG9yZGVyIFxuICAgICAgICAgKiB0aGV5IHdlcmUgYWRkZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaSA9IG1hbmFnZXJzQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIG1hbmFnZXJzQmFnLmdldChpKS5pbml0aWFsaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gc3lzdGVtc0JhZy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICBzeXN0ZW1zQmFnLmdldChpKS5pbml0aWFsaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIG1hbmFnZXIgdGhhdCB0YWtlcyBjYXJlIG9mIGFsbCB0aGUgZW50aXRpZXMgaW4gdGhlIHdvcmxkLlxuICAgICAgICAgKiBlbnRpdGllcyBvZiB0aGlzIHdvcmxkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEVudGl0eU1hbmFnZXJcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5TWFuYWdlcn0gZW50aXR5TWFuYWdlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFbnRpdHlNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlcjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgbWFuYWdlciB0aGF0IHRha2VzIGNhcmUgb2YgYWxsIHRoZSBjb21wb25lbnRzIGluIHRoZSB3b3JsZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKiBAcmV0dXJuIHtDb21wb25lbnRNYW5hZ2VyfSBjb21wb25lbnRNYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudE1hbmFnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRNYW5hZ2VyO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhIG1hbmFnZXIgaW50byB0aGlzIHdvcmxkLiBJdCBjYW4gYmUgcmV0cmlldmVkIGxhdGVyLlxuICAgICAgICAgKiBXb3JsZCB3aWxsIG5vdGlmeSB0aGlzIG1hbmFnZXIgb2YgY2hhbmdlcyB0byBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldE1hbmFnZXJcbiAgICAgICAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyIG1hbmFnZXIgdG8gYmUgYWRkZWRcbiAgICAgICAgICogQHJldHVybiB7TWFuYWdlcn0gbWFuYWdlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRNYW5hZ2VyID0gZnVuY3Rpb24obWFuYWdlcikge1xuICAgICAgICAgICAgbWFuYWdlci5zZXRXb3JsZCh0aGlzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFuYWdlcnNbbWFuYWdlci5nZXRDbGFzcygpXSA9IG1hbmFnZXI7XG4gICAgICAgICAgICBtYW5hZ2Vyc0JhZy5hZGQobWFuYWdlcik7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gbWFuYWdlcjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgbWFuYWdlciBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWFuYWdlclR5cGUgY2xhc3MgdHlwZSBvZiB0aGUgbWFuYWdlclxuICAgICAgICAgKiBAcmV0dXJuIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldE1hbmFnZXIgPSBmdW5jdGlvbihtYW5hZ2VyVHlwZSkgeyAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbWFuYWdlcnNbbWFuYWdlclR5cGVdIHx8IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZXMgdGhlIG1hbmFnZXIgZnJvbSB0aGlzIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVNYW5hZ2VyXG4gICAgICAgICAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlciBtYW5hZ2VyIHRvIGRlbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlTWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBtYW5hZ2Vyc1ttYW5hZ2VyLmdldENsYXNzKCldO1xuICAgICAgICAgICAgbWFuYWdlcnNCYWcucmVtb3ZlKG1hbmFnZXIpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFlvdSBtdXN0IHNwZWNpZnkgdGhlIGRlbHRhIGZvciB0aGUgZ2FtZSBoZXJlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXREZWx0YVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZCB0aW1lIHNpbmNlIGxhc3QgZ2FtZSBsb29wLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXREZWx0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGRlbHRhID0gZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXREZWx0YVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRlbHRhIHRpbWUgc2luY2UgbGFzdCBnYW1lIGxvb3AuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsdGE7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBhIGVudGl0eSB0byB0aGlzIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGFkZGVkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVuc3VyZSBhbGwgc3lzdGVtcyBhcmUgbm90aWZpZWQgb2YgY2hhbmdlcyB0byB0aGlzIGVudGl0eS5cbiAgICAgICAgICogSWYgeW91J3JlIGFkZGluZyBhIGNvbXBvbmVudCB0byBhbiBlbnRpdHkgYWZ0ZXIgaXQncyBiZWVuXG4gICAgICAgICAqIGFkZGVkIHRvIHRoZSB3b3JsZCwgdGhlbiB5b3UgbmVlZCB0byBpbnZva2UgdGhpcyBtZXRob2QuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW50aXR5ID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBjaGFuZ2VkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSB0aGUgZW50aXR5IGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGFkZGVkLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIChSZSllbmFibGUgdGhlIGVudGl0eSBpbiB0aGUgd29ybGQsIGFmdGVyIGl0IGhhdmluZyBiZWluZyBkaXNhYmxlZC5cbiAgICAgICAgICogV29uJ3QgZG8gYW55dGhpbmcgdW5sZXNzIGl0IHdhcyBhbHJlYWR5IGRpc2FibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGVuYWJsZS5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBlbnRpdHkgZnJvbSBiZWluZyBwcm9jZXNzZWQuIFdvbid0IGRlbGV0ZSBpdCwgaXQgd2lsbFxuICAgICAgICAgKiBjb250aW51ZSB0byBleGlzdCBidXQgd29uJ3QgZ2V0IHByb2Nlc3NlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGRpc2FibGUuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgb3IgcmV1c2VkIGVudGl0eSBpbnN0YW5jZS5cbiAgICAgICAgICogV2lsbCBOT1QgYWRkIHRoZSBlbnRpdHkgdG8gdGhlIHdvcmxkLCB1c2UgV29ybGQuYWRkRW50aXR5KEVudGl0eSkgZm9yIHRoYXQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNyZWF0ZUVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcmVhdGVFbnRpdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHlNYW5hZ2VyLmNyZWF0ZUVudGl0eUluc3RhbmNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGEgZW50aXR5IGhhdmluZyB0aGUgc3BlY2lmaWVkIGlkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0eSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5nZXRFbnRpdHkoaWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVzIHlvdSBhbGwgdGhlIHN5c3RlbXMgaW4gdGhpcyB3b3JsZCBmb3IgcG9zc2libGUgaXRlcmF0aW9uLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRTeXN0ZW1zXG4gICAgICAgICAqIEByZXR1cm4ge01peGVkfSBhbGwgZW50aXR5IHN5c3RlbXMgaW4gd29ybGQsIG90aGVyIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFN5c3RlbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzeXN0ZW1zQmFnO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZHMgYSBzeXN0ZW0gdG8gdGhpcyB3b3JsZCB0aGF0IHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IFdvcmxkLnByb2Nlc3MoKVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRTeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHlTeXN0ZW19IHN5c3RlbSB0aGUgc3lzdGVtIHRvIGFkZC5cbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBbcGFzc2l2ZV0gd2V0aGVyIG9yIG5vdCB0aGlzIHN5c3RlbSB3aWxsIGJlIHByb2Nlc3NlZCBieSBXb3JsZC5wcm9jZXNzKClcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5U3lzdGVtfSB0aGUgYWRkZWQgc3lzdGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRTeXN0ZW0gPSBmdW5jdGlvbihzeXN0ZW0sIHBhc3NpdmUpIHtcbiAgICAgICAgICAgIHBhc3NpdmUgPSBwYXNzaXZlIHx8IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzeXN0ZW0uc2V0V29ybGQodGhpcyk7XG4gICAgICAgICAgICBzeXN0ZW0uc2V0UGFzc2l2ZShwYXNzaXZlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzdGVtc1tzeXN0ZW0uZ2V0Q2xhc3MoKV0gPSBzeXN0ZW07XG4gICAgICAgICAgICBzeXN0ZW1zQmFnLmFkZChzeXN0ZW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0cmlldmUgYSBzeXN0ZW0gZm9yIHNwZWNpZmllZCBzeXN0ZW0gdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzeXN0ZW1UeXBlIHR5cGUgb2Ygc3lzdGVtLlxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHlTeXN0ZW19IGluc3RhbmNlIG9mIHRoZSBzeXN0ZW0gaW4gdGhpcyB3b3JsZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtID0gZnVuY3Rpb24oc3lzdGVtVHlwZSkgeyAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtc1tzeXN0ZW1UeXBlXSB8fCBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVkIHRoZSBzcGVjaWZpZWQgc3lzdGVtIGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVTeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHN5c3RlbSB0byBiZSBkZWxldGVkIGZyb20gd29ybGQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZVN5c3RlbSA9IGZ1bmN0aW9uKHN5c3RlbSkge1xuICAgICAgICAgICAgZGVsZXRlIHN5c3RlbXNbc3lzdGVtLmdldENsYXNzKCldO1xuICAgICAgICAgICAgc3lzdGVtc0JhZy5yZW1vdmUoc3lzdGVtKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOb3RpZnkgYWxsIHRoZSBzeXN0ZW1zXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIG5vdGlmeVN5c3RlbXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lciBPYmplY3Qgd2l0aCBjYWxsYmFjayBwZXJmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG5vdGlmeVN5c3RlbXMocGVyZm9ybWVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBpID0gc3lzdGVtc0JhZy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtZXIucGVyZm9ybShzeXN0ZW1zQmFnLmdldChpKSwgZW50aXR5KTtcbiAgICAgICAgICAgIH0gICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTm90aWZ5IGFsbCB0aGUgbWFuYWdlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2Qgbm90aWZ5U3lzdGVtc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGVyZm9ybWVyIE9iamVjdCB3aXRoIGNhbGxiYWNrIHBlcmZvcm1cbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gbm90aWZ5TWFuYWdlcnMocGVyZm9ybWVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBpID0gbWFuYWdlcnNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybWVyLnBlcmZvcm0obWFuYWdlcnNCYWcuZ2V0KGkpLCBlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYW4gYWN0aW9uIG9uIGVhY2ggZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1xuICAgICAgICAgKiBAcGFyYW0ge1V0aWxzLkJhZ30gZW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lclxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY2hlY2soZW50aXRpZXMsIHBlcmZvcm1lcikge1xuICAgICAgICAgICAgaWYoIWVudGl0aWVzLnNpemUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gZW50aXRpZXMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmdldChpKTtcbiAgICAgICAgICAgICAgICBub3RpZnlNYW5hZ2VycyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICAgICAgbm90aWZ5U3lzdGVtcyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVudGl0aWVzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIGFsbCBub24tcGFzc2l2ZSBzeXN0ZW1zLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soYWRkZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmFkZGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGNoYW5nZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNoYW5nZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZGlzYWJsZSwge1xuICAgICAgICAgICAgICAgIHBlcmZvcm06IGZ1bmN0aW9uKG9ic2VydmVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzYWJsZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZW5hYmxlLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24ob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lbmFibGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGRlbGV0ZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbiAob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kZWxldGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudE1hbmFnZXIuY2xlYW4oKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGkgPSBzeXN0ZW1zQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBzeXN0ZW0gPSBzeXN0ZW1zQmFnLmdldChpKTtcbiAgICAgICAgICAgICAgICBpZighc3lzdGVtLmlzUGFzc2l2ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN5c3RlbS5wcm9jZXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlcyBhIENvbXBvbmVudE1hcHBlciBpbnN0YW5jZSBmb3IgZmFzdCByZXRyaWV2YWwgXG4gICAgICAgICAqIG9mIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0TWFwcGVyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlIG9mIGNvbXBvbmVudCB0byBnZXQgbWFwcGVyIGZvci5cbiAgICAgICAgICogQHJldHVybiB7Q29tcG9uZW50TWFwcGVyfSBtYXBwZXIgZm9yIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0TWFwcGVyID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudE1hcHBlci5nZXRGb3IodHlwZSwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldE1hbmFnZXIoY29tcG9uZW50TWFuYWdlcik7XG4gICAgICAgIHRoaXMuc2V0TWFuYWdlcihlbnRpdHlNYW5hZ2VyKTtcbiAgICB9O1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gV29ybGQ7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0hhc2hNYXAnKSxcbiAgICAgICAgQmFnID0gcmVxdWlyZSgnLi8uLi91dGlscy9CYWcnKSxcbiAgICAgICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vTWFuYWdlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIElmIHlvdSBuZWVkIHRvIGdyb3VwIHlvdXIgZW50aXRpZXMgdG9nZXRoZXIsIGUuZy4gdGFua3MgZ29pbmcgaW50byBcbiAgICAgKiBcInVuaXRzXCIgZ3JvdXAgb3IgZXhwbG9zaW9ucyBpbnRvIFwiZWZmZWN0c1wiLFxuICAgICAqIHRoZW4gdXNlIHRoaXMgbWFuYWdlci4gWW91IG11c3QgcmV0cmlldmUgaXQgdXNpbmcgd29ybGQgaW5zdGFuY2UuXG4gICAgICogXG4gICAgICogQSBlbnRpdHkgY2FuIGJlIGFzc2lnbmVkIHRvIG1vcmUgdGhhbiBvbmUgZ3JvdXAuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgTWFuYWdlcnNcbiAgICAgKiBAY2xhc3MgR3JvdXBNYW5hZ2VyXG4gICAgICogQG5hbWVzcGFjZSBNYW5hZ2Vyc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBleHRlbmRzIE1hbmFnZXJcbiAgICAgKi9cbiAgICB2YXIgR3JvdXBNYW5hZ2VyID0gZnVuY3Rpb24gR3JvdXBNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0aWVzQnlHcm91cFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBlbnRpdGllc0J5R3JvdXAgPSBuZXcgSGFzaE1hcCgpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBncm91cHNCeUVudGl0eVxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIGdyb3Vwc0J5RW50aXR5ID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB0aGUgZ3JvdXAgb2YgdGhlIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdG8gYWRkIGludG8gdGhlIGdyb3VwXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCB0byBhZGQgdGhlIGVudGl0eSBpbnRvXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKGVudGl0eSwgZ3JvdXApIHtcbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlHcm91cC5nZXQoZ3JvdXApO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5R3JvdXAucHV0KGdyb3VwLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYoZ3JvdXBzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgICAgIGdyb3Vwc0J5RW50aXR5LnB1dChlbnRpdHksIGdyb3Vwcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm91cHMuYWRkKGdyb3VwKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdGhlIGVudGl0eSBmcm9tIHRoZSBncm91cC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdG8gcmVtb3ZlIGZyb20gdGhlIGdyb3VwXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCB0byByZW1vdmUgZnJvbSB0aGVtIGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihlbnRpdHksIGdyb3VwKSB7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5R3JvdXAuZ2V0KGdyb3VwKTtcbiAgICAgICAgICAgIGlmKGVudGl0aWVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBncm91cHMgPSBncm91cHNCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKGdyb3VwcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGdyb3Vwcy5yZW1vdmUoZ3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZSB0aGUgZW50aXR5IGZyb20gdGhlIGFsbCBncm91cHMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUZyb21BbGxHcm91cHNcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0byByZW1vdmUgZnJvbSB0aGUgZ3JvdXBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbUFsbEdyb3VwcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYoZ3JvdXBzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSBncm91cHMuc2l6ZSgpO1xuICAgICAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5R3JvdXAuZ2V0KGdyb3Vwcy5nZXQoaSkpO1xuICAgICAgICAgICAgICAgICAgICBpZihlbnRpdGllcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JvdXBzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGFsbCBlbnRpdGllcyB0aGF0IGJlbG9uZyB0byB0aGUgcHJvdmlkZWQgZ3JvdXAuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEVudGl0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG9mIHRoZSBncm91cFxuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CYWd9IGVudGl0aWVzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0aWVzID0gZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlHcm91cC5nZXQoZ3JvdXApO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5R3JvdXAucHV0KGdyb3VwLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGFsbCBlbnRpdGllcyBmcm9tIHRoZSBncm91cFxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRHcm91cHNcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRHcm91cHMgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBncm91cHNCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXNJbkFueUdyb3VwID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRHcm91cHMoZW50aXR5KSAhPT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXNJbkdyb3VwID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgZ3JvdXAgPSBncm91cCB8fCBudWxsO1xuICAgICAgICAgICAgaWYoZ3JvdXAgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZ3JvdXBzID0gZ3JvdXBzQnlFbnRpdHkuZ2V0KGVudGl0eSk7XG4gICAgICAgICAgICB2YXIgaSA9IGdyb3Vwcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICBpZihncm91cCA9PT0gZ3JvdXBzLmdldChpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbUFsbEdyb3VwcyhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgIH07IFxuXG4gICAgR3JvdXBNYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gR3JvdXBNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi8uLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIEJhZyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvQmFnJyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKFwiLi8uLi9NYW5hZ2VyXCIpO1xuICAgIFxuICAgIHZhciBQbGF5ZXJNYW5hZ2VyID0gZnVuY3Rpb24gUGxheWVyTWFuYWdlcigpIHtcbiAgICAgICAgTWFuYWdlci5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHBsYXllckJ5RW50aXR5ID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgICAgIGVudGl0aWVzQnlQbGF5ZXIgPSBuZXcgSGFzaE1hcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0UGxheWVyID0gZnVuY3Rpb24oZW50aXR5LCBwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllckJ5RW50aXR5LnB1dChlbnRpdHksIHBsYXllcik7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5UGxheWVyLmdldChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5UGxheWVyLnB1dChwbGF5ZXIsIGVudGl0aWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVudGl0aWVzLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRFbnRpdGllc09mUGxheWVyID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5UGxheWVyLmdldChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllcztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHBsYXllckJ5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYocGxheWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgICAgICBpZihlbnRpdGllcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmdldFBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllckJ5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG5cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21QbGF5ZXIoZW50aXR5KTtcbiAgICAgICAgfTtcblxuICAgIH07XG4gICAgXG4gICAgUGxheWVyTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBsYXllck1hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0hhc2hNYXAnKSxcbiAgICAgICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vTWFuYWdlcicpO1xuICAgIFxuICAgIHZhciBUYWdNYW5hZ2VyID0gZnVuY3Rpb24gVGFnTWFuYWdlcigpIHtcbiAgICAgICAgTWFuYWdlci5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGVudGl0aWVzQnlUYWcgPSBuZXcgSGFzaE1hcCgpLFxuICAgICAgICAgICAgdGFnc0J5RW50aXR5ID0gbmV3IEhhc2hNYXAoKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyID0gZnVuY3Rpb24odGFnLCBlbnRpdHkpIHtcbiAgICAgICAgICAgIGVudGl0aWVzQnlUYWcucHV0KHRhZywgZW50aXR5KTtcbiAgICAgICAgICAgIHRhZ3NCeUVudGl0eS5wdXQoZW50aXR5LCB0YWcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5yZWdpc3RlciA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgdGFnc0J5RW50aXR5LnJlbW92ZShlbnRpdGllc0J5VGFnLnJlbW92ZSh0YWcpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmlzUmVnaXN0ZXJlZCA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzQnlUYWcuY29udGFpbnNLZXkodGFnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldEVudGl0eSA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzQnlUYWcuZ2V0KHRhZyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmdldFJlZ2lzdGVyZWRUYWdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFnc0J5RW50aXR5LnZhbHVlcygpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlZFRhZyA9IHRhZ3NCeUVudGl0eS5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKHJlbW92ZWRUYWcgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5VGFnLnJlbW92ZShyZW1vdmVkVGFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9XG4gICAgfTsgXG5cbiAgICBUYWdNYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGFnTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgY2xhc3MgdG9nZXRoZXIgd2l0aCBQbGF5ZXJNYW5hZ2VyLlxuICAgICAqIFxuICAgICAqIFlvdSBtYXkgc29tZXRpbWVzIHdhbnQgdG8gY3JlYXRlIHRlYW1zIGluIHlvdXIgZ2FtZSwgc28gdGhhdFxuICAgICAqIHNvbWUgcGxheWVycyBhcmUgdGVhbSBtYXRlcy5cbiAgICAgKiBcbiAgICAgKiBBIHBsYXllciBjYW4gb25seSBiZWxvbmcgdG8gYSBzaW5nbGUgdGVhbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBNYW5hZ2Vyc1xuICAgICAqIEBjbGFzcyBUZWFtTWFuYWdlclxuICAgICAqIEBuYW1lc3BhY2UgTWFuYWdlcnNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAZXh0ZW5kcyBNYW5hZ2VyXG4gICAgICovXG4gICAgdmFyIFRlYW1NYW5hZ2VyID0gZnVuY3Rpb24gVGVhbU1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgcGxheWVyc0J5VGVhbVxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwbGF5ZXJzQnlUZWFtID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgdGVhbUJ5UGxheWVyXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5IYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGVhbUJ5UGxheWVyID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuIHRlYW1CeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdGVhbSB0byBhIHBsYXllclxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllciwgdGVhbSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tVGVhbShwbGF5ZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0ZWFtQnlQbGF5ZXIucHV0KHBsYXllciwgdGVhbSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICBpZihwbGF5ZXJzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGxheWVycyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzQnlUZWFtLnB1dCh0ZWFtLCBwbGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllcnMuYWRkKHBsYXllcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRQbGF5ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSBCYWcgb2YgcGxheWVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRQbGF5ZXJzID0gZnVuY3Rpb24odGVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllcnNCeVRlYW0uZ2V0KHRlYW0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbVRlYW1cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllciBOYW1lIG9mIHRoZSBwbGF5ZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVRlYW0gPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGVhbUJ5UGxheWVyLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgaWYodGVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICAgICAgaWYocGxheWVycyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9OyBcblxuICAgIFRlYW1NYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGVhbU1hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZCBcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuICAgIH07XG4gICAgXG4gICAgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xufSkoKTsiLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7KGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBPYmplY3QgdG8gbWFuYWdlIGNvbXBvbmVudHNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtKF9hc3BlY3QpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgX2FzcGVjdCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGkgPSBlbnRpdGllcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZSgtLWkpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzKGVudGl0aWVzLmdldChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAgXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0oX2FzcGVjdCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBfYXNwZWN0KTtcbiAgICB9O1xuICAgIFxuICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgSW50ZXJ2YWxFbnRpdHlTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIEludGVydmFsRW50aXR5U3lzdGVtID0gZnVuY3Rpb24gSW50ZXJ2YWxFbnRpdHlTeXN0ZW0oX2FzcGVjdCwgX2ludGVydmFsKSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuICAgIH07XG4gICAgXG4gICAgSW50ZXJ2YWxFbnRpdHlTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVydmFsRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBBc3BlY3QgPSByZXF1aXJlKCcuLy4uL0FzcGVjdCcpLFxuICAgICAgICBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgVm9pZEVudGl0eVN5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZCBcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgVm9pZEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIFZvaWRFbnRpdHlTeXN0ZW0oX2FzcGVjdCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0RW1wdHkoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NTeXN0ZW0oKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvY2Vzc1N5c3RlbSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBWb2lkRW50aXR5U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWb2lkRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdGlvbiB0eXBlIGEgYml0IGxpa2UgQXJyYXlMaXN0IGJ1dCBkb2VzIG5vdCBwcmVzZXJ2ZSB0aGUgb3JkZXIgb2YgaXRzXG4gICAgICogZW50aXRpZXMsIHNwZWVkd2lzZSBpdCBpcyB2ZXJ5IGdvb2QsIGVzcGVjaWFsbHkgc3VpdGVkIGZvciBnYW1lcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBVdGlsc1xuICAgICAqIEBjbGFzcyBCYWdcbiAgICAgKiBAbmFtZXNwYWNlIFV0aWxzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIEJhZyA9IGZ1bmN0aW9uIEJhZygpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb250YWlucyBhbGwgb2YgdGhlIGVsZW1lbnRzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGF0YVxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBCYWcuIGRvZXMgdGhpcyBieVxuICAgICAgICAgKiBvdmVyd3JpdGluZyBpdCB3YXMgbGFzdCBlbGVtZW50IHRoZW4gcmVtb3ZpbmcgbGFzdCBlbGVtZW50XG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAgICAgKiBAcGFyYW0gTWl4ZWQgaW5kZXggdGhlIGluZGV4IG9mIGVsZW1lbnQgdG8gYmUgcmVtb3ZlZFxuICAgICAgICAgKiBAcmV0dXJuIE1peGVkIGVsZW1lbnQgdGhhdCB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBCYWdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICBpZih0eXBlb2YgaW5kZXggPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBkYXRhLmluZGV4T2YoaW5kZXgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZGF0YVtpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFuZCByZXR1cm4gdGhlIGxhc3Qgb2JqZWN0IGluIHRoZSBiYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUxhc3RcbiAgICAgICAgICogQHJldHVybiBNaXhlZCB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIGJhZywgbnVsbCBpZiBlbXB0eS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlTGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGRhdGFbZGF0YS5sZW5ndGgtMV07XG4gICAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoZGF0YS5sZW5ndGgtMSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGJhZyBjb250YWlucyB0aGlzIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29udGFpbnNcbiAgICAgICAgICogQHBhcmFtIE1peGVkXG4gICAgICAgICAqIEByZXR1cm4gTWl4ZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGFpbnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmluZGV4T2Yob2JqKSAhPT0gLTE7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBmcm9tIHRoaXMgQmFnIGFsbCBvZiBpdHMgZWxlbWVudHMgdGhhdCBhcmUgY29udGFpbmVkIGluIHRoZVxuICAgICAgICAgKiBzcGVjaWZpZWQgQmFnLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVBbGxcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IEJhZyBjb250YWluaW5nIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGlzIEJhZ1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoaXMgQmFnIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgdGhlIGNhbGwsIGVsc2UgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsID0gZnVuY3Rpb24oYmFnKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBuID0gYmFnLnNpemUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpICE9PSBuOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gYmFnLmdldChpKSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBkYXRhLmluZGV4T2Yob2JqKTtcblxuICAgICAgICAgICAgICAgIGlmKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbW9kaWZpZWQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIEJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBpbmRleCBvZiB0aGUgZWxlbWVudCB0byByZXR1cm5cbiAgICAgICAgICogQHJldHVybiBNaXhlZCB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIGJhZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaW5kZXhdID8gZGF0YVtpbmRleF0gOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2Qgc2l6ZVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0aGUgYmFnIGNhbiBob2xkIHdpdGhvdXQgZ3Jvd2luZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2FwYWNpdHlcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRoZSBiYWcgY2FuIGhvbGQgd2l0aG91dCBncm93aW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7IC8vIHNsaWdodGx5IGZpeGVkIF5eXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBpbnRlcm5hbCBzdG9yYWdlIHN1cHBvcnRzIHRoaXMgaW5kZXguXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzSW5kZXhXaXRoaW5Cb3VuZHNcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzSW5kZXhXaXRoaW5Cb3VuZHMgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4IDwgdGhpcy5nZXRDYXBhY2l0eSgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGxpc3QgY29udGFpbnMgbm8gZWxlbWVudHMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzRW1wdHlcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBpcyBlbXB0eSwgZWxzZSBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5sZW5ndGggPT09IDA7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgdG8gdGhlIGVuZCBvZiB0aGlzIGJhZy4gaWYgbmVlZGVkIGFsc29cbiAgICAgICAgICogaW5jcmVhc2VzIHRoZSBjYXBhY2l0eSBvZiB0aGUgYmFnLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRcbiAgICAgICAgICogQHBhcmFtIE1peGVkIGVsZW1lbnQgdG8gYmUgYWRkZWQgdG8gdGhpcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgZGF0YS5wdXNoKG9iaik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVsZW1lbnQgYXQgc3BlY2lmaWVkIGluZGV4IGluIHRoZSBiYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggcG9zaXRpb24gb2YgZWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0gTWl4ZWQgdGhlIGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24oaW5kZXgsIG9iaikge1xuICAgICAgICAgICAgZGF0YVtpbmRleF0gPSBvYmo7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTWV0aG9kIHZlcmlmeSB0aGUgY2FwYWNpdHkgb2YgdGhlIGJhZ1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbnN1cmVDYXBhY2l0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbnN1cmVDYXBhY2l0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8ganVzdCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG9yeWdpbmFsIGlkZWVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIGJhZy4gVGhlIGJhZyB3aWxsIGJlIGVtcHR5IGFmdGVyXG4gICAgICAgICAqIHRoaXMgY2FsbCByZXR1cm5zLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjbGVhclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhbGwgaXRlbXMgaW50byB0aGlzIGJhZy4gXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZEFsbFxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gYmFnIGFkZGVkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZEFsbCA9IGZ1bmN0aW9uKGJhZykge1xuICAgICAgICAgICAgdmFyIGkgPSBiYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoYmFnLmdldChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJhZztcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBAYXV0aG9yIGluZXhwbGljYWJsZVxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2luZXhwbGljYWJsZS9iaXRzZXRcbiAgICAgKi9cbiAgICAgICAgXG4gICAgLy9jb25zdHJ1Y3RvclxuICAgIHZhciBCaXRTZXQgPSBmdW5jdGlvbiBCaXRTZXQoKSB7XG4gICAgXG4gICAgICAgIC8vX3dvcmRzIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIDMyYml0cyBpbnRlZ2VycywgamF2YXNjcmlwdCBkb2Vzbid0IHJlYWxseSBoYXZlIGludGVnZXJzIHNlcGFyYXRlZCBmcm9tIE51bWJlciB0eXBlXG4gICAgICAgIC8vaXQncyBsZXNzIHBlcmZvcm1hbnQgYmVjYXVzZSBvZiB0aGF0LCBudW1iZXIgKGJ5IGRlZmF1bHQgZmxvYXQpIHdvdWxkIGJlIGludGVybmFsbHkgY29udmVydGVkIHRvIDMyYml0cyBpbnRlZ2VyIHRoZW4gYWNjZXB0cyB0aGUgYml0IG9wZXJhdGlvbnNcbiAgICAgICAgLy9jaGVja2VkIEJ1ZmZlciB0eXBlLCBidXQgbmVlZHMgdG8gaGFuZGxlIGV4cGFuc2lvbi9kb3duc2l6ZSBieSBhcHBsaWNhdGlvbiwgY29tcHJvbWlzZWQgdG8gdXNlIG51bWJlciBhcnJheSBmb3Igbm93LlxuICAgICAgICB0aGlzLl93b3JkcyA9IFtdO1xuICAgIH07XG4gICAgXG4gICAgdmFyIEJJVFNfT0ZfQV9XT1JEID0gMzIsXG4gICAgICAgIFNISUZUU19PRl9BX1dPUkQgPSA1O1xuICAgIFxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvc1xuICAgICAqIEByZXR1cm4ge051bWJlcn0gdGhlIGluZGV4IGF0IHRoZSB3b3JkcyBhcnJheVxuICAgICAqL1xuICAgIHZhciB3aGljaFdvcmQgPSBmdW5jdGlvbihwb3Mpe1xuICAgICAgICAvL2Fzc3VtZWQgcG9zIGlzIG5vbi1uZWdhdGl2ZSwgZ3VhcmRlZCBieSAjc2V0LCAjY2xlYXIsICNnZXQgZXRjLlxuICAgICAgICByZXR1cm4gcG9zID4+IFNISUZUU19PRl9BX1dPUkQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGEgYml0IG1hc2sgb2YgMzIgYml0cywgMSBiaXQgc2V0IGF0IHBvcyAlIDMyLCB0aGUgcmVzdCBiZWluZyAwXG4gICAgICovXG4gICAgdmFyIG1hc2sgPSBmdW5jdGlvbihwb3Mpe1xuICAgICAgICByZXR1cm4gMSA8PCAocG9zICYgMzEpO1xuICAgIH07XG4gICAgXG4gICAgQml0U2V0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihwb3MpIHtcbiAgICBcbiAgICAgICAgY29uc29sZS5hc3NlcnQgPyBjb25zb2xlLmFzc2VydChwb3MgPj0gMCwgXCJwb3NpdGlvbiBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKSA6IG51bGw7XG4gICAgXG4gICAgICAgIHZhciB3aGljaCA9IHdoaWNoV29yZChwb3MpLFxuICAgICAgICAgICAgd29yZHMgPSB0aGlzLl93b3JkcztcbiAgICAgICAgcmV0dXJuIHdvcmRzW3doaWNoXSA9IHdvcmRzW3doaWNoXSB8IG1hc2socG9zKTtcbiAgICB9O1xuICAgIFxuICAgIEJpdFNldC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihwb3MpIHtcbiAgICBcbiAgICAgICAgY29uc29sZS5hc3NlcnQocG9zID49IDAsIFwicG9zaXRpb24gbXVzdCBiZSBub24tbmVnYXRpdmVcIik7XG4gICAgXG4gICAgICAgIHZhciB3aGljaCA9IHdoaWNoV29yZChwb3MpLFxuICAgICAgICAgICAgd29yZHMgPSB0aGlzLl93b3JkcztcbiAgICAgICAgcmV0dXJuIHdvcmRzW3doaWNoXSA9IHdvcmRzW3doaWNoXSAmIH5tYXNrKHBvcyk7XG4gICAgfTtcbiAgICBcbiAgICBCaXRTZXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHBvcykge1xuICAgIFxuICAgICAgICBjb25zb2xlLmFzc2VydChwb3MgPj0gMCwgXCJwb3NpdGlvbiBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKTtcbiAgICBcbiAgICAgICAgdmFyIHdoaWNoID0gd2hpY2hXb3JkKHBvcyksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuICAgICAgICByZXR1cm4gd29yZHNbd2hpY2hdICYgbWFzayhwb3MpO1xuICAgIH07XG4gICAgXG4gICAgQml0U2V0LnByb3RvdHlwZS53b3JkcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd29yZHMubGVuZ3RoO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogY291bnQgYWxsIHNldCBiaXRzXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqXG4gICAgICogdGhpcyBpcyBtdWNoIGZhc3RlciB0aGFuIEJpdFNldCBsaWIgb2YgQ29mZmVlU2NyaXB0LCBpdCBmYXN0IHNraXBzIDAgdmFsdWUgd29yZHNcbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLmNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0LCBzdW0gPSAwLCBhcnJPZldvcmRzID0gdGhpcy5fd29yZHMsIG1heFdvcmRzID0gdGhpcy53b3JkcygpO1xuICAgICAgICBmb3IobmV4dCA9IDA7IG5leHQgPCBtYXhXb3JkczsgbmV4dCsrKXtcbiAgICAgICAgICAgIHZhciBuZXh0V29yZCA9IGFyck9mV29yZHNbbmV4dF0gfHwgMDtcbiAgICAgICAgICAgIC8vdGhpcyBsb29wcyBvbmx5IHRoZSBudW1iZXIgb2Ygc2V0IGJpdHMsIG5vdCAzMiBjb25zdGFudCBhbGwgdGhlIHRpbWUhXG4gICAgICAgICAgICBmb3IodmFyIGJpdHMgPSBuZXh0V29yZDsgYml0cyAhPT0gMDsgYml0cyAmPSAoYml0cyAtIDEpKXtcbiAgICAgICAgICAgICAgICBzdW0rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH07XG4gICAgXG4gICAgQml0U2V0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl93b3JkcyA9IFtdO1xuICAgIH07XG4gICAgXG4gICAgQml0U2V0LnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uKHNldCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gc2V0KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHZhciBuZXh0LCBjb21tb25zID0gTWF0aC5taW4odGhpcy53b3JkcygpLCBzZXQud29yZHMoKSk7XG4gICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCBjb21tb25zOyBuZXh0KyspIHtcbiAgICAgICAgICAgIHRoaXMuX3dvcmRzW25leHRdIHw9IHNldC5fd29yZHNbbmV4dF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbnMgPCBzZXQud29yZHMoKSkge1xuICAgICAgICAgICAgdGhpcy5fd29yZHMgPSB0aGlzLl93b3Jkcy5jb25jYXQoc2V0Ll93b3Jkcy5zbGljZShjb21tb25zLCBzZXQud29yZHMoKSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2V0XG4gICAgICogQHJldHVybiB7Qml0U2V0fSB0aGlzIEJpdFNldCBhZnRlciBhbmQgb3BlcmF0aW9uXG4gICAgICpcbiAgICAgKiB0aGlzIGlzIG11Y2ggbW9yZSBwZXJmb3JtYW50IHRoYW4gQ29mZmVlU2NyaXB0J3MgQml0U2V0I2FuZCBvcGVyYXRpb24gYmVjYXVzZSB3ZSdsbCBjaG9wIHRoZSB6ZXJvIHZhbHVlIHdvcmRzIGF0IHRhaWwuXG4gICAgICovXG4gICAgQml0U2V0LnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IHNldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdmFyIG5leHQsXG4gICAgICAgICAgICBjb21tb25zID0gTWF0aC5taW4odGhpcy53b3JkcygpLCBzZXQud29yZHMoKSksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuICAgIFxuICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgY29tbW9uczsgbmV4dCsrKSB7XG4gICAgICAgICAgICB3b3Jkc1tuZXh0XSAmPSBzZXQuX3dvcmRzW25leHRdO1xuICAgICAgICB9XG4gICAgICAgIGlmKGNvbW1vbnMgPiBzZXQud29yZHMoKSl7XG4gICAgICAgICAgICB2YXIgbGVuID0gY29tbW9ucyAtIHNldC53b3JkcygpO1xuICAgICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICAgICB3b3Jkcy5wb3AoKTsvL3VzaW5nIHBvcCBpbnN0ZWFkIG9mIGFzc2lnbiB6ZXJvIHRvIHJlZHVjZSB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheSwgYW5kIGZhc3RlbiB0aGUgc3Vic2VxdWVudCAjYW5kIG9wZXJhdGlvbnMuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICBCaXRTZXQucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uKHNldCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gc2V0KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHZhciBuZXh0LCBjb21tb25zID0gTWF0aC5taW4odGhpcy53b3JkcygpLCBzZXQud29yZHMoKSk7XG4gICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCBjb21tb25zOyBuZXh0KyspIHtcbiAgICAgICAgICAgIHRoaXMuX3dvcmRzW25leHRdIF49IHNldC5fd29yZHNbbmV4dF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbnMgPCBzZXQud29yZHMoKSkge1xuICAgICAgICAgICAgdGhpcy5fd29yZHMgPSB0aGlzLl93b3Jkcy5jb25jYXQoc2V0Ll93b3Jkcy5zbGljZShjb21tb25zLCBzZXQud29yZHMoKSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogdGhpcyBpcyB0aGUgY3JpdGljYWwgcGllY2UgbWlzc2luZyBmcm9tIENvZmZlZVNjcmlwdCdzIEJpdFNldCBsaWIsIHdlIHVzdWFsbHkganVzdCBuZWVkIHRvIGtub3cgdGhlIG5leHQgc2V0IGJpdCBpZiBhbnkuXG4gICAgICogaXQgZmFzdCBza2lwcyAwIHZhbHVlIHdvcmQgYXMgI2NhcmRpbmFsaXR5IGRvZXMsIHRoaXMgaXMgZXNwLiBpbXBvcnRhbnQgYmVjYXVzZSBvZiBvdXIgdXNhZ2UsIGFmdGVyIHNlcmllcyBvZiAjYW5kIG9wZXJhdGlvbnNcbiAgICAgKiBpdCdzIGhpZ2hseSBsaWtlbHkgdGhhdCBtb3N0IG9mIHRoZSB3b3JkcyBsZWZ0IGFyZSB6ZXJvIHZhbHVlZCwgYW5kIGJ5IHNraXBwaW5nIGFsbCBvZiBzdWNoLCB3ZSBjb3VsZCBsb2NhdGUgdGhlIGFjdHVhbCBiaXQgc2V0IG11Y2ggZmFzdGVyLlxuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICovXG4gICAgQml0U2V0LnByb3RvdHlwZS5uZXh0U2V0Qml0ID0gZnVuY3Rpb24ocG9zKXtcbiAgICBcbiAgICAgICAgY29uc29sZS5hc3NlcnQocG9zID49IDAsIFwicG9zaXRpb24gbXVzdCBiZSBub24tbmVnYXRpdmVcIik7XG4gICAgXG4gICAgICAgIHZhciBuZXh0ID0gd2hpY2hXb3JkKHBvcyksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuICAgICAgICAvL2JleW9uZCBtYXggd29yZHNcbiAgICAgICAgaWYobmV4dCA+PSB3b3Jkcy5sZW5ndGgpe1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhlIHZlcnkgZmlyc3Qgd29yZFxuICAgICAgICB2YXIgZmlyc3RXb3JkID0gd29yZHNbbmV4dF0sXG4gICAgICAgICAgICBtYXhXb3JkcyA9IHRoaXMud29yZHMoKSxcbiAgICAgICAgICAgIGJpdDtcbiAgICAgICAgaWYoZmlyc3RXb3JkKXtcbiAgICAgICAgICAgIGZvcihiaXQgPSBwb3MgJiAzMTsgYml0IDwgQklUU19PRl9BX1dPUkQ7IGJpdCArPSAxKXtcbiAgICAgICAgICAgICAgICBpZigoZmlyc3RXb3JkICYgbWFzayhiaXQpKSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobmV4dCA8PCBTSElGVFNfT0ZfQV9XT1JEKSArIGJpdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yKG5leHQgPSBuZXh0ICsgMTsgbmV4dCA8IG1heFdvcmRzOyBuZXh0ICs9IDEpe1xuICAgICAgICAgICAgdmFyIG5leHRXb3JkID0gd29yZHNbbmV4dF07XG4gICAgICAgICAgICBpZihuZXh0V29yZCl7XG4gICAgICAgICAgICAgICAgZm9yKGJpdCA9IDA7IGJpdCA8IEJJVFNfT0ZfQV9XT1JEOyBiaXQgKz0gMSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKChuZXh0V29yZCAmIG1hc2soYml0KSkgIT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuZXh0IDw8IFNISUZUU19PRl9BX1dPUkQpICsgYml0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KC0xLCBcIml0IHNob3VsZCBoYXZlIGZvdW5kIHNvbWUgYml0IGluIHRoaXMgd29yZDogXCIgKyBuZXh0V29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQW4gcmV2ZXJzZWQgbG9va3VwIGNvbXBhcmVkIHdpdGggI25leHRTZXRCaXRcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLnByZXZTZXRCaXQgPSBmdW5jdGlvbihwb3Mpe1xuICAgIFxuICAgICAgICBjb25zb2xlLmFzc2VydChwb3MgPj0gMCwgXCJwb3NpdGlvbiBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKTtcbiAgICBcbiAgICAgICAgdmFyIHByZXYgPSB3aGljaFdvcmQocG9zKSxcbiAgICAgICAgICAgIHdvcmRzID0gdGhpcy5fd29yZHM7XG4gICAgICAgIC8vYmV5b25kIG1heCB3b3Jkc1xuICAgICAgICBpZihwcmV2ID49IHdvcmRzLmxlbmd0aCl7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGUgdmVyeSBsYXN0IHdvcmRcbiAgICAgICAgdmFyIGxhc3RXb3JkID0gd29yZHNbcHJldl0sXG4gICAgICAgICAgICBiaXQ7XG4gICAgICAgIGlmKGxhc3RXb3JkKXtcbiAgICAgICAgICAgIGZvcihiaXQgPSBwb3MgJiAzMTsgYml0ID49MDsgYml0LS0pe1xuICAgICAgICAgICAgICAgIGlmKChsYXN0V29yZCAmIG1hc2soYml0KSkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHByZXYgPDwgU0hJRlRTX09GX0FfV09SRCkgKyBiaXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvcihwcmV2ID0gcHJldiAtIDE7IHByZXYgPj0gMDsgcHJldi0tKXtcbiAgICAgICAgICAgIHZhciBwcmV2V29yZCA9IHdvcmRzW3ByZXZdO1xuICAgICAgICAgICAgaWYocHJldldvcmQpe1xuICAgICAgICAgICAgICAgIGZvcihiaXQgPSBCSVRTX09GX0FfV09SRCAtIDE7IGJpdCA+PSAwOyBiaXQtLSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKChwcmV2V29yZCAmIG1hc2soYml0KSkgIT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmV2IDw8IFNISUZUU19PRl9BX1dPUkQpICsgYml0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KC0xLCBcIml0IHNob3VsZCBoYXZlIGZvdW5kIHNvbWUgYml0IGluIHRoaXMgd29yZDogXCIgKyBwcmV2V29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gICAgXG4gICAgQml0U2V0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKHJhZGl4KXtcbiAgICAgICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICAgICAgcmV0dXJuICdbJyArdGhpcy5fd29yZHMudG9TdHJpbmcoKSArICddJztcbiAgICB9O1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gQml0U2V0O1xufSkoKTsiLCIvKipcbiAqIEhhc2hNYXBcbiAqIEBhdXRob3IgQXJpZWwgRmxlc2xlciA8YWZsZXNsZXJAZ21haWwuY29tPlxuICogQHZlcnNpb24gMC45LjNcbiAqIERhdGU6IDQvMy8yMDEzXG4gKiBIb21lcGFnZTogaHR0cHM6Ly9naXRodWIuY29tL2ZsZXNsZXIvaGFzaG1hcFxuICovXG4oZnVuY3Rpb24oKXtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLyoqXG4gICAgICogSGFzaE1hcFxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAc3VibW9kdWxlIFV0aWxzXG4gICAgICogQGNsYXNzIEhhc2hNYXBcbiAgICAgKiBAbmFtZXNwYWNlIFV0aWxzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovICAgIFxuICAgIGZ1bmN0aW9uIEhhc2hNYXAoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0SGFzaE1hcC5wcm90b3R5cGUgPSB7XG5cdFx0Y29uc3RydWN0b3I6SGFzaE1hcCxcblxuXHRcdGdldDpmdW5jdGlvbihrZXkpIHtcblx0XHRcdHZhciBkYXRhID0gdGhpcy5fZGF0YVt0aGlzLmhhc2goa2V5KV07XG5cdFx0XHRyZXR1cm4gZGF0YSAmJiBkYXRhWzFdO1xuXHRcdH0sXG5cblx0XHRwdXQ6ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXHRcdFx0Ly8gU3RvcmUgb3JpZ2luYWwga2V5IGFzIHdlbGwgKGZvciBpdGVyYXRpb24pXG5cdFx0XHR0aGlzLl9kYXRhW3RoaXMuaGFzaChrZXkpXSA9IFtrZXksIHZhbHVlXTtcblx0XHR9LFxuXG5cdFx0Y29udGFpbnNLZXk6ZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5oYXNoKGtleSkgaW4gdGhpcy5fZGF0YTtcblx0XHR9LFxuXG5cdFx0cmVtb3ZlOmZ1bmN0aW9uKGtleSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuX2RhdGFbdGhpcy5oYXNoKGtleSldO1xuXHRcdH0sXG5cblx0XHR0eXBlOmZ1bmN0aW9uKGtleSkge1xuXHRcdFx0dmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChrZXkpO1xuXHRcdFx0dmFyIHR5cGUgPSBzdHIuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHQvLyBTb21lIGJyb3dzZXJzIHlpZWxkIERPTVdpbmRvdyBmb3IgbnVsbCBhbmQgdW5kZWZpbmVkLCB3b3JrcyBmaW5lIG9uIE5vZGVcblx0XHRcdGlmICh0eXBlID09PSAnZG9td2luZG93JyAmJiAha2V5KSB7XG5cdFx0XHRcdHJldHVybiBrZXkgKyAnJztcblx0XHRcdH1cblx0XHRcdHJldHVybiB0eXBlO1xuXHRcdH0sXG5cblx0XHRjb3VudDpmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuID0gMDtcblx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9kYXRhKSB7XG5cdFx0XHRcdG4rKztcblx0XHRcdH1cblx0XHRcdHJldHVybiBuO1xuXHRcdH0sXG5cblx0XHRjbGVhcjpmdW5jdGlvbigpIHtcblx0XHRcdC8vIFRPRE86IFdvdWxkIE9iamVjdC5jcmVhdGUobnVsbCkgbWFrZSBhbnkgZGlmZmVyZW5jZVxuXHRcdFx0dGhpcy5fZGF0YSA9IHt9O1xuXHRcdH0sXG5cblx0XHRoYXNoOmZ1bmN0aW9uKGtleSkge1xuXHRcdFx0c3dpdGNoICh0aGlzLnR5cGUoa2V5KSkge1xuXHRcdFx0XHRjYXNlICd1bmRlZmluZWQnOlxuXHRcdFx0XHRjYXNlICdudWxsJzpcblx0XHRcdFx0Y2FzZSAnYm9vbGVhbic6XG5cdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdGNhc2UgJ3JlZ2V4cCc6XG5cdFx0XHRcdFx0cmV0dXJuIGtleSArICcnO1xuXG5cdFx0XHRcdGNhc2UgJ2RhdGUnOlxuXHRcdFx0XHRcdHJldHVybiAnOicgKyBrZXkuZ2V0VGltZSgpO1xuXG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0cmV0dXJuICdcIicgKyBrZXk7XG5cblx0XHRcdFx0Y2FzZSAnYXJyYXknOlxuXHRcdFx0XHRcdHZhciBoYXNoZXMgPSBbXTtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleS5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHRcdGhhc2hlc1tpXSA9IHRoaXMuaGFzaChrZXlbaV0pO1xuXHRcdFx0XHRcdHJldHVybiAnWycgKyBoYXNoZXMuam9pbignfCcpO1xuXG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gVE9ETzogRG9uJ3QgdXNlIGV4cGFuZG9zIHdoZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IGlzIG5vdCBhdmFpbGFibGU/XG5cdFx0XHRcdFx0aWYgKCFrZXkuX2htdWlkXykge1xuXHRcdFx0XHRcdFx0a2V5Ll9obXVpZF8gPSArK0hhc2hNYXAudWlkO1xuXHRcdFx0XHRcdFx0aGlkZShrZXksICdfaG11aWRfJyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuICd7JyArIGtleS5faG11aWRfO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRmb3JFYWNoOmZ1bmN0aW9uKGZ1bmMpIHtcblx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9kYXRhKSB7XG5cdFx0XHRcdHZhciBkYXRhID0gdGhpcy5fZGF0YVtrZXldO1xuXHRcdFx0XHRmdW5jKGRhdGFbMV0sIGRhdGFbMF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRIYXNoTWFwLnVpZCA9IDA7XG5cblxuXHRmdW5jdGlvbiBoaWRlKG9iaiwgcHJvcCkge1xuXHRcdC8vIE1ha2Ugbm9uIGl0ZXJhYmxlIGlmIHN1cHBvcnRlZFxuXHRcdGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIHtlbnVtZXJhYmxlOmZhbHNlfSk7XG5cdFx0fVxuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBIYXNoTWFwO1xufSkoKTsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKGV2LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiJdfQ==
(1)
});
;