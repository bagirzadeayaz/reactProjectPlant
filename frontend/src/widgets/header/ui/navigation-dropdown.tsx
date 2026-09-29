import { useEffect, useId, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export const NavigationDropdown = ({
  label,
  active,
  children,
  open,
  onOpenChange,
}: {
  label: string;
  active: boolean;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const close = () => {
    clearTimeout(timer.current);
    onOpenChange(false);
  };
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        onOpenChange(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
    };
  }, [open, onOpenChange]);
  return (
    <div
      ref={root}
      className="navigation-dropdown"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          clearTimeout(timer.current);
          onOpenChange(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') timer.current = setTimeout(close, 180);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={`site-nav-link navigation-dropdown__trigger${active ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          clearTimeout(timer.current);
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            clearTimeout(timer.current);
            onOpenChange(true);
            requestAnimationFrame(() => {
              root.current?.querySelector('a')?.focus();
            });
          }
        }}
      >
        {label}
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div id={id} hidden={!open} className="navigation-dropdown__content">
        {children}
      </div>
    </div>
  );
};
