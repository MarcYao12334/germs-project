const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'germs-relay', connections: io.engine.clientsCount });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket relay — broadcast events to all other clients
io.on('connection', (socket) => {
  console.log(`[Relay] Client connected: ${socket.id}`);

  socket.on('sync-event', (event) => {
    // Broadcast to ALL other connected clients (not sender)
    socket.broadcast.emit('sync-event', event);
    console.log(`[Relay] ${event.origin} → ${event.type} (broadcast to ${io.engine.clientsCount - 1} clients)`);
  });

  socket.on('disconnect', () => {
    console.log(`[Relay] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`GERMS Relay Server running on port ${PORT}`);
});
