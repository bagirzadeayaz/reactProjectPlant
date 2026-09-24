import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import { useFocusTrap } from './use-focus-trap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. Caller-supplied so it can be translated. */
  title: ReactNode;
  /** Accessible name for the close control. Caller-supplied so it can be translated. */
  closeLabel: string;
  children: ReactNode;
  /** Footer row, usually actions. */
  footer?: ReactNode;
  className?: string;
}

/**
 * A dialog that takes over the page until it is dismissed.
 *
 * Focus moves in on open and returns to the trigger on close; Tab cycles
 * inside; Escape and a backdrop click both dismiss. The dialog is labelled by
 * its own title, so assistive tech announces what opened.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  className,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter">
      <div
        data-testid="modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-panel"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex w-full max-w-(--size-column) flex-col gap-6 rounded-control',
          'border-(length:--border-width-panel) border-border-glass bg-surface-footer p-8',
          'focus-visible:outline-none',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-h2 font-(--font-weight-heading) text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={cn(
              'rounded-icon p-2 text-ink-muted transition-colors hover:text-ink',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
            )}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="text-md text-ink-muted">{children}</div>

        {footer !== undefined && <div className="flex justify-end gap-gutter">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
