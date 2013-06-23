(function(ArtemiJS) {
    'use strict';

    var Bag = function(capacity) {
        var data = [];
            
        this.remove = function(index) {
            var response = true;
            if(typeof index === 'object') {
                index = this.indexOf(index);
            } else if(index !== -1) {
                response = data[index];
            }
            if(index !== -1) {
                data.splice(index, 1);
            } else {
                response = false;
            }
            return response;
        };
        
        this.removeLast = function() {
            if(data.length > 0) {
                var obj = data[data.length-1];
                data.splice(data.length-1, 1);
                return obj;
            }
            return null;
        };
        
        this.contains = function(obj) {
            return data.indexOf(obj) !== -1;
        };
        
        this.removeAll = function(bag) {
            var modified = false;
            for (var i = bag.size() - 1; i !== 0; --i) {
                var obj = bag.get(i),
                    index = data.indexOf(obj);
                    
                if(index !== -1) {
                    this.remove(obj);
                    modified = true;
                }
            }
            return modified;
        };
        
        this.get = function(index) {
            return data[index];
        };
        
        this.size = function() {
            return data.length;
        };
        
        this.capacity = function() {
            return Number.MAX_VALUE; // slightly fixed ^^
        };
        
        this.isIndexWithinBounds = function(index) {
            return index < this.getCapacity();
        };
        
        this.isEmpty = function() {
            return data.length === 0;
        };
        
        this.add = function(obj) {
            data.push(obj);
        };
        
        this.set = function(index, obj) {
            data[index] = obj;
        };
        
        this.ensureCapacity = function(index) {
            // just for compatibility with oryginal idee
        };
        
        this.clear = function() {
            data = [];
        };
        
        this.addAll = function(bag) {
            var i = bag.size();
            while(i--) {
                this.add(bag.get(i));
            }
        };
    };
    
    ArtemiJS.Bag = Bag;
})(window.ArtemiJS || {});