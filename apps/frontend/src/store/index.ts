/*
 * Purpose: Redux store configuration.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { dashboardReducer } from './dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
