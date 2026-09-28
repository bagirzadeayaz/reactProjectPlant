import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart, Sprout, Columns3, CalendarDays, Armchair, Package } from 'lucide-react';
import {
  useGetProductsQuery,
  useGetBasketProductsQuery,
  ProductCard,
  plantProfile,
  matchProfile,
  type PlantProfile,
} from '../../entities/product';
import { gardenActions, selectGarden } from '../../entities/garden';
import { ProductTools, GardenNav } from '../../features/garden-tools';
import { AddToCartButton } from '../../features/add-to-cart';
import { PlantStudio } from '../../widgets/home';
import { Button, Container } from '../../shared/ui';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useLocale, useFormatters } from '../../shared/i18n';

const destinations = [
  ['finder', 'finderIntro', '/finder', Sprout],
  ['wishlist', 'wishIntro', '/wishlist', Heart],
  ['compare', 'compareIntro', '/compare', Columns3],
  ['studio', 'studioIntro', '/studio', Armchair],
  ['care', 'careIntro', '/care#calendar', CalendarDays],
  ['tracking', 'trackIntro', '/tracking', Package],
] as const;
const Heading = ({ title, lead }: { title: string; lead: string }) => {
  const { t } = useTranslation(['garden', 'common']);
  return (
    <>
      <DocumentMeta title={title + ' · Planto.'} description={lead} />
      <p className="editorial-eyebrow">Planto. / {t('nav')}</p>
      <h1 className="editorial-title">{title}</h1>
      <p className="editorial-lead">{lead}</p>
      <GardenNav />
    </>
  );
};
export const DiscoverPage = () => {
  const { t } = useTranslation(['garden', 'common']);
  return (
    <Container as="section" className="garden-page">
      <Heading title={t('title')} lead={t('lead')} />
      <div className="discovery-grid">
        {destinations.map(([title, body, to, Icon], i) => (
          <Link to={to} key={to} className="discovery-card">
            <div className="discovery-icon">
              <Icon size={30} aria-hidden="true" />
              <span>0{i + 1}</span>
            </div>
            <h2>{t(title)}</h2>
            <p>{t(body)}</p>
            <span className="discovery-link">{t('start')} ↗</span>
          </Link>
        ))}
      </div>
      <p className="garden-note">{t('local')}</p>
    </Container>
  );
};
const QUESTIONS = [
  { key: 'light', title: 'lightQ', options: ['low', 'bright', 'direct'] },
  { key: 'size', title: 'sizeQ', options: ['compact', 'medium', 'large'] },
  { key: 'care', title: 'careQ', options: ['easy', 'regular'] },
] as const;
export const FinderPage = () => {
  const { t } = useTranslation(['garden', 'common']);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PlantProfile>>({});
  const [show, setShow] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const query = useGetProductsQuery({ perPage: 100 });
  const question = QUESTIONS[step] ?? QUESTIONS[0];
  const focus = () => {
    requestAnimationFrame(() => {
      heading.current?.focus();
    });
  };
  const ranked = (query.data?.items ?? [])
    .flatMap((product) => {
      const profile = plantProfile(product.slug);
      return profile && product.inStock
        ? [{ product, profile, score: matchProfile(profile, answers as PlantProfile) }]
        : [];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return (
    <Container as="section" className="garden-page">
      <Heading title={t('finder')} lead={t('finderIntro')} />
      {!show ? (
        <div className="quiz-panel">
          <p className="editorial-eyebrow">{t('step', { current: step + 1 })}</p>
          <div className="quiz-progress" aria-hidden="true">
            {QUESTIONS.map((q, i) => (
              <span key={q.key} className={i <= step ? 'is-complete' : ''} />
            ))}
          </div>
          <h2 ref={heading} tabIndex={-1}>
            {t(question.title)}
          </h2>
          <fieldset className="quiz-options">
            <legend className="sr-only">{t(question.title)}</legend>
            {question.options.map((option) => (
              <label key={option} className={answers[question.key] === option ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name={question.key}
                  checked={answers[question.key] === option}
                  onChange={() => {
                    setAnswers({ ...answers, [question.key]: option });
                  }}
                />
                <span>{t(option)}</span>
              </label>
            ))}
          </fieldset>
          <div className="garden-actions">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => {
                setStep(step - 1);
                focus();
              }}
            >
              {t('back')}
            </Button>
            <Button
              disabled={!answers[question.key]}
              onClick={() => {
                if (step === 2) setShow(true);
                else setStep(step + 1);
                focus();
              }}
            >
              {t(step === 2 ? 'results' : 'next')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2 ref={heading} tabIndex={-1} className="garden-subtitle">
            {t('resultTitle')}
          </h2>
          {query.isError ? (
            <Button
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('common:actions.retry')}
            </Button>
          ) : query.isLoading ? (
            <p role="status">{t('common:state.loading')}</p>
          ) : ranked.length === 0 ? (
            <p>{t('noMatches')}</p>
          ) : (
            <ul className="garden-results">
              {ranked.map(({ product, profile }) => (
                <li key={product.id}>
                  <p className="match-label">
                    {t('match', {
                      count:
                        Number(profile.light === answers.light) +
                        Number(profile.size === answers.size) +
                        Number(profile.care === answers.care),
                    })}
                  </p>
                  <ProductCard
                    product={product}
                    tools={<ProductTools product={product} />}
                    action={<AddToCartButton product={product} />}
                  />
                </li>
              ))}
            </ul>
          )}
          <Button
            onClick={() => {
              setShow(false);
              setStep(0);
              setAnswers({});
              focus();
            }}
          >
            {t('retake')}
          </Button>
        </>
      )}
      <p className="garden-note">{t('profileNote')}</p>
    </Container>
  );
};
export const WishlistPage = () => {
  const { t } = useTranslation(['garden', 'common']);
  const garden = useSelector(selectGarden);
  const dispatch = useDispatch();
  const query = useGetBasketProductsQuery(garden.saved);
  return (
    <Container as="section" className="garden-page">
      <Heading title={t('wishlist')} lead={t('wishIntro')} />
      {query.isError ? (
        <Button
          onClick={() => {
            void query.refetch();
          }}
        >
          {t('common:actions.retry')}
        </Button>
      ) : query.isFetching ? (
        <p role="status">{t('common:state.loading')}</p>
      ) : query.data?.length ? (
        <>
          <p>{t('savedCount', { count: query.data.length })}</p>
          <ul className="garden-results">
            {query.data.map((product) => (
              <li key={product.id}>
                <ProductCard
                  headingLevel={2}
                  product={product}
                  tools={<ProductTools product={product} />}
                  action={<AddToCartButton product={product} />}
                />
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            onClick={() => {
              dispatch(gardenActions.cleared('saved'));
            }}
          >
            {t('clear')}
          </Button>
        </>
      ) : (
        <div className="garden-empty">
          <Heart size={40} aria-hidden="true" />
          <h2>{t('empty')}</h2>
          <p>{t('emptyBody')}</p>
          <Button as="a" href="/catalog">
            {t('browse')}
          </Button>
        </div>
      )}
      {!!garden.saved.length && !query.data?.length && (
        <Button
          variant="ghost"
          onClick={() => {
            dispatch(gardenActions.cleared('saved'));
          }}
        >
          {t('clear')}
        </Button>
      )}
      <p className="garden-note">{t('local')}</p>
    </Container>
  );
};
export const ComparePage = () => {
  const { t } = useTranslation(['garden', 'common']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const garden = useSelector(selectGarden);
  const dispatch = useDispatch();
  const query = useGetBasketProductsQuery(garden.compare);
  const products = query.data ?? [];
  return (
    <Container as="section" className="garden-page">
      <Heading title={t('compare')} lead={t('compareIntro')} />
      <p>{t('limit')}</p>
      {query.isError ? (
        <Button
          onClick={() => {
            void query.refetch();
          }}
        >
          {t('common:actions.retry')}
        </Button>
      ) : query.isFetching ? (
        <p role="status">{t('common:state.loading')}</p>
      ) : products.length ? (
        <>
          <div className="comparison-scroll" role="region" aria-label={t('compare')} tabIndex={0}>
            <table className="comparison-table">
              <caption className="sr-only">{t('compareIntro')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('compare')}</th>
                  {products.map((p) => (
                    <th key={p.id} scope="col">
                      <img src={p.imageUrl} width={120} height={120} alt="" />
                      <Link to={'/catalog/' + p.slug}>{localized(p.name)}</Link>
                      <button
                        className="text-action"
                        onClick={() => {
                          dispatch(gardenActions.toggled({ list: 'compare', id: p.id }));
                        }}
                        aria-label={t('removeCompare', { name: localized(p.name) })}
                      >
                        ×
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['price', 'light', 'size', 'effort', 'stock'] as const).map((row) => (
                  <tr key={row}>
                    <th scope="row">{t(row)}</th>
                    {products.map((p) => {
                      const profile = plantProfile(p.slug);
                      const key = row === 'effort' ? 'care' : row;
                      return (
                        <td key={p.id}>
                          {row === 'price'
                            ? format.currency(p.price, p.currency)
                            : row === 'stock'
                              ? t(p.inStock ? 'yes' : 'no')
                              : t(profile?.[key as keyof PlantProfile] ?? 'unknown')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              dispatch(gardenActions.cleared('compare'));
            }}
          >
            {t('clear')}
          </Button>
        </>
      ) : (
        <div className="garden-empty">
          <Columns3 size={40} aria-hidden="true" />
          <h2>{t('empty')}</h2>
          <p>{t('emptyBody')}</p>
        </div>
      )}
      <div className="garden-actions">
        <Button as="a" href="/catalog">
          {t('chooseProducts')}
        </Button>
      </div>
      {!!garden.compare.length && !products.length && (
        <Button
          variant="ghost"
          onClick={() => {
            dispatch(gardenActions.cleared('compare'));
          }}
        >
          {t('clear')}
        </Button>
      )}
      <p className="garden-note">{t('profileNote')}</p>
    </Container>
  );
};
export const StudioPage = () => {
  const { t } = useTranslation(['garden', 'common']);
  return (
    <Container as="section" className="garden-page">
      <Heading title={t('studio')} lead={t('studioIntro')} />
      <div className="studio-page-panel">
        <PlantStudio headingLevel={2} />
      </div>
    </Container>
  );
};
