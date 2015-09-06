/*global it,describe*/

var assert = require('assert'),
    Bag = require('./../../src/utils/Bag');

var bag = new Bag();

function testFunc(name) {
    this.name = name;    
}

var testObj = new testFunc('testObj'),
    testObj1 = new testFunc('testObj1'),
    testObj2 = new testFunc('testObj2'),
    testObj3 = new testFunc('testObj3');
    
    testObj3.test = "TestValue";
    
describe('Bag', function() {
    describe('#getClass()', function() {
        it('should return string Bag', function() {
            assert.equal('Bag', bag.getClass());
        });
    });
    describe('#isEmpty()', function() {
        it('should be empty', function() {
            assert.equal(true, bag.isEmpty());
        });
    });
    describe('#add()', function() {
        it('should add all test objects and have size == 3', function() {
            bag.add(testObj);
            assert.equal(1, bag.size());
            bag.add(testObj1);
            bag.add(testObj2);
            assert.equal(3, bag.size());
        });
    });
    describe('#contains()', function() {
        it('should contains testObj2', function() {
            assert.equal(true, bag.contains(testObj2));
        });
        it('should not have testObj3', function() {
            assert.equal(false, bag.contains(testObj3));
        });
    });
    describe('#set()', function() {
        it('should set testObj3 at position 2', function() {
            bag.set(2, testObj3);
            assert.equal(testObj3, bag.get(2));
        });
    });
    describe('#get()', function() {
        it('should have testObj3 at position 2', function() {
            assert.equal(testObj3, bag.get(2));
        });
    });
    describe('#size()', function() {
        it('should have size == 3', function() {
            assert.equal(3, bag.size());
        });
        it('should have size == 4', function() {
            bag.add(testObj2);
            assert.equal(4, bag.size());
        });
    });
    describe('#removeLast()', function() {
        it('should return testObj2', function() {
            assert.equal(testObj2, bag.removeLast());
        });
    });
    describe('#removeAll()', function() {
        it('should remove all items from bag there which are in bag2', function() {
            var bag2 = new Bag();
            bag2.add(testObj3);
            assert.equal(true, bag.removeAll(bag2));
        });
        it('should not have testObj3 after remove it', function() {
            assert.equal(false, bag.contains(testObj3));
        });
    });
    describe('#remove()', function() {
        it('should remove testObj', function() {
            assert.equal(testObj, bag.remove(testObj));
        });
        it('should not have testObj after remove it', function() {
            assert.equal(false, bag.contains(testObj));
        });
    });
    describe('#addAll', function() {
        it('should add all items from bag3 to bag', function() {
            var bag3 = new Bag();
            bag3.add(testObj);
            bag3.add(testObj3);
            bag.addAll(bag3);
            assert.equal(true, bag.contains(testObj));
            assert.equal(true, bag.contains(testObj3));
        });
    });
    describe('#clear()', function() {
        it('should remove all items', function() {
            bag.clear();
            assert.equal(0, bag.size());
        });
    });
});