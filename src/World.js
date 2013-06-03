var World,
   EntityManager = require("./EntityManager.js"),
   ComponentManager = require("./ComponentManager.js"),
   ComponentMapper = require("./ComponentMapper.js");

module.exports = World = function() {
    var entityManager;
    var componentManager;
    var managers = {};
    var managersBag = [];
    var systems = {};
    var systemsBag = [];
    
    var added = [];
    var changed = [];
    var deleted = [];
    var enable = [];
    var disable = [];
    
    var delta = 0;
    
    componentManager = new ComponentManager();
    this.setManager(componentManager);
    
    entityManager = new EntityManager();
    this.setManager(entityManager);
    
    this.initialize = function() {
        for(var i = 0; i < managersBag.length; i++) {
            managersBag[i].initialize();
        }
        
        for(i = 0; i < systemsBag.length; i++) {
            systemsBag[i].initialize();
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
        if(managers[managerType]) {
            return managers[managerType];
        }
        
        return false;
    };
    
    this.deleteManager = function(manager) {
        var index = managersBag.indexOf(manager);
        if(managers[manager.getClass()] && index !== -1) {
            delete managers[manager.getClass()];
            managersBag.splice(index, 1);
        }
    };
    
    this.setDelta = function(d) {
        delta = d;
    };
    
    this.getDelta = function() {
        return delta;
    };
    
    this.addEntity = function(entity) {
        added.push(entity);
    };
    
    this.deleteEntity = function(entity) {
        var index = added.indexOf(entity);
        if(index !== -1) {
            added.slice(index, 1);
        }
    };
    
    this.changedEntity = function(entity) {
        changed.push(entity);
    };
    
    this.enableEntity = function(entity) {
        enable.push(entity);
    };
    
    this.disableEntity = function(entity) {
        disable.push(entity);
    };
    
    this.createEntity = function() {
        entityManager.createEntityInstance();
    };
    
    this.getEntity = function(id) {
        entityManager.getEntity(id);
    };
    
    this.setSystem = function(system, passive) {
        system.setWorld(this);
        system.setPassive(passive);
        
        systems[system.getClass()] = system;
        systemsBag.add(system);
        
        return system;
    };
    
    this.getSystem = function(systemType) {
        if(systems[systemType]) {
            return systems[systemType];
        }
        
        return false;
    };
    
    this.deleteSystem = function(system) {
        if(systems[system.getClass()] && systemsBag.indexOf(system) !== -1) {
            delete systems[system.getClass()];
            systemsBag.splice(systemsBag.indexOf(system), 1);
        }
    };
    
    function notifySystems(performer, entity) {
        for(var i = 0; i < systemsBag.length(); i++) {
            performer.perform(systemsBag[i], entity);
        }        
    }
    
    function notifyManagers(performer, entity) {
        for(var i = 0; i < managersBag.length(); i++) {
            performer.perform(managersBag[i], entity);
        }
    }
    
    function check(entities, performer) {
        if(!entities.length) {
            return;
        }
        
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            notifyManagers(performer, entity);
            notifySystems(performer, entity);
        }
        
        entities = [];
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
        
        for(var i = 0; i < systemsBag.length; i++) {
            var system = systemsBag[i];
            if(!system.isPassive()) {
                system.process();
            }
        }
    };
    
    this.getMapper = function(type) {
        return ComponentMapper.getFor(type, this);
    };
};