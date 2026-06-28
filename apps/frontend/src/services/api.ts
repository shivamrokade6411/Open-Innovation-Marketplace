/*
 * Purpose: Shared Axios client for frontend services.
 * Author: Copilot
 * Date: 2026-06-28
 */

import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});
