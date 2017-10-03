var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(80);

app.use('/assets', express.static(path.join(__dirname, '/assets')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/lib', express.static(path.join(__dirname, '/lib')));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/mission-control', function(req, res) {
	res.sendFile(__dirname + '/mission-control.html');
});

io.on('connection', function (socket) {
	socket.on('control', function (data) {
		console.log(data.direction + ': ' + data.pressed);
		io.sockets.emit('update', data);
	});
});
