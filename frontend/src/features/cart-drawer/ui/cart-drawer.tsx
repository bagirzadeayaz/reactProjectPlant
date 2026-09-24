import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { cartActions, cartSelectors, type CartState } from '../../../entities/cart';
import { useGetProductsQuery } from '../../../entities/product';
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
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const lines = useSelector((state: { cart: CartState }) => cartSelectors.selectLines(state));
  const count = useSelector((state: { cart: CartState }) => cartSelectors.selectCount(state));
  const { data } = useGetProductsQuery({ perPage: 50 }, { skip: !isOpen });
  const products = new Map((data?.items ?? []).map((product) => [product.id, product]));

  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = lines.reduce((total, line) => {
    const product = products.get(line.productId);
    return product ? total + product.price * line.quantity : total;
  }, 0);
  const currency = data?.items[0]?.currency ?? 'INR';

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
          'relative z-10 flex h-full w-full max-w-md flex-col bg-surface-footer p-6 shadow-float',
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
              {lines.map((line) => (
                <CartLine key={line.productId} line={line} product={products.get(line.productId)} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border-glass pt-4 text-md text-ink">
              <span>{t('cart.subtotal')}</span>
              <span className="tabular-nums">{format.currency(subtotal, currency)}</span>
            </div>
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
