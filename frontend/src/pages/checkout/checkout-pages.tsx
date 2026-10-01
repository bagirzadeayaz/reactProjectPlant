import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cartActions, cartSelectors, cartLineKey, type CartState } from '../../entities/cart';
import {
  DeliveryInfo,
  defaultVariant,
  resolvePurchase,
  useGetBasketProductsQuery,
} from '../../entities/product';
import { DEFAULT_DELIVERY, DELIVERY_AREAS, deliveryQuote } from '../../shared/commerce';
import { CartLine } from '../../features/cart-drawer';
import { Button, Container, EmptyState, ErrorState, Input } from '../../shared/ui';
import { useFormatters, useLocale } from '../../shared/i18n';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { readReceipt, saveReceipt } from './receipt';

const useBasket = () => {
  const cart = useSelector((state: { cart: CartState }) => state.cart);
  const dispatch = useDispatch();
  const lines = cartSelectors.selectLines({ cart });
  const area = cart.area ?? 'baku';
  const query = useGetBasketProductsQuery(
    lines.map((line) => line.productId),
    { refetchOnMountOrArgChange: true },
  );
  const products = new Map((query.currentData ?? []).map((product) => [product.id, product]));
  useEffect(() => {
    for (const line of lines) {
      const product = query.currentData?.find((item) => item.id === line.productId);
      const initial = product ? defaultVariant(product) : undefined;
      if (!line.variantId && initial)
        dispatch(cartActions.legacyMapped({ productId: line.productId, variantId: initial.id }));
    }
  }, [dispatch, lines, query.currentData]);
  const total = lines.reduce(
    (sum, line) =>
      sum +
      (resolvePurchase(products.get(line.productId), line.variantId)?.price ?? 0) * line.quantity,
    0,
  );
  const unavailable = lines.some((line) => {
    const choice = resolvePurchase(products.get(line.productId), line.variantId);
    return !choice?.inStock || line.quantity > choice.stock;
  });
  const deliveryPolicy = {
    areas: DELIVERY_AREAS.filter((location) =>
      lines.every((line) =>
        (products.get(line.productId)?.delivery ?? DEFAULT_DELIVERY).areas.includes(location),
      ),
    ),
    dispatchDays: Math.max(
      0,
      ...lines.map((line) => products.get(line.productId)?.delivery?.dispatchDays ?? 0),
    ),
  };
  const shipping = deliveryQuote(area, total, deliveryPolicy.dispatchDays);
  return { lines, query, products, total, unavailable, area, deliveryPolicy, shipping };
};

const CheckoutHeading = ({ title, step }: { title: string; step: number }) => {
  const { t } = useTranslation(['common', 'garden', 'product']);
  return (
    <>
      <DocumentMeta title={`${title} · Planto.`} description={t('checkout.notice')} />
      <p className="checkout-eyebrow">{t('checkout.eyebrow')}</p>
      <h1 className="text-h1 font-semibold">{title}</h1>
      <ol className="checkout-steps" aria-label={t('checkout.progress')}>
        {(['basket', 'details', 'confirmation'] as const).map((key, index) => (
          <li key={key} aria-current={step === index ? 'step' : undefined}>
            <span>{index + 1}</span>
            {t(`checkout.${key}`)}
          </li>
        ))}
      </ol>
      <p className="checkout-notice">{t('checkout.notice')}</p>
    </>
  );
};

const EmptyBasket = () => {
  const { t } = useTranslation(['common', 'garden', 'product']);
  return (
    <EmptyState
      title={t('cart.empty')}
      description={t('cart.emptyHint')}
      action={
        <Button as="a" href="/catalog">
          {t('cart.browse')}
        </Button>
      }
    />
  );
};

