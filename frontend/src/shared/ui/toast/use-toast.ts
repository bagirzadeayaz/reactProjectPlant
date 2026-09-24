import { useContext } from 'react';
import { ToastContext } from './toast-context';
import type { ToastContextValue } from './types';

/** Access the toast queue. Throws outside a `ToastProvider`. */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
