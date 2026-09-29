import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product, ProductPatch } from '../../entities/product';
import { useGetCategoriesQuery } from '../../entities/category';
import { useLocale } from '../../shared/i18n';
import { Button, Input, Modal, Select } from '../../shared/ui';

export interface InventoryAction {
  items: Product[];
  kind: 'quick' | 'bulk' | 'archive' | 'restore';
}

export const InventoryDialog = ({
  action,
  busy,
  onClose,
  onApply,
}: {
  action: InventoryAction;
  busy: boolean;
  onClose: () => void;
  onApply: (patch: ProductPatch) => Promise<void>;
}) => {
  const { t } = useTranslation('admin');
  const { localized } = useLocale();
  const categories = useGetCategoriesQuery(undefined);
  const first = action.kind === 'quick' ? action.items[0] : undefined;
  const [price, setPrice] = useState(first ? String(first.price) : '');
  const [category, setCategory] = useState(first?.category ?? '');
  const [stock, setStock] = useState(first ? String(first.inStock) : '');
  const [status, setStatus] = useState(first?.status ?? (first ? 'published' : ''));
  const fixed = action.kind === 'archive' || action.kind === 'restore';
  const validPrice = price === '' || (/^\d+$/.test(price) && Number.isSafeInteger(Number(price)));
  const patch: ProductPatch = fixed
    ? { status: action.kind === 'archive' ? 'archived' : 'draft' }
    : {
        ...(price === '' ? {} : { price: Number(price) }),
        ...(category ? { category } : {}),
        ...(stock ? { inStock: stock === 'true' } : {}),
        ...(status === 'published' || status === 'draft' || status === 'archived'
          ? { status }
          : {}),
      };
  return (
    <Modal
      className="admin-inventory-dialog"
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      title={t(`inventory.${action.kind === 'quick' ? 'quickEdit' : action.kind}`)}
      closeLabel={t('dialog.close')}
    >
      <form
        className="admin-action-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (validPrice && !busy && Object.keys(patch).length) void onApply(patch);
        }}
      >
        <p>{t('inventory.affects', { count: action.items.length })}</p>
        <ul className="admin-action-products">
          {action.items.slice(0, 5).map((item) => (
            <li key={item.id}>{localized(item.name)}</li>
          ))}
        </ul>
        {fixed ? (
          <p>{t(action.kind === 'archive' ? 'inventory.archiveHint' : 'inventory.restoreHint')}</p>
        ) : (
          <>
            <Input
              label={`${t('fields.price')} (₼)`}
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(event) => {
                setPrice(event.target.value);
              }}
              description={t('inventory.keepBlank')}
              {...(!validPrice ? { error: t('inventory.invalidPrice') } : {})}
            />
            <Select
              label={t('fields.category')}
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
              }}
              options={[
                { value: '', label: t('inventory.unchanged') },
                ...(categories.data ?? []).map((item) => ({
                  value: item.slug,
                  label: localized(item.label),
                })),
              ]}
            />
            <Select
              label={t('table.stock')}
              value={stock}
              onChange={(event) => {
                setStock(event.target.value);
              }}
              options={[
                { value: '', label: t('inventory.unchanged') },
                { value: 'true', label: t('table.inStock') },
                { value: 'false', label: t('table.outOfStock') },
              ]}
            />
            <Select
              label={t('inventory.publication')}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
              }}
              options={[
                { value: '', label: t('inventory.unchanged') },
                ...(['published', 'draft', 'archived'] as const).map((value) => ({
                  value,
                  label: t(`inventory.${value}`),
                })),
              ]}
            />
          </>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClose}>
            {t('dialog.cancel')}
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={busy}
            disabled={!validPrice || Object.keys(patch).length === 0}
            loadingLabel={t('form.saving')}
          >
            {t('inventory.apply')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
