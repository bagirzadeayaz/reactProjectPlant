/** Lazy auth dependency keeps Firebase out of the storefront's initial bundle. */
export const getAccessToken = async (): Promise<string | undefined> => {
  const { firebaseAuth } = await import('../auth/firebase-auth');
  return firebaseAuth.currentUser?.getIdToken();
};
