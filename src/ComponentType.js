'use strict';

var INDEX = 0,
    componentTypes = new WeakMap();

/**
 *
 * @static
 * @class ComponentType
 * @memberof ArtemiJS
 */
var ComponentType = function ComponentType(_type) {

    /**
     * @private
     * @property type
     * @type {Component}
     */
    var type = _type,

    /**
     * @private
     * @property index
     * @type {Number}
     */
    index = INDEX++;

    this.getIndex = function() {
        return index;
    };

    this.toString = function() {
        return "ComponentType["+type.getSimpleName()+"] ("+index+")";
    };
};

/**
 *
 * @param {Object} component
 */
ComponentType.getTypeFor = function(component) {
    var _type = componentTypes.get(component);
    if(!_type) {
        _type =  new ComponentType(_type);
        componentTypes.put(component, _type);
    }
    return _type;
};

/**
 *
 */
ComponentType.getIndexFor = function(component) {
    return this.getTypeFor(component).getIndex();
};


module.exports = ComponentType;