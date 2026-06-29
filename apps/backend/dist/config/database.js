"use strict";
/*
 * Purpose: MongoDB connection bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connect to MongoDB.
 * @returns Promise that resolves when the connection is established.
 * @throws Error If the connection fails.
 */
async function connectDatabase() {
    try {
        const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/oim';
        await mongoose_1.default.connect(uri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 10000
        });
    }
    catch (error) {
        throw error instanceof Error ? error : new Error('Failed to connect to MongoDB');
    }
}
