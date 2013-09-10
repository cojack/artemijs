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
                index = this.indexOf(index);
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
            var modified = false;
            for (var i = bag.size() - 1; i !== 0; --i) {
                var obj = bag.get(i),
                    index = data.indexOf(obj);
                    
                if(index !== -1) {
                    this.remove(obj);
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