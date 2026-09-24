import {
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
} from 'firebase/auth';
import { firebaseApp } from '../config/firebase';

const initialize = () => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'auth/already-initialized') {
      return getAuth(firebaseApp);
    }
    throw error;
  }
};

export const firebaseAuth = initialize();
