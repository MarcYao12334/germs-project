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
  pingInterval: 25000,
  pingTimeout: 60000,
});

// ── Event Buffer (in-memory) ──
const EVENT_BUFFER_MAX = 200;
const EVENT_BUFFER_TTL = 10 * 60 * 1000; // 10 minutes
let eventBuffer = [];

function addToBuffer(event) {
  eventBuffer.push(event);
  // Trim: keep last 200 events, max 10 min old
  const cutoff = Date.now() - EVENT_BUFFER_TTL;
  eventBuffer = eventBuffer.filter(e => e.ts > cutoff).slice(-EVENT_BUFFER_MAX);
}

function getEventsSince(ts) {
  return eventBuffer.filter(e => e.ts > ts);
}

// ── Health check ──
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'germs-relay',
    connections: io.engine.clientsCount,
    bufferedEvents: eventBuffer.length,
    uptime: Math.round(process.uptime()),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

app.get('/ping', (req, res) => {
  res.json({ pong: true, ts: Date.now() });
});

// ── WebSocket relay ──
io.on('connection', (socket) => {
  console.log(`[Relay] Client connected: ${socket.id} (total: ${io.engine.clientsCount})`);

  // Sync event — broadcast to others + store in buffer
  socket.on('sync-event', (event) => {
    addToBuffer(event);
    socket.broadcast.emit('sync-event', event);
    console.log(`[Relay] ${event.origin} → ${event.type} (to ${io.engine.clientsCount - 1} clients, buffer: ${eventBuffer.length})`);
  });

  // Catchup — client reconnects and wants missed events
  socket.on('sync-catchup', (data) => {
    const lastTs = data.lastTs || 0;
    const missed = getEventsSince(lastTs);
    console.log(`[Relay] Catchup for ${socket.id}: ${missed.length} events since ${new Date(lastTs).toISOString()}`);
    if (missed.length > 0) {
      socket.emit('sync-catchup-response', { events: missed });
    }
  });

  // Client ping to keep connection alive
  socket.on('keep-alive', () => {
    socket.emit('keep-alive-ack', { ts: Date.now() });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Relay] Client disconnected: ${socket.id} (reason: ${reason}, remaining: ${io.engine.clientsCount})`);
  });
});

// ── Self-ping to prevent Render from sleeping ──
const PORT = process.env.PORT || 3001;
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

setInterval(() => {
  const url = `${SELF_URL}/ping`;
  console.log(`[KeepAlive] Self-ping: ${url}`);
  // Use native http to avoid Node.js version issues with fetch
  const lib = url.startsWith('https') ? require('https') : require('http');
  lib.get(url, () => {}).on('error', () => {});
}, 4 * 60 * 1000); // Every 4 minutes

server.listen(PORT, () => {
  console.log(`GERMS Relay Server running on port ${PORT}`);
  console.log(`Self-ping URL: ${SELF_URL}`);
  console.log(`Event buffer: max ${EVENT_BUFFER_MAX} events, TTL ${EVENT_BUFFER_TTL / 1000}s`);
});
