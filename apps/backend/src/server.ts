/*
 * Purpose: HTTP server and Socket.io bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { connectDatabase } from './config/database';
import { connectRedis, redisClient } from './config/redis';
import { registerChatNamespace } from './sockets/chat.socket';
import { registerNotificationNamespace } from './sockets/notification.socket';
import { registerSubmissionsNamespace } from './sockets/submissions.socket';

const port = Number(process.env.PORT ?? 5000);
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.FRONTEND_URL ?? '*', credentials: true }
});

registerChatNamespace(io);
registerNotificationNamespace(io);
registerSubmissionsNamespace(io);

async function start(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
  });
}

process.on('SIGINT', async () => {
  await redisClient.quit().catch(() => undefined);
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await redisClient.quit().catch(() => undefined);
  server.close(() => process.exit(0));
});

void start();
