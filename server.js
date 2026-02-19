const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

let players = {};

// This part tells Render the server is "Healthy"
app.get('/', (req, res) => {
  res.send('Server is Running');
});

io.on('connection', (socket) => {
  players[socket.id] = {
    x: Math.random() * 20 - 10,
    z: Math.random() * 20 - 10,
    color: Math.random() * 0xffffff
  };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, info: players[socket.id] });

  socket.on('move', (pos) => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].z = pos.z;
      socket.broadcast.emit('playerMoved', { id: socket.id, x: pos.x, z: pos.z });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// CRITICAL FIX: Render assigns a random port, this code finds it
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Server is live on port ' + PORT);
});
