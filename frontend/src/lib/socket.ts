/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Socket.io client configuration
 */

import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

export const socket = io(WS_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

socket.on('connect', () => {
  console.log('Socket.io connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket.io disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket.io connection error:', error);
});
