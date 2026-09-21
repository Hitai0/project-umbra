import http from 'http';
import express from 'express';
import cors from 'cors';
import colyseus from 'colyseus';
const { Server } = colyseus;
import { WebSocketTransport } from '@colyseus/ws-transport';
import { WorldRoom } from './rooms/WorldRoom.js';
import { initDatabase } from './db/index.js';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Basic health and info endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Project Umbra MMO Server',
    uptime: process.uptime()
  });
});

const server = http.createServer(app);

// Setup Colyseus Game Server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: server
  })
});

// Register the main world room
gameServer.define('world_room', WorldRoom);

// Start Database pool (non-blocking)
initDatabase();

server.listen(port, () => {
  console.log(`
  ================================================
  ⚔️  PROJECT UMBRA - HD-2D MMORPG SERVER ⚔️
  ================================================
  🚀 WebSocket Port: ${port}
  🌐 Health check:   http://localhost:${port}/health
  🎮 Room Defined:   world_room
  ================================================
  `);
});
