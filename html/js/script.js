let goForward = false,
	goBackwards = false,
	turnLeft = false,
	turnRight = false;

let socket = io.connect('http://192.168.0.10');

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

AFRAME.registerComponent("rover-controls", {

	init: function () {
		let world = document.querySelector("a-scene").systems.physics.driver.world;

		// Create materials
		var groundMaterial = new CANNON.Material("groundMaterial");
		var roverMaterial = new CANNON.Material("roverMaterial");

		var slipperyContactMaterial = new CANNON.ContactMaterial(groundMaterial, roverMaterial, {
			friction: 0.0,
			restitution: 0.3,
			contactEquationStiffness: 1e8,
			contactEquationRelaxation: 3
		});

		// The ContactMaterials must be added to the world
		world.addContactMaterial(slipperyContactMaterial);

		this.el.addEventListener("body-loaded", function (body) {
			// Apply materials to entity and ground
			this.body.material = roverMaterial;

			let ground = document.getElementById("ground");
			ground.body.material = groundMaterial;

			this.body.addEventListener("collide", function (e) {
				/*
				console.log(e.body.el);
				if (e.body.el.id === "sand") {
					console.log("SAND COLLISION");
				} else if (e.body.el.id === "rocks") {
					console.log("ROCKS COLLISION")
				} else if (e.body.el.id === "ground") {
					console.log("GROUND");
				}
				*/
			});

			let sand = document.querySelectorAll("#sand");
			for (i = 0; i < sand.length; i++) {
				sand[i].body.collisionResponse = false;
			}

			let rocks = document.querySelectorAll("#rocks");
			for (i = 0; i < rocks.length; i++) {
				rocks[i].body.collisionResponse = false;
			}

			requestAnimationFrame(gameLoop)
		});
	},
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

const localForward = new CANNON.Vec3(0, 0, -1);
const localUp = new CANNON.Vec3(0, 1, 0);
const linearSpeed = 0.1;
const angularSpeed = 0.1;

let roverHealth = 1000;
let batteryDecreaseFactor = 0.15 * 1000, damageIncreaseFactor = 1.0;
let roverBattery = 100, roverDamage = 0;
let velocityDecreaseFactor = 0, angularDecreaseFactor = 0;
let velocity, angularVelocity;

let lastUpdate = Date.now();

function gameLoop() {

	let now = Date.now();
	var dt = now - lastUpdate;
	lastUpdate = now;

	let vehicle = document.getElementById("rover").body;

	const worldForward = vehicle.quaternion.vmult(localForward.mult(linearSpeed));
	const worldUp = vehicle.quaternion.vmult(localUp.mult(angularSpeed));

	if (roverBattery > 0) {
		if (goForward) {

			vehicle.velocity.x += worldForward.x;
			vehicle.velocity.y += worldForward.y;
			vehicle.velocity.z += worldForward.z;
		} else if (goBackwards) {

			vehicle.velocity.x -= worldForward.x;
			vehicle.velocity.y -= worldForward.y;
			vehicle.velocity.z -= worldForward.z;
		} else if (turnLeft) {

			vehicle.angularVelocity.x += worldUp.x;
			vehicle.angularVelocity.y += worldUp.y;
			vehicle.angularVelocity.z += worldUp.z;
		} else if (turnRight) {

			vehicle.angularVelocity.x -= worldUp.x;
			vehicle.angularVelocity.y -= worldUp.y;
			vehicle.angularVelocity.z -= worldUp.z;
		}
	}

	vehicle.linearDamping = 0.9;
	vehicle.angularDamping = 0.9999;

	// Get all current contacs between entities
	let contacts = document.querySelector("a-scene").systems.physics.driver.world.contacts;
	// Reset battery decrease factor
	batteryDecreaseFactor = 0.15 * 1000;

	// Check if the rover is in contact with different materials
	for (i = 0; i < contacts.length; i++) {
		let contact = contacts[i].bi.el.id;
		if (contact === "sand") {
			batteryDecreaseFactor = 0.65 * 1000;
		}
		if (contact === "rocks") {
			// DO STUFF
		}
	}

	// Get the absolute length value of Vec3 velocity and angular velocity
	// Make sure they can not go below 0 or their respective max values 
	velocity = Math.min(Math.max(Math.abs(vehicle.velocity.length()), 0), 3);
	angularVelocity = Math.min(Math.max(Math.abs(vehicle.angularVelocity.length()), 0), 1);

	// Convert to integers and floor the values so the values can only be between 0 and 1
	velocity = Math.floor((velocity) / 2.65 * 100) / 100;
	angularVelocity = Math.floor((angularVelocity) / 0.7 * 100) / 100;

	// Set the decrease factors
	velocityDecreaseFactor = velocity * batteryDecreaseFactor / dt;
	angularDecreaseFactor = angularVelocity * batteryDecreaseFactor / dt;

	// Apply decrease factors to battery level
	roverBattery = roverBattery - (velocityDecreaseFactor / (dt * 1000));
	roverBattery = roverBattery - (angularDecreaseFactor / (dt * 1000));

	// Decrease battery level depending on time
	roverBattery = roverBattery - (dt / 10000);

	// Makes sure battery level can't go below 0
	roverBattery = Math.max(roverBattery, 0)

	requestAnimationFrame(gameLoop)
}

window.setInterval(function () {
}, 500);
