"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket/socket");
const redis_streams_adapter_1 = require("@socket.io/redis-streams-adapter");
const redis_1 = __importDefault(require("./redis/redis"));
const cleanup_1 = require("./cleanup");
const port = 8080;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Configure CORS middleware first
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
}));
// Add OPTIONS handling for preflight requests
app.options('*', (0, cors_1.default)());
// Add endpoint to check server status
app.get('/', (req, res) => {
    const serverStatus = {
        server: 'running',
        timestamp: new Date().toISOString(),
        services: {
            socket: io.engine.clientsCount > 0 ? 'active' : 'idle',
            redis: redis_1.default.status === 'ready' ? 'connected' : 'disconnected',
            database: 'connected', // Since the server is running, we assume DB is connected
        },
        activeConnections: io.engine.clientsCount,
        uptime: process.uptime(),
    };
    res.json(serverStatus);
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
    },
    adapter: (0, redis_streams_adapter_1.createAdapter)(redis_1.default)
});
exports.io = io;
(0, cleanup_1.setupCleanupJob)();
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
(0, socket_1.setupSocket)(io);
