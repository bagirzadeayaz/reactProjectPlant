import { useId, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../../entities/category';
import { useLocale } from '../../../shared/i18n';
import { Button, Input, Select } from '../../../shared/ui';
import { CATALOG_SORTS, type CatalogParams } from '../lib/catalog-params';
import { SearchField } from './search-field';

export interface CatalogFiltersProps {
  params: CatalogParams;
  categories: readonly Category[];
  onChange: (next: Partial<CatalogParams>) => void;
  onReset: () => void;
}

const toNumberOrNull = (value: string): number | null => (value === '' ? null : Number(value));

/**
 * The catalog controls. Every control writes straight to the URL through
 * `onChange`, so there is no local form state to fall out of sync — the
 * search box is the one exception, and it debounces rather than buffers.
 */
export const CatalogFilters = ({ params, categories, onChange, onReset }: CatalogFiltersProps) => {
  const { t } = useTranslation('catalog');
  const { localized } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const optionsId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const activeCount = [
    params.category !== null,
    params.minPrice !== null,
    params.maxPrice !== null,
    params.inStock,
    params.sort !== 'newest',
  ].filter(Boolean).length;

  return (
    <form
      role="search"
      aria-label={t('filtersLabel')}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="catalog-filters grid gap-6 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
    >
      <div className="catalog-search-row">
        <SearchField
          value={params.search}
          onChange={(search) => {
            onChange({ search });
          }}
        />
        <button
          ref={toggleRef}
          type="button"
          className="catalog-filter-toggle"
          aria-expanded={expanded}
          aria-controls={optionsId}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <SlidersHorizontal size={19} aria-hidden="true" />
          {t('filtersLabel')}
          {activeCount > 0 && <span>{activeCount}</span>}
        </button>
      </div>

      <div id={optionsId} className="catalog-filter-options" data-expanded={expanded}>
        <Select
          containerClassName="catalog-filter-category"
          label={t('categoryLabel')}
          value={params.category ?? ''}
          onChange={(event) => {
            onChange({ category: event.target.value === '' ? null : event.target.value });
          }}
          options={[
            { value: '', label: t('allCategories') },
            ...categories.map((category) => ({
              value: category.slug,
              label: localized(category.label),
            })),
          ]}
        />

        <Input
          type="number"
          inputMode="numeric"
          min={0}
          label={t('priceMin')}
          value={params.minPrice ?? ''}
          onChange={(event) => {
            onChange({ minPrice: toNumberOrNull(event.target.value) });
          }}
        />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          label={t('priceMax')}
          value={params.maxPrice ?? ''}
          onChange={(event) => {
            onChange({ maxPrice: toNumberOrNull(event.target.value) });
          }}
        />

        <Select
          containerClassName="catalog-filter-sort"
          label={t('sortLabel')}
          value={params.sort}
          onChange={(event) => {
            onChange({ sort: event.target.value as CatalogParams['sort'] });
          }}
          options={CATALOG_SORTS.map((sort) => ({ value: sort, label: t(`sort.${sort}`) }))}
        />

        <label className="catalog-filter-stock flex items-center gap-3 text-md text-ink sm:col-span-2 lg:col-span-4">
          <input
            type="checkbox"
            checked={params.inStock}
            onChange={(event) => {
              onChange({ inStock: event.target.checked });
            }}
            className="size-5 accent-(--color-ink)"
          />
          {t('inStockOnly')}
        </label>

        <div className="catalog-filter-actions flex items-end justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            {t('clearFilters')}
          </Button>
          <Button
            className="catalog-filter-done"
            type="button"
            size="sm"
            onClick={() => {
              setExpanded(false);
              toggleRef.current?.focus();
            }}
          >
            {t('showPlants')}
          </Button>
        </div>
      </div>
    </form>
  );
};
