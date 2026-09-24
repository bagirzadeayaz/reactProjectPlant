export type ToastTone = 'info' | 'success' | 'error';

export interface Toast {
  id: string;
  /** Message text. Caller-supplied so it can be translated. */
  message: string;
  tone: ToastTone;
  /** Milliseconds before auto-dismiss. 0 keeps it until dismissed by hand. */
  duration: number;
}

export type ToastInput = Omit<Toast, 'id' | 'tone' | 'duration'> &
  Partial<Pick<Toast, 'tone' | 'duration'>>;

export interface ToastContextValue {
  toasts: readonly Toast[];
  /** Queues a toast and returns its id, so a caller can dismiss it early. */
  show: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
}

export const DEFAULT_TOAST_DURATION = 5000;
