import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Sprout,
  CalendarDays,
  Armchair,
  Package,
  Box,
  Play,
  ArrowUpRight,
} from 'lucide-react';
import {
  useGetProductsQuery,
  useGetBasketProductsQuery,
  ProductCard,
  plantProfile,
  matchProfile,
  type PlantProfile,
} from '../../entities/product';
import { gardenActions, selectGarden } from '../../entities/garden';
import { ProductTools } from '../../features/garden-tools';
import { AddToCartButton } from '../../features/add-to-cart';
import { PlantStudio } from '../../widgets/home';
import { Button, Container } from '../../shared/ui';
import { DocumentMeta } from '../../shared/lib/document-meta';

const destinations = [
  ['finder', 'finderIntro', '/finder', Sprout],
  ['care', 'careIntro', '/care#calendar', CalendarDays],
  ['tracking', 'trackIntro', '/tracking', Package],
] as const;
const Heading = ({ title, lead }: { title: string; lead: string }) => {
  return (
    <>
      <DocumentMeta title={title + ' · Planto.'} description={lead} />
      <h1 className="editorial-title">{title}</h1>
      <p className="editorial-lead">{lead}</p>
    </>
  );
};
export const DiscoverPage = () => {
  const { t, i18n } = useTranslation(['garden', 'common']);
  return (
    <Container as="section" className="garden-page explore-hub">
      <Heading title={t('exploreTitle')} lead={t('exploreLead')} />
      <div className="experience-grid">
        <Link to="/#little-world" className="experience-card experience-card--world">
          <img src="/plants/calat-o2-plant-800.webp" alt="" width={800} height={800} />
          <div>
            <Box size={24} aria-hidden="true" />
            <h2>{t('common:nav.world')}</h2>
            <p>{t('worldIntro')}</p>
            <span>
              {t('enterWorld')}
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </div>
        </Link>
        <Link to="/studio" className="experience-card experience-card--room">
          <img src="/rooms/minimal.webp" alt="" width={1200} height={800} />
          <div>
            <Armchair size={24} aria-hidden="true" />
            <h2>{t('studio')}</h2>
            <p>{t('common:nav.studioHint')}</p>
            <span>
              {t('openStudio')}
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
      <a
        className="experience-film"
        href={`/promo.html?lang=${i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'}`}
      >
        <span className="experience-film__play">
          <Play size={22} aria-hidden="true" />
        </span>
        <span>
          <strong>{t('common:nav.film')}</strong>
          <small>{t('common:nav.filmHint')}</small>
        </span>
        <ArrowUpRight size={24} aria-hidden="true" />
      </a>
      <h2 className="experience-help-title">{t('helpChoosing')}</h2>
      <div className="experience-help">
        {destinations.map(([title, body, to, ItemIcon]) => (
          <Link to={to} key={to}>
            <ItemIcon size={23} aria-hidden="true" />
            <span>
              <strong>{t(title)}</strong>
              <small>{t(body)}</small>
            </span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        ))}
      </div>
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
      const profile = plantProfile(product);
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
export { ComparePage } from './compare-page';
export const StudioPage = () => {
  const { t } = useTranslation(['garden', 'home']);
  return (
    <Container as="section" className="room-studio-page">
      <DocumentMeta title={`${t('studio')} · Planto.`} description={t('studioIntro')} />
      <header className="rs-page-heading">
        <h1>{t('studio')}</h1>
        <p>{t('studioIntro')}</p>
      </header>
      <PlantStudio headingLevel={2} />
    </Container>
  );
};
