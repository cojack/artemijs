!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ArtemiJS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        this.all = function() {
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
        this.exclude = function() {
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
     * @param {String} type* a required component type
     * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
     */
    Aspect.getAspectForAll = function() {
        var aspect = new Aspect();
        aspect.all(arguments);
        return aspect;
    };


    /**
     * Creates an aspect where an entity must possess one of the specified component types.
     *
     * @method getAspectForOne
     * @param {String} type* one of the types the entity must possess
     * @return {ArtemiJS.Aspect} an aspect that can be matched against entities
     */
    Aspect.getAspectForOne = function() {
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
     * @return {ArtemiJS.Aspect} an empty Aspect that will reject all entities.
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
        }

        this.toString = function() {
            return "ComponentType["+type.getSimpleName()+"] ("+index+")";
        }
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
         * @type {Utils.BitSet}
         */
        var allSet = aspect.getAllSet();
        
        /**
         * @private
         * @property exclusionSet
         * @type {Utils.BitSet}
         */
        var exclusionSet = aspect.getExclusionSet();
        
        /**
         * @private
         * @property oneSet
         * @type {Utils.BitSet}
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
         * @param {Boolean} passive
         */
        this.setPassive = function(_passive) {
            passive = _passive;
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

        console.info("Welcome to ArtemiJS, component oriented framework!")
        
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
         * @type {HashMap}
         */
        var entitiesByGroup = new HashMap(),
        
        /**
         * @private
         * @property groupsByEntity
         * @type {HashMap}
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
            console.assert(!!entity, "Entity is null or undefined");
            console.assert(group.length > 0, "Group is empty");
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
            console.assert(!!entity, "Entity is null or undefined");
            console.assert(group.length > 0, "Group is empty");
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
            console.assert(!!entity, "Entity is null or undefined");
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
         * @param {String} group name of the group
         * @return {Bag} entities
         */
        this.getEntities = function(group) {
            console.assert(group.length > 0, "Group is empty");
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
            return this.getGroups(entity) !== null;
        };

        /**
         * Check is entity in group
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
})();
},{"./../Manager":11,"./../utils/Bag":26,"./../utils/HashMap":28}],14:[function(require,module,exports){
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

        this.initialize = function() {}
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
    if (x >>> 16 == 0) { n += 16; x <<= 16; }
    if (x >>> 24 == 0) { n +=  8; x <<=  8; }
    if (x >>> 28 == 0) { n +=  4; x <<=  4; }
    if (x >>> 30 == 0) { n +=  2; x <<=  2; }
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
        }
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
        }
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

        var length = 0;
            
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
                --length;
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
         * @return {*} the last object in the bag, null if empty.
         */
        this.removeLast = function() {
            if(length > 0) {
                return this.remove(length-1);
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
            return length === 0;
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
            ++length;
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
            ++length;
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
            length = 0;
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

    var BitSet = function BitSet() {

        /*
         * BitSets are packed into arrays of "words."  Currently a word is
         * a long, which consists of 64 bits, requiring 6 address bits.
         * The choice of word size is determined purely by performance concerns.
         */
        var ADDRESS_BITS_PER_WORD = 6;
        var BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;

        /* Used to shift left or right for a partial word mask */
        var WORD_MASK = 0xffffffffffffffff;

        var _words = [];

        var _wordsInUse = 0;

        function expandTo(wordIndex) {
            var wordsRequired = wordIndex+1;
            if (_wordsInUse < wordsRequired) {
                _wordsInUse = wordsRequired;
            }
        }

        function wordIndex(bitIndex) {
            return bitIndex >> ADDRESS_BITS_PER_WORD;
        }

        Object.defineProperties(this, {
            "wordsInUse": {
                get: function() { return _wordsInUse; }
            },
            "words": {
                get: function() { return _words; }
            }
        });

        this.set = function(bitIndex) {
            var _wordIndex = wordIndex(bitIndex);
            _words[_wordIndex] |= (1 << bitIndex);
            expandTo(_wordIndex);
        };

        this.get = function(bitIndex) {
            var _wordIndex = wordIndex(bitIndex);
            return (_wordIndex < _wordsInUse) && ((_words[_wordIndex] & (1 << bitIndex)) != 0);
        };

        this.clear = function() {
            _words = [];
        };

        this.isEmpty = function() {
            return _wordsInUse == 0;
        };

        /**
         *
         * @param {BitSet} bitSet
         * @returns {boolean}
         */
        this.intersects = function(bitSet) {
            for (var i = Math.min(_wordsInUse, bitSet.wordsInUse) - 1; i >= 0; i--)
                if ((_words[i] & bitSet.words[i]) != 0)
                    return true;
            return false;
        };

        /**
         *
         * @param {Number} fromIndex
         * @returns {*}
         */
        this.nextSetBit = function(fromIndex) {
            var u = wordIndex(fromIndex);
            if (u >= _wordsInUse)
                return -1;

            var word = _words[u] & (WORD_MASK << fromIndex);

            while (true) {
                if (word != 0)
                    return (u * BITS_PER_WORD) + Number.numberOfTrailingZeros(word);
                if (++u == _wordsInUse)
                    return -1;
                word = _words[u];
            }
        };
    };

    module.exports = BitSet;
})();
},{}],28:[function(require,module,exports){
(function(){
    'use strict';

    function makeCRCTable(){
        var c;
        var crcTable = [];
        for(var n =0; n < 256; n++){
            c = n;
            for(var k =0; k < 8; k++){
                c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    }

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

        var data = [];

        var _length = 0;

        Object.defineProperty(this, "length", {
            get: function() { return _length; }
        });

        if(!self.crcTable) {
            self.crcTable = makeCRCTable()
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
                crc = (crc >>> 8) ^ self.crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
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
        }

    };

    module.exports = Timer;
})();
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2hvbWUvY29qYWNrLy5udm0vdjAuMTAuMjkvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQXJ0ZW1pLmpzIiwic3JjL0FzcGVjdC5qcyIsInNyYy9Db21wb25lbnQuanMiLCJzcmMvQ29tcG9uZW50TWFuYWdlci5qcyIsInNyYy9Db21wb25lbnRNYXBwZXIuanMiLCJzcmMvQ29tcG9uZW50VHlwZS5qcyIsInNyYy9FbnRpdHkuanMiLCJzcmMvRW50aXR5TWFuYWdlci5qcyIsInNyYy9FbnRpdHlPYnNlcnZlci5qcyIsInNyYy9FbnRpdHlTeXN0ZW0uanMiLCJzcmMvTWFuYWdlci5qcyIsInNyYy9Xb3JsZC5qcyIsInNyYy9tYW5hZ2Vycy9Hcm91cE1hbmFnZXIuanMiLCJzcmMvbWFuYWdlcnMvUGxheWVyTWFuYWdlci5qcyIsInNyYy9tYW5hZ2Vycy9UYWdNYW5hZ2VyLmpzIiwic3JjL21hbmFnZXJzL1RlYW1NYW5hZ2VyLmpzIiwic3JjL25hdGl2ZS9BcnJheS5qcyIsInNyYy9uYXRpdmUvTWF0aC5qcyIsInNyYy9uYXRpdmUvTnVtYmVyLmpzIiwic3JjL25hdGl2ZS9PYmplY3QuanMiLCJzcmMvc3lzdGVtcy9EZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL0VudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVN5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL1ZvaWRFbnRpdHlTeXN0ZW0uanMiLCJzcmMvdXRpbHMvQmFnLmpzIiwic3JjL3V0aWxzL0JpdFNldC5qcyIsInNyYy91dGlscy9IYXNoTWFwLmpzIiwic3JjL3V0aWxzL1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vbmF0aXZlL09iamVjdCcpO1xucmVxdWlyZSgnLi9uYXRpdmUvQXJyYXknKTtcbnJlcXVpcmUoJy4vbmF0aXZlL01hdGgnKTtcbnJlcXVpcmUoJy4vbmF0aXZlL051bWJlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIC8vIHRoaXMgZmlsZSBoYXZlIHRvIGJlIGluY2x1ZGVkIGZpcnN0IGluIHl1aWNvbXByZXNzb3JcbiAgICBcbiAgICAvKipcbiAgICAgKiBFbnRpdHkgRnJhbWV3b3JrXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBBcnRlbWlKU1xuICAgICAqIEBtYWluIEFydGVtaUpTXG4gICAgICovXG4gICAgdmFyIEFydGVtaUpTID0ge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7TnVtYmVyfSB2ZXJzaW9uXG4gICAgICAgICAqL1xuICAgICAgICB2ZXJzaW9uOiAwLjEsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtTdHJpbmd9IHNvdXJjZVxuICAgICAgICAgKi9cbiAgICAgICAgc291cmNlOiAnaHR0cHM6Ly9naXRodWIuY29tL2NvamFjay9hcnRlbWlqcycsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtTdHJpbmd9IGxpY2Vuc2VcbiAgICAgICAgICovXG4gICAgICAgIGxpY2Vuc2U6ICdHUEx2MicsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtOdW1iZXJ9IGVudlxuICAgICAgICAgKi9cbiAgICAgICAgZW52OiAxIC8vIDEgLSBkZXYsIDIgLSB0ZXN0LCA0IC0gcHJvZFxuICAgIH07XG4gICAgXG4gICAgQXJ0ZW1pSlMuTWFuYWdlcnMgPSB7XG4gICAgICAgIEdyb3VwTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9Hcm91cE1hbmFnZXInKSxcbiAgICAgICAgUGxheWVyTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9QbGF5ZXJNYW5hZ2VyJyksXG4gICAgICAgIFRhZ01hbmFnZXI6IHJlcXVpcmUoJy4vbWFuYWdlcnMvVGFnTWFuYWdlcicpLFxuICAgICAgICBUZWFtTWFuYWdlcjogcmVxdWlyZSgnLi9tYW5hZ2Vycy9UZWFtTWFuYWdlcicpXG4gICAgfTtcbiAgICBcbiAgICBBcnRlbWlKUy5TeXN0ZW1zID0ge1xuICAgICAgICBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0RlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW06IHJlcXVpcmUoJy4vc3lzdGVtcy9FbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0ludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbScpLFxuICAgICAgICBJbnRlcnZhbEVudGl0eVN5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0ludGVydmFsRW50aXR5U3lzdGVtJyksXG4gICAgICAgIFZvaWRFbnRpdHlTeXN0ZW06IHJlcXVpcmUoJy4vc3lzdGVtcy9Wb2lkRW50aXR5U3lzdGVtJylcbiAgICB9O1xuICAgIFxuICAgIEFydGVtaUpTLlV0aWxzID0ge1xuICAgICAgICBCYWc6IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIEJpdFNldDogcmVxdWlyZSgnLi91dGlscy9CaXRTZXQnKSxcbiAgICAgICAgSGFzaE1hcDogcmVxdWlyZSgnLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIFRpbWVyOiByZXF1aXJlKCcuL3V0aWxzL1RpbWVyJylcbiAgICB9O1xuICAgIFxuICAgIEFydGVtaUpTLkFzcGVjdCA9IHJlcXVpcmUoJy4vQXNwZWN0Jyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Db21wb25lbnQnKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50TWFwcGVyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYXBwZXInKTtcbiAgICBBcnRlbWlKUy5Db21wb25lbnRUeXBlID0gcmVxdWlyZSgnLi9Db21wb25lbnRUeXBlJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5ID0gcmVxdWlyZSgnLi9FbnRpdHknKTtcbiAgICBBcnRlbWlKUy5FbnRpdHlNYW5hZ2VyID0gcmVxdWlyZSgnLi9FbnRpdHlNYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5T2JzZXJ2ZXIgPSByZXF1aXJlKCcuL0VudGl0eU9ic2VydmVyJyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBBcnRlbWlKUy5NYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyk7XG4gICAgQXJ0ZW1pSlMuV29ybGQgPSByZXF1aXJlKCcuL1dvcmxkJyk7XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBBcnRlbWlKUztcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBCaXRTZXQgPSByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBDb21wb25lbnRUeXBlID0gcmVxdWlyZSgnLi9Db21wb25lbnRUeXBlJyk7XG5cbiAgICAvKipcbiAgICAgKiBBbiBBc3BlY3RzIGlzIHVzZWQgYnkgc3lzdGVtcyBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcywgdG8gY2hlY2sgaWYgYSBzeXN0ZW0gaXNcbiAgICAgKiBpbnRlcmVzdGVkIGluIGFuIGVudGl0eS4gQXNwZWN0cyBkZWZpbmUgd2hhdCBzb3J0IG9mIGNvbXBvbmVudCB0eXBlcyBhbiBlbnRpdHkgbXVzdFxuICAgICAqIHBvc3Nlc3MsIG9yIG5vdCBwb3NzZXNzLlxuICAgICAqIFxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBBIGFuZCBCIGFuZCBDOlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcylcbiAgICAgKiBcbiAgICAgKiBUaGlzIGNyZWF0ZXMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgQSBhbmQgQiBhbmQgQywgYnV0IG11c3Qgbm90IHBvc3Nlc3MgVSBvciBWLlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKVxuICAgICAqIFxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBBIGFuZCBCIGFuZCBDLCBidXQgbXVzdCBub3QgcG9zc2VzcyBVIG9yIFYsIGJ1dCBtdXN0IHBvc3Nlc3Mgb25lIG9mIFggb3IgWSBvciBaLlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKS5vbmUoWC5rbGFzcywgWS5rbGFzcywgWi5rbGFzcylcbiAgICAgKlxuICAgICAqIFlvdSBjYW4gY3JlYXRlIGFuZCBjb21wb3NlIGFzcGVjdHMgaW4gbWFueSB3YXlzOlxuICAgICAqIEFzcGVjdC5nZXRFbXB0eSgpLm9uZShYLmtsYXNzLCBZLmtsYXNzLCBaLmtsYXNzKS5hbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKVxuICAgICAqIGlzIHRoZSBzYW1lIGFzOlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKS5vbmUoWC5rbGFzcywgWS5rbGFzcywgWi5rbGFzcylcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEFzcGVjdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBBc3BlY3QgPSBmdW5jdGlvbiBBc3BlY3QoKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFsbFNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFsbFNldCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZXhjbHVzaW9uU2V0XG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqLyAgICAgICAgXG4gICAgICAgIGV4Y2x1c2lvblNldCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGV4Y2x1c2lvblNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi8gICAgICAgICAgICAgICAgXG4gICAgICAgIG9uZVNldCA9IG5ldyBCaXRTZXQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRBbGxTZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRBbGxTZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxTZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRFeGNsdXNpb25TZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFeGNsdXNpb25TZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBleGNsdXNpb25TZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRPbmVTZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRPbmVTZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBvbmVTZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBhbGwgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBhIHJlcXVpcmVkIGNvbXBvbmVudCB0eXBlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIGFsbFNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcihhcmd1bWVudHNbbGVuXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRXhjbHVkZXMgYWxsIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzIGZyb20gdGhlIGFzcGVjdC4gQSBzeXN0ZW0gd2lsbCBub3QgYmVcbiAgICAgICAgICogaW50ZXJlc3RlZCBpbiBhbiBlbnRpdHkgdGhhdCBwb3NzZXNzZXMgb25lIG9mIHRoZSBzcGVjaWZpZWQgZXhjbHVzaW9uIGNvbXBvbmVudCB0eXBlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZXhjbHVkZVxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBjb21wb25lbnQgdHlwZSB0byBleGNsdWRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4Y2x1ZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBleGNsdXNpb25TZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IoYXJndW1lbnRzW2xlbl0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3Mgb25lIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBvbmVcbiAgICAgICAgICogQGNoYWluYWJsZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSogb25lIG9mIHRoZSB0eXBlcyB0aGUgZW50aXR5IG11c3QgcG9zc2Vzc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vbmUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgb25lU2V0LnNldChDb21wb25lbnRUeXBlLmdldEluZGV4Rm9yKGFyZ3VtZW50c1tsZW5dKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBhbGwgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvckFsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBhIHJlcXVpcmVkIGNvbXBvbmVudCB0eXBlXG4gICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQXNwZWN0fSBhbiBhc3BlY3QgdGhhdCBjYW4gYmUgbWF0Y2hlZCBhZ2FpbnN0IGVudGl0aWVzXG4gICAgICovXG4gICAgQXNwZWN0LmdldEFzcGVjdEZvckFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICBhc3BlY3QuYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBvbmUgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvck9uZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBvbmUgb2YgdGhlIHR5cGVzIHRoZSBlbnRpdHkgbXVzdCBwb3NzZXNzXG4gICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQXNwZWN0fSBhbiBhc3BlY3QgdGhhdCBjYW4gYmUgbWF0Y2hlZCBhZ2FpbnN0IGVudGl0aWVzXG4gICAgICovXG4gICAgQXNwZWN0LmdldEFzcGVjdEZvck9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICBhc3BlY3Qub25lKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGFuIGVtcHR5IGFzcGVjdC4gVGhpcyBjYW4gYmUgdXNlZCBpZiB5b3Ugd2FudCBhIHN5c3RlbSB0aGF0IHByb2Nlc3NlcyBubyBlbnRpdGllcywgYnV0XG4gICAgICogc3RpbGwgZ2V0cyBpbnZva2VkLiBUeXBpY2FsIHVzYWdlcyBpcyB3aGVuIHlvdSBuZWVkIHRvIGNyZWF0ZSBzcGVjaWFsIHB1cnBvc2Ugc3lzdGVtcyBmb3IgZGVidWcgcmVuZGVyaW5nLFxuICAgICAqIGxpa2UgcmVuZGVyaW5nIEZQUywgaG93IG1hbnkgZW50aXRpZXMgYXJlIGFjdGl2ZSBpbiB0aGUgd29ybGQsIGV0Yy5cbiAgICAgKiBcbiAgICAgKiBZb3UgY2FuIGFsc28gdXNlIHRoZSBhbGwsIG9uZSBhbmQgZXhjbHVkZSBtZXRob2RzIG9uIHRoaXMgYXNwZWN0LCBzbyBpZiB5b3Ugd2FudGVkIHRvIGNyZWF0ZSBhIHN5c3RlbSB0aGF0XG4gICAgICogcHJvY2Vzc2VzIG9ubHkgZW50aXRpZXMgcG9zc2Vzc2luZyBqdXN0IG9uZSBvZiB0aGUgY29tcG9uZW50cyBBIG9yIEIgb3IgQywgdGhlbiB5b3UgY2FuIGRvOlxuICAgICAqIEFzcGVjdC5nZXRFbXB0eSgpLm9uZShBLEIsQyk7XG4gICAgICogXG4gICAgICogQG1ldGhvZCBnZXRFbXB0eVxuICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkFzcGVjdH0gYW4gZW1wdHkgQXNwZWN0IHRoYXQgd2lsbCByZWplY3QgYWxsIGVudGl0aWVzLlxuICAgICAqL1xuICAgIEFzcGVjdC5nZXRFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEFzcGVjdCgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFzcGVjdDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBBIHRhZyBjbGFzcy4gQWxsIGNvbXBvbmVudHMgaW4gdGhlIHN5c3RlbSBtdXN0IGV4dGVuZCB0aGlzIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KCkge31cblxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBDb21wb25lbnRNYW5hZ2VyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudE1hbmFnZXIgPSBmdW5jdGlvbiBDb21wb25lbnRNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudHNCeVR5cGVcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBjb21wb25lbnRzQnlUeXBlID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWxldGVkXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVkID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVDb21wb25lbnRzT2ZFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRCaXRzID0gZW50aXR5LmdldENvbXBvbmVudEJpdHMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoMCk7IGkgPj0gMDsgaSA9IGNvbXBvbmVudEJpdHMubmV4dFNldEJpdChpKzEpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5VHlwZS5nZXQoaSkuc2V0KGVudGl0eS5nZXRJZCgpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudEJpdHMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgY29tcG9uZW50IGJ5IHR5cGVcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlLCBjb21wb25lbnQpIHsgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLnNldCh0eXBlLmdldEluZGV4KCksIGNvbXBvbmVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnRzLnNldChlbnRpdHkuZ2V0SWQoKSwgY29tcG9uZW50KTtcbiAgICBcbiAgICAgICAgICAgIGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCkuc2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGNvbXBvbmVudCBieSB0eXBlXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVDb21wb25lbnQgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUpIHtcbiAgICAgICAgICAgIGlmKGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCkuZ2V0KHR5cGUuZ2V0SW5kZXgoKSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpLnNldChlbnRpdHkuZ2V0SWQoKSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5jbGVhcih0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnQgYnkgdHlwZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRzQnlUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CYWd9IEJhZyBvZiBjb21wb25lbnRzXG4gICAgICAgICAqLyAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50c0J5VHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gY29tcG9uZW50c0J5VHlwZS5nZXQodHlwZS5nZXRJbmRleCgpKTtcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuc2V0KHR5cGUuZ2V0SW5kZXgoKSwgY29tcG9uZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKiBAcmV0dXJuIE1peGVkIENvbXBvbmVudCBvbiBzdWNjZXNzLCBudWxsIG9uIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRzLmdldChlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY29tcG9uZW50IGZvclxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRzRm9yXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGZpbGxCYWcgQmFnIG9mIGNvbXBvbmVudHNcbiAgICAgICAgICogQHJldHVybiB7QmFnfSBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzRm9yID0gZnVuY3Rpb24oZW50aXR5LCBmaWxsQmFnKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Qml0cyA9IGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCk7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gY29tcG9uZW50Qml0cy5uZXh0U2V0Qml0KDApOyBpID49IDA7IGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoaSsxKSkge1xuICAgICAgICAgICAgICAgIGZpbGxCYWcuYWRkKGNvbXBvbmVudHNCeVR5cGUuZ2V0KGkpLmdldChlbnRpdHkuZ2V0SWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmlsbEJhZztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgZW50aXR5IHRvIGRlbGV0ZSBjb21wb25lbmV0cyBvZiB0aGVtXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkZWxldGVkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFuIGRlbGV0ZWQgY29tcG9uZW5ldHMgb2YgZW50aXRpZXNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKGRlbGV0ZWQuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGRlbGV0ZWQuc2l6ZSgpID4gaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eShkZWxldGVkLmdldChpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIENvbXBvbmVudE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgQ29tcG9uZW50TWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wb25lbnRNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50TWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuL0NvbXBvbmVudCcpLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHZhciBDb21wb25lbnRUeXBlIENvbXBvbmVudFR5cGVcbiAgICAgICAgICovXG4gICAgICAgIENvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcblxuICAgIC8qKlxuICAgICAqIEhpZ2ggcGVyZm9ybWFuY2UgY29tcG9uZW50IHJldHJpZXZhbCBmcm9tIGVudGl0aWVzLiBVc2UgdGhpcyB3aGVyZXZlciB5b3VcbiAgICAgKiBuZWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcyBvZnRlbiBhbmQgZmFzdC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIENvbXBvbmVudE1hcHBlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBfdHlwZVxuICAgICAqIEBwYXJhbSB7V29ybGR9IF93b3JsZFxuICAgICAqL1xuICAgIHZhciBDb21wb25lbnRNYXBwZXIgPSBmdW5jdGlvbiBDb21wb25lbnRNYXBwZXIoX3R5cGUsIF93b3JsZCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkge0NvbXBvbmVudFR5cGV9IHR5cGUgVHlwZSBvZiBjb21wb25lbnRcbiAgICAgICAgICovXG4gICAgICAgIHZhciB0eXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKF90eXBlKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gY29tcG9uZW50cyBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50cyA9IF93b3JsZC5nZXRDb21wb25lbnRNYW5hZ2VyKCkuZ2V0Q29tcG9uZW50c0J5VHlwZSh0eXBlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRmFzdCBidXQgdW5zYWZlIHJldHJpZXZhbCBvZiBhIGNvbXBvbmVudCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIE5vIGJvdW5kaW5nIGNoZWNrcywgc28gdGhpcyBjb3VsZCByZXR1cm4gbnVsbCxcbiAgICAgICAgICogaG93ZXZlciBpbiBtb3N0IHNjZW5hcmlvcyB5b3UgYWxyZWFkeSBrbm93IHRoZSBlbnRpdHkgcG9zc2Vzc2VzIHRoaXMgY29tcG9uZW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRcbiAgICAgICAgICogQHBhcmFtIGVudGl0eSBFbnRpdHlcbiAgICAgICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQ29tcG9uZW50fXxudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHMuZ2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYXN0IGFuZCBzYWZlIHJldHJpZXZhbCBvZiBhIGNvbXBvbmVudCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIElmIHRoZSBlbnRpdHkgZG9lcyBub3QgaGF2ZSB0aGlzIGNvbXBvbmVudCB0aGVuIG51bGwgaXMgcmV0dXJuZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFNhZmVcbiAgICAgICAgICogQHBhcmFtIGVudGl0eSBFbnRpdHlcbiAgICAgICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQ29tcG9uZW50fXxudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFNhZmUgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudHMuaXNJbmRleFdpdGhpbkJvdW5kcyhlbnRpdHkuZ2V0SWQoKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cy5nZXQoZW50aXR5LmdldElkKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBlbnRpdHkgaGFzIHRoaXMgdHlwZSBvZiBjb21wb25lbnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGhhc1xuICAgICAgICAgKiBAcGFyYW0ge0FydGVtaUpTLkVudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEByZXR1cm4gYm9vbGVhbiB0cnVlIGlmIHRoZSBlbnRpdHkgaGFzIHRoaXMgY29tcG9uZW50IHR5cGUsIGZhbHNlIGlmIGl0IGRvZXNuJ3QuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmhhcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2FmZShlbnRpdHkpICE9PSBudWxsO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGNvbXBvbmVudCBtYXBwZXIgZm9yIHRoaXMgdHlwZSBvZiBjb21wb25lbnRzLlxuICAgICAqIFxuICAgICAqIEBtZXRob2QgZ2V0Rm9yXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlIHRoZSB0eXBlIG9mIGNvbXBvbmVudHMgdGhpcyBtYXBwZXIgdXNlc1xuICAgICAqIEBwYXJhbSB7V29ybGR9IHdvcmxkIHRoZSB3b3JsZCB0aGF0IHRoaXMgY29tcG9uZW50IG1hcHBlciBzaG91bGQgdXNlXG4gICAgICogQHJldHVybiB7Q29tcG9uZW50TWFwcGVyfVxuICAgICAqL1xuICAgIENvbXBvbmVudE1hcHBlci5nZXRGb3IgPSBmdW5jdGlvbih0eXBlLCB3b3JsZCkge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudE1hcHBlcih0eXBlLCB3b3JsZCk7XG4gICAgfTtcbiAgICBcbiAgICBDb21wb25lbnRNYXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBDb21wb25lbnRNYXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcG9uZW50TWFwcGVyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50TWFwcGVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIElOREVYID0gMCxcbiAgICAgICAgY29tcG9uZW50VHlwZXMgPSBuZXcgSGFzaE1hcCgpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50VHlwZVxuICAgICAqL1xuICAgIHZhciBDb21wb25lbnRUeXBlID0gZnVuY3Rpb24gQ29tcG9uZW50VHlwZShfdHlwZSkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB0eXBlXG4gICAgICAgICAqIEB0eXBlIHtBcnRlbWlKUy5Db21wb25lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgdHlwZSA9IF90eXBlLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpbmRleFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgaW5kZXggPSBJTkRFWCsrO1xuXG4gICAgICAgIHRoaXMuZ2V0SW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkNvbXBvbmVudFR5cGVbXCIrdHlwZS5nZXRTaW1wbGVOYW1lKCkrXCJdIChcIitpbmRleCtcIilcIjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqXG4gICAgICovXG4gICAgQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHZhciBfdHlwZSA9IGNvbXBvbmVudFR5cGVzLmdldChjb21wb25lbnQpO1xuICAgICAgICBpZighX3R5cGUpIHtcbiAgICAgICAgICAgIF90eXBlID0gIG5ldyBDb21wb25lbnRUeXBlKF90eXBlKTtcbiAgICAgICAgICAgIGNvbXBvbmVudFR5cGVzLnB1dChjb21wb25lbnQsIF90eXBlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3R5cGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICovXG4gICAgQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvciA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlRm9yKGNvbXBvbmVudCkuZ2V0SW5kZXgoKTtcbiAgICB9O1xuXG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRUeXBlO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBCaXRTZXQgPSByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBDb21wb25lbnRUeXBlID0gcmVxdWlyZSgnLi9Db21wb25lbnRUeXBlJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IGNsYXNzLiBDYW5ub3QgYmUgaW5zdGFudGlhdGVkIG91dHNpZGUgdGhlIGZyYW1ld29yaywgeW91IG11c3RcbiAgICAgKiBjcmVhdGUgbmV3IGVudGl0aWVzIHVzaW5nIFdvcmxkLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtXb3JsZH0gX3dvcmxkXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IF9pZFxuICAgICAqLyBcbiAgICBmdW5jdGlvbiBFbnRpdHkoX3dvcmxkLCBfaWQpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgdXVpZFxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHV1aWQsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudEJpdHNcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudEJpdHMgPSBuZXcgQml0U2V0KCksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzeXN0ZW1CaXRzXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICBzeXN0ZW1CaXRzID0gbmV3IEJpdFNldCgpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB3b3JsZFxuICAgICAgICAgKiBAdHlwZSB7V29ybGR9XG4gICAgICAgICAqL1xuICAgICAgICB3b3JsZCA9IF93b3JsZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGlkID0gX2lkLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBlbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtFbnRpdHlNYW5hZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgZW50aXR5TWFuYWdlciA9IHdvcmxkLmdldEVudGl0eU1hbmFnZXIoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7Q29tcG9uZW50TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudE1hbmFnZXIgPSB3b3JsZC5nZXRDb21wb25lbnRNYW5hZ2VyKCk7XG4gICAgICAgIFxuICAgICAgICByZXNldCgpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBpbnRlcm5hbCBpZCBmb3IgdGhpcyBlbnRpdHkgd2l0aGluIHRoZSBmcmFtZXdvcmsuIE5vIG90aGVyIGVudGl0eVxuICAgICAgICAgKiB3aWxsIGhhdmUgdGhlIHNhbWUgSUQsIGJ1dCBJRCdzIGFyZSBob3dldmVyIHJldXNlZCBzbyBhbm90aGVyIGVudGl0eSBtYXlcbiAgICAgICAgICogYWNxdWlyZSB0aGlzIElEIGlmIHRoZSBwcmV2aW91cyBlbnRpdHkgd2FzIGRlbGV0ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldElkXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0SWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgQml0U2V0IGluc3RhbmNlIGNvbnRhaW5pbmcgYml0cyBvZiB0aGUgY29tcG9uZW50cyB0aGUgZW50aXR5IHBvc3Nlc3Nlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q29tcG9uZW50Qml0c1xuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudEJpdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRCaXRzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBCaXRTZXQgaW5zdGFuY2UgY29udGFpbmluZyBiaXRzIG9mIHRoZSBjb21wb25lbnRzIHRoZSBlbnRpdHkgcG9zc2Vzc2VzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRTeXN0ZW1CaXRzXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtQml0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN5c3RlbUJpdHM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHN5c3RlbXMgQml0U2V0XG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIHJlc2V0XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIHN5c3RlbUJpdHMuY2xlYXIoKTtcbiAgICAgICAgICAgIGNvbXBvbmVudEJpdHMuY2xlYXIoKTtcbiAgICAgICAgICAgIHV1aWQgPSBNYXRoLnV1aWQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ha2UgZW50aXR5IHJlYWR5IGZvciByZS11c2UuXG4gICAgICAgICAqIFdpbGwgZ2VuZXJhdGUgYSBuZXcgdXVpZCBmb3IgdGhlIGVudGl0eS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiRW50aXR5IFtcIiArIGlkICsgXCJdXCI7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGEgY29tcG9uZW50IHRvIHRoaXMgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRDb21wb25lbnRcbiAgICAgICAgICogQGNoYWluYWJsZVxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gW3R5cGVdXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uKGNvbXBvbmVudCwgdHlwZSkge1xuICAgICAgICAgICAgaWYoISh0eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKGNvbXBvbmVudC5nZXRDbGFzcygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudE1hbmFnZXIuYWRkQ29tcG9uZW50KHRoaXMsIHR5cGUsIGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgY29tcG9uZW50IGJ5IGl0cyB0eXBlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVDb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnR9IFtjb21wb25lbnRdXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUNvbXBvbmVudCA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgICBpZighKGNvbXBvbmVudCBpbnN0YW5jZW9mIENvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSA9IENvbXBvbmVudFR5cGUuZ2V0VHlwZUZvcihjb21wb25lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gY29tcG9uZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50TWFuYWdlci5yZW1vdmVDb21wb25lbnQodGhpcywgY29tcG9uZW50VHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBlbnRpdHkgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkIGFuZCBoYXMgbm90IGJlZW4gZGVsZXRlZCBmcm9tIGl0LlxuICAgICAgICAgKiBJZiB0aGUgZW50aXR5IGhhcyBiZWVuIGRpc2FibGVkIHRoaXMgd2lsbCBzdGlsbCByZXR1cm4gdHJ1ZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaXNBY3RpdmVcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHlNYW5hZ2VyLmlzQWN0aXZlKHRoaXMuaWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaXNFbmFibGVkXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzRW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuaXNFbmFibGVkKHRoaXMuaWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgaXMgdGhlIHByZWZlcnJlZCBtZXRob2QgdG8gdXNlIHdoZW4gcmV0cmlldmluZyBhIGNvbXBvbmVudCBmcm9tIGFcbiAgICAgICAgICogZW50aXR5LiBJdCB3aWxsIHByb3ZpZGUgZ29vZCBwZXJmb3JtYW5jZS5cbiAgICAgICAgICogQnV0IHRoZSByZWNvbW1lbmRlZCB3YXkgdG8gcmV0cmlldmUgY29tcG9uZW50cyBmcm9tIGFuIGVudGl0eSBpcyB1c2luZ1xuICAgICAgICAgKiB0aGUgQ29tcG9uZW50TWFwcGVyLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSBbdHlwZV1cbiAgICAgICAgICogICAgICBpbiBvcmRlciB0byByZXRyaWV2ZSB0aGUgY29tcG9uZW50IGZhc3QgeW91IG11c3QgcHJvdmlkZSBhXG4gICAgICAgICAqICAgICAgQ29tcG9uZW50VHlwZSBpbnN0YW5jZSBmb3IgdGhlIGV4cGVjdGVkIGNvbXBvbmVudC5cbiAgICAgICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQ29tcG9uZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50VHlwZTtcbiAgICAgICAgICAgIGlmKCEodHlwZSBpbnN0YW5jZW9mIENvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSA9IENvbXBvbmVudFR5cGUuZ2V0VHlwZUZvcih0eXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQodGhpcywgY29tcG9uZW50VHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIGJhZyBvZiBhbGwgY29tcG9uZW50cyB0aGlzIGVudGl0eSBoYXMuXG4gICAgICAgICAqIFlvdSBuZWVkIHRvIHJlc2V0IHRoZSBiYWcgeW91cnNlbGYgaWYgeW91IGludGVuZCB0byBmaWxsIGl0IG1vcmUgdGhhbiBvbmNlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRzXG4gICAgICAgICAqIEBwYXJhbSB7VXRpbHMuQmFnfSBmaWxsQmFnIHRoZSBiYWcgdG8gcHV0IHRoZSBjb21wb25lbnRzIGludG8uXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJhZ30gdGhlIGZpbGxCYWcgd2l0aCB0aGUgY29tcG9uZW50cyBpbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50cyA9IGZ1bmN0aW9uKGZpbGxCYWcpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRNYW5hZ2VyLmdldENvbXBvbmVudHNGb3IodGhpcywgZmlsbEJhZyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVmcmVzaCBhbGwgY2hhbmdlcyB0byBjb21wb25lbnRzIGZvciB0aGlzIGVudGl0eS4gQWZ0ZXIgYWRkaW5nIG9yXG4gICAgICAgICAqIHJlbW92aW5nIGNvbXBvbmVudHMsIHlvdSBtdXN0IGNhbGwgdGhpcyBtZXRob2QuIEl0IHdpbGwgdXBkYXRlIGFsbFxuICAgICAgICAgKiByZWxldmFudCBzeXN0ZW1zLiBJdCBpcyB0eXBpY2FsIHRvIGNhbGwgdGhpcyBhZnRlciBhZGRpbmcgY29tcG9uZW50cyB0byBhXG4gICAgICAgICAqIG5ld2x5IGNyZWF0ZWQgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRUb1dvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZFRvV29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdvcmxkLmFkZEVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGVudGl0eSBoYXMgY2hhbmdlZCwgYSBjb21wb25lbnQgYWRkZWQgb3IgZGVsZXRlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZEluV29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZEluV29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdvcmxkLmNoYW5nZWRFbnRpdHkodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIHRoaXMgZW50aXR5IGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVGcm9tV29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlRnJvbVdvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5kZWxldGVFbnRpdHkodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogKFJlKWVuYWJsZSB0aGUgZW50aXR5IGluIHRoZSB3b3JsZCwgYWZ0ZXIgaXQgaGF2aW5nIGJlaW5nIGRpc2FibGVkLlxuICAgICAgICAgKiBXb24ndCBkbyBhbnl0aGluZyB1bmxlc3MgaXQgd2FzIGFscmVhZHkgZGlzYWJsZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdvcmxkLmVuYWJsZUVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBlbnRpdHkgZnJvbSBiZWluZyBwcm9jZXNzZWQuIFdvbid0IGRlbGV0ZSBpdCwgaXQgd2lsbFxuICAgICAgICAgKiBjb250aW51ZSB0byBleGlzdCBidXQgd29uJ3QgZ2V0IHByb2Nlc3NlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3b3JsZC5kaXNhYmxlRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB0aGUgVVVJRCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIFRoaXMgVVVJRCBpcyB1bmlxdWUgcGVyIGVudGl0eSAocmUtdXNlZCBlbnRpdGllcyBnZXQgYSBuZXcgVVVJRCkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFV1aWRcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfSB1dWlkIGluc3RhbmNlIGZvciB0aGlzIGVudGl0eS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VXVpZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgd29ybGQgdGhpcyBlbnRpdHkgYmVsb25ncyB0by5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0V29ybGRcbiAgICAgICAgICogQHJldHVybiB7V29ybGR9IHdvcmxkIG9mIGVudGl0aWVzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRXb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHdvcmxkO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIEJpdFNldCA9IHJlcXVpcmUoJy4vdXRpbHMvQml0U2V0JyksXG4gICAgICAgIEVudGl0eSA9IHJlcXVpcmUoJy4vRW50aXR5JyksXG4gICAgICAgIE1hbmFnZXIgPSByZXF1aXJlKCcuL01hbmFnZXInKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgbWFuYWdlciBjbGFzcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eU1hbmFnZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi8gXG4gICAgdmFyIEVudGl0eU1hbmFnZXIgPSBmdW5jdGlvbiBFbnRpdHlNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0aWVzXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZW50aXRpZXMgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRpc2FibGVkXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlZCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBhY3RpdmUgPSAwLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhZGRlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkZWQgPSAwLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjcmVhdGVkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVkID0gMCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGVsZXRlZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlZCA9IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGlkZW50aWZpZXJQb29sXG4gICAgICAgICAqIEB0eXBlIHtJZGVudGlmaWVyUG9vbH1cbiAgICAgICAgICovXG4gICAgICAgIGlkZW50aWZpZXJQb29sID0gbmV3IElkZW50aWZpZXJQb29sKCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbGl6ZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBuZXcgZW50aXR5IGluc3RhbmNlXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNyZWF0ZUVudGl0eUluc3RhbmNlXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3JlYXRlRW50aXR5SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBlbnRpdHkgPSBuZXcgRW50aXR5KHRoaXMud29ybGQsIGlkZW50aWZpZXJQb29sLmNoZWNrT3V0KCkpO1xuICAgICAgICAgICAgKytjcmVhdGVkO1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGFkZGVkIGZvciBmdXR1cmUgcHJvY2Vzc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICArK2FjdGl2ZTtcbiAgICAgICAgICAgICsrYWRkZWQ7XG4gICAgICAgICAgICBlbnRpdGllcy5zZXQoZW50aXR5LmdldElkKCksIGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVudGl0eSBhcyBlbmFibGVkIGZvciBmdXR1cmUgcHJvY2Vzc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZGlzYWJsZWQuY2xlYXIoZW50aXR5LmdldElkKCkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBlbnRpdHkgYXMgZGlzYWJsZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGRpc2FibGVkLnNldChlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVudGl0eSBhcyBkZWxldGVkIGZvciBmdXR1cmUgcHJvY2Vzc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXRpZXMuc2V0KGVudGl0eS5nZXRJZCgpLCBudWxsKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGlzYWJsZWQuY2xlYXIoZW50aXR5LmdldElkKCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZGVudGlmaWVyUG9vbC5jaGVja0luKGVudGl0eS5nZXRJZCgpKTtcblxuICAgICAgICAgICAgLS1hY3RpdmU7XG4gICAgICAgICAgICArK2RlbGV0ZWQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgdGhpcyBlbnRpdHkgaXMgYWN0aXZlLlxuICAgICAgICAgKiBBY3RpdmUgbWVhbnMgdGhlIGVudGl0eSBpcyBiZWluZyBhY3RpdmVseSBwcm9jZXNzZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzQWN0aXZlXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBlbnRpdHlJZFxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGFjdGl2ZSwgZmFsc2UgaWYgbm90XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZnVuY3Rpb24oZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllcy5nZXQoZW50aXR5SWQpICE9PSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgZW50aXR5SWQgaXMgZW5hYmxlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaXNFbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBlbnRpdHlJZFxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGVuYWJsZWQsIGZhbHNlIGlmIGl0IGlzIGRpc2FibGVkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzRW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gIWRpc2FibGVkLmdldChlbnRpdHlJZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGEgZW50aXR5IHdpdGggdGhpcyBpZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0RW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBlbnRpdHlJZFxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXMuZ2V0KGVudGl0eUlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgaG93IG1hbnkgZW50aXRpZXMgYXJlIGFjdGl2ZSBpbiB0aGlzIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRBY3RpdmVFbnRpdHlDb3VudFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGVudGl0aWVzIGFyZSBjdXJyZW50bHkgYWN0aXZlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRBY3RpdmVFbnRpdHlDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAvKipcbiAgICAgICAgICogR2V0IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBjcmVhdGVkIGluIHRoZSB3b3JsZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICogTm90ZTogQSBjcmVhdGVkIGVudGl0eSBtYXkgbm90IGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQsIHRodXNcbiAgICAgICAgICogY3JlYXRlZCBjb3VudCBpcyBhbHdheXMgZXF1YWwgb3IgbGFyZ2VyIHRoYW4gYWRkZWQgY291bnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFRvdGFsQ3JlYXRlZFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBjcmVhdGVkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRUb3RhbENyZWF0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVkO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFRvdGFsQWRkZWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gYWRkZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFRvdGFsQWRkZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhZGRlZDtcbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gZGVsZXRlZCBmcm9tIHRoZSB3b3JsZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0VG90YWxEZWxldGVkXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGRlbGV0ZWQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFRvdGFsRGVsZXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlbGV0ZWQ7XG4gICAgICAgIH07XG4gICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVzZWQgb25seSBpbnRlcm5hbGx5IGluIEVudGl0eU1hbmFnZXIgdG8gZ2VuZXJhdGUgZGlzdGluY3QgaWRzIGZvclxuICAgICAgICAgKiBlbnRpdGllcyBhbmQgcmV1c2UgdGhlbVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAgICAgKiBAY2xhc3MgSWRlbnRpZmllclBvb2xcbiAgICAgICAgICogQGZvciBFbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqIEBmaW5hbFxuICAgICAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIElkZW50aWZpZXJQb29sKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBpZHNcbiAgICAgICAgICAgICAqIEB0eXBlIHtVdGlscy5CYWd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciBpZHMgPSBuZXcgQmFnKCksXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IG5leHRBdmFpbGFibGVJZFxuICAgICAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbmV4dEF2YWlsYWJsZUlkID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBDaGVjayBhbiBhdmFpbGFibGUgaWRcbiAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICogQG1ldGhvZCBjaGVja091dFxuICAgICAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBuZXh0IGF2YWlsYWJsZSBpZFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNoZWNrT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoaWRzLnNpemUoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWRzLnJlbW92ZUxhc3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICsrbmV4dEF2YWlsYWJsZUlkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBBZGQgbmV3IGlkIGluIGlkcyB7QmFnfVxuICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGNoZWNrSW5cbiAgICAgICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNoZWNrSW4gPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGlkKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5TWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IG9ic2VydmVyIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5T2JzZXJ2ZXJcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi8gXG4gICAgZnVuY3Rpb24gRW50aXR5T2JzZXJ2ZXIoKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGFkZGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gY2hhbmdlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGVsZXRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGRlbGV0ZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBlbmFibGVkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gZGlzYWJsZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5T2JzZXJ2ZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyksXG4gICAgICAgIEVudGl0eU9ic2VydmVyID0gcmVxdWlyZSgnLi9FbnRpdHlPYnNlcnZlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gZ2VuZXJhdGUgYSB1bmlxdWUgYml0IGZvciBlYWNoIHN5c3RlbS5cbiAgICAgKiBPbmx5IHVzZWQgaW50ZXJuYWxseSBpbiBFbnRpdHlTeXN0ZW0uXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBTeXN0ZW1JbmRleE1hbmFnZXJcbiAgICAgKiBAZm9yIEVudGl0eVN5c3RlbVxuICAgICAqIEBmaW5hbFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBTeXN0ZW1JbmRleE1hbmFnZXIgPSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IElOREVYXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBJTkRFWDogMCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgaW5kaWNlc1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICBpbmRpY2VzOiB7fSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEluZGV4Rm9yXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5U3lzdGVtfSBlbnRpdHlTeXN0ZW1cbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBpbmRleFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0SW5kZXhGb3I6IGZ1bmN0aW9uKGVudGl0eVN5c3RlbSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5pbmRpY2VzW2VudGl0eVN5c3RlbV07XG4gICAgICAgICAgICBpZighaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMuSU5ERVgrKztcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljZXNbZW50aXR5U3lzdGVtXSA9IGluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgbW9zdCByYXcgZW50aXR5IHN5c3RlbS4gSXQgc2hvdWxkIG5vdCB0eXBpY2FsbHkgYmUgdXNlZCwgYnV0IHlvdSBjYW4gXG4gICAgICogY3JlYXRlIHlvdXIgb3duIGVudGl0eSBzeXN0ZW0gaGFuZGxpbmcgYnkgZXh0ZW5kaW5nIHRoaXMuIEl0IGlzIFxuICAgICAqIHJlY29tbWVuZGVkIHRoYXQgeW91IHVzZSB0aGUgb3RoZXIgcHJvdmlkZWQgZW50aXR5IHN5c3RlbSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEVudGl0eVN5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBhc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkXG4gICAgICogICAgICBhc3BlY3QgYXMgYSBtYXRjaGVyIGFnYWluc3QgZW50aXRpZXMuXG4gICAgICovXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIEVudGl0eVN5c3RlbShhc3BlY3QpIHtcbiAgICAgICAgRW50aXR5T2JzZXJ2ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgd29ybGRcbiAgICAgICAgICogQHR5cGUge1dvcmxkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53b3JsZCA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQGZpbmFsXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzeXN0ZW1JbmRleFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN5c3RlbUluZGV4ID0gU3lzdGVtSW5kZXhNYW5hZ2VyLmdldEluZGV4Rm9yKHRoaXMuZ2V0Q2xhc3MoKSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFjdGl2ZXNcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhY3RpdmVzID0gbmV3IEJhZygpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhbGxTZXRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhbGxTZXQgPSBhc3BlY3QuZ2V0QWxsU2V0KCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGV4Y2x1c2lvblNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGV4Y2x1c2lvblNldCA9IGFzcGVjdC5nZXRFeGNsdXNpb25TZXQoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgb25lU2V0XG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgb25lU2V0ID0gYXNwZWN0LmdldE9uZVNldCgpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBwYXNzaXZlXG4gICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHBhc3NpdmU7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGR1bW15XG4gICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGR1bW15ID0gYWxsU2V0LmlzRW1wdHkoKSAmJiBvbmVTZXQuaXNFbXB0eSgpO1xuXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVGcm9tU3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUZyb21TeXN0ZW0oZW50aXR5KSB7XG4gICAgICAgICAgICBhY3RpdmVzLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICAgICAgZW50aXR5LmdldFN5c3RlbUJpdHMoKS5jbGVhcihzeXN0ZW1JbmRleCk7XG4gICAgICAgICAgICBtZS5yZW1vdmVkKGVudGl0eSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgaW5zZXJ0VG9TeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gaW5zZXJ0VG9TeXN0ZW0oZW50aXR5KSB7XG4gICAgICAgICAgICBhY3RpdmVzLmFkZChlbnRpdHkpO1xuICAgICAgICAgICAgZW50aXR5LmdldFN5c3RlbUJpdHMoKS5zZXQoc3lzdGVtSW5kZXgpO1xuICAgICAgICAgICAgbWUuaW5zZXJ0ZWQoZW50aXR5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBiZWZvcmUgcHJvY2Vzc2luZyBvZiBlbnRpdGllcyBiZWdpbnNcbiAgICAgICAgICpcbiAgICAgICAgICogQG1ldGhvZCBiZWdpblxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5iZWdpbiA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvY2VzcyB0aGUgZW50aXRpZXNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcHJvY2Vzc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcm9jZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLmNoZWNrUHJvY2Vzc2luZygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZWdpbigpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzKGFjdGl2ZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIGFmdGVyIHRoZSBwcm9jZXNzaW5nIG9mIGVudGl0aWVzIGVuZHNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZW5kXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuZCA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQW55IGltcGxlbWVudGluZyBlbnRpdHkgc3lzdGVtIG11c3QgaW1wbGVtZW50IHRoaXMgbWV0aG9kIGFuZCB0aGUgXG4gICAgICAgICAqIGxvZ2ljIHRvIHByb2Nlc3MgdGhlIGdpdmVuIGVudGl0aWVzIG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHByb2Nlc3NFbnRpdGllc1xuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gZW50aXRpZXMgYXRoZSBlbnRpdGllcyB0aGlzIHN5c3RlbSBjb250YWluc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgdGhlIHN5c3RlbSBzaG91bGQgcHJvY2Vzc2luZ1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1Byb2Nlc3NpbmdcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiB0aGUgc3lzdGVtIHNob3VsZCBiZSBwcm9jZXNzZWQsIGZhbHNlIGlmIG5vdFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGVja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE92ZXJyaWRlIHRvIGltcGxlbWVudCBjb2RlIHRoYXQgZ2V0cyBleGVjdXRlZCB3aGVuIHN5c3RlbXMgYXJlIFxuICAgICAgICAgKiBpbml0aWFsaXplZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgaWYgdGhlIHN5c3RlbSBoYXMgcmVjZWl2ZWQgYSBlbnRpdHkgaXQgaXMgaW50ZXJlc3RlZCBpbiwgXG4gICAgICAgICAqIGUuZy4gY3JlYXRlZCBvciBhIGNvbXBvbmVudCB3YXMgYWRkZWQgdG8gaXQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluc2VydGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdGhlIGVudGl0eSB0aGF0IHdhcyBhZGRlZCB0byB0aGlzIHN5c3RlbVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbnNlcnRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIGlmIGEgZW50aXR5IHdhcyByZW1vdmVkIGZyb20gdGhpcyBzeXN0ZW0sIGUuZy4gZGVsZXRlZCBcbiAgICAgICAgICogb3IgaGFkIG9uZSBvZiBpdCdzIGNvbXBvbmVudHMgcmVtb3ZlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRoZSBlbnRpdHkgdGhhdCB3YXMgcmVtb3ZlZCBmcm9tIHRoaXMgc3lzdGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVkID0gZnVuY3Rpb24oZW50aXR5KSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaWxsIGNoZWNrIGlmIHRoZSBlbnRpdHkgaXMgb2YgaW50ZXJlc3QgdG8gdGhpcyBzeXN0ZW0uXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNoZWNrXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdGhlIGVudGl0eSB0byBjaGVja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGVjayA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoZHVtbXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY29udGFpbnMgPSBlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmdldChzeXN0ZW1JbmRleCk7XG4gICAgICAgICAgICB2YXIgaW50ZXJlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Qml0cyA9IGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCFhbGxTZXQuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGFsbFNldC5uZXh0U2V0Qml0KDApOyBpID49IDA7IGkgPSBhbGxTZXQubmV4dFNldEJpdChpKzEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCFjb21wb25lbnRCaXRzLmdldChpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJlc3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICAgICAgICBcbiAgICAgICAgICAgIGlmKCFleGNsdXNpb25TZXQuaXNFbXB0eSgpICYmIGludGVyZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJlc3RlZCA9ICFleGNsdXNpb25TZXQuaW50ZXJzZWN0cyhjb21wb25lbnRCaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVudGl0eSBwb3NzZXNzZXMgQU5ZIG9mIHRoZSBjb21wb25lbnRzIGluIHRoZSBvbmVTZXQuIElmIHNvLCB0aGUgc3lzdGVtIGlzIGludGVyZXN0ZWQuXG4gICAgICAgICAgICBpZighb25lU2V0LmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcmVzdGVkID0gb25lU2V0LmludGVyc2VjdHMoY29tcG9uZW50Qml0cyk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBpZiAoaW50ZXJlc3RlZCAmJiAhY29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0VG9TeXN0ZW0oZW50aXR5KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWludGVyZXN0ZWQgJiYgY29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbVN5c3RlbShlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoZW50aXR5LmdldFN5c3RlbUJpdHMoKS5nZXQoc3lzdGVtSW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRnJvbVN5c3RlbShlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgaWYoZW50aXR5LmdldFN5c3RlbUJpdHMoKS5nZXQoc3lzdGVtSW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRnJvbVN5c3RlbShlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZW5hYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2soZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldFdvcmxkXG4gICAgICAgICAqIEBwYXJhbSB7V29ybGR9IHdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFdvcmxkID0gZnVuY3Rpb24od29ybGQpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGlzUGFzc2l2ZVxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc1Bhc3NpdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXNzaXZlO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBzZXRQYXNzaXZlXG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcGFzc2l2ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQYXNzaXZlID0gZnVuY3Rpb24oX3Bhc3NpdmUpIHtcbiAgICAgICAgICAgIHBhc3NpdmUgPSBfcGFzc2l2ZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEFjdGl2ZXNcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSBhY3RpdmVzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEFjdGl2ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmVzO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgRW50aXR5U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5T2JzZXJ2ZXIucHJvdG90eXBlKTtcbiAgICBFbnRpdHlTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlPYnNlcnZlciA9IHJlcXVpcmUoJy4vRW50aXR5T2JzZXJ2ZXInKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXR5IGNsYXNzLiBDYW5ub3QgYmUgaW5zdGFudGlhdGVkIG91dHNpZGUgdGhlIGZyYW1ld29yaywgeW91IG11c3RcbiAgICAgKiBjcmVhdGUgbmV3IGVudGl0aWVzIHVzaW5nIFdvcmxkLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgTWFuYWdlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqLyBcbiAgICB2YXIgTWFuYWdlciA9IGZ1bmN0aW9uIE1hbmFnZXIoKSB7XG4gICAgICAgIEVudGl0eU9ic2VydmVyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud29ybGQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAvKipcbiAgICAgICAgICogT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGNvZGUgdGhhdCBnZXRzIGV4ZWN1dGVkIHdoZW4gc3lzdGVtcyBhcmUgXG4gICAgICAgICAqIGluaXRpYWxpemVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBzZXRXb3JsZFxuICAgICAgICAgKiBAcGFyYW0ge1dvcmxkfSB3b3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRXb3JsZCA9IGZ1bmN0aW9uKHdvcmxkKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0V29ybGRcbiAgICAgICAgICogQHJldHVybiB7V29ybGR9IHdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFdvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53b3JsZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgYWRkZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHt9OyBcbiAgICB9O1xuICAgIFxuICAgIE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlPYnNlcnZlci5wcm90b3R5cGUpO1xuICAgIE1hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgRW50aXR5TWFuYWdlciA9IHJlcXVpcmUoJy4vRW50aXR5TWFuYWdlcicpLFxuICAgICAgICBDb21wb25lbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYW5hZ2VyJyksXG4gICAgICAgIENvbXBvbmVudE1hcHBlciA9IHJlcXVpcmUoJy4vQ29tcG9uZW50TWFwcGVyJyksXG4gICAgICAgIEJhZyA9IHJlcXVpcmUoJy4vdXRpbHMvQmFnJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcHJpbWFyeSBpbnN0YW5jZSBmb3IgdGhlIGZyYW1ld29yay4gSXQgY29udGFpbnMgYWxsIHRoZSBtYW5hZ2Vycy5cbiAgICAgKiBZb3UgbXVzdCB1c2UgdGhpcyB0byBjcmVhdGUsIGRlbGV0ZSBhbmQgcmV0cmlldmUgZW50aXRpZXMuXG4gICAgICogSXQgaXMgYWxzbyBpbXBvcnRhbnQgdG8gc2V0IHRoZSBkZWx0YSBlYWNoIGdhbWUgbG9vcCBpdGVyYXRpb24sIFxuICAgICAqIGFuZCBpbml0aWFsaXplIGJlZm9yZSBnYW1lIGxvb3AuXG4gICAgICpcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIFdvcmxkXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gV29ybGQoKSB7XG5cbiAgICAgICAgY29uc29sZS5pbmZvKFwiV2VsY29tZSB0byBBcnRlbWlKUywgY29tcG9uZW50IG9yaWVudGVkIGZyYW1ld29yayFcIilcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7RW50aXR5TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBlbnRpdHlNYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7Q29tcG9uZW50TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudE1hbmFnZXIgPSBuZXcgQ29tcG9uZW50TWFuYWdlcigpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBtYW5hZ2VycyA9IHt9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYW5hZ2Vyc0JhZ1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgbWFuYWdlcnNCYWcgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbXNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHN5c3RlbXMgPSB7fSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtc0JhZ1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgc3lzdGVtc0JhZyA9IG5ldyBCYWcoKSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhZGRlZFxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNoYW5nZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGNoYW5nZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGV0ZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVuYWJsZVxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgZW5hYmxlID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkaXNhYmxlXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlID0gbmV3IEJhZygpLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbHRhXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBkZWx0YSA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ha2VzIHN1cmUgYWxsIG1hbmFnZXJzIHN5c3RlbXMgYXJlIGluaXRpYWxpemVkIGluIHRoZSBvcmRlciBcbiAgICAgICAgICogdGhleSB3ZXJlIGFkZGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS50aW1lU3RhbXAoXCJNYW5hZ2VycyBpbml0aWFsaXphdGlvblwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoXCJNYW5hZ2VycyBpbml0aWFsaXphdGlvblwiKTtcbiAgICAgICAgICAgIHZhciBpID0gbWFuYWdlcnNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgbWFuYWdlcnNCYWcuZ2V0KGkpLmluaXRpYWxpemUoKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHN5c3RlbXNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgc3lzdGVtc0JhZy5nZXQoaSkuaW5pdGlhbGl6ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBtYW5hZ2VyIHRoYXQgdGFrZXMgY2FyZSBvZiBhbGwgdGhlIGVudGl0aWVzIGluIHRoZSB3b3JsZC5cbiAgICAgICAgICogZW50aXRpZXMgb2YgdGhpcyB3b3JsZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eU1hbmFnZXJ9IGVudGl0eU1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RW50aXR5TWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXI7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIG1hbmFnZXIgdGhhdCB0YWtlcyBjYXJlIG9mIGFsbCB0aGUgY29tcG9uZW50cyBpbiB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudE1hbmFnZXJcbiAgICAgICAgICogQHJldHVybiB7Q29tcG9uZW50TWFuYWdlcn0gY29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50TWFuYWdlcjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYSBtYW5hZ2VyIGludG8gdGhpcyB3b3JsZC4gSXQgY2FuIGJlIHJldHJpZXZlZCBsYXRlci5cbiAgICAgICAgICogV29ybGQgd2lsbCBub3RpZnkgdGhpcyBtYW5hZ2VyIG9mIGNoYW5nZXMgdG8gZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRNYW5hZ2VyXG4gICAgICAgICAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlciBtYW5hZ2VyIHRvIGJlIGFkZGVkXG4gICAgICAgICAqIEByZXR1cm4ge01hbmFnZXJ9IG1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0TWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwic2V0IG1hbmFnZXJcIik7XG4gICAgICAgICAgICBtYW5hZ2VyLnNldFdvcmxkKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYW5hZ2Vyc1ttYW5hZ2VyLmdldENsYXNzKCldID0gbWFuYWdlcjtcbiAgICAgICAgICAgIG1hbmFnZXJzQmFnLmFkZChtYW5hZ2VyKTtcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2VyO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBtYW5hZ2VyIG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYW5hZ2VyVHlwZSBjbGFzcyB0eXBlIG9mIHRoZSBtYW5hZ2VyXG4gICAgICAgICAqIEByZXR1cm4ge01hbmFnZXJ9IG1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0TWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXJUeXBlKSB7ICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2Vyc1ttYW5hZ2VyVHlwZV0gfHwgZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlcyB0aGUgbWFuYWdlciBmcm9tIHRoaXMgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZU1hbmFnZXJcbiAgICAgICAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyIG1hbmFnZXIgdG8gZGVsZXRlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVNYW5hZ2VyID0gZnVuY3Rpb24obWFuYWdlcikge1xuICAgICAgICAgICAgZGVsZXRlIG1hbmFnZXJzW21hbmFnZXIuZ2V0Q2xhc3MoKV07XG4gICAgICAgICAgICBtYW5hZ2Vyc0JhZy5yZW1vdmUobWFuYWdlcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogWW91IG11c3Qgc3BlY2lmeSB0aGUgZGVsdGEgZm9yIHRoZSBnYW1lIGhlcmUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldERlbHRhXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkIHRpbWUgc2luY2UgbGFzdCBnYW1lIGxvb3AuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldERlbHRhID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgZGVsdGEgPSBkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldERlbHRhXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gZGVsdGEgdGltZSBzaW5jZSBsYXN0IGdhbWUgbG9vcC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RGVsdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWx0YTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGRzIGEgZW50aXR5IHRvIHRoaXMgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZEVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgYWRkZWQuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRW5zdXJlIGFsbCBzeXN0ZW1zIGFyZSBub3RpZmllZCBvZiBjaGFuZ2VzIHRvIHRoaXMgZW50aXR5LlxuICAgICAgICAgKiBJZiB5b3UncmUgYWRkaW5nIGEgY29tcG9uZW50IHRvIGFuIGVudGl0eSBhZnRlciBpdCdzIGJlZW5cbiAgICAgICAgICogYWRkZWQgdG8gdGhlIHdvcmxkLCB0aGVuIHlvdSBuZWVkIHRvIGludm9rZSB0aGlzIG1ldGhvZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGNoYW5nZWQuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIHRoZSBlbnRpdHkgZnJvbSB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgYWRkZWQucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogKFJlKWVuYWJsZSB0aGUgZW50aXR5IGluIHRoZSB3b3JsZCwgYWZ0ZXIgaXQgaGF2aW5nIGJlaW5nIGRpc2FibGVkLlxuICAgICAgICAgKiBXb24ndCBkbyBhbnl0aGluZyB1bmxlc3MgaXQgd2FzIGFscmVhZHkgZGlzYWJsZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW5hYmxlLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIGVudGl0eSBmcm9tIGJlaW5nIHByb2Nlc3NlZC4gV29uJ3QgZGVsZXRlIGl0LCBpdCB3aWxsXG4gICAgICAgICAqIGNvbnRpbnVlIHRvIGV4aXN0IGJ1dCB3b24ndCBnZXQgcHJvY2Vzc2VkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlRW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZGlzYWJsZS5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBvciByZXVzZWQgZW50aXR5IGluc3RhbmNlLlxuICAgICAgICAgKiBXaWxsIE5PVCBhZGQgdGhlIGVudGl0eSB0byB0aGUgd29ybGQsIHVzZSBXb3JsZC5hZGRFbnRpdHkoRW50aXR5KSBmb3IgdGhhdC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY3JlYXRlRW50aXR5XG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS50aW1lU3RhbXAoXCJjcmVhdGUgZW50aXR5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuY3JlYXRlRW50aXR5SW5zdGFuY2UoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYSBlbnRpdHkgaGF2aW5nIHRoZSBzcGVjaWZpZWQgaWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWQgZW50aXR5IGlkXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0eSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5nZXRFbnRpdHkoaWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVzIHlvdSBhbGwgdGhlIHN5c3RlbXMgaW4gdGhpcyB3b3JsZCBmb3IgcG9zc2libGUgaXRlcmF0aW9uLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRTeXN0ZW1zXG4gICAgICAgICAqIEByZXR1cm4geyp9IGFsbCBlbnRpdHkgc3lzdGVtcyBpbiB3b3JsZCwgb3RoZXIgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN5c3RlbXNCYWc7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBhIHN5c3RlbSB0byB0aGlzIHdvcmxkIHRoYXQgd2lsbCBiZSBwcm9jZXNzZWQgYnkgV29ybGQucHJvY2VzcygpXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldFN5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eVN5c3RlbX0gc3lzdGVtIHRoZSBzeXN0ZW0gdG8gYWRkLlxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwYXNzaXZlXSB3aGV0aGVyIG9yIG5vdCB0aGlzIHN5c3RlbSB3aWxsIGJlIHByb2Nlc3NlZCBieSBXb3JsZC5wcm9jZXNzKClcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5U3lzdGVtfSB0aGUgYWRkZWQgc3lzdGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRTeXN0ZW0gPSBmdW5jdGlvbihzeXN0ZW0sIHBhc3NpdmUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwic2V0IHN5c3RlbVwiKTtcbiAgICAgICAgICAgIHBhc3NpdmUgPSBwYXNzaXZlIHx8IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzeXN0ZW0uc2V0V29ybGQodGhpcyk7XG4gICAgICAgICAgICBzeXN0ZW0uc2V0UGFzc2l2ZShwYXNzaXZlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzdGVtc1tzeXN0ZW0uZ2V0Q2xhc3MoKV0gPSBzeXN0ZW07XG4gICAgICAgICAgICBzeXN0ZW1zQmFnLmFkZChzeXN0ZW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0cmlldmUgYSBzeXN0ZW0gZm9yIHNwZWNpZmllZCBzeXN0ZW0gdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzeXN0ZW1UeXBlIHR5cGUgb2Ygc3lzdGVtLlxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHlTeXN0ZW19IGluc3RhbmNlIG9mIHRoZSBzeXN0ZW0gaW4gdGhpcyB3b3JsZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtID0gZnVuY3Rpb24oc3lzdGVtVHlwZSkgeyAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtc1tzeXN0ZW1UeXBlXSB8fCBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVkIHRoZSBzcGVjaWZpZWQgc3lzdGVtIGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVTeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHN5c3RlbSB0byBiZSBkZWxldGVkIGZyb20gd29ybGQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZVN5c3RlbSA9IGZ1bmN0aW9uKHN5c3RlbSkge1xuICAgICAgICAgICAgZGVsZXRlIHN5c3RlbXNbc3lzdGVtLmdldENsYXNzKCldO1xuICAgICAgICAgICAgc3lzdGVtc0JhZy5yZW1vdmUoc3lzdGVtKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOb3RpZnkgYWxsIHRoZSBzeXN0ZW1zXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIG5vdGlmeVN5c3RlbXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lciBPYmplY3Qgd2l0aCBjYWxsYmFjayBwZXJmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG5vdGlmeVN5c3RlbXMocGVyZm9ybWVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwibm90aWZ5IHN5c3RlbXNcIik7XG4gICAgICAgICAgICB2YXIgaSA9IHN5c3RlbXNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybWVyLnBlcmZvcm0oc3lzdGVtc0JhZy5nZXQoaSksIGVudGl0eSk7XG4gICAgICAgICAgICB9ICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE5vdGlmeSBhbGwgdGhlIG1hbmFnZXJzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIG5vdGlmeVN5c3RlbXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lciBPYmplY3Qgd2l0aCBjYWxsYmFjayBwZXJmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG5vdGlmeU1hbmFnZXJzKHBlcmZvcm1lciwgZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcIm5vdGlmeSBtYW5hZ2Vyc1wiKTtcbiAgICAgICAgICAgIHZhciBpID0gbWFuYWdlcnNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybWVyLnBlcmZvcm0obWFuYWdlcnNCYWcuZ2V0KGkpLCBlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYW4gYWN0aW9uIG9uIGVhY2ggZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1xuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gZW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lclxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY2hlY2soZW50aXRpZXMsIHBlcmZvcm1lcikge1xuICAgICAgICAgICAgaWYoIWVudGl0aWVzLnNpemUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gZW50aXRpZXMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmdldChpKTtcbiAgICAgICAgICAgICAgICBub3RpZnlNYW5hZ2VycyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICAgICAgbm90aWZ5U3lzdGVtcyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVudGl0aWVzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIGFsbCBub24tcGFzc2l2ZSBzeXN0ZW1zLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwicHJvY2VzcyBldmVyeXRoaW5nXCIpO1xuICAgICAgICAgICAgY2hlY2soYWRkZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmFkZGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGNoYW5nZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNoYW5nZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZGlzYWJsZSwge1xuICAgICAgICAgICAgICAgIHBlcmZvcm06IGZ1bmN0aW9uKG9ic2VydmVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzYWJsZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZW5hYmxlLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24ob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lbmFibGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGRlbGV0ZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbiAob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kZWxldGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudE1hbmFnZXIuY2xlYW4oKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGkgPSBzeXN0ZW1zQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBzeXN0ZW0gPSBzeXN0ZW1zQmFnLmdldChpKTtcbiAgICAgICAgICAgICAgICBpZighc3lzdGVtLmlzUGFzc2l2ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN5c3RlbS5wcm9jZXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlcyBhIENvbXBvbmVudE1hcHBlciBpbnN0YW5jZSBmb3IgZmFzdCByZXRyaWV2YWwgXG4gICAgICAgICAqIG9mIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0TWFwcGVyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlIG9mIGNvbXBvbmVudCB0byBnZXQgbWFwcGVyIGZvci5cbiAgICAgICAgICogQHJldHVybiB7Q29tcG9uZW50TWFwcGVyfSBtYXBwZXIgZm9yIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0TWFwcGVyID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudE1hcHBlci5nZXRGb3IodHlwZSwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldE1hbmFnZXIoY29tcG9uZW50TWFuYWdlcik7XG4gICAgICAgIHRoaXMuc2V0TWFuYWdlcihlbnRpdHlNYW5hZ2VyKTtcbiAgICB9XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBXb3JsZDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogSWYgeW91IG5lZWQgdG8gZ3JvdXAgeW91ciBlbnRpdGllcyB0b2dldGhlciwgZS5nLiB0YW5rcyBnb2luZyBpbnRvIFxuICAgICAqIFwidW5pdHNcIiBncm91cCBvciBleHBsb3Npb25zIGludG8gXCJlZmZlY3RzXCIsXG4gICAgICogdGhlbiB1c2UgdGhpcyBtYW5hZ2VyLiBZb3UgbXVzdCByZXRyaWV2ZSBpdCB1c2luZyB3b3JsZCBpbnN0YW5jZS5cbiAgICAgKiBcbiAgICAgKiBBIGVudGl0eSBjYW4gYmUgYXNzaWduZWQgdG8gbW9yZSB0aGFuIG9uZSBncm91cC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBNYW5hZ2Vyc1xuICAgICAqIEBjbGFzcyBHcm91cE1hbmFnZXJcbiAgICAgKiBAbmFtZXNwYWNlIE1hbmFnZXJzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQGV4dGVuZHMgTWFuYWdlclxuICAgICAqL1xuICAgIHZhciBHcm91cE1hbmFnZXIgPSBmdW5jdGlvbiBHcm91cE1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW50aXRpZXNCeUdyb3VwXG4gICAgICAgICAqIEB0eXBlIHtIYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVudGl0aWVzQnlHcm91cCA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGdyb3Vwc0J5RW50aXR5XG4gICAgICAgICAqIEB0eXBlIHtIYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgZ3JvdXBzQnlFbnRpdHkgPSBuZXcgSGFzaE1hcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHRoZSBncm91cCBvZiB0aGUgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0byBhZGQgaW50byB0aGUgZ3JvdXBcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwIHRvIGFkZCB0aGUgZW50aXR5IGludG9cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoZ3JvdXAubGVuZ3RoID4gMCwgXCJHcm91cCBpcyBlbXB0eVwiKTtcbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlHcm91cC5nZXQoZ3JvdXApO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5R3JvdXAucHV0KGdyb3VwLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYoZ3JvdXBzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgICAgIGdyb3Vwc0J5RW50aXR5LnB1dChlbnRpdHksIGdyb3Vwcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm91cHMuYWRkKGdyb3VwKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdGhlIGVudGl0eSBmcm9tIHRoZSBncm91cC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdG8gcmVtb3ZlIGZyb20gdGhlIGdyb3VwXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCB0byByZW1vdmUgZnJvbSB0aGVtIGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihlbnRpdHksIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydChncm91cC5sZW5ndGggPiAwLCBcIkdyb3VwIGlzIGVtcHR5XCIpO1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cCk7XG4gICAgICAgICAgICBpZihlbnRpdGllcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZ3JvdXBzID0gZ3JvdXBzQnlFbnRpdHkuZ2V0KGVudGl0eSk7XG4gICAgICAgICAgICBpZihncm91cHMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBncm91cHMucmVtb3ZlKGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdGhlIGVudGl0eSBmcm9tIHRoZSBhbGwgZ3JvdXBzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVGcm9tQWxsR3JvdXBzXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdG8gcmVtb3ZlIGZyb20gdGhlIGdyb3VwXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUZyb21BbGxHcm91cHMgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhZW50aXR5LCBcIkVudGl0eSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIHZhciBncm91cHMgPSBncm91cHNCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKGdyb3VwcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBpID0gZ3JvdXBzLnNpemUoKTtcbiAgICAgICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cHMuZ2V0KGkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50aXRpZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0aWVzLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3Vwcy5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBhbGwgZW50aXRpZXMgdGhhdCBiZWxvbmcgdG8gdGhlIHByb3ZpZGVkIGdyb3VwLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdGllc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXAgbmFtZSBvZiB0aGUgZ3JvdXBcbiAgICAgICAgICogQHJldHVybiB7QmFnfSBlbnRpdGllc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFbnRpdGllcyA9IGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydChncm91cC5sZW5ndGggPiAwLCBcIkdyb3VwIGlzIGVtcHR5XCIpO1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cCk7XG4gICAgICAgICAgICBpZihlbnRpdGllcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgICAgIGVudGl0aWVzQnlHcm91cC5wdXQoZ3JvdXAsIGVudGl0aWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllcztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYWxsIGVudGl0aWVzIGZyb20gdGhlIGdyb3VwXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEdyb3Vwc1xuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEdyb3VwcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpcyBFbnRpdHkgaW4gYW55IGdyb3VwXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzSW5BbnlHcm91cCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0R3JvdXBzKGVudGl0eSkgIT09IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlzIGVudGl0eSBpbiBncm91cFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNJbkdyb3VwID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgaWYoIWdyb3VwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgdmFyIGkgPSBncm91cHMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYoZ3JvdXAgPT09IGdyb3Vwcy5nZXQoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgZW50aXR5IGZyb20gYWxsIGdyb3VwcyByZWxhdGVkIHRvXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tQWxsR3JvdXBzKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgfTsgXG5cbiAgICBHcm91cE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgR3JvdXBNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdyb3VwTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdyb3VwTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZShcIi4vLi4vTWFuYWdlclwiKTtcbiAgICBcbiAgICB2YXIgUGxheWVyTWFuYWdlciA9IGZ1bmN0aW9uIFBsYXllck1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwbGF5ZXJCeUVudGl0eSA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgICAgICBlbnRpdGllc0J5UGxheWVyID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnNldFBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSwgcGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXJCeUVudGl0eS5wdXQoZW50aXR5LCBwbGF5ZXIpO1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgIGlmKGVudGl0aWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgZW50aXRpZXNCeVBsYXllci5wdXQocGxheWVyLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0RW50aXRpZXNPZlBsYXllciA9IGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgIGlmKGVudGl0aWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlbW92ZUZyb21QbGF5ZXIgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKHBsYXllciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlQbGF5ZXIuZ2V0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgaWYoZW50aXRpZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRQbGF5ZXIgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXJCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tUGxheWVyKGVudGl0eSk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuICAgIFxuICAgIFBsYXllck1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgUGxheWVyTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF5ZXJNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGxheWVyTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgdmFyIFRhZ01hbmFnZXIgPSBmdW5jdGlvbiBUYWdNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgZW50aXRpZXNCeVRhZyA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgICAgICB0YWdzQnlFbnRpdHkgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXIgPSBmdW5jdGlvbih0YWcsIGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXRpZXNCeVRhZy5wdXQodGFnLCBlbnRpdHkpO1xuICAgICAgICAgICAgdGFnc0J5RW50aXR5LnB1dChlbnRpdHksIHRhZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICB0YWdzQnlFbnRpdHkucmVtb3ZlKGVudGl0aWVzQnlUYWcucmVtb3ZlKHRhZykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNSZWdpc3RlcmVkID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXNCeVRhZy5jb250YWluc0tleSh0YWcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0RW50aXR5ID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXNCeVRhZy5nZXQodGFnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0UmVnaXN0ZXJlZFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWdzQnlFbnRpdHkudmFsdWVzKCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciByZW1vdmVkVGFnID0gdGFnc0J5RW50aXR5LnJlbW92ZShlbnRpdHkpO1xuICAgICAgICAgICAgaWYocmVtb3ZlZFRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzQnlUYWcucmVtb3ZlKHJlbW92ZWRUYWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge31cbiAgICB9OyBcblxuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgVGFnTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUYWdNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGFnTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgY2xhc3MgdG9nZXRoZXIgd2l0aCBQbGF5ZXJNYW5hZ2VyLlxuICAgICAqIFxuICAgICAqIFlvdSBtYXkgc29tZXRpbWVzIHdhbnQgdG8gY3JlYXRlIHRlYW1zIGluIHlvdXIgZ2FtZSwgc28gdGhhdFxuICAgICAqIHNvbWUgcGxheWVycyBhcmUgdGVhbSBtYXRlcy5cbiAgICAgKiBcbiAgICAgKiBBIHBsYXllciBjYW4gb25seSBiZWxvbmcgdG8gYSBzaW5nbGUgdGVhbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBNYW5hZ2Vyc1xuICAgICAqIEBjbGFzcyBUZWFtTWFuYWdlclxuICAgICAqIEBuYW1lc3BhY2UgTWFuYWdlcnNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAZXh0ZW5kcyBNYW5hZ2VyXG4gICAgICovXG4gICAgdmFyIFRlYW1NYW5hZ2VyID0gZnVuY3Rpb24gVGVhbU1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgcGxheWVyc0J5VGVhbVxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwbGF5ZXJzQnlUZWFtID0gbmV3IEhhc2hNYXAoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgdGVhbUJ5UGxheWVyXG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5IYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGVhbUJ5UGxheWVyID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuIHRlYW1CeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdGVhbSB0byBhIHBsYXllclxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRUZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0VGVhbSA9IGZ1bmN0aW9uKHBsYXllciwgdGVhbSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tVGVhbShwbGF5ZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0ZWFtQnlQbGF5ZXIucHV0KHBsYXllciwgdGVhbSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICBpZihwbGF5ZXJzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGxheWVycyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzQnlUZWFtLnB1dCh0ZWFtLCBwbGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllcnMuYWRkKHBsYXllcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRQbGF5ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZWFtIE5hbWUgb2YgdGhlIHRlYW1cbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSBCYWcgb2YgcGxheWVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRQbGF5ZXJzID0gZnVuY3Rpb24odGVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllcnNCeVRlYW0uZ2V0KHRlYW0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbVRlYW1cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllciBOYW1lIG9mIHRoZSBwbGF5ZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVRlYW0gPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGVhbUJ5UGxheWVyLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgaWYodGVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcGxheWVyc0J5VGVhbS5nZXQodGVhbSk7XG4gICAgICAgICAgICAgICAgaWYocGxheWVycyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLnJlbW92ZShwbGF5ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9OyBcblxuICAgIFRlYW1NYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIFRlYW1NYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRlYW1NYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGVhbU1hbmFnZXI7XG59KSgpOyIsIkFycmF5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzW2luZGV4XTtcclxufTtcclxuXHJcbkFycmF5LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcclxuICB0aGlzW2luZGV4XSA9IHZhbHVlO1xyXG59OyIsIi8qKlxuICogRm9yIGFuIHJmYzQxMjIgdmVyc2lvbiA0IGNvbXBsaWFudCBzb2x1dGlvblxuICogXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQtaW4tamF2YXNjcmlwdFxuICogQGF1dGhvciBicm9vZmFcbiAqL1xuTWF0aC51dWlkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbn07IiwiLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgemVybyBiaXRzIGZvbGxvd2luZyB0aGUgbG93ZXN0LW9yZGVyIChcInJpZ2h0bW9zdFwiKVxuICogb25lLWJpdCBpbiB0aGUgdHdvJ3MgY29tcGxlbWVudCBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNwZWNpZmllZFxuICoge0Bjb2RlIGxvbmd9IHZhbHVlLiAgUmV0dXJucyA2NCBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGhhcyBub1xuICogb25lLWJpdHMgaW4gaXRzIHR3bydzIGNvbXBsZW1lbnQgcmVwcmVzZW50YXRpb24sIGluIG90aGVyIHdvcmRzIGlmIGl0IGlzXG4gKiBlcXVhbCB0byB6ZXJvLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgemVybyBiaXRzIGZvbGxvd2luZyB0aGUgbG93ZXN0LW9yZGVyIChcInJpZ2h0bW9zdFwiKVxuICogICAgIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZVxuICogICAgIHNwZWNpZmllZCB7QGNvZGUgbG9uZ30gdmFsdWUsIG9yIDY0IGlmIHRoZSB2YWx1ZSBpcyBlcXVhbFxuICogICAgIHRvIHplcm8uXG4gKiBAc2luY2UgMS41XG4gKiBAc2VlIGh0dHA6Ly9ncmVwY29kZS5jb20vZmlsZV8vcmVwb3NpdG9yeS5ncmVwY29kZS5jb20vamF2YS9yb290L2pkay9vcGVuamRrLzYtYjE0L2phdmEvbGFuZy9Mb25nLmphdmEvP3Y9c291cmNlXG4gKi9cbk51bWJlci5wcm90b3R5cGUubnVtYmVyT2ZUcmFpbGluZ1plcm9zID0gZnVuY3Rpb24oaSkge1xuICAgIHZhciB4LCB5O1xuICAgIGlmIChpID09PSAwKSByZXR1cm4gNjQ7XG4gICAgdmFyIG4gPSA2MztcbiAgICB5ID0gcGFyc2VJbnQoaSk7IGlmICh5ICE9PSAwKSB7IG4gPSBuIC0zMjsgeCA9IHk7IH0gZWxzZSB4ID0gcGFyc2VJbnQoaT4+PjMyKTtcbiAgICB5ID0geCA8PDE2OyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtMTY7IHggPSB5OyB9XG4gICAgeSA9IHggPDwgODsgaWYgKHkgIT09IDApIHsgbiA9IG4gLSA4OyB4ID0geTsgfVxuICAgIHkgPSB4IDw8IDQ7IGlmICh5ICE9PSAwKSB7IG4gPSBuIC0gNDsgeCA9IHk7IH1cbiAgICB5ID0geCA8PCAyOyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtIDI7IHggPSB5OyB9XG4gICAgcmV0dXJuIG4gLSAoKHggPDwgMSkgPj4+IDMxKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHplcm8gYml0cyBwcmVjZWRpbmcgdGhlIGhpZ2hlc3Qtb3JkZXJcbiAqIChcImxlZnRtb3N0XCIpIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgc3BlY2lmaWVkIHtAY29kZSBsb25nfSB2YWx1ZS4gIFJldHVybnMgNjQgaWYgdGhlXG4gKiBzcGVjaWZpZWQgdmFsdWUgaGFzIG5vIG9uZS1iaXRzIGluIGl0cyB0d28ncyBjb21wbGVtZW50IHJlcHJlc2VudGF0aW9uLFxuICogaW4gb3RoZXIgd29yZHMgaWYgaXQgaXMgZXF1YWwgdG8gemVyby5cbiAqXG4gKiA8cD5Ob3RlIHRoYXQgdGhpcyBtZXRob2QgaXMgY2xvc2VseSByZWxhdGVkIHRvIHRoZSBsb2dhcml0aG0gYmFzZSAyLlxuICogRm9yIGFsbCBwb3NpdGl2ZSB7QGNvZGUgbG9uZ30gdmFsdWVzIHg6XG4gKiA8dWw+XG4gKiA8bGk+Zmxvb3IobG9nPHN1Yj4yPC9zdWI+KHgpKSA9IHtAY29kZSA2MyAtIG51bWJlck9mTGVhZGluZ1plcm9zKHgpfVxuICogPGxpPmNlaWwobG9nPHN1Yj4yPC9zdWI+KHgpKSA9IHtAY29kZSA2NCAtIG51bWJlck9mTGVhZGluZ1plcm9zKHggLSAxKX1cbiAqIDwvdWw+XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge051bWJlcn0gdGhlIG51bWJlciBvZiB6ZXJvIGJpdHMgcHJlY2VkaW5nIHRoZSBoaWdoZXN0LW9yZGVyXG4gKiAgICAgKFwibGVmdG1vc3RcIikgb25lLWJpdCBpbiB0aGUgdHdvJ3MgY29tcGxlbWVudCBiaW5hcnkgcmVwcmVzZW50YXRpb25cbiAqICAgICBvZiB0aGUgc3BlY2lmaWVkIHtAY29kZSBsb25nfSB2YWx1ZSwgb3IgNjQgaWYgdGhlIHZhbHVlXG4gKiAgICAgaXMgZXF1YWwgdG8gemVyby5cbiAqIEBzaW5jZSAxLjVcbiAqIEBzZWUgaHR0cDovL2dyZXBjb2RlLmNvbS9maWxlXy9yZXBvc2l0b3J5LmdyZXBjb2RlLmNvbS9qYXZhL3Jvb3QvamRrL29wZW5qZGsvNi1iMTQvamF2YS9sYW5nL0xvbmcuamF2YS8/dj1zb3VyY2VcbiAqL1xuTnVtYmVyLnByb3RvdHlwZS5udW1iZXJPZkxlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uKGkpIHtcbiAgICBpZiAoaSA9PT0gMClcbiAgICAgICAgcmV0dXJuIDY0O1xuICAgIHZhciBuID0gMTtcbiAgICB2YXIgeCA9IHBhcnNlSW50KGkgPj4+IDMyKTtcbiAgICBpZiAoeCA9PT0gMCkgeyBuICs9IDMyOyB4ID0gcGFyc2VJbnQoaSk7IH1cbiAgICBpZiAoeCA+Pj4gMTYgPT0gMCkgeyBuICs9IDE2OyB4IDw8PSAxNjsgfVxuICAgIGlmICh4ID4+PiAyNCA9PSAwKSB7IG4gKz0gIDg7IHggPDw9ICA4OyB9XG4gICAgaWYgKHggPj4+IDI4ID09IDApIHsgbiArPSAgNDsgeCA8PD0gIDQ7IH1cbiAgICBpZiAoeCA+Pj4gMzAgPT0gMCkgeyBuICs9ICAyOyB4IDw8PSAgMjsgfVxuICAgIG4gLT0geCA+Pj4gMzE7XG4gICAgcmV0dXJuIG47XG59OyIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCBcImtsYXNzXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbn0pO1xuXG5PYmplY3QucHJvdG90eXBlLmdldENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG59OyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZCBcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuICAgIH07XG4gICAgXG4gICAgRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZCBcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IGZ1bmN0aW9uIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0oX2FzcGVjdCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBfYXNwZWN0KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIC8vIGxpdGxlIGRpZmZlcmVuY2UgYmV0d2VlbiBvcmlnaW5hbCBmcmFtZXdvcmssIGpzIGRvZXNuJ3QgYWxsb3cgdG8gb3ZlcmxvYWQgbWV0aG9kcyA6PFxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gZW50aXRpZXNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHZhciBpID0gZW50aXRpZXMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MoZW50aXRpZXMuZ2V0KGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgICBcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIElmIHlvdSBuZWVkIHRvIHByb2Nlc3MgZW50aXRpZXMgYXQgYSBjZXJ0YWluIGludGVydmFsIHRoZW4gdXNlIHRoaXMuXG4gICAgICogQSB0eXBpY2FsIHVzYWdlIHdvdWxkIGJlIHRvIHJlZ2VuZXJhdGUgYW1tbyBvciBoZWFsdGggYXQgY2VydGFpbiBpbnRlcnZhbHMsIG5vIG5lZWRcbiAgICAgKiB0byBkbyB0aGF0IGV2ZXJ5IGdhbWUgbG9vcCwgYnV0IHBlcmhhcHMgZXZlcnkgMTAwIG1zLiBvciBldmVyeSBzZWNvbmQuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FzcGVjdH0gX2FzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWRcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKlxuICAgICAqIEBhdXRob3IgQXJuaSBBcmVudFxuICAgICAqL1xuICAgIHZhciBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0gPSBmdW5jdGlvbiBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0oX2FzcGVjdCwgaW50ZXJ2YWwpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgX2FzcGVjdCwgaW50ZXJ2YWwpO1xuXG4gICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzID0gZnVuY3Rpb24oZW50aXR5KSB7fTtcblxuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7XG4gICAgICAgICAgICB2YXIgaSA9IGVudGl0aWVzLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJQcm9jZXNzKGVudGl0aWVzLmdldChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogQSBzeXN0ZW0gdGhhdCBwcm9jZXNzZXMgZW50aXRpZXMgYXQgYSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMuXG4gICAgICogQSB0eXBpY2FsIHVzYWdlIHdvdWxkIGJlIGEgY29sbGlzaW9uIHN5c3RlbSBvciBwaHlzaWNzIHN5c3RlbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEludGVydmFsRW50aXR5U3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqIEBhdXRob3IgQXJuaSBBcmVudFxuICAgICAqL1xuICAgIHZhciBJbnRlcnZhbEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIEludGVydmFsRW50aXR5U3lzdGVtKF9hc3BlY3QsIF9pbnRlcnZhbCkge1xuXG4gICAgICAgIHZhciBhY2M7XG5cbiAgICAgICAgdmFyIGludGVydmFsID0gX2ludGVydmFsO1xuXG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhY2MgKz0gdGhpcy53b3JsZC5nZXREZWx0YSgpO1xuICAgICAgICAgICAgaWYoYWNjID49IGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgYWNjIC09IGludGVydmFsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBJbnRlcnZhbEVudGl0eVN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEludGVydmFsRW50aXR5U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVydmFsRW50aXR5U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW50ZXJ2YWxFbnRpdHlTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEFzcGVjdCA9IHJlcXVpcmUoJy4vLi4vQXNwZWN0JyksXG4gICAgICAgIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBWb2lkRW50aXR5U3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBWb2lkRW50aXR5U3lzdGVtID0gZnVuY3Rpb24gVm9pZEVudGl0eVN5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRFbXB0eSgpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1N5c3RlbSgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wcm9jZXNzU3lzdGVtID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIFZvaWRFbnRpdHlTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBWb2lkRW50aXR5U3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZvaWRFbnRpdHlTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWb2lkRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdGlvbiB0eXBlIGEgYml0IGxpa2UgQXJyYXlMaXN0IGJ1dCBkb2VzIG5vdCBwcmVzZXJ2ZSB0aGUgb3JkZXIgb2YgaXRzXG4gICAgICogZW50aXRpZXMsIHNwZWVkd2lzZSBpdCBpcyB2ZXJ5IGdvb2QsIGVzcGVjaWFsbHkgc3VpdGVkIGZvciBnYW1lcy5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQHN1Ym1vZHVsZSBVdGlsc1xuICAgICAqIEBjbGFzcyBCYWdcbiAgICAgKiBAbmFtZXNwYWNlIFV0aWxzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gQmFnKCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnRhaW5zIGFsbCBvZiB0aGUgZWxlbWVudHNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkYXRhXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBkYXRhID0gW107XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGlzIEJhZy4gZG9lcyB0aGlzIGJ5XG4gICAgICAgICAqIG92ZXJ3cml0aW5nIGl0IHdhcyBsYXN0IGVsZW1lbnQgdGhlbiByZW1vdmluZyBsYXN0IGVsZW1lbnRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSAgeyp9IGluZGV4IHRoZSBpbmRleCBvZiBlbGVtZW50IHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICogQHJldHVybiB7Kn0gZWxlbWVudCB0aGF0IHdhcyByZW1vdmVkIGZyb20gdGhlIEJhZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBpbmRleCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGRhdGEuaW5kZXhPZihpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlb2YgaW5kZXggPT09ICdudW1iZXInICYmIGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZGF0YS5zcGxpY2UoaW5kZXgsIDEpWzBdIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgLS1sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KHJlc3BvbnNlICE9PSBudWxsLCBcIkFyZSB5b3Ugc3VyZSB0aGVyZSB3YXNuJ3QgYW4gZWxlbWVudCBpbiB0aGUgYmFnP1wiKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgYW5kIHJldHVybiB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlTGFzdFxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIGJhZywgbnVsbCBpZiBlbXB0eS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlTGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYobGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbW92ZShsZW5ndGgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiBiYWcgY29udGFpbnMgdGhpcyBlbGVtZW50LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGNvbnRhaW5zXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRhaW5zID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKG9iaikgIT09IC0xO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgZnJvbSB0aGlzIEJhZyBhbGwgb2YgaXRzIGVsZW1lbnRzIHRoYXQgYXJlIGNvbnRhaW5lZCBpbiB0aGVcbiAgICAgICAgICogc3BlY2lmaWVkIEJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlQWxsXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBiYWcgY29udGFpbmluZyBlbGVtZW50cyB0byBiZSByZW1vdmVkIGZyb20gdGhpcyBCYWdcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIEJhZyBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoZSBjYWxsLCBlbHNlIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKGJhZykge1xuICAgICAgICAgICAgdmFyIG1vZGlmaWVkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgbiA9IGJhZy5zaXplKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSAhPT0gbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGJhZy5nZXQoaSk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLnJlbW92ZShvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbW9kaWZpZWQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIEJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBpbmRleCBvZiB0aGUgZWxlbWVudCB0byByZXR1cm5cbiAgICAgICAgICogQHJldHVybiBNaXhlZCB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIGJhZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaW5kZXhdID8gZGF0YVtpbmRleF0gOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2Qgc2l6ZVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0aGUgYmFnIGNhbiBob2xkIHdpdGhvdXQgZ3Jvd2luZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2FwYWNpdHlcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRoZSBiYWcgY2FuIGhvbGQgd2l0aG91dCBncm93aW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDYXBhY2l0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7IC8vIHNsaWdodGx5IGZpeGVkIF5eXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBpbnRlcm5hbCBzdG9yYWdlIHN1cHBvcnRzIHRoaXMgaW5kZXguXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzSW5kZXhXaXRoaW5Cb3VuZHNcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzSW5kZXhXaXRoaW5Cb3VuZHMgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4IDwgdGhpcy5nZXRDYXBhY2l0eSgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGxpc3QgY29udGFpbnMgbm8gZWxlbWVudHMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGlzRW1wdHlcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBpcyBlbXB0eSwgZWxzZSBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbGVuZ3RoID09PSAwO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoZSBlbmQgb2YgdGhpcyBiYWcuIGlmIG5lZWRlZCBhbHNvXG4gICAgICAgICAqIGluY3JlYXNlcyB0aGUgY2FwYWNpdHkgb2YgdGhlIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gb2JqIGVsZW1lbnQgdG8gYmUgYWRkZWQgdG8gdGhpcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgZGF0YS5wdXNoKG9iaik7XG4gICAgICAgICAgICArK2xlbmd0aDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZWxlbWVudCBhdCBzcGVjaWZpZWQgaW5kZXggaW4gdGhlIGJhZy4gTmV3IGluZGV4IHdpbGwgZGVzdHJveSBzaXplXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggaW5kZXggcG9zaXRpb24gb2YgZWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0geyp9IG9iaiB0aGUgZWxlbWVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbihpbmRleCwgb2JqKSB7XG4gICAgICAgICAgICBkYXRhW2luZGV4XSA9IG9iajtcbiAgICAgICAgICAgICsrbGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ldGhvZCB2ZXJpZnkgdGhlIGNhcGFjaXR5IG9mIHRoZSBiYWdcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZW5zdXJlQ2FwYWNpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5zdXJlQ2FwYWNpdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGp1c3QgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvcnlnaW5hbCBpZGVlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBiYWcuIFRoZSBiYWcgd2lsbCBiZSBlbXB0eSBhZnRlclxuICAgICAgICAgKiB0aGlzIGNhbGwgcmV0dXJucy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRhdGEubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICAgIGxlbmd0aCA9IDA7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFsbCBpdGVtcyBpbnRvIHRoaXMgYmFnLiBcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkQWxsXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBiYWcgYWRkZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQWxsID0gZnVuY3Rpb24oYmFnKSB7XG4gICAgICAgICAgICB2YXIgaSA9IGJhZy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZChiYWcuZ2V0KGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBCYWc7XG59KCkpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQml0U2V0ID0gZnVuY3Rpb24gQml0U2V0KCkge1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEJpdFNldHMgYXJlIHBhY2tlZCBpbnRvIGFycmF5cyBvZiBcIndvcmRzLlwiICBDdXJyZW50bHkgYSB3b3JkIGlzXG4gICAgICAgICAqIGEgbG9uZywgd2hpY2ggY29uc2lzdHMgb2YgNjQgYml0cywgcmVxdWlyaW5nIDYgYWRkcmVzcyBiaXRzLlxuICAgICAgICAgKiBUaGUgY2hvaWNlIG9mIHdvcmQgc2l6ZSBpcyBkZXRlcm1pbmVkIHB1cmVseSBieSBwZXJmb3JtYW5jZSBjb25jZXJucy5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBBRERSRVNTX0JJVFNfUEVSX1dPUkQgPSA2O1xuICAgICAgICB2YXIgQklUU19QRVJfV09SRCA9IDEgPDwgQUREUkVTU19CSVRTX1BFUl9XT1JEO1xuXG4gICAgICAgIC8qIFVzZWQgdG8gc2hpZnQgbGVmdCBvciByaWdodCBmb3IgYSBwYXJ0aWFsIHdvcmQgbWFzayAqL1xuICAgICAgICB2YXIgV09SRF9NQVNLID0gMHhmZmZmZmZmZmZmZmZmZmZmO1xuXG4gICAgICAgIHZhciBfd29yZHMgPSBbXTtcblxuICAgICAgICB2YXIgX3dvcmRzSW5Vc2UgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZFRvKHdvcmRJbmRleCkge1xuICAgICAgICAgICAgdmFyIHdvcmRzUmVxdWlyZWQgPSB3b3JkSW5kZXgrMTtcbiAgICAgICAgICAgIGlmIChfd29yZHNJblVzZSA8IHdvcmRzUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICBfd29yZHNJblVzZSA9IHdvcmRzUmVxdWlyZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB3b3JkSW5kZXgoYml0SW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBiaXRJbmRleCA+PiBBRERSRVNTX0JJVFNfUEVSX1dPUkQ7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICBcIndvcmRzSW5Vc2VcIjoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBfd29yZHNJblVzZTsgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwid29yZHNcIjoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBfd29yZHM7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbihiaXRJbmRleCkge1xuICAgICAgICAgICAgdmFyIF93b3JkSW5kZXggPSB3b3JkSW5kZXgoYml0SW5kZXgpO1xuICAgICAgICAgICAgX3dvcmRzW193b3JkSW5kZXhdIHw9ICgxIDw8IGJpdEluZGV4KTtcbiAgICAgICAgICAgIGV4cGFuZFRvKF93b3JkSW5kZXgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24oYml0SW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBfd29yZEluZGV4ID0gd29yZEluZGV4KGJpdEluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiAoX3dvcmRJbmRleCA8IF93b3Jkc0luVXNlKSAmJiAoKF93b3Jkc1tfd29yZEluZGV4XSAmICgxIDw8IGJpdEluZGV4KSkgIT0gMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3dvcmRzID0gW107XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX3dvcmRzSW5Vc2UgPT0gMDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtCaXRTZXR9IGJpdFNldFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGJpdFNldCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IE1hdGgubWluKF93b3Jkc0luVXNlLCBiaXRTZXQud29yZHNJblVzZSkgLSAxOyBpID49IDA7IGktLSlcbiAgICAgICAgICAgICAgICBpZiAoKF93b3Jkc1tpXSAmIGJpdFNldC53b3Jkc1tpXSkgIT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBmcm9tSW5kZXhcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5leHRTZXRCaXQgPSBmdW5jdGlvbihmcm9tSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB1ID0gd29yZEluZGV4KGZyb21JbmRleCk7XG4gICAgICAgICAgICBpZiAodSA+PSBfd29yZHNJblVzZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG5cbiAgICAgICAgICAgIHZhciB3b3JkID0gX3dvcmRzW3VdICYgKFdPUkRfTUFTSyA8PCBmcm9tSW5kZXgpO1xuXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh3b3JkICE9IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodSAqIEJJVFNfUEVSX1dPUkQpICsgTnVtYmVyLm51bWJlck9mVHJhaWxpbmdaZXJvcyh3b3JkKTtcbiAgICAgICAgICAgICAgICBpZiAoKyt1ID09IF93b3Jkc0luVXNlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgd29yZCA9IF93b3Jkc1t1XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBCaXRTZXQ7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGZ1bmN0aW9uIG1ha2VDUkNUYWJsZSgpe1xuICAgICAgICB2YXIgYztcbiAgICAgICAgdmFyIGNyY1RhYmxlID0gW107XG4gICAgICAgIGZvcih2YXIgbiA9MDsgbiA8IDI1NjsgbisrKXtcbiAgICAgICAgICAgIGMgPSBuO1xuICAgICAgICAgICAgZm9yKHZhciBrID0wOyBrIDwgODsgaysrKXtcbiAgICAgICAgICAgICAgICBjID0gKChjJjEpID8gKDB4RURCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyY1RhYmxlW25dID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JjVGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFzaE1hcFxuICAgICAqXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgVXRpbHNcbiAgICAgKiBAY2xhc3MgSGFzaE1hcFxuICAgICAqIEBuYW1lc3BhY2UgVXRpbHNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODYzODkwMC9qYXZhc2NyaXB0LWNyYzMyLzE4NjM5OTk5IzE4NjM5OTk5XG4gICAgICovXG4gICAgZnVuY3Rpb24gSGFzaE1hcCgpIHtcblxuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuXG4gICAgICAgIHZhciBfbGVuZ3RoID0gMDtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJsZW5ndGhcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIF9sZW5ndGg7IH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYoIXNlbGYuY3JjVGFibGUpIHtcbiAgICAgICAgICAgIHNlbGYuY3JjVGFibGUgPSBtYWtlQ1JDVGFibGUoKVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGdlbmVyYXRlIGNyYzMyIGV4YWN0bHkgZnJvbSBzdHJpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGtleVxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gaGFzaChrZXkpIHtcbiAgICAgICAgICAgIHZhciBzdHIgPSBKU09OLnN0cmluZ2lmeShrZXkpO1xuICAgICAgICAgICAgdmFyIGNyYyA9IDAgXiAoLTEpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHNlbGYuY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB2YWx1ZSBmb3IgYSBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGtleVxuICAgICAgICAgKiBAcmV0dXJucyB7KnxudWxsfSBGb3IgZmFsc2UgcmV0dXJucyBudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaGFzaChrZXkpXSB8fCBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdmFsdWUgZm9yIGEgc3BlY2lmaWMga2V5XG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEha2V5LCBcImtleSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIGRhdGFbaGFzaChrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgKytfbGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgdGhhdCBrZXkgZXhpc3RcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRhaW5zS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGhhc2goa2V5KSkgIT09IC0xO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdmFsdWUgZnJvbSBzcGVjaWZpYyBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IGRhdGEuaW5kZXhPZihoYXNoKGtleSkpO1xuICAgICAgICAgICAgaWYoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgLS1fbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBzaXplXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX2xlbmd0aDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFsbCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtIYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICAgICAgX2xlbmd0aCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzID0gSGFzaE1hcDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBkZWxheVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgZGVsYXk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgcmVwZWF0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB2YXIgcmVwZWF0O1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFjY1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgYWNjO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGRvbmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBkb25lO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHN0b3BwZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBzdG9wcGVkO1xuXG5cbiAgICAvKipcbiAgICAgKiBUaW1lclxuICAgICAqXG4gICAgICogQGNsYXNzIFRpbWVyXG4gICAgICogQG5hbWVzcGFjZSBVdGlsc1xuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAc3VibW9kdWxlIFV0aWxzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IF9kZWxheVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gX3JlcGVhdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBUaW1lciA9IGZ1bmN0aW9uIFRpbWVyKF9kZWxheSwgX3JlcGVhdCkge1xuICAgICAgICBkZWxheSA9IF9kZWxheTtcbiAgICAgICAgcmVwZWF0ID0gX3JlcGVhdCB8fCBmYWxzZTtcbiAgICAgICAgYWNjID0gMDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIHRpbWVyXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBkZWx0YVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICAgICAgaWYoIWRvbmUgJiYgIXN0b3BlZCkge1xuICAgICAgICAgICAgICAgIGFjYyArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjID49IGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGFjYyAtPSBkZWxheTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzZXQgdGltZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjYyA9IDA7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiBpcyBkb25lIG90aGVyd2lzZSBmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNEb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIGlzIHJ1bm5pbmcgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhZG9uZSAmJiBhY2MgPCBkZWxheSAmJiAhc3RvcHBlZDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcCB0aW1lclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIF9kZWxheVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXREZWxheSA9IGZ1bmN0aW9uKF9kZWxheSkge1xuICAgICAgICAgICAgZGVsYXkgPSBfZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGVjdXRlID0gZnVuY3Rpb24oKSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0UGVyY2VudGFnZVJlbWFpbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0b3BwZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEgLSAoZGVsYXkgLSBhY2MpIC8gZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsYXk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xufSkoKTsiXX0=
