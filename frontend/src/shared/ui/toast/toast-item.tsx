import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import type { Toast, ToastTone } from './types';

const TONES: Record<ToastTone, string> = {
  info: 'border-border-glass',
  success: 'border-border-control',
  error: 'border-ink',
};

export interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  /** Accessible name for the dismiss control. Caller-supplied so it can be translated. */
  dismissLabel: string;
}

/**
 * One message in the toast stack.
 *
 * An error interrupts (`role="alert"`); anything else waits its turn
 * (`role="status"`), so routine confirmations do not talk over the user.
 */
export const ToastItem = ({ toast, onDismiss, dismissLabel }: ToastItemProps) => (
  <div
    role={toast.tone === 'error' ? 'alert' : 'status'}
    className={cn(
      'pointer-events-auto flex items-start gap-4 rounded-control border-(length:--border-width-control)',
      'bg-surface-footer px-5 py-4 text-md text-ink shadow-float',
      TONES[toast.tone],
    )}
  >
    <p className="flex-1">{toast.message}</p>
    <button
      type="button"
      aria-label={dismissLabel}
      onClick={() => {
        onDismiss(toast.id);
      }}
      className={cn(
        'rounded-icon p-1 text-ink-muted transition-colors hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
      )}
    >
      <Icon name="close" />
    </button>
  </div>
);
