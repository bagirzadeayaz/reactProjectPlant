import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { CONTROL_BASE, CONTROL_HEIGHT, FieldShell, useFieldIds } from '../field';
import { Icon } from '../icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  label: ReactNode;
  options: readonly SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

/** A styled single-choice control backed by a real select for form compatibility. */
export const Select = ({
  label,
  options,
  placeholder,
  description,
  error,
  id,
  required = false,
  className,
  containerClassName,
  value,
  defaultValue,
  disabled = false,
  onChange,
  onBlur,
  name,
  ref,
  ...props
}: SelectProps) => {
  const ids = useFieldIds(description !== undefined, error, id);
  const rootRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(() =>
    String(defaultValue ?? (placeholder !== undefined ? '' : (options[0]?.value ?? ''))),
  );
  const currentValue = value === undefined ? internalValue : String(value);
  const selected = options.find((option) => option.value === currentValue);
  const listboxId = `${ids.inputId}-listbox`;
  const nativeId = `${ids.inputId}-native`;
  const accessibleLabel = typeof label === 'string' ? label : 'Select';

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [isOpen]);

  const assignNativeRef = (node: HTMLSelectElement | null): void => {
    nativeRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref !== null && ref !== undefined) ref.current = node;
  };

  const choose = (next: string): void => {
    const select = nativeRef.current;
    if (!select) return;
    setInternalValue(next);
    select.value = next;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const enabledOptions = options.filter((option) => option.disabled !== true);
  const moveSelection = (direction: 1 | -1): void => {
    if (enabledOptions.length === 0) return;
    const index = enabledOptions.findIndex((option) => option.value === currentValue);
    const nextIndex =
      index < 0 ? 0 : (index + direction + enabledOptions.length) % enabledOptions.length;
    choose(enabledOptions[nextIndex]?.value ?? '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(event.key === 'ArrowDown' ? 1 : -1);
    }
  };

  return (
    <FieldShell
      ids={{ ...ids, inputId: nativeId }}
      label={label}
      required={required}
      {...(description === undefined ? {} : { description })}
      {...(error === undefined ? {} : { error })}
      {...(containerClassName === undefined ? {} : { className: containerClassName })}
    >
      <div ref={rootRef} className="relative">
        <select
          ref={assignNativeRef}
          id={nativeId}
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          aria-label={accessibleLabel}
          aria-invalid={ids.hasError || undefined}
          {...(ids.describedBy === undefined ? {} : { 'aria-describedby': ids.describedBy })}
          className="sr-only"
          onChange={(event) => {
            setInternalValue(event.target.value);
            onChange?.(event);
          }}
          onBlur={onBlur}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled ?? false}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          ref={buttonRef}
          id={ids.inputId}
          type="button"
          role="combobox"
          aria-label={`${accessibleLabel}: ${selected?.label ?? placeholder ?? ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-invalid={ids.hasError || undefined}
          {...(ids.describedBy === undefined ? {} : { 'aria-describedby': ids.describedBy })}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onClick={() => {
            setIsOpen((open) => !open);
          }}
          className={cn(
            CONTROL_BASE,
            CONTROL_HEIGHT,
            'flex items-center justify-between gap-4 text-left transition-colors',
            isOpen && 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-surface-footer',
            className,
          )}
        >
          <span className={cn('truncate', selected === undefined && 'text-ink-muted')}>
            {selected?.label ?? placeholder ?? ''}
          </span>
          <Icon
            name="chevron"
            className={cn('shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={accessibleLabel}
            className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-control border border-border-glass bg-surface-footer p-2 shadow-2xl shadow-black/40"
          >
            {options.map((option) => {
              const isSelected = option.value === currentValue;
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled ?? false}
                    onClick={() => {
                      choose(option.value);
                    }}
                    className={cn(
                      'w-full rounded-[10px] px-4 py-3 text-left text-md text-ink transition-colors',
                      'hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      isSelected && 'bg-white/15 font-semibold',
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FieldShell>
  );
};
