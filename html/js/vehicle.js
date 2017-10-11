var rover;

AFRAME.registerComponent("create-vehicle", {

    init: function () {
        if (this.el.hasLoaded) {
            console.log("LOADED");
            this.initVehicle();
        } else {
            console.log("EVENT");
            this.el.addEventListener("loaded", this.initVehicle.bind(this));
        }
    },

    initVehicle: function () {

        var world = document.querySelector("a-scene").systems.physics.driver.world;

        // Materials
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

        var entity = document.createElement('a-box');
        entity.idName = "rover"
        entity.setAttribute("dynamic-body", "shape: box; mass: 150");
        entity.setAttribute("position", "0, 4, 0");

        entity.addEventListener("loaded", function () {
            document.onkeydown = handler;
            entity.fixedRotation = true;
            entity.body.material = slipperyMaterial;
            rover = entity;
            var plane = document.querySelector("a-plane");
            plane.body.material = groundMaterial;
        });
        this.el.appendChild(entity);
    }
});

function handler(e) {

    switch (e.keyCode) {

        case 38: // forward
            var bodyCenter = new CANNON.Vec3(rover.body.position.x,
                rover.body.position.y,
                rover.body.position.z);
            var accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, -100);
            var accelerationImpulse = rover.body.quaternion.vmult(accelerationImpulse);
            rover.body.applyImpulse(accelerationImpulse, bodyCenter);
            rover.body.angularVelocity.set(0, 0, 0);
            break;

        case 40: // backward
            var bodyCenter = new CANNON.Vec3(rover.body.position.x,
                rover.body.position.y,
                rover.body.position.z);
            var accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, 100);
            var accelerationImpulse = rover.body.quaternion.vmult(accelerationImpulse);
            rover.body.applyImpulse(accelerationImpulse, bodyCenter);
            rover.body.angularVelocity.set(0, 0, 0);
            break;

        case 39: // right
            console.log(rover.body.angularVelocity);
            var directionVector = new CANNON.Vec3(0, -1, 0);
            var directionVector = rover.body.quaternion.vmult(directionVector);
            rover.body.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
            break;

        case 37: // left
            var directionVector = new CANNON.Vec3(0, 1, 0);
            var directionVector = rover.body.quaternion.vmult(directionVector);
            rover.body.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
            break;
    }
    rover.body.linearDamping = 0.9999;
    rover.body.angularDamping = 0.9999;
}