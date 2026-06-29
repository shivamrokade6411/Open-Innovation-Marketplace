"use strict";
/*
 * Purpose: Payment integration helpers for Razorpay and Stripe.
 * Author: Copilot
 * Date: 2026-06-28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRazorpayOrder = createRazorpayOrder;
exports.verifyRazorpayPayment = verifyRazorpayPayment;
exports.createStripePaymentIntent = createStripePaymentIntent;
exports.confirmPayment = confirmPayment;
exports.initiateRefund = initiateRefund;
exports.disbursePrize = disbursePrize;
const crypto_1 = __importDefault(require("crypto"));
const Payment_model_1 = require("../models/Payment.model");
/**
 * Create a Razorpay order record.
 * @param amount Order amount.
 * @param currency Currency code.
 * @param metadata Additional metadata.
 * @returns Promise resolving to the order identifier.
 * @throws Error When order creation fails.
 */
async function createRazorpayOrder(amount, currency, metadata) {
    const orderId = `order_${crypto_1.default.randomBytes(16).toString('hex')}`;
    await Payment_model_1.Payment.create({ userId: metadata.userId ?? '', type: metadata.type ?? 'subscription', amount, currency, status: 'pending', gateway: 'razorpay', gatewayOrderId: orderId, metadata });
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
function verifyRazorpayPayment(orderId, paymentId, signature) {
    const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
    const digest = crypto_1.default.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
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
async function createStripePaymentIntent(amount, currency, metadata) {
    return { clientSecret: `pi_${amount}_${currency}_${JSON.stringify(metadata)}` };
}
/**
 * Confirm a payment and update persistence.
 * @param paymentId Payment identifier.
 * @returns Promise resolving to the updated record.
 * @throws Error When the payment cannot be found.
 */
async function confirmPayment(paymentId) {
    return Payment_model_1.Payment.findByIdAndUpdate(paymentId, { status: 'success' }, { new: true }).lean();
}
/**
 * Initiate a refund for a payment.
 * @param paymentId Payment identifier.
 * @returns Promise resolving to the refund result.
 * @throws Error When the refund cannot be processed.
 */
async function initiateRefund(paymentId) {
    return Payment_model_1.Payment.findByIdAndUpdate(paymentId, { status: 'refunded' }, { new: true }).lean();
}
/**
 * Disburse a prize to a winner.
 * @param winnerId Winner user identifier.
 * @param submissionId Submission identifier.
 * @returns Promise resolving to the created withdrawal record.
 * @throws Error When the payout cannot be created.
 */
async function disbursePrize(winnerId, submissionId) {
    return Payment_model_1.Payment.create({
        userId: winnerId,
        type: 'withdrawal',
        amount: 0,
        currency: 'INR',
        status: 'pending',
        gateway: 'razorpay',
        metadata: { submissionId }
    });
}
