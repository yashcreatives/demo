import { io, Socket } from 'socket.io-client';
import { Order, MenuItem } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // In browser, connect to same origin
    socket = io(typeof window !== 'undefined' ? window.location.origin : '', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected with id:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection note (polling fallback active):', err.message);
    });
  }
  return socket;
}

export type SocketEventCallback<T> = (data: T) => void;

export function onNewOrder(callback: SocketEventCallback<Order>): () => void {
  const s = getSocket();
  s.on('new_order', callback);
  return () => {
    s.off('new_order', callback);
  };
}

export function onOrderStatusUpdated(callback: SocketEventCallback<Order>): () => void {
  const s = getSocket();
  s.on('order_status_updated', callback);
  return () => {
    s.off('order_status_updated', callback);
  };
}

export function onMenuUpdated(callback: SocketEventCallback<MenuItem[]>): () => void {
  const s = getSocket();
  s.on('menu_updated', callback);
  return () => {
    s.off('menu_updated', callback);
  };
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
