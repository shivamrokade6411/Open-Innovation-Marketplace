/*
 * Purpose: Express application bootstrap.
 * Author: Copilot
 * Date: 2026-06-28
 */

import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { authRouter } from './routes/auth.routes';
import { challengeRouter } from './routes/challenge.routes';
import { submissionRouter } from './routes/submission.routes';
import feedbackRouter from './routes/feedback.routes';
import gradingRouter from './routes/grading.routes';
import certificateRouter from './routes/certificate.routes';
import { Company } from './models/Company.model';
import { getPlatformStats } from './controllers/analytics.controller';

export const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL ?? '*', credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalRateLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK', data: { status: 'healthy' } });
});

app.get('/api/companies', async (_req, res) => {
  const companies = await Company.find().lean();
  res.status(200).json({ success: true, data: companies });
});

app.get('/api/platform-stats', getPlatformStats);

app.use('/api/auth', authRouter);
app.use('/api/challenges', challengeRouter);
app.use('/api/submissions', submissionRouter);
app.use('/api', feedbackRouter);
app.use('/api', gradingRouter);
app.use('/api', certificateRouter);

app.use(errorHandler);
