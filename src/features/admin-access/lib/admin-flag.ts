export const ADMIN_STORAGE_KEY = 'planto:admin';

/**
 * The "auth" behind `/admin`. It is a flag in localStorage and nothing more:
 * the app has no server, so there is nothing to authenticate against. The
 * guard exists so the management screens are opted into rather than one
 * click from the header — see README.md, "Admin is a mock".
 */
export const isAdminEnabled = (): boolean => {
  try {
    return globalThis.localStorage.getItem(ADMIN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setAdminEnabled = (enabled: boolean): void => {
  try {
    if (enabled) globalThis.localStorage.setItem(ADMIN_STORAGE_KEY, '1');
    else globalThis.localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, quota). The flag then lasts a session.
  }
};
