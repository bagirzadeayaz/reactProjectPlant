import { useState } from 'react';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Search, Trash2, X } from 'lucide-react';
import { useGetCategoriesQuery } from '../../entities/category';
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
  const categories = useGetCategoriesQuery(undefined);
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
    <Container as="section" className="admin-products-page">
      <DocumentMeta
        title={`${t('admin:title')} · ${t('common:meta.siteName')}`}
        description={t('admin:metaDescription')}
        robots="noindex"
      />

      <div className="admin-page-heading">
        <div>
          <h1>{t('admin:title')}</h1>
          <p>{t('admin:subtitle')}</p>
        </div>
        <div className="admin-heading-actions">
          <Link to="/catalog" className="admin-catalog-link">
            {t('admin:viewCatalog')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/admin/products/new" className="admin-new-product">
            <Plus size={20} aria-hidden="true" />
            {t('admin:new')}
          </Link>
        </div>
      </div>

      <div className="admin-inventory">
        <div className="admin-inventory-toolbar">
          <div className="admin-search">
            <Search size={20} aria-hidden="true" />
            <Input
              type="search"
              label={t('admin:table.search')}
              placeholder={t('admin:table.search')}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              containerClassName="admin-search-field"
            />
          </div>
          <p role="status" className="admin-count">
            {products.isFetching
              ? t('admin:table.loading')
              : selection.selected.size > 0
                ? t('admin:table.selected', { count: selection.selected.size })
                : t('admin:table.count', { count: visible.length })}
          </p>
          {selection.selected.size > 0 && (
            <div className="admin-selection-actions">
              <button type="button" className="admin-delete-selection" onClick={askDeleteSelected}>
                <Trash2 size={17} aria-hidden="true" />
                {t('admin:table.deleteSelected')}
              </button>
              <button
                type="button"
                className="admin-icon-action"
                onClick={selection.clear}
                aria-label={t('admin:table.clearSelection')}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
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
          <EmptyState
            title={t('admin:table.noMatches')}
            action={
              <Button
                size="sm"
                onClick={() => {
                  setQuery('');
                }}
              >
                {t('admin:table.clearSearch')}
              </Button>
            }
          />
        )}
        {visible.length > 0 && (
          <ProductsTable
            items={visible}
            categories={categories.data ?? []}
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
      </div>

      <DeleteDialog
        target={target}
        isDeleting={deletion.isLoading}
        onConfirm={() => void confirmDelete()}
        onClose={closeDialog}
      />
    </Container>
  );
};
