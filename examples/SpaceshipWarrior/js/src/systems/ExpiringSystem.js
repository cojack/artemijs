(function() {
    'use strict';

    var Aspect = ArtemiJS.Aspect,
        DelayedEntityProcessingSystem = ArtemiJS.Systems.DelayedEntityProcessingSystem,
        Expires = require('./../components/Expires');

    var ExpiringSystem = function ExpiringSystem() {
        DelayedEntityProcessingSystem.call(this, Aspect.getAspectForAll(Expires.klass));

        var em;

        this.processDelta = function(entity, accumulatedDelta) {
            var expires = em.get(entity);
            expires.delay -= accumulatedDelta;
        };

        this.processExpired = function(entity) {
            entity.deleteFromWorld();
        };

        this.getRemainingDelay = function(entity) {
            var expires = em.get(entity);
            return expires.delay;
        }
    };

    ExpiringSystem.prototype = Object.create(DelayedEntityProcessingSystem.prototype);
    ExpiringSystem.prototype.constructor = ExpiringSystem;
    module.exports = ExpiringSystem;

})();