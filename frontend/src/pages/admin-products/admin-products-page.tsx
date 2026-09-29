import { useState } from 'react';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Plus, Search, Trash2, X } from 'lucide-react';
import { useGetCategoriesQuery } from '../../entities/category';
import {
  useDeleteProductMutation,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  type ProductPatch,
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
  Select,
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
import { InventoryDialog, type InventoryAction } from './inventory-dialog';

const PAGE_SIZE = 12;

/**
 * `/admin/products`. Private inventory includes drafts and archived products.
 * Mutations invalidate both this list and the public catalog caches.
 */
export const AdminProductsPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { locale, localized } = useLocale();
  const toast = useToast();
  const products = useGetAdminProductsQuery(undefined);
  const [updateProduct] = useUpdateProductMutation();
  const [params, setParams] = useSearchParams();
  const [action, setAction] = useState<InventoryAction | null>(null);
  const [busy, setBusy] = useState(false);
  const categories = useGetCategoriesQuery(undefined);
  const [deleteProduct, deletion] = useDeleteProductMutation();
  const [sort, setSort] = useState<TableSort>(DEFAULT_SORT);
  const query = params.get('search') ?? '';
  const setFilter = (key: string, value: string): void => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true },
    );
  };
  const setQuery = (value: string): void => {
    setFilter('search', value);
  };
  const [target, setTarget] = useState<DeleteDialogProps['target']>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const all = products.data ?? [];
  const filtered = filterProducts(all, query).filter(
    (item) =>
      (!params.get('status') || (item.status ?? 'published') === params.get('status')) &&
      (!params.get('category') || item.category === params.get('category')) &&
      (!params.get('stock') || String(item.inStock) === params.get('stock')) &&
      (!params.get('min') || item.price >= Number(params.get('min'))) &&
      (!params.get('max') || item.price <= Number(params.get('max'))),
  );
  const sorted = sortProducts(filtered, sort, locale);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Math.min(
    pages,
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  );
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selection = useSelection(visible.map((item) => item.id));

  const apply = async (patch: ProductPatch): Promise<void> => {
    if (!action || busy) return;
    setBusy(true);
    const failed: Product[] = [];
    for (let start = 0; start < action.items.length; start += 3) {
      const group = action.items.slice(start, start + 3);
      const results = await Promise.allSettled(
        group.map((item) => updateProduct({ id: item.id, patch }).unwrap()),
      );
      results.forEach((result, index) => {
        const item = group[index];
        if (result.status === 'rejected' && item) failed.push(item);
      });
    }
    const done = action.items.length - failed.length;
    if (done)
      toast.show({ message: t('admin:inventory.updatedCount', { count: done }), tone: 'success' });
    if (failed.length)
      toast.show({
        message: t('admin:inventory.failedCount', { count: failed.length }),
        tone: 'error',
      });
    selection.clear();
    setAction(failed.length ? { ...action, items: failed } : null);
    setBusy(false);
    void products.refetch();
  };

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
    if (busy) return;
    setBusy(true);
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
    setBusy(false);
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

      <div className="admin-status-tabs" aria-label={t('admin:inventory.publication')}>
        {(['', 'published', 'draft', 'archived'] as const).map((status) => (
          <button
            type="button"
            key={status}
            aria-pressed={(params.get('status') ?? '') === status}
            onClick={() => {
              selection.clear();
              setFilter('status', status);
            }}
          >
            {t(`admin:inventory.${status || 'all'}`)}{' '}
            <span>
              {status
                ? all.filter((item) => (item.status ?? 'published') === status).length
                : all.length}
            </span>
          </button>
        ))}
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
                selection.clear();
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
                : t('admin:table.count', { count: filtered.length })}
          </p>
          {selection.selected.size > 0 && (
            <div className="admin-selection-actions">
              <button
                type="button"
                className="admin-edit-action"
                disabled={busy}
                onClick={() => {
                  setAction({
                    kind: 'bulk',
                    items: visible.filter((item) => selection.selected.has(item.id)),
                  });
                }}
              >
                {t('admin:inventory.bulk')}
              </button>
              {visible
                .filter((item) => selection.selected.has(item.id))
                .every((item) => item.status === 'archived') && (
                <button
                  type="button"
                  disabled={busy}
                  className="admin-delete-selection"
                  onClick={askDeleteSelected}
                >
                  <Trash2 size={17} aria-hidden="true" />
                  {t('admin:table.deleteSelected')}
                </button>
              )}
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

        <details
          className="admin-filter-panel"
          open={
            Boolean(
              params.get('category') ??
              params.get('stock') ??
              params.get('min') ??
              params.get('max'),
            ) || undefined
          }
        >
          <summary>{t('admin:inventory.filters')}</summary>
          <div className="admin-filter-grid">
            <Select
              label={t('admin:fields.category')}
              value={params.get('category') ?? ''}
              onChange={(event) => {
                selection.clear();
                setFilter('category', event.target.value);
              }}
              options={[
                { value: '', label: t('admin:inventory.allCategories') },
                ...(categories.data ?? []).map((item) => ({
                  value: item.slug,
                  label: localized(item.label),
                })),
              ]}
            />
            <Select
              label={t('admin:table.stock')}
              value={params.get('stock') ?? ''}
              onChange={(event) => {
                selection.clear();
                setFilter('stock', event.target.value);
              }}
              options={[
                { value: '', label: t('admin:inventory.anyStock') },
                { value: 'true', label: t('admin:table.inStock') },
                { value: 'false', label: t('admin:table.outOfStock') },
              ]}
            />
            <Input
              label={t('admin:inventory.minPrice')}
              type="number"
              min={0}
              value={params.get('min') ?? ''}
              onChange={(event) => {
                selection.clear();
                setFilter('min', event.target.value);
              }}
            />
            <Input
              label={t('admin:inventory.maxPrice')}
              type="number"
              min={0}
              value={params.get('max') ?? ''}
              onChange={(event) => {
                selection.clear();
                setFilter('max', event.target.value);
              }}
            />
          </div>
        </details>
        {params.size > 0 && (
          <button
            type="button"
            className="admin-reset-filters"
            onClick={() => {
              selection.clear();
              setParams({});
            }}
          >
            {t('admin:inventory.reset')}
          </button>
        )}
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
                  selection.clear();
                  setParams({});
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
              selection.clear();
              setSort((current) => nextSort(current, key));
            }}
            selected={selection.selected}
            onToggle={selection.toggle}
            onToggleAll={selection.toggleAll}
            onDelete={askDeleteOne}
            busy={busy}
            onManage={(item, kind) => {
              setAction({ items: [item], kind });
            }}
          />
        )}
      </div>

      {pages > 1 && (
        <nav className="admin-pagination" aria-label={t('admin:inventory.pagination')}>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            onClick={() => {
              selection.clear();
              setFilter('page', String(page - 1));
            }}
          >
            {t('admin:inventory.previous')}
          </Button>
          <span>{t('admin:inventory.page', { page, pages })}</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === pages}
            onClick={() => {
              selection.clear();
              setFilter('page', String(page + 1));
            }}
          >
            {t('admin:inventory.next')}
          </Button>
        </nav>
      )}
      {action && (
        <InventoryDialog
          key={action.kind}
          action={action}
          busy={busy}
          onApply={apply}
          onClose={() => {
            setAction(null);
          }}
        />
      )}
      <DeleteDialog
        target={target}
        isDeleting={busy || deletion.isLoading}
        onConfirm={() => void confirmDelete()}
        onClose={closeDialog}
      />
    </Container>
  );
};
