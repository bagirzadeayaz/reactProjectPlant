import { useState } from 'react';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../entities/category';
import { ProductCard, useGetProductBySlugQuery, useGetProductsQuery } from '../../entities/product';
import { AddToCartButton } from '../../features/add-to-cart';
import { useFormatters, useLocale } from '../../shared/i18n';
import { Button, Container, ErrorState, Skeleton } from '../../shared/ui';
import { NotFound } from '../../widgets/not-found';
import { ProductGallery } from './product-gallery';
import { QuantityStepper } from './quantity-stepper';

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { status?: unknown }).status === 404;

/** The dynamic route: `/catalog/:slug`. */
export const ProductPage = () => {
  const { t } = useTranslation(['product', 'common']);
  const { slug = '' } = useParams();
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const [quantity, setQuantity] = useState(1);

  const product = useGetProductBySlugQuery(slug);
  const categories = useGetCategoriesQuery(undefined);
  const related = useGetProductsQuery(
    { category: product.data?.category ?? '', perPage: 4 },
    { skip: !product.data },
  );

  if (product.isError && isNotFound(product.error)) return <NotFound />;

  if (product.isError) {
    return (
      <Container className="py-24">
        <h1 className="sr-only">{t('common:pages.product')}</h1>
        <ErrorState
          title={t('common:state.error')}
          description={t('common:state.errorDetail')}
          action={
            <Button
              onClick={() => {
                void product.refetch();
              }}
            >
              {t('common:actions.retry')}
            </Button>
          }
        />
      </Container>
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
        <ProductGallery product={item} name={name} />

        <div className="flex flex-col gap-6">
          {category && <p className="text-md text-ink-muted">{localized(category.label)}</p>}
          <h1 className="text-h1 font-(--font-weight-heading) text-ink">{name}</h1>
          <p className="text-h2 text-ink-muted">{format.currency(item.price, item.currency)}</p>
          <p className={item.inStock ? 'text-md text-ink' : 'text-md text-ink-muted'}>
            {item.inStock ? t('product:inStock') : t('product:outOfStock')}
          </p>

          <section aria-labelledby="product-description">
            <h2 id="product-description" className="text-lg text-ink">
              {t('product:description')}
            </h2>
            <p className="mt-2 max-w-prose text-md text-ink-muted">{description}</p>
          </section>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <QuantityStepper value={quantity} onChange={setQuantity} disabled={!item.inStock} />
            <AddToCartButton product={item} quantity={quantity} variant="label" />
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 lg:mt-24">
          <h2 id="related-heading" className="text-h2 font-(--font-weight-heading) text-ink">
            {t('product:related')}
          </h2>
          <ul className="grid grid-cols-1 gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {others.map((entry) => (
              <li key={entry.id} className="pt-10">
                <ProductCard product={entry} action={<AddToCartButton product={entry} />} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
};
