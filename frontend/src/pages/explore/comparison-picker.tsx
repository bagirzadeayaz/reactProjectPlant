import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery } from '../../entities/product';
import { gardenActions, selectGarden } from '../../entities/garden';
import { useFormatters, useLocale } from '../../shared/i18n';
import { Button, Input, Modal } from '../../shared/ui';

export const ComparisonPicker = ({
  replaceId,
  onClose,
}: {
  replaceId?: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation(['garden', 'common']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const dispatch = useDispatch();
  const { compare } = useSelector(selectGarden);
  const [search, setSearch] = useState('');
  const [queryText, setQueryText] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQueryText(search.trim());
    }, 250);
    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);
  const query = useGetProductsQuery({
    perPage: 100,
    ...(queryText ? { search: queryText } : {}),
  });
  return (
    <Modal
      isOpen
      onClose={onClose}
      className="compare-picker"
      title={t(replaceId ? 'comparison.replaceTitle' : 'comparison.choose')}
      closeLabel={t('comparison.close')}
      footer={
        <Button className="compare-primary" onClick={onClose}>
          {t('comparison.done')}
        </Button>
      }
    >
      <div className="compare-picker-body">
        <Input
          label={t('comparison.search')}
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <p className="compare-picker-status" role="status">
          {t(
            replaceId
              ? 'comparison.replaceHint'
              : compare.length === 3
                ? 'comparison.full'
                : 'comparison.selected',
            { count: compare.length },
          )}
        </p>
        <div className="compare-picker-list">
          {query.isFetching ? (
            <p role="status">{t('common:state.loading')}</p>
          ) : query.isError ? (
            <Button
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('common:actions.retry')}
            </Button>
          ) : (
            (query.currentData?.items ?? []).map((p) => {
              const selected = compare.includes(p.id);
              const disabled =
                replaceId !== undefined ? selected : !selected && compare.length >= 3;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="compare-picker-item"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => {
                    if (replaceId !== undefined) {
                      dispatch(gardenActions.replaced({ previous: replaceId, next: p.id }));
                      onClose();
                    } else dispatch(gardenActions.toggled({ list: 'compare', id: p.id }));
                  }}
                >
                  <img src={p.imageUrl} width={58} height={66} alt="" />
                  <span className="compare-picker-name">
                    <strong>{localized(p.name)}</strong>
                    <small>
                      {format.currency(p.price, p.currency)} · {t(p.inStock ? 'yes' : 'no')}
                    </small>
                  </span>
                  <span className="compare-picker-check">
                    {selected ? (
                      <Check size={18} aria-hidden="true" />
                    ) : (
                      <Plus size={18} aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })
          )}
          {!query.isFetching && !query.isError && !query.currentData?.items.length && (
            <p role="status">{t('comparison.noResults')}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
