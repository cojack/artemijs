(function() {
    'use strict';
    
    var EntitySystem = require('./../EntitySystem');
    
    /**
     * Object to manage components
     * 
     * @module ArtemiJS
     * @class VoidEntitySystem
     * @constructor
     * @param {Aspect} _aspect Creates an entity system that uses the specified 
     *      aspect as a matcher against entities.
     */
    var VoidEntitySystem = function VoidEntitySystem(_aspect, _interval) {
        EntitySystem.call(this, _aspect);
    };
    
    VoidEntitySystem.prototype = Object.create(EntitySystem.prototype);
    module.exports = VoidEntitySystem;
})();