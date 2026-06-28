/*
 * Purpose: Utility helpers for class name composition.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely.
 * @param inputs Class name values.
 * @returns The merged class string.
 * @throws Never throws.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
