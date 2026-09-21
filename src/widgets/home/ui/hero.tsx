import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../../shared/lib/cn';
import { Button, Container, Icon } from '../../../shared/ui';

const HERO_BACKGROUND = {
  jpg: '/images/hero-bg.jpg',
  avif: ['/images/hero-bg-960.avif 960w', '/images/hero-bg-1920.avif 1920w'].join(', '),
  webp: ['/images/hero-bg-960.webp 960w', '/images/hero-bg-1920.webp 1920w'].join(', '),
};

export interface HeroProps {
  /** The featured product card (node 22:59) rendered on the right at xl. */
  aside?: React.ReactNode;
  /** The floating review card (node 22:58) rendered under the copy at xl. */
  review?: React.ReactNode;
}

/**
 * Section 1 — nodes 22:37 (heading, 118px semibold), 22:38 (lead, 23px
 * medium, 820 wide), 22:39 (Explore), 22:45 + 22:44 (play + "Live Demo...").
 * The background is node 22:3, a full-bleed photograph 2592 tall.
 *
 * Reflow: two columns from xl (copy left, product card right, review card
 * floating under the copy). Below xl the columns stack — copy, then card,
 * then review — and the display size steps down so "Breath Natural" still
 * fits at 320px without breaking mid-word.
 */
export const Hero = ({ aside, review }: HeroProps) => {
  const { t } = useTranslation(['home', 'common']);
  const reducedMotion = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: reducedMotion ? (false as const) : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : delay },
  });

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      <picture className="pointer-events-none absolute inset-0 -z-10">
        <source type="image/avif" srcSet={HERO_BACKGROUND.avif} sizes="100vw" />
        <source type="image/webp" srcSet={HERO_BACKGROUND.webp} sizes="100vw" />
        <img
          src={HERO_BACKGROUND.jpg}
          alt=""
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover"
        />
      </picture>

      <Container className="grid gap-10 py-12 sm:py-16 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] xl:items-start xl:gap-16 xl:py-20">
        <div className="flex flex-col gap-7">
          <h1
            id="hero-heading"
            className={cn(
              'text-balance font-(--font-weight-heading) leading-none text-ink-muted',
              'text-h1 sm:text-[clamp(3.5rem,8vw,var(--text-display))]',
            )}
          >
            {t('home:hero.title')}
          </h1>
          <motion.p {...entrance(0.05)} className="max-w-[52ch] text-md font-medium text-ink-muted">
            {t('home:hero.lead')}
          </motion.p>

          <motion.div {...entrance(0.12)} className="flex flex-wrap items-center gap-6">
            <Button as="a" href="/catalog">
              {t('common:actions.explore')}
            </Button>
            <button
              type="button"
              className={cn(
                'flex size-(--size-play) items-center justify-center rounded-avatar',
                'border-(length:--border-width-control) border-border-control text-ink-muted',
                'transition-colors hover:border-ink hover:text-ink',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
              )}
              aria-label={t('home:hero.playLabel')}
            >
              <Icon name="play" />
            </button>
            <span className="text-sm font-(--font-weight-heading) text-ink-muted">
              {t('home:hero.liveDemo')}
            </span>
          </motion.div>

          {review !== undefined && (
            <motion.div {...entrance(0.2)} className="max-w-md xl:mt-8">
              {review}
            </motion.div>
          )}
        </div>

        {aside !== undefined && (
          <motion.div {...entrance(0.12)} className="xl:justify-self-end">
            {aside}
          </motion.div>
        )}
      </Container>
    </section>
  );
};
