export const requireAdmin = (request, admin) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  return admin.authorize(token);
};
