import { useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import type { Review } from '../model/schema';
import { RatingStars } from './rating-stars';

export interface ReviewCardProps {
  review: Review;
  /** `compact` is the floating hero card (node 22:58); `default` is the section card (22:184). */
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * One customer review — avatar, name, stars, quote.
 *
 * A `<figure>` with a `<blockquote>` and `<figcaption>`, so the relationship
 * between the words and who said them survives without the layout.
 */
export const ReviewCard = ({ review, variant = 'default', className }: ReviewCardProps) => {
  const { localized } = useLocale();
  const isCompact = variant === 'compact';

  return (
    <figure
      className={cn(
        'flex flex-col rounded-control border-(length:--border-width-panel) border-border-glass',
        'bg-surface-glass backdrop-blur-panel',
        isCompact ? 'gap-4 p-6 sm:p-8' : 'gap-5 p-7 sm:p-8',
        className,
      )}
    >
      <figcaption className="flex items-center gap-4">
        <img
          src={review.avatarUrl}
          alt=""
          width={isCompact ? 60 : 71}
          height={isCompact ? 60 : 71}
          loading="lazy"
          className={cn(
            'rounded-avatar bg-surface-footer object-cover',
            isCompact ? 'size-(--size-avatar-sm)' : 'size-(--size-avatar)',
          )}
        />
        <div className="flex flex-col gap-1">
          <span className="text-lg font-(--font-weight-heading) text-ink">{review.author}</span>
          <RatingStars rating={review.rating} />
        </div>
      </figcaption>
      <blockquote
        className={cn('text-ink-muted', isCompact ? 'line-clamp-3 text-sm' : 'text-base')}
      >
        {localized(review.text)}
      </blockquote>
    </figure>
  );
};
