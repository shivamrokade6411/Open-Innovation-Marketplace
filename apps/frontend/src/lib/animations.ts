/*
 * Purpose: Framer Motion animation variants.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Variants } from 'framer-motion';

export const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
export const fadeInUp: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
export const fadeInDown: Variants = { hidden: { opacity: 0, y: -24 }, visible: { opacity: 1, y: 0 } };
export const staggerChildren: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
export const scaleIn: Variants = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } };
export const slideInLeft: Variants = { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } };
export const slideInRight: Variants = { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } };
export const bounceIn: Variants = { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 18 } } };
export const pageTransition: Variants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }, exit: { opacity: 0, y: -16 } };
export const cardHover: Variants = { rest: { scale: 1, y: 0 }, hover: { scale: 1.02, y: -4 } };
