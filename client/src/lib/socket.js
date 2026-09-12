import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', ''), {
    auth: { token },
    withCredentials: true,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