export const BasketPage = () => {
  const { t } = useTranslation(['common', 'garden', 'product']);
  const { locale } = useLocale();
  const format = useFormatters(locale);
  const { lines, query, products, total, unavailable, area, deliveryPolicy, shipping } =
    useBasket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <Container as="section" className="checkout-page">
      <CheckoutHeading title={t('checkout.reviewBasket')} step={0} />
      {lines.length === 0 ? (
        <EmptyBasket />
      ) : query.isError ? (
        <ErrorState
          title={t('state.error')}
          description={t('state.errorDetail')}
          action={
            <Button
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('actions.retry')}
            </Button>
          }
        />
      ) : query.isFetching && !query.currentData ? (
        <p role="status" className="py-12">
          {t('state.loading')}
        </p>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-panel">
            <ul>
              {lines.map((line) => (
                <CartLine
                  key={cartLineKey(line)}
                  line={line}
                  product={products.get(line.productId)}
                />
              ))}
            </ul>
            <Link className="checkout-link" to="/catalog">
              {t('checkout.continueShopping')}
            </Link>
          </div>
          <aside className="checkout-panel checkout-summary">
            <h2>{t('checkout.summary')}</h2>
            <div className="checkout-total">
              <span>{t('cart.subtotal')}</span>
              <strong>{format.currency(total, 'AZN')}</strong>
            </div>
            <DeliveryInfo
              delivery={deliveryPolicy}
              area={area}
              subtotal={total}
              onAreaChange={(next) => {
                dispatch(cartActions.areaSet(next));
              }}
            />
            {deliveryPolicy.areas.includes(area) && (
              <div className="checkout-total">
                <span>{t('checkout.estimatedTotal')}</span>
                <strong>{format.currency(total + shipping.fee, 'AZN')}</strong>
              </div>
            )}
            <p>{t('checkout.deliveryNote')}</p>
            {unavailable && <p role="alert">{t('checkout.unavailable')}</p>}
            <Button
              disabled={unavailable}
              onClick={() => {
                void navigate('/checkout');
              }}
            >
              {t('checkout.proceed')}
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
};

export const CheckoutPage = () => {
  const { t } = useTranslation(['common', 'garden', 'product']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const { lines, query, products, total, unavailable, area, deliveryPolicy, shipping } =
    useBasket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submitted = useRef(false);
  const [review, setReview] = useState(false);
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const shippingFee = delivery === 'pickup' ? 0 : shipping.fee;
  const grandTotal = total + shippingFee;
  const deliveryUnavailable = delivery === 'delivery' && !deliveryPolicy.areas.includes(area);
  const [details, setDetails] = useState({ name: '', email: '', address: '' });
  const [error, setError] = useState(false);
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const confirm = async (): Promise<void> => {
    if (submitted.current) return;
    submitted.current = true;
    setError(false);
    const fresh = await query.refetch();
    const current = fresh.data;
    if (
      fresh.isError ||
      !current ||
      lines.some((line) => {
        const product = current.find((item) => item.id === line.productId);
        const choice = resolvePurchase(product, line.variantId);
        const previous = resolvePurchase(products.get(line.productId), line.variantId);
        return (
          !choice?.inStock ||
          line.quantity > choice.stock ||
          choice.price !== previous?.price ||
          choice.variant?.size !== previous.variant?.size ||
          choice.variant?.pot !== previous.variant?.pot ||
          (delivery === 'delivery' && !(product?.delivery ?? DEFAULT_DELIVERY).areas.includes(area))
        );
      })
    ) {
      submitted.current = false;
      setError(true);
      return;
    }
    saveReceipt({
      reference: `PLANTO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      total: grandTotal,
      subtotal: total,
      shippingFee,
      ...(delivery === 'delivery' ? { area } : {}),
      items: lines.flatMap((line) => {
        const product = current.find((item) => item.id === line.productId);
        const choice = resolvePurchase(product, line.variantId);
        return product && choice
          ? [
              {
                name: product.name,
                quantity: line.quantity,
                unitPrice: choice.price,
                ...(choice.variant
                  ? {
                      size: choice.variant.size,
                      pot: choice.variant.pot,
                      heightCm: choice.variant.heightCm,
                    }
                  : {}),
              },
            ]
          : [];
      }),
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      delivery,
    });
    dispatch(cartActions.cleared());
    void navigate('/checkout/confirmation', { replace: true });
  };
  return (
    <Container as="section" className="checkout-page">
      <CheckoutHeading title={t(review ? 'checkout.reviewOrder' : 'checkout.details')} step={1} />
      {lines.length === 0 ? (
        <EmptyBasket />
      ) : query.isError ? (
        <ErrorState
          title={t('state.error')}
          description={t('state.errorDetail')}
          action={
            <Button
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('actions.retry')}
            </Button>
          }
        />
      ) : !query.currentData ? (
        <p role="status" className="py-12">
          {t('state.loading')}
        </p>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-panel">
            {review ? (
              <div className="checkout-review">
                <h2 ref={reviewRef} tabIndex={-1}>
                  {t('checkout.checkDetails')}
                </h2>
                <dl>
                  <dt>{t('checkout.name')}</dt>
                  <dd>{details.name}</dd>
                  <dt>{t('checkout.email')}</dt>
                  <dd>{details.email}</dd>
                  <dt>{t('checkout.method')}</dt>
                  <dd>{t(`checkout.${delivery}`)}</dd>
                  {delivery === 'delivery' && (
                    <>
                      <dt>{t('product:delivery.area')}</dt>
                      <dd>{t(`product:delivery.areas.${area}`)}</dd>
                    </>
                  )}
                  {delivery === 'delivery' && (
                    <>
                      <dt>{t('checkout.address')}</dt>
                      <dd>{details.address}</dd>
                    </>
                  )}
                </dl>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReview(false);
                  }}
                >
                  {t('checkout.editDetails')}
                </Button>
                {error && <p role="alert">{t('checkout.changed')}</p>}
                <Button
                  disabled={unavailable || deliveryUnavailable || query.isFetching}
                  onClick={() => {
                    void confirm();
                  }}
                >
                  {t('checkout.confirmBasket')}
                </Button>
              </div>
            ) : (
              <form
                className="checkout-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setReview(true);
                  requestAnimationFrame(() => {
                    reviewRef.current?.focus();
                  });
                }}
              >
                <h2>{t('checkout.yourDetails')}</h2>
                <p>{t('checkout.detailsHint')}</p>
                <Input
                  label={t('checkout.name')}
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={details.name}
                  pattern=".*\S.*"
                  onChange={(event) => {
                    setDetails({ ...details, name: event.target.value });
                  }}
                />
                <Input
                  label={t('checkout.email')}
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  value={details.email}
                  onChange={(event) => {
                    setDetails({ ...details, email: event.target.value });
                  }}
                />
                <fieldset>
                  <legend>{t('checkout.method')}</legend>
                  {(['delivery', 'pickup'] as const).map((method) => (
                    <label className="delivery-option" key={method}>
                      <input
                        type="radio"
                        name="delivery"
                        value={method}
                        checked={delivery === method}
                        onChange={() => {
                          setDelivery(method);
                        }}
                      />
                      {t(`checkout.${method}`)}
                    </label>
                  ))}
                </fieldset>
                {delivery === 'delivery' && (
                  <DeliveryInfo
                    delivery={deliveryPolicy}
                    area={area}
                    subtotal={total}
                    onAreaChange={(next) => {
                      dispatch(cartActions.areaSet(next));
                    }}
                  />
                )}
                {delivery === 'delivery' && (
                  <Input
                    label={t('checkout.address')}
                    required
                    maxLength={250}
                    autoComplete="street-address"
                    pattern=".*\S.*"
                    value={details.address}
                    onChange={(event) => {
                      setDetails({ ...details, address: event.target.value });
                    }}
                  />
                )}
                <Button
                  type="submit"
                  disabled={unavailable || deliveryUnavailable || query.isFetching}
                >
                  {t('checkout.reviewOrder')}
                </Button>
              </form>
            )}
          </div>
          <aside className="checkout-panel checkout-summary">
            <h2>{t('checkout.summary')}</h2>
            <ul className="checkout-items">
              {lines.map((line) => {
                const product = products.get(line.productId);
                const choice = resolvePurchase(product, line.variantId);
                return (
                  <li key={cartLineKey(line)}>
                    <span>
                      {product ? localized(product.name) : t('cart.unavailable')} × {line.quantity}
                      {choice?.variant && (
                        <small className="checkout-item-option">
                          {t(`product:options.sizes.${choice.variant.size}`)} ·{' '}
                          {t('product:options.height', { height: choice.variant.heightCm })} ·{' '}
                          {t(`product:options.pots.${choice.variant.pot}`)}
                        </small>
                      )}
                    </span>
                    <strong>{format.currency((choice?.price ?? 0) * line.quantity, 'AZN')}</strong>
                  </li>
                );
              })}
            </ul>
            <div className="checkout-cost-row">
              <span>{t('cart.subtotal')}</span>
              <strong>{format.currency(total, 'AZN')}</strong>
            </div>
            <div className="checkout-cost-row">
              <span>{t('product:delivery.fee')}</span>
              <strong>
                {shippingFee === 0
                  ? t('product:delivery.free')
                  : format.currency(shippingFee, 'AZN')}
              </strong>
            </div>
            <div className="checkout-total">
              <span>{t('checkout.total')}</span>
              <strong>{format.currency(grandTotal, 'AZN')}</strong>
            </div>
            {deliveryUnavailable && <p role="alert">{t('product:delivery.notAvailable')}</p>}
            {unavailable && <p role="alert">{t('checkout.unavailable')}</p>}
            <Link className="checkout-link" to="/cart">
              {t('checkout.editBasket')}
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
};

export const ConfirmationPage = () => {
  const { t } = useTranslation(['common', 'garden', 'product']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const [receipt] = useState(readReceipt);
  return (
    <Container as="section" className="checkout-page">
      <CheckoutHeading
        title={t(receipt ? 'checkout.confirmed' : 'checkout.noConfirmation')}
        step={2}
      />
      <div className="checkout-panel confirmation-panel">
        <h2>{t(receipt ? 'checkout.complete' : 'checkout.startBasket')}</h2>
        <p>{t('checkout.notice')}</p>
        {receipt && (
          <dl>
            <dt>{t('checkout.reference')}</dt>
            <dd>{receipt.reference}</dd>
            <dt>{t('cart.title')}</dt>
            <dd>{t('cart.items', { count: receipt.count })}</dd>
            <dt>{t('checkout.total')}</dt>
            <dd>{format.currency(receipt.total, 'AZN')}</dd>
            <dt>{t('checkout.method')}</dt>
            <dd>{t(`checkout.${receipt.delivery}`)}</dd>
            {receipt.area && (
              <>
                <dt>{t('product:delivery.area')}</dt>
                <dd>{t(`product:delivery.areas.${receipt.area}`)}</dd>
              </>
            )}
            {receipt.shippingFee !== undefined && (
              <>
                <dt>{t('product:delivery.fee')}</dt>
                <dd>{format.currency(receipt.shippingFee, 'AZN')}</dd>
              </>
            )}
          </dl>
        )}
        {receipt?.items && (
          <ul className="checkout-items confirmation-items">
            {receipt.items.map((item, index) => (
              <li key={index}>
                <span>
                  {localized(item.name)} × {item.quantity}
                  {item.size && item.pot && (
                    <small className="checkout-item-option">
                      {t(`product:options.sizes.${item.size}`)} ·{' '}
                      {t('product:options.height', { height: item.heightCm })} ·{' '}
                      {t(`product:options.pots.${item.pot}`)}
                    </small>
                  )}
                </span>
                <strong>{format.currency(item.unitPrice * item.quantity, 'AZN')}</strong>
              </li>
            ))}
          </ul>
        )}
        {receipt && (
          <Button as="a" href="/tracking">
            {t('garden:trackBasket')}
          </Button>
        )}
        <Button as="a" href="/catalog">
          {t('checkout.continueShopping')}
        </Button>
      </div>
    </Container>
  );
};
