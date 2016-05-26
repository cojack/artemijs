'use strict';

/**
 * BitSet is a class allowing user to create structure like java.util.BitSet
 *
 * @author inexplicable
 * @see https://github.com/inexplicable/bitset
 * @class BitSet
 * @constructor
 * @memberof Utils
 */
function BitSet() {


    /**
     * _words property is an array of 32bits integers, javascript doesn't really have integers separated from Number type
     * it's less performant because of that, number (by default float) would be internally converted to 32bits integer then accepts the bit operations
     * checked Buffer type, but needs to handle expansion/downsize by application, compromised to use number array for now.
     *
     * @type {Array}
     * @private
     */
    this._words = [];

    /**
     * @private
     * @member {number}
     */
    var BITS_OF_A_WORD = 32,

    /**
     * @private
     * @member {number}
     */
    SHIFTS_OF_A_WORD = 5;

    /**
     *
     * @private
     * @param pos
     * @return {Number} the index at the words array
     */
    function whichWord(pos) {
        //assumed pos is non-negative, guarded by #set, #clear, #get etc.
        return pos >> SHIFTS_OF_A_WORD;
    }

    /**
     * @private
     * @param pos
     * @return {Number} a bit mask of 32 bits, 1 bit set at pos % 32, the rest being 0
     */
    function mask(pos) {
        return 1 << (pos & 31);
    }

    /**
     *
     * @param {number} pos
     * @returns {Number}
     */
    this.set = function (pos) {
        return this._words[whichWord(pos)] |= mask(pos);
    };

    /**
     * This method sets the bit specified by the index to false.
     *
     * @param pos
     * @returns {number}
     */
    this.clear = function (pos) {
        if (!pos) {
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
    this.get = function (pos) {
        return this._words[whichWord(pos)] & mask(pos);
    };

    /**
     * This method returns the "logical size" of this BitSet: the index of the highest set bit in the BitSet plus one.
     *
     * @returns {Number}
     */
    this.words = function () {
        return this._words.length;
    };

    /**
     * This method returns true if this BitSet contains no bits that are set to true.
     *
     * @returns {boolean}
     */
    this.isEmpty = function () {
        return !this._words.length;
    };

    /**
     * This method returns the number of bits set to true in this BitSet.
     * Is much faster than BitSet lib of CoffeeScript, it fast skips 0 value words.
     *
     * @return {Number}
     */
    this.cardinality = function () {
        var next, sum = 0, arrOfWords = this._words, maxWords = this.words();
        for (next = 0; next < maxWords; next++) {
            var nextWord = arrOfWords[next] || 0;
            //this loops only the number of set bits, not 32 constant all the time!
            for (var bits = nextWord; bits !== 0; bits &= (bits - 1)) {
                sum++;
            }
        }
        return sum;
    };

    /**
     * This method returns boolean indicating whether this BitSet intersects the specified BitSet.
     *
     * @param {Utils.BitSet} bitSet
     * @returns {boolean}
     */
    this.intersects = function (bitSet) {
        for (var i = Math.min(this._words.length, bitSet._words.length) - 1; i >= 0; --i) {
            if ((this._words[i] & bitSet._words[i]) !== 0) {
                return true;
            }
        }
        return false;
    };

    this.reset = function () {
        this._words = [];
    };

    this.or = function (set) {
        if (this === set) {
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
     * @return {Utils.BitSet} this BitSet after and operation
     *
     * this is much more performant than CoffeeScript's BitSet#and operation because we'll chop the zero value words at tail.
     */
    this.and = function (set) {
        if (this === set) {
            return this;
        }

        var next,
            commons = Math.min(this.words(), set.words()),
            words = this._words;

        for (next = 0; next < commons; next++) {
            words[next] &= set._words[next];
        }
        if (commons > set.words()) {
            var len = commons - set.words();
            while (len--) {
                words.pop();//using pop instead of assign zero to reduce the length of the array, and fasten the subsequent #and operations.
            }
        }
        return this;
    };

    /**
     *
     * @param set
     * @returns {Utils.BitSet}
     */
    this.xor = function (set) {
        if (this === set) {
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
    this.nextSetBit = function (pos) {

        console.assert(pos >= 0, "position must be non-negative");

        var next = whichWord(pos),
            words = this._words;
        //beyond max words
        if (next >= words.length) {
            return -1;
        }
        //the very first word
        var firstWord = words[next],
            maxWords = this.words(),
            bit;
        if (firstWord) {
            for (bit = pos & 31; bit < BITS_OF_A_WORD; bit += 1) {
                if ((firstWord & mask(bit))) {
                    return (next << SHIFTS_OF_A_WORD) + bit;
                }
            }
        }
        for (next = next + 1; next < maxWords; next += 1) {
            var nextWord = words[next];
            if (nextWord) {
                for (bit = 0; bit < BITS_OF_A_WORD; bit += 1) {
                    if ((nextWord & mask(bit)) !== 0) {
                        return (next << SHIFTS_OF_A_WORD) + bit;
                    }
                }
                console.assert(-1, "it should have found some bit in this word: " + nextWord);
            }
<<<<<<< Updated upstream
        }
        return -1;
    };

    /**
     * An reversed lookup compared with #nextSetBit
     * @param pos
     * @returns {number}
     */
    this.prevSetBit = function (pos) {

        console.assert(pos >= 0, "position must be non-negative");

        var prev = whichWord(pos),
            words = this._words;
        //beyond max words
        if (prev >= words.length) {
            return -1;
        }
        //the very last word
        var lastWord = words[prev],
            bit;
        if (lastWord) {
            for (bit = pos & 31; bit >= 0; bit--) {
                if ((lastWord & mask(bit))) {
                    return (prev << SHIFTS_OF_A_WORD) + bit;
                }
            }
        }
        for (prev = prev - 1; prev >= 0; prev--) {
            var prevWord = words[prev];
            if (prevWord) {
                for (bit = BITS_OF_A_WORD - 1; bit >= 0; bit--) {
                    if ((prevWord & mask(bit)) !== 0) {
                        return (prev << SHIFTS_OF_A_WORD) + bit;
                    }
                }
                console.assert(-1, "it should have found some bit in this word: " + prevWord);
            }
        }
        return -1;
    };

    this.toString = function (radix) {
        return '[' + this._words.toString() + ']';
=======
        };
        
        Object.freeze(this);
>>>>>>> Stashed changes
    };
}

module.exports = BitSet;
