export class AppError extends Error {
  public code: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const ErrorCode = {
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_EMAIL_NOT_CONFIRMED: 'auth/email-not-confirmed',
  NETWORK_ERROR: 'network/request-failed',
  AI_LIMIT_REACHED: 'ai/quota-exceeded',
  DATABASE_WRITE_FAILED: 'db/write-failed',
};

export const handleAppError = (error: any): AppError => {
  console.error('[Global Error Handler]:', error);
  if (error instanceof AppError) return error;
  if (error.message?.includes('confirmation email')) {
    return new AppError(
      'Email not confirmed. Please check your inbox or disable confirmation in Supabase settings.',
      ErrorCode.AUTH_EMAIL_NOT_CONFIRMED
    );
  }
  if (error.message?.includes('Invalid login credentials')) {
    return new AppError(
      'The email or password you entered is incorrect.',
      ErrorCode.AUTH_INVALID_CREDENTIALS
    );
  }
  return new AppError(
    error.message || 'An unexpected error occurred',
    error.code || 'INTERNAL_ERROR',
    error.status
  );
};
