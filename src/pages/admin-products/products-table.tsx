import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Product } from '../../entities/product';
import { useFormatters, useLocale } from '../../shared/i18n';
import { cn } from '../../shared/lib/cn';
import { Icon } from '../../shared/ui';
import { SORT_KEYS, type SortKey, type TableSort } from './lib/table-model';

export interface ProductsTableProps {
  items: readonly Product[];
  sort: TableSort;
  onSort: (key: SortKey) => void;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (product: Product) => void;
}

/**
 * The product table. Sorting is a button in each header cell with `aria-sort`
 * on the active column; selection is a checkbox per row plus a header one
 * that selects the visible rows. Row actions are a real link to the edit
 * form and a button for delete — the page owns what delete does.
 */
export const ProductsTable = ({
  items,
  sort,
  onSort,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
}: ProductsTableProps) => {
  const { t } = useTranslation('admin');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));

  return (
    <div className="overflow-x-auto rounded-control border border-border-glass">
      <table className="w-full text-left text-md text-ink">
        <caption className="sr-only">{t('table.caption')}</caption>
        <thead className="bg-surface-glass text-sm text-ink-muted">
          <tr>
            <th scope="col" className="px-4 py-3">
              <input
                type="checkbox"
                className="size-5 accent-ink"
                aria-label={t('table.selectAll')}
                checked={allSelected}
                onChange={onToggleAll}
              />
            </th>
            {SORT_KEYS.map((key) => {
              const active = sort.key === key;
              return (
                <th
                  key={key}
                  scope="col"
                  className="px-4 py-3"
                  aria-sort={
                    active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                >
                  <button
                    type="button"
                    aria-label={t('table.sortBy', { column: t(`table.${key}`) })}
                    className="inline-flex items-center gap-1 hover:text-ink"
                    onClick={() => {
                      onSort(key);
                    }}
                  >
                    {t(`table.${key}`)}
                    {active && (
                      <Icon
                        name="chevron"
                        className={cn('size-4', sort.direction === 'asc' && 'rotate-180')}
                      />
                    )}
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-4 py-3">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => {
            const name = localized(product.name);
            return (
              <tr key={product.id} className="border-t border-border-glass">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-ink"
                    aria-label={t('table.selectOne', { name })}
                    checked={selected.has(product.id)}
                    onChange={() => {
                      onToggle(product.id);
                    }}
                  />
                </td>
                <th scope="row" className="px-4 py-3 font-normal">
                  <Link to={`/catalog/${product.slug}`} className="hover:underline">
                    {name}
                  </Link>
                </th>
                <td className="px-4 py-3">{format.currency(product.price, product.currency)}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">
                  {product.inStock ? t('table.inStock') : t('table.outOfStock')}
                </td>
                <td className="px-4 py-3">{format.date(product.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-4">
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="underline-offset-4 hover:underline"
                      aria-label={t('table.editOne', { name })}
                    >
                      {t('edit')}
                    </Link>
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      aria-label={t('table.deleteOne', { name })}
                      onClick={() => {
                        onDelete(product);
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
