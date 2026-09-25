import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../../entities/category';
import { ProductCard, useGetProductsQuery } from '../../entities/product';
import { AddToCartButton } from '../../features/add-to-cart';
import { CatalogFilters, useCatalogParams } from '../../features/product-filters';
import { Button, Container, EmptyState, ErrorState, Skeleton } from '../../shared/ui';
import { Pagination } from './pagination';

const PER_PAGE = 6;

/**
 * The catalog. Every control writes to the URL and the URL drives the query,
 * so there is exactly one source of truth and it survives a reload.
 */
export const CatalogPage = () => {
  const { t } = useTranslation(['catalog', 'common']);
  const { params, update, reset } = useCatalogParams();
  const categories = useGetCategoriesQuery(undefined);
  const products = useGetProductsQuery({
    search: params.search,
    sort: params.sort,
    page: params.page,
    perPage: PER_PAGE,
    inStock: params.inStock,
    ...(params.category === null ? {} : { category: params.category }),
    ...(params.minPrice === null ? {} : { minPrice: params.minPrice }),
    ...(params.maxPrice === null ? {} : { maxPrice: params.maxPrice }),
  });

  const items = products.data?.items ?? [];
  const total = products.data?.total ?? 0;

  return (
    <Container as="section" className="py-12 sm:py-16">
      <DocumentMeta
        title={`${t('catalog:title')} · ${t('common:meta.siteName')}`}
        description={t('catalog:metaDescription')}
      />

      <h1 className="text-h1 font-(--font-weight-heading) text-ink">{t('catalog:title')}</h1>

      <div className="mt-8 lg:mt-10">
        <CatalogFilters
          params={params}
          categories={categories.data ?? []}
          onChange={update}
          onReset={reset}
        />
      </div>

      <p aria-live="polite" className="mt-8 text-md text-ink-muted">
        {products.isFetching ? t('common:state.loading') : t('catalog:results', { count: total })}
      </p>

      {products.isError ? (
        <ErrorState
          title={t('common:state.error')}
          description={t('common:state.errorDetail')}
          action={
            <Button
              onClick={() => {
                void products.refetch();
              }}
            >
              {t('common:actions.retry')}
            </Button>
          }
        />
      ) : products.isLoading ? (
        <ul className="home-product-grid">
          {Array.from({ length: PER_PAGE }, (_, index) => (
            <li key={index} className="h-full">
              <Skeleton className="h-[30rem] w-full rounded-card" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('catalog:empty')}
          description={t('catalog:emptyHint')}
          action={<Button onClick={reset}>{t('catalog:clearFilters')}</Button>}
        />
      ) : (
        <ul className="home-product-grid">
          {items.map((product, index) => (
            <li key={product.id} className="h-full">
              <ProductCard
                product={product}
                priority={index < 3}
                headingLevel={2}
                action={<AddToCartButton product={product} />}
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={params.page}
        total={total}
        perPage={PER_PAGE}
        onChange={(page) => {
          update({ page });
        }}
      />
    </Container>
  );
};
