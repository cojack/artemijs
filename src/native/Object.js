Object.defineProperty(Object.prototype, "klass", {
    get: function () {
        'use strict';
        return this.name;
    }
});

Object.prototype.getClass = function() {
    'use strict';
    return this.constructor.name;
};