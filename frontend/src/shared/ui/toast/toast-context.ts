import { createContext } from 'react';
import type { ToastContextValue } from './types';

/** Undefined outside a ToastProvider, which `useToast` turns into a clear error. */
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
