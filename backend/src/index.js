import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

// Load env variables
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// Define allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  // Add your production frontend URL here
  process.env.FRONTEND_URL,
];

// Filter out undefined origins
const validOrigins = allowedOrigins.filter(origin => origin);

// Middlewares - Apply CORS before initializing Socket.io
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (validOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (validOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  },
  path: "/socket.io/", // Explicitly set socket.io path
  transports: ["polling", "websocket"]
});

// Socket.io connection handler
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);
  
  // Add user to online users when they connect
  const userId = socket.handshake.query.userId;
  if (userId) {
    console.log(`User ${userId} connected with socket ${socket.id}`);
    onlineUsers.push({ userId, socketId: socket.id });
    io.emit("getOnlineUsers", onlineUsers.map(user => user.userId));
  }

  // Handle typing events
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  // Remove user when they disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers.map(user => user.userId));
  });
});

// Make Socket.io instance globally available
global.io = io;
global.onlineUsers = onlineUsers;

// Helper function to get receiver socket ID
export const getReceiverSocketId = (receiverId) => {
  const user = onlineUsers.find(user => user.userId === receiverId);
  return user ? user.socketId : null;
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`Socket.io path: ${io.path()}`);
  connectDB();
});
