/*
 * Purpose: Shared Axios client for frontend services.
 * Author: Copilot
 * Date: 2026-06-28
 */

import axios from 'axios';

export const api = axios.create({
  baseURL: typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000')
    : '', // Use relative paths on client-side to route via Next.js proxy rewrites
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});
