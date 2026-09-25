import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { cartActions } from '../../../entities/cart';
import type { Product } from '../../../entities/product';
import { useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { Button, Icon, useToast } from '../../../shared/ui';

export interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  /** `icon` is the 57px square bag (node 22:100); `label` is the full "Buy Now" (22:70). */
  variant?: 'icon' | 'label';
  className?: string;
}

/**
 * Puts a product in the cart and says so.
 *
 * The cart stores the id and a quantity — never the product — so the price it
 * shows later comes from the same cache as everything else.
 */
export const AddToCartButton = ({
  product,
  quantity = 1,
  variant = 'icon',
  className,
}: AddToCartButtonProps) => {
  const { t } = useTranslation(['common', 'product']);
  const { localized } = useLocale();
  const dispatch = useDispatch();
  const { show } = useToast();

  const add = (): void => {
    dispatch(cartActions.added({ productId: product.id, quantity }));
    show({ message: t('product:addedToCart', { name: localized(product.name) }), tone: 'success' });
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={add}
        disabled={!product.inStock}
        aria-label={t('common:actions.addToCart')}
        className={cn(
          'flex size-(--size-icon-button) shrink-0 items-center justify-center rounded-icon',
          'border-(length:--border-width-control) border-border-control text-ink-muted',
          'transition-colors hover:border-ink hover:text-ink',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <Icon name="bag" size="lg" />
      </button>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={add}
      disabled={!product.inStock}
      {...(className === undefined ? {} : { className })}
    >
      {t('common:actions.buyNow')}
    </Button>
  );
};
