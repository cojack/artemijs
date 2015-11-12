(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ArtemiJS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./native/Object');
require('./native/Array');
require('./native/Math');
require('./native/Number');

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
         * @property {Number} version
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
        HashMap: require('./utils/HashMap'),
        Timer: require('./utils/Timer')
    };

    ArtemiJS.Aspect = require('./Aspect');
    ArtemiJS.Component = require('./Component');
    ArtemiJS.ComponentManager = require('./ComponentManager');
    ArtemiJS.ComponentMapper = require('./ComponentMapper');
    ArtemiJS.ComponentType = require('./ComponentType');
    ArtemiJS.Entity = require('./Entity');
    ArtemiJS.EntityManager = require('./EntityManager');
    ArtemiJS.EntityObserver = require('./EntityObserver');
    ArtemiJS.EntitySystem = require('./EntitySystem');
    ArtemiJS.Manager = require('./Manager');
    ArtemiJS.World = require('./World');

    module.exports = ArtemiJS;
})();
},{"./Aspect":2,"./Component":3,"./ComponentManager":4,"./ComponentMapper":5,"./ComponentType":6,"./Entity":7,"./EntityManager":8,"./EntityObserver":9,"./EntitySystem":10,"./Manager":11,"./World":12,"./managers/GroupManager":13,"./managers/PlayerManager":14,"./managers/TagManager":15,"./managers/TeamManager":16,"./native/Array":17,"./native/Math":18,"./native/Number":19,"./native/Object":20,"./systems/DelayedEntityProcessingSystem":21,"./systems/EntityProcessingSystem":22,"./systems/IntervalEntityProcessingSystem":23,"./systems/IntervalEntitySystem":24,"./systems/VoidEntitySystem":25,"./utils/Bag":26,"./utils/BitSet":27,"./utils/HashMap":28,"./utils/Timer":29}],2:[function(require,module,exports){
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
     * Aspect.getAspectForAll(A.klass, B.klass, C.klass)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V.
     * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass)
     * 
     * This creates an aspect where an entity must possess A and B and C, but must not possess U or V, but must possess one of X or Y or Z.
     * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass).one(X.klass, Y.klass, Z.klass)
     *
     * You can create and compose aspects in many ways:
     * Aspect.getEmpty().one(X.klass, Y.klass, Z.klass).all(A.klass, B.klass, C.klass).exclude(U.klass, V.klass)
     * is the same as:
     * Aspect.getAspectForAll(A.klass, B.klass, C.klass).exclude(U.klass, V.klass).one(X.klass, Y.klass, Z.klass)
     * 
     * @module ArtemiJS
     * @class Aspect
     * @constructor
     */
    var Aspect = function Aspect() {
        
        /**
         * @private
         * @property allSet
         * @type {BitSet}
         */
        var allSet = new BitSet(),
        
        /**
         * @private
         * @property exclusionSet
         * @type {BitSet}
         */        
        exclusionSet = new BitSet(),
            
        /**
         * @private
         * @property exclusionSet
         * @type {BitSet}
         */                
        oneSet = new BitSet();
            
        /**
         * @method getAllSet
         * @return {BitSet}
         */
        this.getAllSet = function() {
            return allSet;
        };
        
        /**
         * @method getExclusionSet
         * @return {BitSet}
         */
        this.getExclusionSet = function() {
            return exclusionSet;
        };
        
        /**
         * @method getOneSet
         * @return {BitSet}
         */
        this.getOneSet = function() {
            return oneSet;
        };
        
        /**
         * Returns an aspect where an entity must possess all of the specified component types.
         * 
         * @method all
         * @param {...string} type - a required component type
         * @return {Aspect}
         */
        this.all = function(type) {
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
         * @param {...string} type - component type to exclude
         * @return {Aspect}
         */
        this.exclude = function(type) {
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
         * @param {...string} type - one of the types the entity must possess
         * @return {Aspect}
         */
        this.one = function(type) {
            var len = arguments.length;
            while(len--) {
                oneSet.set(ComponentType.getIndexFor(arguments[len]));
            }
            return this;
        };
    };

    /**
     * Creates an aspect where an entity must possess all of the specified component types.
     *
     * @method getAspectForAll
     * @param {...string} type - a required component type
     * @return {Aspect} an aspect that can be matched against entities
     */
    Aspect.getAspectForAll = function(type) {
        var aspect = new Aspect();
        aspect.all(arguments);
        return aspect;
    };


    /**
     * Creates an aspect where an entity must possess one of the specified component types.
     *
     * @method getAspectForOne
     * @param {...string} type - one of the types the entity must possess
     * @return {Aspect} an aspect that can be matched against entities
     */
    Aspect.getAspectForOne = function(type) {
        var aspect = new Aspect();
        aspect.one(arguments);
        return aspect;
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
     * @return {Aspect} an empty Aspect that will reject all entities.
     */
    Aspect.getEmpty = function() {
        return new Aspect();
    };

    module.exports = Aspect;
})();
},{"./ComponentType":6,"./utils/BitSet":27}],3:[function(require,module,exports){
(function() {
    'use strict';
    
    /**
     * A tag class. All components in the system must extend this class.
     * 
     * @module ArtemiJS
     * @class Component
     * @constructor
     */
    function Component() {}

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
         * @type {Bag}
         */
        var componentsByType = new Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {Bag}
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
         * @param {Bag} fillBag Bag of components
         * @return {Bag} Bag of components
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
    ComponentManager.prototype.constructor = ComponentManager;
    module.exports = ComponentManager;
})();
},{"./Manager":11,"./utils/Bag":26}],5:[function(require,module,exports){
(function() {
    'use strict';

    var Component = require('./Component'),
        /**
         *
         * @var ComponentType ComponentType
         */
        ComponentType = require('./ComponentType');

    /**
     * High performance component retrieval from entities. Use this wherever you
     * need to retrieve components from entities often and fast.
     * 
     * @module ArtemiJS
     * @class ComponentMapper
     * @constructor
     * @param {Object} _type
     * @param {World} _world
     */
    var ComponentMapper = function ComponentMapper(_type, _world) {
        Component.call(this);
        
        /**
         * @private
         * @property {ComponentType} type Type of component
         */
        var type = ComponentType.getTypeFor(_type),
        
        /**
         * @private
         * @param {Bag} components Bag of components
         */
        components = _world.getComponentManager().getComponentsByType(type);
            
        /**
         * Fast but unsafe retrieval of a component for this entity.
         * No bounding checks, so this could return null,
         * however in most scenarios you already know the entity possesses this component.
         * 
         * @method get
         * @param entity Entity
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
         * @param entity Entity
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
     * @param {World} world the world that this component mapper should use
     * @return {ComponentMapper}
     */
    ComponentMapper.getFor = function(type, world) {
        return new ComponentMapper(type, world);
    };
    
    ComponentMapper.prototype = Object.create(Component.prototype);
    ComponentMapper.prototype.constructor = ComponentMapper;
    module.exports = ComponentMapper;
})();
},{"./Component":3,"./ComponentType":6}],6:[function(require,module,exports){
(function() {
    'use strict';
    
    var HashMap = require('./utils/HashMap'),
        INDEX = 0,
        componentTypes = new HashMap();
    
    /**
     * 
     * @static
     * @class ComponentType
     */
    var ComponentType = function ComponentType(_type) {
        
        /**
         * @private
         * @property type
         * @type {ArtemiJS.Component}
         */
        var type = _type,
        
        /**
         * @private
         * @property index
         * @type {Number}
         */
        index = INDEX++;

        this.getIndex = function() {
            return index;
        };

        this.toString = function() {
            return "ComponentType["+type.getSimpleName()+"] ("+index+")";
        };
    };

    /**
     *
     *
     */
    ComponentType.getTypeFor = function(component) {
        var _type = componentTypes.get(component);
        if(!_type) {
            _type =  new ComponentType(_type);
            componentTypes.put(component, _type);
        }
        return _type;
    };

    /**
     *
     */
    ComponentType.getIndexFor = function(component) {
        return this.getTypeFor(component).getIndex();
    };

    
    module.exports = ComponentType;
})();
},{"./utils/HashMap":28}],7:[function(require,module,exports){
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
    function Entity(_world, _id) {
        
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
            systemBits.clear();
            componentBits.clear();
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
         * @method deleteFromWorld
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
            world.enableEntity(this);
        };
        
        /**
         * Disable the entity from being processed. Won't delete it, it will
         * continue to exist but won't get processed.
         * 
         * @method disable
         */
        this.disable = function() {
            world.disableEntity(this);
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
         * @return {World} world of entities.
         */
        this.getWorld = function() {
            return world;
        };
    }

    module.exports = Entity;
})();
},{"./ComponentType":6,"./utils/BitSet":27}],8:[function(require,module,exports){
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
         * @type {Bag}
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
        active = 0,
        
        /**
         * @private
         * @property added
         * @type {Number}
         */
        added = 0,
        
        /**
         * @private
         * @property created
         * @type {Number}
         */
        created = 0,
        
        /**
         * @private
         * @property deleted
         * @type {Number}
         */
        deleted = 0,
        
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
        this.initialize = function() {};
        
        /**
         * Create new entity instance
         * 
         * @method createEntityInstance
         * @return {Entity}
         */
        this.createEntityInstance = function() {
            var entity = new Entity(this.world, identifierPool.checkOut());
            ++created;
            return entity;
        };
        
        /**
         * Set entity as added for future process
         * 
         * @method added
         * @param {Entity} entity
         */
        this.added = function(entity) {
            ++active;
            ++added;
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

            --active;
            ++deleted;
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
         * @method getEntity
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
                return ++nextAvailableId;
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
    EntityManager.prototype.constructor = EntityManager;
    module.exports = EntityManager;
})();
},{"./Entity":7,"./Manager":11,"./utils/Bag":26,"./utils/BitSet":27}],9:[function(require,module,exports){
(function() {
    'use strict';
    
    /**
     * The entity observer class.
     * 
     * @module ArtemiJS
     * @class EntityObserver
     * @constructor
     */ 
    function EntityObserver() {
        
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
    }
    
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
     * @param {Aspect} aspect Creates an entity system that uses the specified
     *      aspect as a matcher against entities.
     */
    var EntitySystem = function EntitySystem(aspect) {
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
        var systemIndex = SystemIndexManager.getIndexFor(this.getClass());
        
        /**
         * @private
         * @property actives
         * @type {Bag}
         */
        var actives = new Bag();
        
        /**
         * @private
         * @property allSet
         * @type {BitSet}
         */
        var allSet = aspect.getAllSet();
        
        /**
         * @private
         * @property exclusionSet
         * @type {BitSet}
         */
        var exclusionSet = aspect.getExclusionSet();
        
        /**
         * @private
         * @property oneSet
         * @type {BitSet}
         */
        var oneSet = aspect.getOneSet();
        
        /**
         * @private
         * @property passive
         * @type {Boolean}
         */
        var passive;
        
        /**
         * @private
         * @property dummy
         * @type {Boolean}
         */
        var dummy = allSet.isEmpty() && oneSet.isEmpty();

        var me = this;
        
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
         * @param {Boolean} _passive
         */
        this.setPassive = function(_passive) {
            passive = _passive;
        };
        
        /**
         * @method getActives
         * @return {Bag} actives
         */
        this.getActives = function() {
            return actives;
        };
    };
    
    EntitySystem.prototype = Object.create(EntityObserver.prototype);
    EntitySystem.prototype.constructor = EntitySystem;
    module.exports = EntitySystem;
})();
},{"./EntityObserver":9,"./utils/Bag":26}],11:[function(require,module,exports){
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
    Manager.prototype.constructor = Manager;
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
    function World() {

        console.info("Welcome to ArtemiJS, component oriented framework!");
        
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
         * @type {Bag}
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
         * @type {Bag}
         */
        systemsBag = new Bag(),
    
        /**
         * @private
         * @property added
         * @type {Bag}
         */
        added = new Bag(),
        
        /**
         * @private
         * @property changed
         * @type {Bag}
         */
        changed = new Bag(),
        
        /**
         * @private
         * @property deleted
         * @type {Bag}
         */
        deleted = new Bag(),
        
        /**
         * @private
         * @property enable
         * @type {Bag}
         */
        enable = new Bag(),
        
        /**
         * @private
         * @property disable
         * @type {Bag}
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
            console.timeStamp("Managers initialization");
            console.groupCollapsed("Managers initialization");
            var i = managersBag.size();
            while(i--) {
                managersBag.get(i).initialize();

            }
            i = systemsBag.size();
            while(i--) {
                systemsBag.get(i).initialize();
            }
            console.groupEnd();
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
            console.timeStamp("set manager");
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
            console.timeStamp("create entity");
            return entityManager.createEntityInstance();
        };
        
        /**
         * Get a entity having the specified id.
         * 
         * @method getEntity
         * @param {Number} id entity id
         * @return {Entity} entity
         */
        this.getEntity = function(id) {
            return entityManager.getEntity(id);
        };
        
        /**
         * Gives you all the systems in this world for possible iteration.
         * 
         * @method getSystems
         * @return {*} all entity systems in world, other false
         */
        this.getSystems = function() {
            return systemsBag;
        };
        
        /**
         * Adds a system to this world that will be processed by World.process()
         * 
         * @method setSystem
         * @param {EntitySystem} system the system to add.
         * @param {Boolean} [passive] whether or not this system will be processed by World.process()
         * @return {EntitySystem} the added system.
         */
        this.setSystem = function(system, passive) {
            console.timeStamp("set system");
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
            console.timeStamp("notify systems");
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
            console.timeStamp("notify managers");
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
         * @param {Bag} entities
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
            console.timeStamp("process everything");
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
    }
    
    module.exports = World;
})();
},{"./ComponentManager":4,"./ComponentMapper":5,"./EntityManager":8,"./utils/Bag":26}],13:[function(require,module,exports){
'use strict';

var Bag = require('./../utils/Bag'),
    Manager = require('./../Manager');

/**
 * If you need to group your entities together, e.g. tanks going into
 * "units" group or explosions into "effects",
 * then use this manager. You must retrieve it using world instance.
 *
 * A entity can be assigned to more than one group.
 *
 * @module ArtemiJS
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
     * @type {Map}
     */
    var entitiesByGroup = new Map(),

    /**
     * @private
     * @property groupsByEntity
     * @type {Map}
     */
    groupsByEntity = new Map();

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
        console.assert(!!entity, "Entity is null or undefined");
        console.assert(group.length > 0, "Group is empty");

        var entities = entitiesByGroup.get(group);
        if(!entities) {
            entities = new Bag();
            entitiesByGroup.set(group, entities);
        }
        entities.add(entity);

        var groups = groupsByEntity.get(entity);
        if(!groups) {
            groups = new Bag();
            groupsByEntity.set(entity, groups);
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
        console.assert(!!entity, "Entity is null or undefined");
        console.assert(group.length > 0, "Group is empty");
        var entities = entitiesByGroup.get(group);
        if(entities) {
            entities.delete(entity);
        }

        var groups = groupsByEntity.get(entity);
        if(groups) {
            groups.delete(group);
        }
    };

    /**
     * Remove the entity from the all groups.
     *
     * @method removeFromAllGroups
     * @param {Entity} entity to remove from the group
     */
    this.removeFromAllGroups = function(entity) {
        console.assert(!!entity, "Entity is null or undefined");
        var groups = groupsByEntity.get(entity);
        if(!groups) {
            return;
        }
        var i = groups.size();
        while(i--) {
            var entities = entitiesByGroup.get(groups.get(i));
            if(entities) {
                entities.remove(entity);
            }
        }
        groups.clear();
    };

    /**
     * Get all entities that belong to the provided group.
     *
     * @method getEntities
     * @param {String} group name of the group
     * @return {Bag} entities
     */
    this.getEntities = function(group) {
        console.assert(group.length > 0, "Group is empty");
        var entities = entitiesByGroup.get(group);
        if(!entities) {
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
        console.assert(!!entity, "Entity is null or undefined");
        return groupsByEntity.get(entity);
    };

    /**
     * Check is Entity in any group
     *
     * @param {Entity} entity
     * @returns {boolean}
     */
    this.isInAnyGroup = function(entity) {
        console.assert(!!entity, "Entity is null or undefined");
        return groupsByEntity.has(entity);
    };

    /**
     * Check if entity is in group
     *
     * @param {Entity} entity
     * @param {String} group
     * @returns {boolean}
     */
    this.isInGroup = function(entity, group) {
        console.assert(!!entity, "Entity is null or undefined");
        if(!group) {
            return false;
        }
        var groups = groupsByEntity.get(entity);
        var i = groups.size();
        while(i--) {
            if(group === groups.get(i)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Remove entity from all groups related to
     *
     * @param entity
     */
    this.deleted = function(entity) {
        console.assert(!!entity, "Entity is null or undefined");
        this.removeFromAllGroups(entity);
    };
};

GroupManager.prototype = Object.create(Manager.prototype);
GroupManager.prototype.constructor = GroupManager;
module.exports = GroupManager;
},{"./../Manager":11,"./../utils/Bag":26}],14:[function(require,module,exports){
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
    PlayerManager.prototype.constructor = PlayerManager;
    module.exports = PlayerManager;
})();
},{"./../Manager":11,"./../utils/Bag":26,"./../utils/HashMap":28}],15:[function(require,module,exports){
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

        this.initialize = function() {};
    }; 

    TagManager.prototype = Object.create(Manager.prototype);
    TagManager.prototype.constructor = TagManager;
    module.exports = TagManager;
})();
},{"./../Manager":11,"./../utils/HashMap":28}],16:[function(require,module,exports){
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
    TeamManager.prototype.constructor = TeamManager;
    module.exports = TeamManager;
})();
},{"./../Manager":11,"./../utils/Bag":26,"./../utils/HashMap":28}],17:[function(require,module,exports){
Array.prototype.get = function(index) {
  return this[index];
};

Array.prototype.set = function(index, value) {
  this[index] = value;
};
},{}],18:[function(require,module,exports){
/**
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
};
},{}],19:[function(require,module,exports){
/**
 * Returns the number of zero bits following the lowest-order ("rightmost")
 * one-bit in the two's complement binary representation of the specified
 * {@code long} value.  Returns 64 if the specified value has no
 * one-bits in its two's complement representation, in other words if it is
 * equal to zero.
 *
 * @param {Number} i
 * @return {Number} the number of zero bits following the lowest-order ("rightmost")
 *     one-bit in the two's complement binary representation of the
 *     specified {@code long} value, or 64 if the value is equal
 *     to zero.
 * @since 1.5
 * @see http://grepcode.com/file_/repository.grepcode.com/java/root/jdk/openjdk/6-b14/java/lang/Long.java/?v=source
 */
Number.prototype.numberOfTrailingZeros = function(i) {
    var x, y;
    if (i === 0) return 64;
    var n = 63;
    y = parseInt(i); if (y !== 0) { n = n -32; x = y; } else x = parseInt(i>>>32);
    y = x <<16; if (y !== 0) { n = n -16; x = y; }
    y = x << 8; if (y !== 0) { n = n - 8; x = y; }
    y = x << 4; if (y !== 0) { n = n - 4; x = y; }
    y = x << 2; if (y !== 0) { n = n - 2; x = y; }
    return n - ((x << 1) >>> 31);
};

/**
 * Returns the number of zero bits preceding the highest-order
 * ("leftmost") one-bit in the two's complement binary representation
 * of the specified {@code long} value.  Returns 64 if the
 * specified value has no one-bits in its two's complement representation,
 * in other words if it is equal to zero.
 *
 * <p>Note that this method is closely related to the logarithm base 2.
 * For all positive {@code long} values x:
 * <ul>
 * <li>floor(log<sub>2</sub>(x)) = {@code 63 - numberOfLeadingZeros(x)}
 * <li>ceil(log<sub>2</sub>(x)) = {@code 64 - numberOfLeadingZeros(x - 1)}
 * </ul>
 *
 * @param {Number} i
 * @return {Number} the number of zero bits preceding the highest-order
 *     ("leftmost") one-bit in the two's complement binary representation
 *     of the specified {@code long} value, or 64 if the value
 *     is equal to zero.
 * @since 1.5
 * @see http://grepcode.com/file_/repository.grepcode.com/java/root/jdk/openjdk/6-b14/java/lang/Long.java/?v=source
 */
Number.prototype.numberOfLeadingZeros = function(i) {
    if (i === 0)
        return 64;
    var n = 1;
    var x = parseInt(i >>> 32);
    if (x === 0) { n += 32; x = parseInt(i); }
    if (x >>> 16 === 0) { n += 16; x <<= 16; }
    if (x >>> 24 === 0) { n +=  8; x <<=  8; }
    if (x >>> 28 === 0) { n +=  4; x <<=  4; }
    if (x >>> 30 === 0) { n +=  2; x <<=  2; }
    n -= x >>> 31;
    return n;
};
},{}],20:[function(require,module,exports){
Object.defineProperty(Object.prototype, "klass", {
    get: function () {
        'use strict';
        return this.name;
    }
});

Object.prototype.getClass = function() {
    'use strict';
    return this.constructor.name;
};
},{}],21:[function(require,module,exports){
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
    DelayedEntityProcessingSystem.prototype.constructor = DelayedEntityProcessingSystem;
    module.exports = DelayedEntityProcessingSystem;
})();
},{"./../EntitySystem":10}],22:[function(require,module,exports){
(function() {
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

        /**
         *
         * @param {Entity} entity
         */
        this.innerProcess = function(entity) {
            // litle difference between original framework, js doesn't allow to overload methods :<
        };

        /**
         *
         * @param {Bag} entities
         */
        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };
        
        this.checkProcessing = function() {
            return true;   
        };
    };
    
    EntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    EntityProcessingSystem.prototype.constructor = EntityProcessingSystem;
    module.exports = EntityProcessingSystem;
})();
},{"./../EntitySystem":10}],23:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * If you need to process entities at a certain interval then use this.
     * A typical usage would be to regenerate ammo or health at certain intervals, no need
     * to do that every game loop, but perhaps every 100 ms. or every second.
     * 
     * @module ArtemiJS
     * @class IntervalEntityProcessingSystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified
     *      aspect as a matcher against entities.
     *
     * @author Arni Arent
     */
    var IntervalEntityProcessingSystem = function IntervalEntityProcessingSystem(_aspect, interval) {
        EntitySystem.call(this, _aspect, interval);

        this.innerProcess = function(entity) {};

        this.processEntities = function(entities) {
            var i = entities.size();
            while(i--) {
                this.innerProcess(entities.get(i));
            }
        };
    };
    
    IntervalEntityProcessingSystem.prototype = Object.create(EntitySystem.prototype);
    IntervalEntityProcessingSystem.prototype.constructor = IntervalEntityProcessingSystem;
    module.exports = IntervalEntityProcessingSystem;
})();
},{"./../EntitySystem":10}],24:[function(require,module,exports){
(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * A system that processes entities at a interval in milliseconds.
     * A typical usage would be a collision system or physics system.
     * 
     * @module ArtemiJS
     * @class IntervalEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     * @author Arni Arent
     */
    var IntervalEntitySystem = function IntervalEntitySystem(_aspect, _interval) {

        var acc;

        var interval = _interval;

        EntitySystem.call(this, _aspect);

        this.checkProcessing = function() {
            acc += this.world.getDelta();
            if(acc >= interval) {
                acc -= interval;
                return true;
            }
            return false;
        };
    };
    
    IntervalEntitySystem.prototype = Object.create(EntitySystem.prototype);
    IntervalEntitySystem.prototype.constructor = IntervalEntitySystem;
    module.exports = IntervalEntitySystem;
})();
},{"./../EntitySystem":10}],25:[function(require,module,exports){
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
    VoidEntitySystem.prototype.constructor = VoidEntitySystem;
    module.exports = VoidEntitySystem;
})();
},{"./../Aspect":2,"./../EntitySystem":10}],26:[function(require,module,exports){
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
    function Bag() {
        
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
         * @param  {*} index the index of element to be removed
         * @return {*} element that was removed from the Bag
         */
        this.remove = function(index) {
            var response = true;
            if(typeof index === 'object') {
                index = data.indexOf(index);
            }
            if(typeof index === 'number' && index !== -1) {
                response = data.splice(index, 1)[0] || null;
            } else {
                response = null;
            }
            console.assert(response !== null, "Are you sure there wasn't an element in the bag?");
            return response;
        };
        
        /**
         * Remove and return the last object in the bag.
         * 
         * @method removeLast
         * @return {*|null} the last object in the bag, null if empty.
         */
        this.removeLast = function() {
            if(data.length) {
                return data.pop();
            }
            return null;
        };
        
        /**
         * Check if bag contains this element.
         *
         * @method contains
         * @param {*} obj
         * @return {boolean}
         */
        this.contains = function(obj) {
            return data.indexOf(obj) !== -1;
        };
        
        /**
         * Removes from this Bag all of its elements that are contained in the
         * specified Bag.
         * 
         * @method removeAll
         * @param {Bag} bag containing elements to be removed from this Bag
         * @return {boolean} true if this Bag changed as a result of the call, else false
         */
        this.removeAll = function(bag) {
            var modified = false,
                n = bag.size();
            for (var i = 0; i !== n; ++i) {
                var obj = bag.get(i);

                if(this.remove(obj)) {
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
         * @return {*|null} the element at the specified position in bag or null
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
        this.getCapacity = function() {
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
         * @param {*} obj element to be added to this list
         */
        this.add = function(obj) {
            data.push(obj);
        };
        
        /**
         * Set element at specified index in the bag. New index will destroy size
         * 
         * @method set
         * @param {Number} index index position of element
         * @param {*} obj the element
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
            data.length = 0;
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
    }
    
    module.exports = Bag;
}());
},{}],27:[function(require,module,exports){
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
        return this._words[whichWord(pos)] |= mask(pos);
    };

    /**
     * This method sets the bit specified by the index to false.
     *
     * @param pos
     * @returns {number}
     */
    BitSet.prototype.clear = function(pos) {
        if(!pos) {
            return this.reset();
        }
        return this._words[whichWord(pos)] &= ~mask(pos);
    };

    /**
     * This method returns the value of the bit with the specified index.
     *
     * @param pos {number} bit index
     * @returns {number}
     */
    BitSet.prototype.get = function(pos) {
        return this._words[whichWord(pos)] & mask(pos);
    };

    /**
     * This method returns the "logical size" of this BitSet: the index of the highest set bit in the BitSet plus one.
     *
     * @returns {Number}
     */
    BitSet.prototype.words = function() {
        return this._words.length;
    };

    /**
     * This method returns true if this BitSet contains no bits that are set to true.
     *
     * @returns {boolean}
     */
    BitSet.prototype.isEmpty = function () {
        return !this._words.length;
    };

    /**
     * This method returns the number of bits set to true in this BitSet.
     * Is much faster than BitSet lib of CoffeeScript, it fast skips 0 value words.
     *
     * @return {Number}
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

    /**
     * This method returns boolean indicating whether this BitSet intersects the specified BitSet.
     *
     * @param {BitSet} bitSet
     * @returns {boolean}
     */
    BitSet.prototype.intersects = function(bitSet) {
        for (var i = Math.min(this._words, bitSet._words) - 1; i >= 0; --i) {
            if ((this._words[i] & bitSet._words[i]) !== 0) {
                return true;
            }
        }
        return false;
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
},{}],28:[function(require,module,exports){
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
     *
     * @see http://stackoverflow.com/questions/18638900/javascript-crc32/18639999#18639999
     */
    function HashMap() {

        var data = [],
            _length = 0;

        Object.defineProperty(this, "length", {
            get: function() { return _length; }
        });

        function crcTable(){
            var c;
            var crc = [];
            for(var n =0; n < 256; n++){
                c = n;
                for(var k =0; k < 8; k++){
                    c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                }
                crc[n] = c;
            }
            return crc;
        }

        /**
         * This method generate crc32 exactly from string
         *
         * @param key
         * @returns {number}
         */
        function hash(key) {
            var str = JSON.stringify(key);
            var crc = 0 ^ (-1);

            for (var i = 0; i < str.length; i++ ) {
                crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
            }

            return (crc ^ (-1)) >>> 0;
        }

        /**
         * Get value for a key
         *
         * @param key
         * @returns {*|null} For false returns null
         */
        this.get = function(key) {
            return data[hash(key)] || null;
        };

        /**
         * Set value for a specific key
         *
         * @param {*} key
         * @param {*} value
         * @returns {HashMap}
         */
        this.put = function(key, value) {
            console.assert(!!key, "key is null or undefined");
            data[hash(key)] = value;
            ++_length;
            return this;
        };


        /**
         * Check that key exist
         *
         * @param {*} key
         * @returns {boolean}
         */
        this.containsKey = function(key) {
            return data.indexOf(hash(key)) !== -1;
        };

        /**
         * Remove value from specific key
         *
         * @param {*} key
         * @returns {HashMap}
         */
        this.remove = function(key) {
            var idx = data.indexOf(hash(key));
            if(idx !== -1) {
                data.splice(idx, 1);
                --_length;
            }
            return this;
        };

        /**
         * Get size
         *
         * @returns {number}
         */
        this.count = function() {
            return _length;
        };

        /**
         * Remove all data
         *
         * @returns {HashMap}
         */
        this.clear = function() {
            data.length = 0;
            data = [];
            _length = 0;
            return this;
        };
	}

	module.exports = HashMap;
})();
},{}],29:[function(require,module,exports){
(function() {
    'use strict';

    /**
     * @property delay
     * @private
     * @type {Number}
     */
    var delay;

    /**
     * @property repeat
     * @private
     * @type {boolean}
     */
    var repeat;

    /**
     * @property acc
     * @private
     * @type {Number}
     */
    var acc;

    /**
     * @property done
     * @private
     * @type {boolean}
     */
    var done;

    /**
     * @property stopped
     * @private
     * @type {boolean}
     */
    var stopped;


    /**
     * Timer
     *
     * @class Timer
     * @namespace Utils
     * @module ArtemiJS
     * @submodule Utils
     * @param {Number} _delay
     * @param {boolean} _repeat
     * @constructor
     */
    var Timer = function Timer(_delay, _repeat) {
        delay = _delay;
        repeat = _repeat || false;
        acc = 0;

        /**
         * Update timer
         *
         * @param delta
         */
        this.update = function(delta) {
            if(!done && !stoped) {
                acc += delta;
                if (acc >= delay) {
                    acc -= delay;

                    if (repeat) {
                        this.reset();
                    } else {
                        done = true;
                    }

                    this.execute();
                }
            }
        };

        /**
         * Reset timer
         */
        this.reset = function() {
            stopped = false;
            done = false;
            acc = 0;
        };

        /**
         * Returns true if is done otherwise false
         *
         * @returns {boolean}
         */
        this.isDone = function() {
            return done;
        };

        /**
         * Returns true if is running otherwise false
         *
         * @returns {boolean}
         */
        this.isRunning = function() {
            return !done && acc < delay && !stopped;
        };

        /**
         * Stop timer
         */
        this.stop = function() {
            stopped = true;
        };

        /**
         *
         * @param _delay
         */
        this.setDelay = function(_delay) {
            delay = _delay;
        };

        this.execute = function() {};

        /**
         *
         * @returns {number}
         */
        this.getPercentageRemaining = function() {
            if (done)
                return 100;
            else if (stopped)
                return 0;
            else
                return 1 - (delay - acc) / delay;
        };

        /**
         *
         * @returns {Number}
         */
        this.getDelay = function() {
            return delay;
        };

    };

    module.exports = Timer;
})();
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQXJ0ZW1pLmpzIiwic3JjL0FzcGVjdC5qcyIsInNyYy9Db21wb25lbnQuanMiLCJzcmMvQ29tcG9uZW50TWFuYWdlci5qcyIsInNyYy9Db21wb25lbnRNYXBwZXIuanMiLCJzcmMvQ29tcG9uZW50VHlwZS5qcyIsInNyYy9FbnRpdHkuanMiLCJzcmMvRW50aXR5TWFuYWdlci5qcyIsInNyYy9FbnRpdHlPYnNlcnZlci5qcyIsInNyYy9FbnRpdHlTeXN0ZW0uanMiLCJzcmMvTWFuYWdlci5qcyIsInNyYy9Xb3JsZC5qcyIsInNyYy9tYW5hZ2Vycy9Hcm91cE1hbmFnZXIuanMiLCJzcmMvbWFuYWdlcnMvUGxheWVyTWFuYWdlci5qcyIsInNyYy9tYW5hZ2Vycy9UYWdNYW5hZ2VyLmpzIiwic3JjL21hbmFnZXJzL1RlYW1NYW5hZ2VyLmpzIiwic3JjL25hdGl2ZS9BcnJheS5qcyIsInNyYy9uYXRpdmUvTWF0aC5qcyIsInNyYy9uYXRpdmUvTnVtYmVyLmpzIiwic3JjL25hdGl2ZS9PYmplY3QuanMiLCJzcmMvc3lzdGVtcy9EZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL0VudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVN5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL1ZvaWRFbnRpdHlTeXN0ZW0uanMiLCJzcmMvdXRpbHMvQmFnLmpzIiwic3JjL3V0aWxzL0JpdFNldC5qcyIsInNyYy91dGlscy9IYXNoTWFwLmpzIiwic3JjL3V0aWxzL1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vbmF0aXZlL09iamVjdCcpO1xucmVxdWlyZSgnLi9uYXRpdmUvQXJyYXknKTtcbnJlcXVpcmUoJy4vbmF0aXZlL01hdGgnKTtcbnJlcXVpcmUoJy4vbmF0aXZlL051bWJlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGhpcyBmaWxlIGhhdmUgdG8gYmUgaW5jbHVkZWQgZmlyc3QgaW4geXVpY29tcHJlc3NvclxuXG4gICAgLyoqXG4gICAgICogRW50aXR5IEZyYW1ld29ya1xuICAgICAqXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBBcnRlbWlKU1xuICAgICAqIEBtYWluIEFydGVtaUpTXG4gICAgICovXG4gICAgdmFyIEFydGVtaUpTID0ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge051bWJlcn0gdmVyc2lvblxuICAgICAgICAgKi9cbiAgICAgICAgdmVyc2lvbjogMC4xLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge1N0cmluZ30gc291cmNlXG4gICAgICAgICAqL1xuICAgICAgICBzb3VyY2U6ICdodHRwczovL2dpdGh1Yi5jb20vY29qYWNrL2FydGVtaWpzJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtTdHJpbmd9IGxpY2Vuc2VcbiAgICAgICAgICovXG4gICAgICAgIGxpY2Vuc2U6ICdHUEx2MicsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBlbnZcbiAgICAgICAgICovXG4gICAgICAgIGVudjogMSAvLyAxIC0gZGV2LCAyIC0gdGVzdCwgNCAtIHByb2RcbiAgICB9O1xuXG4gICAgQXJ0ZW1pSlMuTWFuYWdlcnMgPSB7XG4gICAgICAgIEdyb3VwTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9Hcm91cE1hbmFnZXInKSxcbiAgICAgICAgUGxheWVyTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9QbGF5ZXJNYW5hZ2VyJyksXG4gICAgICAgIFRhZ01hbmFnZXI6IHJlcXVpcmUoJy4vbWFuYWdlcnMvVGFnTWFuYWdlcicpLFxuICAgICAgICBUZWFtTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9UZWFtTWFuYWdlcicpXG4gICAgfTtcblxuICAgIEFydGVtaUpTLlN5c3RlbXMgPSB7XG4gICAgICAgIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0nKSxcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0VudGl0eVByb2Nlc3NpbmdTeXN0ZW0nKSxcbiAgICAgICAgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEludGVydmFsRW50aXR5U3lzdGVtOiByZXF1aXJlKCcuL3N5c3RlbXMvSW50ZXJ2YWxFbnRpdHlTeXN0ZW0nKSxcbiAgICAgICAgVm9pZEVudGl0eVN5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL1ZvaWRFbnRpdHlTeXN0ZW0nKVxuICAgIH07XG5cbiAgICBBcnRlbWlKUy5VdGlscyA9IHtcbiAgICAgICAgQmFnOiByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBCaXRTZXQ6IHJlcXVpcmUoJy4vdXRpbHMvQml0U2V0JyksXG4gICAgICAgIEhhc2hNYXA6IHJlcXVpcmUoJy4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBUaW1lcjogcmVxdWlyZSgnLi91dGlscy9UaW1lcicpXG4gICAgfTtcblxuICAgIEFydGVtaUpTLkFzcGVjdCA9IHJlcXVpcmUoJy4vQXNwZWN0Jyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Db21wb25lbnQnKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50TWFwcGVyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYXBwZXInKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnRUeXBlID0gcmVxdWlyZSgnLi9Db21wb25lbnRUeXBlJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5ID0gcmVxdWlyZSgnLi9FbnRpdHknKTtcbiAgICBBcnRlbWlKUy5FbnRpdHlNYW5hZ2VyID0gcmVxdWlyZSgnLi9FbnRpdHlNYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5T2JzZXJ2ZXIgPSByZXF1aXJlKCcuL0VudGl0eU9ic2VydmVyJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBBcnRlbWlKUy5NYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuV29ybGQgPSByZXF1aXJlKCcuL1dvcmxkJyk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFydGVtaUpTO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEJpdFNldCA9IHJlcXVpcmUoJy4vdXRpbHMvQml0U2V0JyksXG4gICAgICAgIENvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcblxuICAgIC8qKlxuICAgICAqIEFuIEFzcGVjdHMgaXMgdXNlZCBieSBzeXN0ZW1zIGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLCB0byBjaGVjayBpZiBhIHN5c3RlbSBpc1xuICAgICAqIGludGVyZXN0ZWQgaW4gYW4gZW50aXR5LiBBc3BlY3RzIGRlZmluZSB3aGF0IHNvcnQgb2YgY29tcG9uZW50IHR5cGVzIGFuIGVudGl0eSBtdXN0XG4gICAgICogcG9zc2Vzcywgb3Igbm90IHBvc3Nlc3MuXG4gICAgICogXG4gICAgICogVGhpcyBjcmVhdGVzIGFuIGFzcGVjdCB3aGVyZSBhbiBlbnRpdHkgbXVzdCBwb3NzZXNzIEEgYW5kIEIgYW5kIEM6XG4gICAgICogQXNwZWN0LmdldEFzcGVjdEZvckFsbChBLmtsYXNzLCBCLmtsYXNzLCBDLmtsYXNzKVxuICAgICAqIFxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBBIGFuZCBCIGFuZCBDLCBidXQgbXVzdCBub3QgcG9zc2VzcyBVIG9yIFYuXG4gICAgICogQXNwZWN0LmdldEFzcGVjdEZvckFsbChBLmtsYXNzLCBCLmtsYXNzLCBDLmtsYXNzKS5leGNsdWRlKFUua2xhc3MsIFYua2xhc3MpXG4gICAgICogXG4gICAgICogVGhpcyBjcmVhdGVzIGFuIGFzcGVjdCB3aGVyZSBhbiBlbnRpdHkgbXVzdCBwb3NzZXNzIEEgYW5kIEIgYW5kIEMsIGJ1dCBtdXN0IG5vdCBwb3NzZXNzIFUgb3IgViwgYnV0IG11c3QgcG9zc2VzcyBvbmUgb2YgWCBvciBZIG9yIFouXG4gICAgICogQXNwZWN0LmdldEFzcGVjdEZvckFsbChBLmtsYXNzLCBCLmtsYXNzLCBDLmtsYXNzKS5leGNsdWRlKFUua2xhc3MsIFYua2xhc3MpLm9uZShYLmtsYXNzLCBZLmtsYXNzLCBaLmtsYXNzKVxuICAgICAqXG4gICAgICogWW91IGNhbiBjcmVhdGUgYW5kIGNvbXBvc2UgYXNwZWN0cyBpbiBtYW55IHdheXM6XG4gICAgICogQXNwZWN0LmdldEVtcHR5KCkub25lKFgua2xhc3MsIFkua2xhc3MsIFoua2xhc3MpLmFsbChBLmtsYXNzLCBCLmtsYXNzLCBDLmtsYXNzKS5leGNsdWRlKFUua2xhc3MsIFYua2xhc3MpXG4gICAgICogaXMgdGhlIHNhbWUgYXM6XG4gICAgICogQXNwZWN0LmdldEFzcGVjdEZvckFsbChBLmtsYXNzLCBCLmtsYXNzLCBDLmtsYXNzKS5leGNsdWRlKFUua2xhc3MsIFYua2xhc3MpLm9uZShYLmtsYXNzLCBZLmtsYXNzLCBaLmtsYXNzKVxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQXNwZWN0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIEFzcGVjdCA9IGZ1bmN0aW9uIEFzcGVjdCgpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWxsU2V0XG4gICAgICAgICAqIEB0eXBlIHtCaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWxsU2V0ID0gbmV3IEJpdFNldCgpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBleGNsdXNpb25TZXRcbiAgICAgICAgICogQHR5cGUge0JpdFNldH1cbiAgICAgICAgICovICAgICAgICBcbiAgICAgICAgZXhjbHVzaW9uU2V0ID0gbmV3IEJpdFNldCgpLFxuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZXhjbHVzaW9uU2V0XG4gICAgICAgICAqIEB0eXBlIHtCaXRTZXR9XG4gICAgICAgICAqLyAgICAgICAgICAgICAgICBcbiAgICAgICAgb25lU2V0ID0gbmV3IEJpdFNldCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEFsbFNldFxuICAgICAgICAgKiBAcmV0dXJuIHtCaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEFsbFNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFsbFNldDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEV4Y2x1c2lvblNldFxuICAgICAgICAgKiBAcmV0dXJuIHtCaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEV4Y2x1c2lvblNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGV4Y2x1c2lvblNldDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldE9uZVNldFxuICAgICAgICAgKiBAcmV0dXJuIHtCaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldE9uZVNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9uZVNldDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFzcGVjdCB3aGVyZSBhbiBlbnRpdHkgbXVzdCBwb3NzZXNzIGFsbCBvZiB0aGUgc3BlY2lmaWVkIGNvbXBvbmVudCB0eXBlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWxsXG4gICAgICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSB0eXBlIC0gYSByZXF1aXJlZCBjb21wb25lbnQgdHlwZVxuICAgICAgICAgKiBAcmV0dXJuIHtBc3BlY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFsbCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBhbGxTZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IoYXJndW1lbnRzW2xlbl0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4Y2x1ZGVzIGFsbCBvZiB0aGUgc3BlY2lmaWVkIGNvbXBvbmVudCB0eXBlcyBmcm9tIHRoZSBhc3BlY3QuIEEgc3lzdGVtIHdpbGwgbm90IGJlXG4gICAgICAgICAqIGludGVyZXN0ZWQgaW4gYW4gZW50aXR5IHRoYXQgcG9zc2Vzc2VzIG9uZSBvZiB0aGUgc3BlY2lmaWVkIGV4Y2x1c2lvbiBjb21wb25lbnQgdHlwZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGV4Y2x1ZGVcbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHR5cGUgLSBjb21wb25lbnQgdHlwZSB0byBleGNsdWRlXG4gICAgICAgICAqIEByZXR1cm4ge0FzcGVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhjbHVkZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBleGNsdXNpb25TZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IoYXJndW1lbnRzW2xlbl0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3Mgb25lIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBvbmVcbiAgICAgICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHR5cGUgLSBvbmUgb2YgdGhlIHR5cGVzIHRoZSBlbnRpdHkgbXVzdCBwb3NzZXNzXG4gICAgICAgICAqIEByZXR1cm4ge0FzcGVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25lID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIG9uZVNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcihhcmd1bWVudHNbbGVuXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgYWxsIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRBc3BlY3RGb3JBbGxcbiAgICAgKiBAcGFyYW0gey4uLnN0cmluZ30gdHlwZSAtIGEgcmVxdWlyZWQgY29tcG9uZW50IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtBc3BlY3R9IGFuIGFzcGVjdCB0aGF0IGNhbiBiZSBtYXRjaGVkIGFnYWluc3QgZW50aXRpZXNcbiAgICAgKi9cbiAgICBBc3BlY3QuZ2V0QXNwZWN0Rm9yQWxsID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICBhc3BlY3QuYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBvbmUgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvck9uZVxuICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSB0eXBlIC0gb25lIG9mIHRoZSB0eXBlcyB0aGUgZW50aXR5IG11c3QgcG9zc2Vzc1xuICAgICAqIEByZXR1cm4ge0FzcGVjdH0gYW4gYXNwZWN0IHRoYXQgY2FuIGJlIG1hdGNoZWQgYWdhaW5zdCBlbnRpdGllc1xuICAgICAqL1xuICAgIEFzcGVjdC5nZXRBc3BlY3RGb3JPbmUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBhc3BlY3QgPSBuZXcgQXNwZWN0KCk7XG4gICAgICAgIGFzcGVjdC5vbmUoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIGFzcGVjdDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gZW1wdHkgYXNwZWN0LiBUaGlzIGNhbiBiZSB1c2VkIGlmIHlvdSB3YW50IGEgc3lzdGVtIHRoYXQgcHJvY2Vzc2VzIG5vIGVudGl0aWVzLCBidXRcbiAgICAgKiBzdGlsbCBnZXRzIGludm9rZWQuIFR5cGljYWwgdXNhZ2VzIGlzIHdoZW4geW91IG5lZWQgdG8gY3JlYXRlIHNwZWNpYWwgcHVycG9zZSBzeXN0ZW1zIGZvciBkZWJ1ZyByZW5kZXJpbmcsXG4gICAgICogbGlrZSByZW5kZXJpbmcgRlBTLCBob3cgbWFueSBlbnRpdGllcyBhcmUgYWN0aXZlIGluIHRoZSB3b3JsZCwgZXRjLlxuICAgICAqIFxuICAgICAqIFlvdSBjYW4gYWxzbyB1c2UgdGhlIGFsbCwgb25lIGFuZCBleGNsdWRlIG1ldGhvZHMgb24gdGhpcyBhc3BlY3QsIHNvIGlmIHlvdSB3YW50ZWQgdG8gY3JlYXRlIGEgc3lzdGVtIHRoYXRcbiAgICAgKiBwcm9jZXNzZXMgb25seSBlbnRpdGllcyBwb3NzZXNzaW5nIGp1c3Qgb25lIG9mIHRoZSBjb21wb25lbnRzIEEgb3IgQiBvciBDLCB0aGVuIHlvdSBjYW4gZG86XG4gICAgICogQXNwZWN0LmdldEVtcHR5KCkub25lKEEsQixDKTtcbiAgICAgKiBcbiAgICAgKiBAbWV0aG9kIGdldEVtcHR5XG4gICAgICogQHJldHVybiB7QXNwZWN0fSBhbiBlbXB0eSBBc3BlY3QgdGhhdCB3aWxsIHJlamVjdCBhbGwgZW50aXRpZXMuXG4gICAgICovXG4gICAgQXNwZWN0LmdldEVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXNwZWN0KCk7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gQXNwZWN0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIC8qKlxuICAgICAqIEEgdGFnIGNsYXNzLiBBbGwgY29tcG9uZW50cyBpbiB0aGUgc3lzdGVtIG11c3QgZXh0ZW5kIHRoaXMgY2xhc3MuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBDb21wb25lbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBDb21wb25lbnQoKSB7fVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKCcuL01hbmFnZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBPYmplY3QgdG8gbWFuYWdlIGNvbXBvbmVudHNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIENvbXBvbmVudE1hbmFnZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgQ29tcG9uZW50TWFuYWdlciA9IGZ1bmN0aW9uIENvbXBvbmVudE1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50c0J5VHlwZVxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNvbXBvbmVudHNCeVR5cGUgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGV0ZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZWQgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVtb3ZlQ29tcG9uZW50c09mRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudEJpdHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNvbXBvbmVudEJpdHMubmV4dFNldEJpdCgwKTsgaSA+PSAwOyBpID0gY29tcG9uZW50Qml0cy5uZXh0U2V0Qml0KGkrMSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLmdldChpKS5zZXQoZW50aXR5LmdldElkKCksIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Qml0cy5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBjb21wb25lbnQgYnkgdHlwZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRDb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudFR5cGV9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUsIGNvbXBvbmVudCkgeyAgICAgICAgXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICBpZihjb21wb25lbnRzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuc2V0KHR5cGUuZ2V0SW5kZXgoKSwgY29tcG9uZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudHMuc2V0KGVudGl0eS5nZXRJZCgpLCBjb21wb25lbnQpO1xuICAgIFxuICAgICAgICAgICAgZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5zZXQodHlwZS5nZXRJbmRleCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgY29tcG9uZW50IGJ5IHR5cGVcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUNvbXBvbmVudCA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xuICAgICAgICAgICAgaWYoZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5nZXQodHlwZS5nZXRJbmRleCgpKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSkuc2V0KGVudGl0eS5nZXRJZCgpLCBudWxsKTtcbiAgICAgICAgICAgICAgICBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpLmNsZWFyKHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNvbXBvbmVudCBieSB0eXBlXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNCeVR5cGVcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJhZ30gQmFnIG9mIGNvbXBvbmVudHNcbiAgICAgICAgICovICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzQnlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5VHlwZS5zZXQodHlwZS5nZXRJbmRleCgpLCBjb21wb25lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEByZXR1cm4gTWl4ZWQgQ29tcG9uZW50IG9uIHN1Y2Nlc3MsIG51bGwgb24gZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IGNvbXBvbmVudHNCeVR5cGUuZ2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgICAgICBpZihjb21wb25lbnRzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHMuZ2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnQgZm9yXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNGb3JcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gZmlsbEJhZyBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKiBAcmV0dXJuIHtCYWd9IEJhZyBvZiBjb21wb25lbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudHNGb3IgPSBmdW5jdGlvbihlbnRpdHksIGZpbGxCYWcpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRCaXRzID0gZW50aXR5LmdldENvbXBvbmVudEJpdHMoKTtcbiAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoMCk7IGkgPj0gMDsgaSA9IGNvbXBvbmVudEJpdHMubmV4dFNldEJpdChpKzEpKSB7XG4gICAgICAgICAgICAgICAgZmlsbEJhZy5hZGQoY29tcG9uZW50c0J5VHlwZS5nZXQoaSkuZ2V0KGVudGl0eS5nZXRJZCgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmaWxsQmFnO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBlbnRpdHkgdG8gZGVsZXRlIGNvbXBvbmVuZXRzIG9mIHRoZW1cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGRlbGV0ZWQuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xlYW4gZGVsZXRlZCBjb21wb25lbmV0cyBvZiBlbnRpdGllc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjbGVhblxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoZGVsZXRlZC5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgZGVsZXRlZC5zaXplKCkgPiBpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ29tcG9uZW50c09mRW50aXR5KGRlbGV0ZWQuZ2V0KGkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlZC5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgQ29tcG9uZW50TWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbiAgICBDb21wb25lbnRNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbXBvbmVudE1hbmFnZXI7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4vQ29tcG9uZW50JyksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAdmFyIENvbXBvbmVudFR5cGUgQ29tcG9uZW50VHlwZVxuICAgICAgICAgKi9cbiAgICAgICAgQ29tcG9uZW50VHlwZSA9IHJlcXVpcmUoJy4vQ29tcG9uZW50VHlwZScpO1xuXG4gICAgLyoqXG4gICAgICogSGlnaCBwZXJmb3JtYW5jZSBjb21wb25lbnQgcmV0cmlldmFsIGZyb20gZW50aXRpZXMuIFVzZSB0aGlzIHdoZXJldmVyIHlvdVxuICAgICAqIG5lZWQgdG8gcmV0cmlldmUgY29tcG9uZW50cyBmcm9tIGVudGl0aWVzIG9mdGVuIGFuZCBmYXN0LlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50TWFwcGVyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IF90eXBlXG4gICAgICogQHBhcmFtIHtXb3JsZH0gX3dvcmxkXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudE1hcHBlciA9IGZ1bmN0aW9uIENvbXBvbmVudE1hcHBlcihfdHlwZSwgX3dvcmxkKSB7XG4gICAgICAgIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7Q29tcG9uZW50VHlwZX0gdHlwZSBUeXBlIG9mIGNvbXBvbmVudFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHR5cGUgPSBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IoX3R5cGUpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBjb21wb25lbnRzIEJhZyBvZiBjb21wb25lbnRzXG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRzID0gX3dvcmxkLmdldENvbXBvbmVudE1hbmFnZXIoKS5nZXRDb21wb25lbnRzQnlUeXBlKHR5cGUpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYXN0IGJ1dCB1bnNhZmUgcmV0cmlldmFsIG9mIGEgY29tcG9uZW50IGZvciB0aGlzIGVudGl0eS5cbiAgICAgICAgICogTm8gYm91bmRpbmcgY2hlY2tzLCBzbyB0aGlzIGNvdWxkIHJldHVybiBudWxsLFxuICAgICAgICAgKiBob3dldmVyIGluIG1vc3Qgc2NlbmFyaW9zIHlvdSBhbHJlYWR5IGtub3cgdGhlIGVudGl0eSBwb3NzZXNzZXMgdGhpcyBjb21wb25lbnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFxuICAgICAgICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Db21wb25lbnR9fG51bGxcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cy5nZXQoZW50aXR5LmdldElkKCkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhc3QgYW5kIHNhZmUgcmV0cmlldmFsIG9mIGEgY29tcG9uZW50IGZvciB0aGlzIGVudGl0eS5cbiAgICAgICAgICogSWYgdGhlIGVudGl0eSBkb2VzIG5vdCBoYXZlIHRoaXMgY29tcG9uZW50IHRoZW4gbnVsbCBpcyByZXR1cm5lZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U2FmZVxuICAgICAgICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Db21wb25lbnR9fG51bGxcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U2FmZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cy5pc0luZGV4V2l0aGluQm91bmRzKGVudGl0eS5nZXRJZCgpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRzLmdldChlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVja3MgaWYgdGhlIGVudGl0eSBoYXMgdGhpcyB0eXBlIG9mIGNvbXBvbmVudC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaGFzXG4gICAgICAgICAqIEBwYXJhbSB7QXJ0ZW1pSlMuRW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHJldHVybiBib29sZWFuIHRydWUgaWYgdGhlIGVudGl0eSBoYXMgdGhpcyBjb21wb25lbnQgdHlwZSwgZmFsc2UgaWYgaXQgZG9lc24ndC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaGFzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTYWZlKGVudGl0eSkgIT09IG51bGw7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY29tcG9uZW50IG1hcHBlciBmb3IgdGhpcyB0eXBlIG9mIGNvbXBvbmVudHMuXG4gICAgICogXG4gICAgICogQG1ldGhvZCBnZXRGb3JcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHR5cGUgdGhlIHR5cGUgb2YgY29tcG9uZW50cyB0aGlzIG1hcHBlciB1c2VzXG4gICAgICogQHBhcmFtIHtXb3JsZH0gd29ybGQgdGhlIHdvcmxkIHRoYXQgdGhpcyBjb21wb25lbnQgbWFwcGVyIHNob3VsZCB1c2VcbiAgICAgKiBAcmV0dXJuIHtDb21wb25lbnRNYXBwZXJ9XG4gICAgICovXG4gICAgQ29tcG9uZW50TWFwcGVyLmdldEZvciA9IGZ1bmN0aW9uKHR5cGUsIHdvcmxkKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWFwcGVyKHR5cGUsIHdvcmxkKTtcbiAgICB9O1xuICAgIFxuICAgIENvbXBvbmVudE1hcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuICAgIENvbXBvbmVudE1hcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wb25lbnRNYXBwZXI7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRNYXBwZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuL3V0aWxzL0hhc2hNYXAnKSxcbiAgICAgICAgSU5ERVggPSAwLFxuICAgICAgICBjb21wb25lbnRUeXBlcyA9IG5ldyBIYXNoTWFwKCk7XG4gICAgXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBjbGFzcyBDb21wb25lbnRUeXBlXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudFR5cGUgPSBmdW5jdGlvbiBDb21wb25lbnRUeXBlKF90eXBlKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHR5cGVcbiAgICAgICAgICogQHR5cGUge0FydGVtaUpTLkNvbXBvbmVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciB0eXBlID0gX3R5cGUsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGluZGV4XG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBpbmRleCA9IElOREVYKys7XG5cbiAgICAgICAgdGhpcy5nZXRJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkNvbXBvbmVudFR5cGVbXCIrdHlwZS5nZXRTaW1wbGVOYW1lKCkrXCJdIChcIitpbmRleCtcIilcIjtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKlxuICAgICAqL1xuICAgIENvbXBvbmVudFR5cGUuZ2V0VHlwZUZvciA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICB2YXIgX3R5cGUgPSBjb21wb25lbnRUeXBlcy5nZXQoY29tcG9uZW50KTtcbiAgICAgICAgaWYoIV90eXBlKSB7XG4gICAgICAgICAgICBfdHlwZSA9ICBuZXcgQ29tcG9uZW50VHlwZShfdHlwZSk7XG4gICAgICAgICAgICBjb21wb25lbnRUeXBlcy5wdXQoY29tcG9uZW50LCBfdHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90eXBlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqL1xuICAgIENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZUZvcihjb21wb25lbnQpLmdldEluZGV4KCk7XG4gICAgfTtcblxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50VHlwZTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgQml0U2V0ID0gcmVxdWlyZSgnLi91dGlscy9CaXRTZXQnKSxcbiAgICAgICAgQ29tcG9uZW50VHlwZSA9IHJlcXVpcmUoJy4vQ29tcG9uZW50VHlwZScpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGVudGl0eSBjbGFzcy4gQ2Fubm90IGJlIGluc3RhbnRpYXRlZCBvdXRzaWRlIHRoZSBmcmFtZXdvcmssIHlvdSBtdXN0XG4gICAgICogY3JlYXRlIG5ldyBlbnRpdGllcyB1c2luZyBXb3JsZC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7V29ybGR9IF93b3JsZFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBfaWRcbiAgICAgKi8gXG4gICAgZnVuY3Rpb24gRW50aXR5KF93b3JsZCwgX2lkKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHV1aWRcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciB1dWlkLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRCaXRzXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRCaXRzID0gbmV3IEJpdFNldCgpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtQml0c1xuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgc3lzdGVtQml0cyA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgd29ybGRcbiAgICAgICAgICogQHR5cGUge1dvcmxkfVxuICAgICAgICAgKi9cbiAgICAgICAgd29ybGQgPSBfd29ybGQsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGlkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBpZCA9IF9pZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7RW50aXR5TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIGVudGl0eU1hbmFnZXIgPSB3b3JsZC5nZXRFbnRpdHlNYW5hZ2VyKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudE1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge0NvbXBvbmVudE1hbmFnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRNYW5hZ2VyID0gd29ybGQuZ2V0Q29tcG9uZW50TWFuYWdlcigpO1xuICAgICAgICBcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgaW50ZXJuYWwgaWQgZm9yIHRoaXMgZW50aXR5IHdpdGhpbiB0aGUgZnJhbWV3b3JrLiBObyBvdGhlciBlbnRpdHlcbiAgICAgICAgICogd2lsbCBoYXZlIHRoZSBzYW1lIElELCBidXQgSUQncyBhcmUgaG93ZXZlciByZXVzZWQgc28gYW5vdGhlciBlbnRpdHkgbWF5XG4gICAgICAgICAqIGFjcXVpcmUgdGhpcyBJRCBpZiB0aGUgcHJldmlvdXMgZW50aXR5IHdhcyBkZWxldGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRJZFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldElkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIEJpdFNldCBpbnN0YW5jZSBjb250YWluaW5nIGJpdHMgb2YgdGhlIGNvbXBvbmVudHMgdGhlIGVudGl0eSBwb3NzZXNzZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudEJpdHNcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRCaXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50Qml0cztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgQml0U2V0IGluc3RhbmNlIGNvbnRhaW5pbmcgYml0cyBvZiB0aGUgY29tcG9uZW50cyB0aGUgZW50aXR5IHBvc3Nlc3Nlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U3lzdGVtQml0c1xuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFN5c3RlbUJpdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzeXN0ZW1CaXRzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBzeXN0ZW1zIEJpdFNldFxuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCByZXNldFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgICBzeXN0ZW1CaXRzLmNsZWFyKCk7XG4gICAgICAgICAgICBjb21wb25lbnRCaXRzLmNsZWFyKCk7XG4gICAgICAgICAgICB1dWlkID0gTWF0aC51dWlkKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWtlIGVudGl0eSByZWFkeSBmb3IgcmUtdXNlLlxuICAgICAgICAgKiBXaWxsIGdlbmVyYXRlIGEgbmV3IHV1aWQgZm9yIHRoZSBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkVudGl0eSBbXCIgKyBpZCArIFwiXVwiO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhIGNvbXBvbmVudCB0byB0aGlzIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkQ29tcG9uZW50XG4gICAgICAgICAqIEBjaGFpbmFibGVcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudFR5cGV9IFt0eXBlXVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQsIHR5cGUpIHtcbiAgICAgICAgICAgIGlmKCEodHlwZSBpbnN0YW5jZW9mIENvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IENvbXBvbmVudFR5cGUuZ2V0VHlwZUZvcihjb21wb25lbnQuZ2V0Q2xhc3MoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnRNYW5hZ2VyLmFkZENvbXBvbmVudCh0aGlzLCB0eXBlLCBjb21wb25lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGNvbXBvbmVudCBieSBpdHMgdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBbY29tcG9uZW50XVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRUeXBlO1xuICAgICAgICAgICAgaWYoIShjb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUgPSBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudE1hbmFnZXIucmVtb3ZlQ29tcG9uZW50KHRoaXMsIGNvbXBvbmVudFR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGUgZW50aXR5IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCBhbmQgaGFzIG5vdCBiZWVuIGRlbGV0ZWQgZnJvbSBpdC5cbiAgICAgICAgICogSWYgdGhlIGVudGl0eSBoYXMgYmVlbiBkaXNhYmxlZCB0aGlzIHdpbGwgc3RpbGwgcmV0dXJuIHRydWUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzQWN0aXZlXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5pc0FjdGl2ZSh0aGlzLmlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGlzRW5hYmxlZFxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VuYWJsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHlNYW5hZ2VyLmlzRW5hYmxlZCh0aGlzLmlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGlzIHRoZSBwcmVmZXJyZWQgbWV0aG9kIHRvIHVzZSB3aGVuIHJldHJpZXZpbmcgYSBjb21wb25lbnQgZnJvbSBhXG4gICAgICAgICAqIGVudGl0eS4gSXQgd2lsbCBwcm92aWRlIGdvb2QgcGVyZm9ybWFuY2UuXG4gICAgICAgICAqIEJ1dCB0aGUgcmVjb21tZW5kZWQgd2F5IHRvIHJldHJpZXZlIGNvbXBvbmVudHMgZnJvbSBhbiBlbnRpdHkgaXMgdXNpbmdcbiAgICAgICAgICogdGhlIENvbXBvbmVudE1hcHBlci5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gW3R5cGVdXG4gICAgICAgICAqICAgICAgaW4gb3JkZXIgdG8gcmV0cmlldmUgdGhlIGNvbXBvbmVudCBmYXN0IHlvdSBtdXN0IHByb3ZpZGUgYVxuICAgICAgICAgKiAgICAgIENvbXBvbmVudFR5cGUgaW5zdGFuY2UgZm9yIHRoZSBleHBlY3RlZCBjb21wb25lbnQuXG4gICAgICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkNvbXBvbmVudH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50ID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgICBpZighKHR5cGUgaW5zdGFuY2VvZiBDb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUgPSBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IodHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudE1hbmFnZXIuZ2V0Q29tcG9uZW50KHRoaXMsIGNvbXBvbmVudFR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBiYWcgb2YgYWxsIGNvbXBvbmVudHMgdGhpcyBlbnRpdHkgaGFzLlxuICAgICAgICAgKiBZb3UgbmVlZCB0byByZXNldCB0aGUgYmFnIHlvdXJzZWxmIGlmIHlvdSBpbnRlbmQgdG8gZmlsbCBpdCBtb3JlIHRoYW4gb25jZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50c1xuICAgICAgICAgKiBAcGFyYW0ge1V0aWxzLkJhZ30gZmlsbEJhZyB0aGUgYmFnIHRvIHB1dCB0aGUgY29tcG9uZW50cyBpbnRvLlxuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CYWd9IHRoZSBmaWxsQmFnIHdpdGggdGhlIGNvbXBvbmVudHMgaW4uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudHMgPSBmdW5jdGlvbihmaWxsQmFnKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnRzRm9yKHRoaXMsIGZpbGxCYWcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZnJlc2ggYWxsIGNoYW5nZXMgdG8gY29tcG9uZW50cyBmb3IgdGhpcyBlbnRpdHkuIEFmdGVyIGFkZGluZyBvclxuICAgICAgICAgKiByZW1vdmluZyBjb21wb25lbnRzLCB5b3UgbXVzdCBjYWxsIHRoaXMgbWV0aG9kLiBJdCB3aWxsIHVwZGF0ZSBhbGxcbiAgICAgICAgICogcmVsZXZhbnQgc3lzdGVtcy4gSXQgaXMgdHlwaWNhbCB0byBjYWxsIHRoaXMgYWZ0ZXIgYWRkaW5nIGNvbXBvbmVudHMgdG8gYVxuICAgICAgICAgKiBuZXdseSBjcmVhdGVkIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkVG9Xb3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRUb1dvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5hZGRFbnRpdHkodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBlbnRpdHkgaGFzIGNoYW5nZWQsIGEgY29tcG9uZW50IGFkZGVkIG9yIGRlbGV0ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRJbldvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWRJbldvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5jaGFuZ2VkRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSB0aGlzIGVudGl0eSBmcm9tIHRoZSB3b3JsZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlRnJvbVdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZUZyb21Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuZGVsZXRlRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIChSZSllbmFibGUgdGhlIGVudGl0eSBpbiB0aGUgd29ybGQsIGFmdGVyIGl0IGhhdmluZyBiZWluZyBkaXNhYmxlZC5cbiAgICAgICAgICogV29uJ3QgZG8gYW55dGhpbmcgdW5sZXNzIGl0IHdhcyBhbHJlYWR5IGRpc2FibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5lbmFibGVFbnRpdHkodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzYWJsZSB0aGUgZW50aXR5IGZyb20gYmVpbmcgcHJvY2Vzc2VkLiBXb24ndCBkZWxldGUgaXQsIGl0IHdpbGxcbiAgICAgICAgICogY29udGludWUgdG8gZXhpc3QgYnV0IHdvbid0IGdldCBwcm9jZXNzZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRpc2FibGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuZGlzYWJsZUVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgdGhlIFVVSUQgZm9yIHRoaXMgZW50aXR5LlxuICAgICAgICAgKiBUaGlzIFVVSUQgaXMgdW5pcXVlIHBlciBlbnRpdHkgKHJlLXVzZWQgZW50aXRpZXMgZ2V0IGEgbmV3IFVVSUQpLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRVdWlkXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gdXVpZCBpbnN0YW5jZSBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFV1aWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB1dWlkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIHdvcmxkIHRoaXMgZW50aXR5IGJlbG9uZ3MgdG8uXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFdvcmxkXG4gICAgICAgICAqIEByZXR1cm4ge1dvcmxkfSB3b3JsZCBvZiBlbnRpdGllcy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0V29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB3b3JsZDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBCaXRTZXQgPSByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBFbnRpdHkgPSByZXF1aXJlKCcuL0VudGl0eScpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IG1hbmFnZXIgY2xhc3MuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlNYW5hZ2VyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovIFxuICAgIHZhciBFbnRpdHlNYW5hZ2VyID0gZnVuY3Rpb24gRW50aXR5TWFuYWdlcigpIHtcbiAgICAgICAgTWFuYWdlci5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBlbnRpdGllc1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVudGl0aWVzID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkaXNhYmxlZFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzYWJsZWQgPSBuZXcgQml0U2V0KCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFjdGl2ZVxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgYWN0aXZlID0gMCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWRkZWRcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGFkZGVkID0gMCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY3JlYXRlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlZCA9IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGV0ZWRcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZWQgPSAwLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpZGVudGlmaWVyUG9vbFxuICAgICAgICAgKiBAdHlwZSB7SWRlbnRpZmllclBvb2x9XG4gICAgICAgICAqL1xuICAgICAgICBpZGVudGlmaWVyUG9vbCA9IG5ldyBJZGVudGlmaWVyUG9vbCgpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEluaXRpYWxpemVcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgbmV3IGVudGl0eSBpbnN0YW5jZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjcmVhdGVFbnRpdHlJbnN0YW5jZVxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eUluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gbmV3IEVudGl0eSh0aGlzLndvcmxkLCBpZGVudGlmaWVyUG9vbC5jaGVja091dCgpKTtcbiAgICAgICAgICAgICsrY3JlYXRlZDtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVudGl0eSBhcyBhZGRlZCBmb3IgZnV0dXJlIHByb2Nlc3NcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgKythY3RpdmU7XG4gICAgICAgICAgICArK2FkZGVkO1xuICAgICAgICAgICAgZW50aXRpZXMuc2V0KGVudGl0eS5nZXRJZCgpLCBlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBlbnRpdHkgYXMgZW5hYmxlZCBmb3IgZnV0dXJlIHByb2Nlc3NcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZW5hYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGRpc2FibGVkLmNsZWFyKGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGRpc2FibGVkIGZvciBmdXR1cmUgcHJvY2Vzc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkaXNhYmxlZC5zZXQoZW50aXR5LmdldElkKCkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBlbnRpdHkgYXMgZGVsZXRlZCBmb3IgZnV0dXJlIHByb2Nlc3NcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGVudGl0aWVzLnNldChlbnRpdHkuZ2V0SWQoKSwgbnVsbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRpc2FibGVkLmNsZWFyKGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWRlbnRpZmllclBvb2wuY2hlY2tJbihlbnRpdHkuZ2V0SWQoKSk7XG5cbiAgICAgICAgICAgIC0tYWN0aXZlO1xuICAgICAgICAgICAgKytkZWxldGVkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIHRoaXMgZW50aXR5IGlzIGFjdGl2ZS5cbiAgICAgICAgICogQWN0aXZlIG1lYW5zIHRoZSBlbnRpdHkgaXMgYmVpbmcgYWN0aXZlbHkgcHJvY2Vzc2VkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0FjdGl2ZVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZW50aXR5SWRcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBhY3RpdmUsIGZhbHNlIGlmIG5vdFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZ1bmN0aW9uKGVudGl0eUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXMuZ2V0KGVudGl0eUlkKSAhPT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIGVudGl0eUlkIGlzIGVuYWJsZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzRW5hYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZW50aXR5SWRcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBlbmFibGVkLCBmYWxzZSBpZiBpdCBpcyBkaXNhYmxlZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VuYWJsZWQgPSBmdW5jdGlvbihlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuICFkaXNhYmxlZC5nZXQoZW50aXR5SWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBhIGVudGl0eSB3aXRoIHRoaXMgaWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZW50aXR5SWRcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzLmdldChlbnRpdHlJZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGhvdyBtYW55IGVudGl0aWVzIGFyZSBhY3RpdmUgaW4gdGhpcyB3b3JsZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0QWN0aXZlRW50aXR5Q291bnRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBhcmUgY3VycmVudGx5IGFjdGl2ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0QWN0aXZlRW50aXR5Q291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gY3JlYXRlZCBpbiB0aGUgd29ybGQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqIE5vdGU6IEEgY3JlYXRlZCBlbnRpdHkgbWF5IG5vdCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkLCB0aHVzXG4gICAgICAgICAqIGNyZWF0ZWQgY291bnQgaXMgYWx3YXlzIGVxdWFsIG9yIGxhcmdlciB0aGFuIGFkZGVkIGNvdW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRUb3RhbENyZWF0ZWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gY3JlYXRlZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VG90YWxDcmVhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlZDtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRUb3RhbEFkZGVkXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGFkZGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRUb3RhbEFkZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYWRkZWQ7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGRlbGV0ZWQgZnJvbSB0aGUgd29ybGQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFRvdGFsRGVsZXRlZFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBkZWxldGVkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRUb3RhbERlbGV0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWxldGVkO1xuICAgICAgICB9O1xuICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVc2VkIG9ubHkgaW50ZXJuYWxseSBpbiBFbnRpdHlNYW5hZ2VyIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3JcbiAgICAgICAgICogZW50aXRpZXMgYW5kIHJldXNlIHRoZW1cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgICAgICogQGNsYXNzIElkZW50aWZpZXJQb29sXG4gICAgICAgICAqIEBmb3IgRW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAZmluYWxcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBJZGVudGlmaWVyUG9vbCgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgaWRzXG4gICAgICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQmFnfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgaWRzID0gbmV3IEJhZygpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBuZXh0QXZhaWxhYmxlSWRcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG5leHRBdmFpbGFibGVJZCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2hlY2sgYW4gYXZhaWxhYmxlIGlkXG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqIEBtZXRob2QgY2hlY2tPdXRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gbmV4dCBhdmFpbGFibGUgaWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGVja091dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKGlkcy5zaXplKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkcy5yZW1vdmVMYXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiArK25leHRBdmFpbGFibGVJZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQWRkIG5ldyBpZCBpbiBpZHMge0JhZ31cbiAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICogQG1ldGhvZCBjaGVja0luXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGVja0luID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBpZHMucHVzaChpZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5TWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eU1hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIGVudGl0eSBvYnNlcnZlciBjbGFzcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eU9ic2VydmVyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovIFxuICAgIGZ1bmN0aW9uIEVudGl0eU9ic2VydmVyKCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBhZGRlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgY2hhbmdlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmdW5jdGlvbihlbnRpdHkpICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGNoYW5nZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBkZWxldGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gZW5hYmxlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGRpc2FibGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eU9ic2VydmVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBFbnRpdHlPYnNlcnZlciA9IHJlcXVpcmUoJy4vRW50aXR5T2JzZXJ2ZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGdlbmVyYXRlIGEgdW5pcXVlIGJpdCBmb3IgZWFjaCBzeXN0ZW0uXG4gICAgICogT25seSB1c2VkIGludGVybmFsbHkgaW4gRW50aXR5U3lzdGVtLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgU3lzdGVtSW5kZXhNYW5hZ2VyXG4gICAgICogQGZvciBFbnRpdHlTeXN0ZW1cbiAgICAgKiBAZmluYWxcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgU3lzdGVtSW5kZXhNYW5hZ2VyID0ge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBJTkRFWFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgSU5ERVg6IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGluZGljZXNcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgaW5kaWNlczoge30sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRJbmRleEZvclxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eVN5c3RlbX0gZW50aXR5U3lzdGVtXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaW5kZXhcbiAgICAgICAgICovXG4gICAgICAgIGdldEluZGV4Rm9yOiBmdW5jdGlvbihlbnRpdHlTeXN0ZW0pIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kaWNlc1tlbnRpdHlTeXN0ZW1dO1xuICAgICAgICAgICAgaWYoIWluZGV4KSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLklOREVYKys7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzW2VudGl0eVN5c3RlbV0gPSBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIG1vc3QgcmF3IGVudGl0eSBzeXN0ZW0uIEl0IHNob3VsZCBub3QgdHlwaWNhbGx5IGJlIHVzZWQsIGJ1dCB5b3UgY2FuIFxuICAgICAqIGNyZWF0ZSB5b3VyIG93biBlbnRpdHkgc3lzdGVtIGhhbmRsaW5nIGJ5IGV4dGVuZGluZyB0aGlzLiBJdCBpcyBcbiAgICAgKiByZWNvbW1lbmRlZCB0aGF0IHlvdSB1c2UgdGhlIG90aGVyIHByb3ZpZGVkIGVudGl0eSBzeXN0ZW0gaW1wbGVtZW50YXRpb25zXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSBmdW5jdGlvbiBFbnRpdHlTeXN0ZW0oYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eU9ic2VydmVyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud29ybGQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBmaW5hbFxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtSW5kZXhcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeXN0ZW1JbmRleCA9IFN5c3RlbUluZGV4TWFuYWdlci5nZXRJbmRleEZvcih0aGlzLmdldENsYXNzKCkpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVzXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWN0aXZlcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWxsU2V0XG4gICAgICAgICAqIEB0eXBlIHtCaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWxsU2V0ID0gYXNwZWN0LmdldEFsbFNldCgpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBleGNsdXNpb25TZXRcbiAgICAgICAgICogQHR5cGUge0JpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBleGNsdXNpb25TZXQgPSBhc3BlY3QuZ2V0RXhjbHVzaW9uU2V0KCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IG9uZVNldFxuICAgICAgICAgKiBAdHlwZSB7Qml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG9uZVNldCA9IGFzcGVjdC5nZXRPbmVTZXQoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgcGFzc2l2ZVxuICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwYXNzaXZlO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkdW1teVxuICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBkdW1teSA9IGFsbFNldC5pc0VtcHR5KCkgJiYgb25lU2V0LmlzRW1wdHkoKTtcblxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbVN5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSkge1xuICAgICAgICAgICAgYWN0aXZlcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgIGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuY2xlYXIoc3lzdGVtSW5kZXgpO1xuICAgICAgICAgICAgbWUucmVtb3ZlZChlbnRpdHkpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIGluc2VydFRvU3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGluc2VydFRvU3lzdGVtKGVudGl0eSkge1xuICAgICAgICAgICAgYWN0aXZlcy5hZGQoZW50aXR5KTtcbiAgICAgICAgICAgIGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuc2V0KHN5c3RlbUluZGV4KTtcbiAgICAgICAgICAgIG1lLmluc2VydGVkKGVudGl0eSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgYmVmb3JlIHByb2Nlc3Npbmcgb2YgZW50aXRpZXMgYmVnaW5zXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgYmVnaW5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmVnaW4gPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb2Nlc3MgdGhlIGVudGl0aWVzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHByb2Nlc3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5jaGVja1Byb2Nlc3NpbmcoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmVnaW4oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyhhY3RpdmVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBhZnRlciB0aGUgcHJvY2Vzc2luZyBvZiBlbnRpdGllcyBlbmRzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmQgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFueSBpbXBsZW1lbnRpbmcgZW50aXR5IHN5c3RlbSBtdXN0IGltcGxlbWVudCB0aGlzIG1ldGhvZCBhbmQgdGhlIFxuICAgICAgICAgKiBsb2dpYyB0byBwcm9jZXNzIHRoZSBnaXZlbiBlbnRpdGllcyBvZiB0aGUgc3lzdGVtLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzRW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGVudGl0aWVzIGF0aGUgZW50aXRpZXMgdGhpcyBzeXN0ZW0gY29udGFpbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIHRoZSBzeXN0ZW0gc2hvdWxkIHByb2Nlc3NpbmdcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hlY2tQcm9jZXNzaW5nXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlIHN5c3RlbSBzaG91bGQgYmUgcHJvY2Vzc2VkLCBmYWxzZSBpZiBub3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY29kZSB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbiBzeXN0ZW1zIGFyZSBcbiAgICAgICAgICogaW5pdGlhbGl6ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIGlmIHRoZSBzeXN0ZW0gaGFzIHJlY2VpdmVkIGEgZW50aXR5IGl0IGlzIGludGVyZXN0ZWQgaW4sIFxuICAgICAgICAgKiBlLmcuIGNyZWF0ZWQgb3IgYSBjb21wb25lbnQgd2FzIGFkZGVkIHRvIGl0LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbnNlcnRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRoZSBlbnRpdHkgdGhhdCB3YXMgYWRkZWQgdG8gdGhpcyBzeXN0ZW1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5zZXJ0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBpZiBhIGVudGl0eSB3YXMgcmVtb3ZlZCBmcm9tIHRoaXMgc3lzdGVtLCBlLmcuIGRlbGV0ZWQgXG4gICAgICAgICAqIG9yIGhhZCBvbmUgb2YgaXQncyBjb21wb25lbnRzIHJlbW92ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0aGUgZW50aXR5IHRoYXQgd2FzIHJlbW92ZWQgZnJvbSB0aGlzIHN5c3RlbS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IGZ1bmN0aW9uKGVudGl0eSkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2lsbCBjaGVjayBpZiB0aGUgZW50aXR5IGlzIG9mIGludGVyZXN0IHRvIHRoaXMgc3lzdGVtLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1xuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRoZSBlbnRpdHkgdG8gY2hlY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hlY2sgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGR1bW15KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNvbnRhaW5zID0gZW50aXR5LmdldFN5c3RlbUJpdHMoKS5nZXQoc3lzdGVtSW5kZXgpO1xuICAgICAgICAgICAgdmFyIGludGVyZXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudEJpdHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50Qml0cygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighYWxsU2V0LmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBhbGxTZXQubmV4dFNldEJpdCgwKTsgaSA+PSAwOyBpID0gYWxsU2V0Lm5leHRTZXRCaXQoaSsxKSkge1xuICAgICAgICAgICAgICAgICAgICBpZighY29tcG9uZW50Qml0cy5nZXQoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVyZXN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICBpZighZXhjbHVzaW9uU2V0LmlzRW1wdHkoKSAmJiBpbnRlcmVzdGVkKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJlc3RlZCA9ICFleGNsdXNpb25TZXQuaW50ZXJzZWN0cyhjb21wb25lbnRCaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVudGl0eSBwb3NzZXNzZXMgQU5ZIG9mIHRoZSBjb21wb25lbnRzIGluIHRoZSBvbmVTZXQuIElmIHNvLCB0aGUgc3lzdGVtIGlzIGludGVyZXN0ZWQuXG4gICAgICAgICAgICBpZighb25lU2V0LmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGludGVyZXN0ZWQgPSBvbmVTZXQuaW50ZXJzZWN0cyhjb21wb25lbnRCaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChpbnRlcmVzdGVkICYmICFjb250YWlucykge1xuICAgICAgICAgICAgICAgIGluc2VydFRvU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpbnRlcmVzdGVkICYmIGNvbnRhaW5zKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRnJvbVN5c3RlbShlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5jaGVjayhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2soZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmdldChzeXN0ZW1JbmRleCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmdldChzeXN0ZW1JbmRleCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5jaGVjayhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qgc2V0V29ybGRcbiAgICAgICAgICogQHBhcmFtIHtXb3JsZH0gd29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0V29ybGQgPSBmdW5jdGlvbih3b3JsZCkge1xuICAgICAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaXNQYXNzaXZlXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzUGFzc2l2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhc3NpdmU7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldFBhc3NpdmVcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBfcGFzc2l2ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQYXNzaXZlID0gZnVuY3Rpb24oX3Bhc3NpdmUpIHtcbiAgICAgICAgICAgIHBhc3NpdmUgPSBfcGFzc2l2ZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEFjdGl2ZXNcbiAgICAgICAgICogQHJldHVybiB7QmFnfSBhY3RpdmVzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEFjdGl2ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmVzO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgRW50aXR5U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5T2JzZXJ2ZXIucHJvdG90eXBlKTtcbiAgICBFbnRpdHlTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlPYnNlcnZlciA9IHJlcXVpcmUoJy4vRW50aXR5T2JzZXJ2ZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IGNsYXNzLiBDYW5ub3QgYmUgaW5zdGFudGlhdGVkIG91dHNpZGUgdGhlIGZyYW1ld29yaywgeW91IG11c3RcbiAgICAgKiBjcmVhdGUgbmV3IGVudGl0aWVzIHVzaW5nIFdvcmxkLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgTWFuYWdlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqLyBcbiAgICB2YXIgTWFuYWdlciA9IGZ1bmN0aW9uIE1hbmFnZXIoKSB7XG4gICAgICAgIEVudGl0eU9ic2VydmVyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud29ybGQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAvKipcbiAgICAgICAgICogT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGNvZGUgdGhhdCBnZXRzIGV4ZWN1dGVkIHdoZW4gc3lzdGVtcyBhcmUgXG4gICAgICAgICAqIGluaXRpYWxpemVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBzZXRXb3JsZFxuICAgICAgICAgKiBAcGFyYW0ge1dvcmxkfSB3b3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRXb3JsZCA9IGZ1bmN0aW9uKHdvcmxkKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0V29ybGRcbiAgICAgICAgICogQHJldHVybiB7V29ybGR9IHdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFdvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53b3JsZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgYWRkZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9OyBcbiAgICB9O1xuICAgIFxuICAgIE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlPYnNlcnZlci5wcm90b3R5cGUpO1xuICAgIE1hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5TWFuYWdlciA9IHJlcXVpcmUoJy4vRW50aXR5TWFuYWdlcicpLFxuICAgICAgICBDb21wb25lbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYW5hZ2VyJyksXG4gICAgICAgIENvbXBvbmVudE1hcHBlciA9IHJlcXVpcmUoJy4vQ29tcG9uZW50TWFwcGVyJyksXG4gICAgICAgIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcHJpbWFyeSBpbnN0YW5jZSBmb3IgdGhlIGZyYW1ld29yay4gSXQgY29udGFpbnMgYWxsIHRoZSBtYW5hZ2Vycy5cbiAgICAgKiBZb3UgbXVzdCB1c2UgdGhpcyB0byBjcmVhdGUsIGRlbGV0ZSBhbmQgcmV0cmlldmUgZW50aXRpZXMuXG4gICAgICogSXQgaXMgYWxzbyBpbXBvcnRhbnQgdG8gc2V0IHRoZSBkZWx0YSBlYWNoIGdhbWUgbG9vcCBpdGVyYXRpb24sIFxuICAgICAqIGFuZCBpbml0aWFsaXplIGJlZm9yZSBnYW1lIGxvb3AuXG4gICAgICpcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIFdvcmxkXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gV29ybGQoKSB7XG5cbiAgICAgICAgY29uc29sZS5pbmZvKFwiV2VsY29tZSB0byBBcnRlbWlKUywgY29tcG9uZW50IG9yaWVudGVkIGZyYW1ld29yayFcIik7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0eU1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge0VudGl0eU1hbmFnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZW50aXR5TWFuYWdlciA9IG5ldyBFbnRpdHlNYW5hZ2VyKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudE1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge0NvbXBvbmVudE1hbmFnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRNYW5hZ2VyID0gbmV3IENvbXBvbmVudE1hbmFnZXIoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgbWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgbWFuYWdlcnMgPSB7fSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgbWFuYWdlcnNCYWdcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIG1hbmFnZXJzQmFnID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzeXN0ZW1zXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBzeXN0ZW1zID0ge30sXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbXNCYWdcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHN5c3RlbXNCYWcgPSBuZXcgQmFnKCksXG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWRkZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGFkZGVkID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjaGFuZ2VkXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBjaGFuZ2VkID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWxldGVkXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVkID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBlbmFibGVcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGVuYWJsZSA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGlzYWJsZVxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzYWJsZSA9IG5ldyBCYWcoKSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWx0YVxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVsdGEgPSAwO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWtlcyBzdXJlIGFsbCBtYW5hZ2VycyBzeXN0ZW1zIGFyZSBpbml0aWFsaXplZCBpbiB0aGUgb3JkZXIgXG4gICAgICAgICAqIHRoZXkgd2VyZSBhZGRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwiTWFuYWdlcnMgaW5pdGlhbGl6YXRpb25cIik7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFwiTWFuYWdlcnMgaW5pdGlhbGl6YXRpb25cIik7XG4gICAgICAgICAgICB2YXIgaSA9IG1hbmFnZXJzQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIG1hbmFnZXJzQmFnLmdldChpKS5pbml0aWFsaXplKCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgPSBzeXN0ZW1zQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHN5c3RlbXNCYWcuZ2V0KGkpLmluaXRpYWxpemUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgbWFuYWdlciB0aGF0IHRha2VzIGNhcmUgb2YgYWxsIHRoZSBlbnRpdGllcyBpbiB0aGUgd29ybGQuXG4gICAgICAgICAqIGVudGl0aWVzIG9mIHRoaXMgd29ybGRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0RW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHlNYW5hZ2VyfSBlbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0eU1hbmFnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHlNYW5hZ2VyO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBtYW5hZ2VyIHRoYXQgdGFrZXMgY2FyZSBvZiBhbGwgdGhlIGNvbXBvbmVudHMgaW4gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRNYW5hZ2VyXG4gICAgICAgICAqIEByZXR1cm4ge0NvbXBvbmVudE1hbmFnZXJ9IGNvbXBvbmVudE1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50TWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudE1hbmFnZXI7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGEgbWFuYWdlciBpbnRvIHRoaXMgd29ybGQuIEl0IGNhbiBiZSByZXRyaWV2ZWQgbGF0ZXIuXG4gICAgICAgICAqIFdvcmxkIHdpbGwgbm90aWZ5IHRoaXMgbWFuYWdlciBvZiBjaGFuZ2VzIHRvIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2Qgc2V0TWFuYWdlclxuICAgICAgICAgKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXIgbWFuYWdlciB0byBiZSBhZGRlZFxuICAgICAgICAgKiBAcmV0dXJuIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldE1hbmFnZXIgPSBmdW5jdGlvbihtYW5hZ2VyKSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcInNldCBtYW5hZ2VyXCIpO1xuICAgICAgICAgICAgbWFuYWdlci5zZXRXb3JsZCh0aGlzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbWFuYWdlcnNbbWFuYWdlci5nZXRDbGFzcygpXSA9IG1hbmFnZXI7XG4gICAgICAgICAgICBtYW5hZ2Vyc0JhZy5hZGQobWFuYWdlcik7XG4gICAgXG4gICAgICAgICAgICByZXR1cm4gbWFuYWdlcjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgbWFuYWdlciBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWFuYWdlclR5cGUgY2xhc3MgdHlwZSBvZiB0aGUgbWFuYWdlclxuICAgICAgICAgKiBAcmV0dXJuIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldE1hbmFnZXIgPSBmdW5jdGlvbihtYW5hZ2VyVHlwZSkgeyAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbWFuYWdlcnNbbWFuYWdlclR5cGVdIHx8IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZXMgdGhlIG1hbmFnZXIgZnJvbSB0aGlzIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVNYW5hZ2VyXG4gICAgICAgICAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlciBtYW5hZ2VyIHRvIGRlbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlTWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBtYW5hZ2Vyc1ttYW5hZ2VyLmdldENsYXNzKCldO1xuICAgICAgICAgICAgbWFuYWdlcnNCYWcucmVtb3ZlKG1hbmFnZXIpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFlvdSBtdXN0IHNwZWNpZnkgdGhlIGRlbHRhIGZvciB0aGUgZ2FtZSBoZXJlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXREZWx0YVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZCB0aW1lIHNpbmNlIGxhc3QgZ2FtZSBsb29wLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXREZWx0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGRlbHRhID0gZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXREZWx0YVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRlbHRhIHRpbWUgc2luY2UgbGFzdCBnYW1lIGxvb3AuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsdGE7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBhIGVudGl0eSB0byB0aGlzIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGFkZGVkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVuc3VyZSBhbGwgc3lzdGVtcyBhcmUgbm90aWZpZWQgb2YgY2hhbmdlcyB0byB0aGlzIGVudGl0eS5cbiAgICAgICAgICogSWYgeW91J3JlIGFkZGluZyBhIGNvbXBvbmVudCB0byBhbiBlbnRpdHkgYWZ0ZXIgaXQncyBiZWVuXG4gICAgICAgICAqIGFkZGVkIHRvIHRoZSB3b3JsZCwgdGhlbiB5b3UgbmVlZCB0byBpbnZva2UgdGhpcyBtZXRob2QuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW50aXR5ID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBjaGFuZ2VkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSB0aGUgZW50aXR5IGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGFkZGVkLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIChSZSllbmFibGUgdGhlIGVudGl0eSBpbiB0aGUgd29ybGQsIGFmdGVyIGl0IGhhdmluZyBiZWluZyBkaXNhYmxlZC5cbiAgICAgICAgICogV29uJ3QgZG8gYW55dGhpbmcgdW5sZXNzIGl0IHdhcyBhbHJlYWR5IGRpc2FibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGVuYWJsZS5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBlbnRpdHkgZnJvbSBiZWluZyBwcm9jZXNzZWQuIFdvbid0IGRlbGV0ZSBpdCwgaXQgd2lsbFxuICAgICAgICAgKiBjb250aW51ZSB0byBleGlzdCBidXQgd29uJ3QgZ2V0IHByb2Nlc3NlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGRpc2FibGUuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgb3IgcmV1c2VkIGVudGl0eSBpbnN0YW5jZS5cbiAgICAgICAgICogV2lsbCBOT1QgYWRkIHRoZSBlbnRpdHkgdG8gdGhlIHdvcmxkLCB1c2UgV29ybGQuYWRkRW50aXR5KEVudGl0eSkgZm9yIHRoYXQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNyZWF0ZUVudGl0eVxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcmVhdGVFbnRpdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwiY3JlYXRlIGVudGl0eVwiKTtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHlNYW5hZ2VyLmNyZWF0ZUVudGl0eUluc3RhbmNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGEgZW50aXR5IGhhdmluZyB0aGUgc3BlY2lmaWVkIGlkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIGVudGl0eSBpZFxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFbnRpdHkgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuZ2V0RW50aXR5KGlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHaXZlcyB5b3UgYWxsIHRoZSBzeXN0ZW1zIGluIHRoaXMgd29ybGQgZm9yIHBvc3NpYmxlIGl0ZXJhdGlvbi5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U3lzdGVtc1xuICAgICAgICAgKiBAcmV0dXJuIHsqfSBhbGwgZW50aXR5IHN5c3RlbXMgaW4gd29ybGQsIG90aGVyIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFN5c3RlbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzeXN0ZW1zQmFnO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZHMgYSBzeXN0ZW0gdG8gdGhpcyB3b3JsZCB0aGF0IHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IFdvcmxkLnByb2Nlc3MoKVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRTeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHlTeXN0ZW19IHN5c3RlbSB0aGUgc3lzdGVtIHRvIGFkZC5cbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBbcGFzc2l2ZV0gd2hldGhlciBvciBub3QgdGhpcyBzeXN0ZW0gd2lsbCBiZSBwcm9jZXNzZWQgYnkgV29ybGQucHJvY2VzcygpXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eVN5c3RlbX0gdGhlIGFkZGVkIHN5c3RlbS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0U3lzdGVtID0gZnVuY3Rpb24oc3lzdGVtLCBwYXNzaXZlKSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcInNldCBzeXN0ZW1cIik7XG4gICAgICAgICAgICBwYXNzaXZlID0gcGFzc2l2ZSB8fCBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzdGVtLnNldFdvcmxkKHRoaXMpO1xuICAgICAgICAgICAgc3lzdGVtLnNldFBhc3NpdmUocGFzc2l2ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN5c3RlbXNbc3lzdGVtLmdldENsYXNzKCldID0gc3lzdGVtO1xuICAgICAgICAgICAgc3lzdGVtc0JhZy5hZGQoc3lzdGVtKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN5c3RlbTtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlIGEgc3lzdGVtIGZvciBzcGVjaWZpZWQgc3lzdGVtIHR5cGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFN5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3lzdGVtVHlwZSB0eXBlIG9mIHN5c3RlbS5cbiAgICAgICAgICogQHJldHVybiB7RW50aXR5U3lzdGVtfSBpbnN0YW5jZSBvZiB0aGUgc3lzdGVtIGluIHRoaXMgd29ybGQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFN5c3RlbSA9IGZ1bmN0aW9uKHN5c3RlbVR5cGUpIHsgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN5c3RlbXNbc3lzdGVtVHlwZV0gfHwgZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlZCB0aGUgc3BlY2lmaWVkIHN5c3RlbSBmcm9tIHRoZSB3b3JsZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlU3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSBzeXN0ZW0gdG8gYmUgZGVsZXRlZCBmcm9tIHdvcmxkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVTeXN0ZW0gPSBmdW5jdGlvbihzeXN0ZW0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzeXN0ZW1zW3N5c3RlbS5nZXRDbGFzcygpXTtcbiAgICAgICAgICAgIHN5c3RlbXNCYWcucmVtb3ZlKHN5c3RlbSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTm90aWZ5IGFsbCB0aGUgc3lzdGVtc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBub3RpZnlTeXN0ZW1zXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwZXJmb3JtZXIgT2JqZWN0IHdpdGggY2FsbGJhY2sgcGVyZm9ybVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBub3RpZnlTeXN0ZW1zKHBlcmZvcm1lciwgZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcIm5vdGlmeSBzeXN0ZW1zXCIpO1xuICAgICAgICAgICAgdmFyIGkgPSBzeXN0ZW1zQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHBlcmZvcm1lci5wZXJmb3JtKHN5c3RlbXNCYWcuZ2V0KGkpLCBlbnRpdHkpO1xuICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOb3RpZnkgYWxsIHRoZSBtYW5hZ2Vyc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBub3RpZnlTeXN0ZW1zXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwZXJmb3JtZXIgT2JqZWN0IHdpdGggY2FsbGJhY2sgcGVyZm9ybVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBub3RpZnlNYW5hZ2VycyhwZXJmb3JtZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgY29uc29sZS50aW1lU3RhbXAoXCJub3RpZnkgbWFuYWdlcnNcIik7XG4gICAgICAgICAgICB2YXIgaSA9IG1hbmFnZXJzQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHBlcmZvcm1lci5wZXJmb3JtKG1hbmFnZXJzQmFnLmdldChpKSwgZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIGFuIGFjdGlvbiBvbiBlYWNoIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgY2hlY2tcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGVudGl0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwZXJmb3JtZXJcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrKGVudGl0aWVzLCBwZXJmb3JtZXIpIHtcbiAgICAgICAgICAgIGlmKCFlbnRpdGllcy5zaXplKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IGVudGl0aWVzLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5nZXQoaSk7XG4gICAgICAgICAgICAgICAgbm90aWZ5TWFuYWdlcnMocGVyZm9ybWVyLCBlbnRpdHkpO1xuICAgICAgICAgICAgICAgIG5vdGlmeVN5c3RlbXMocGVyZm9ybWVyLCBlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbnRpdGllcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvY2VzcyBhbGwgbm9uLXBhc3NpdmUgc3lzdGVtcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcHJvY2Vzc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcm9jZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcInByb2Nlc3MgZXZlcnl0aGluZ1wiKTtcbiAgICAgICAgICAgIGNoZWNrKGFkZGVkLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24ob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5hZGRlZChlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGVjayhjaGFuZ2VkLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24ob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jaGFuZ2VkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGRpc2FibGUsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2FibGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGVuYWJsZSwge1xuICAgICAgICAgICAgICAgIHBlcmZvcm06IGZ1bmN0aW9uKG9ic2VydmVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZW5hYmxlZChlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGVjayhkZWxldGVkLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24gKG9ic2VydmVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGVsZXRlZChlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnRNYW5hZ2VyLmNsZWFuKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpID0gc3lzdGVtc0JhZy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc3lzdGVtID0gc3lzdGVtc0JhZy5nZXQoaSk7XG4gICAgICAgICAgICAgICAgaWYoIXN5c3RlbS5pc1Bhc3NpdmUoKSkge1xuICAgICAgICAgICAgICAgICAgICBzeXN0ZW0ucHJvY2VzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXRyaWV2ZXMgYSBDb21wb25lbnRNYXBwZXIgaW5zdGFuY2UgZm9yIGZhc3QgcmV0cmlldmFsIFxuICAgICAgICAgKiBvZiBjb21wb25lbnRzIGZyb20gZW50aXRpZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldE1hcHBlclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdHlwZSBvZiBjb21wb25lbnQgdG8gZ2V0IG1hcHBlciBmb3IuXG4gICAgICAgICAqIEByZXR1cm4ge0NvbXBvbmVudE1hcHBlcn0gbWFwcGVyIGZvciBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldE1hcHBlciA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBDb21wb25lbnRNYXBwZXIuZ2V0Rm9yKHR5cGUsIHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXRNYW5hZ2VyKGNvbXBvbmVudE1hbmFnZXIpO1xuICAgICAgICB0aGlzLnNldE1hbmFnZXIoZW50aXR5TWFuYWdlcik7XG4gICAgfVxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gV29ybGQ7XG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIEJhZyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvQmFnJyksXG4gICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vTWFuYWdlcicpO1xuXG4vKipcbiAqIElmIHlvdSBuZWVkIHRvIGdyb3VwIHlvdXIgZW50aXRpZXMgdG9nZXRoZXIsIGUuZy4gdGFua3MgZ29pbmcgaW50b1xuICogXCJ1bml0c1wiIGdyb3VwIG9yIGV4cGxvc2lvbnMgaW50byBcImVmZmVjdHNcIixcbiAqIHRoZW4gdXNlIHRoaXMgbWFuYWdlci4gWW91IG11c3QgcmV0cmlldmUgaXQgdXNpbmcgd29ybGQgaW5zdGFuY2UuXG4gKlxuICogQSBlbnRpdHkgY2FuIGJlIGFzc2lnbmVkIHRvIG1vcmUgdGhhbiBvbmUgZ3JvdXAuXG4gKlxuICogQG1vZHVsZSBBcnRlbWlKU1xuICogQGNsYXNzIEdyb3VwTWFuYWdlclxuICogQG5hbWVzcGFjZSBNYW5hZ2Vyc1xuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBNYW5hZ2VyXG4gKi9cbnZhciBHcm91cE1hbmFnZXIgPSBmdW5jdGlvbiBHcm91cE1hbmFnZXIoKSB7XG4gICAgTWFuYWdlci5jYWxsKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcHJvcGVydHkgZW50aXRpZXNCeUdyb3VwXG4gICAgICogQHR5cGUge01hcH1cbiAgICAgKi9cbiAgICB2YXIgZW50aXRpZXNCeUdyb3VwID0gbmV3IE1hcCgpLFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcHJvcGVydHkgZ3JvdXBzQnlFbnRpdHlcbiAgICAgKiBAdHlwZSB7TWFwfVxuICAgICAqL1xuICAgIGdyb3Vwc0J5RW50aXR5ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICovXG4gICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgZ3JvdXAgb2YgdGhlIGVudGl0eS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0byBhZGQgaW50byB0aGUgZ3JvdXBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXAgdG8gYWRkIHRoZSBlbnRpdHkgaW50b1xuICAgICAqL1xuICAgIHRoaXMuYWRkID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGdyb3VwLmxlbmd0aCA+IDAsIFwiR3JvdXAgaXMgZW1wdHlcIik7XG5cbiAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cCk7XG4gICAgICAgIGlmKCFlbnRpdGllcykge1xuICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICBlbnRpdGllc0J5R3JvdXAuc2V0KGdyb3VwLCBlbnRpdGllcyk7XG4gICAgICAgIH1cbiAgICAgICAgZW50aXRpZXMuYWRkKGVudGl0eSk7XG5cbiAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICBpZighZ3JvdXBzKSB7XG4gICAgICAgICAgICBncm91cHMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICBncm91cHNCeUVudGl0eS5zZXQoZW50aXR5LCBncm91cHMpO1xuICAgICAgICB9XG4gICAgICAgIGdyb3Vwcy5hZGQoZ3JvdXApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhlIGVudGl0eSBmcm9tIHRoZSBncm91cC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0byByZW1vdmUgZnJvbSB0aGUgZ3JvdXBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXAgdG8gcmVtb3ZlIGZyb20gdGhlbSBlbnRpdHlcbiAgICAgKi9cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGVudGl0eSwgZ3JvdXApIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICBjb25zb2xlLmFzc2VydChncm91cC5sZW5ndGggPiAwLCBcIkdyb3VwIGlzIGVtcHR5XCIpO1xuICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5R3JvdXAuZ2V0KGdyb3VwKTtcbiAgICAgICAgaWYoZW50aXRpZXMpIHtcbiAgICAgICAgICAgIGVudGl0aWVzLmRlbGV0ZShlbnRpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICBpZihncm91cHMpIHtcbiAgICAgICAgICAgIGdyb3Vwcy5kZWxldGUoZ3JvdXApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGUgZW50aXR5IGZyb20gdGhlIGFsbCBncm91cHMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHJlbW92ZUZyb21BbGxHcm91cHNcbiAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRvIHJlbW92ZSBmcm9tIHRoZSBncm91cFxuICAgICAqL1xuICAgIHRoaXMucmVtb3ZlRnJvbUFsbEdyb3VwcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIHZhciBncm91cHMgPSBncm91cHNCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgaWYoIWdyb3Vwcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpID0gZ3JvdXBzLnNpemUoKTtcbiAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5R3JvdXAuZ2V0KGdyb3Vwcy5nZXQoaSkpO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncm91cHMuY2xlYXIoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBlbnRpdGllcyB0aGF0IGJlbG9uZyB0byB0aGUgcHJvdmlkZWQgZ3JvdXAuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEVudGl0aWVzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwIG5hbWUgb2YgdGhlIGdyb3VwXG4gICAgICogQHJldHVybiB7QmFnfSBlbnRpdGllc1xuICAgICAqL1xuICAgIHRoaXMuZ2V0RW50aXRpZXMgPSBmdW5jdGlvbihncm91cCkge1xuICAgICAgICBjb25zb2xlLmFzc2VydChncm91cC5sZW5ndGggPiAwLCBcIkdyb3VwIGlzIGVtcHR5XCIpO1xuICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5R3JvdXAuZ2V0KGdyb3VwKTtcbiAgICAgICAgaWYoIWVudGl0aWVzKSB7XG4gICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgIGVudGl0aWVzQnlHcm91cC5wdXQoZ3JvdXAsIGVudGl0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgZW50aXRpZXMgZnJvbSB0aGUgZ3JvdXBcbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0R3JvdXBzXG4gICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAqL1xuICAgIHRoaXMuZ2V0R3JvdXBzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhZW50aXR5LCBcIkVudGl0eSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgcmV0dXJuIGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpcyBFbnRpdHkgaW4gYW55IGdyb3VwXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0luQW55R3JvdXAgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICByZXR1cm4gZ3JvdXBzQnlFbnRpdHkuaGFzKGVudGl0eSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVudGl0eSBpcyBpbiBncm91cFxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaXNJbkdyb3VwID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIGlmKCFncm91cCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBncm91cHMgPSBncm91cHNCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgdmFyIGkgPSBncm91cHMuc2l6ZSgpO1xuICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgIGlmKGdyb3VwID09PSBncm91cHMuZ2V0KGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZW50aXR5IGZyb20gYWxsIGdyb3VwcyByZWxhdGVkIHRvXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW50aXR5XG4gICAgICovXG4gICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhZW50aXR5LCBcIkVudGl0eSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tQWxsR3JvdXBzKGVudGl0eSk7XG4gICAgfTtcbn07XG5cbkdyb3VwTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbkdyb3VwTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHcm91cE1hbmFnZXI7XG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwTWFuYWdlcjsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi8uLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIEJhZyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvQmFnJyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKFwiLi8uLi9NYW5hZ2VyXCIpO1xuICAgIFxuICAgIHZhciBQbGF5ZXJNYW5hZ2VyID0gZnVuY3Rpb24gUGxheWVyTWFuYWdlcigpIHtcbiAgICAgICAgTWFuYWdlci5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHBsYXllckJ5RW50aXR5ID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgICAgIGVudGl0aWVzQnlQbGF5ZXIgPSBuZXcgSGFzaE1hcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0UGxheWVyID0gZnVuY3Rpb24oZW50aXR5LCBwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllckJ5RW50aXR5LnB1dChlbnRpdHksIHBsYXllcik7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5UGxheWVyLmdldChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5UGxheWVyLnB1dChwbGF5ZXIsIGVudGl0aWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVudGl0aWVzLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRFbnRpdGllc09mUGxheWVyID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgZW50aXRpZXMgPSBlbnRpdGllc0J5UGxheWVyLmdldChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllcztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHBsYXllckJ5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYocGxheWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgICAgICBpZihlbnRpdGllcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmdldFBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllckJ5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG5cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21QbGF5ZXIoZW50aXR5KTtcbiAgICAgICAgfTtcblxuICAgIH07XG4gICAgXG4gICAgUGxheWVyTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbiAgICBQbGF5ZXJNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYXllck1hbmFnZXI7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi8uLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKCcuLy4uL01hbmFnZXInKTtcbiAgICBcbiAgICB2YXIgVGFnTWFuYWdlciA9IGZ1bmN0aW9uIFRhZ01hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBlbnRpdGllc0J5VGFnID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgICAgIHRhZ3NCeUVudGl0eSA9IG5ldyBIYXNoTWFwKCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlciA9IGZ1bmN0aW9uKHRhZywgZW50aXR5KSB7XG4gICAgICAgICAgICBlbnRpdGllc0J5VGFnLnB1dCh0YWcsIGVudGl0eSk7XG4gICAgICAgICAgICB0YWdzQnlFbnRpdHkucHV0KGVudGl0eSwgdGFnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnVucmVnaXN0ZXIgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgIHRhZ3NCeUVudGl0eS5yZW1vdmUoZW50aXRpZXNCeVRhZy5yZW1vdmUodGFnKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pc1JlZ2lzdGVyZWQgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllc0J5VGFnLmNvbnRhaW5zS2V5KHRhZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRFbnRpdHkgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllc0J5VGFnLmdldCh0YWcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRSZWdpc3RlcmVkVGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3NCeUVudGl0eS52YWx1ZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdmFyIHJlbW92ZWRUYWcgPSB0YWdzQnlFbnRpdHkucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICBpZihyZW1vdmVkVGFnICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXNCeVRhZy5yZW1vdmUocmVtb3ZlZFRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9OyBcblxuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgVGFnTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUYWdNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGFnTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgY2xhc3MgdG9nZXRoZXIgd2l0aCBQbGF5ZXJNYW5hZ2VyLlxuICAgICAqIFxuICAgICAqIFlvdSBtYXkgc29tZXRpbWVzIHdhbnQgdG8gY3JlYXRlIHRlYW1zIGluIHlvdXIgZ2FtZSwgc28gdGhhdFxuICAgICAqIHNvbWUgcGxheWVycyBhcmUgdGVhbSBtYXRlcy5cbiAgICAgKiBcbiAgICAgKiBBIHBsYXllciBjYW4gb25seSBiZWxvbmcgdG8gYSBzaW5nbGUgdGVhbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBNYW5hZ2Vyc1xuICAgICAqIEBjbGFzcyBUZWFtTWFuYWdlclxuICAgICAqIEBuYW1lc3BhY2UgTWFuYWdlcnNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAZXh0ZW5kcyBNYW5hZ2VyXG4gICAgICovXG4gICAgdmFyIFRlYW1NYW5hZ2VyID0gZnVuY3Rpb24gVGVhbU1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgcGxheWVyc0J5VGVhbVxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwbGF5ZXJzQnlUZWFtID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgdGVhbUJ5UGxheWVyXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5IYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGVhbUJ5UGxheWVyID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuIHRlYW1CeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdGVhbSB0byBhIHBsYXllclxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllciwgdGVhbSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tVGVhbShwbGF5ZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0ZWFtQnlQbGF5ZXIucHV0KHBsYXllciwgdGVhbSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICBpZihwbGF5ZXJzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGxheWVycyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzQnlUZWFtLnB1dCh0ZWFtLCBwbGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllcnMuYWRkKHBsYXllcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRQbGF5ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSBCYWcgb2YgcGxheWVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRQbGF5ZXJzID0gZnVuY3Rpb24odGVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllcnNCeVRlYW0uZ2V0KHRlYW0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbVRlYW1cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllciBOYW1lIG9mIHRoZSBwbGF5ZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVRlYW0gPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGVhbUJ5UGxheWVyLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgaWYodGVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICAgICAgaWYocGxheWVycyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9OyBcblxuICAgIFRlYW1NYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIFRlYW1NYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRlYW1NYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGVhbU1hbmFnZXI7XG59KSgpOyIsIkFycmF5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzW2luZGV4XTtcclxufTtcclxuXHJcbkFycmF5LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcclxuICB0aGlzW2luZGV4XSA9IHZhbHVlO1xyXG59OyIsIi8qKlxuICogRm9yIGFuIHJmYzQxMjIgdmVyc2lvbiA0IGNvbXBsaWFudCBzb2x1dGlvblxuICogXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQtaW4tamF2YXNjcmlwdFxuICogQGF1dGhvciBicm9vZmFcbiAqL1xuTWF0aC51dWlkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbn07IiwiLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgemVybyBiaXRzIGZvbGxvd2luZyB0aGUgbG93ZXN0LW9yZGVyIChcInJpZ2h0bW9zdFwiKVxuICogb25lLWJpdCBpbiB0aGUgdHdvJ3MgY29tcGxlbWVudCBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNwZWNpZmllZFxuICoge0Bjb2RlIGxvbmd9IHZhbHVlLiAgUmV0dXJucyA2NCBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGhhcyBub1xuICogb25lLWJpdHMgaW4gaXRzIHR3bydzIGNvbXBsZW1lbnQgcmVwcmVzZW50YXRpb24sIGluIG90aGVyIHdvcmRzIGlmIGl0IGlzXG4gKiBlcXVhbCB0byB6ZXJvLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgemVybyBiaXRzIGZvbGxvd2luZyB0aGUgbG93ZXN0LW9yZGVyIChcInJpZ2h0bW9zdFwiKVxuICogICAgIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZVxuICogICAgIHNwZWNpZmllZCB7QGNvZGUgbG9uZ30gdmFsdWUsIG9yIDY0IGlmIHRoZSB2YWx1ZSBpcyBlcXVhbFxuICogICAgIHRvIHplcm8uXG4gKiBAc2luY2UgMS41XG4gKiBAc2VlIGh0dHA6Ly9ncmVwY29kZS5jb20vZmlsZV8vcmVwb3NpdG9yeS5ncmVwY29kZS5jb20vamF2YS9yb290L2pkay9vcGVuamRrLzYtYjE0L2phdmEvbGFuZy9Mb25nLmphdmEvP3Y9c291cmNlXG4gKi9cbk51bWJlci5wcm90b3R5cGUubnVtYmVyT2ZUcmFpbGluZ1plcm9zID0gZnVuY3Rpb24oaSkge1xuICAgIHZhciB4LCB5O1xuICAgIGlmIChpID09PSAwKSByZXR1cm4gNjQ7XG4gICAgdmFyIG4gPSA2MztcbiAgICB5ID0gcGFyc2VJbnQoaSk7IGlmICh5ICE9PSAwKSB7IG4gPSBuIC0zMjsgeCA9IHk7IH0gZWxzZSB4ID0gcGFyc2VJbnQoaT4+PjMyKTtcbiAgICB5ID0geCA8PDE2OyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtMTY7IHggPSB5OyB9XG4gICAgeSA9IHggPDwgODsgaWYgKHkgIT09IDApIHsgbiA9IG4gLSA4OyB4ID0geTsgfVxuICAgIHkgPSB4IDw8IDQ7IGlmICh5ICE9PSAwKSB7IG4gPSBuIC0gNDsgeCA9IHk7IH1cbiAgICB5ID0geCA8PCAyOyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtIDI7IHggPSB5OyB9XG4gICAgcmV0dXJuIG4gLSAoKHggPDwgMSkgPj4+IDMxKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHplcm8gYml0cyBwcmVjZWRpbmcgdGhlIGhpZ2hlc3Qtb3JkZXJcbiAqIChcImxlZnRtb3N0XCIpIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgc3BlY2lmaWVkIHtAY29kZSBsb25nfSB2YWx1ZS4gIFJldHVybnMgNjQgaWYgdGhlXG4gKiBzcGVjaWZpZWQgdmFsdWUgaGFzIG5vIG9uZS1iaXRzIGluIGl0cyB0d28ncyBjb21wbGVtZW50IHJlcHJlc2VudGF0aW9uLFxuICogaW4gb3RoZXIgd29yZHMgaWYgaXQgaXMgZXF1YWwgdG8gemVyby5cbiAqXG4gKiA8cD5Ob3RlIHRoYXQgdGhpcyBtZXRob2QgaXMgY2xvc2VseSByZWxhdGVkIHRvIHRoZSBsb2dhcml0aG0gYmFzZSAyLlxuICogRm9yIGFsbCBwb3NpdGl2ZSB7QGNvZGUgbG9uZ30gdmFsdWVzIHg6XG4gKiA8dWw+XG4gKiA8bGk+Zmxvb3IobG9nPHN1Yj4yPC9zdWI+KHgpKSA9IHtAY29kZSA2MyAtIG51bWJlck9mTGVhZGluZ1plcm9zKHgpfVxuICogPGxpPmNlaWwobG9nPHN1Yj4yPC9zdWI+KHgpKSA9IHtAY29kZSA2NCAtIG51bWJlck9mTGVhZGluZ1plcm9zKHggLSAxKX1cbiAqIDwvdWw+XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge051bWJlcn0gdGhlIG51bWJlciBvZiB6ZXJvIGJpdHMgcHJlY2VkaW5nIHRoZSBoaWdoZXN0LW9yZGVyXG4gKiAgICAgKFwibGVmdG1vc3RcIikgb25lLWJpdCBpbiB0aGUgdHdvJ3MgY29tcGxlbWVudCBiaW5hcnkgcmVwcmVzZW50YXRpb25cbiAqICAgICBvZiB0aGUgc3BlY2lmaWVkIHtAY29kZSBsb25nfSB2YWx1ZSwgb3IgNjQgaWYgdGhlIHZhbHVlXG4gKiAgICAgaXMgZXF1YWwgdG8gemVyby5cbiAqIEBzaW5jZSAxLjVcbiAqIEBzZWUgaHR0cDovL2dyZXBjb2RlLmNvbS9maWxlXy9yZXBvc2l0b3J5LmdyZXBjb2RlLmNvbS9qYXZhL3Jvb3QvamRrL29wZW5qZGsvNi1iMTQvamF2YS9sYW5nL0xvbmcuamF2YS8/dj1zb3VyY2VcbiAqL1xuTnVtYmVyLnByb3RvdHlwZS5udW1iZXJPZkxlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uKGkpIHtcbiAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgcmV0dXJuIDY0O1xuICAgIHZhciBuID0gMTtcbiAgICB2YXIgeCA9IHBhcnNlSW50KGkgPj4+IDMyKTtcbiAgICBpZiAoeCA9PT0gMCkgeyBuICs9IDMyOyB4ID0gcGFyc2VJbnQoaSk7IH1cbiAgICBpZiAoeCA+Pj4gMTYgPT09IDApIHsgbiArPSAxNjsgeCA8PD0gMTY7IH1cbiAgICBpZiAoeCA+Pj4gMjQgPT09IDApIHsgbiArPSAgODsgeCA8PD0gIDg7IH1cbiAgICBpZiAoeCA+Pj4gMjggPT09IDApIHsgbiArPSAgNDsgeCA8PD0gIDQ7IH1cbiAgICBpZiAoeCA+Pj4gMzAgPT09IDApIHsgbiArPSAgMjsgeCA8PD0gIDI7IH1cbiAgICBuIC09IHggPj4+IDMxO1xuICAgIHJldHVybiBuO1xufTsiLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgXCJrbGFzc1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LnByb3RvdHlwZS5nZXRDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xufTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gZnVuY3Rpb24gRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0oX2FzcGVjdCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBfYXNwZWN0KTtcbiAgICB9O1xuICAgIFxuICAgIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBPYmplY3QgdG8gbWFuYWdlIGNvbXBvbmVudHNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtKF9hc3BlY3QpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgX2FzcGVjdCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICAvLyBsaXRsZSBkaWZmZXJlbmNlIGJldHdlZW4gb3JpZ2luYWwgZnJhbWV3b3JrLCBqcyBkb2Vzbid0IGFsbG93IHRvIG92ZXJsb2FkIG1ldGhvZHMgOjxcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGVudGl0aWVzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7XG4gICAgICAgICAgICB2YXIgaSA9IGVudGl0aWVzLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzKGVudGl0aWVzLmdldChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAgXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBJZiB5b3UgbmVlZCB0byBwcm9jZXNzIGVudGl0aWVzIGF0IGEgY2VydGFpbiBpbnRlcnZhbCB0aGVuIHVzZSB0aGlzLlxuICAgICAqIEEgdHlwaWNhbCB1c2FnZSB3b3VsZCBiZSB0byByZWdlbmVyYXRlIGFtbW8gb3IgaGVhbHRoIGF0IGNlcnRhaW4gaW50ZXJ2YWxzLCBubyBuZWVkXG4gICAgICogdG8gZG8gdGhhdCBldmVyeSBnYW1lIGxvb3AsIGJ1dCBwZXJoYXBzIGV2ZXJ5IDEwMCBtcy4gb3IgZXZlcnkgc2Vjb25kLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEFybmkgQXJlbnRcbiAgICAgKi9cbiAgICB2YXIgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gZnVuY3Rpb24gSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtKF9hc3BlY3QsIGludGVydmFsKSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QsIGludGVydmFsKTtcblxuICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge307XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGkgPSBlbnRpdGllcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyhlbnRpdGllcy5nZXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgSW50ZXJ2YWxFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBIHN5c3RlbSB0aGF0IHByb2Nlc3NlcyBlbnRpdGllcyBhdCBhIGludGVydmFsIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBBIHR5cGljYWwgdXNhZ2Ugd291bGQgYmUgYSBjb2xsaXNpb24gc3lzdGVtIG9yIHBoeXNpY3Mgc3lzdGVtLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgSW50ZXJ2YWxFbnRpdHlTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWQgXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICogQGF1dGhvciBBcm5pIEFyZW50XG4gICAgICovXG4gICAgdmFyIEludGVydmFsRW50aXR5U3lzdGVtID0gZnVuY3Rpb24gSW50ZXJ2YWxFbnRpdHlTeXN0ZW0oX2FzcGVjdCwgX2ludGVydmFsKSB7XG5cbiAgICAgICAgdmFyIGFjYztcblxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBfaW50ZXJ2YWw7XG5cbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgX2FzcGVjdCk7XG5cbiAgICAgICAgdGhpcy5jaGVja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFjYyArPSB0aGlzLndvcmxkLmdldERlbHRhKCk7XG4gICAgICAgICAgICBpZihhY2MgPj0gaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgICBhY2MgLT0gaW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBJbnRlcnZhbEVudGl0eVN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEludGVydmFsRW50aXR5U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVydmFsRW50aXR5U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW50ZXJ2YWxFbnRpdHlTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEFzcGVjdCA9IHJlcXVpcmUoJy4vLi4vQXNwZWN0JyksXG4gICAgICAgIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBWb2lkRW50aXR5U3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBWb2lkRW50aXR5U3lzdGVtID0gZnVuY3Rpb24gVm9pZEVudGl0eVN5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRFbXB0eSgpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1N5c3RlbSgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wcm9jZXNzU3lzdGVtID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIFZvaWRFbnRpdHlTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBWb2lkRW50aXR5U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZvaWRFbnRpdHlTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWb2lkRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdGlvbiB0eXBlIGEgYml0IGxpa2UgQXJyYXlMaXN0IGJ1dCBkb2VzIG5vdCBwcmVzZXJ2ZSB0aGUgb3JkZXIgb2YgaXRzXG4gICAgICogZW50aXRpZXMsIHNwZWVkd2lzZSBpdCBpcyB2ZXJ5IGdvb2QsIGVzcGVjaWFsbHkgc3VpdGVkIGZvciBnYW1lcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBVdGlsc1xuICAgICAqIEBjbGFzcyBCYWdcbiAgICAgKiBAbmFtZXNwYWNlIFV0aWxzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gQmFnKCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnRhaW5zIGFsbCBvZiB0aGUgZWxlbWVudHNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkYXRhXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGlzIEJhZy4gZG9lcyB0aGlzIGJ5XG4gICAgICAgICAqIG92ZXJ3cml0aW5nIGl0IHdhcyBsYXN0IGVsZW1lbnQgdGhlbiByZW1vdmluZyBsYXN0IGVsZW1lbnRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSAgeyp9IGluZGV4IHRoZSBpbmRleCBvZiBlbGVtZW50IHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICogQHJldHVybiB7Kn0gZWxlbWVudCB0aGF0IHdhcyByZW1vdmVkIGZyb20gdGhlIEJhZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBpbmRleCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGRhdGEuaW5kZXhPZihpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlb2YgaW5kZXggPT09ICdudW1iZXInICYmIGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZGF0YS5zcGxpY2UoaW5kZXgsIDEpWzBdIHx8IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KHJlc3BvbnNlICE9PSBudWxsLCBcIkFyZSB5b3Ugc3VyZSB0aGVyZSB3YXNuJ3QgYW4gZWxlbWVudCBpbiB0aGUgYmFnP1wiKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgYW5kIHJldHVybiB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlTGFzdFxuICAgICAgICAgKiBAcmV0dXJuIHsqfG51bGx9IHRoZSBsYXN0IG9iamVjdCBpbiB0aGUgYmFnLCBudWxsIGlmIGVtcHR5LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVMYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgYmFnIGNvbnRhaW5zIHRoaXMgZWxlbWVudC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1ldGhvZCBjb250YWluc1xuICAgICAgICAgKiBAcGFyYW0geyp9IG9ialxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb250YWlucyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuaW5kZXhPZihvYmopICE9PSAtMTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGZyb20gdGhpcyBCYWcgYWxsIG9mIGl0cyBlbGVtZW50cyB0aGF0IGFyZSBjb250YWluZWQgaW4gdGhlXG4gICAgICAgICAqIHNwZWNpZmllZCBCYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUFsbFxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gYmFnIGNvbnRhaW5pbmcgZWxlbWVudHMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoaXMgQmFnXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBCYWcgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiB0aGUgY2FsbCwgZWxzZSBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVBbGwgPSBmdW5jdGlvbihiYWcpIHtcbiAgICAgICAgICAgIHZhciBtb2RpZmllZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIG4gPSBiYWcuc2l6ZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT09IG47ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSBiYWcuZ2V0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5yZW1vdmUob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbiBCYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gcmV0dXJuXG4gICAgICAgICAqIEByZXR1cm4geyp8bnVsbH0gdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbiBiYWcgb3IgbnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaW5kZXhdID8gZGF0YVtpbmRleF0gOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2Qgc2l6ZVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0aGUgYmFnIGNhbiBob2xkIHdpdGhvdXQgZ3Jvd2luZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2FwYWNpdHlcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRoZSBiYWcgY2FuIGhvbGQgd2l0aG91dCBncm93aW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDYXBhY2l0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7IC8vIHNsaWdodGx5IGZpeGVkIF5eXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBpbnRlcm5hbCBzdG9yYWdlIHN1cHBvcnRzIHRoaXMgaW5kZXguXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzSW5kZXhXaXRoaW5Cb3VuZHNcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzSW5kZXhXaXRoaW5Cb3VuZHMgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4IDwgdGhpcy5nZXRDYXBhY2l0eSgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGxpc3QgY29udGFpbnMgbm8gZWxlbWVudHMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzRW1wdHlcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBpcyBlbXB0eSwgZWxzZSBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5sZW5ndGggPT09IDA7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgdG8gdGhlIGVuZCBvZiB0aGlzIGJhZy4gaWYgbmVlZGVkIGFsc29cbiAgICAgICAgICogaW5jcmVhc2VzIHRoZSBjYXBhY2l0eSBvZiB0aGUgYmFnLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRcbiAgICAgICAgICogQHBhcmFtIHsqfSBvYmogZWxlbWVudCB0byBiZSBhZGRlZCB0byB0aGlzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2gob2JqKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZWxlbWVudCBhdCBzcGVjaWZpZWQgaW5kZXggaW4gdGhlIGJhZy4gTmV3IGluZGV4IHdpbGwgZGVzdHJveSBzaXplXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggaW5kZXggcG9zaXRpb24gb2YgZWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0geyp9IG9iaiB0aGUgZWxlbWVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbihpbmRleCwgb2JqKSB7XG4gICAgICAgICAgICBkYXRhW2luZGV4XSA9IG9iajtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXRob2QgdmVyaWZ5IHRoZSBjYXBhY2l0eSBvZiB0aGUgYmFnXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuc3VyZUNhcGFjaXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuc3VyZUNhcGFjaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBqdXN0IGZvciBjb21wYXRpYmlsaXR5IHdpdGggb3J5Z2luYWwgaWRlZVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgYmFnLiBUaGUgYmFnIHdpbGwgYmUgZW1wdHkgYWZ0ZXJcbiAgICAgICAgICogdGhpcyBjYWxsIHJldHVybnMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkYXRhLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFsbCBpdGVtcyBpbnRvIHRoaXMgYmFnLiBcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkQWxsXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBiYWcgYWRkZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQWxsID0gZnVuY3Rpb24oYmFnKSB7XG4gICAgICAgICAgICB2YXIgaSA9IGJhZy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZChiYWcuZ2V0KGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBCYWc7XG59KCkpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAYXV0aG9yIGluZXhwbGljYWJsZVxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2luZXhwbGljYWJsZS9iaXRzZXRcbiAgICAgKi9cblxuICAgIC8vY29uc3RydWN0b3JcbiAgICB2YXIgQml0U2V0ID0gZnVuY3Rpb24gQml0U2V0KCkge1xuXG4gICAgICAgIC8vX3dvcmRzIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIDMyYml0cyBpbnRlZ2VycywgamF2YXNjcmlwdCBkb2Vzbid0IHJlYWxseSBoYXZlIGludGVnZXJzIHNlcGFyYXRlZCBmcm9tIE51bWJlciB0eXBlXG4gICAgICAgIC8vaXQncyBsZXNzIHBlcmZvcm1hbnQgYmVjYXVzZSBvZiB0aGF0LCBudW1iZXIgKGJ5IGRlZmF1bHQgZmxvYXQpIHdvdWxkIGJlIGludGVybmFsbHkgY29udmVydGVkIHRvIDMyYml0cyBpbnRlZ2VyIHRoZW4gYWNjZXB0cyB0aGUgYml0IG9wZXJhdGlvbnNcbiAgICAgICAgLy9jaGVja2VkIEJ1ZmZlciB0eXBlLCBidXQgbmVlZHMgdG8gaGFuZGxlIGV4cGFuc2lvbi9kb3duc2l6ZSBieSBhcHBsaWNhdGlvbiwgY29tcHJvbWlzZWQgdG8gdXNlIG51bWJlciBhcnJheSBmb3Igbm93LlxuICAgICAgICB0aGlzLl93b3JkcyA9IFtdO1xuICAgIH07XG5cbiAgICB2YXIgQklUU19PRl9BX1dPUkQgPSAzMixcbiAgICAgICAgU0hJRlRTX09GX0FfV09SRCA9IDU7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBpbmRleCBhdCB0aGUgd29yZHMgYXJyYXlcbiAgICAgKi9cbiAgICB2YXIgd2hpY2hXb3JkID0gZnVuY3Rpb24ocG9zKXtcbiAgICAgICAgLy9hc3N1bWVkIHBvcyBpcyBub24tbmVnYXRpdmUsIGd1YXJkZWQgYnkgI3NldCwgI2NsZWFyLCAjZ2V0IGV0Yy5cbiAgICAgICAgcmV0dXJuIHBvcyA+PiBTSElGVFNfT0ZfQV9XT1JEO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGEgYml0IG1hc2sgb2YgMzIgYml0cywgMSBiaXQgc2V0IGF0IHBvcyAlIDMyLCB0aGUgcmVzdCBiZWluZyAwXG4gICAgICovXG4gICAgdmFyIG1hc2sgPSBmdW5jdGlvbihwb3Mpe1xuICAgICAgICByZXR1cm4gMSA8PCAocG9zICYgMzEpO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICByZXR1cm4gdGhpcy5fd29yZHNbd2hpY2hXb3JkKHBvcyldIHw9IG1hc2socG9zKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyB0aGUgYml0IHNwZWNpZmllZCBieSB0aGUgaW5kZXggdG8gZmFsc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIGlmKCFwb3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmRzW3doaWNoV29yZChwb3MpXSAmPSB+bWFzayhwb3MpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgYml0IHdpdGggdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwb3Mge251bWJlcn0gYml0IGluZGV4XG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICByZXR1cm4gdGhpcy5fd29yZHNbd2hpY2hXb3JkKHBvcyldICYgbWFzayhwb3MpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBcImxvZ2ljYWwgc2l6ZVwiIG9mIHRoaXMgQml0U2V0OiB0aGUgaW5kZXggb2YgdGhlIGhpZ2hlc3Qgc2V0IGJpdCBpbiB0aGUgQml0U2V0IHBsdXMgb25lLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLndvcmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93b3Jkcy5sZW5ndGg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIEJpdFNldCBjb250YWlucyBubyBiaXRzIHRoYXQgYXJlIHNldCB0byB0cnVlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgQml0U2V0LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuX3dvcmRzLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgbnVtYmVyIG9mIGJpdHMgc2V0IHRvIHRydWUgaW4gdGhpcyBCaXRTZXQuXG4gICAgICogSXMgbXVjaCBmYXN0ZXIgdGhhbiBCaXRTZXQgbGliIG9mIENvZmZlZVNjcmlwdCwgaXQgZmFzdCBza2lwcyAwIHZhbHVlIHdvcmRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIEJpdFNldC5wcm90b3R5cGUuY2FyZGluYWxpdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQsIHN1bSA9IDAsIGFyck9mV29yZHMgPSB0aGlzLl93b3JkcywgbWF4V29yZHMgPSB0aGlzLndvcmRzKCk7XG4gICAgICAgIGZvcihuZXh0ID0gMDsgbmV4dCA8IG1heFdvcmRzOyBuZXh0Kyspe1xuICAgICAgICAgICAgdmFyIG5leHRXb3JkID0gYXJyT2ZXb3Jkc1tuZXh0XSB8fCAwO1xuICAgICAgICAgICAgLy90aGlzIGxvb3BzIG9ubHkgdGhlIG51bWJlciBvZiBzZXQgYml0cywgbm90IDMyIGNvbnN0YW50IGFsbCB0aGUgdGltZSFcbiAgICAgICAgICAgIGZvcih2YXIgYml0cyA9IG5leHRXb3JkOyBiaXRzICE9PSAwOyBiaXRzICY9IChiaXRzIC0gMSkpe1xuICAgICAgICAgICAgICAgIHN1bSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdW07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhpcyBCaXRTZXQgaW50ZXJzZWN0cyB0aGUgc3BlY2lmaWVkIEJpdFNldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qml0U2V0fSBiaXRTZXRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihiaXRTZXQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IE1hdGgubWluKHRoaXMuX3dvcmRzLCBiaXRTZXQuX3dvcmRzKSAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBpZiAoKHRoaXMuX3dvcmRzW2ldICYgYml0U2V0Ll93b3Jkc1tpXSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEJpdFNldC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fd29yZHMgPSBbXTtcbiAgICB9O1xuXG4gICAgQml0U2V0LnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uKHNldCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gc2V0KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHQsIGNvbW1vbnMgPSBNYXRoLm1pbih0aGlzLndvcmRzKCksIHNldC53b3JkcygpKTtcbiAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IGNvbW1vbnM7IG5leHQrKykge1xuICAgICAgICAgICAgdGhpcy5fd29yZHNbbmV4dF0gfD0gc2V0Ll93b3Jkc1tuZXh0XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9ucyA8IHNldC53b3JkcygpKSB7XG4gICAgICAgICAgICB0aGlzLl93b3JkcyA9IHRoaXMuX3dvcmRzLmNvbmNhdChzZXQuX3dvcmRzLnNsaWNlKGNvbW1vbnMsIHNldC53b3JkcygpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHNldFxuICAgICAqIEByZXR1cm4ge0JpdFNldH0gdGhpcyBCaXRTZXQgYWZ0ZXIgYW5kIG9wZXJhdGlvblxuICAgICAqXG4gICAgICogdGhpcyBpcyBtdWNoIG1vcmUgcGVyZm9ybWFudCB0aGFuIENvZmZlZVNjcmlwdCdzIEJpdFNldCNhbmQgb3BlcmF0aW9uIGJlY2F1c2Ugd2UnbGwgY2hvcCB0aGUgemVybyB2YWx1ZSB3b3JkcyBhdCB0YWlsLlxuICAgICAqL1xuICAgIEJpdFNldC5wcm90b3R5cGUuYW5kID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICAgIGlmICh0aGlzID09PSBzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHQsXG4gICAgICAgICAgICBjb21tb25zID0gTWF0aC5taW4odGhpcy53b3JkcygpLCBzZXQud29yZHMoKSksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuXG4gICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCBjb21tb25zOyBuZXh0KyspIHtcbiAgICAgICAgICAgIHdvcmRzW25leHRdICY9IHNldC5fd29yZHNbbmV4dF07XG4gICAgICAgIH1cbiAgICAgICAgaWYoY29tbW9ucyA+IHNldC53b3JkcygpKXtcbiAgICAgICAgICAgIHZhciBsZW4gPSBjb21tb25zIC0gc2V0LndvcmRzKCk7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIHdvcmRzLnBvcCgpOy8vdXNpbmcgcG9wIGluc3RlYWQgb2YgYXNzaWduIHplcm8gdG8gcmVkdWNlIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LCBhbmQgZmFzdGVuIHRoZSBzdWJzZXF1ZW50ICNhbmQgb3BlcmF0aW9ucy5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgQml0U2V0LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IHNldCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXh0LCBjb21tb25zID0gTWF0aC5taW4odGhpcy53b3JkcygpLCBzZXQud29yZHMoKSk7XG4gICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCBjb21tb25zOyBuZXh0KyspIHtcbiAgICAgICAgICAgIHRoaXMuX3dvcmRzW25leHRdIF49IHNldC5fd29yZHNbbmV4dF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbnMgPCBzZXQud29yZHMoKSkge1xuICAgICAgICAgICAgdGhpcy5fd29yZHMgPSB0aGlzLl93b3Jkcy5jb25jYXQoc2V0Ll93b3Jkcy5zbGljZShjb21tb25zLCBzZXQud29yZHMoKSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiB0aGlzIGlzIHRoZSBjcml0aWNhbCBwaWVjZSBtaXNzaW5nIGZyb20gQ29mZmVlU2NyaXB0J3MgQml0U2V0IGxpYiwgd2UgdXN1YWxseSBqdXN0IG5lZWQgdG8ga25vdyB0aGUgbmV4dCBzZXQgYml0IGlmIGFueS5cbiAgICAgKiBpdCBmYXN0IHNraXBzIDAgdmFsdWUgd29yZCBhcyAjY2FyZGluYWxpdHkgZG9lcywgdGhpcyBpcyBlc3AuIGltcG9ydGFudCBiZWNhdXNlIG9mIG91ciB1c2FnZSwgYWZ0ZXIgc2VyaWVzIG9mICNhbmQgb3BlcmF0aW9uc1xuICAgICAqIGl0J3MgaGlnaGx5IGxpa2VseSB0aGF0IG1vc3Qgb2YgdGhlIHdvcmRzIGxlZnQgYXJlIHplcm8gdmFsdWVkLCBhbmQgYnkgc2tpcHBpbmcgYWxsIG9mIHN1Y2gsIHdlIGNvdWxkIGxvY2F0ZSB0aGUgYWN0dWFsIGJpdCBzZXQgbXVjaCBmYXN0ZXIuXG4gICAgICogQHBhcmFtIHBvc1xuICAgICAqIEByZXR1cm4ge251bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLm5leHRTZXRCaXQgPSBmdW5jdGlvbihwb3Mpe1xuXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KHBvcyA+PSAwLCBcInBvc2l0aW9uIG11c3QgYmUgbm9uLW5lZ2F0aXZlXCIpO1xuXG4gICAgICAgIHZhciBuZXh0ID0gd2hpY2hXb3JkKHBvcyksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuICAgICAgICAvL2JleW9uZCBtYXggd29yZHNcbiAgICAgICAgaWYobmV4dCA+PSB3b3Jkcy5sZW5ndGgpe1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhlIHZlcnkgZmlyc3Qgd29yZFxuICAgICAgICB2YXIgZmlyc3RXb3JkID0gd29yZHNbbmV4dF0sXG4gICAgICAgICAgICBtYXhXb3JkcyA9IHRoaXMud29yZHMoKSxcbiAgICAgICAgICAgIGJpdDtcbiAgICAgICAgaWYoZmlyc3RXb3JkKXtcbiAgICAgICAgICAgIGZvcihiaXQgPSBwb3MgJiAzMTsgYml0IDwgQklUU19PRl9BX1dPUkQ7IGJpdCArPSAxKXtcbiAgICAgICAgICAgICAgICBpZigoZmlyc3RXb3JkICYgbWFzayhiaXQpKSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobmV4dCA8PCBTSElGVFNfT0ZfQV9XT1JEKSArIGJpdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yKG5leHQgPSBuZXh0ICsgMTsgbmV4dCA8IG1heFdvcmRzOyBuZXh0ICs9IDEpe1xuICAgICAgICAgICAgdmFyIG5leHRXb3JkID0gd29yZHNbbmV4dF07XG4gICAgICAgICAgICBpZihuZXh0V29yZCl7XG4gICAgICAgICAgICAgICAgZm9yKGJpdCA9IDA7IGJpdCA8IEJJVFNfT0ZfQV9XT1JEOyBiaXQgKz0gMSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKChuZXh0V29yZCAmIG1hc2soYml0KSkgIT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuZXh0IDw8IFNISUZUU19PRl9BX1dPUkQpICsgYml0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KC0xLCBcIml0IHNob3VsZCBoYXZlIGZvdW5kIHNvbWUgYml0IGluIHRoaXMgd29yZDogXCIgKyBuZXh0V29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBbiByZXZlcnNlZCBsb29rdXAgY29tcGFyZWQgd2l0aCAjbmV4dFNldEJpdFxuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIEJpdFNldC5wcm90b3R5cGUucHJldlNldEJpdCA9IGZ1bmN0aW9uKHBvcyl7XG5cbiAgICAgICAgY29uc29sZS5hc3NlcnQocG9zID49IDAsIFwicG9zaXRpb24gbXVzdCBiZSBub24tbmVnYXRpdmVcIik7XG5cbiAgICAgICAgdmFyIHByZXYgPSB3aGljaFdvcmQocG9zKSxcbiAgICAgICAgICAgIHdvcmRzID0gdGhpcy5fd29yZHM7XG4gICAgICAgIC8vYmV5b25kIG1heCB3b3Jkc1xuICAgICAgICBpZihwcmV2ID49IHdvcmRzLmxlbmd0aCl7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGUgdmVyeSBsYXN0IHdvcmRcbiAgICAgICAgdmFyIGxhc3RXb3JkID0gd29yZHNbcHJldl0sXG4gICAgICAgICAgICBiaXQ7XG4gICAgICAgIGlmKGxhc3RXb3JkKXtcbiAgICAgICAgICAgIGZvcihiaXQgPSBwb3MgJiAzMTsgYml0ID49MDsgYml0LS0pe1xuICAgICAgICAgICAgICAgIGlmKChsYXN0V29yZCAmIG1hc2soYml0KSkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHByZXYgPDwgU0hJRlRTX09GX0FfV09SRCkgKyBiaXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvcihwcmV2ID0gcHJldiAtIDE7IHByZXYgPj0gMDsgcHJldi0tKXtcbiAgICAgICAgICAgIHZhciBwcmV2V29yZCA9IHdvcmRzW3ByZXZdO1xuICAgICAgICAgICAgaWYocHJldldvcmQpe1xuICAgICAgICAgICAgICAgIGZvcihiaXQgPSBCSVRTX09GX0FfV09SRCAtIDE7IGJpdCA+PSAwOyBiaXQtLSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKChwcmV2V29yZCAmIG1hc2soYml0KSkgIT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmV2IDw8IFNISUZUU19PRl9BX1dPUkQpICsgYml0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KC0xLCBcIml0IHNob3VsZCBoYXZlIGZvdW5kIHNvbWUgYml0IGluIHRoaXMgd29yZDogXCIgKyBwcmV2V29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24ocmFkaXgpe1xuICAgICAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgICAgICByZXR1cm4gJ1snICt0aGlzLl93b3Jkcy50b1N0cmluZygpICsgJ10nO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJpdFNldDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogSGFzaE1hcFxuICAgICAqXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgVXRpbHNcbiAgICAgKiBAY2xhc3MgSGFzaE1hcFxuICAgICAqIEBuYW1lc3BhY2UgVXRpbHNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODYzODkwMC9qYXZhc2NyaXB0LWNyYzMyLzE4NjM5OTk5IzE4NjM5OTk5XG4gICAgICovXG4gICAgZnVuY3Rpb24gSGFzaE1hcCgpIHtcblxuICAgICAgICB2YXIgZGF0YSA9IFtdLFxuICAgICAgICAgICAgX2xlbmd0aCA9IDA7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibGVuZ3RoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBfbGVuZ3RoOyB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyY1RhYmxlKCl7XG4gICAgICAgICAgICB2YXIgYztcbiAgICAgICAgICAgIHZhciBjcmMgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgbiA9MDsgbiA8IDI1NjsgbisrKXtcbiAgICAgICAgICAgICAgICBjID0gbjtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGsgPTA7IGsgPCA4OyBrKyspe1xuICAgICAgICAgICAgICAgICAgICBjID0gKChjJjEpID8gKDB4RURCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JjW25dID0gYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjcmM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBtZXRob2QgZ2VuZXJhdGUgY3JjMzIgZXhhY3RseSBmcm9tIHN0cmluZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ga2V5XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBoYXNoKGtleSkge1xuICAgICAgICAgICAgdmFyIHN0ciA9IEpTT04uc3RyaW5naWZ5KGtleSk7XG4gICAgICAgICAgICB2YXIgY3JjID0gMCBeICgtMSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB2YWx1ZSBmb3IgYSBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGtleVxuICAgICAgICAgKiBAcmV0dXJucyB7KnxudWxsfSBGb3IgZmFsc2UgcmV0dXJucyBudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaGFzaChrZXkpXSB8fCBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdmFsdWUgZm9yIGEgc3BlY2lmaWMga2V5XG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEha2V5LCBcImtleSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIGRhdGFbaGFzaChrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgKytfbGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgdGhhdCBrZXkgZXhpc3RcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRhaW5zS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGhhc2goa2V5KSkgIT09IC0xO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdmFsdWUgZnJvbSBzcGVjaWZpYyBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IGRhdGEuaW5kZXhPZihoYXNoKGtleSkpO1xuICAgICAgICAgICAgaWYoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgLS1fbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBzaXplXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX2xlbmd0aDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFsbCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtIYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICAgICAgX2xlbmd0aCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzID0gSGFzaE1hcDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBkZWxheVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgZGVsYXk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgcmVwZWF0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB2YXIgcmVwZWF0O1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFjY1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgYWNjO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGRvbmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBkb25lO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHN0b3BwZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBzdG9wcGVkO1xuXG5cbiAgICAvKipcbiAgICAgKiBUaW1lclxuICAgICAqXG4gICAgICogQGNsYXNzIFRpbWVyXG4gICAgICogQG5hbWVzcGFjZSBVdGlsc1xuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAc3VibW9kdWxlIFV0aWxzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IF9kZWxheVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gX3JlcGVhdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBUaW1lciA9IGZ1bmN0aW9uIFRpbWVyKF9kZWxheSwgX3JlcGVhdCkge1xuICAgICAgICBkZWxheSA9IF9kZWxheTtcbiAgICAgICAgcmVwZWF0ID0gX3JlcGVhdCB8fCBmYWxzZTtcbiAgICAgICAgYWNjID0gMDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIHRpbWVyXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBkZWx0YVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICAgICAgaWYoIWRvbmUgJiYgIXN0b3BlZCkge1xuICAgICAgICAgICAgICAgIGFjYyArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjID49IGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGFjYyAtPSBkZWxheTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzZXQgdGltZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjYyA9IDA7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiBpcyBkb25lIG90aGVyd2lzZSBmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNEb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIGlzIHJ1bm5pbmcgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhZG9uZSAmJiBhY2MgPCBkZWxheSAmJiAhc3RvcHBlZDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcCB0aW1lclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIF9kZWxheVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXREZWxheSA9IGZ1bmN0aW9uKF9kZWxheSkge1xuICAgICAgICAgICAgZGVsYXkgPSBfZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGVjdXRlID0gZnVuY3Rpb24oKSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0UGVyY2VudGFnZVJlbWFpbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0b3BwZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEgLSAoZGVsYXkgLSBhY2MpIC8gZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbn0pKCk7Il19
