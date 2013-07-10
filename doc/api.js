YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ArtemiJS",
        "Aspect",
        "Component",
        "ComponentManager",
        "ComponentMapper",
        "ComponentType",
        "Entity",
        "EntityManager",
        "EntityObserver",
        "EntitySystem",
        "IdentifierPool",
        "Manager",
        "Managers.TeamManager",
        "SystemIndexManager",
        "Utils.Bag",
        "Utils.HashMap",
        "World"
    ],
    "modules": [
        "ArtemiJS",
        "Managers",
        "Utils"
    ],
    "allModules": [
        {
            "displayName": "ArtemiJS",
            "name": "ArtemiJS",
            "description": "Entity Framework"
        },
        {
            "displayName": "Managers",
            "name": "Managers",
            "description": "Use this class together with PlayerManager.\n\nYou may sometimes want to create teams in your game, so that\nsome players are team mates.\n\nA player can only belong to a single team."
        },
        {
            "displayName": "Utils",
            "name": "Utils",
            "description": "Collection type a bit like ArrayList but does not preserve the order of its\nentities, speedwise it is very good, especially suited for games."
        }
    ]
} };
});