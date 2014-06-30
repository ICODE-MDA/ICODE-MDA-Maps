//Get local IP of this server ---------------------------------------------
var os = require('os')

var interfaces = os.networkInterfaces();
var addresses = [];
for (k in interfaces) {
    for (k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address)
        }
    }
}

//console.log(addresses[0])


//Setup chat server ------------------------------------------------------
var HOST = addresses[0]//'128.49.78.214';
var PORT = 8080;

var fs = require('fs'),
    http = require('http'),
    socketio = require('socket.io');
 
var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end(fs.readFileSync(__dirname__dirname + '/index.html'));
}).listen(PORT, HOST, function() {
    console.log('Listening at: http://' + HOST + ':' + PORT);
});
 
socketio.listen(server).on('connection', function (socket) {
   //Obtain the client's IP
   var address = socket.handshake.address;
   //Send message on connection
   console.log('Client connected: ', address.address, ',', socket.id);
   socket.broadcast.emit('servermsg', {id:'', msg:'User connected: '+address.address});

   socket.on('message', function (msg) {
      console.log('Message Received: ', msg);
      socket.emit('message', {id:'You',msg: msg}); //Send message to sender
      socket.broadcast.emit('message', {id:address.address,msg: msg}); //Send message to everyone EXCEPT sender
   });

   socket.on('disconnect', function () {
      //Send message on disconnection
      console.log('Client disconnected: ', address.address, ',', socket.id);
      socket.broadcast.emit('servermsg', {id:'', msg:'User disconnected: '+address.address});
   });
});

