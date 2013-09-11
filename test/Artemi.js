/*global it,describe*/

var assert = require('assert'),
    ArtemiJS = require('./../src/Artemi');
    
describe('ArtemiJS', function() {
    describe('Managers', function() {
        it('should be an Object', function() {
            assert.equal('object', typeof ArtemiJS.Managers);
        });
        describe('GroupManager', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Managers.GroupManager);
           });
        });
        describe('PlayerManager', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Managers.PlayerManager);
           });
        });
        describe('TagManager', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Managers.TagManager);
           });
        });
        describe('TeamManager', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Managers.TeamManager);
           });
        });
    });
    describe('Utils', function() {
        it('should be an Object', function() {
            assert.equal('object', typeof ArtemiJS.Utils);
        });
        describe('Bag', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Utils.Bag);
           });
        });
        describe('BitSet', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Utils.BitSet);
           });
        });
        describe('HashMap', function() {
           it('should be a function', function() {
               assert.equal('function', typeof ArtemiJS.Utils.HashMap);
           });
        });
    });
    describe('Aspect', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.Aspect);
        });
    });
    describe('Component', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.Component);
        });
    });
    describe('ComponentManager', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.ComponentManager);
        });
    });
    describe('ComponentMapper', function() {
        it('should be a object', function() {
            assert.equal('object', typeof ArtemiJS.ComponentMapper);
        });
    });
    describe('ComponentType', function() {
        it('should be a object', function() {
            assert.equal('object', typeof ArtemiJS.ComponentType);
        });
    });
    describe('Entity', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.Entity);
        });
    });
    describe('EntityManager', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.EntityManager);
        });
    });
    describe('EntityObserver', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.EntityObserver);
        });
    });
    describe('Manager', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.Manager);
        });
    });
    describe('World', function() {
        it('should be a function', function() {
            assert.equal('function', typeof ArtemiJS.World);
        });
    });
});