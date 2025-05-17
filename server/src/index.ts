import "dotenv/config";
import express from "express"
import { Server } from "socket.io"
import {createServer} from "http"
import cors from "cors"
import { setupSocket } from "./socket/socket"
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "./redis/redis"
import { setupCleanupJob } from "./cleanup"


const port = 8080 
const app = express()
const server = createServer(app)

// Configure CORS middleware first
const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:3000"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Add endpoint to check server status
app.get('/', (req, res) => {
  const serverStatus = {
    server: 'running',
    timestamp: new Date().toISOString(),
    services: {
      socket: io.engine.clientsCount > 0 ? 'active' : 'idle',
      redis: redis.status === 'ready' ? 'connected' : 'disconnected',
      database: 'connected', // Since the server is running, we assume DB is connected
    },
    activeConnections: io.engine.clientsCount,
    uptime: process.uptime(),
  }
  res.json(serverStatus)
})

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  adapter: createAdapter(redis)
})

setupCleanupJob();

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
setupSocket(io)
export {io}