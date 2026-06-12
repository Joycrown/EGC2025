"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const gameRoom_1 = require("./handlers/gameRoom");
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_PRODUCTION_URL,
].filter(Boolean);
function isAllowedOrigin(origin) {
    if (!origin)
        return true; // allow non-browser requests (e.g. mobile apps)
    if (ALLOWED_ORIGINS.includes(origin))
        return true;
    // Allow any VS Code Dev Tunnel URL pattern
    if (origin.includes('.devtunnels.ms') || origin.includes('.github.dev'))
        return true;
    // Allow any Vercel preview URL
    if (origin.includes('.vercel.app'))
        return true;
    // Allow the production custom domain
    if (origin.includes('gofamintpsakure.org'))
        return true;
    return false;
}
const corsOptions = {
    origin: (origin, cb) => {
        cb(null, isAllowedOrigin(origin));
    },
    credentials: true,
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: Date.now() });
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
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
        const user = (0, auth_1.verifySocketToken)(socket);
        socket.data.user = user;
        next();
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        next(new Error(msg));
    }
});
io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id} (user: ${socket.data.user?.id})`);
    (0, gameRoom_1.registerGameRoomHandlers)(io, socket);
});
httpServer.listen(PORT, () => {
    console.log(`[socket-server] listening on port ${PORT}`);
});
