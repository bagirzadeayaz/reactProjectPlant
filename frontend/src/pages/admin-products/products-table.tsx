import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '../../entities/category';
import type { Product } from '../../entities/product';
import { useFormatters, useLocale } from '../../shared/i18n';
import { cn } from '../../shared/lib/cn';
import { SORT_KEYS, type SortKey, type TableSort } from './lib/table-model';

export interface ProductsTableProps {
  items: readonly Product[];
  categories: readonly Category[];
  sort: TableSort;
  onSort: (key: SortKey) => void;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (product: Product) => void;
  onManage: (product: Product, action: 'quick' | 'archive' | 'restore') => void;
  busy?: boolean;
}

/**
 * The product table. Sorting is a button in each header cell with `aria-sort`
 * on the active column; selection is a checkbox per row plus a header one
 * that selects the visible rows. Row actions are a real link to the edit
 * form and a button for delete — the page owns what delete does.
 */
export const ProductsTable = ({
  items,
  categories,
  sort,
  onSort,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
  onManage,
  busy = false,
}: ProductsTableProps) => {
  const { t } = useTranslation('admin');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const someSelected = items.some((item) => selected.has(item.id));
  const selectAll = (
    <input
      type="checkbox"
      aria-label={t('table.selectAll')}
      checked={allSelected}
      ref={(input) => {
        if (input) input.indeterminate = someSelected && !allSelected;
      }}
      onChange={onToggleAll}
    />
  );

  return (
    <>
      <div className="admin-mobile-table-controls">
        <label className="admin-select-all">
          {selectAll}
          <span>{t('table.selectAll')}</span>
        </label>
        <div className="admin-mobile-sort">
          <select
            aria-label={t('table.sortProducts')}
            value={sort.key}
            onChange={(event) => {
              onSort(event.target.value as SortKey);
            }}
          >
            {SORT_KEYS.map((key) => (
              <option value={key} key={key}>
                {t(`table.${key}`)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-icon-action"
            aria-label={t(
              sort.direction === 'asc' ? 'table.sortDescending' : 'table.sortAscending',
            )}
            onClick={() => {
              onSort(sort.key);
            }}
          >
            {sort.direction === 'asc' ? (
              <ArrowUp size={18} aria-hidden="true" />
            ) : (
              <ArrowDown size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-products-table">
          <caption className="sr-only">{t('table.caption')}</caption>
          <thead>
            <tr>
              <th scope="col" className="admin-select-cell">
                {selectAll}
              </th>
              {SORT_KEYS.map((key) => {
                const active = sort.key === key;
                return (
                  <th
                    key={key}
                    scope="col"
                    className={`admin-column-${key}`}
                    aria-sort={
                      active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    <button
                      type="button"
                      aria-label={t('table.sortBy', { column: t(`table.${key}`) })}
                      className={cn('admin-sort-button', active && 'is-active')}
                      onClick={() => {
                        onSort(key);
                      }}
                    >
                      {t(`table.${key}`)}
                      {active ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp size={14} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={14} aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown size={14} aria-hidden="true" />
                      )}
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="admin-actions-heading">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => {
              const name = localized(product.name);
              const category = categories.find((item) => item.slug === product.category);
              return (
                <tr key={product.id} className={cn(selected.has(product.id) && 'is-selected')}>
                  <td className="admin-select-cell">
                    <input
                      type="checkbox"
                      aria-label={t('table.selectOne', { name })}
                      checked={selected.has(product.id)}
                      onChange={() => {
                        onToggle(product.id);
                      }}
                    />
                  </td>
                  <th scope="row" className="admin-product-cell">
                    <Link
                      to={
                        product.status && product.status !== 'published'
                          ? `/admin/products/${product.id}`
                          : `/catalog/${product.slug}`
                      }
                      className="admin-product-identity"
                    >
                      <span className="admin-product-thumbnail">
                        <img src={product.imageUrl} width={64} height={64} alt="" loading="lazy" />
                      </span>
                      <span className="admin-product-name">
                        <strong>{name}</strong>
                        <span>{product.slug}</span>
                        <small
                          className={`admin-publication admin-publication--${product.status ?? 'published'}`}
                        >
                          {t(`inventory.${product.status ?? 'published'}`)}
                        </small>
                        {!product.care && (
                          <small className="admin-care-missing">{t('care.missing')}</small>
                        )}
                      </span>
                    </Link>
                  </th>
                  <td className="admin-price-cell" data-label={t('table.price')}>
                    {format.currency(product.price, product.currency)}
                  </td>
                  <td className="admin-category-cell" data-label={t('table.category')}>
                    {category ? localized(category.label) : product.category}
                  </td>
                  <td className="admin-stock-cell">
                    <span
                      className={cn(
                        'admin-stock',
                        product.inStock ? 'admin-stock--available' : 'admin-stock--unavailable',
                      )}
                    >
                      <span aria-hidden="true" />
                      {product.inStock ? t('table.inStock') : t('table.outOfStock')}
                    </span>
                  </td>
                  <td className="admin-created-cell" data-label={t('table.created')}>
                    {format.date(product.createdAt)}
                  </td>
                  <td className="admin-actions-cell">
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-edit-action"
                        disabled={busy}
                        onClick={() => {
                          onManage(product, 'quick');
                        }}
                      >
                        {t('inventory.quickEdit')}
                      </button>
                      <details
                        className="admin-row-menu"
                        onBlur={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget))
                            event.currentTarget.open = false;
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            event.currentTarget.open = false;
                            event.currentTarget.querySelector('summary')?.focus();
                          }
                        }}
                      >
                        <summary aria-label={t('inventory.actionsFor', { name })}>•••</summary>
                        <div>
                          <Link to={`/admin/products/${product.id}`}>
                            <Pencil size={16} aria-hidden="true" />
                            {t('table.editShort')}
                          </Link>
                          <Link
                            to={`/admin/products/new?duplicate=${encodeURIComponent(product.id)}`}
                          >
                            {t('inventory.duplicate')}
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              onManage(
                                product,
                                product.status === 'archived' ? 'restore' : 'archive',
                              );
                            }}
                          >
                            {t(
                              product.status === 'archived'
                                ? 'inventory.restore'
                                : 'inventory.archive',
                            )}
                          </button>
                          {product.status === 'archived' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                onDelete(product);
                              }}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                              {t('delete')}
                            </button>
                          )}
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
