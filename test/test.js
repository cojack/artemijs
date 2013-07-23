global["window"] = {};

var assert = require("assert"),
    artemi = require("../lib/artemijs.test.js"),
    world = null;

describe('Array', function() {
    describe('#get()', function() {
        it('should have method get', function() {
            assert.ok(typeof Array.prototype.get === 'function');
        });
    });
    describe('#set()', function() {
        it('should have method set', function() {
            assert.ok(typeof Array.prototype.set === 'function');
        });
    });
});

describe('Math', function() {
   describe('#uuid()', function() {
       it('should have method uuid', function() {
           assert.ok(typeof Math.uuid === 'function');
       });
   });
});

describe('Object', function() {
    describe('#getClass()', function() {
        it('should have method getClass', function() {
            assert.ok(typeof Object.prototype.getClass === 'function');
        });
        it('with object named TestObject should return his name', function() {
            function TestObject() {};
            var test = new TestObject();
            assert.equal('TestObject', test.getClass());
        });
    });
});