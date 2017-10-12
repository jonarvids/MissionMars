const retardation = 1.25;
const rotRetardation = 2;
const acceleration = 2.5;
const rotAcceleration = 2;
const maxVelocity = 1;
const maxInertia = 0.4;

let goForward = false,
	goBackwards = false,
	turnLeft = false,
	turnRight = false;

let prevTime = Date.now();
let velocity = 0;
let inertia = 0;

let socket = io.connect('http://172.20.10.14');
console.log('Update');

socket.on('update', function (data) {
	switch (data.direction) {
		case 'Up':
			goForward = data.pressed;
			break;
		case 'Down':
			goBackwards = data.pressed;
			break;
		case 'Left':
			turnLeft = data.pressed;
			break;
		case 'Right':
			turnRight = data.pressed;
			break;
	}
});

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
			//document.onkeydown = keyEventHandler;
			// Apply materials to entity and ground
			el.body.material = slipperyMaterial;
			var plane = document.getElementById("ground");
			plane.body.material = groundMaterial;

			requestAnimationFrame(gameLoop)
		});
	}
});

document.addEventListener('keydown', press)
function press(e) {
	if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */)
		goForward = true;
	if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */)
		turnRight = true;
	if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */)
		goBackwards = true;
	if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */)
		turnLeft = true;
}

document.addEventListener('keyup', release)
function release(e) {
	if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */)
		goForward = false;
	if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */)
		turnRight = false;
	if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */)
		goBackwards = false;
	if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */)
		turnLeft = false;
}

var vehicle;
var directionVector = new CANNON.Vec3();
var accelerationImpulse = new CANNON.Vec3();
var bodyCenter = new CANNON.Vec3();

function gameLoop() {
	const currentTime = Date.now();
	const deltaTime = (currentTime - prevTime) / 1000;
	prevTime = currentTime;

	vehicle = document.getElementById("rover").body;
	bodyCenter = new CANNON.Vec3(vehicle.position.x,
		vehicle.position.y,
		vehicle.position.z);

	/*
	if (goForward != goBackwards) {
		const velocityDelta = acceleration * deltaTime;
		if (goForward)
			velocity += velocityDelta;
		else
			velocity -= velocityDelta;
	} else if (velocity != 0) {
		const sign = Math.sign(velocity);
		velocity -= sign * retardation * deltaTime;
		if (sign != Math.sign(velocity))
			velocity = 0;
	}

	if (turnLeft != turnRight) {
		const inertiaDelta = rotAcceleration * deltaTime;
		if (turnLeft)
			inertia += inertiaDelta;
		else
			inertia -= inertiaDelta;
	} else if (inertia != 0) {
		const sign = Math.sign(inertia);
		inertia -= sign * rotRetardation * deltaTime;
		if (sign != Math.sign(inertia))
			inertia = 0;
	}

	if (Math.abs(velocity) > maxVelocity)
		velocity = Math.sign(velocity) * maxVelocity;
	if (Math.abs(inertia) > maxInertia)
		inertia = Math.sign(inertia) * maxInertia;
	*/

	if (goForward) {
		console.log("forward");
		accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, -50);
		accelerationImpulse = vehicle.quaternion.vmult(accelerationImpulse);
		vehicle.applyImpulse(accelerationImpulse, bodyCenter);
		vehicle.angularVelocity.set(0, 0, 0);
	} else if (goBackwards) {
		accelerationImpulse = new CANNON.Vec3(bodyCenter.x, bodyCenter.y, 50);
		accelerationImpulse = vehicle.quaternion.vmult(accelerationImpulse);
		vehicle.applyImpulse(accelerationImpulse, bodyCenter);
		vehicle.angularVelocity.set(0, 0, 0);
	} else if (turnLeft) {
		directionVector = new CANNON.Vec3(0, 1, 0);
		directionVector = vehicle.quaternion.vmult(directionVector);
		vehicle.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
	} else if (turnRight) {
		directionVector = new CANNON.Vec3(0, -1, 0);
		directionVector = vehicle.quaternion.vmult(directionVector);
		vehicle.angularVelocity.set(directionVector.x, directionVector.y, directionVector.z);
	}

	vehicle.linearDamping = 0.9999;
	vehicle.angularDamping = 0.9999;

	requestAnimationFrame(gameLoop)
}
