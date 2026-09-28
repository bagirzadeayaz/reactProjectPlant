import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cartActions, cartSelectors, type CartState } from '../../entities/cart';
import { useGetBasketProductsQuery } from '../../entities/product';
import { CartLine } from '../../features/cart-drawer';
import { Button, Container, EmptyState, ErrorState, Input } from '../../shared/ui';
import { useFormatters, useLocale } from '../../shared/i18n';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { readReceipt, saveReceipt } from './receipt';

const useBasket = () => {
  const lines = useSelector((state: { cart: CartState }) => cartSelectors.selectLines(state));
  const query = useGetBasketProductsQuery(
    lines.map((line) => line.productId),
    { refetchOnMountOrArgChange: true },
  );
  const products = new Map((query.currentData ?? []).map((product) => [product.id, product]));
  const total = lines.reduce(
    (sum, line) => sum + (products.get(line.productId)?.price ?? 0) * line.quantity,
    0,
  );
  const unavailable = lines.some((line) => !products.get(line.productId)?.inStock);
  return { lines, query, products, total, unavailable };
};

const CheckoutHeading = ({ title, step }: { title: string; step: number }) => {
  const { t } = useTranslation(['common', 'garden']);
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
  const { t } = useTranslation(['common', 'garden']);
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
  const { t } = useTranslation(['common', 'garden']);
  const { locale } = useLocale();
  const format = useFormatters(locale);
  const { lines, query, products, total, unavailable } = useBasket();
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
                <CartLine key={line.productId} line={line} product={products.get(line.productId)} />
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
  const { t } = useTranslation(['common', 'garden']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const { lines, query, products, total, unavailable } = useBasket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submitted = useRef(false);
  const [review, setReview] = useState(false);
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery');
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
        return !product?.inStock || product.price !== products.get(line.productId)?.price;
      })
    ) {
      submitted.current = false;
      setError(true);
      return;
    }
    saveReceipt({
      reference: `PLANTO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      total,
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
                  disabled={unavailable || query.isFetching}
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
                <Button type="submit" disabled={unavailable || query.isFetching}>
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
                return (
                  <li key={line.productId}>
                    <span>
                      {product ? localized(product.name) : t('cart.unavailable')} × {line.quantity}
                    </span>
                    <strong>{format.currency((product?.price ?? 0) * line.quantity, 'AZN')}</strong>
                  </li>
                );
              })}
            </ul>
            <div className="checkout-total">
              <span>{t('checkout.total')}</span>
              <strong>{format.currency(total, 'AZN')}</strong>
            </div>
            <p>{t('checkout.deliveryNote')}</p>
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
  const { t } = useTranslation(['common', 'garden']);
  const { locale } = useLocale();
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
          </dl>
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
