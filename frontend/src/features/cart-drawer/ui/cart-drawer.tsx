import { useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { cartActions, cartSelectors, cartLineKey, type CartState } from '../../../entities/cart';
import {
  defaultVariant,
  resolvePurchase,
  useGetBasketProductsQuery,
} from '../../../entities/product';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { Button, EmptyState, Icon, useFocusTrap } from '../../../shared/ui';
import { CartLine } from './cart-line';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The cart, as a panel sliding in from the right.
 *
 * It is a modal dialog in every way that matters — focus trapped, Escape and
 * backdrop dismiss, focus returned on close — because while it is open the
 * page behind it is not meant to be used. Lines join the catalog cache for
 * names and prices; the cart stores only ids and quantities.
 */
export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const format = useFormatters(locale);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const lines = useSelector((state: { cart: CartState }) => cartSelectors.selectLines(state));
  const count = useSelector((state: { cart: CartState }) => cartSelectors.selectCount(state));
  const { data, isFetching, isError, refetch } = useGetBasketProductsQuery(
    lines.map((line) => line.productId),
    { skip: !isOpen },
  );
  const products = new Map((data ?? []).map((product) => [product.id, product]));
  useEffect(() => {
    for (const line of lines) {
      const product = data?.find((item) => item.id === line.productId);
      const initial = product ? defaultVariant(product) : undefined;
      if (!line.variantId && initial)
        dispatch(cartActions.legacyMapped({ productId: line.productId, variantId: initial.id }));
    }
  }, [dispatch, lines, data]);

  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = lines.reduce((total, line) => {
    const product = products.get(line.productId);
    const choice = resolvePurchase(product, line.variantId);
    return choice ? total + choice.price * line.quantity : total;
  }, 0);
  const currency = data?.[0]?.currency ?? 'AZN';

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div data-testid="cart-backdrop" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'cart-panel relative z-10 flex h-full w-full max-w-md flex-col bg-surface-footer p-6 shadow-float',
          'border-l-(length:--border-width-panel) border-border-glass focus-visible:outline-none',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-h2 font-(--font-weight-heading) text-ink">
            {t('cart.title')}{' '}
            <span className="text-md text-ink-muted">{t('cart.items', { count })}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cart.close')}
            className="rounded-icon p-2 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <EmptyState
            title={t('cart.empty')}
            description={t('cart.emptyHint')}
            action={
              <Button as="a" href="/catalog" size="sm" onClick={onClose}>
                {t('cart.browse')}
              </Button>
            }
          />
        ) : (
          <>
            <ul className="mt-4 flex-1 divide-y divide-border-glass overflow-y-auto">
              {isFetching ? (
                <li role="status" className="py-6">
                  {t('state.loading')}
                </li>
              ) : isError ? (
                <li className="py-6">
                  <p role="alert">{t('state.errorDetail')}</p>
                  <Button
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    {t('actions.retry')}
                  </Button>
                </li>
              ) : (
                lines.map((line) => (
                  <CartLine
                    key={cartLineKey(line)}
                    line={line}
                    product={products.get(line.productId)}
                    onNavigate={onClose}
                  />
                ))
              )}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border-glass pt-4 text-md text-ink">
              <span>{t('cart.subtotal')}</span>
              <span className="tabular-nums">
                {isFetching || isError ? '—' : format.currency(subtotal, currency)}
              </span>
            </div>
            <Button
              className="mt-4 shrink-0"
              onClick={() => {
                onClose();
                void navigate('/cart');
              }}
            >
              {t('checkout.reviewBasket')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 self-end"
              onClick={() => {
                dispatch(cartActions.cleared());
              }}
            >
              {t('cart.clear')}
            </Button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};
