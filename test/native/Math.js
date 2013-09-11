/*global it,describe*/

var assert = require("assert");

require('./../../src/native/Math');

describe('Math', function() {
   describe('#uuid()', function() {
       it('should have method uuid', function() {
           assert.ok(typeof Math.uuid === 'function');
       });
   });
});