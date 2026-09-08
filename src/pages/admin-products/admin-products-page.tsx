import { useState } from 'react';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  type Product,
} from '../../entities/product';
import { useLocale } from '../../shared/i18n';
import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  useToast,
} from '../../shared/ui';
import { DeleteDialog, type DeleteDialogProps } from './delete-dialog';
import {
  DEFAULT_SORT,
  filterProducts,
  nextSort,
  sortProducts,
  type TableSort,
} from './lib/table-model';
import { ProductsTable } from './products-table';
import { useSelection } from './use-selection';

/** Everything, one page: the admin table sorts and searches on the client. */
const ALL = { perPage: 100 } as const;

/**
 * `/admin/products`. The list is the same `getProducts` cache the storefront
 * reads, so a delete here is gone from the catalog before the user gets there.
 */
export const AdminProductsPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { locale, localized } = useLocale();
  const toast = useToast();
  const products = useGetProductsQuery(ALL);
  const [deleteProduct, deletion] = useDeleteProductMutation();
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<DeleteDialogProps['target']>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const all = products.data?.items ?? [];
  const visible = sortProducts(filterProducts(all, query), sort, locale);
  const selection = useSelection(visible.map((item) => item.id));

  const askDeleteOne = (product: Product): void => {
    setPendingIds([product.id]);
    setTarget({ kind: 'one', name: localized(product.name) });
  };
  const askDeleteSelected = (): void => {
    const ids = [...selection.selected];
    setPendingIds(ids);
    setTarget({ kind: 'many', count: ids.length });
  };
  const closeDialog = (): void => {
    setTarget(null);
    setPendingIds([]);
  };

  const confirmDelete = async (): Promise<void> => {
    const results = await Promise.allSettled(pendingIds.map((id) => deleteProduct(id).unwrap()));
    const done = results.filter((result) => result.status === 'fulfilled').length;
    if (done > 0) {
      toast.show({
        message:
          pendingIds.length === 1 ? t('admin:deleted') : t('admin:bulk.deleted', { count: done }),
        tone: 'success',
      });
    }
    if (done < pendingIds.length) toast.show({ message: t('admin:deleteFailed'), tone: 'error' });
    selection.clear();
    closeDialog();
  };

  return (
    <Container as="section" className="flex flex-col gap-8 py-16">
      <DocumentMeta
        title={`${t('admin:title')} · ${t('common:meta.siteName')}`}
        description={t('admin:metaDescription')}
        robots="noindex"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-h1 font-(--font-weight-heading) text-ink">{t('admin:title')}</h1>
        <Link
          to="/admin/products/new"
          className="text-lg text-ink underline-offset-4 hover:underline"
        >
          {t('admin:new')}
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Input
          type="search"
          label={t('admin:table.search')}
          placeholder={t('admin:table.searchPlaceholder')}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          containerClassName="min-w-64"
        />
        <p role="status" data-testid="admin-count" className="text-md text-ink-muted">
          {selection.selected.size > 0
            ? t('admin:table.selected', { count: selection.selected.size })
            : t('admin:table.count', { count: visible.length })}
        </p>
        {selection.selected.size > 0 && (
          <Button size="sm" onClick={askDeleteSelected}>
            {t('admin:table.deleteSelected')}
          </Button>
        )}
      </div>

      {products.isLoading && (
        <div aria-busy="true" aria-label={t('admin:table.loading')}>
          <Skeleton className="h-64 w-full rounded-control" />
        </div>
      )}
      {products.isError && (
        <ErrorState
          title={t('admin:loadFailed')}
          action={
            <Button size="sm" onClick={() => void products.refetch()}>
              {t('common:actions.retry')}
            </Button>
          }
        />
      )}
      {products.isSuccess && all.length === 0 && (
        <EmptyState
          title={t('admin:table.empty')}
          description={t('admin:table.emptyHint')}
          action={
            <Button as="a" href="/admin/products/new" size="sm">
              {t('admin:new')}
            </Button>
          }
        />
      )}
      {products.isSuccess && all.length > 0 && visible.length === 0 && (
        <EmptyState title={t('admin:table.noMatches')} />
      )}
      {visible.length > 0 && (
        <ProductsTable
          items={visible}
          sort={sort}
          onSort={(key) => {
            setSort((current) => nextSort(current, key));
          }}
          selected={selection.selected}
          onToggle={selection.toggle}
          onToggleAll={selection.toggleAll}
          onDelete={askDeleteOne}
        />
      )}

      <DeleteDialog
        target={target}
        isDeleting={deletion.isLoading}
        onConfirm={() => void confirmDelete()}
        onClose={closeDialog}
      />
    </Container>
  );
};
