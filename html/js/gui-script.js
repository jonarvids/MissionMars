// Controls
var up, down, left, right;

let roverHealth, roverBattery;

const socket = io.connect('http://localhost');

socket.on('roverData', (data) => {
		roverHealth = data.health;
		roverBattery = data.battery;

		// HP
		const hpText = document.getElementById("hpText");
		hpText.innerHTML = (Math.round(roverHealth).toString() + "%");

		if (parseInt(roverHealth) > 0) {

				document.getElementById("hpMeter").style.width = (roverHealth.toString() + "%");
		}

		//Rover
		if (roverHealth >= 80) {
				//console.log("över 90");
				document.getElementById("roverImages").src = "assets/images/roverImage.png"

		} else if (roverHealth < 80 && roverHealth >= 60) {
				//console.log("Under 90");
				document.getElementById("roverImages").src = "assets/images/roverImage_slightly_damaged.png"

		} else if (roverHealth < 60 && roverHealth >= 40) {
				document.getElementById("roverImages").src = "assets/images/roverImage_damaged.png"

		} else if (roverHealth < 40 && roverHealth >= 20) {
				document.getElementById("hpMeter").classList.add('bg-warning');

				document.getElementById("hpMeter").classList.remove('bg-success');

				document.getElementById("roverImages").src = "assets/images/roverImage_critical.png"

		} else if (roverHealth === 0) {

				document.getElementById("roverImages").src = "assets/images/roverImage_dead.png"
		}


		if (roverHealth <= 50 && roverHealth > 20) {
				document.getElementById("hpMeter").classList.add('bg-warning');

				document.getElementById("hpMeter").classList.remove('bg-success');
		}
		if (roverHealth <= 20) {
				document.getElementById("hpMeter").classList.add('bg-danger');

				document.getElementById("hpMeter").classList.remove('bg-warning');
		}

		//Battery


		document.getElementById("batteryMeter").style.width = (roverBattery.toString() + "%");

		var batteryText = document.getElementById("batteryText").innerHTML = (Math.round(roverBattery).toString() + "%");


		if (roverBattery < 33) {
				document.getElementById("batteryMeter").classList.add('bg-danger');

		}

		if (roverBattery === 0) {
				clearInterval(batterFunction);
		}

});

document.addEventListener('keydown', press)

function press(e) {
		if (e.keyCode === 38 /* up */ || 
				e.keyCode === 87 /* w */ || 
				e.keyCode === 90 /* z */ ) {
			up = true;
			document.getElementById("triangleUp").style.borderColor = "red";
			socket.emit('control', { direction: 'Up', pressed: true });
		}

		if (e.keyCode === 39 /* right */ || 
				e.keyCode === 68 /* d */ ) {
			right = true;
			document.getElementById("triangleRight").style.borderColor = "red";
			socket.emit('control', { direction: 'Right', pressed: true });
		}

		if (e.keyCode === 40 /* down */ || 
				e.keyCode === 83 /* s */ ) {
			back = true;
			document.getElementById("triangleDown").style.borderColor = "red";
			socket.emit('control', { direction: 'Down', pressed: true });
		}

		if (e.keyCode === 37 /* left */ || 
				e.keyCode === 65 /* a */ || 
				e.keyCode === 81 /* q */ ) {
			left = true;
			document.getElementById("triangleLeft").style.borderColor = "red";
			socket.emit('control', { direction: 'Left', pressed: true });
		}
}

document.addEventListener('keyup', release)

function release(e) {
		if (e.keyCode === 38 /* up */ || 
				e.keyCode === 87 /* w */ || 
				e.keyCode === 90 /* z */ ) {
			up = false;
			document.getElementById("triangleUp").style.borderColor = "white";
			socket.emit('control', { direction: 'Up', pressed: false });
		}

		if (e.keyCode === 39 /* right */ ||
				e.keyCode === 68 /* d */ ) {
			right = false;
			document.getElementById("triangleRight").style.borderColor = "white";
			socket.emit('control', { direction: 'Right', pressed: false });
		}

		if (e.keyCode === 40 /* down */ ||
				e.keyCode === 83 /* s */ ) {
			down = false;
			document.getElementById("triangleDown").style.borderColor = "white";
			socket.emit('control', { direction: 'Down', pressed: false });
		}

		if (e.keyCode === 37 /* left */ || 
				e.keyCode === 65 /* a */ || 
				e.keyCode === 81 /* q */ ) {
			left = false;
			document.getElementById("triangleLeft").style.borderColor = "white";
			socket.emit('control', { direction: 'Left', pressed: false });
		}
}
