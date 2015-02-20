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