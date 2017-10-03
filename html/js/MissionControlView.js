let w, h;
let goForward, goBackwards, turnLeft, turnRight;
let pressed;

let socket;

function setup() {
	w = windowWidth;
	h = windowHeight;

	createCanvas(w, h).position(0,0);
	colorMode(HSB, 360, 100, 100, 100);

	socket = io.connect('http://mission-mars.local');
}

function mouseMoved() {
	const mx_norm = float(mouseX) / w;
	const my_norm = float(mouseY) / h;

	goForward = goBackwards = turnLeft = turnRight = false;

	if (mx_norm > my_norm) {
		if (1 - mx_norm > my_norm) {
			goForward = true;
		} else {
			turnRight = true;
		}
	} else {
		if (mx_norm > 1 - my_norm) {
			goBackwards = true;
		} else {
			turnLeft = true;
		}
	}
}

function mousePressed() {
	pressed = true;

	if (goForward) {
		socket.emit('control', { direction: 'GoForward', pressed: true });
	} else if (goBackwards) {
		socket.emit('control', { direction: 'GoBackwards', pressed: true });
	} else if (turnLeft) {
		socket.emit('control', { direction: 'TurnLeft', pressed: true });
	} else if (turnRight) {
		socket.emit('control', { direction: 'TurnRight', pressed: true });
	}
}

function mouseReleased() {
	pressed = false;

	if (goForward) {
		socket.emit('control', { direction: 'GoForward', pressed: false });
	} else if (goBackwards) {
		socket.emit('control', { direction: 'GoBackwards', pressed: false });
	} else if (turnLeft) {
		socket.emit('control', { direction: 'TurnLeft', pressed: false });
	} else if (turnRight) {
		socket.emit('control', { direction: 'TurnRight', pressed: false });
	}
}

function draw() {
	background(10);
	noStroke();
	textSize(32);
	textAlign(CENTER);

	// forward button
	if (goForward && pressed)
		fill(120, 70, 80);
	else if (goForward) 
		fill(120, 70, 100);
	else
		fill(120, 70, 90);
	triangle(0, 0, w, 0, w/2, h/2);

	// back button
	if (goBackwards && pressed)
		fill(240, 70, 80);
	else if (goBackwards) 
		fill(240, 70, 100);
	else
		fill(240, 70, 90);
	triangle(w, h, 0, h, w/2, h/2);
	
	// left button
	if (turnLeft && pressed)
		fill(0, 70, 50);
	else if (turnLeft)
		fill(0, 70, 100);
	else
		fill(0, 70, 80);
	triangle(0, h, 0, 0, w/2, h/2);
	brightness = 80;
	
	// right button
	if (turnRight && pressed)
		fill(180, 70, 80);
	else if (turnRight) 
		fill(180, 70, 100);
	else
		fill(180, 70, 90);
	triangle(w, 0, w, h, w/2, h/2);

	// text
	fill(0, 0, 0);
	text('TurnLeft', w/4, h/2);
	text('GoForward', w/2, h/4);
	text('TurnRight', w*3/4, h/2);
	text('GoBackwards', w/2, h*3/4);
}
