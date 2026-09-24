import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { cn } from '../../../shared/lib/cn';
import { Icon } from '../../../shared/ui';
import { cartSelectors, type CartState } from '../model/cart-slice';

export interface CartBadgeProps {
  onClick: () => void;
  className?: string;
}

/**
 * The bag icon in the header (node 22:14) with a count.
 *
 * The count is part of the accessible name — "Cart, 3 items" — rather than a
 * separate badge a screen reader would read as a bare number.
 */
export const CartBadge = ({ onClick, className }: CartBadgeProps) => {
  const { t } = useTranslation();
  const count = useSelector((state: { cart: CartState }) => cartSelectors.selectCount(state));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('a11y.cartWithCount', { count })}
      className={cn(
        'relative rounded-icon p-1 text-ink-muted transition-colors hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
        className,
      )}
    >
      <Icon name="bag" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-avatar bg-ink px-1 text-xs font-(--font-weight-heading) text-surface-footer"
        >
          {count}
        </span>
      )}
    </button>
  );
};
