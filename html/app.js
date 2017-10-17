let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let pyshell = require('python-shell');
let isPi = require('detect-rpi');

//------------------------------------//
//-- Input
//------------------------------------//

function Input(pin, name, debounce_delay = 10) {
	// Start python process for reading the GPIO pin
	let gpio = new pyshell(
		'/python/gpio.py',
		{ 
			pythonPath: '/usr/bin/python3',
			pythonOptions: ['-u'],
			args: [pin]
		}
	);

	// Attach function for handling output from the GPIO process
	let pressed    = false;
	let last_input = 1;
	let time_stamp = Date.now();
	gpio.on('message', function (button_input) {
		// If state has changed, update time stamp for debounce
		if (button_input != last_input)
			time_stamp = Date.now();

		// Check if button has been pressed longer than the debounce delay
		if ((Date.now() - time_stamp) > debounce_delay) {

			// Check if button state has changed
			if ((button_input == 0) != pressed) {
				pressed = !parseInt(button_input);
				io.sockets.emit(
					'update',
					{ 
						direction: name,
						pressed: pressed
					}
				);	
			}

		}
		
		// Update last input
		last_input = button_input;
	});
};

//------------------------------------//
//-- Main program
//------------------------------------//

server.listen(80);

app.use('/assets', express.static(path.join(__dirname, '/assets')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/python', express.static(path.join(__dirname, '/python')));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname,'/index.html'));
});

app.get('/mission-control', function(req, res) {
	res.sendFile(path.join(__dirname, '/mission-control.html'));
});

io.on('connection', function (socket) {
	socket.on('control', function (data) {
		io.sockets.emit('update', data);
	});
});

if (isPi()) {
	let up_input    = new Input(11, 'Up');
	let down_input  = new Input(12, 'Down');
	let left_input  = new Input(13, 'Left');
	let right_input = new Input(15, 'Right');
}
