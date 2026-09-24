import { AppError } from '../domain/errors.js';

export const createAdminService = ({ verifyIdToken, adminEmails }) => ({
  authorize: async (token) => {
    if (!token) throw new AppError('UNAUTHENTICATED', 'Sign in required');
    let user;
    try {
      user = await verifyIdToken(token);
    } catch {
      throw new AppError('UNAUTHENTICATED', 'Invalid or expired sign-in');
    }
    if (!user.email_verified || !user.email || !adminEmails.has(user.email.toLowerCase())) {
      throw new AppError('FORBIDDEN', 'Admin access required');
    }
    return { email: user.email, token };
  },
});
