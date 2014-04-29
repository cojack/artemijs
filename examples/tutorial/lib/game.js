;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    /* global requestAnimationFrame, ArtemiJS*/
    
    'use strict';
    
    var MovementSystem = require("./systems/MovementSystem");
    
    var Tutorial = function Tutorial() {
        var world = new ArtemiJS.World();
        
        world.setManager(new ArtemiJS.Managers.GroupManager());
        
        world.setSystem(new MovementSystem());

        world.initialize();
        
        var entity = world.createEntity();
        
        entity.addToWorld();


        /**
         * @param Float delta
         */
        this.render = function(delta) {
            world.setDelta(delta);
            world.process();
        };
    };
    
    var game = new Tutorial();
    requestAnimationFrame(game.render);
})();
},{"./systems/MovementSystem":2}],2:[function(require,module,exports){
(function() {
    /*global ArtemiJS*/
    
    'use strict';
        var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
            Aspect = ArtemiJS.Aspect;
        
    var MovementSystem = function MovementSystem() {
        EntityProcessingSystem.call(this, Aspect.getEmpty());
        
        var pm, vm;
        
        this.process = function(entity) {
            console.log('what im doing here?');
            
            /*var position = pm.get(entity),
                velocity = vm.get(entity);
           
            position.x += velocity.vectorX*this.world.delta;
            position.y += velocity.vectorY*this.world.delta;*/
        };
    };
    
    
    MovementSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    module.exports = MovementSystem;
})();
},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9leGFtcGxlcy90dXRvcmlhbC9zcmMvVHV0b3JpYWwuanMiLCIvdmFyL2xpYi9zdGlja3NoaWZ0LzUzNWQ4YTNiNTAwNDQ2NGU0NDAwMDIxMi9hcHAtcm9vdC9kYXRhLzUxNzEzNS9leGFtcGxlcy90dXRvcmlhbC9zcmMvc3lzdGVtcy9Nb3ZlbWVudFN5c3RlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG4gICAgLyogZ2xvYmFsIHJlcXVlc3RBbmltYXRpb25GcmFtZSwgQXJ0ZW1pSlMqL1xuICAgIFxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgTW92ZW1lbnRTeXN0ZW0gPSByZXF1aXJlKFwiLi9zeXN0ZW1zL01vdmVtZW50U3lzdGVtXCIpO1xuICAgIFxuICAgIHZhciBUdXRvcmlhbCA9IGZ1bmN0aW9uIFR1dG9yaWFsKCkge1xuICAgICAgICB2YXIgd29ybGQgPSBuZXcgQXJ0ZW1pSlMuV29ybGQoKTtcbiAgICAgICAgXG4gICAgICAgIHdvcmxkLnNldE1hbmFnZXIobmV3IEFydGVtaUpTLk1hbmFnZXJzLkdyb3VwTWFuYWdlcigpKTtcbiAgICAgICAgXG4gICAgICAgIHdvcmxkLnNldFN5c3RlbShuZXcgTW92ZW1lbnRTeXN0ZW0oKSk7XG5cbiAgICAgICAgd29ybGQuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGVudGl0eSA9IHdvcmxkLmNyZWF0ZUVudGl0eSgpO1xuICAgICAgICBcbiAgICAgICAgZW50aXR5LmFkZFRvV29ybGQoKTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gRmxvYXQgZGVsdGFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICAgICAgICAgIHdvcmxkLnNldERlbHRhKGRlbHRhKTtcbiAgICAgICAgICAgIHdvcmxkLnByb2Nlc3MoKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIHZhciBnYW1lID0gbmV3IFR1dG9yaWFsKCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWUucmVuZGVyKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIC8qZ2xvYmFsIEFydGVtaUpTKi9cbiAgICBcbiAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBFbnRpdHlQcm9jZXNzaW5nU3lzdGVtID0gQXJ0ZW1pSlMuU3lzdGVtcy5FbnRpdHlQcm9jZXNzaW5nU3lzdGVtLFxuICAgICAgICAgICAgQXNwZWN0ID0gQXJ0ZW1pSlMuQXNwZWN0O1xuICAgICAgICBcbiAgICB2YXIgTW92ZW1lbnRTeXN0ZW0gPSBmdW5jdGlvbiBNb3ZlbWVudFN5c3RlbSgpIHtcbiAgICAgICAgRW50aXR5UHJvY2Vzc2luZ1N5c3RlbS5jYWxsKHRoaXMsIEFzcGVjdC5nZXRFbXB0eSgpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwbSwgdm07XG4gICAgICAgIFxuICAgICAgICB0aGlzLnByb2Nlc3MgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3aGF0IGltIGRvaW5nIGhlcmU/Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qdmFyIHBvc2l0aW9uID0gcG0uZ2V0KGVudGl0eSksXG4gICAgICAgICAgICAgICAgdmVsb2NpdHkgPSB2bS5nZXQoZW50aXR5KTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBwb3NpdGlvbi54ICs9IHZlbG9jaXR5LnZlY3RvclgqdGhpcy53b3JsZC5kZWx0YTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgKz0gdmVsb2NpdHkudmVjdG9yWSp0aGlzLndvcmxkLmRlbHRhOyovXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICBNb3ZlbWVudFN5c3RlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVudGl0eVByb2Nlc3NpbmdTeXN0ZW0ucHJvdG90eXBlKTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1vdmVtZW50U3lzdGVtO1xufSkoKTsiXX0=
;