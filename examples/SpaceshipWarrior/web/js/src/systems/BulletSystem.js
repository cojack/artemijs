(function(ArtemiJS) {
    
    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Position = require('./../components/Position'),
        Velocity = require('./../components/Velocity'),
        Player = require('./../components/Player');
    
    function BulletSystem() {
        this.innerProcess = function() {
            console.count('BulletSystem');
        }
    }
    
    BulletSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    BulletSystem.prototype.constructor = BulletSystem;
    module.exports = BulletSystem;
}(window.ArtemiJS));