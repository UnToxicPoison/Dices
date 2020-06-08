var socket = location.hostname == "localhost" || location.hostname == "127.0.0.1" ? io.connect('http://localhost:3000/') : io();

const eventMessageClient = (text) => {
  const parent = document.querySelector('#eventMessage');
  parent.innerHTML = text;
}


socket.on('message', function(data) {
  eventMessageClient(data);
});

function rollDices() {
  socket.emit('message', 'Dices has been rolled');
}

socket.on('dicep1', function(data) {
  eventDicesClientP1(data);
});

socket.on('dicep2', function(data) {
  eventDicesClientP2(data);
});

const eventDicesClientP1 = (int) => {

  var player1Image = document.getElementById("imageP1");

  var randomIntP1 = int;

  player1Image.src = "images/dice/dice" + randomIntP1 + ".png";

}

const eventDicesClientP2 = (int) => {

  var player2Image = document.getElementById("imageP2");

  var randomIntP2 = int;

  player2Image.src = "images/dice/dice" + randomIntP2 + ".png";

}

const placementMessage = (text) => {
  const parent = document.querySelector('#winner');
  parent.innerHTML = text;
}

socket.on('placement', function(data) {
  placementMessage(data);
});
