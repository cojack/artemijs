(function() {
    'use strict';

    var EntityProcessingSystem = ArtemiJS.Systems.EntityProcessingSystem,
        Aspect = ArtemiJS.Aspect,
        Position = require('./../components/Position'),
        Health = require('./../components/Health');

    var HealthRenderSystem = function HealthRenderSystem() {
        EntityProcessingSystem.call(this, Aspect.getAspectForAll(Position.klass, Health.klass))

        /**
         * @type ComponentMapper
         */
        var pm;

        /**
         * @type ComponentMapper
         */
        var hm;

        var healthText;

        this.initialize = function() {
            healthText = document.createElement('div');
            healthText.style.position = 'absolute';
            //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
            healthText.style.width = 100;
            healthText.style.height = 100;
            healthText.innerHTML = "";
            healthText.style.top = 200 + 'px';
            healthText.style.left = 200 + 'px';
            document.body.appendChild(healthText);
        };

        this.initialProcess = function(entity) {
            var position = pm.get(entity);
            var health = hm.get(entity);

            var percentage = Math.round(health.health/health.maximumHealth*100);
            healthText.innerHTML = percentage+"%";
            healthText.style.top = position.x;
            healthText.style.left = position.y;
        };
    };

    HealthRenderSystem.prototype = Object.create(EntityProcessingSystem.prototype);
    HealthRenderSystem.prototype.constructor = HealthRenderSystem;
    module.exports = HealthRenderSystem;
})();