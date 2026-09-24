import type { User } from 'firebase/auth';

type Listener = (user: User | null) => void;
const listeners = new Set<Listener>();
let enabled = false;

const user = { getIdToken: () => Promise.resolve('test-admin-token') } as User;
const publish = () => {
  listeners.forEach((listener) => {
    listener(enabled ? user : null);
  });
};

export const setAdminEnabled = (value: boolean): void => {
  enabled = value;
  publish();
};
export const isAdminEnabled = (): boolean => enabled;
export const currentAdminUser = (): User | null => (enabled ? user : null);
export const observeAdminSession = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(currentAdminUser());
  return () => {
    listeners.delete(listener);
  };
};
export const signInAdmin = (): Promise<User> => {
  setAdminEnabled(true);
  return Promise.resolve(user);
};
export const signOutAdmin = (): Promise<void> => {
  setAdminEnabled(false);
  return Promise.resolve();
};
