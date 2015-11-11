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
            return (_wordIndex < _wordsInUse) && ((_words[_wordIndex] & (1 << bitIndex)) !== 0);
        };

        this.clear = function() {
            _words = [];
        };

        this.isEmpty = function() {
            return _wordsInUse === 0;
        };

        /**
         *
         * @param {BitSet} bitSet
         * @returns {boolean}
         */
        this.intersects = function(bitSet) {
            for (var i = Math.min(_wordsInUse, bitSet.wordsInUse) - 1; i >= 0; i--)
                if ((_words[i] & bitSet.words[i]) !== 0)
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
                if (word !== 0)
                    return (u * BITS_PER_WORD) + Number.numberOfTrailingZeros(word);
                if (++u === _wordsInUse)
                    return -1;
                word = _words[u];
            }
        };
    };

    module.exports = BitSet;
})();