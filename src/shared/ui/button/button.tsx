import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from '../spinner';
import {
  BUTTON_BASE,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonSize,
  type ButtonVariant,
} from './variants';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Swaps the content for a spinner and blocks interaction. */
  isLoading?: boolean;
  /** Announced while `isLoading`. Supplied by the caller so it can be translated. */
  loadingLabel?: string;
  /** Trailing affordance. Pair with the `primary-with-icon` variant. */
  icon?: ReactNode;
  children: ReactNode;
}

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps | 'ref'> & {
    as?: 'button';
    ref?: Ref<HTMLButtonElement>;
  };

type ButtonAsAnchor = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ButtonOwnProps | 'ref'> & {
    as: 'a';
    ref?: Ref<HTMLAnchorElement>;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * The primitive action control.
 *
 * Renders a `<button>` by default, or an `<a>` when `as="a"` — a link that
 * looks like a button must still be a link, so it keeps middle-click, "open in
 * new tab" and the correct role.
 *
 * While `isLoading`, the label is replaced by a spinner and the control is
 * disabled. An anchor cannot be `disabled`, so it gets `aria-disabled` and
 * loses its href instead.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingLabel,
  icon,
  children,
  className,
  ...rest
}: ButtonProps) => {
  const classes = cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
  const content = isLoading ? (
    <Spinner {...(loadingLabel === undefined ? {} : { label: loadingLabel })} />
  ) : (
    children
  );

  if (rest.as === 'a') {
    const { as: _as, href, ref, ...anchorProps } = rest;
    return (
      <a
        {...anchorProps}
        ref={ref}
        {...(isLoading || href === undefined ? {} : { href })}
        aria-disabled={isLoading || undefined}
        aria-busy={isLoading || undefined}
        className={classes}
      >
        {content}
        {icon}
      </a>
    );
  }

  const { as: _as, ref, disabled, type, ...buttonProps } = rest;
  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={classes}
    >
      {content}
      {icon}
    </button>
  );
};
