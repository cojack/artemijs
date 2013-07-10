(function(ArtemiJS) {
    'use strict';
    
    /**
     * 
     * @static
     * @class ComponentType
     */
    var ComponentType = (function() {
        
        /**
         * @private
         * @property type
         * @type {ArtemiJS.Component}
         */
        var type,
        
        /**
         * @private
         * @static
         * @property INDEX
         * @type {Integer}
         */
        INDEX = 0,
        
        /**
         * @private
         * @property index
         * @type {Integer}
         */
        index,
        
        /**
         * 
         *
         */
        componentTypes = new ArtemiJS.Utils.HashMap();
           
        /**
         * 
         *
         */
        function Constructor(_type) {
            this.index = INDEX++;
            this.type = _type;
        };

        return {
            
            index: 0,
            type: null,
            
            getIndex: function() {
                return this.index;
            },
            
            /**
             * 
             *
             */
            getFor: function(component) {
                var _type = componentTypes.get(component);
                if(_type === null) {
                    _type = Constructor.call(this, _type);
                    componentTypes.put(component, _type)
                }
                return _type;
            },
            
            /**
             * 
             */
            getIndexFor: function(component) {
                return this.getTypeFor(component).getIndex();
            },
            
            toString: function() {
                return "ComponentType["+type.getSimpleName()+"] ("+index+")";
            }
        };
    })();
    
    ArtemiJS.ComponentType = ComponentType;
})(window.ArtemiJS || {});