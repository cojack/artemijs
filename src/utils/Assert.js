(function(ArtemiJS) {
    'use strict';
    
    if(typeof console.assert !== 'function') {
        console.prototype.assert = function(cond, text) {
            if(!cond) {
                throw new Error(text || "Assert fail");
            }
        };
    }
    var assert = function(cond, text) {
        if(ArtemiJS.env & 3) {
            console.assert(cond, text);
        }
    };
    ArtemiJS.assert = assert;
})(window.ArtemiJS || {});