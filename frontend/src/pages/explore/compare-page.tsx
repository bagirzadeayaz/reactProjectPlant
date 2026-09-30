import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowLeftRight, Check, Columns3, Plus, Search, X } from 'lucide-react';
import { useGetBasketProductsQuery, plantProfile, type Product } from '../../entities/product';
import { gardenActions, selectGarden } from '../../entities/garden';
import { Button, Container } from '../../shared/ui';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useLocale, useFormatters } from '../../shared/i18n';
import { ComparisonPicker } from './comparison-picker';

const ROWS = ['price', 'light', 'size', 'effort', 'stock'] as const;
type ComparisonRow = (typeof ROWS)[number];

export const ComparePage = () => {
  const { t } = useTranslation(['garden', 'common']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const { compare } = useSelector(selectGarden);
  const dispatch = useDispatch();
  const query = useGetBasketProductsQuery(compare);
  const [picker, setPicker] = useState<{ replace?: string } | null>(null);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const pickerTrigger = useRef<HTMLButtonElement>(null);
  const products = compare.flatMap((id) => query.currentData?.find((p) => p.id === id) ?? []);
  const value = (p: Product, row: ComparisonRow): string => {
    if (row === 'price') return format.currency(p.price, p.currency);
    if (row === 'stock') return t(p.inStock ? 'yes' : 'no');
    const profile = plantProfile(p);
    return t(profile?.[row === 'effort' ? 'care' : row] ?? 'unknown');
  };
  const different = (row: ComparisonRow): boolean =>
    new Set(products.map((p) => value(p, row))).size > 1;
  const visibleRows = ROWS.filter(
    (row) => !differencesOnly || products.length < 2 || different(row),
  );
  const missing =
    !query.isFetching && !query.isError
      ? compare.filter((id) => !products.some((p) => p.id === id))
      : [];

  return (
    <Container as="section" className="compare-page">
      <DocumentMeta title={`${t('compare')} · Planto.`} description={t('compareIntro')} />
      <Link className="compare-back" to="/catalog">
        <ArrowLeft size={18} aria-hidden="true" />
        {t('browse')}
      </Link>
      <header className="compare-heading">
        <h1>{t('compare')}</h1>
        <p>{t('comparison.intro')}</p>
      </header>
      <div className="compare-toolbar">
        <Button
          className="compare-primary"
          ref={pickerTrigger}
          onClick={() => {
            setPicker({});
          }}
        >
          <Plus size={18} aria-hidden="true" />
          {t(compare.length === 3 ? 'comparison.editSelection' : 'comparison.addPlants')}
        </Button>
        <span className="compare-count" role="status">
          {t('comparison.selected', { count: compare.length })}
        </span>
        {compare.length > 0 && (
          <button
            className="compare-text-button"
            onClick={() => {
              dispatch(gardenActions.cleared('compare'));
            }}
          >
            {t('clear')}
          </button>
        )}
      </div>
      {query.isError ? (
        <div className="compare-message">
          <p>{t('comparison.loadFailed')}</p>
          <Button
            onClick={() => {
              void query.refetch();
            }}
          >
            {t('common:actions.retry')}
          </Button>
        </div>
      ) : query.isFetching ? (
        <p className="compare-message" role="status">
          {t('common:state.loading')}
        </p>
      ) : products.length > 0 ? (
        <>
          <div className="compare-options">
            <label>
              <input
                type="checkbox"
                checked={differencesOnly}
                disabled={products.length < 2}
                onChange={(event) => {
                  setDifferencesOnly(event.target.checked);
                }}
              />
              {t('comparison.differences')}
            </label>
            {products.length === 1 && <p>{t('comparison.addSecond')}</p>}
            {products.length === 3 && (
              <p className="compare-swipe">
                <ArrowLeftRight size={16} aria-hidden="true" />
                {t('comparison.swipe')}
              </p>
            )}
          </div>
          <div
            className="compare-matrix-scroll"
            role="region"
            aria-label={t('compare')}
            tabIndex={0}
          >
            <table className={`compare-matrix compare-matrix--${String(products.length)}`}>
              <caption className="sr-only">{t('compareIntro')}</caption>
              <thead>
                <tr>
                  <th scope="col" className="compare-row-label">
                    {t('comparison.atGlance')}
                  </th>
                  {products.map((p) => (
                    <th key={p.id} scope="col">
                      <div className="compare-plant">
                        <button
                          className="compare-remove"
                          aria-label={t('removeCompare', { name: localized(p.name) })}
                          onClick={() => {
                            dispatch(gardenActions.toggled({ list: 'compare', id: p.id }));
                          }}
                        >
                          <X size={18} aria-hidden="true" />
                        </button>
                        <img src={p.imageUrl} width={150} height={150} alt="" />
                        <Link to={`/catalog/${p.slug}`}>{localized(p.name)}</Link>
                        <button
                          className="compare-replace"
                          aria-label={t('comparison.replaceNamed', { name: localized(p.name) })}
                          onClick={() => {
                            setPicker({ replace: p.id });
                          }}
                        >
                          <ArrowLeftRight size={14} aria-hidden="true" />
                          {t('comparison.replace')}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row} className={different(row) ? 'is-different' : undefined}>
                    <th scope="row" className="compare-row-label">
                      {t(row)}
                    </th>
                    {products.map((p) => (
                      <td
                        key={p.id}
                        data-label={t(row)}
                        className={row === 'price' ? 'compare-price' : undefined}
                      >
                        {row === 'stock' && p.inStock && <Check size={14} aria-hidden="true" />}
                        {value(p, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th className="compare-row-label">
                    <span className="sr-only">{t('viewPlant')}</span>
                  </th>
                  {products.map((p) => (
                    <td key={p.id}>
                      <Link className="compare-detail-link" to={`/catalog/${p.slug}`}>
                        {t('viewPlant')}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          {visibleRows.length === 0 && (
            <p className="compare-message" role="status">
              {t('comparison.same')}
            </p>
          )}
        </>
      ) : (
        <div className="compare-empty">
          <Columns3 size={42} strokeWidth={1.25} aria-hidden="true" />
          <h2>{t('comparison.emptyTitle')}</h2>
          <p>{t('comparison.emptyBody')}</p>
          <Button
            onClick={() => {
              setPicker({});
            }}
          >
            <Search size={18} aria-hidden="true" />
            {t('comparison.choose')}
          </Button>
        </div>
      )}
      {missing.length > 0 && (
        <div className="compare-message">
          <p>{t('comparison.unavailable')}</p>
          <button
            className="compare-text-button"
            onClick={() => {
              missing.forEach((id) => dispatch(gardenActions.toggled({ list: 'compare', id })));
            }}
          >
            {t('comparison.removeMissing')}
          </button>
        </div>
      )}
      <p className="compare-note">{t('profileNote')}</p>
      {picker !== null && (
        <ComparisonPicker
          {...(picker.replace === undefined ? {} : { replaceId: picker.replace })}
          onClose={() => {
            setPicker(null);
            pickerTrigger.current?.focus();
          }}
        />
      )}
    </Container>
  );
};
