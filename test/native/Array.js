/*global it,describe*/

var assert = require("assert");

require('./../../src/native/Array');

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