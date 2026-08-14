/*
 * Purpose: Routing definitions for Stripe payment interactions.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createCheckoutSession,
  mockStripeWebhook,
  releasePrizeFunds,
  refundPrizeFunds
} from '../controllers/payment.controller';

const router = Router();

// Public webhook route
router.post('/webhook', mockStripeWebhook);

// Authenticated billing routes
router.use(authenticateJWT);
router.post('/checkout', createCheckoutSession);
router.post('/:paymentId/release', releasePrizeFunds);
router.post('/:paymentId/refund', refundPrizeFunds);

export default router;
