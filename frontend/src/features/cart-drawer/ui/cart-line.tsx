import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { cartActions, type CartLine as CartLineModel } from '../../../entities/cart';
import type { Product } from '../../../entities/product';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { Icon } from '../../../shared/ui';

export interface CartLineProps {
  line: CartLineModel;
  /** Undefined when the product has since been deleted from the catalog. */
  product: Product | undefined;
}

const stepClass = cn(
  'flex size-8 items-center justify-center rounded-icon border-(length:--border-width-control)',
  'border-border-control text-ink-muted transition-colors hover:border-ink hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
);

/**
 * One row of the cart. Quantity is a labelled spinbutton pair; the product's
 * name and price come from the catalog cache, never from the cart itself.
 */
export const CartLine = ({ line, product }: CartLineProps) => {
  const { t } = useTranslation(['common', 'product']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const dispatch = useDispatch();
  const name = product ? localized(product.name) : t('common:cart.unavailable');

  const setQuantity = (quantity: number): void => {
    dispatch(cartActions.quantitySet({ productId: line.productId, quantity }));
  };

  return (
    <li className="flex items-center gap-4 py-4">
      {product && (
        <img
          src={product.imageUrl}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          className="size-16 shrink-0 rounded-icon bg-surface-glass object-contain"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {product ? (
          <Link
            to={`/catalog/${product.slug}`}
            className="truncate text-md text-ink hover:underline"
          >
            {name}
          </Link>
        ) : (
          <span className="text-md text-ink-muted">{name}</span>
        )}
        {product && (
          <span className="text-sm text-ink-muted">
            {format.currency(product.price * line.quantity, product.currency)}
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label={t('common:cart.quantityFor', { name })}
        className="flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => {
            setQuantity(line.quantity - 1);
          }}
          aria-label={t('product:decrease')}
          className={stepClass}
        >
          −
        </button>
        <span className="min-w-6 text-center tabular-nums text-ink">{line.quantity}</span>
        <button
          type="button"
          onClick={() => {
            setQuantity(line.quantity + 1);
          }}
          aria-label={t('product:increase')}
          className={stepClass}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          dispatch(cartActions.removed(line.productId));
        }}
        aria-label={t('common:cart.remove', { name })}
        className="rounded-icon p-1 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Icon name="close" />
      </button>
    </li>
  );
};
