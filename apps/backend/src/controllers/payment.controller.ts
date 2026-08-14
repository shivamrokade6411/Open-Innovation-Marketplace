/*
 * Purpose: Stripe payment and lifecycle controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { Payment } from '../models/Payment.model';
import { Challenge } from '../models/Challenge.model';
import { AppError, unauthorized, forbidden } from '../middleware/errorHandler.middleware';
import mongoose from 'mongoose';

// Create a new Stripe Checkout Session
export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  const { amount, currency, type, challengeId } = req.body;

  if (!amount || !type) {
    throw new AppError('Amount and payment type are required', 400, 'MISSING_PAYMENT_FIELDS');
  }

  // Generate a mock gateway checkout order ID
  const gatewayOrderId = 'stripe_cs_' + Math.random().toString(36).substr(2, 9);

  // Establish a new payment audit log in our Mongoose database
  const payment = await Payment.create({
    userId: req.user.userId,
    type,
    amount: Number(amount),
    currency: currency || 'USD',
    status: 'pending',
    gateway: 'stripe',
    gatewayOrderId,
    metadata: {
      challengeId,
      initiatedAt: new Date().toISOString()
    }
  });

  // Mock Stripe checkout session url
  const checkoutUrl = `https://checkout.stripe.com/pay/${gatewayOrderId}`;

  res.status(200).json({
    success: true,
    data: {
      paymentId: payment._id,
      gatewayOrderId,
      checkoutUrl
    }
  });
}

// Mock webhook receiver indicating successful checkout payment
export async function mockStripeWebhook(req: Request, res: Response): Promise<void> {
  const { gatewayOrderId, success } = req.body;

  if (!gatewayOrderId) {
    throw new AppError('Gateway order ID is required', 400, 'MISSING_ORDER_ID');
  }

  const payment = await Payment.findOne({ gatewayOrderId });
  if (!payment) {
    throw new AppError('Payment transaction record not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  if (success) {
    payment.status = payment.type === 'prize' ? 'funded' : 'success';
    payment.gatewayPaymentId = 'ch_' + Math.random().toString(36).substr(2, 9);
    
    // If it's a prize payment, update the challenge status to active/funded
    const challengeId = (payment.metadata as any)?.get ? (payment.metadata as any).get('challengeId') : (payment.metadata as any)?.challengeId;
    if (challengeId) {
      await Challenge.findByIdAndUpdate(challengeId, { status: 'active' });
    }
  } else {
    payment.status = 'failed';
  }

  await payment.save();

  res.status(200).json({ success: true, data: payment });
}

// Release held hackathon prize funds to team winners
export async function releasePrizeFunds(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can release prize payments');
  }

  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment record not found', 404, 'PAYMENT_NOT_FOUND');
  }

  if (payment.status !== 'funded' && payment.status !== 'held') {
    throw new AppError('Payment is not in funded or held status, cannot release', 400, 'INVALID_PAYMENT_STATE');
  }

  payment.status = 'released';
  await payment.save();

  res.status(200).json({ success: true, data: payment });
}

// Refund prize funds
export async function refundPrizeFunds(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only admins can refund payments');
  }

  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment record not found', 404, 'PAYMENT_NOT_FOUND');
  }

  payment.status = 'refunded';
  await payment.save();

  res.status(200).json({ success: true, data: payment });
}
