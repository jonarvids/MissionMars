AFRAME.registerComponent("make-vehicle", {

    init: function () {
        // The below code makes sure the entity has been initialized before making changes to it
        if (this.el.hasLoaded) {
            // The entity is loaded so initialize vehicle
            this.initVehicle();
        } else {
            // The entity is not yet loaded, so initialize vehicle when it is
            this.el.addEventListener("loaded", this.initVehicle.bind(this));
        }
    },

    initVehicle: function () {

        var world = document.querySelector("a-scene").systems.physics.driver.world;
        var el = this.el;

        // Creating materials
        var groundMaterial = new CANNON.Material("groundMaterial");
        var slipperyMaterial = new CANNON.Material("slipperyMaterial");

        // ContactMaterial defines what happens when two materials meet
        var groundContactMaterial = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
            // Set constraints for ground/ground contact
            friction: 0.4,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
            frictionEquationRegularizationTime: 3,
        });

        var slipperyContactMaterial = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
            // Create a slippery material (friction coefficient = 0.0)
            friction: 0.0,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        });
        // The ContactMaterials must be added to the world
        world.addContactMaterial(groundContactMaterial);
        world.addContactMaterial(slipperyContactMaterial);

        // Make sure the body of the entity has been initialized before making changes (otherwise body is undefined)
        el.addEventListener("body-loaded", function () {
            document.onkeydown = keyEventHandler;
            // Apply materials to entity and ground
            el.body.material = slipperyMaterial;
            var plane = document.getElementById("ground");
            plane.body.material = groundMaterial;
        });
    }
});

// Add movement controls to document

function keyEventHandler(e) {

    var vehicle = document.getElementById("rover").body;
    var directionVector = new CANNON.Vec3();
    var accelerationImpulse = new CANNON.Vec3();
    var bodyCenter = new CANNON.Vec3(vehicle.position.x,
        vehicle.position.y,
        vehicle.position.z);
    var up = (e.type == "keyup");

    if (!up && e.type !== "keydown") {
        return;
    }

    switch (e.keyCode) {

        case 38: // forward
            accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, -100);
            accelerationImpulse = vehicle.quaternion.vmult(accelerationImpulse);
            vehicle.applyImpulse(accelerationImpulse, bodyCenter);
            vehicle.angularVelocity.set(0, 0, 0);
            break;

        case 40: // backward
            accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, 100);
            accelerationImpulse = vehicle.quaternion.vmult(accelerationImpulse);
            vehicle.applyImpulse(accelerationImpulse, bodyCenter);
            vehicle.angularVelocity.set(0, 0, 0);
            break;

        case 39: // right
            directionVector = new CANNON.Vec3(0, -1, 0);
            directionVector = vehicle.quaternion.vmult(directionVector);
            vehicle.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
            break;

        case 37: // left
            directionVector = new CANNON.Vec3(0, 1, 0);
            directionVector = vehicle.quaternion.vmult(directionVector);
            vehicle.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
            break;
    }
    vehicle.linearDamping = 0.9999;
    vehicle.angularDamping = 0.9999;
}