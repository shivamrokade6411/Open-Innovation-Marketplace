"use strict";
/*
 * Purpose: Index creation script for MongoDB.
 * Author: Antigravity
 * Date: 2026-06-29
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const User_model_1 = require("../models/User.model");
const Company_model_1 = require("../models/Company.model");
const Challenge_model_1 = require("../models/Challenge.model");
const Submission_model_1 = require("../models/Submission.model");
const Message_model_1 = require("../models/Message.model");
const Notification_model_1 = require("../models/Notification.model");
const Payment_model_1 = require("../models/Payment.model");
const Team_model_1 = require("../models/Team.model");
const Certificate_model_1 = require("../models/Certificate.model");
const database_1 = require("../config/database");
async function createIndexes() {
    try {
        console.log('Connecting to database to build indexes...');
        await (0, database_1.connectDatabase)();
        const models = [
            { name: 'User', model: User_model_1.User },
            { name: 'Company', model: Company_model_1.Company },
            { name: 'Challenge', model: Challenge_model_1.Challenge },
            { name: 'Submission', model: Submission_model_1.Submission },
            { name: 'Conversation', model: Message_model_1.Conversation },
            { name: 'Message', model: Message_model_1.Message },
            { name: 'Notification', model: Notification_model_1.Notification },
            { name: 'Payment', model: Payment_model_1.Payment },
            { name: 'Team', model: Team_model_1.Team },
            { name: 'Certificate', model: Certificate_model_1.Certificate }
        ];
        for (const m of models) {
            console.log(`Building indexes for ${m.name} collection...`);
            await m.model.createIndexes();
            console.log(`✅ Indexes built for ${m.name}`);
        }
        console.log('All indexes created successfully!');
    }
    catch (error) {
        console.error('Error creating indexes:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('Database connection closed.');
    }
}
void createIndexes();
