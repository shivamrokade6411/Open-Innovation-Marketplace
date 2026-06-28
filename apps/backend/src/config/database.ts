/*
 * Purpose: MongoDB connection bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 * @returns Promise that resolves when the connection is established.
 * @throws Error If the connection fails.
 */
export async function connectDatabase(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/oim';
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000
    });
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Failed to connect to MongoDB');
  }
}
