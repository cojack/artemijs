(function() {
    'use strict';
    
    var HashMap = require('./utils/HashMap'),
        INDEX = 0,
        componentTypes = new HashMap();
    
    /**
     * 
     * @static
     * @class ComponentType
     */
    var ComponentType = function ComponentType(_type) {
        
        /**
         * @private
         * @property type
         * @type {ArtemiJS.Component}
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
        }

        this.toString = function() {
            return "ComponentType["+type.getSimpleName()+"] ("+index+")";
        }
    };

    /**
     *
     *
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
})();