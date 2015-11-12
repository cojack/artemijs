(function() {
    'use strict';

    var VoidEntitySystem = ArtemiJS.Systems.VoidEntitySystem;

    var HudRenderSystem = function HudRenderSystem(camer) {
        VoidEntitySystem.call(this);

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
        };dw

        this.processSystem = function() {
            healthText.innerHTML = "Active entities: " + this.world.getEntityManager().getActiveEntityCount();
            healthText.style.top = -(SpaceshipWarrior.FRAME_WIDTH / 2) + 20;
            healthText.style.left =  SpaceshipWarrior.FRAME_HEIGHT / 2 - 40;
        }
    };

    HudRenderSystem.prototype = Object.create(VoidEntitySystem.prototype);
    HudRenderSystem.prototype.constructor = HudRenderSystem;
    module.exports = HudRenderSystem;
})();