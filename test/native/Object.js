/*global it,describe*/

var assert = require("assert");

require('./../../src/native/Object');

describe('Object', function() {
    describe('#getClass()', function() {
        it('should have method getClass', function() {
            assert.ok(typeof Object.prototype.getClass === 'function');
        });
        it('with object named TestObject should return his name', function() {
            function TestObject() {}
            var test = new TestObject();
            assert.equal('TestObject', test.getClass());
        });
    });
});