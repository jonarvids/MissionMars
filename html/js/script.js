const retardation			= 1.25;
const rotRetardation	= 2;
const acceleration		= 2.5;
const rotAcceleration	= 2;
const maxVelocity			= 1;
const maxInertia			= 0.4;

let goForward = false,
		goBackwards = false,
		turnLeft = false,
		turnRight = false;

let prevTime = Date.now();
let velocity = 0;
let inertia = 0;

let socket = io.connect('http://mission-mars.local');

socket.on('update', function (data) {
	goForward = goBackwards = turnLeft = turnRight = false;

		switch (data.direction) {
		case 'GoForward':
			goForward = data.pressed;
			break;
			case 'GoBackwards':
				goBackwards = data.pressed;
			break;
		case 'TurnLeft':
			turnLeft = data.pressed;
				break;
			case 'TurnRight':
			turnRight = data.pressed;
			break;
	}
	});

AFRAME.registerComponent("box", {

	init: function () {
			let el = this.el;

		let scaleState = false;
		el.addEventListener("click", function () {
			if (!scaleState) {
					el.setAttribute("scale", { x: 1, y: 1, z: 1 });
				} else {
				el.setAttribute("scale", { x: 0.5, y: 0.5, z: 0.5 });
			}
			scaleState = !scaleState;
			});
		}

});

	/*
			Not currently used...
*/
AFRAME.registerComponent("follow", {

		schema: {
			target: { type: 'selector' }
	},

	tick: function (time, timeDelta) {
			let directionVec3 = new THREE.Vector3();
			let data = this.data;

		// Get the target's position
		let targetPosition = data.target.object3D.position;

			// Set this element's position to the target's position
		this.el.setAttribute('position', {
			x: targetPosition.x,
			y: targetPosition.y + 0.75,
				z: targetPosition.z - 0.25
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

function gameLoop() {
	const currentTime = Date.now();
	const deltaTime = (currentTime - prevTime) / 1000;
	prevTime = currentTime;

	let rover = document.getElementById('rover').object3D;

	if (goForward != goBackwards) {
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

	rover.translateZ(velocity * deltaTime);
	rover.rotateY(inertia * deltaTime);

	requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
