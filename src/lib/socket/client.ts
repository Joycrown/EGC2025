'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocketServerUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';
  }

  const { hostname, protocol } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // VS Code Dev Tunnels — derive port 3001 from port 3000 hostname
  if (hostname.includes('devtunnels.ms') || hostname.includes('github.dev')) {
    const socketHostname = hostname.replace('-3000.', '-3001.');
    return `${protocol}//${socketHostname}`;
  }

  return process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';
}

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

export function getSocket(token: string): Socket {
  if (socket) {
    // If URL changed (e.g. tunnel reconnected), tear down the old socket
    const expectedUrl = getSocketServerUrl();
    const currentUrl = (socket.io as unknown as { uri: string }).uri;
    if (currentUrl !== expectedUrl) {
      socket.disconnect();
      socket = null;
    }
  }

  if (!socket) {
    const url = getSocketServerUrl();

    // Tunnels and reverse proxies often block WebSocket upgrades.
    // Use polling for non-localhost connections — reliable, slightly more latency.
    const transports = isLocalhost()
      ? (['websocket', 'polling'] as const)
      : (['polling', 'websocket'] as const);

    socket = io(url, {
      auth: { token },
      transports: [...transports],
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
