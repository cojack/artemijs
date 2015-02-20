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