(function() {
    'use strict';

    var MathUtils = {
        random: function(min, max) {
            return Math.floor(Math.random()*(max-min+1)+min);
        },

        deg2rad: function(deg) {
            return deg * Math.PI/180;
        },

        angle: function(x1,x2,y1,y2) {
            var deg = Math.atan2((y1 - y2),(x1 - x2)) * 180 / Math.PI;
            return this.deg2rad(deg)- Math.PI/2;
        }
    };

    module.exports = MathUtils;
})();