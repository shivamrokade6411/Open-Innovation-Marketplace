/*
 * Purpose: Typed Redux dispatch hook for the frontend store.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

/**
 * Get the typed Redux dispatch function.
 * @returns The application dispatch function.
 * @throws Never throws.
 */
export function useAppDispatch(): AppDispatch {
  return useDispatch<AppDispatch>();
}
