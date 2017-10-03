let goForward = false,
		goBackwards = false,
		turnLeft = false,
		turnRight = false;

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
	let rover = document.getElementById('rover').object3D;

	if (goForward)
		rover.translateZ(0.05);
	if(goBackwards)
		rover.translateZ(-0.05);
	if(turnLeft)
		rover.rotateY(0.05);
	if(turnRight)
		rover.rotateY(-0.05);

	requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
