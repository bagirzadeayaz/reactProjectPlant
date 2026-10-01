import { ProductTools } from '../../features/garden-tools';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions, type CartState } from '../../entities/cart';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../entities/category';
import {
  ProductCard,
  ProductCare,
  ProductOptions,
  DeliveryInfo,
  defaultVariant,
  resolvePurchase,
  useGetProductBySlugQuery,
  useGetProductsQuery,
} from '../../entities/product';
import { AddToCartButton } from '../../features/add-to-cart';
import { useFormatters, useLocale } from '../../shared/i18n';
import { Button, Container, StatusPage, Skeleton } from '../../shared/ui';
import { NotFound } from '../../widgets/not-found';
import { ProductGallery } from './product-gallery';
import { QuantityStepper } from './quantity-stepper';

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  ((error as { status?: unknown }).status === 404 ||
    (error as { error?: unknown }).error === 'Product not found');

/** The dynamic route: `/catalog/:slug`. */
export const ProductPage = () => {
  const { t } = useTranslation(['product', 'common']);
  const { slug = '' } = useParams();
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState({ productId: '', variantId: '' });
  const dispatch = useDispatch();
  const cart = useSelector((state: { cart: CartState }) => state.cart);

  const product = useGetProductBySlugQuery(slug);
  const categories = useGetCategoriesQuery(undefined);
  const related = useGetProductsQuery(
    { category: product.data?.category ?? '', perPage: 4 },
    { skip: !product.data },
  );

  if (product.isError && isNotFound(product.error)) return <NotFound />;

  if (product.isError) {
    return (
      <>
        <DocumentMeta
          title={`${t('common:state.error')} · ${t('common:meta.siteName')}`}
          robots="noindex"
        />
        <StatusPage
          code="500"
          role="alert"
          title={t('common:state.error')}
          description={t('common:state.errorDetail')}
        />
      </>
    );
  }

  if (!product.data) {
    return (
      <Container className="grid gap-12 py-16 lg:grid-cols-2">
        <h1 className="sr-only">{t('common:pages.product')}</h1>
        <Skeleton className="aspect-square w-full rounded-card" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-(--size-control-h) w-1/2" />
        </div>
      </Container>
    );
  }

  const item = product.data;
  const selected =
    (selection.productId === item.id
      ? item.variants?.find((variant) => variant.id === selection.variantId)
      : undefined) ?? defaultVariant(item);
  const purchase = resolvePurchase(item, selected?.id);
  const available = purchase?.inStock === true;
  const inBasket = cart.lines
    .filter(
      (line) =>
        line.productId === item.id &&
        (line.variantId === selected?.id ||
          (!line.variantId && selected?.id === defaultVariant(item)?.id)),
    )
    .reduce((sum, line) => sum + line.quantity, 0);
  const remaining = Math.max(0, (purchase?.stock ?? 99) - inBasket);
  const selectedQuantity = Math.min(quantity, Math.max(1, remaining));
  const name = localized(item.name);
  const description = localized(item.description);
  const category = categories.data?.find((entry) => entry.slug === item.category);
  const others = (related.data?.items ?? []).filter((entry) => entry.id !== item.id).slice(0, 3);

  return (
    <Container as="article" className="py-12 sm:py-16">
      <DocumentMeta
        title={`${name} · ${t('common:meta.siteName')}`}
        description={t('product:metaDescription', { name, description })}
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <ProductGallery
          key={`${item.id}:${selected?.id ?? ''}`}
          product={item}
          name={name}
          {...(purchase ? { selectedImage: purchase.imageUrl } : {})}
        />

        <div className="flex flex-col gap-6">
          <div className="product-summary-meta">
            {category && <p className="text-md text-ink-muted">{localized(category.label)}</p>}
            <ProductTools product={item} />
          </div>
          <h1 className="text-h1 font-(--font-weight-heading) text-ink">{name}</h1>
          <p className="text-h2 text-ink-muted" aria-live="polite">
            {format.currency(purchase?.price ?? item.price, item.currency)}
          </p>
          <div className="product-availability" data-available={available} role="status">
            <p className="product-availability__label">
              <span className="product-availability__dot" aria-hidden="true" />
              {available ? t('product:inStock') : t('product:outOfStock')}
            </p>
            {!available && (
              <p className="mt-2 text-sm text-ink-muted">{t('product:outOfStockHint')}</p>
            )}
          </div>
          {selected && item.variants && (
            <ProductOptions
              variants={item.variants}
              selected={selected}
              onChange={(variant) => {
                setSelection({ productId: item.id, variantId: variant.id });
                setQuantity(1);
              }}
            />
          )}

          <section aria-labelledby="product-description">
            <h2 id="product-description" className="text-lg text-ink">
              {t('product:description')}
            </h2>
            <p className="mt-2 max-w-prose text-md text-ink-muted">{description}</p>
          </section>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <QuantityStepper
              value={selectedQuantity}
              max={Math.max(1, remaining)}
              onChange={setQuantity}
              disabled={!available || remaining === 0}
            />
            <AddToCartButton
              product={item}
              quantity={selectedQuantity}
              variant="label"
              {...(selected ? { variantId: selected.id } : {})}
            />
            <Button as="a" href="/cart" variant="ghost">
              {t('common:checkout.reviewBasket')}
            </Button>
          </div>
          <DeliveryInfo
            {...(item.delivery ? { delivery: item.delivery } : {})}
            area={cart.area ?? 'baku'}
            onAreaChange={(area) => {
              dispatch(cartActions.areaSet(area));
            }}
            subtotal={(purchase?.price ?? item.price) * selectedQuantity}
          />
        </div>
      </div>

      {item.care && <ProductCare care={item.care} />}

      {others.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 lg:mt-24">
          <h2 id="related-heading" className="text-h2 font-(--font-weight-heading) text-ink">
            {t('product:related')}
          </h2>
          <ul className="home-product-grid">
            {others.map((entry) => (
              <li key={entry.id} className="h-full">
                <ProductCard
                  product={entry}
                  tools={<ProductTools product={entry} />}
                  action={<AddToCartButton product={entry} />}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
};
