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
(function() {
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
})();
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

    BitSet.prototype.clear = function(pos) {
        return this._words[whichWord(pos)] &= ~mask(pos);
    };

    BitSet.prototype.get = function(pos) {
        return this._words[whichWord(pos)] & mask(pos);
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
        for(next = 0; next < maxWords; ++next){
            var nextWord = arrOfWords[next] || 0;
            //this loops only the number of set bits, not 32 constant all the time!
            for(var bits = nextWord; bits !== 0; bits &= (bits - 1)){
                ++sum;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQXJ0ZW1pLmpzIiwic3JjL0FzcGVjdC5qcyIsInNyYy9Db21wb25lbnQuanMiLCJzcmMvQ29tcG9uZW50TWFuYWdlci5qcyIsInNyYy9Db21wb25lbnRNYXBwZXIuanMiLCJzcmMvQ29tcG9uZW50VHlwZS5qcyIsInNyYy9FbnRpdHkuanMiLCJzcmMvRW50aXR5TWFuYWdlci5qcyIsInNyYy9FbnRpdHlPYnNlcnZlci5qcyIsInNyYy9FbnRpdHlTeXN0ZW0uanMiLCJzcmMvTWFuYWdlci5qcyIsInNyYy9Xb3JsZC5qcyIsInNyYy9tYW5hZ2Vycy9Hcm91cE1hbmFnZXIuanMiLCJzcmMvbWFuYWdlcnMvUGxheWVyTWFuYWdlci5qcyIsInNyYy9tYW5hZ2Vycy9UYWdNYW5hZ2VyLmpzIiwic3JjL21hbmFnZXJzL1RlYW1NYW5hZ2VyLmpzIiwic3JjL25hdGl2ZS9BcnJheS5qcyIsInNyYy9uYXRpdmUvTWF0aC5qcyIsInNyYy9uYXRpdmUvTnVtYmVyLmpzIiwic3JjL25hdGl2ZS9PYmplY3QuanMiLCJzcmMvc3lzdGVtcy9EZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL0VudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0uanMiLCJzcmMvc3lzdGVtcy9JbnRlcnZhbEVudGl0eVN5c3RlbS5qcyIsInNyYy9zeXN0ZW1zL1ZvaWRFbnRpdHlTeXN0ZW0uanMiLCJzcmMvdXRpbHMvQmFnLmpzIiwic3JjL3V0aWxzL0JpdFNldC5qcyIsInNyYy91dGlscy9IYXNoTWFwLmpzIiwic3JjL3V0aWxzL1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL25hdGl2ZS9PYmplY3QnKTtcbnJlcXVpcmUoJy4vbmF0aXZlL0FycmF5Jyk7XG5yZXF1aXJlKCcuL25hdGl2ZS9NYXRoJyk7XG5yZXF1aXJlKCcuL25hdGl2ZS9OdW1iZXInKTtcblxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHRoaXMgZmlsZSBoYXZlIHRvIGJlIGluY2x1ZGVkIGZpcnN0IGluIHl1aWNvbXByZXNzb3JcblxuICAgIC8qKlxuICAgICAqIEVudGl0eSBGcmFtZXdvcmtcbiAgICAgKlxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQXJ0ZW1pSlNcbiAgICAgKiBAbWFpbiBBcnRlbWlKU1xuICAgICAqL1xuICAgIHZhciBBcnRlbWlKUyA9IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtOdW1iZXJ9IHZlcnNpb25cbiAgICAgICAgICovXG4gICAgICAgIHZlcnNpb246IDAuMSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtTdHJpbmd9IHNvdXJjZVxuICAgICAgICAgKi9cbiAgICAgICAgc291cmNlOiAnaHR0cHM6Ly9naXRodWIuY29tL2NvamFjay9hcnRlbWlqcycsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBsaWNlbnNlXG4gICAgICAgICAqL1xuICAgICAgICBsaWNlbnNlOiAnR1BMdjInLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge051bWJlcn0gZW52XG4gICAgICAgICAqL1xuICAgICAgICBlbnY6IDEgLy8gMSAtIGRldiwgMiAtIHRlc3QsIDQgLSBwcm9kXG4gICAgfTtcblxuICAgIEFydGVtaUpTLk1hbmFnZXJzID0ge1xuICAgICAgICBHcm91cE1hbmFnZXI6IHJlcXVpcmUoJy4vbWFuYWdlcnMvR3JvdXBNYW5hZ2VyJyksXG4gICAgICAgIFBsYXllck1hbmFnZXI6IHJlcXVpcmUoJy4vbWFuYWdlcnMvUGxheWVyTWFuYWdlcicpLFxuICAgICAgICBUYWdNYW5hZ2VyOiByZXF1aXJlKCcuL21hbmFnZXJzL1RhZ01hbmFnZXInKSxcbiAgICAgICAgVGVhbU1hbmFnZXI6IHJlcXVpcmUoJy4vbWFuYWdlcnMvVGVhbU1hbmFnZXInKVxuICAgIH07XG5cbiAgICBBcnRlbWlKUy5TeXN0ZW1zID0ge1xuICAgICAgICBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0RlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW06IHJlcXVpcmUoJy4vc3lzdGVtcy9FbnRpdHlQcm9jZXNzaW5nU3lzdGVtJyksXG4gICAgICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0ludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbScpLFxuICAgICAgICBJbnRlcnZhbEVudGl0eVN5c3RlbTogcmVxdWlyZSgnLi9zeXN0ZW1zL0ludGVydmFsRW50aXR5U3lzdGVtJyksXG4gICAgICAgIFZvaWRFbnRpdHlTeXN0ZW06IHJlcXVpcmUoJy4vc3lzdGVtcy9Wb2lkRW50aXR5U3lzdGVtJylcbiAgICB9O1xuXG4gICAgQXJ0ZW1pSlMuVXRpbHMgPSB7XG4gICAgICAgIEJhZzogcmVxdWlyZSgnLi91dGlscy9CYWcnKSxcbiAgICAgICAgQml0U2V0OiByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBIYXNoTWFwOiByZXF1aXJlKCcuL3V0aWxzL0hhc2hNYXAnKSxcbiAgICAgICAgVGltZXI6IHJlcXVpcmUoJy4vdXRpbHMvVGltZXInKVxuICAgIH07XG5cbiAgICBBcnRlbWlKUy5Bc3BlY3QgPSByZXF1aXJlKCcuL0FzcGVjdCcpO1xuICAgIEFydGVtaUpTLkNvbXBvbmVudCA9IHJlcXVpcmUoJy4vQ29tcG9uZW50Jyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50TWFuYWdlciA9IHJlcXVpcmUoJy4vQ29tcG9uZW50TWFuYWdlcicpO1xuICAgIEFydGVtaUpTLkNvbXBvbmVudE1hcHBlciA9IHJlcXVpcmUoJy4vQ29tcG9uZW50TWFwcGVyJyk7XG4gICAgQXJ0ZW1pSlMuQ29tcG9uZW50VHlwZSA9IHJlcXVpcmUoJy4vQ29tcG9uZW50VHlwZScpO1xuICAgIEFydGVtaUpTLkVudGl0eSA9IHJlcXVpcmUoJy4vRW50aXR5Jyk7XG4gICAgQXJ0ZW1pSlMuRW50aXR5TWFuYWdlciA9IHJlcXVpcmUoJy4vRW50aXR5TWFuYWdlcicpO1xuICAgIEFydGVtaUpTLkVudGl0eU9ic2VydmVyID0gcmVxdWlyZSgnLi9FbnRpdHlPYnNlcnZlcicpO1xuICAgIEFydGVtaUpTLkVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vRW50aXR5U3lzdGVtJyk7XG4gICAgQXJ0ZW1pSlMuTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFuYWdlcicpO1xuICAgIEFydGVtaUpTLldvcmxkID0gcmVxdWlyZSgnLi9Xb3JsZCcpO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBBcnRlbWlKUztcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBCaXRTZXQgPSByZXF1aXJlKCcuL3V0aWxzL0JpdFNldCcpLFxuICAgICAgICBDb21wb25lbnRUeXBlID0gcmVxdWlyZSgnLi9Db21wb25lbnRUeXBlJyk7XG5cbiAgICAvKipcbiAgICAgKiBBbiBBc3BlY3RzIGlzIHVzZWQgYnkgc3lzdGVtcyBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcywgdG8gY2hlY2sgaWYgYSBzeXN0ZW0gaXNcbiAgICAgKiBpbnRlcmVzdGVkIGluIGFuIGVudGl0eS4gQXNwZWN0cyBkZWZpbmUgd2hhdCBzb3J0IG9mIGNvbXBvbmVudCB0eXBlcyBhbiBlbnRpdHkgbXVzdFxuICAgICAqIHBvc3Nlc3MsIG9yIG5vdCBwb3NzZXNzLlxuICAgICAqIFxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBBIGFuZCBCIGFuZCBDOlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcylcbiAgICAgKiBcbiAgICAgKiBUaGlzIGNyZWF0ZXMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3MgQSBhbmQgQiBhbmQgQywgYnV0IG11c3Qgbm90IHBvc3Nlc3MgVSBvciBWLlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKVxuICAgICAqIFxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBBIGFuZCBCIGFuZCBDLCBidXQgbXVzdCBub3QgcG9zc2VzcyBVIG9yIFYsIGJ1dCBtdXN0IHBvc3Nlc3Mgb25lIG9mIFggb3IgWSBvciBaLlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKS5vbmUoWC5rbGFzcywgWS5rbGFzcywgWi5rbGFzcylcbiAgICAgKlxuICAgICAqIFlvdSBjYW4gY3JlYXRlIGFuZCBjb21wb3NlIGFzcGVjdHMgaW4gbWFueSB3YXlzOlxuICAgICAqIEFzcGVjdC5nZXRFbXB0eSgpLm9uZShYLmtsYXNzLCBZLmtsYXNzLCBaLmtsYXNzKS5hbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKVxuICAgICAqIGlzIHRoZSBzYW1lIGFzOlxuICAgICAqIEFzcGVjdC5nZXRBc3BlY3RGb3JBbGwoQS5rbGFzcywgQi5rbGFzcywgQy5rbGFzcykuZXhjbHVkZShVLmtsYXNzLCBWLmtsYXNzKS5vbmUoWC5rbGFzcywgWS5rbGFzcywgWi5rbGFzcylcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEFzcGVjdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBBc3BlY3QgPSBmdW5jdGlvbiBBc3BlY3QoKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFsbFNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFsbFNldCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZXhjbHVzaW9uU2V0XG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqLyAgICAgICAgXG4gICAgICAgIGV4Y2x1c2lvblNldCA9IG5ldyBCaXRTZXQoKSxcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGV4Y2x1c2lvblNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi8gICAgICAgICAgICAgICAgXG4gICAgICAgIG9uZVNldCA9IG5ldyBCaXRTZXQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRBbGxTZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRBbGxTZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxTZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRFeGNsdXNpb25TZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRFeGNsdXNpb25TZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBleGNsdXNpb25TZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRPbmVTZXRcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRPbmVTZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBvbmVTZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBhbGwgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBhIHJlcXVpcmVkIGNvbXBvbmVudCB0eXBlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZShsZW4tLSkge1xuICAgICAgICAgICAgICAgIGFsbFNldC5zZXQoQ29tcG9uZW50VHlwZS5nZXRJbmRleEZvcihhcmd1bWVudHNbbGVuXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRXhjbHVkZXMgYWxsIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzIGZyb20gdGhlIGFzcGVjdC4gQSBzeXN0ZW0gd2lsbCBub3QgYmVcbiAgICAgICAgICogaW50ZXJlc3RlZCBpbiBhbiBlbnRpdHkgdGhhdCBwb3NzZXNzZXMgb25lIG9mIHRoZSBzcGVjaWZpZWQgZXhjbHVzaW9uIGNvbXBvbmVudCB0eXBlcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZXhjbHVkZVxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBjb21wb25lbnQgdHlwZSB0byBleGNsdWRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4Y2x1ZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBleGNsdXNpb25TZXQuc2V0KENvbXBvbmVudFR5cGUuZ2V0SW5kZXhGb3IoYXJndW1lbnRzW2xlbl0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYW4gYXNwZWN0IHdoZXJlIGFuIGVudGl0eSBtdXN0IHBvc3Nlc3Mgb25lIG9mIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHR5cGVzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBvbmVcbiAgICAgICAgICogQGNoYWluYWJsZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSogb25lIG9mIHRoZSB0eXBlcyB0aGUgZW50aXR5IG11c3QgcG9zc2Vzc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vbmUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgb25lU2V0LnNldChDb21wb25lbnRUeXBlLmdldEluZGV4Rm9yKGFyZ3VtZW50c1tsZW5dKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBhbGwgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvckFsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBhIHJlcXVpcmVkIGNvbXBvbmVudCB0eXBlXG4gICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQXNwZWN0fSBhbiBhc3BlY3QgdGhhdCBjYW4gYmUgbWF0Y2hlZCBhZ2FpbnN0IGVudGl0aWVzXG4gICAgICovXG4gICAgQXNwZWN0LmdldEFzcGVjdEZvckFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICBhc3BlY3QuYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3BlY3Qgd2hlcmUgYW4gZW50aXR5IG11c3QgcG9zc2VzcyBvbmUgb2YgdGhlIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldEFzcGVjdEZvck9uZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlKiBvbmUgb2YgdGhlIHR5cGVzIHRoZSBlbnRpdHkgbXVzdCBwb3NzZXNzXG4gICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQXNwZWN0fSBhbiBhc3BlY3QgdGhhdCBjYW4gYmUgbWF0Y2hlZCBhZ2FpbnN0IGVudGl0aWVzXG4gICAgICovXG4gICAgQXNwZWN0LmdldEFzcGVjdEZvck9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gbmV3IEFzcGVjdCgpO1xuICAgICAgICBhc3BlY3Qub25lKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBhc3BlY3Q7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGFuIGVtcHR5IGFzcGVjdC4gVGhpcyBjYW4gYmUgdXNlZCBpZiB5b3Ugd2FudCBhIHN5c3RlbSB0aGF0IHByb2Nlc3NlcyBubyBlbnRpdGllcywgYnV0XG4gICAgICogc3RpbGwgZ2V0cyBpbnZva2VkLiBUeXBpY2FsIHVzYWdlcyBpcyB3aGVuIHlvdSBuZWVkIHRvIGNyZWF0ZSBzcGVjaWFsIHB1cnBvc2Ugc3lzdGVtcyBmb3IgZGVidWcgcmVuZGVyaW5nLFxuICAgICAqIGxpa2UgcmVuZGVyaW5nIEZQUywgaG93IG1hbnkgZW50aXRpZXMgYXJlIGFjdGl2ZSBpbiB0aGUgd29ybGQsIGV0Yy5cbiAgICAgKiBcbiAgICAgKiBZb3UgY2FuIGFsc28gdXNlIHRoZSBhbGwsIG9uZSBhbmQgZXhjbHVkZSBtZXRob2RzIG9uIHRoaXMgYXNwZWN0LCBzbyBpZiB5b3Ugd2FudGVkIHRvIGNyZWF0ZSBhIHN5c3RlbSB0aGF0XG4gICAgICogcHJvY2Vzc2VzIG9ubHkgZW50aXRpZXMgcG9zc2Vzc2luZyBqdXN0IG9uZSBvZiB0aGUgY29tcG9uZW50cyBBIG9yIEIgb3IgQywgdGhlbiB5b3UgY2FuIGRvOlxuICAgICAqIEFzcGVjdC5nZXRFbXB0eSgpLm9uZShBLEIsQyk7XG4gICAgICogXG4gICAgICogQG1ldGhvZCBnZXRFbXB0eVxuICAgICAqIEByZXR1cm4ge0FydGVtaUpTLkFzcGVjdH0gYW4gZW1wdHkgQXNwZWN0IHRoYXQgd2lsbCByZWplY3QgYWxsIGVudGl0aWVzLlxuICAgICAqL1xuICAgIEFzcGVjdC5nZXRFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEFzcGVjdCgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFzcGVjdDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICAvKipcbiAgICAgKiBBIHRhZyBjbGFzcy4gQWxsIGNvbXBvbmVudHMgaW4gdGhlIHN5c3RlbSBtdXN0IGV4dGVuZCB0aGlzIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KCkge31cblxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBCYWcgPSByZXF1aXJlKCcuL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBDb21wb25lbnRNYW5hZ2VyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIENvbXBvbmVudE1hbmFnZXIgPSBmdW5jdGlvbiBDb21wb25lbnRNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNvbXBvbmVudHNCeVR5cGVcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBjb21wb25lbnRzQnlUeXBlID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWxldGVkXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVkID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVDb21wb25lbnRzT2ZFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRCaXRzID0gZW50aXR5LmdldENvbXBvbmVudEJpdHMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoMCk7IGkgPj0gMDsgaSA9IGNvbXBvbmVudEJpdHMubmV4dFNldEJpdChpKzEpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5VHlwZS5nZXQoaSkuc2V0KGVudGl0eS5nZXRJZCgpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudEJpdHMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgY29tcG9uZW50IGJ5IHR5cGVcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlLCBjb21wb25lbnQpIHsgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLnNldCh0eXBlLmdldEluZGV4KCksIGNvbXBvbmVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnRzLnNldChlbnRpdHkuZ2V0SWQoKSwgY29tcG9uZW50KTtcbiAgICBcbiAgICAgICAgICAgIGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCkuc2V0KHR5cGUuZ2V0SW5kZXgoKSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGNvbXBvbmVudCBieSB0eXBlXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVDb21wb25lbnQgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUpIHtcbiAgICAgICAgICAgIGlmKGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCkuZ2V0KHR5cGUuZ2V0SW5kZXgoKSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpLnNldChlbnRpdHkuZ2V0SWQoKSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgZW50aXR5LmdldENvbXBvbmVudEJpdHMoKS5jbGVhcih0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjb21wb25lbnQgYnkgdHlwZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRzQnlUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CYWd9IEJhZyBvZiBjb21wb25lbnRzXG4gICAgICAgICAqLyAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50c0J5VHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gY29tcG9uZW50c0J5VHlwZS5nZXQodHlwZS5nZXRJbmRleCgpKTtcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gbmV3IEJhZygpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeVR5cGUuc2V0KHR5cGUuZ2V0SW5kZXgoKSwgY29tcG9uZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50VHlwZX0gdHlwZVxuICAgICAgICAgKiBAcmV0dXJuIE1peGVkIENvbXBvbmVudCBvbiBzdWNjZXNzLCBudWxsIG9uIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBjb21wb25lbnRzQnlUeXBlLmdldCh0eXBlLmdldEluZGV4KCkpO1xuICAgICAgICAgICAgaWYoY29tcG9uZW50cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRzLmdldChlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY29tcG9uZW50IGZvclxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRzRm9yXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGZpbGxCYWcgQmFnIG9mIGNvbXBvbmVudHNcbiAgICAgICAgICogQHJldHVybiB7QmFnfSBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzRm9yID0gZnVuY3Rpb24oZW50aXR5LCBmaWxsQmFnKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50Qml0cyA9IGVudGl0eS5nZXRDb21wb25lbnRCaXRzKCk7XG4gICAgXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gY29tcG9uZW50Qml0cy5uZXh0U2V0Qml0KDApOyBpID49IDA7IGkgPSBjb21wb25lbnRCaXRzLm5leHRTZXRCaXQoaSsxKSkge1xuICAgICAgICAgICAgICAgIGZpbGxCYWcuYWRkKGNvbXBvbmVudHNCeVR5cGUuZ2V0KGkpLmdldChlbnRpdHkuZ2V0SWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmlsbEJhZztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgZW50aXR5IHRvIGRlbGV0ZSBjb21wb25lbmV0cyBvZiB0aGVtXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkZWxldGVkLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFuIGRlbGV0ZWQgY29tcG9uZW5ldHMgb2YgZW50aXRpZXNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKGRlbGV0ZWQuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGRlbGV0ZWQuc2l6ZSgpID4gaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUNvbXBvbmVudHNPZkVudGl0eShkZWxldGVkLmdldChpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIENvbXBvbmVudE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgQ29tcG9uZW50TWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wb25lbnRNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50TWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuL0NvbXBvbmVudCcpLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHZhciBDb21wb25lbnRUeXBlIENvbXBvbmVudFR5cGVcbiAgICAgICAgICovXG4gICAgICAgIENvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcblxuICAgIC8qKlxuICAgICAqIEhpZ2ggcGVyZm9ybWFuY2UgY29tcG9uZW50IHJldHJpZXZhbCBmcm9tIGVudGl0aWVzLiBVc2UgdGhpcyB3aGVyZXZlciB5b3VcbiAgICAgKiBuZWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcyBvZnRlbiBhbmQgZmFzdC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIENvbXBvbmVudE1hcHBlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBfdHlwZVxuICAgICAqIEBwYXJhbSB7V29ybGR9IF93b3JsZFxuICAgICAqL1xuICAgIHZhciBDb21wb25lbnRNYXBwZXIgPSBmdW5jdGlvbiBDb21wb25lbnRNYXBwZXIoX3R5cGUsIF93b3JsZCkge1xuICAgICAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkge0NvbXBvbmVudFR5cGV9IHR5cGUgVHlwZSBvZiBjb21wb25lbnRcbiAgICAgICAgICovXG4gICAgICAgIHZhciB0eXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKF90eXBlKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gY29tcG9uZW50cyBCYWcgb2YgY29tcG9uZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50cyA9IF93b3JsZC5nZXRDb21wb25lbnRNYW5hZ2VyKCkuZ2V0Q29tcG9uZW50c0J5VHlwZSh0eXBlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRmFzdCBidXQgdW5zYWZlIHJldHJpZXZhbCBvZiBhIGNvbXBvbmVudCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIE5vIGJvdW5kaW5nIGNoZWNrcywgc28gdGhpcyBjb3VsZCByZXR1cm4gbnVsbCxcbiAgICAgICAgICogaG93ZXZlciBpbiBtb3N0IHNjZW5hcmlvcyB5b3UgYWxyZWFkeSBrbm93IHRoZSBlbnRpdHkgcG9zc2Vzc2VzIHRoaXMgY29tcG9uZW50LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRcbiAgICAgICAgICogQHBhcmFtIGVudGl0eSBFbnRpdHlcbiAgICAgICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQ29tcG9uZW50fXxudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHMuZ2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYXN0IGFuZCBzYWZlIHJldHJpZXZhbCBvZiBhIGNvbXBvbmVudCBmb3IgdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIElmIHRoZSBlbnRpdHkgZG9lcyBub3QgaGF2ZSB0aGlzIGNvbXBvbmVudCB0aGVuIG51bGwgaXMgcmV0dXJuZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFNhZmVcbiAgICAgICAgICogQHBhcmFtIGVudGl0eSBFbnRpdHlcbiAgICAgICAgICogQHJldHVybiB7QXJ0ZW1pSlMuQ29tcG9uZW50fXxudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFNhZmUgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudHMuaXNJbmRleFdpdGhpbkJvdW5kcyhlbnRpdHkuZ2V0SWQoKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50cy5nZXQoZW50aXR5LmdldElkKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoZSBlbnRpdHkgaGFzIHRoaXMgdHlwZSBvZiBjb21wb25lbnQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGhhc1xuICAgICAgICAgKiBAcGFyYW0ge0FydGVtaUpTLkVudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEByZXR1cm4gYm9vbGVhbiB0cnVlIGlmIHRoZSBlbnRpdHkgaGFzIHRoaXMgY29tcG9uZW50IHR5cGUsIGZhbHNlIGlmIGl0IGRvZXNuJ3QuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmhhcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2FmZShlbnRpdHkpICE9PSBudWxsO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGNvbXBvbmVudCBtYXBwZXIgZm9yIHRoaXMgdHlwZSBvZiBjb21wb25lbnRzLlxuICAgICAqIFxuICAgICAqIEBtZXRob2QgZ2V0Rm9yXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlIHRoZSB0eXBlIG9mIGNvbXBvbmVudHMgdGhpcyBtYXBwZXIgdXNlc1xuICAgICAqIEBwYXJhbSB7V29ybGR9IHdvcmxkIHRoZSB3b3JsZCB0aGF0IHRoaXMgY29tcG9uZW50IG1hcHBlciBzaG91bGQgdXNlXG4gICAgICogQHJldHVybiB7Q29tcG9uZW50TWFwcGVyfVxuICAgICAqL1xuICAgIENvbXBvbmVudE1hcHBlci5nZXRGb3IgPSBmdW5jdGlvbih0eXBlLCB3b3JsZCkge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudE1hcHBlcih0eXBlLCB3b3JsZCk7XG4gICAgfTtcbiAgICBcbiAgICBDb21wb25lbnRNYXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcbiAgICBDb21wb25lbnRNYXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcG9uZW50TWFwcGVyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50TWFwcGVyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi91dGlscy9IYXNoTWFwJyksXG4gICAgICAgIElOREVYID0gMCxcbiAgICAgICAgY29tcG9uZW50VHlwZXMgPSBuZXcgSGFzaE1hcCgpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAY2xhc3MgQ29tcG9uZW50VHlwZVxuICAgICAqL1xuICAgIHZhciBDb21wb25lbnRUeXBlID0gZnVuY3Rpb24gQ29tcG9uZW50VHlwZShfdHlwZSkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB0eXBlXG4gICAgICAgICAqIEB0eXBlIHtBcnRlbWlKUy5Db21wb25lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgdHlwZSA9IF90eXBlLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpbmRleFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgaW5kZXggPSBJTkRFWCsrO1xuXG4gICAgICAgIHRoaXMuZ2V0SW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJDb21wb25lbnRUeXBlW1wiK3R5cGUuZ2V0U2ltcGxlTmFtZSgpK1wiXSAoXCIraW5kZXgrXCIpXCI7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICpcbiAgICAgKi9cbiAgICBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIF90eXBlID0gY29tcG9uZW50VHlwZXMuZ2V0KGNvbXBvbmVudCk7XG4gICAgICAgIGlmKCFfdHlwZSkge1xuICAgICAgICAgICAgX3R5cGUgPSAgbmV3IENvbXBvbmVudFR5cGUoX3R5cGUpO1xuICAgICAgICAgICAgY29tcG9uZW50VHlwZXMucHV0KGNvbXBvbmVudCwgX3R5cGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdHlwZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKi9cbiAgICBDb21wb25lbnRUeXBlLmdldEluZGV4Rm9yID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFR5cGVGb3IoY29tcG9uZW50KS5nZXRJbmRleCgpO1xuICAgIH07XG5cbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudFR5cGU7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEJpdFNldCA9IHJlcXVpcmUoJy4vdXRpbHMvQml0U2V0JyksXG4gICAgICAgIENvbXBvbmVudFR5cGUgPSByZXF1aXJlKCcuL0NvbXBvbmVudFR5cGUnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgY2xhc3MuIENhbm5vdCBiZSBpbnN0YW50aWF0ZWQgb3V0c2lkZSB0aGUgZnJhbWV3b3JrLCB5b3UgbXVzdFxuICAgICAqIGNyZWF0ZSBuZXcgZW50aXRpZXMgdXNpbmcgV29ybGQuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1dvcmxkfSBfd29ybGRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gX2lkXG4gICAgICovIFxuICAgIGZ1bmN0aW9uIEVudGl0eShfd29ybGQsIF9pZCkge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSB1dWlkXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgdXVpZCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50Qml0c1xuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50Qml0cyA9IG5ldyBCaXRTZXQoKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbUJpdHNcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHN5c3RlbUJpdHMgPSBuZXcgQml0U2V0KCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHdvcmxkXG4gICAgICAgICAqIEB0eXBlIHtXb3JsZH1cbiAgICAgICAgICovXG4gICAgICAgIHdvcmxkID0gX3dvcmxkLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgaWQgPSBfaWQsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0eU1hbmFnZXJcbiAgICAgICAgICogQHR5cGUge0VudGl0eU1hbmFnZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBlbnRpdHlNYW5hZ2VyID0gd29ybGQuZ2V0RW50aXR5TWFuYWdlcigpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRNYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtDb21wb25lbnRNYW5hZ2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50TWFuYWdlciA9IHdvcmxkLmdldENvbXBvbmVudE1hbmFnZXIoKTtcbiAgICAgICAgXG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGludGVybmFsIGlkIGZvciB0aGlzIGVudGl0eSB3aXRoaW4gdGhlIGZyYW1ld29yay4gTm8gb3RoZXIgZW50aXR5XG4gICAgICAgICAqIHdpbGwgaGF2ZSB0aGUgc2FtZSBJRCwgYnV0IElEJ3MgYXJlIGhvd2V2ZXIgcmV1c2VkIHNvIGFub3RoZXIgZW50aXR5IG1heVxuICAgICAgICAgKiBhY3F1aXJlIHRoaXMgSUQgaWYgdGhlIHByZXZpb3VzIGVudGl0eSB3YXMgZGVsZXRlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0SWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRJZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBCaXRTZXQgaW5zdGFuY2UgY29udGFpbmluZyBiaXRzIG9mIHRoZSBjb21wb25lbnRzIHRoZSBlbnRpdHkgcG9zc2Vzc2VzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRDb21wb25lbnRCaXRzXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50Qml0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudEJpdHM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIEJpdFNldCBpbnN0YW5jZSBjb250YWluaW5nIGJpdHMgb2YgdGhlIGNvbXBvbmVudHMgdGhlIGVudGl0eSBwb3NzZXNzZXMuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldFN5c3RlbUJpdHNcbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRTeXN0ZW1CaXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtQml0cztcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgc3lzdGVtcyBCaXRTZXRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZXRob2QgcmVzZXRcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgc3lzdGVtQml0cy5jbGVhcigpO1xuICAgICAgICAgICAgY29tcG9uZW50Qml0cy5jbGVhcigpO1xuICAgICAgICAgICAgdXVpZCA9IE1hdGgudXVpZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTWFrZSBlbnRpdHkgcmVhZHkgZm9yIHJlLXVzZS5cbiAgICAgICAgICogV2lsbCBnZW5lcmF0ZSBhIG5ldyB1dWlkIGZvciB0aGUgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJFbnRpdHkgW1wiICsgaWQgKyBcIl1cIjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYSBjb21wb25lbnQgdG8gdGhpcyBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZENvbXBvbmVudFxuICAgICAgICAgKiBAY2hhaW5hYmxlXG4gICAgICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIHtDb21wb25lbnRUeXBlfSBbdHlwZV1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50LCB0eXBlKSB7XG4gICAgICAgICAgICBpZighKHR5cGUgaW5zdGFuY2VvZiBDb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBDb21wb25lbnRUeXBlLmdldFR5cGVGb3IoY29tcG9uZW50LmdldENsYXNzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50TWFuYWdlci5hZGRDb21wb25lbnQodGhpcywgdHlwZSwgY29tcG9uZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZSBjb21wb25lbnQgYnkgaXRzIHR5cGUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gW2NvbXBvbmVudF1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlQ29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50VHlwZTtcbiAgICAgICAgICAgIGlmKCEoY29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnRNYW5hZ2VyLnJlbW92ZUNvbXBvbmVudCh0aGlzLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVja3MgaWYgdGhlIGVudGl0eSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQgYW5kIGhhcyBub3QgYmVlbiBkZWxldGVkIGZyb20gaXQuXG4gICAgICAgICAqIElmIHRoZSBlbnRpdHkgaGFzIGJlZW4gZGlzYWJsZWQgdGhpcyB3aWxsIHN0aWxsIHJldHVybiB0cnVlLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0FjdGl2ZVxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuaXNBY3RpdmUodGhpcy5pZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpc0VuYWJsZWRcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5pc0VuYWJsZWQodGhpcy5pZCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBpcyB0aGUgcHJlZmVycmVkIG1ldGhvZCB0byB1c2Ugd2hlbiByZXRyaWV2aW5nIGEgY29tcG9uZW50IGZyb20gYVxuICAgICAgICAgKiBlbnRpdHkuIEl0IHdpbGwgcHJvdmlkZSBnb29kIHBlcmZvcm1hbmNlLlxuICAgICAgICAgKiBCdXQgdGhlIHJlY29tbWVuZGVkIHdheSB0byByZXRyaWV2ZSBjb21wb25lbnRzIGZyb20gYW4gZW50aXR5IGlzIHVzaW5nXG4gICAgICAgICAqIHRoZSBDb21wb25lbnRNYXBwZXIuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge0NvbXBvbmVudFR5cGV9IFt0eXBlXVxuICAgICAgICAgKiAgICAgIGluIG9yZGVyIHRvIHJldHJpZXZlIHRoZSBjb21wb25lbnQgZmFzdCB5b3UgbXVzdCBwcm92aWRlIGFcbiAgICAgICAgICogICAgICBDb21wb25lbnRUeXBlIGluc3RhbmNlIGZvciB0aGUgZXhwZWN0ZWQgY29tcG9uZW50LlxuICAgICAgICAgKiBAcmV0dXJuIHtBcnRlbWlKUy5Db21wb25lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRUeXBlO1xuICAgICAgICAgICAgaWYoISh0eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gQ29tcG9uZW50VHlwZS5nZXRUeXBlRm9yKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRNYW5hZ2VyLmdldENvbXBvbmVudCh0aGlzLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgYmFnIG9mIGFsbCBjb21wb25lbnRzIHRoaXMgZW50aXR5IGhhcy5cbiAgICAgICAgICogWW91IG5lZWQgdG8gcmVzZXQgdGhlIGJhZyB5b3Vyc2VsZiBpZiB5b3UgaW50ZW5kIHRvIGZpbGwgaXQgbW9yZSB0aGFuIG9uY2UuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudHNcbiAgICAgICAgICogQHBhcmFtIHtVdGlscy5CYWd9IGZpbGxCYWcgdGhlIGJhZyB0byBwdXQgdGhlIGNvbXBvbmVudHMgaW50by5cbiAgICAgICAgICogQHJldHVybiB7VXRpbHMuQmFnfSB0aGUgZmlsbEJhZyB3aXRoIHRoZSBjb21wb25lbnRzIGluLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRzID0gZnVuY3Rpb24oZmlsbEJhZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudE1hbmFnZXIuZ2V0Q29tcG9uZW50c0Zvcih0aGlzLCBmaWxsQmFnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWZyZXNoIGFsbCBjaGFuZ2VzIHRvIGNvbXBvbmVudHMgZm9yIHRoaXMgZW50aXR5LiBBZnRlciBhZGRpbmcgb3JcbiAgICAgICAgICogcmVtb3ZpbmcgY29tcG9uZW50cywgeW91IG11c3QgY2FsbCB0aGlzIG1ldGhvZC4gSXQgd2lsbCB1cGRhdGUgYWxsXG4gICAgICAgICAqIHJlbGV2YW50IHN5c3RlbXMuIEl0IGlzIHR5cGljYWwgdG8gY2FsbCB0aGlzIGFmdGVyIGFkZGluZyBjb21wb25lbnRzIHRvIGFcbiAgICAgICAgICogbmV3bHkgY3JlYXRlZCBlbnRpdHkuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZFRvV29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkVG9Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuYWRkRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgZW50aXR5IGhhcyBjaGFuZ2VkLCBhIGNvbXBvbmVudCBhZGRlZCBvciBkZWxldGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjaGFuZ2VkSW5Xb3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkSW5Xb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuY2hhbmdlZEVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgdGhpcyBlbnRpdHkgZnJvbSB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZUZyb21Xb3JsZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVGcm9tV29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdvcmxkLmRlbGV0ZUVudGl0eSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAoUmUpZW5hYmxlIHRoZSBlbnRpdHkgaW4gdGhlIHdvcmxkLCBhZnRlciBpdCBoYXZpbmcgYmVpbmcgZGlzYWJsZWQuXG4gICAgICAgICAqIFdvbid0IGRvIGFueXRoaW5nIHVubGVzcyBpdCB3YXMgYWxyZWFkeSBkaXNhYmxlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZW5hYmxlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd29ybGQuZW5hYmxlRW50aXR5KHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIGVudGl0eSBmcm9tIGJlaW5nIHByb2Nlc3NlZC4gV29uJ3QgZGVsZXRlIGl0LCBpdCB3aWxsXG4gICAgICAgICAqIGNvbnRpbnVlIHRvIGV4aXN0IGJ1dCB3b24ndCBnZXQgcHJvY2Vzc2VkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdvcmxkLmRpc2FibGVFbnRpdHkodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHRoZSBVVUlEIGZvciB0aGlzIGVudGl0eS5cbiAgICAgICAgICogVGhpcyBVVUlEIGlzIHVuaXF1ZSBwZXIgZW50aXR5IChyZS11c2VkIGVudGl0aWVzIGdldCBhIG5ldyBVVUlEKS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0VXVpZFxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IHV1aWQgaW5zdGFuY2UgZm9yIHRoaXMgZW50aXR5LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRVdWlkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdXVpZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSB3b3JsZCB0aGlzIGVudGl0eSBiZWxvbmdzIHRvLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRXb3JsZFxuICAgICAgICAgKiBAcmV0dXJuIHtXb3JsZH0gd29ybGQgb2YgZW50aXRpZXMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFdvcmxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gd29ybGQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQmFnID0gcmVxdWlyZSgnLi91dGlscy9CYWcnKSxcbiAgICAgICAgQml0U2V0ID0gcmVxdWlyZSgnLi91dGlscy9CaXRTZXQnKSxcbiAgICAgICAgRW50aXR5ID0gcmVxdWlyZSgnLi9FbnRpdHknKSxcbiAgICAgICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFuYWdlcicpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGVudGl0eSBtYW5hZ2VyIGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5TWFuYWdlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqLyBcbiAgICB2YXIgRW50aXR5TWFuYWdlciA9IGZ1bmN0aW9uIEVudGl0eU1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW50aXRpZXNcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBlbnRpdGllcyA9IG5ldyBCYWcoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGlzYWJsZWRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIGRpc2FibGVkID0gbmV3IEJpdFNldCgpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGFjdGl2ZSA9IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFkZGVkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBhZGRlZCA9IDAsXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNyZWF0ZWRcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZWQgPSAwLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWxldGVkXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVkID0gMCxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgaWRlbnRpZmllclBvb2xcbiAgICAgICAgICogQHR5cGUge0lkZW50aWZpZXJQb29sfVxuICAgICAgICAgKi9cbiAgICAgICAgaWRlbnRpZmllclBvb2wgPSBuZXcgSWRlbnRpZmllclBvb2woKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0aWFsaXplXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIG5ldyBlbnRpdHkgaW5zdGFuY2VcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY3JlYXRlRW50aXR5SW5zdGFuY2VcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcmVhdGVFbnRpdHlJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IG5ldyBFbnRpdHkodGhpcy53b3JsZCwgaWRlbnRpZmllclBvb2wuY2hlY2tPdXQoKSk7XG4gICAgICAgICAgICArK2NyZWF0ZWQ7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBlbnRpdHkgYXMgYWRkZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgICsrYWN0aXZlO1xuICAgICAgICAgICAgKythZGRlZDtcbiAgICAgICAgICAgIGVudGl0aWVzLnNldChlbnRpdHkuZ2V0SWQoKSwgZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGVuYWJsZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBkaXNhYmxlZC5jbGVhcihlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVudGl0eSBhcyBkaXNhYmxlZCBmb3IgZnV0dXJlIHByb2Nlc3NcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZGlzYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZGlzYWJsZWQuc2V0KGVudGl0eS5nZXRJZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgZW50aXR5IGFzIGRlbGV0ZWQgZm9yIGZ1dHVyZSBwcm9jZXNzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBlbnRpdGllcy5zZXQoZW50aXR5LmdldElkKCksIG51bGwpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkaXNhYmxlZC5jbGVhcihlbnRpdHkuZ2V0SWQoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkZW50aWZpZXJQb29sLmNoZWNrSW4oZW50aXR5LmdldElkKCkpO1xuXG4gICAgICAgICAgICAtLWFjdGl2ZTtcbiAgICAgICAgICAgICsrZGVsZXRlZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiB0aGlzIGVudGl0eSBpcyBhY3RpdmUuXG4gICAgICAgICAqIEFjdGl2ZSBtZWFucyB0aGUgZW50aXR5IGlzIGJlaW5nIGFjdGl2ZWx5IHByb2Nlc3NlZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaXNBY3RpdmVcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYWN0aXZlLCBmYWxzZSBpZiBub3RcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmdW5jdGlvbihlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzLmdldChlbnRpdHlJZCkgIT09IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIHNwZWNpZmllZCBlbnRpdHlJZCBpcyBlbmFibGVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0VuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgZW5hYmxlZCwgZmFsc2UgaWYgaXQgaXMgZGlzYWJsZWRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbmFibGVkID0gZnVuY3Rpb24oZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAhZGlzYWJsZWQuZ2V0KGVudGl0eUlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYSBlbnRpdHkgd2l0aCB0aGlzIGlkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdHlcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGVudGl0eUlkXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RW50aXR5ID0gZnVuY3Rpb24oZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRpdGllcy5nZXQoZW50aXR5SWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBob3cgbWFueSBlbnRpdGllcyBhcmUgYWN0aXZlIGluIHRoaXMgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEFjdGl2ZUVudGl0eUNvdW50XG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgZW50aXRpZXMgYXJlIGN1cnJlbnRseSBhY3RpdmUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEFjdGl2ZUVudGl0eUNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gYWN0aXZlO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGNyZWF0ZWQgaW4gdGhlIHdvcmxkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKiBOb3RlOiBBIGNyZWF0ZWQgZW50aXR5IG1heSBub3QgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCwgdGh1c1xuICAgICAgICAgKiBjcmVhdGVkIGNvdW50IGlzIGFsd2F5cyBlcXVhbCBvciBsYXJnZXIgdGhhbiBhZGRlZCBjb3VudC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0VG90YWxDcmVhdGVkXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGNyZWF0ZWQgc2luY2Ugc3RhcnQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFRvdGFsQ3JlYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZWQ7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgaG93IG1hbnkgZW50aXRpZXMgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0VG90YWxBZGRlZFxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBhZGRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VG90YWxBZGRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFkZGVkO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGhvdyBtYW55IGVudGl0aWVzIGhhdmUgYmVlbiBkZWxldGVkIGZyb20gdGhlIHdvcmxkIHNpbmNlIHN0YXJ0LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRUb3RhbERlbGV0ZWRcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSBob3cgbWFueSBlbnRpdGllcyBoYXZlIGJlZW4gZGVsZXRlZCBzaW5jZSBzdGFydC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0VG90YWxEZWxldGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsZXRlZDtcbiAgICAgICAgfTtcbiAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVXNlZCBvbmx5IGludGVybmFsbHkgaW4gRW50aXR5TWFuYWdlciB0byBnZW5lcmF0ZSBkaXN0aW5jdCBpZHMgZm9yXG4gICAgICAgICAqIGVudGl0aWVzIGFuZCByZXVzZSB0aGVtXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICAgICAqIEBjbGFzcyBJZGVudGlmaWVyUG9vbFxuICAgICAgICAgKiBAZm9yIEVudGl0eU1hbmFnZXJcbiAgICAgICAgICogQGZpbmFsXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gSWRlbnRpZmllclBvb2woKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IGlkc1xuICAgICAgICAgICAgICogQHR5cGUge1V0aWxzLkJhZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGlkcyA9IG5ldyBCYWcoKSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgbmV4dEF2YWlsYWJsZUlkXG4gICAgICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBuZXh0QXZhaWxhYmxlSWQgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIENoZWNrIGFuIGF2YWlsYWJsZSBpZFxuICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGNoZWNrT3V0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IG5leHQgYXZhaWxhYmxlIGlkXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hlY2tPdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZihpZHMuc2l6ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZHMucmVtb3ZlTGFzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKytuZXh0QXZhaWxhYmxlSWQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEFkZCBuZXcgaWQgaW4gaWRzIHtCYWd9XG4gICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAqIEBtZXRob2QgY2hlY2tJblxuICAgICAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hlY2tJbiA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goaWQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbiAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eU1hbmFnZXI7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlNYW5hZ2VyO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgb2JzZXJ2ZXIgY2xhc3MuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlPYnNlcnZlclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqLyBcbiAgICBmdW5jdGlvbiBFbnRpdHlPYnNlcnZlcigpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgYWRkZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGFkZGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gYWRkZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZnVuY3Rpb24oZW50aXR5KSAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBjaGFuZ2VkIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5T2JzZXJ2ZXIgZnVuY3Rpb24gZGVsZXRlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBYnN0cmFjdCBtZXRob2QgZW5hYmxlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgZW5hYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmdW5jdGlvbihlbnRpdHkpICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eU9ic2VydmVyIGZ1bmN0aW9uIGVuYWJsZWQgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHlPYnNlcnZlciBmdW5jdGlvbiBkaXNhYmxlZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlPYnNlcnZlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgQmFnID0gcmVxdWlyZSgnLi91dGlscy9CYWcnKSxcbiAgICAgICAgRW50aXR5T2JzZXJ2ZXIgPSByZXF1aXJlKCcuL0VudGl0eU9ic2VydmVyJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogVXNlZCB0byBnZW5lcmF0ZSBhIHVuaXF1ZSBiaXQgZm9yIGVhY2ggc3lzdGVtLlxuICAgICAqIE9ubHkgdXNlZCBpbnRlcm5hbGx5IGluIEVudGl0eVN5c3RlbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIFN5c3RlbUluZGV4TWFuYWdlclxuICAgICAqIEBmb3IgRW50aXR5U3lzdGVtXG4gICAgICogQGZpbmFsXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIFN5c3RlbUluZGV4TWFuYWdlciA9IHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgSU5ERVhcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIElOREVYOiAwLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBpbmRpY2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIGluZGljZXM6IHt9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0SW5kZXhGb3JcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHlTeXN0ZW19IGVudGl0eVN5c3RlbVxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgICAqL1xuICAgICAgICBnZXRJbmRleEZvcjogZnVuY3Rpb24oZW50aXR5U3lzdGVtKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGljZXNbZW50aXR5U3lzdGVtXTtcbiAgICAgICAgICAgIGlmKCFpbmRleCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5JTkRFWCsrO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlc1tlbnRpdHlTeXN0ZW1dID0gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBtb3N0IHJhdyBlbnRpdHkgc3lzdGVtLiBJdCBzaG91bGQgbm90IHR5cGljYWxseSBiZSB1c2VkLCBidXQgeW91IGNhbiBcbiAgICAgKiBjcmVhdGUgeW91ciBvd24gZW50aXR5IHN5c3RlbSBoYW5kbGluZyBieSBleHRlbmRpbmcgdGhpcy4gSXQgaXMgXG4gICAgICogcmVjb21tZW5kZWQgdGhhdCB5b3UgdXNlIHRoZSBvdGhlciBwcm92aWRlZCBlbnRpdHkgc3lzdGVtIGltcGxlbWVudGF0aW9uc1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgRW50aXR5U3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IGFzcGVjdCBDcmVhdGVzIGFuIGVudGl0eSBzeXN0ZW0gdGhhdCB1c2VzIHRoZSBzcGVjaWZpZWRcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgRW50aXR5U3lzdGVtID0gZnVuY3Rpb24gRW50aXR5U3lzdGVtKGFzcGVjdCkge1xuICAgICAgICBFbnRpdHlPYnNlcnZlci5jYWxsKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB3b3JsZFxuICAgICAgICAgKiBAdHlwZSB7V29ybGR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndvcmxkID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAZmluYWxcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbUluZGV4XG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc3lzdGVtSW5kZXggPSBTeXN0ZW1JbmRleE1hbmFnZXIuZ2V0SW5kZXhGb3IodGhpcy5nZXRDbGFzcygpKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlc1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFjdGl2ZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGFsbFNldFxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuQml0U2V0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFsbFNldCA9IGFzcGVjdC5nZXRBbGxTZXQoKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZXhjbHVzaW9uU2V0XG4gICAgICAgICAqIEB0eXBlIHtVdGlscy5CaXRTZXR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZXhjbHVzaW9uU2V0ID0gYXNwZWN0LmdldEV4Y2x1c2lvblNldCgpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBvbmVTZXRcbiAgICAgICAgICogQHR5cGUge1V0aWxzLkJpdFNldH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBvbmVTZXQgPSBhc3BlY3QuZ2V0T25lU2V0KCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHBhc3NpdmVcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcGFzc2l2ZTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZHVtbXlcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZHVtbXkgPSBhbGxTZXQuaXNFbXB0eSgpICYmIG9uZVNldC5pc0VtcHR5KCk7XG5cbiAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUZyb21TeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlRnJvbVN5c3RlbShlbnRpdHkpIHtcbiAgICAgICAgICAgIGFjdGl2ZXMucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICBlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmNsZWFyKHN5c3RlbUluZGV4KTtcbiAgICAgICAgICAgIG1lLnJlbW92ZWQoZW50aXR5KTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBpbnNlcnRUb1N5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBpbnNlcnRUb1N5c3RlbShlbnRpdHkpIHtcbiAgICAgICAgICAgIGFjdGl2ZXMuYWRkKGVudGl0eSk7XG4gICAgICAgICAgICBlbnRpdHkuZ2V0U3lzdGVtQml0cygpLnNldChzeXN0ZW1JbmRleCk7XG4gICAgICAgICAgICBtZS5pbnNlcnRlZChlbnRpdHkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIGJlZm9yZSBwcm9jZXNzaW5nIG9mIGVudGl0aWVzIGJlZ2luc1xuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGJlZ2luXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJlZ2luID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIHRoZSBlbnRpdGllc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuY2hlY2tQcm9jZXNzaW5nKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJlZ2luKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMoYWN0aXZlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgYWZ0ZXIgdGhlIHByb2Nlc3Npbmcgb2YgZW50aXRpZXMgZW5kc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbmRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5kID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbnkgaW1wbGVtZW50aW5nIGVudGl0eSBzeXN0ZW0gbXVzdCBpbXBsZW1lbnQgdGhpcyBtZXRob2QgYW5kIHRoZSBcbiAgICAgICAgICogbG9naWMgdG8gcHJvY2VzcyB0aGUgZ2l2ZW4gZW50aXRpZXMgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcHJvY2Vzc0VudGl0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBlbnRpdGllcyBhdGhlIGVudGl0aWVzIHRoaXMgc3lzdGVtIGNvbnRhaW5zXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayB0aGUgc3lzdGVtIHNob3VsZCBwcm9jZXNzaW5nXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNoZWNrUHJvY2Vzc2luZ1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoZSBzeXN0ZW0gc2hvdWxkIGJlIHByb2Nlc3NlZCwgZmFsc2UgaWYgbm90XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGNvZGUgdGhhdCBnZXRzIGV4ZWN1dGVkIHdoZW4gc3lzdGVtcyBhcmUgXG4gICAgICAgICAqIGluaXRpYWxpemVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBpZiB0aGUgc3lzdGVtIGhhcyByZWNlaXZlZCBhIGVudGl0eSBpdCBpcyBpbnRlcmVzdGVkIGluLCBcbiAgICAgICAgICogZS5nLiBjcmVhdGVkIG9yIGEgY29tcG9uZW50IHdhcyBhZGRlZCB0byBpdC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgaW5zZXJ0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0aGUgZW50aXR5IHRoYXQgd2FzIGFkZGVkIHRvIHRoaXMgc3lzdGVtXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluc2VydGVkID0gZnVuY3Rpb24oZW50aXR5KSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgaWYgYSBlbnRpdHkgd2FzIHJlbW92ZWQgZnJvbSB0aGlzIHN5c3RlbSwgZS5nLiBkZWxldGVkIFxuICAgICAgICAgKiBvciBoYWQgb25lIG9mIGl0J3MgY29tcG9uZW50cyByZW1vdmVkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHkgdGhlIGVudGl0eSB0aGF0IHdhcyByZW1vdmVkIGZyb20gdGhpcyBzeXN0ZW0uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpbGwgY2hlY2sgaWYgdGhlIGVudGl0eSBpcyBvZiBpbnRlcmVzdCB0byB0aGlzIHN5c3RlbS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hlY2tcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0aGUgZW50aXR5IHRvIGNoZWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoZWNrID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihkdW1teSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjb250YWlucyA9IGVudGl0eS5nZXRTeXN0ZW1CaXRzKCkuZ2V0KHN5c3RlbUluZGV4KTtcbiAgICAgICAgICAgIHZhciBpbnRlcmVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRCaXRzID0gZW50aXR5LmdldENvbXBvbmVudEJpdHMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIWFsbFNldC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gYWxsU2V0Lm5leHRTZXRCaXQoMCk7IGkgPj0gMDsgaSA9IGFsbFNldC5uZXh0U2V0Qml0KGkrMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIWNvbXBvbmVudEJpdHMuZ2V0KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmVzdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gICAgICAgIFxuICAgICAgICAgICAgaWYoIWV4Y2x1c2lvblNldC5pc0VtcHR5KCkgJiYgaW50ZXJlc3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcmVzdGVkID0gIWV4Y2x1c2lvblNldC5pbnRlcnNlY3RzKGNvbXBvbmVudEJpdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZW50aXR5IHBvc3Nlc3NlcyBBTlkgb2YgdGhlIGNvbXBvbmVudHMgaW4gdGhlIG9uZVNldC4gSWYgc28sIHRoZSBzeXN0ZW0gaXMgaW50ZXJlc3RlZC5cbiAgICAgICAgICAgIGlmKCFvbmVTZXQuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVyZXN0ZWQgPSBvbmVTZXQuaW50ZXJzZWN0cyhjb21wb25lbnRCaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChpbnRlcmVzdGVkICYmICFjb250YWlucykge1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnRUb1N5c3RlbShlbnRpdHkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW50ZXJlc3RlZCAmJiBjb250YWlucykge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVjayhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2soZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmdldChzeXN0ZW1JbmRleCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBpZihlbnRpdHkuZ2V0U3lzdGVtQml0cygpLmdldChzeXN0ZW1JbmRleCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVGcm9tU3lzdGVtKGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbmFibGVkXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5jaGVjayhlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qgc2V0V29ybGRcbiAgICAgICAgICogQHBhcmFtIHtXb3JsZH0gd29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0V29ybGQgPSBmdW5jdGlvbih3b3JsZCkge1xuICAgICAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaXNQYXNzaXZlXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzUGFzc2l2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhc3NpdmU7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldFBhc3NpdmVcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBwYXNzaXZlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFBhc3NpdmUgPSBmdW5jdGlvbihfcGFzc2l2ZSkge1xuICAgICAgICAgICAgcGFzc2l2ZSA9IF9wYXNzaXZlO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0QWN0aXZlc1xuICAgICAgICAgKiBAcmV0dXJuIHtVdGlscy5CYWd9IGFjdGl2ZXNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0QWN0aXZlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZXM7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBFbnRpdHlTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlPYnNlcnZlci5wcm90b3R5cGUpO1xuICAgIEVudGl0eVN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eU9ic2VydmVyID0gcmVxdWlyZSgnLi9FbnRpdHlPYnNlcnZlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpdHkgY2xhc3MuIENhbm5vdCBiZSBpbnN0YW50aWF0ZWQgb3V0c2lkZSB0aGUgZnJhbWV3b3JrLCB5b3UgbXVzdFxuICAgICAqIGNyZWF0ZSBuZXcgZW50aXRpZXMgdXNpbmcgV29ybGQuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBNYW5hZ2VyXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovIFxuICAgIHZhciBNYW5hZ2VyID0gZnVuY3Rpb24gTWFuYWdlcigpIHtcbiAgICAgICAgRW50aXR5T2JzZXJ2ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgd29ybGRcbiAgICAgICAgICogQHR5cGUge1dvcmxkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53b3JsZCA9IG51bGw7XG4gICAgICAgIFxuICAgICAgIC8qKlxuICAgICAgICAgKiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY29kZSB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbiBzeXN0ZW1zIGFyZSBcbiAgICAgICAgICogaW5pdGlhbGl6ZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldFdvcmxkXG4gICAgICAgICAqIEBwYXJhbSB7V29ybGR9IHdvcmxkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFdvcmxkID0gZnVuY3Rpb24od29ybGQpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBnZXRXb3JsZFxuICAgICAgICAgKiBAcmV0dXJuIHtXb3JsZH0gd29ybGRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0V29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndvcmxkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFic3RyYWN0IG1ldGhvZCBhZGRlZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQGFic3RyYWN0XG4gICAgICAgICAqIEBtZXRob2QgYWRkZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGNoYW5nZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogXG4gICAgICAgICAqIEBhYnN0cmFjdFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZWRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbmFibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWJzdHJhY3QgbWV0aG9kIGRpc2FibGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAYWJzdHJhY3RcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlZFxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gZnVuY3Rpb24oZW50aXR5KSAge307IFxuICAgIH07XG4gICAgXG4gICAgTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eU9ic2VydmVyLnByb3RvdHlwZSk7XG4gICAgTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBFbnRpdHlNYW5hZ2VyID0gcmVxdWlyZSgnLi9FbnRpdHlNYW5hZ2VyJyksXG4gICAgICAgIENvbXBvbmVudE1hbmFnZXIgPSByZXF1aXJlKCcuL0NvbXBvbmVudE1hbmFnZXInKSxcbiAgICAgICAgQ29tcG9uZW50TWFwcGVyID0gcmVxdWlyZSgnLi9Db21wb25lbnRNYXBwZXInKSxcbiAgICAgICAgQmFnID0gcmVxdWlyZSgnLi91dGlscy9CYWcnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBwcmltYXJ5IGluc3RhbmNlIGZvciB0aGUgZnJhbWV3b3JrLiBJdCBjb250YWlucyBhbGwgdGhlIG1hbmFnZXJzLlxuICAgICAqIFlvdSBtdXN0IHVzZSB0aGlzIHRvIGNyZWF0ZSwgZGVsZXRlIGFuZCByZXRyaWV2ZSBlbnRpdGllcy5cbiAgICAgKiBJdCBpcyBhbHNvIGltcG9ydGFudCB0byBzZXQgdGhlIGRlbHRhIGVhY2ggZ2FtZSBsb29wIGl0ZXJhdGlvbiwgXG4gICAgICogYW5kIGluaXRpYWxpemUgYmVmb3JlIGdhbWUgbG9vcC5cbiAgICAgKlxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgV29ybGRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBXb3JsZCgpIHtcblxuICAgICAgICBjb25zb2xlLmluZm8oXCJXZWxjb21lIHRvIEFydGVtaUpTLCBjb21wb25lbnQgb3JpZW50ZWQgZnJhbWV3b3JrIVwiKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZW50aXR5TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7RW50aXR5TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBlbnRpdHlNYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKiBAdHlwZSB7Q29tcG9uZW50TWFuYWdlcn1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudE1hbmFnZXIgPSBuZXcgQ29tcG9uZW50TWFuYWdlcigpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYW5hZ2VyXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBtYW5hZ2VycyA9IHt9LFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBtYW5hZ2Vyc0JhZ1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgbWFuYWdlcnNCYWcgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHN5c3RlbXNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHN5c3RlbXMgPSB7fSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgc3lzdGVtc0JhZ1xuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgc3lzdGVtc0JhZyA9IG5ldyBCYWcoKSxcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhZGRlZFxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGNoYW5nZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGNoYW5nZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbGV0ZWRcbiAgICAgICAgICogQHR5cGUge0JhZ31cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZWQgPSBuZXcgQmFnKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVuYWJsZVxuICAgICAgICAgKiBAdHlwZSB7QmFnfVxuICAgICAgICAgKi9cbiAgICAgICAgZW5hYmxlID0gbmV3IEJhZygpLFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkaXNhYmxlXG4gICAgICAgICAqIEB0eXBlIHtCYWd9XG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlID0gbmV3IEJhZygpLFxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGRlbHRhXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBkZWx0YSA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ha2VzIHN1cmUgYWxsIG1hbmFnZXJzIHN5c3RlbXMgYXJlIGluaXRpYWxpemVkIGluIHRoZSBvcmRlciBcbiAgICAgICAgICogdGhleSB3ZXJlIGFkZGVkXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS50aW1lU3RhbXAoXCJNYW5hZ2VycyBpbml0aWFsaXphdGlvblwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoXCJNYW5hZ2VycyBpbml0aWFsaXphdGlvblwiKTtcbiAgICAgICAgICAgIHZhciBpID0gbWFuYWdlcnNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgbWFuYWdlcnNCYWcuZ2V0KGkpLmluaXRpYWxpemUoKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHN5c3RlbXNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgc3lzdGVtc0JhZy5nZXQoaSkuaW5pdGlhbGl6ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBtYW5hZ2VyIHRoYXQgdGFrZXMgY2FyZSBvZiBhbGwgdGhlIGVudGl0aWVzIGluIHRoZSB3b3JsZC5cbiAgICAgICAgICogZW50aXRpZXMgb2YgdGhpcyB3b3JsZFxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRFbnRpdHlNYW5hZ2VyXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eU1hbmFnZXJ9IGVudGl0eU1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RW50aXR5TWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXI7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhIG1hbmFnZXIgdGhhdCB0YWtlcyBjYXJlIG9mIGFsbCB0aGUgY29tcG9uZW50cyBpbiB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldENvbXBvbmVudE1hbmFnZXJcbiAgICAgICAgICogQHJldHVybiB7Q29tcG9uZW50TWFuYWdlcn0gY29tcG9uZW50TWFuYWdlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnRNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50TWFuYWdlcjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYSBtYW5hZ2VyIGludG8gdGhpcyB3b3JsZC4gSXQgY2FuIGJlIHJldHJpZXZlZCBsYXRlci5cbiAgICAgICAgICogV29ybGQgd2lsbCBub3RpZnkgdGhpcyBtYW5hZ2VyIG9mIGNoYW5nZXMgdG8gZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRNYW5hZ2VyXG4gICAgICAgICAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlciBtYW5hZ2VyIHRvIGJlIGFkZGVkXG4gICAgICAgICAqIEByZXR1cm4ge01hbmFnZXJ9IG1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0TWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwic2V0IG1hbmFnZXJcIik7XG4gICAgICAgICAgICBtYW5hZ2VyLnNldFdvcmxkKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYW5hZ2Vyc1ttYW5hZ2VyLmdldENsYXNzKCldID0gbWFuYWdlcjtcbiAgICAgICAgICAgIG1hbmFnZXJzQmFnLmFkZChtYW5hZ2VyKTtcbiAgICBcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2VyO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBtYW5hZ2VyIG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYW5hZ2VyVHlwZSBjbGFzcyB0eXBlIG9mIHRoZSBtYW5hZ2VyXG4gICAgICAgICAqIEByZXR1cm4ge01hbmFnZXJ9IG1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0TWFuYWdlciA9IGZ1bmN0aW9uKG1hbmFnZXJUeXBlKSB7ICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2Vyc1ttYW5hZ2VyVHlwZV0gfHwgZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlcyB0aGUgbWFuYWdlciBmcm9tIHRoaXMgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZU1hbmFnZXJcbiAgICAgICAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyIG1hbmFnZXIgdG8gZGVsZXRlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVNYW5hZ2VyID0gZnVuY3Rpb24obWFuYWdlcikge1xuICAgICAgICAgICAgZGVsZXRlIG1hbmFnZXJzW21hbmFnZXIuZ2V0Q2xhc3MoKV07XG4gICAgICAgICAgICBtYW5hZ2Vyc0JhZy5yZW1vdmUobWFuYWdlcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogWW91IG11c3Qgc3BlY2lmeSB0aGUgZGVsdGEgZm9yIHRoZSBnYW1lIGhlcmUuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldERlbHRhXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkIHRpbWUgc2luY2UgbGFzdCBnYW1lIGxvb3AuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldERlbHRhID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgZGVsdGEgPSBkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldERlbHRhXG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gZGVsdGEgdGltZSBzaW5jZSBsYXN0IGdhbWUgbG9vcC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RGVsdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWx0YTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGRzIGEgZW50aXR5IHRvIHRoaXMgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZEVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgYWRkZWQuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRW5zdXJlIGFsbCBzeXN0ZW1zIGFyZSBub3RpZmllZCBvZiBjaGFuZ2VzIHRvIHRoaXMgZW50aXR5LlxuICAgICAgICAgKiBJZiB5b3UncmUgYWRkaW5nIGEgY29tcG9uZW50IHRvIGFuIGVudGl0eSBhZnRlciBpdCdzIGJlZW5cbiAgICAgICAgICogYWRkZWQgdG8gdGhlIHdvcmxkLCB0aGVuIHlvdSBuZWVkIHRvIGludm9rZSB0aGlzIG1ldGhvZC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY2hhbmdlZEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoYW5nZWRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGNoYW5nZWQuYWRkKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIHRoZSBlbnRpdHkgZnJvbSB0aGUgd29ybGQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGRlbGV0ZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgYWRkZWQucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogKFJlKWVuYWJsZSB0aGUgZW50aXR5IGluIHRoZSB3b3JsZCwgYWZ0ZXIgaXQgaGF2aW5nIGJlaW5nIGRpc2FibGVkLlxuICAgICAgICAgKiBXb24ndCBkbyBhbnl0aGluZyB1bmxlc3MgaXQgd2FzIGFscmVhZHkgZGlzYWJsZWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGVuYWJsZUVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVuYWJsZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW5hYmxlLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIGVudGl0eSBmcm9tIGJlaW5nIHByb2Nlc3NlZC4gV29uJ3QgZGVsZXRlIGl0LCBpdCB3aWxsXG4gICAgICAgICAqIGNvbnRpbnVlIHRvIGV4aXN0IGJ1dCB3b24ndCBnZXQgcHJvY2Vzc2VkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkaXNhYmxlRW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGlzYWJsZUVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZGlzYWJsZS5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBvciByZXVzZWQgZW50aXR5IGluc3RhbmNlLlxuICAgICAgICAgKiBXaWxsIE5PVCBhZGQgdGhlIGVudGl0eSB0byB0aGUgd29ybGQsIHVzZSBXb3JsZC5hZGRFbnRpdHkoRW50aXR5KSBmb3IgdGhhdC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgY3JlYXRlRW50aXR5XG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS50aW1lU3RhbXAoXCJjcmVhdGUgZW50aXR5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIGVudGl0eU1hbmFnZXIuY3JlYXRlRW50aXR5SW5zdGFuY2UoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYSBlbnRpdHkgaGF2aW5nIHRoZSBzcGVjaWZpZWQgaWQuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGdldEVudGl0eVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gaWQgZW50aXR5IGlkXG4gICAgICAgICAqIEByZXR1cm4ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEVudGl0eSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXR5TWFuYWdlci5nZXRFbnRpdHkoaWQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVzIHlvdSBhbGwgdGhlIHN5c3RlbXMgaW4gdGhpcyB3b3JsZCBmb3IgcG9zc2libGUgaXRlcmF0aW9uLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRTeXN0ZW1zXG4gICAgICAgICAqIEByZXR1cm4geyp9IGFsbCBlbnRpdHkgc3lzdGVtcyBpbiB3b3JsZCwgb3RoZXIgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN5c3RlbXNCYWc7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBhIHN5c3RlbSB0byB0aGlzIHdvcmxkIHRoYXQgd2lsbCBiZSBwcm9jZXNzZWQgYnkgV29ybGQucHJvY2VzcygpXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNldFN5c3RlbVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eVN5c3RlbX0gc3lzdGVtIHRoZSBzeXN0ZW0gdG8gYWRkLlxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwYXNzaXZlXSB3aGV0aGVyIG9yIG5vdCB0aGlzIHN5c3RlbSB3aWxsIGJlIHByb2Nlc3NlZCBieSBXb3JsZC5wcm9jZXNzKClcbiAgICAgICAgICogQHJldHVybiB7RW50aXR5U3lzdGVtfSB0aGUgYWRkZWQgc3lzdGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRTeXN0ZW0gPSBmdW5jdGlvbihzeXN0ZW0sIHBhc3NpdmUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwic2V0IHN5c3RlbVwiKTtcbiAgICAgICAgICAgIHBhc3NpdmUgPSBwYXNzaXZlIHx8IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzeXN0ZW0uc2V0V29ybGQodGhpcyk7XG4gICAgICAgICAgICBzeXN0ZW0uc2V0UGFzc2l2ZShwYXNzaXZlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3lzdGVtc1tzeXN0ZW0uZ2V0Q2xhc3MoKV0gPSBzeXN0ZW07XG4gICAgICAgICAgICBzeXN0ZW1zQmFnLmFkZChzeXN0ZW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0cmlldmUgYSBzeXN0ZW0gZm9yIHNwZWNpZmllZCBzeXN0ZW0gdHlwZS5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0U3lzdGVtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzeXN0ZW1UeXBlIHR5cGUgb2Ygc3lzdGVtLlxuICAgICAgICAgKiBAcmV0dXJuIHtFbnRpdHlTeXN0ZW19IGluc3RhbmNlIG9mIHRoZSBzeXN0ZW0gaW4gdGhpcyB3b3JsZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U3lzdGVtID0gZnVuY3Rpb24oc3lzdGVtVHlwZSkgeyAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3lzdGVtc1tzeXN0ZW1UeXBlXSB8fCBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVkIHRoZSBzcGVjaWZpZWQgc3lzdGVtIGZyb20gdGhlIHdvcmxkLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBkZWxldGVTeXN0ZW1cbiAgICAgICAgICogQHBhcmFtIHN5c3RlbSB0byBiZSBkZWxldGVkIGZyb20gd29ybGQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZVN5c3RlbSA9IGZ1bmN0aW9uKHN5c3RlbSkge1xuICAgICAgICAgICAgZGVsZXRlIHN5c3RlbXNbc3lzdGVtLmdldENsYXNzKCldO1xuICAgICAgICAgICAgc3lzdGVtc0JhZy5yZW1vdmUoc3lzdGVtKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOb3RpZnkgYWxsIHRoZSBzeXN0ZW1zXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIG5vdGlmeVN5c3RlbXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lciBPYmplY3Qgd2l0aCBjYWxsYmFjayBwZXJmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG5vdGlmeVN5c3RlbXMocGVyZm9ybWVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwibm90aWZ5IHN5c3RlbXNcIik7XG4gICAgICAgICAgICB2YXIgaSA9IHN5c3RlbXNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybWVyLnBlcmZvcm0oc3lzdGVtc0JhZy5nZXQoaSksIGVudGl0eSk7XG4gICAgICAgICAgICB9ICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE5vdGlmeSBhbGwgdGhlIG1hbmFnZXJzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWV0aG9kIG5vdGlmeVN5c3RlbXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lciBPYmplY3Qgd2l0aCBjYWxsYmFjayBwZXJmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG5vdGlmeU1hbmFnZXJzKHBlcmZvcm1lciwgZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLnRpbWVTdGFtcChcIm5vdGlmeSBtYW5hZ2Vyc1wiKTtcbiAgICAgICAgICAgIHZhciBpID0gbWFuYWdlcnNCYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybWVyLnBlcmZvcm0obWFuYWdlcnNCYWcuZ2V0KGkpLCBlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYW4gYWN0aW9uIG9uIGVhY2ggZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1ldGhvZCBjaGVja1xuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gZW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBlcmZvcm1lclxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY2hlY2soZW50aXRpZXMsIHBlcmZvcm1lcikge1xuICAgICAgICAgICAgaWYoIWVudGl0aWVzLnNpemUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gZW50aXRpZXMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmdldChpKTtcbiAgICAgICAgICAgICAgICBub3RpZnlNYW5hZ2VycyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICAgICAgbm90aWZ5U3lzdGVtcyhwZXJmb3JtZXIsIGVudGl0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVudGl0aWVzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9jZXNzIGFsbCBub24tcGFzc2l2ZSBzeXN0ZW1zLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBwcm9jZXNzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudGltZVN0YW1wKFwicHJvY2VzcyBldmVyeXRoaW5nXCIpO1xuICAgICAgICAgICAgY2hlY2soYWRkZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmFkZGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGNoYW5nZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbihvYnNlcnZlciwgZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNoYW5nZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZGlzYWJsZSwge1xuICAgICAgICAgICAgICAgIHBlcmZvcm06IGZ1bmN0aW9uKG9ic2VydmVyLCBlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzYWJsZWQoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hlY2soZW5hYmxlLCB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybTogZnVuY3Rpb24ob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lbmFibGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoZWNrKGRlbGV0ZWQsIHtcbiAgICAgICAgICAgICAgICBwZXJmb3JtOiBmdW5jdGlvbiAob2JzZXJ2ZXIsIGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kZWxldGVkKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudE1hbmFnZXIuY2xlYW4oKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGkgPSBzeXN0ZW1zQmFnLnNpemUoKTtcbiAgICAgICAgICAgIHdoaWxlKGktLSkge1xuICAgICAgICAgICAgICAgIHZhciBzeXN0ZW0gPSBzeXN0ZW1zQmFnLmdldChpKTtcbiAgICAgICAgICAgICAgICBpZighc3lzdGVtLmlzUGFzc2l2ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN5c3RlbS5wcm9jZXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlcyBhIENvbXBvbmVudE1hcHBlciBpbnN0YW5jZSBmb3IgZmFzdCByZXRyaWV2YWwgXG4gICAgICAgICAqIG9mIGNvbXBvbmVudHMgZnJvbSBlbnRpdGllcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0TWFwcGVyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlIG9mIGNvbXBvbmVudCB0byBnZXQgbWFwcGVyIGZvci5cbiAgICAgICAgICogQHJldHVybiB7Q29tcG9uZW50TWFwcGVyfSBtYXBwZXIgZm9yIHNwZWNpZmllZCBjb21wb25lbnQgdHlwZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0TWFwcGVyID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudE1hcHBlci5nZXRGb3IodHlwZSwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldE1hbmFnZXIoY29tcG9uZW50TWFuYWdlcik7XG4gICAgICAgIHRoaXMuc2V0TWFuYWdlcihlbnRpdHlNYW5hZ2VyKTtcbiAgICB9XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBXb3JsZDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgQmFnID0gcmVxdWlyZSgnLi8uLi91dGlscy9CYWcnKSxcbiAgICAgICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vTWFuYWdlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIElmIHlvdSBuZWVkIHRvIGdyb3VwIHlvdXIgZW50aXRpZXMgdG9nZXRoZXIsIGUuZy4gdGFua3MgZ29pbmcgaW50byBcbiAgICAgKiBcInVuaXRzXCIgZ3JvdXAgb3IgZXhwbG9zaW9ucyBpbnRvIFwiZWZmZWN0c1wiLFxuICAgICAqIHRoZW4gdXNlIHRoaXMgbWFuYWdlci4gWW91IG11c3QgcmV0cmlldmUgaXQgdXNpbmcgd29ybGQgaW5zdGFuY2UuXG4gICAgICogXG4gICAgICogQSBlbnRpdHkgY2FuIGJlIGFzc2lnbmVkIHRvIG1vcmUgdGhhbiBvbmUgZ3JvdXAuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgTWFuYWdlcnNcbiAgICAgKiBAY2xhc3MgR3JvdXBNYW5hZ2VyXG4gICAgICogQG5hbWVzcGFjZSBNYW5hZ2Vyc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBleHRlbmRzIE1hbmFnZXJcbiAgICAgKi9cbiAgICB2YXIgR3JvdXBNYW5hZ2VyID0gZnVuY3Rpb24gR3JvdXBNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IGVudGl0aWVzQnlHcm91cFxuICAgICAgICAgKiBAdHlwZSB7TWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVudGl0aWVzQnlHcm91cCA9IG5ldyBNYXAoKSxcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZ3JvdXBzQnlFbnRpdHlcbiAgICAgICAgICogQHR5cGUge01hcH1cbiAgICAgICAgICovXG4gICAgICAgIGdyb3Vwc0J5RW50aXR5ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHRoZSBncm91cCBvZiB0aGUgZW50aXR5LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBhZGRcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSB0byBhZGQgaW50byB0aGUgZ3JvdXBcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwIHRvIGFkZCB0aGUgZW50aXR5IGludG9cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoZ3JvdXAubGVuZ3RoID4gMCwgXCJHcm91cCBpcyBlbXB0eVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cCk7XG4gICAgICAgICAgICBpZighZW50aXRpZXMpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBlbnRpdGllc0J5R3JvdXAuc2V0KGdyb3VwLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYoIWdyb3Vwcykge1xuICAgICAgICAgICAgICAgIGdyb3VwcyA9IG5ldyBCYWcoKTtcbiAgICAgICAgICAgICAgICBncm91cHNCeUVudGl0eS5zZXQoZW50aXR5LCBncm91cHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ3JvdXBzLmFkZChncm91cCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIHRoZSBlbnRpdHkgZnJvbSB0aGUgZ3JvdXAuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRvIHJlbW92ZSBmcm9tIHRoZSBncm91cFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXAgdG8gcmVtb3ZlIGZyb20gdGhlbSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoZ3JvdXAubGVuZ3RoID4gMCwgXCJHcm91cCBpcyBlbXB0eVwiKTtcbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlHcm91cC5nZXQoZ3JvdXApO1xuICAgICAgICAgICAgaWYoZW50aXRpZXMpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5kZWxldGUoZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgaWYoZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzLmRlbGV0ZShncm91cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIHRoZSBlbnRpdHkgZnJvbSB0aGUgYWxsIGdyb3Vwcy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRnJvbUFsbEdyb3Vwc1xuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IHRvIHJlbW92ZSBmcm9tIHRoZSBncm91cFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tQWxsR3JvdXBzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICB2YXIgZ3JvdXBzID0gZ3JvdXBzQnlFbnRpdHkuZ2V0KGVudGl0eSk7XG4gICAgICAgICAgICBpZighZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGkgPSBncm91cHMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeUdyb3VwLmdldChncm91cHMuZ2V0KGkpKTtcbiAgICAgICAgICAgICAgICBpZihlbnRpdGllcykge1xuICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm91cHMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYWxsIGVudGl0aWVzIHRoYXQgYmVsb25nIHRvIHRoZSBwcm92aWRlZCBncm91cC5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0RW50aXRpZXNcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwIG5hbWUgb2YgdGhlIGdyb3VwXG4gICAgICAgICAqIEByZXR1cm4ge0JhZ30gZW50aXRpZXNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0RW50aXRpZXMgPSBmdW5jdGlvbihncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoZ3JvdXAubGVuZ3RoID4gMCwgXCJHcm91cCBpcyBlbXB0eVwiKTtcbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlHcm91cC5nZXQoZ3JvdXApO1xuICAgICAgICAgICAgaWYoIWVudGl0aWVzKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgZW50aXRpZXNCeUdyb3VwLnB1dChncm91cCwgZW50aXRpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVudGl0aWVzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBhbGwgZW50aXRpZXMgZnJvbSB0aGUgZ3JvdXBcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgZ2V0R3JvdXBzXG4gICAgICAgICAqIEBwYXJhbSB7RW50aXR5fSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0R3JvdXBzID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBzQnlFbnRpdHkuZ2V0KGVudGl0eSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlzIEVudGl0eSBpbiBhbnkgZ3JvdXBcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eVxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNJbkFueUdyb3VwID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydCghIWVudGl0eSwgXCJFbnRpdHkgaXMgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBzQnlFbnRpdHkuaGFzKGVudGl0eSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGVudGl0eSBpcyBpbiBncm91cFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNJbkdyb3VwID0gZnVuY3Rpb24oZW50aXR5LCBncm91cCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgaWYoIWdyb3VwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGdyb3Vwc0J5RW50aXR5LmdldChlbnRpdHkpO1xuICAgICAgICAgICAgdmFyIGkgPSBncm91cHMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYoZ3JvdXAgPT09IGdyb3Vwcy5nZXQoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgZW50aXR5IGZyb20gYWxsIGdyb3VwcyByZWxhdGVkIHRvXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBlbnRpdHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISFlbnRpdHksIFwiRW50aXR5IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tQWxsR3JvdXBzKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgfTsgXG5cbiAgICBHcm91cE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgR3JvdXBNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdyb3VwTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdyb3VwTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBCYWcgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0JhZycpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZShcIi4vLi4vTWFuYWdlclwiKTtcbiAgICBcbiAgICB2YXIgUGxheWVyTWFuYWdlciA9IGZ1bmN0aW9uIFBsYXllck1hbmFnZXIoKSB7XG4gICAgICAgIE1hbmFnZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwbGF5ZXJCeUVudGl0eSA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgICAgICBlbnRpdGllc0J5UGxheWVyID0gbmV3IEhhc2hNYXAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnNldFBsYXllciA9IGZ1bmN0aW9uKGVudGl0eSwgcGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXJCeUVudGl0eS5wdXQoZW50aXR5LCBwbGF5ZXIpO1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgIGlmKGVudGl0aWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgZW50aXRpZXNCeVBsYXllci5wdXQocGxheWVyLCBlbnRpdGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0RW50aXRpZXNPZlBsYXllciA9IGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gZW50aXRpZXNCeVBsYXllci5nZXQocGxheWVyKTtcbiAgICAgICAgICAgIGlmKGVudGl0aWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlbW92ZUZyb21QbGF5ZXIgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgIGlmKHBsYXllciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IGVudGl0aWVzQnlQbGF5ZXIuZ2V0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgaWYoZW50aXRpZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZXRQbGF5ZXIgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXJCeUVudGl0eS5nZXQoZW50aXR5KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgICAgIHRoaXMuZGVsZXRlZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tUGxheWVyKGVudGl0eSk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuICAgIFxuICAgIFBsYXllck1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNYW5hZ2VyLnByb3RvdHlwZSk7XG4gICAgUGxheWVyTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGF5ZXJNYW5hZ2VyO1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGxheWVyTWFuYWdlcjtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvSGFzaE1hcCcpLFxuICAgICAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi8uLi9NYW5hZ2VyJyk7XG4gICAgXG4gICAgdmFyIFRhZ01hbmFnZXIgPSBmdW5jdGlvbiBUYWdNYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgZW50aXRpZXNCeVRhZyA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgICAgICB0YWdzQnlFbnRpdHkgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXIgPSBmdW5jdGlvbih0YWcsIGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXRpZXNCeVRhZy5wdXQodGFnLCBlbnRpdHkpO1xuICAgICAgICAgICAgdGFnc0J5RW50aXR5LnB1dChlbnRpdHksIHRhZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICB0YWdzQnlFbnRpdHkucmVtb3ZlKGVudGl0aWVzQnlUYWcucmVtb3ZlKHRhZykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNSZWdpc3RlcmVkID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXNCeVRhZy5jb250YWluc0tleSh0YWcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0RW50aXR5ID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50aXRpZXNCeVRhZy5nZXQodGFnKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ2V0UmVnaXN0ZXJlZFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWdzQnlFbnRpdHkudmFsdWVzKCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIHZhciByZW1vdmVkVGFnID0gdGFnc0J5RW50aXR5LnJlbW92ZShlbnRpdHkpO1xuICAgICAgICAgICAgaWYocmVtb3ZlZFRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzQnlUYWcucmVtb3ZlKHJlbW92ZWRUYWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge307XG4gICAgfTsgXG5cbiAgICBUYWdNYW5hZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTWFuYWdlci5wcm90b3R5cGUpO1xuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGFnTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRhZ01hbmFnZXI7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuLy4uL3V0aWxzL0hhc2hNYXAnKSxcbiAgICAgICAgQmFnID0gcmVxdWlyZSgnLi8uLi91dGlscy9CYWcnKSxcbiAgICAgICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vTWFuYWdlcicpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIGNsYXNzIHRvZ2V0aGVyIHdpdGggUGxheWVyTWFuYWdlci5cbiAgICAgKiBcbiAgICAgKiBZb3UgbWF5IHNvbWV0aW1lcyB3YW50IHRvIGNyZWF0ZSB0ZWFtcyBpbiB5b3VyIGdhbWUsIHNvIHRoYXRcbiAgICAgKiBzb21lIHBsYXllcnMgYXJlIHRlYW0gbWF0ZXMuXG4gICAgICogXG4gICAgICogQSBwbGF5ZXIgY2FuIG9ubHkgYmVsb25nIHRvIGEgc2luZ2xlIHRlYW0uXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgTWFuYWdlcnNcbiAgICAgKiBAY2xhc3MgVGVhbU1hbmFnZXJcbiAgICAgKiBAbmFtZXNwYWNlIE1hbmFnZXJzXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQGV4dGVuZHMgTWFuYWdlclxuICAgICAqL1xuICAgIHZhciBUZWFtTWFuYWdlciA9IGZ1bmN0aW9uIFRlYW1NYW5hZ2VyKCkge1xuICAgICAgICBNYW5hZ2VyLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHBsYXllcnNCeVRlYW1cbiAgICAgICAgICogQHR5cGUge1V0aWxzLkhhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcGxheWVyc0J5VGVhbSA9IG5ldyBIYXNoTWFwKCksXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHByb3BlcnR5IHRlYW1CeVBsYXllclxuICAgICAgICAgKiBAdHlwZSB7VXRpbHMuSGFzaE1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHRlYW1CeVBsYXllciA9IG5ldyBIYXNoTWFwKCk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0VGVhbVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGxheWVyIE5hbWUgb2YgdGhlIHBsYXllclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFRlYW0gPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZWFtQnlQbGF5ZXIuZ2V0KHBsYXllcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHRlYW0gdG8gYSBwbGF5ZXJcbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2Qgc2V0VGVhbVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGxheWVyIE5hbWUgb2YgdGhlIHBsYXllclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGVhbSBOYW1lIG9mIHRoZSB0ZWFtXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFRlYW0gPSBmdW5jdGlvbihwbGF5ZXIsIHRlYW0pIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbVRlYW0ocGxheWVyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGVhbUJ5UGxheWVyLnB1dChwbGF5ZXIsIHRlYW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGxheWVycyA9IHBsYXllcnNCeVRlYW0uZ2V0KHRlYW0pO1xuICAgICAgICAgICAgaWYocGxheWVycyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBsYXllcnMgPSBuZXcgQmFnKCk7XG4gICAgICAgICAgICAgICAgcGxheWVyc0J5VGVhbS5wdXQodGVhbSwgcGxheWVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGF5ZXJzLmFkZChwbGF5ZXIpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0UGxheWVyc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGVhbSBOYW1lIG9mIHRoZSB0ZWFtXG4gICAgICAgICAqIEByZXR1cm4ge1V0aWxzLkJhZ30gQmFnIG9mIHBsYXllcnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0UGxheWVycyA9IGZ1bmN0aW9uKHRlYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXJzQnlUZWFtLmdldCh0ZWFtKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUZyb21UZWFtXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXIgTmFtZSBvZiB0aGUgcGxheWVyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZUZyb21UZWFtID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgdGVhbSA9IHRlYW1CeVBsYXllci5yZW1vdmUocGxheWVyKTtcbiAgICAgICAgICAgIGlmKHRlYW0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVycyA9IHBsYXllcnNCeVRlYW0uZ2V0KHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmKHBsYXllcnMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVycy5yZW1vdmUocGxheWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTsgXG5cbiAgICBUZWFtTWFuYWdlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE1hbmFnZXIucHJvdG90eXBlKTtcbiAgICBUZWFtTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUZWFtTWFuYWdlcjtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRlYW1NYW5hZ2VyO1xufSkoKTsiLCJBcnJheS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICByZXR1cm4gdGhpc1tpbmRleF07XHJcbn07XHJcblxyXG5BcnJheS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XHJcbiAgdGhpc1tpbmRleF0gPSB2YWx1ZTtcclxufTsiLCIvKipcbiAqIEZvciBhbiByZmM0MTIyIHZlcnNpb24gNCBjb21wbGlhbnQgc29sdXRpb25cbiAqIFxuICogQHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkLWluLWphdmFzY3JpcHRcbiAqIEBhdXRob3IgYnJvb2ZhXG4gKi9cbk1hdGgudXVpZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG59OyIsIi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHplcm8gYml0cyBmb2xsb3dpbmcgdGhlIGxvd2VzdC1vcmRlciAoXCJyaWdodG1vc3RcIilcbiAqIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzcGVjaWZpZWRcbiAqIHtAY29kZSBsb25nfSB2YWx1ZS4gIFJldHVybnMgNjQgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBoYXMgbm9cbiAqIG9uZS1iaXRzIGluIGl0cyB0d28ncyBjb21wbGVtZW50IHJlcHJlc2VudGF0aW9uLCBpbiBvdGhlciB3b3JkcyBpZiBpdCBpc1xuICogZXF1YWwgdG8gemVyby5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TnVtYmVyfSB0aGUgbnVtYmVyIG9mIHplcm8gYml0cyBmb2xsb3dpbmcgdGhlIGxvd2VzdC1vcmRlciAoXCJyaWdodG1vc3RcIilcbiAqICAgICBvbmUtYml0IGluIHRoZSB0d28ncyBjb21wbGVtZW50IGJpbmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGVcbiAqICAgICBzcGVjaWZpZWQge0Bjb2RlIGxvbmd9IHZhbHVlLCBvciA2NCBpZiB0aGUgdmFsdWUgaXMgZXF1YWxcbiAqICAgICB0byB6ZXJvLlxuICogQHNpbmNlIDEuNVxuICogQHNlZSBodHRwOi8vZ3JlcGNvZGUuY29tL2ZpbGVfL3JlcG9zaXRvcnkuZ3JlcGNvZGUuY29tL2phdmEvcm9vdC9qZGsvb3Blbmpkay82LWIxNC9qYXZhL2xhbmcvTG9uZy5qYXZhLz92PXNvdXJjZVxuICovXG5OdW1iZXIucHJvdG90eXBlLm51bWJlck9mVHJhaWxpbmdaZXJvcyA9IGZ1bmN0aW9uKGkpIHtcbiAgICB2YXIgeCwgeTtcbiAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIDY0O1xuICAgIHZhciBuID0gNjM7XG4gICAgeSA9IHBhcnNlSW50KGkpOyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtMzI7IHggPSB5OyB9IGVsc2UgeCA9IHBhcnNlSW50KGk+Pj4zMik7XG4gICAgeSA9IHggPDwxNjsgaWYgKHkgIT09IDApIHsgbiA9IG4gLTE2OyB4ID0geTsgfVxuICAgIHkgPSB4IDw8IDg7IGlmICh5ICE9PSAwKSB7IG4gPSBuIC0gODsgeCA9IHk7IH1cbiAgICB5ID0geCA8PCA0OyBpZiAoeSAhPT0gMCkgeyBuID0gbiAtIDQ7IHggPSB5OyB9XG4gICAgeSA9IHggPDwgMjsgaWYgKHkgIT09IDApIHsgbiA9IG4gLSAyOyB4ID0geTsgfVxuICAgIHJldHVybiBuIC0gKCh4IDw8IDEpID4+PiAzMSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiB6ZXJvIGJpdHMgcHJlY2VkaW5nIHRoZSBoaWdoZXN0LW9yZGVyXG4gKiAoXCJsZWZ0bW9zdFwiKSBvbmUtYml0IGluIHRoZSB0d28ncyBjb21wbGVtZW50IGJpbmFyeSByZXByZXNlbnRhdGlvblxuICogb2YgdGhlIHNwZWNpZmllZCB7QGNvZGUgbG9uZ30gdmFsdWUuICBSZXR1cm5zIDY0IGlmIHRoZVxuICogc3BlY2lmaWVkIHZhbHVlIGhhcyBubyBvbmUtYml0cyBpbiBpdHMgdHdvJ3MgY29tcGxlbWVudCByZXByZXNlbnRhdGlvbixcbiAqIGluIG90aGVyIHdvcmRzIGlmIGl0IGlzIGVxdWFsIHRvIHplcm8uXG4gKlxuICogPHA+Tm90ZSB0aGF0IHRoaXMgbWV0aG9kIGlzIGNsb3NlbHkgcmVsYXRlZCB0byB0aGUgbG9nYXJpdGhtIGJhc2UgMi5cbiAqIEZvciBhbGwgcG9zaXRpdmUge0Bjb2RlIGxvbmd9IHZhbHVlcyB4OlxuICogPHVsPlxuICogPGxpPmZsb29yKGxvZzxzdWI+Mjwvc3ViPih4KSkgPSB7QGNvZGUgNjMgLSBudW1iZXJPZkxlYWRpbmdaZXJvcyh4KX1cbiAqIDxsaT5jZWlsKGxvZzxzdWI+Mjwvc3ViPih4KSkgPSB7QGNvZGUgNjQgLSBudW1iZXJPZkxlYWRpbmdaZXJvcyh4IC0gMSl9XG4gKiA8L3VsPlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBudW1iZXIgb2YgemVybyBiaXRzIHByZWNlZGluZyB0aGUgaGlnaGVzdC1vcmRlclxuICogICAgIChcImxlZnRtb3N0XCIpIG9uZS1iaXQgaW4gdGhlIHR3bydzIGNvbXBsZW1lbnQgYmluYXJ5IHJlcHJlc2VudGF0aW9uXG4gKiAgICAgb2YgdGhlIHNwZWNpZmllZCB7QGNvZGUgbG9uZ30gdmFsdWUsIG9yIDY0IGlmIHRoZSB2YWx1ZVxuICogICAgIGlzIGVxdWFsIHRvIHplcm8uXG4gKiBAc2luY2UgMS41XG4gKiBAc2VlIGh0dHA6Ly9ncmVwY29kZS5jb20vZmlsZV8vcmVwb3NpdG9yeS5ncmVwY29kZS5jb20vamF2YS9yb290L2pkay9vcGVuamRrLzYtYjE0L2phdmEvbGFuZy9Mb25nLmphdmEvP3Y9c291cmNlXG4gKi9cbk51bWJlci5wcm90b3R5cGUubnVtYmVyT2ZMZWFkaW5nWmVyb3MgPSBmdW5jdGlvbihpKSB7XG4gICAgaWYgKGkgPT09IDApXG4gICAgICAgIHJldHVybiA2NDtcbiAgICB2YXIgbiA9IDE7XG4gICAgdmFyIHggPSBwYXJzZUludChpID4+PiAzMik7XG4gICAgaWYgKHggPT09IDApIHsgbiArPSAzMjsgeCA9IHBhcnNlSW50KGkpOyB9XG4gICAgaWYgKHggPj4+IDE2ID09PSAwKSB7IG4gKz0gMTY7IHggPDw9IDE2OyB9XG4gICAgaWYgKHggPj4+IDI0ID09PSAwKSB7IG4gKz0gIDg7IHggPDw9ICA4OyB9XG4gICAgaWYgKHggPj4+IDI4ID09PSAwKSB7IG4gKz0gIDQ7IHggPDw9ICA0OyB9XG4gICAgaWYgKHggPj4+IDMwID09PSAwKSB7IG4gKz0gIDI7IHggPDw9ICAyOyB9XG4gICAgbiAtPSB4ID4+PiAzMTtcbiAgICByZXR1cm4gbjtcbn07IiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsIFwia2xhc3NcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5wcm90b3R5cGUuZ2V0Q2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcbn07IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgRW50aXR5U3lzdGVtID0gcmVxdWlyZSgnLi8uLi9FbnRpdHlTeXN0ZW0nKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBPYmplY3QgdG8gbWFuYWdlIGNvbXBvbmVudHNcbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IGZ1bmN0aW9uIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtKF9hc3BlY3QpIHtcbiAgICAgICAgRW50aXR5U3lzdGVtLmNhbGwodGhpcywgX2FzcGVjdCk7XG4gICAgfTtcbiAgICBcbiAgICBEZWxheWVkRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERlbGF5ZWRFbnRpdHlQcm9jZXNzaW5nU3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gRGVsYXllZEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRvIG1hbmFnZSBjb21wb25lbnRzXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBjbGFzcyBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqL1xuICAgIHZhciBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gZnVuY3Rpb24gRW50aXR5UHJvY2Vzc2luZ1N5c3RlbShfYXNwZWN0KSB7XG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgLy8gbGl0bGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9yaWdpbmFsIGZyYW1ld29yaywganMgZG9lc24ndCBhbGxvdyB0byBvdmVybG9hZCBtZXRob2RzIDo8XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7QmFnfSBlbnRpdGllc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcm9jZXNzRW50aXRpZXMgPSBmdW5jdGlvbihlbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGkgPSBlbnRpdGllcy5zaXplKCk7XG4gICAgICAgICAgICB3aGlsZShpLS0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyUHJvY2VzcyhlbnRpdGllcy5nZXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jaGVja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAgIFxuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5UHJvY2Vzc2luZ1N5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogSWYgeW91IG5lZWQgdG8gcHJvY2VzcyBlbnRpdGllcyBhdCBhIGNlcnRhaW4gaW50ZXJ2YWwgdGhlbiB1c2UgdGhpcy5cbiAgICAgKiBBIHR5cGljYWwgdXNhZ2Ugd291bGQgYmUgdG8gcmVnZW5lcmF0ZSBhbW1vIG9yIGhlYWx0aCBhdCBjZXJ0YWluIGludGVydmFscywgbm8gbmVlZFxuICAgICAqIHRvIGRvIHRoYXQgZXZlcnkgZ2FtZSBsb29wLCBidXQgcGVyaGFwcyBldmVyeSAxMDAgbXMuIG9yIGV2ZXJ5IHNlY29uZC5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqXG4gICAgICogQGF1dGhvciBBcm5pIEFyZW50XG4gICAgICovXG4gICAgdmFyIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbSA9IGZ1bmN0aW9uIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbShfYXNwZWN0LCBpbnRlcnZhbCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBfYXNwZWN0LCBpbnRlcnZhbCk7XG5cbiAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHt9O1xuXG4gICAgICAgIHRoaXMucHJvY2Vzc0VudGl0aWVzID0gZnVuY3Rpb24oZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHZhciBpID0gZW50aXRpZXMuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lclByb2Nlc3MoZW50aXRpZXMuZ2V0KGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVN5c3RlbS5wcm90b3R5cGUpO1xuICAgIEludGVydmFsRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnRlcnZhbEVudGl0eVByb2Nlc3NpbmdTeXN0ZW07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIEVudGl0eVN5c3RlbSA9IHJlcXVpcmUoJy4vLi4vRW50aXR5U3lzdGVtJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogQSBzeXN0ZW0gdGhhdCBwcm9jZXNzZXMgZW50aXRpZXMgYXQgYSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMuXG4gICAgICogQSB0eXBpY2FsIHVzYWdlIHdvdWxkIGJlIGEgY29sbGlzaW9uIHN5c3RlbSBvciBwaHlzaWNzIHN5c3RlbS5cbiAgICAgKiBcbiAgICAgKiBAbW9kdWxlIEFydGVtaUpTXG4gICAgICogQGNsYXNzIEludGVydmFsRW50aXR5U3lzdGVtXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBc3BlY3R9IF9hc3BlY3QgQ3JlYXRlcyBhbiBlbnRpdHkgc3lzdGVtIHRoYXQgdXNlcyB0aGUgc3BlY2lmaWVkIFxuICAgICAqICAgICAgYXNwZWN0IGFzIGEgbWF0Y2hlciBhZ2FpbnN0IGVudGl0aWVzLlxuICAgICAqIEBhdXRob3IgQXJuaSBBcmVudFxuICAgICAqL1xuICAgIHZhciBJbnRlcnZhbEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIEludGVydmFsRW50aXR5U3lzdGVtKF9hc3BlY3QsIF9pbnRlcnZhbCkge1xuXG4gICAgICAgIHZhciBhY2M7XG5cbiAgICAgICAgdmFyIGludGVydmFsID0gX2ludGVydmFsO1xuXG4gICAgICAgIEVudGl0eVN5c3RlbS5jYWxsKHRoaXMsIF9hc3BlY3QpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhY2MgKz0gdGhpcy53b3JsZC5nZXREZWx0YSgpO1xuICAgICAgICAgICAgaWYoYWNjID49IGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgYWNjIC09IGludGVydmFsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgSW50ZXJ2YWxFbnRpdHlTeXN0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbnRpdHlTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBJbnRlcnZhbEVudGl0eVN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnZhbEVudGl0eVN5c3RlbTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVydmFsRW50aXR5U3lzdGVtO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciBBc3BlY3QgPSByZXF1aXJlKCcuLy4uL0FzcGVjdCcpLFxuICAgICAgICBFbnRpdHlTeXN0ZW0gPSByZXF1aXJlKCcuLy4uL0VudGl0eVN5c3RlbScpO1xuICAgIFxuICAgIC8qKlxuICAgICAqIE9iamVjdCB0byBtYW5hZ2UgY29tcG9uZW50c1xuICAgICAqIFxuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAY2xhc3MgVm9pZEVudGl0eVN5c3RlbVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXNwZWN0fSBfYXNwZWN0IENyZWF0ZXMgYW4gZW50aXR5IHN5c3RlbSB0aGF0IHVzZXMgdGhlIHNwZWNpZmllZCBcbiAgICAgKiAgICAgIGFzcGVjdCBhcyBhIG1hdGNoZXIgYWdhaW5zdCBlbnRpdGllcy5cbiAgICAgKi9cbiAgICB2YXIgVm9pZEVudGl0eVN5c3RlbSA9IGZ1bmN0aW9uIFZvaWRFbnRpdHlTeXN0ZW0oX2FzcGVjdCkge1xuICAgICAgICBFbnRpdHlTeXN0ZW0uY2FsbCh0aGlzLCBBc3BlY3QuZ2V0RW1wdHkoKSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnByb2Nlc3NFbnRpdGllcyA9IGZ1bmN0aW9uKGVudGl0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NTeXN0ZW0oKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvY2Vzc1N5c3RlbSA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNoZWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBWb2lkRW50aXR5U3lzdGVtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRW50aXR5U3lzdGVtLnByb3RvdHlwZSk7XG4gICAgVm9pZEVudGl0eVN5c3RlbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWb2lkRW50aXR5U3lzdGVtO1xuICAgIG1vZHVsZS5leHBvcnRzID0gVm9pZEVudGl0eVN5c3RlbTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIENvbGxlY3Rpb24gdHlwZSBhIGJpdCBsaWtlIEFycmF5TGlzdCBidXQgZG9lcyBub3QgcHJlc2VydmUgdGhlIG9yZGVyIG9mIGl0c1xuICAgICAqIGVudGl0aWVzLCBzcGVlZHdpc2UgaXQgaXMgdmVyeSBnb29kLCBlc3BlY2lhbGx5IHN1aXRlZCBmb3IgZ2FtZXMuXG4gICAgICogXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgVXRpbHNcbiAgICAgKiBAY2xhc3MgQmFnXG4gICAgICogQG5hbWVzcGFjZSBVdGlsc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEJhZygpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb250YWlucyBhbGwgb2YgdGhlIGVsZW1lbnRzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcHJvcGVydHkgZGF0YVxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBCYWcuIGRvZXMgdGhpcyBieVxuICAgICAgICAgKiBvdmVyd3JpdGluZyBpdCB3YXMgbGFzdCBlbGVtZW50IHRoZW4gcmVtb3ZpbmcgbGFzdCBlbGVtZW50XG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAgICAgKiBAcGFyYW0gIHsqfSBpbmRleCB0aGUgaW5kZXggb2YgZWxlbWVudCB0byBiZSByZW1vdmVkXG4gICAgICAgICAqIEByZXR1cm4geyp9IGVsZW1lbnQgdGhhdCB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBCYWdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICBpZih0eXBlb2YgaW5kZXggPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBkYXRhLmluZGV4T2YoaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodHlwZW9mIGluZGV4ID09PSAnbnVtYmVyJyAmJiBpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGRhdGEuc3BsaWNlKGluZGV4LCAxKVswXSB8fCBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydChyZXNwb25zZSAhPT0gbnVsbCwgXCJBcmUgeW91IHN1cmUgdGhlcmUgd2Fzbid0IGFuIGVsZW1lbnQgaW4gdGhlIGJhZz9cIik7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFuZCByZXR1cm4gdGhlIGxhc3Qgb2JqZWN0IGluIHRoZSBiYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHJlbW92ZUxhc3RcbiAgICAgICAgICogQHJldHVybiB7KnxudWxsfSB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIGJhZywgbnVsbCBpZiBlbXB0eS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlTGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGJhZyBjb250YWlucyB0aGlzIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29udGFpbnNcbiAgICAgICAgICogQHBhcmFtIHsqfSBvYmpcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGFpbnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmluZGV4T2Yob2JqKSAhPT0gLTE7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBmcm9tIHRoaXMgQmFnIGFsbCBvZiBpdHMgZWxlbWVudHMgdGhhdCBhcmUgY29udGFpbmVkIGluIHRoZVxuICAgICAgICAgKiBzcGVjaWZpZWQgQmFnLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCByZW1vdmVBbGxcbiAgICAgICAgICogQHBhcmFtIHtCYWd9IGJhZyBjb250YWluaW5nIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGlzIEJhZ1xuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgQmFnIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgdGhlIGNhbGwsIGVsc2UgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsID0gZnVuY3Rpb24oYmFnKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBuID0gYmFnLnNpemUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpICE9PSBuOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gYmFnLmdldChpKTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMucmVtb3ZlKG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtb2RpZmllZDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gQmFnLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBnZXRcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIHJldHVyblxuICAgICAgICAgKiBAcmV0dXJuIHsqfG51bGx9IHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gYmFnIG9yIG51bGxcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2luZGV4XSA/IGRhdGFbaW5kZXhdIDogbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIHNpemVcbiAgICAgICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgYmFnXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmxlbmd0aDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhlIGJhZyBjYW4gaG9sZCB3aXRob3V0IGdyb3dpbmcuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGNhcGFjaXR5XG4gICAgICAgICAqIEByZXR1cm4ge051bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyB0aGUgYmFnIGNhbiBob2xkIHdpdGhvdXQgZ3Jvd2luZy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0Q2FwYWNpdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFOyAvLyBzbGlnaHRseSBmaXhlZCBeXlxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGUgaW50ZXJuYWwgc3RvcmFnZSBzdXBwb3J0cyB0aGlzIGluZGV4LlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0luZGV4V2l0aGluQm91bmRzXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0luZGV4V2l0aGluQm91bmRzID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA8IHRoaXMuZ2V0Q2FwYWNpdHkoKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBpc0VtcHR5XG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgaXMgZW1wdHksIGVsc2UgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoID09PSAwO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoZSBlbmQgb2YgdGhpcyBiYWcuIGlmIG5lZWRlZCBhbHNvXG4gICAgICAgICAqIGluY3JlYXNlcyB0aGUgY2FwYWNpdHkgb2YgdGhlIGJhZy5cbiAgICAgICAgICogXG4gICAgICAgICAqIEBtZXRob2QgYWRkXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gb2JqIGVsZW1lbnQgdG8gYmUgYWRkZWQgdG8gdGhpcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgZGF0YS5wdXNoKG9iaik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IGVsZW1lbnQgYXQgc3BlY2lmaWVkIGluZGV4IGluIHRoZSBiYWcuIE5ldyBpbmRleCB3aWxsIGRlc3Ryb3kgc2l6ZVxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBzZXRcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IGluZGV4IHBvc2l0aW9uIG9mIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHsqfSBvYmogdGhlIGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24oaW5kZXgsIG9iaikge1xuICAgICAgICAgICAgZGF0YVtpbmRleF0gPSBvYmo7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogTWV0aG9kIHZlcmlmeSB0aGUgY2FwYWNpdHkgb2YgdGhlIGJhZ1xuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBlbnN1cmVDYXBhY2l0eVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5lbnN1cmVDYXBhY2l0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8ganVzdCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG9yeWdpbmFsIGlkZWVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIGJhZy4gVGhlIGJhZyB3aWxsIGJlIGVtcHR5IGFmdGVyXG4gICAgICAgICAqIHRoaXMgY2FsbCByZXR1cm5zLlxuICAgICAgICAgKiBcbiAgICAgICAgICogQG1ldGhvZCBjbGVhclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhbGwgaXRlbXMgaW50byB0aGlzIGJhZy4gXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAbWV0aG9kIGFkZEFsbFxuICAgICAgICAgKiBAcGFyYW0ge0JhZ30gYmFnIGFkZGVkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZEFsbCA9IGZ1bmN0aW9uKGJhZykge1xuICAgICAgICAgICAgdmFyIGkgPSBiYWcuc2l6ZSgpO1xuICAgICAgICAgICAgd2hpbGUoaS0tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoYmFnLmdldChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gQmFnO1xufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQGF1dGhvciBpbmV4cGxpY2FibGVcbiAgICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmV4cGxpY2FibGUvYml0c2V0XG4gICAgICovXG5cbiAgICAvL2NvbnN0cnVjdG9yXG4gICAgdmFyIEJpdFNldCA9IGZ1bmN0aW9uIEJpdFNldCgpIHtcblxuICAgICAgICAvL193b3JkcyBwcm9wZXJ0eSBpcyBhbiBhcnJheSBvZiAzMmJpdHMgaW50ZWdlcnMsIGphdmFzY3JpcHQgZG9lc24ndCByZWFsbHkgaGF2ZSBpbnRlZ2VycyBzZXBhcmF0ZWQgZnJvbSBOdW1iZXIgdHlwZVxuICAgICAgICAvL2l0J3MgbGVzcyBwZXJmb3JtYW50IGJlY2F1c2Ugb2YgdGhhdCwgbnVtYmVyIChieSBkZWZhdWx0IGZsb2F0KSB3b3VsZCBiZSBpbnRlcm5hbGx5IGNvbnZlcnRlZCB0byAzMmJpdHMgaW50ZWdlciB0aGVuIGFjY2VwdHMgdGhlIGJpdCBvcGVyYXRpb25zXG4gICAgICAgIC8vY2hlY2tlZCBCdWZmZXIgdHlwZSwgYnV0IG5lZWRzIHRvIGhhbmRsZSBleHBhbnNpb24vZG93bnNpemUgYnkgYXBwbGljYXRpb24sIGNvbXByb21pc2VkIHRvIHVzZSBudW1iZXIgYXJyYXkgZm9yIG5vdy5cbiAgICAgICAgdGhpcy5fd29yZHMgPSBbXTtcbiAgICB9O1xuXG4gICAgdmFyIEJJVFNfT0ZfQV9XT1JEID0gMzIsXG4gICAgICAgIFNISUZUU19PRl9BX1dPUkQgPSA1O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgaW5kZXggYXQgdGhlIHdvcmRzIGFycmF5XG4gICAgICovXG4gICAgdmFyIHdoaWNoV29yZCA9IGZ1bmN0aW9uKHBvcyl7XG4gICAgICAgIC8vYXNzdW1lZCBwb3MgaXMgbm9uLW5lZ2F0aXZlLCBndWFyZGVkIGJ5ICNzZXQsICNjbGVhciwgI2dldCBldGMuXG4gICAgICAgIHJldHVybiBwb3MgPj4gU0hJRlRTX09GX0FfV09SRDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhIGJpdCBtYXNrIG9mIDMyIGJpdHMsIDEgYml0IHNldCBhdCBwb3MgJSAzMiwgdGhlIHJlc3QgYmVpbmcgMFxuICAgICAqL1xuICAgIHZhciBtYXNrID0gZnVuY3Rpb24ocG9zKXtcbiAgICAgICAgcmV0dXJuIDEgPDwgKHBvcyAmIDMxKTtcbiAgICB9O1xuXG4gICAgQml0U2V0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmRzW3doaWNoV29yZChwb3MpXSB8PSBtYXNrKHBvcyk7XG4gICAgfTtcblxuICAgIEJpdFNldC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmRzW3doaWNoV29yZChwb3MpXSAmPSB+bWFzayhwb3MpO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICByZXR1cm4gdGhpcy5fd29yZHNbd2hpY2hXb3JkKHBvcyldICYgbWFzayhwb3MpO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLndvcmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93b3Jkcy5sZW5ndGg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGNvdW50IGFsbCBzZXQgYml0c1xuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKlxuICAgICAqIHRoaXMgaXMgbXVjaCBmYXN0ZXIgdGhhbiBCaXRTZXQgbGliIG9mIENvZmZlZVNjcmlwdCwgaXQgZmFzdCBza2lwcyAwIHZhbHVlIHdvcmRzXG4gICAgICovXG4gICAgQml0U2V0LnByb3RvdHlwZS5jYXJkaW5hbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCwgc3VtID0gMCwgYXJyT2ZXb3JkcyA9IHRoaXMuX3dvcmRzLCBtYXhXb3JkcyA9IHRoaXMud29yZHMoKTtcbiAgICAgICAgZm9yKG5leHQgPSAwOyBuZXh0IDwgbWF4V29yZHM7ICsrbmV4dCl7XG4gICAgICAgICAgICB2YXIgbmV4dFdvcmQgPSBhcnJPZldvcmRzW25leHRdIHx8IDA7XG4gICAgICAgICAgICAvL3RoaXMgbG9vcHMgb25seSB0aGUgbnVtYmVyIG9mIHNldCBiaXRzLCBub3QgMzIgY29uc3RhbnQgYWxsIHRoZSB0aW1lIVxuICAgICAgICAgICAgZm9yKHZhciBiaXRzID0gbmV4dFdvcmQ7IGJpdHMgIT09IDA7IGJpdHMgJj0gKGJpdHMgLSAxKSl7XG4gICAgICAgICAgICAgICAgKytzdW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bTtcbiAgICB9O1xuXG4gICAgQml0U2V0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl93b3JkcyA9IFtdO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLm9yID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICAgIGlmICh0aGlzID09PSBzZXQpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV4dCwgY29tbW9ucyA9IE1hdGgubWluKHRoaXMud29yZHMoKSwgc2V0LndvcmRzKCkpO1xuICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgY29tbW9uczsgbmV4dCsrKSB7XG4gICAgICAgICAgICB0aGlzLl93b3Jkc1tuZXh0XSB8PSBzZXQuX3dvcmRzW25leHRdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tb25zIDwgc2V0LndvcmRzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3dvcmRzID0gdGhpcy5fd29yZHMuY29uY2F0KHNldC5fd29yZHMuc2xpY2UoY29tbW9ucywgc2V0LndvcmRzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2V0XG4gICAgICogQHJldHVybiB7Qml0U2V0fSB0aGlzIEJpdFNldCBhZnRlciBhbmQgb3BlcmF0aW9uXG4gICAgICpcbiAgICAgKiB0aGlzIGlzIG11Y2ggbW9yZSBwZXJmb3JtYW50IHRoYW4gQ29mZmVlU2NyaXB0J3MgQml0U2V0I2FuZCBvcGVyYXRpb24gYmVjYXVzZSB3ZSdsbCBjaG9wIHRoZSB6ZXJvIHZhbHVlIHdvcmRzIGF0IHRhaWwuXG4gICAgICovXG4gICAgQml0U2V0LnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IHNldCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV4dCxcbiAgICAgICAgICAgIGNvbW1vbnMgPSBNYXRoLm1pbih0aGlzLndvcmRzKCksIHNldC53b3JkcygpKSxcbiAgICAgICAgICAgIHdvcmRzID0gdGhpcy5fd29yZHM7XG5cbiAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IGNvbW1vbnM7IG5leHQrKykge1xuICAgICAgICAgICAgd29yZHNbbmV4dF0gJj0gc2V0Ll93b3Jkc1tuZXh0XTtcbiAgICAgICAgfVxuICAgICAgICBpZihjb21tb25zID4gc2V0LndvcmRzKCkpe1xuICAgICAgICAgICAgdmFyIGxlbiA9IGNvbW1vbnMgLSBzZXQud29yZHMoKTtcbiAgICAgICAgICAgIHdoaWxlKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgd29yZHMucG9wKCk7Ly91c2luZyBwb3AgaW5zdGVhZCBvZiBhc3NpZ24gemVybyB0byByZWR1Y2UgdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksIGFuZCBmYXN0ZW4gdGhlIHN1YnNlcXVlbnQgI2FuZCBvcGVyYXRpb25zLlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uKHNldCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gc2V0KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHQsIGNvbW1vbnMgPSBNYXRoLm1pbih0aGlzLndvcmRzKCksIHNldC53b3JkcygpKTtcbiAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IGNvbW1vbnM7IG5leHQrKykge1xuICAgICAgICAgICAgdGhpcy5fd29yZHNbbmV4dF0gXj0gc2V0Ll93b3Jkc1tuZXh0XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9ucyA8IHNldC53b3JkcygpKSB7XG4gICAgICAgICAgICB0aGlzLl93b3JkcyA9IHRoaXMuX3dvcmRzLmNvbmNhdChzZXQuX3dvcmRzLnNsaWNlKGNvbW1vbnMsIHNldC53b3JkcygpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHRoaXMgaXMgdGhlIGNyaXRpY2FsIHBpZWNlIG1pc3NpbmcgZnJvbSBDb2ZmZWVTY3JpcHQncyBCaXRTZXQgbGliLCB3ZSB1c3VhbGx5IGp1c3QgbmVlZCB0byBrbm93IHRoZSBuZXh0IHNldCBiaXQgaWYgYW55LlxuICAgICAqIGl0IGZhc3Qgc2tpcHMgMCB2YWx1ZSB3b3JkIGFzICNjYXJkaW5hbGl0eSBkb2VzLCB0aGlzIGlzIGVzcC4gaW1wb3J0YW50IGJlY2F1c2Ugb2Ygb3VyIHVzYWdlLCBhZnRlciBzZXJpZXMgb2YgI2FuZCBvcGVyYXRpb25zXG4gICAgICogaXQncyBoaWdobHkgbGlrZWx5IHRoYXQgbW9zdCBvZiB0aGUgd29yZHMgbGVmdCBhcmUgemVybyB2YWx1ZWQsIGFuZCBieSBza2lwcGluZyBhbGwgb2Ygc3VjaCwgd2UgY291bGQgbG9jYXRlIHRoZSBhY3R1YWwgYml0IHNldCBtdWNoIGZhc3Rlci5cbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIEJpdFNldC5wcm90b3R5cGUubmV4dFNldEJpdCA9IGZ1bmN0aW9uKHBvcyl7XG4gICAgICAgIHZhciBuZXh0ID0gd2hpY2hXb3JkKHBvcyksXG4gICAgICAgICAgICB3b3JkcyA9IHRoaXMuX3dvcmRzO1xuICAgICAgICAvL2JleW9uZCBtYXggd29yZHNcbiAgICAgICAgaWYobmV4dCA+PSB3b3Jkcy5sZW5ndGgpe1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhlIHZlcnkgZmlyc3Qgd29yZFxuICAgICAgICB2YXIgZmlyc3RXb3JkID0gd29yZHNbbmV4dF0sXG4gICAgICAgICAgICBtYXhXb3JkcyA9IHRoaXMud29yZHMoKSxcbiAgICAgICAgICAgIGJpdDtcbiAgICAgICAgaWYoZmlyc3RXb3JkKXtcbiAgICAgICAgICAgIGZvcihiaXQgPSBwb3MgJiAzMTsgYml0IDwgQklUU19PRl9BX1dPUkQ7IGJpdCArPSAxKXtcbiAgICAgICAgICAgICAgICBpZigoZmlyc3RXb3JkICYgbWFzayhiaXQpKSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobmV4dCA8PCBTSElGVFNfT0ZfQV9XT1JEKSArIGJpdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yKG5leHQgPSBuZXh0ICsgMTsgbmV4dCA8IG1heFdvcmRzOyBuZXh0ICs9IDEpe1xuICAgICAgICAgICAgdmFyIG5leHRXb3JkID0gd29yZHNbbmV4dF07XG4gICAgICAgICAgICBpZihuZXh0V29yZCl7XG4gICAgICAgICAgICAgICAgZm9yKGJpdCA9IDA7IGJpdCA8IEJJVFNfT0ZfQV9XT1JEOyBiaXQgKz0gMSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKChuZXh0V29yZCAmIG1hc2soYml0KSkgIT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuZXh0IDw8IFNISUZUU19PRl9BX1dPUkQpICsgYml0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQW4gcmV2ZXJzZWQgbG9va3VwIGNvbXBhcmVkIHdpdGggI25leHRTZXRCaXRcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBCaXRTZXQucHJvdG90eXBlLnByZXZTZXRCaXQgPSBmdW5jdGlvbihwb3Mpe1xuICAgICAgICB2YXIgcHJldiA9IHdoaWNoV29yZChwb3MpLFxuICAgICAgICAgICAgd29yZHMgPSB0aGlzLl93b3JkcztcbiAgICAgICAgLy9iZXlvbmQgbWF4IHdvcmRzXG4gICAgICAgIGlmKHByZXYgPj0gd29yZHMubGVuZ3RoKXtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICAvL3RoZSB2ZXJ5IGxhc3Qgd29yZFxuICAgICAgICB2YXIgbGFzdFdvcmQgPSB3b3Jkc1twcmV2XSxcbiAgICAgICAgICAgIGJpdDtcbiAgICAgICAgaWYobGFzdFdvcmQpe1xuICAgICAgICAgICAgZm9yKGJpdCA9IHBvcyAmIDMxOyBiaXQgPj0wOyBiaXQtLSl7XG4gICAgICAgICAgICAgICAgaWYoKGxhc3RXb3JkICYgbWFzayhiaXQpKSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocHJldiA8PCBTSElGVFNfT0ZfQV9XT1JEKSArIGJpdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yKHByZXYgPSBwcmV2IC0gMTsgcHJldiA+PSAwOyBwcmV2LS0pe1xuICAgICAgICAgICAgdmFyIHByZXZXb3JkID0gd29yZHNbcHJldl07XG4gICAgICAgICAgICBpZihwcmV2V29yZCl7XG4gICAgICAgICAgICAgICAgZm9yKGJpdCA9IEJJVFNfT0ZfQV9XT1JEIC0gMTsgYml0ID49IDA7IGJpdC0tKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoKHByZXZXb3JkICYgbWFzayhiaXQpKSAhPT0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHByZXYgPDwgU0hJRlRTX09GX0FfV09SRCkgKyBiaXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICBCaXRTZXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24ocmFkaXgpe1xuICAgICAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgICAgICByZXR1cm4gJ1snICt0aGlzLl93b3Jkcy50b1N0cmluZygpICsgJ10nO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJpdFNldDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogSGFzaE1hcFxuICAgICAqXG4gICAgICogQG1vZHVsZSBBcnRlbWlKU1xuICAgICAqIEBzdWJtb2R1bGUgVXRpbHNcbiAgICAgKiBAY2xhc3MgSGFzaE1hcFxuICAgICAqIEBuYW1lc3BhY2UgVXRpbHNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODYzODkwMC9qYXZhc2NyaXB0LWNyYzMyLzE4NjM5OTk5IzE4NjM5OTk5XG4gICAgICovXG4gICAgZnVuY3Rpb24gSGFzaE1hcCgpIHtcblxuICAgICAgICB2YXIgZGF0YSA9IFtdLFxuICAgICAgICAgICAgX2xlbmd0aCA9IDA7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibGVuZ3RoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBfbGVuZ3RoOyB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyY1RhYmxlKCl7XG4gICAgICAgICAgICB2YXIgYztcbiAgICAgICAgICAgIHZhciBjcmMgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgbiA9MDsgbiA8IDI1NjsgbisrKXtcbiAgICAgICAgICAgICAgICBjID0gbjtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGsgPTA7IGsgPCA4OyBrKyspe1xuICAgICAgICAgICAgICAgICAgICBjID0gKChjJjEpID8gKDB4RURCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JjW25dID0gYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjcmM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBtZXRob2QgZ2VuZXJhdGUgY3JjMzIgZXhhY3RseSBmcm9tIHN0cmluZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ga2V5XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBoYXNoKGtleSkge1xuICAgICAgICAgICAgdmFyIHN0ciA9IEpTT04uc3RyaW5naWZ5KGtleSk7XG4gICAgICAgICAgICB2YXIgY3JjID0gMCBeICgtMSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB2YWx1ZSBmb3IgYSBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGtleVxuICAgICAgICAgKiBAcmV0dXJucyB7KnxudWxsfSBGb3IgZmFsc2UgcmV0dXJucyBudWxsXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbaGFzaChrZXkpXSB8fCBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdmFsdWUgZm9yIGEgc3BlY2lmaWMga2V5XG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEha2V5LCBcImtleSBpcyBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIGRhdGFbaGFzaChrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgKytfbGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgdGhhdCBrZXkgZXhpc3RcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRhaW5zS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5pbmRleE9mKGhhc2goa2V5KSkgIT09IC0xO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdmFsdWUgZnJvbSBzcGVjaWZpYyBrZXlcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcbiAgICAgICAgICogQHJldHVybnMge0hhc2hNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IGRhdGEuaW5kZXhPZihoYXNoKGtleSkpO1xuICAgICAgICAgICAgaWYoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgLS1fbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBzaXplXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX2xlbmd0aDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFsbCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtIYXNoTWFwfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICAgICAgX2xlbmd0aCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzID0gSGFzaE1hcDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBkZWxheVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgZGVsYXk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgcmVwZWF0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB2YXIgcmVwZWF0O1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGFjY1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB2YXIgYWNjO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGRvbmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBkb25lO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHN0b3BwZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBzdG9wcGVkO1xuXG5cbiAgICAvKipcbiAgICAgKiBUaW1lclxuICAgICAqXG4gICAgICogQGNsYXNzIFRpbWVyXG4gICAgICogQG5hbWVzcGFjZSBVdGlsc1xuICAgICAqIEBtb2R1bGUgQXJ0ZW1pSlNcbiAgICAgKiBAc3VibW9kdWxlIFV0aWxzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IF9kZWxheVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gX3JlcGVhdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBUaW1lciA9IGZ1bmN0aW9uIFRpbWVyKF9kZWxheSwgX3JlcGVhdCkge1xuICAgICAgICBkZWxheSA9IF9kZWxheTtcbiAgICAgICAgcmVwZWF0ID0gX3JlcGVhdCB8fCBmYWxzZTtcbiAgICAgICAgYWNjID0gMDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIHRpbWVyXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBkZWx0YVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICAgICAgaWYoIWRvbmUgJiYgIXN0b3BlZCkge1xuICAgICAgICAgICAgICAgIGFjYyArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjID49IGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGFjYyAtPSBkZWxheTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzZXQgdGltZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjYyA9IDA7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiBpcyBkb25lIG90aGVyd2lzZSBmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaXNEb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIGlzIHJ1bm5pbmcgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhZG9uZSAmJiBhY2MgPCBkZWxheSAmJiAhc3RvcHBlZDtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcCB0aW1lclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIF9kZWxheVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXREZWxheSA9IGZ1bmN0aW9uKF9kZWxheSkge1xuICAgICAgICAgICAgZGVsYXkgPSBfZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGVjdXRlID0gZnVuY3Rpb24oKSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0UGVyY2VudGFnZVJlbWFpbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0b3BwZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEgLSAoZGVsYXkgLSBhY2MpIC8gZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsYXk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbn0pKCk7Il19
