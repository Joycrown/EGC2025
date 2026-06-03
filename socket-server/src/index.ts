import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { verifySocketToken } from './middleware/auth';
import { registerGameRoomHandlers } from './handlers/gameRoom';

const PORT = process.env.PORT || 3001;
const NEXT_APP_URL = process.env.NEXT_APP_URL || 'http://localhost:3000';

const app = express();
app.use(cors({ origin: NEXT_APP_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: NEXT_APP_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// JWT auth middleware for all socket connections
io.use((socket, next) => {
  try {
    const user = verifySocketToken(socket);
    socket.data.user = user;
    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed';
    next(new Error(msg));
  }
});

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id} (user: ${socket.data.user?.id})`);
  registerGameRoomHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`[socket-server] listening on port ${PORT}`);
});
