export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiFailure = {
  success: false;
  error: { code: ApiErrorCode; message: string; details?: unknown };
};

export function ok<T>(data: T, message = 'Success'): ApiSuccess<T> {
  return { success: true, data, message };
}

export function fail(code: ApiErrorCode, message: string, details?: unknown): ApiFailure {
  return { success: false, error: { code, message, details } };
}
