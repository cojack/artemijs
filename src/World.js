var ArtemiJS = ArtemiJS || {};

ArtemiJS.World = function() {
    var entityManager = new ArtemiJS.EntityManager(),
        componentManager = new ArtemiJS.ComponentManager(),
        managers = {},
        managersBag = new ArtemiJS.Bag(),
        systems = {},
        systemsBag = new ArtemiJS.Bag(),
    
        added = new ArtemiJS.Bag(),
        changed = new ArtemiJS.Bag(),
        deleted = new ArtemiJS.Bag(),
        enable = new ArtemiJS.Bag(),
        disable = new ArtemiJS.Bag(),
    
        delta = 0;

    this.setManager(componentManager);
    this.setManager(entityManager);
    
    this.initialize = function() {
        var i = managersBag.size();
        while(i--) {
            managersBag.get(i).initialize();
        }
        i = systemsBag.size();
        while(i--) {
            systemsBag.get(i).initialize();
        }
    };
    
    this.getEntityManager = function() {
        return entityManager;
    };
    
    this.getComponentManager = function() {
        return componentManager;
    };
    
    this.setManager = function(manager) {
        manager.setWorld(this);
        
        managers[manager.getClass()] = manager;
        managersBag.add(manager);

        return manager;
    };
    
    this.getManager = function(managerType) {        
        return managers[managerType] || false;
    };
    
    this.deleteManager = function(manager) {
        delete managers[manager.getClass()];
        managersBag.remove(manager);
    };
    
    this.setDelta = function(d) {
        delta = d;
    };
    
    this.getDelta = function() {
        return delta;
    };
    
    this.addEntity = function(entity) {
        added.add(entity);
    };
    
    this.deleteEntity = function(entity) {
        added.remove(entity);
    };
    
    this.changedEntity = function(entity) {
        changed.add(entity);
    };
    
    this.enableEntity = function(entity) {
        enable.add(entity);
    };
    
    this.disableEntity = function(entity) {
        disable.add(entity);
    };
    
    this.createEntity = function() {
        return entityManager.createEntityInstance();
    };
    
    this.getEntity = function(id) {
        return entityManager.getEntity(id);
    };
    
    this.setSystem = function(system, passive) {
        system.setWorld(this);
        system.setPassive(passive);
        
        systems[system.getClass()] = system;
        systemsBag.add(system);
        
        return system;
    };
    
    this.getSystem = function(systemType) {        
        return systems[systemType] || false;
    };
    
    this.deleteSystem = function(system) {
        delete systems[system.getClass()];
        systemsBag.remove(system);
    };
    
    function notifySystems(performer, entity) {
        var i = systemsBag.size();
        while(i--) {
            performer.perform(systemsBag.get(i), entity);
        }        
    }
    
    function notifyManagers(performer, entity) {
        var i = managersBag.size();
        while(i--) {
            performer.perform(managersBag.get(i), entity);
        }
    }
    
    function check(entities, performer) {
        if(!entities.size()) {
            return;
        }
        var i = entities.size();
        while(i--) {
            var entity = entities.get(i);
            notifyManagers(performer, entity);
            notifySystems(performer, entity);
        }
        
        entities.clear();
    }
    
    this.process = function() {
        
        check(added, {
            perform: function(observer, entity) {
                observer.added(entity);
            }
        });
        
        check(changed, {
            perform: function(observer, entity) {
                observer.changed(entity);
            }
        });
        
        check(disable, {
            perform: function(observer, entity) {
                observer.disabled(entity);
            }
        });
        
        check(enable, {
            perform: function(observer, entity) {
                observer.enabled(entity);
            }
        });
        
        check(deleted, {
            perform: function (observer, entity) {
                observer.deleted(entity);
            }
        });        
        
        
        componentManager.clean();
        
        var i = systemsBag.size();
        while(i--) {
            var system = systemsBag.get(i);
            if(!system.isPassive()) {
                system.process();
            }
        }
    };
    
    this.getMapper = function(type) {
        return ArtemiJS.ComponentMapper.getFor(type, this);
    };
};