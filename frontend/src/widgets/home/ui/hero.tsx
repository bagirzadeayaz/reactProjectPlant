import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button, Container, Icon, Modal } from '../../../shared/ui';
import { PlantStudio } from './plant-studio';

export interface HeroProps {
  aside?: ReactNode;
  review?: ReactNode;
}

export const Hero = ({ aside, review }: HeroProps) => {
  const { t } = useTranslation(['home', 'common']);
  const reducedMotion = useReducedMotion();
  const [demoOpen, setDemoOpen] = useState(false);
  const entrance = (delay: number) => ({
    initial: reducedMotion ? (false as const) : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : delay },
  });
  return (
    <section aria-labelledby="hero-heading" className="hero">
      <Container className="hero__layout">
        <div className="hero__copy">
          <motion.h1 {...entrance(0)} id="hero-heading" className="hero__title">
            {t('home:hero.title')}
          </motion.h1>
          <motion.p {...entrance(0.08)} className="hero__lead">
            {t('home:hero.lead')}
          </motion.p>
          <motion.div {...entrance(0.16)} className="hero__actions">
            <Button as="a" href="/catalog">
              {t('common:actions.explore')}
            </Button>
            <button
              type="button"
              className="demo-trigger"
              onClick={() => {
                setDemoOpen(true);
              }}
              aria-label={t('home:hero.playLabel')}
            >
              <span className="demo-trigger__play">
                <Icon name="play" />
              </span>
              <span className="demo-trigger__label">
                {t('home:hero.liveDemo')}
                <small>{t('home:studio.triggerHint')}</small>
              </span>
            </button>
          </motion.div>
          {review !== undefined && (
            <motion.div {...entrance(0.3)} className="hero__review">
              {review}
            </motion.div>
          )}
        </div>
        {aside !== undefined && (
          <motion.div {...entrance(0.22)} className="hero__aside">
            {aside}
          </motion.div>
        )}
      </Container>
      <Modal
        isOpen={demoOpen}
        onClose={() => {
          setDemoOpen(false);
        }}
        title={t('home:demo.title')}
        closeLabel={t('common:actions.close')}
        className="plant-demo"
      >
        <PlantStudio />
      </Modal>
    </section>
  );
};
