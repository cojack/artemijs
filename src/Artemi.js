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
    
    ArtemiJS.Managers = {
        GroupManager: require('./managers/GroupManager'),
        PlayerManager: require('./managers/PlayerManager'),
        TagManager: require('./managers/TagManager'),
        TeamManager: require('./managers/TeamManager')
    };
    
    ArtemiJS.Systems = {};
    
    ArtemiJS.Utils = {
        Bag: require('./utils/Bag'),
        BitSet: require('./utils/BitSet'),
        HashMap: require('./utils/HashMap')
    };
    
    ArtemiJS.Aspect = require('./Aspect');
    ArtemiJS.Component = require('./Component');
    ArtemiJS.ComponentManager = require('./ComponentManager');
    ArtemiJS.ComponentMapper = require('./ComponentMapper');
    ArtemiJS.ComponentType = require('./ComponentType');
    ArtemiJS.Entity = require('./Entity');
    ArtemiJS.EntityManager = require('./EntityManager');
    ArtemiJS.EntityObserver = require('./EntityObserver');
    ArtemiJS.EntitySystem = require('./EntityObserver');
    ArtemiJS.Manager = require('./Manager');
    ArtemiJS.World = require('./World');
    
    module.exports = ArtemiJS;
})();