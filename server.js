onst io = require('socket.io')(3000, { cors: { origin: "*" } });
let players = {};

console.log("Server is starting...");

io.on('connection', (socket) => {
  // Give every new player a random position and color
  players[socket.id] = {
    x: Math.random() * 20 - 10,
    z: Math.random() * 20 - 10,
    color: Math.random() * 0xffffff
  };

  // Send the list of players to the person who just joined
  socket.emit('currentPlayers', players);
  // Tell everyone else a new player is here
  socket.broadcast.emit('newPlayer', { id: socket.id, info: players[socket.id] });

  // When someone moves, tell everyone else
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
