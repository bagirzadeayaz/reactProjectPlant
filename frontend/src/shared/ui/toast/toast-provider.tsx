import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toast-context';
import { ToastItem } from './toast-item';
import { DEFAULT_TOAST_DURATION, type Toast, type ToastInput } from './types';

export interface ToastProviderProps {
  children: ReactNode;
  /** Accessible name for the toast region. Caller-supplied so it can be translated. */
  regionLabel: string;
  /** Accessible name for each dismiss control. Caller-supplied so it can be translated. */
  dismissLabel: string;
}

/**
 * Owns the toast queue and renders the stack.
 *
 * The viewport is a labelled region pinned to the corner. It is keyboard
 * reachable and Escape dismisses everything in it, so a keyboard user is never
 * stuck waiting out a timer.
 */
export const ToastProvider = ({ children, regionLabel, dismissLabel }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const dismiss = useCallback((id: string): void => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ message, tone = 'info', duration = DEFAULT_TOAST_DURATION }: ToastInput): string => {
      nextId.current += 1;
      const id = `toast-${String(nextId.current)}`;
      setToasts((current) => [...current, { id, message, tone, duration }]);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => {
            dismiss(id);
          }, duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        // A region is a container, not a control; tabIndex={-1} only makes it
        // programmatically focusable so Escape has somewhere to land.
        role="region"
        aria-label={regionLabel}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            toasts.forEach((toast) => {
              dismiss(toast.id);
            });
          }
        }}
        className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} dismissLabel={dismissLabel} />
        ))}
      </div>
    </ToastContext>
  );
};
