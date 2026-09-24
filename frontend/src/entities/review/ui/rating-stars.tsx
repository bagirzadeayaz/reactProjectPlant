import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/lib/cn';
import { Icon } from '../../../shared/ui';

export interface RatingStarsProps {
  rating: number;
  max?: number;
  className?: string;
}

/**
 * Five stars, the filled ones counting the rating — node 22:154.
 *
 * One `role="img"` with the rating in words, so a screen reader hears
 * "Rated 4 out of 5" instead of five separate "star" images.
 */
export const RatingStars = ({ rating, max = 5, className }: RatingStarsProps) => {
  const { t } = useTranslation('product');

  return (
    <div
      role="img"
      aria-label={t('ratingOf', { rating })}
      className={cn('flex gap-1 text-ink', className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          className={cn('size-4', index < rating ? 'fill-current' : 'opacity-40')}
        />
      ))}
    </div>
  );
};
