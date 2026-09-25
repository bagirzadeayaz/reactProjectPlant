import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewCard, type Review } from '../../../entities/review';
import { cn } from '../../../shared/lib/cn';
import { Icon } from '../../../shared/ui';

export interface ReviewCarouselProps {
  reviews: readonly Review[];
}

const arrowClass = cn(
  'flex size-(--size-icon-button) items-center justify-center rounded-icon',
  'border-(length:--border-width-control) border-border-control text-ink-muted',
  'transition-colors hover:border-ink hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
);

/**
 * Section 6 — the three review cards (nodes 22:184 / 22:183 / 22:182, 512 × 414).
 *
 * On desktop they sit in the same three-column grid as the products. Below lg
 * the row becomes a scroll-snap carousel: one card per swipe, native inertia,
 * and arrow buttons for anyone without a touch screen. It is a `region` with
 * a name, so a screen reader can jump to it and past it.
 */
export const ReviewCarousel = ({ reviews }: ReviewCarouselProps) => {
  const { t } = useTranslation('home');
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: -1 | 1): void => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div role="region" aria-label={t('review.carouselLabel')} className="review-track">
      <ul
        ref={trackRef}
        className={cn(
          'flex snap-x snap-mandatory gap-gutter overflow-x-auto pb-4',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'lg:grid lg:grid-cols-3 lg:overflow-visible',
        )}
      >
        {reviews.map((review) => (
          <li key={review.id} className="w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-auto">
            <ReviewCard review={review} className="h-full" />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center gap-4 lg:hidden">
        <button
          type="button"
          onClick={() => {
            scrollBy(-1);
          }}
          aria-label={t('review.prev')}
          className={arrowClass}
        >
          <Icon name="chevron-left" />
        </button>
        <button
          type="button"
          onClick={() => {
            scrollBy(1);
          }}
          aria-label={t('review.next')}
          className={arrowClass}
        >
          <Icon name="chevron-right" />
        </button>
      </div>
    </div>
  );
};
