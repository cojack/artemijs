(function(window) {
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
         * @property {Float} version
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
    
    ArtemiJS.Managers = {};
    ArtemiJS.Systems = {};
    ArtemiJS.Utils = {};
    
    window.ArtemiJS = ArtemiJS;
})(window);