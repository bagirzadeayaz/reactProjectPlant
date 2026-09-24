/** Stable error codes shared by use cases and adapters. HTTP mapping lives in http/. */
export class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const notFound = () => new AppError('NOT_FOUND', 'Not found');
