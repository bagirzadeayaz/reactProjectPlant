/** Only the composition root reads process.env. Importing modules has no startup effects. */
export const loadConfig = (env) => {
  const required = (key) => {
    const value = env[key]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
  };
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be between 1 and 65535');
  const adminEmails = new Set(
    required('ADMIN_EMAILS')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  if (
    !adminEmails.size ||
    [...adminEmails].some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    throw new Error('ADMIN_EMAILS must contain valid comma-separated email addresses');
  }
  const allowedOrigin = env.FRONTEND_ORIGIN?.trim() || 'http://localhost:5173';
  const origin = new URL(allowedOrigin);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== allowedOrigin) {
    throw new Error('FRONTEND_ORIGIN must be an HTTP(S) origin without a path');
  }
  return Object.freeze({
    projectId: required('FIREBASE_PROJECT_ID'),
    databaseId: env.FIRESTORE_DATABASE_ID?.trim() || '(default)',
    adminEmails,
    port,
    allowedOrigin,
  });
};
