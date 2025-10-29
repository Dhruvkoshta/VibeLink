import { Server, Socket } from "socket.io";
import db from "../lib/db.server";
import { chatMessages, user as users } from "../db/schema";

import { eq } from "drizzle-orm";
import redis from "../redis/redis";

interface ChatMessageRecord {
  id: string;
  sender: string | null;
  message: string | null;
  chatGroupId: string | null;
  createdAt: Date | null;
  userEmail: string | null;
  userAvatar: string | null;
  userId: string | null;
}

interface CustomSocket extends Socket {
  room?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderAvatar?: string;
  message: string;
  room: string;
  createdAt: string;
  user: {
    email: string;
    avatar?: string;
  };
}

interface FetchMessagesData {
  room: string;
}

interface SendMessageData {
  sender: string;
  message: string;
  room: string;
  createdAt?: string;
  user: {
    email: string;
    avatar?: string;
  };
}

type FetchMessagesCallback = (messages: ChatMessage[]) => void;

// Redis cache expiry time (24 hours)
const CACHE_EXPIRY = 60 * 60 * 24;

// In-memory cache for user lookups (with TTL)
const userCache = new Map<string, { id: string; timestamp: number }>();
const USER_CACHE_TTL = 300000; // 5 minutes
const CACHE_CLEANUP_INTERVAL = 600000; // 10 minutes

// Periodic cleanup of expired cache entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of userCache.entries()) {
    if (now - data.timestamp > USER_CACHE_TTL) {
      userCache.delete(email);
    }
  }
}, CACHE_CLEANUP_INTERVAL);

function formatMessage(msg: ChatMessageRecord): ChatMessage {
  return {
    id: msg.id,
    sender: msg?.sender || "",
    senderAvatar: msg.userAvatar || undefined,
    message: msg.message || "",
    room: msg.chatGroupId || "",
    createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
    user: {
      email: msg.userEmail || "",
      avatar: msg.userAvatar || undefined,
    },
  };
}

// Get user ID from cache or database
async function getUserId(email: string): Promise<string> {
  const now = Date.now();
  const cached = userCache.get(email);
  
  // Check if cache is still valid
  if (cached && (now - cached.timestamp) < USER_CACHE_TTL) {
    return cached.id;
  }
  
  // Fetch from database
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }
  
  // Update cache
  userCache.set(email, { id: user.id, timestamp: now });
  
  return user.id;
}

async function getMessagesForRoom(room: string): Promise<ChatMessage[]> {
  const cacheKey = `chat:${room}:messages`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Using cached messages for room: ${room}`);
      return JSON.parse(cached);
    }
    console.log(`Cache miss for room: ${room}, fetching from DB`);
    const messagesFromDB = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatGroupId, room))
      .orderBy(chatMessages.createdAt);

    const formattedMessages = messagesFromDB.map(formatMessage);
    await redis.setex(cacheKey, CACHE_EXPIRY, JSON.stringify(formattedMessages));
    return formattedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    const messagesFromDB = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatGroupId, room))
      .orderBy(chatMessages.createdAt);
    return messagesFromDB.map(formatMessage);
  }
}

export function setupSocket(io: Server): void {
  io.use((socket: CustomSocket, next) => {
    const room = socket.handshake.auth.room as string | undefined;
    if (room) {
      socket.room = room;
    }
    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    if (socket.room) {
      socket.join(socket.room);
      console.log(`Socket ${socket.id} joined room: ${socket.room}`);
      getMessagesForRoom(socket.room)
        .then((messages) => socket.emit("fetch_messages", messages))
        .catch((err) => console.error("Error on connection:", err));
    } else {
      console.log(`Socket ${socket.id} connected without a room`);
    }

    socket.on("fetch_messages", async (data: FetchMessagesData, callback: FetchMessagesCallback) => {
      const messages = await getMessagesForRoom(data.room);
      callback(messages);
    });

    socket.on("send_message", async (data: SendMessageData) => {
      console.log(`Received message from ${data.user.email} for room ${data.room}`);

      const userInfo = {
        email: data.user.email || "unknown@example.com",
        avatar: data.user.avatar || null,
      };

      try {
        // Use cached user lookup to avoid N+1 queries
        const userId = await getUserId(userInfo.email);

        const [savedMessage] = await db
          .insert(chatMessages)
          .values({
            chatGroupId: data.room,
            sender: data.sender,
            message: data.message,
            userId: userId,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar,
          })
          .returning();

        const formattedMessage = formatMessage(savedMessage);

        // Broadcast message immediately for real-time experience
        io.to(data.room).emit("new_message", formattedMessage);
        console.log(`Message broadcast to room: ${data.room}`);

        // Update cache asynchronously after broadcast (eventual consistency is acceptable for cache)
        // Note: We accept potential race conditions here as Redis cache is secondary to DB
        // The cache will be rebuilt from DB on next room load if inconsistent
        const cacheKey = `chat:${data.room}:messages`;
        redis.get(cacheKey)
          .then(cachedMessages => {
            const messages: ChatMessage[] = cachedMessages ? JSON.parse(cachedMessages) : [];
            messages.push(formattedMessage);
            return redis.setex(cacheKey, CACHE_EXPIRY, JSON.stringify(messages));
          })
          .catch(err => console.error("Redis cache update error:", err));
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}