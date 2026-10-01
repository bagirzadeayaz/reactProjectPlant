import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartActions, type CartState } from '../../../entities/cart';
import { defaultVariant, resolvePurchase, type Product } from '../../../entities/product';
import { useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { Button, Icon, useToast } from '../../../shared/ui';

export interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variantId?: string;
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
  variantId,
}: AddToCartButtonProps) => {
  const { t } = useTranslation(['common', 'product']);
  const { localized } = useLocale();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { show } = useToast();
  const choice = resolvePurchase(product, variantId);
  const inBasket = useSelector((state: { cart: CartState }) =>
    state.cart.lines
      .filter(
        (line) =>
          line.productId === product.id &&
          (line.variantId === choice?.variant?.id ||
            (!line.variantId && choice?.variant?.id === defaultVariant(product)?.id)),
      )
      .reduce((sum, line) => sum + line.quantity, 0),
  );
  const needsSelection = (product.variants?.length ?? 0) > 1 && !variantId;
  const available =
    choice?.inStock === true && (needsSelection || inBasket + quantity <= choice.stock);

  const add = (): void => {
    if (!available) return;
    if (needsSelection) {
      void navigate(`/catalog/${product.slug}`);
      return;
    }
    const initial = defaultVariant(product);
    if (initial)
      dispatch(cartActions.legacyMapped({ productId: product.id, variantId: initial.id }));
    dispatch(
      cartActions.added({
        productId: product.id,
        quantity,
        max: choice.stock,
        ...(choice.variant ? { variantId: choice.variant.id } : {}),
      }),
    );
    show({ message: t('product:addedToCart', { name: localized(product.name) }), tone: 'success' });
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={add}
        disabled={!available}
        aria-label={t(needsSelection ? 'product:options.choose' : 'common:actions.addToCart')}
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
      onClick={() => {
        add();
        if (!needsSelection && available) void navigate('/cart');
      }}
      disabled={!available}
      {...(className === undefined ? {} : { className })}
    >
      {needsSelection
        ? t('product:options.choose')
        : !choice?.inStock
          ? t('product:outOfStock')
          : !available
            ? t('product:options.inBasket')
            : t('common:actions.buyNow')}
    </Button>
  );
};
