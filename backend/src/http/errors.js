import { AppError } from '../domain/errors.js';
import { sendJson } from './request.js';

const statuses = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  VALIDATION: 422,
  UPSTREAM: 502,
  UNAVAILABLE: 503,
};

export const sendError = (response, error, logger) => {
  if (error instanceof AppError && statuses[error.code]) {
    return sendJson(response, statuses[error.code], {
      message: error.message,
      ...(error.details ? { issues: error.details } : {}),
    });
  }
  // Dependency errors can contain request headers; log only their type.
  logger.error('API request failed', { name: error?.name ?? 'UnknownError' });
  return sendJson(response, 500, { message: 'Internal server error' });
};
