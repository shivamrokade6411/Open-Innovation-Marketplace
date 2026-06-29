/*
 * Purpose: Index creation script for MongoDB.
 * Author: Antigravity
 * Date: 2026-06-29
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { Conversation, Message } from '../models/Message.model';
import { Notification } from '../models/Notification.model';
import { Payment } from '../models/Payment.model';
import { Team } from '../models/Team.model';
import { Certificate } from '../models/Certificate.model';
import { connectDatabase } from '../config/database';

async function createIndexes() {
  try {
    console.log('Connecting to database to build indexes...');
    await connectDatabase();

    const models = [
      { name: 'User', model: User },
      { name: 'Company', model: Company },
      { name: 'Challenge', model: Challenge },
      { name: 'Submission', model: Submission },
      { name: 'Conversation', model: Conversation },
      { name: 'Message', model: Message },
      { name: 'Notification', model: Notification },
      { name: 'Payment', model: Payment },
      { name: 'Team', model: Team },
      { name: 'Certificate', model: Certificate }
    ];

    for (const m of models) {
      console.log(`Building indexes for ${m.name} collection...`);
      await m.model.createIndexes();
      console.log(`✅ Indexes built for ${m.name}`);
    }

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

void createIndexes();
