import { useState } from 'react';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Container,
  ErrorState,
  Reveal,
  Section,
  SectionHeading,
  Skeleton,
} from '../../shared/ui';
import {
  BestO2,
  FeaturedProductCard,
  Hero,
  ProductBanner,
  ProductGrid,
  ReviewCarousel,
} from '../../widgets/home';
import { ReviewCard } from '../../entities/review';
import { useHomeData } from './use-home-data';

/**
 * The landing page: eight sections from the comp, each a widget or an entity
 * card, all fed from two cached requests.
 *
 * Node 22:60 in Figma groups the hero copy with an Explore button that lives
 * 6000px lower, beside "Best o2". That grouping is not reproduced: the hero
 * and the Best-O₂ section are separate, each with its own button.
 */
export const HomePage = () => {
  const { t } = useTranslation(['home', 'common']);
  const { products, reviews, byCategory, isLoading, isError, refetch } = useHomeData();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  if (isError) {
    return (
      <Container className="py-24">
        <h1 className="sr-only">{t('common:pages.home')}</h1>
        <ErrorState
          title={t('common:state.error')}
          description={t('common:state.errorDetail')}
          action={<Button onClick={refetch}>{t('common:actions.retry')}</Button>}
        />
      </Container>
    );
  }

  const trendy = byCategory('trendy');
  const topSelling = products;
  const bestO2 = byCategory('best-o2');
  const featured = trendy[featuredIndex % Math.max(1, trendy.length)];
  const heroReview = reviews[0];

  return (
    <>
      <DocumentMeta
        title={t('common:meta.siteName')}
        description={t('common:meta.homeDescription')}
      />
      <Hero
        aside={
          featured ? (
            <FeaturedProductCard
              product={featured}
              onNext={() => {
                setFeaturedIndex((current) => current + 1);
              }}
            />
          ) : (
            <Skeleton className="mt-24 h-(--size-hero-card-h) w-full max-w-(--size-column) rounded-card" />
          )
        }
        review={
          heroReview ? (
            <ReviewCard review={heroReview} variant="compact" />
          ) : (
            <Skeleton className="h-(--size-review-compact-h) w-full rounded-control" />
          )
        }
      />

      <Section title={undefined} className="pt-16">
        <SectionHeading id="trendy-heading">{t('home:sections.trendy')}</SectionHeading>
        <div className="mt-14 flex flex-col gap-14 lg:mt-16 lg:gap-16">
          {trendy.slice(0, 2).map((product, index) => (
            <Reveal key={product.id}>
              <ProductBanner product={product} align={index === 0 ? 'left' : 'right'} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading id="top-selling-heading">{t('home:sections.topSelling')}</SectionHeading>
        <Reveal>
          <ProductGrid products={topSelling} isLoading={isLoading} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading id="reviews-heading">{t('home:sections.reviews')}</SectionHeading>
        {reviews.length > 0 ? (
          <Reveal>
            <ReviewCarousel reviews={reviews} />
          </Reveal>
        ) : (
          <div className="grid gap-gutter pt-16 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-(--size-review-h) w-full rounded-control" />
            ))}
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading id="best-o2-heading">{t('home:sections.bestO2')}</SectionHeading>
        {bestO2.length > 0 ? (
          <Reveal>
            <BestO2 products={bestO2} />
          </Reveal>
        ) : (
          <Skeleton className="mt-16 h-(--size-feature-h) w-full rounded-control lg:rounded-panel" />
        )}
      </Section>
    </>
  );
};
