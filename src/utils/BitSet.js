// Bits v1.0
//
// Simple and fast bitset implementation in Javascript
//
// Licensed under the MIT License
// Copyright 2011 Iván -DrSlump- Montes <drslump@pollinimini.net>

(function(exports){

    // Detect platform capabilities
    var hasUint32Array = typeof Uint32Array !== 'undefined';

    /**
     * Create a new bit set. If the size is given it will allocate the array up front,
     * which will speed up the writes, limiting the operations to the given size. Otherwise
     * an empty array is created, which will grow when neededcouncountt.
     *
     * Note: The size must be a multiple of 32, othewise it will be rounded up to the next
     * multiple of 32 automatically.
     *
     * Filling the bit set with a value doubles the performance of the test operation
     * on an empty set. Performing the bitwise operations against an _undefined_ value
     * requires a type cast which can be avoided by initializing the set.
     *
     * If the platform supports Typed Arrays (specifically Uint32Array) they will be used for 
     * fixed sets unless the static property Bits.disableTypedArrays is set to true.
     *
     * If you need a non fixed set but prefer to initialize the set with a given size
     * for performance reassons you can set the .fixed property to false once the 
     * object has been created.
     *
     *     var bits = new Bits(1000);
     *     bits.fixed = false;
     *
     *
     * TODO: Import/Export and bitwise operators will need changes to work with Typed Arrays
     *
     * @constructor
     * @param {Number} size
     * @param {Number} fill - either 0 or 1
     */
    function Bits(size, fill){
        this.reset(size, fill);
    }

    /**
     * @property {Boolean} Set to true to disable the use of Typed Arrays
     */
    Bits.disableTypedArrays = false;

    /**
     * Reset the bit set with new settings
     * @see Bits
     * @param {Number} size
     * @param {Number} fill - either 0 or 1
     */
    Bits.prototype.reset = function(size, fill){
        this.fixed = size ? true : false;

        // Calculate how many int32 we need
        size = Math.ceil(size/32);

        // Store a fixed size in bits
        this.size = this.fixed ? size * 32 : null;

        // If the environment support Typed Arrays use them
        if (hasUint32Array && !Bits.disableTypedArrays && this.fixed) {
            this.buckets = new Uint32Array(new ArrayBuffer(size * 4));
            fill = fill === 0 ? null : fill; // Already filled with zeros
        } else if (this.fixed) {
            this.buckets = new Array(size);
        } else {
            this.buckets = [];
            fill = null;
        }

        if (typeof fill !== 'undefined' && fill !== null) {
            this.fill(fill);
        }

        return this;
    };
    
    /**
     * Returns the number of bits set to true in this BitSet.
     * @return {Number}
     **/
    Bits.prototype.cardinality = function() {
        
    };
    
    /**
     * Sets the bits in this BitSet to false.
     * 
     * <code>
     *  bitset.clear(1, 5); // will clear from index 1 to 5
     * // or
     *  bitset.clear(2); // will clear bit at index 2
     * // or 
     *  bitset.clear(); // will clear all of the bits
     * </code>
     * 
     * @see Bits
     * @param {Number} fromIndex
     * @param {Number} toIndex
     * @param {Number} bitIndex
     **/
    Bits.prototype.clear = function() {
        if(arguments.length === 2) {
            var fromIndex = arguments[0],
                toIndex = arguments[1];
            
        } else if(arguments.length === 1) {
            var bitIndex = arguments[0];
            
        } else {
            return this.reset(false, 0);
        }
    };
    
    /**
     * Sets the bit at the specified index to to the complement of its current value.
     *
     * <code>
     *  bitset.flip(1, 5); // will flip from index 1 to 5
     * // or
     *  bitset.flip(2); // will flip bit at index 2
     * </code>
     * 
     * @see Bits
     * @param {Number} fromIndex
     * @param {Number} toIndex
     * @oaram {Number} bitIndex
     **/
    Bits.prototype.flip = function() {
        if(arguments.length === 2) {
            var fromIndex = arguments[0],
                toIndex = arguments[1];
            
        } else if(arguments.length === 1) {
            var bitIndex = arguments[0];
            
        }
    };
    
    /**
     * Returns the index of the first bit that is set to false that occurs on or after the specified starting index.
     * @param {Number} fromIndex
     * @return {Number}
     **/
    Bits.prototype.nextClearBit = function(fromIndex) {
        
    };
    
    /**
     * Returns the index of the first bit that is set to true that occurs on or after the specified starting index.
     * @param {Number} fromIndex
     * @return {Number}
     **/    
    Bits.prototype.nextSetBit = function(fromIndex) {
        
    };

    /**
     * Check if the bit set has a fixed size
     * @return {Boolean}
     */
    Bits.prototype.isFixed = function() {
        return this.fixed;
    };

    /**
     * Obtain the current size of bit set
     * @return {Number}
     */
    Bits.prototype.count = function(){
        return this.fixed ? this.size : this.buckets.length * 32;
    };

    /**
     * Check if a bit is set
     * @param {Number} ofs
     * @return {Boolean}
     */
    Bits.prototype.test = function(ofs){
        if (this.fixed && ofs >= this.size) { return false; }
        return !!(this.buckets[~~(ofs/32)] & (1 << (ofs & 31)));
    };

    /**
     * Set a bit
     * @param {Number} ofs
     */
    Bits.prototype.set = function(ofs){
        if (this.fixed && ofs >= this.size) { return; }
        this.buckets[~~(ofs/32)] |= 1 << (ofs & 31);
    };
    
    Bits.prototype.get = function(ofs){
        return this.test(ofs);
    };

    /**
     * Unset a bit
     * @param {Number} ofs
     */
    Bits.prototype.unset = function(ofs){
        if (this.fixed && ofs >= this.size) { return; }
        this.buckets[~~(ofs/32)] &= ~(1 << (ofs & 31));
    };

    /**
     * Toggle a bit
     * @param {Number} ofs
     */
    Bits.prototype.toggle = function(ofs){
        if (this.fixed && ofs >= this.size) { return; }
        this.buckets[~~(ofs/32)] ^= 1 << (ofs & 31);
    };

    /**
     * Fills the whole set with the given bit value (0 or 1)
     * @param {Number} bit - 0 or 1
     */
    Bits.prototype.fill = function(bit){
        var len = this.buckets.length;
        bit = bit ? -1 : 0;
        while (len--) {
            this.buckets[len] = bit;
        }
    };

    /**
     * Clone the current set
     * @return {Bits}
     */
    Bits.prototype.clone = function(){
        var b = new Bits();
        if (this.buckets instanceof Uint32Array) {
            b.buckets = this.buckets.subarray(0);
        } else {
            b.buckets = this.buckets.slice(0);
        }
        b.size = this.size;
        b.fixed = this.fixed;
        return b;
    };

    /**
     * Export a copy of the current bit buckets
     * @return {Array}
     */
    Bits.prototype.toBuckets = function(){
        var out = [];
        if (this.buckets instanceof Uint32Array) {
            for (var i=0; i<this.buckets.length; i++) {
                out.push(this.buckets[i]);
            }
        } else {
            out = out.concat(this.buckets);
        }
        return out;
    };

    /**
     * Export the set as a binary string with '0' and '1'
     * @return {String}
     */
    Bits.prototype.toString = function(){
        var arr = this.toArray(), len = arr.length;

        while (len--) {
            arr[len] = 0 + arr[len];
        }

        return arr.join('');
    };

    /**
     * Export the set as an hexadecimal string
     * @return {String}
     */
    Bits.prototype.toHex = function(){
        var i, hex, zeros = '00000000', arr = [],
            len = this.buckets.length;

        for (i=0; i<len; i++) {
            hex = this.buckets[i] ? this.buckets[i].toString(16) : '';
            hex = zeros.substr(0, zeros.length-hex.length) + hex;
            arr.push(hex);
        }

        return arr.join('');
    };

    /**
     * Export the set as an array of boolean values
     * @return {Array}
     */
    Bits.prototype.toArray = function() {
        var i,
            len = this.count(),
            arr = new Array(len);

        while (len--) {
            arr[len] = this.test(len);
        }

        return arr;
    };

    /**
     * Compares against another bit set
     * @param {Bits} bits
     * @return {Boolean}
     */
    Bits.prototype.equals = function(bits){
        var pos = this.buckets.length;
        if (pos !== bits.buckets.length) { return false; }
        while (pos--) {
            // Do not use equal type to support undefined buckets
            if (this.buckets[pos] != bits.buckets[pos]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Performs a Not operation on the set
     * @return {Bits} - Fluent interface
     */
    Bits.prototype.not = function(){
        var pos = this.buckets.length;
        while (pos--) {
            this.buckets[pos] = ~this.buckets[pos];
        }
        return this;
    };

    /**
     * Performs an Or operation on the set
     * @param {Bits} bits
     * @return {Bits} - Fluent interface
     */
    Bits.prototype.or = function(bits){
        var len = Math.min(this.buckets.length, bits.buckets.length),
            a = this.buckets, b = bits.buckets;
        while (len--) {
            a[len] |= b[len];
        }
        return this;
    };

    /**
     * Performs an And operation on the set
     * @param {Bits} bits
     * @return {Bits} - Fluent interface
     */
    Bits.prototype.and = function(bits){
        var rem, len = Math.min(this.buckets.length, bits.buckets.length),
            a = this.buckets, b= bits.buckets;

        // Unset all remaining bits if the set is larger
        if (len < this.buckets.length) {
            rem = a.length * 32 - len * 32;
            while (rem--) {
                this.unset(len * 32 + rem);
            }
        }

        while (len--) {
            a[len] &= b[len];
        }

        return this;
    };

    /**
     * Performs a Xor operation on the set
     * @param {Bits} bits
     * @return {Bits} - Fluent interface
     */
    Bits.prototype.xor = function(bits){
        var len = Math.min(this.buckets.length, bits.buckets.length),
            a = this.buckets, b = bits.buckets;
        while (len--) {
            a[len] ^= b[len];
        }
        return this;
    };


    // Static methods

    /**
     * Create a set from previously exported buckets
     * @static
     * @param {Array} buckets
     * @return {Bits}
     */
    Bits.fromBuckets = function(buckets){
        var bits = new Bits();
        bits.buckets = [].concat(buckets);
        return bits;
    };

    /**
     * Create a set from a string of '0' and '1' characters
     * @static
     * @param {String} str
     * @return {Bits}
     */
    Bits.fromString = function(str){
        var len = str.length,
            bits = new Bits(len);

        while (len--) {
            if (str.charAt(len) === '1') {
                bits.set(len);
            }
        }

        return bits;
    };

    /**
     * Create a set from a string of hex characters
     * @static
     * @param {String} hex
     * @return {Bits}
     */
    Bits.fromHex = function(hex){
        var i, len = hex.length,
            buckets = [];

        for (i=0; i<len; i+=8) {
            buckets.push( parseInt(hex.substr(i,8), 16) );
        }

        return Bits.fromBuckets(buckets);
    };

    /**
     * Create a set from an array of boolean values
     * @static
     * @param {Array} arr
     * @return {Bits}
     */
    Bits.fromArray = function(arr){
        var len = arr.length,
            bits = new Bits(len);

        while (len--) {
            if (arr[len]) {
                bits.set(len);
            }
        }

        return bits;
    };

    /**
     * Perform a Not operation on the given set
     * @static
     * @param {Bits} str
     * @return {Bits}
     */
    Bits.not = function(a){
        return a.clone().not();
    };

    /**
     * Perform an Or operation on the given sets
     * @static
     * @param {Bits} a
     * @param {Bits} b
     * @return {Bits}
     */
    Bits.or = function(a, b){
        return a.clone().or(b);
    };

    /**
     * Perform an And operation on the given sets
     * @static
     * @param {Bits} a
     * @param {Bits} b
     * @return {Bits}
     */
    Bits.and = function(a, b){
        return a.clone().and(b);
    };

    /**
     * Perform a Xor operation on the given sets
     * @static
     * @param {Bits} a
     * @param {Bits} b
     * @return {Bits}
     */
    Bits.xor = function(a, b){
        return a.clone().xor(b);
    };

    /**
     * Checks if two sets are equal
     * @static
     * @param {Bits} a
     * @param {Bits} b
     * @return {Boolean}
     */
    Bits.equals = function(a, b){
        return a.equals(b);
    };


    // Export the class into the global namespace or for CommonJs
    exports.BitSet = Bits;

})(typeof ArtemiJS !== "undefined" ? ArtemiJS : this);