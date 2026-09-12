import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

let io;
const onlineUsers = new Map(); // userId -> Set of socketIds (a user can have multiple tabs open)

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Authenticate the socket connection with the same JWT used for REST requests.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`); // personal room, used to push notifications directly to this user

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('presence:online', { userId });

    socket.on('presence:list', () => {
      socket.emit('presence:list', { onlineUserIds: Array.from(onlineUsers.keys()) });
    });

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, text }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === userId)) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          readBy: [userId],
        });
        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populated = await message.populate('sender', 'name avatar');
        io.to(`conversation:${conversationId}`).emit('message:new', populated);
      } catch {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId });
    });

    socket.on('message:read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      socket.to(`conversation:${conversationId}`).emit('message:read', { userId, conversationId });
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:offline', { userId });
        }
      }
    });
  });

  return io;
};

// Used by other services (proposal, contract, wallet) to push a live event to one user's personal room.
export const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId.toString()}`).emit(event, payload);
};
