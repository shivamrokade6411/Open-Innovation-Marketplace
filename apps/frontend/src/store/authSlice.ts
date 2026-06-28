/*
 * Purpose: Authentication Redux slice and async thunks.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser, IAuthTokens, UserRole } from '@oim/shared';

type AuthState = {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

type AuthResponse = {
  tokens: IAuthTokens;
  user: IUser;
};

type Credentials = {
  email: string;
  password: string;
};

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await response.json() as T;
  if (!response.ok) {
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  }
  return data;
}

export const loginThunk = createAsyncThunk<AuthResponse, Credentials>('auth/login', async (credentials) => {
  const response = await postJson<{ data: AuthResponse }>('/api/auth/login', credentials);
  return response.data;
});

export const registerThunk = createAsyncThunk<AuthResponse, Record<string, unknown>>('auth/register', async (payload) => {
  const response = await postJson<{ data: AuthResponse }>('/api/auth/register', payload);
  return response.data;
});

export const logoutThunk = createAsyncThunk<void, string>('auth/logout', async (refreshToken) => {
  await postJson('/api/auth/logout', { refreshToken });
});

export const refreshTokenThunk = createAsyncThunk<AuthResponse, string>('auth/refreshToken', async (refreshToken) => {
  const response = await postJson<{ data: AuthResponse }>('/api/auth/refresh-token', { refreshToken });
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<IUser>>) {
      state.user = state.user ? { ...state.user, ...action.payload } : state.user;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  }
});

export const { setCredentials, clearAuth, updateUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
export const selectCurrentUser = (state: { auth: AuthState }): IUser | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }): UserRole | null => state.auth.user?.role ?? null;
