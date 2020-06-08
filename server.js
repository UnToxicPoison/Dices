const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

var playerSockets = [];

io.on('connection', (sock) => {
  console.log('Someon connected: ' + sock.id);
  playerSockets.push(sock.id);

  console.log(playerSockets.length + " player('s) connected");
  if (playerSockets.length === 2) {
    io.sockets.emit('message', "Hallo, we hebben 2 spelers, dus we kunnen beginnen!");
    io.sockets.emit('dicep1', 1);
    io.sockets.emit('dicep2', 6);
    io.sockets.emit('placement', 'Wie wint??');
  } else if (!(playerSockets.length === 1)) {
    sock.emit('message', "Er zijn al mensen bezig, maar je kunt meekijken!");
  } else sock.emit('message', "Hallo, je bent verbonden. Laten we wachten op je tegenstander.<br> Speel ondertussen tegen de computer.");

  sock.on('message', function(data) {
    if (sock.id === playerSockets[0] || sock.id === playerSockets[1]) {
      rollDices();
    }
  });


  sock.on('disconnect', function() {
    playerSockets.splice(playerSockets.indexOf(sock.id), 1);

    if (playerSockets.length === 1) {
      io.sockets.emit('message', "Hallo, je bent verbonden. Laten we wachten op je tegenstander.<br> Speel ondertussen tegen de computer.");
      io.sockets.emit('placement', 'Wie wint??');
    } else if (playerSockets.length === 2) {
      io.sockets.emit('message', "Hallo, we hebben 2 spelers, dus we kunnen beginnen!");
      io.sockets.emit('placement', 'Wie wint??');
    } else if (playerSockets.length > 2) {
      io.sockets.emit('message', "Er zijn al mensen bezig, maar je kunt meekijken!");
      io.to(playerSockets[0]).emit('message', "Hallo, we hebben 2 spelers, dus we kunnen beginnen!");
      io.to(playerSockets[1]).emit('message', "Hallo, we hebben 2 spelers, dus we kunnen beginnen!");
    }

    console.log(sock.id + ': disconnected');
    console.log(playerSockets.length + " player('s) left");
  });
});

server.on('error', (err) => {
  console.error('Server error: ', err);
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`RPS started on ${process.env.PORT || 3000}`);
});

var player1Int = [];
var player2Int = [];

function rollDices() {

  player1Int.push(getRandomInt(1, 6));

  io.sockets.emit('dicep1', parseInt(player1Int));

  player2Int.push(getRandomInt(1, 6));

  io.sockets.emit('dicep2', parseInt(player2Int));

  if (parseInt(player1Int) === parseInt(player2Int)) {
    io.sockets.emit('placement', "Gelijk spel.");
  } else if (player1Int > player2Int) {
    io.sockets.emit('placement', "Speler 1 heeft gewonnen!");
    io.to(playerSockets[0]).emit('placement', 'Gewonnen!');
    io.to(playerSockets[1]).emit('placement', 'Verloren...');
  } else {
    io.sockets.emit('placement', "Speler 2 heeft gewonnen!");
    io.to(playerSockets[0]).emit('placement', 'Verloren...');
    io.to(playerSockets[1]).emit('placement', 'Gewonnen!');
  }
  player1Int.pop();
  player2Int.pop();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
