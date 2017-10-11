AFRAME.registerComponent("make-vehicle", {

    init: function () {
        if (this.el.hasLoaded) {
            console.log("Vehicle entity is loaded!");
            this.initVehicle();
        } else {
            console.log("Vehicle entity is not yet loaded...");
            this.el.addEventListener("loaded", this.initVehicle.bind(this));
        }
    },

    initVehicle: function () {

        var world = document.querySelector("a-scene").systems.physics.driver.world;
        var el = this.el;

        // Creating materials
        var groundMaterial = new CANNON.Material("groundMaterial");
        // Adjust constraint equation parameters for ground/ground contact
        var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
            friction: 0.4,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
            frictionEquationRegularizationTime: 3,
        });
        // Add contact material to the world
        world.addContactMaterial(ground_ground_cm);

        // Create a slippery material (friction coefficient = 0.0)
        var slipperyMaterial = new CANNON.Material("slipperyMaterial");
        // The ContactMaterial defines what happens when two materials meet.
        // In this case we want friction coefficient = 0.0 when the slippery material touches ground.
        var slippery_ground_cm = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
            friction: 0,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        });
        // We must add the contact materials to the world
        world.addContactMaterial(slippery_ground_cm);

        el.addEventListener("body-loaded", function () {
            document.onkeydown = handler;
            // Apply materials to vehicle and ground
            el.body.material = slipperyMaterial;
            var plane = document.getElementById("ground");
            plane.body.material = groundMaterial;
        });
    }
});

function handler(e) {

    var vehicle = document.getElementById("rover").body;
    var directionVector = new CANNON.Vec3();
    var accelerationImpulse = new CANNON.Vec3();
    var bodyCenter = new CANNON.Vec3(vehicle.position.x,
        vehicle.position.y,
        vehicle.position.z);

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