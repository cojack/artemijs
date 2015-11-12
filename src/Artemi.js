'use strict';

require('./native/Object');
require('./native/Array');
require('./native/Math');
require('./native/Number');

/**
 * Entity Framework
 *
 * @module ArtemiJS
 * @namespace
 * @class ArtemiJS
 * @main ArtemiJS
 */
var ArtemiJS = {

    /**
     * @property {Number} version
     */
    version: 0.1,

    /**
     * @property {String} source
     */
    source: 'https://github.com/cojack/artemijs',

    /**
     * @property {String} license
     */
    license: 'AGPL-3.0',

    /**
     * @property {Number} env
     */
    env: 1 // 1 - dev, 2 - test, 4 - prod
};

/**
 * @inner
 * @module Managers
 * @namespace
 */
ArtemiJS.Managers = {
    /** @inner GroupManager */
    GroupManager: require('./managers/GroupManager'),
    /** @inner PlayerManager */
    PlayerManager: require('./managers/PlayerManager'),
    /** @inner TagManager */
    TagManager: require('./managers/TagManager'),
    /** @inner TeamManager */
    TeamManager: require('./managers/TeamManager')
};

/**
 * @module Systems
 * @namespace
 */
ArtemiJS.Systems = {
    DelayedEntityProcessingSystem: require('./systems/DelayedEntityProcessingSystem'),
    EntityProcessingSystem: require('./systems/EntityProcessingSystem'),
    IntervalEntityProcessingSystem: require('./systems/IntervalEntityProcessingSystem'),
    IntervalEntitySystem: require('./systems/IntervalEntitySystem'),
    VoidEntitySystem: require('./systems/VoidEntitySystem')
};

/**
 * @module Utils
 * @namespace
 */
ArtemiJS.Utils = {
    Bag: require('./utils/Bag'),
    BitSet: require('./utils/BitSet'),
    HashMap: require('./utils/HashMap'),
    Timer: require('./utils/Timer')
};

ArtemiJS.Aspect = require('./Aspect');
ArtemiJS.Component = require('./Component');
ArtemiJS.ComponentManager = require('./ComponentManager');
ArtemiJS.ComponentMapper = require('./ComponentMapper');
ArtemiJS.ComponentType = require('./ComponentType');
ArtemiJS.Entity = require('./Entity');
ArtemiJS.EntityManager = require('./EntityManager');
ArtemiJS.EntityObserver = require('./EntityObserver');
ArtemiJS.EntitySystem = require('./EntitySystem');
ArtemiJS.Manager = require('./Manager');
ArtemiJS.World = require('./World');

module.exports = ArtemiJS;