import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../../../shared/auth/firebase-auth';

export const observeAdminSession = (listener: (user: User | null) => void): (() => void) =>
  onAuthStateChanged(firebaseAuth, listener);
export const currentAdminUser = (): User | null => firebaseAuth.currentUser;

export const signInAdmin = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return (await signInWithPopup(firebaseAuth, provider)).user;
};
export const signOutAdmin = (): Promise<void> => signOut(firebaseAuth);
