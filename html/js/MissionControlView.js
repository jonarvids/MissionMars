let w, h;
let left, forward, right, back;
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

	if (mx_norm > my_norm) {
		if (1 - mx_norm > my_norm) {
			forward = true;
			left = right = back = false;
		} else {
			right = true;
			forward = back = left = false;
		}
	} else {
		if (mx_norm > 1 - my_norm) {
			back = true;
			forward = right = left = false;
		} else {
			left = true;
			forward = right = back = false;
		}
	}
}

function mousePressed() {
	pressed = true;

	if (left) {
		socket.emit('control', { direction: 'Left', pressed: true });
	} else if (forward) {
		socket.emit('control', { direction: 'Forward', pressed: true });
	} else if (right) {
		socket.emit('control', { direction: 'Right', pressed: true });
	} else if (back) {
		socket.emit('control', { direction: 'Back', pressed: true });
	}
}

function mouseReleased() {
	pressed = false;

	if (left) {
		socket.emit('control', { direction: 'Left', pressed: false });
	} else if (forward) {
		socket.emit('control', { direction: 'Forward', pressed: false });
	} else if (right) {
		socket.emit('control', { direction: 'Right', pressed: false });
	} else if (back) {
		socket.emit('control', { direction: 'Back', pressed: false });
	}
}

function draw() {
  background(10);
	noStroke();
	textSize(32);
	textAlign(CENTER);

	// left button
	if (left && pressed)
		fill(0, 70, 50);
	else if (left)
		fill(0, 70, 100);
	else
		fill(0, 70, 80);
	triangle(0, h, 0, 0, w/2, h/2);
	brightness = 80;

	// forward button
	if (forward && pressed)
		fill(120, 70, 80);
	else if (forward) 
		fill(120, 70, 100);
	else
		fill(120, 70, 90);
	triangle(0, 0, w, 0, w/2, h/2);
	
	// right button
	if (right && pressed)
		fill(180, 70, 80);
	else if (right) 
		fill(180, 70, 100);
	else
		fill(180, 70, 90);
	triangle(w, 0, w, h, w/2, h/2);

	// back button
	if (back && pressed)
		fill(240, 70, 80);
	else if (back) 
		fill(240, 70, 100);
	else
		fill(240, 70, 90);
	triangle(w, h, 0, h, w/2, h/2);

	// text
	fill(0, 0, 0);
	text('Left', w/4, h/2);
	text('Forward', w/2, h/4);
	text('Right', w*3/4, h/2);
	text('Back', w/2, h*3/4);
}
