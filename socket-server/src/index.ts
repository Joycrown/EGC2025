import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { verifySocketToken } from './middleware/auth';
import { registerGameRoomHandlers } from './handlers/gameRoom';

const PORT = process.env.PORT || 3001;

// Allow localhost dev + VS Code tunnel URLs + Vercel production
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_APP_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_PRODUCTION_URL,
].filter(Boolean) as string[];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // allow non-browser requests (e.g. mobile apps)
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any VS Code Dev Tunnel URL pattern
  if (origin.includes('.devtunnels.ms') || origin.includes('.github.dev')) return true;
  // Allow any Vercel preview URL
  if (origin.includes('.vercel.app')) return true;
  return false;
}

const corsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    cb(null, isAllowedOrigin(origin));
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Support polling transport for tunnels/proxies that block WebSocket upgrades
  allowEIO3: true,
  transports: ['polling', 'websocket'],
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
