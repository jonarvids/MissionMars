var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/lib', express.static(__dirname + '/lib'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/mission-control', function(req, res) {
	res.sendFile(__dirname + '/mission-control.html');
});

io.on('connection', function (socket) {
	socket.on('control', function (data) {
		console.log(data.direction + ': ' + data.pressed);
	});
});
