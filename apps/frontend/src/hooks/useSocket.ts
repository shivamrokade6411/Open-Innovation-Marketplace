/*
 * Purpose: Socket.io client hook for realtime features.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface UseSocketResult {
  socket: Socket | null;
  isConnected: boolean;
  lastError: string | null;
}

/**
 * Initialize a Socket.io client with auth token awareness.
 * @param token Access token for the current session.
 * @returns Socket connection state and instance.
 * @throws Never throws.
 */
export function useSocket(token: string | null): UseSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const socket = useMemo(() => {
    if (!token) {
      return null;
    }
    return io(process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5
    });
  }, [token]);

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    const connect = (): void => setIsConnected(true);
    const disconnect = (): void => setIsConnected(false);
    const error = (err: Error): void => setLastError(err.message);

    socket.on('connect', connect);
    socket.on('disconnect', disconnect);
    socket.on('connect_error', error);

    return () => {
      socket.off('connect', connect);
      socket.off('disconnect', disconnect);
      socket.off('connect_error', error);
      socket.disconnect();
    };
  }, [socket]);

  return { socket, isConnected, lastError };
}
