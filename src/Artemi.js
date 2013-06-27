(function(window) {
    'use strict';
    
    // this file have to be included first in yuicompressor
    var ArtemiJS = {
        version: 0.1,
        source: 'https://github.com/cojack/artemijs',
        license: 'GPLv2',
        env: 1 // 1 - dev, 2 - test, 4 - prod
    };
    
    ArtemiJS.Managers = {};
    ArtemiJS.Systems = {};
    ArtemiJS.Utils = {};
    
    window.ArtemiJS = ArtemiJS;
})(window);