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

function gameLoop() {
	let vehicle = document.getElementById("rover").body;

	const worldForward = vehicle.quaternion.vmult(localForward.mult(linearSpeed));
	const worldUp = vehicle.quaternion.vmult(localUp.mult(angularSpeed));
	
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

	vehicle.linearDamping = 0.9;
	vehicle.angularDamping = 0.9999;

	requestAnimationFrame(gameLoop)
}
