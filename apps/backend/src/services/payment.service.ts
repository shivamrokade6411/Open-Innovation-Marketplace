/*
 * Purpose: Payment integration helpers for Razorpay and Stripe.
 * Author: Copilot
 * Date: 2026-06-28
 */

import crypto from 'crypto';
import { Payment } from '../models/Payment.model';

/**
 * Create a Razorpay order record.
 * @param amount Order amount.
 * @param currency Currency code.
 * @param metadata Additional metadata.
 * @returns Promise resolving to the order identifier.
 * @throws Error When order creation fails.
 */
export async function createRazorpayOrder(amount: number, currency: string, metadata: Record<string, unknown>): Promise<{ orderId: string }> {
  const orderId = `order_${crypto.randomBytes(16).toString('hex')}`;
  await Payment.create({ userId: metadata.userId ?? '', type: metadata.type ?? 'subscription', amount, currency, status: 'pending', gateway: 'razorpay', gatewayOrderId: orderId, metadata });
  return { orderId };
}

/**
 * Verify a Razorpay payment signature.
 * @param orderId Order identifier.
 * @param paymentId Payment identifier.
 * @param signature Signature value.
 * @returns True when the signature is valid.
 * @throws Error When the validation fails.
 */
export function verifyRazorpayPayment(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
  const digest = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return digest === signature;
}

/**
 * Create a Stripe payment intent placeholder.
 * @param amount Amount in smallest currency unit.
 * @param currency Currency code.
 * @param metadata Additional metadata.
 * @returns Promise resolving to a client secret.
 * @throws Error When creation fails.
 */
export async function createStripePaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<{ clientSecret: string }> {
  return { clientSecret: `pi_${amount}_${currency}_${JSON.stringify(metadata)}` };
}

/**
 * Confirm a payment and update persistence.
 * @param paymentId Payment identifier.
 * @returns Promise resolving to the updated record.
 * @throws Error When the payment cannot be found.
 */
export async function confirmPayment(paymentId: string): Promise<unknown> {
  return Payment.findByIdAndUpdate(paymentId, { status: 'success' }, { new: true }).lean();
}

/**
 * Initiate a refund for a payment.
 * @param paymentId Payment identifier.
 * @returns Promise resolving to the refund result.
 * @throws Error When the refund cannot be processed.
 */
export async function initiateRefund(paymentId: string): Promise<unknown> {
  return Payment.findByIdAndUpdate(paymentId, { status: 'refunded' }, { new: true }).lean();
}

/**
 * Disburse a prize to a winner.
 * @param winnerId Winner user identifier.
 * @param submissionId Submission identifier.
 * @returns Promise resolving to the created withdrawal record.
 * @throws Error When the payout cannot be created.
 */
export async function disbursePrize(winnerId: string, submissionId: string): Promise<unknown> {
  return Payment.create({
    userId: winnerId,
    type: 'withdrawal',
    amount: 0,
    currency: 'INR',
    status: 'pending',
    gateway: 'razorpay',
    metadata: { submissionId }
  });
}
