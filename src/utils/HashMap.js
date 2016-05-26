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

        Object.defineProperty(this, "length", {
            get: function() { return data.length; }
        });

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
            }
            return this;
        };

        /**
         * Get size
         *
         * @returns {number}
         */
        this.count = function() {
            return data.length;
        };

        /**
         * Remove all data
         *
         * @returns {HashMap}
         */
        this.clear = function() {
            data.length = 0;
            data = [];
            return this;
        };
	}

	module.exports = HashMap;
})();