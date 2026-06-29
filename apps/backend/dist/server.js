"use strict";
/*
 * Purpose: HTTP server and Socket.io bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const chat_socket_1 = require("./sockets/chat.socket");
const notification_socket_1 = require("./sockets/notification.socket");
const port = Number(process.env.PORT ?? 5000);
const server = http_1.default.createServer(app_1.app);
const io = new socket_io_1.Server(server, {
    cors: { origin: process.env.FRONTEND_URL ?? '*', credentials: true }
});
(0, chat_socket_1.registerChatNamespace)(io);
(0, notification_socket_1.registerNotificationNamespace)(io);
async function start() {
    await (0, database_1.connectDatabase)();
    await (0, redis_1.connectRedis)();
    server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend listening on port ${port}`);
    });
}
process.on('SIGINT', async () => {
    await redis_1.redisClient.quit().catch(() => undefined);
    server.close(() => process.exit(0));
});
process.on('SIGTERM', async () => {
    await redis_1.redisClient.quit().catch(() => undefined);
    server.close(() => process.exit(0));
});
void start();
