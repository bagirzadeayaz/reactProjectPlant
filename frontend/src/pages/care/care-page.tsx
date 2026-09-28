import { Sun, Droplets, Sprout } from 'lucide-react';
import { CarePlanner } from '../../features/care-planner';
import { GardenNav } from '../../features/garden-tools';
import { useTranslation } from 'react-i18next';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { Button, Container, Reveal } from '../../shared/ui';

const TIPS = [
  { title: 'care.lightTitle', body: 'care.lightBody' },
  { title: 'care.waterTitle', body: 'care.waterBody' },
  { title: 'care.spaceTitle', body: 'care.spaceBody' },
] as const;

export const CarePage = () => {
  const { t } = useTranslation(['home', 'common', 'garden']);
  return (
    <Container as="section" className="editorial-page">
      <DocumentMeta title={t('home:care.title') + ' · Planto.'} description={t('home:care.lead')} />
      <div className="editorial-hero">
        <div>
          <p className="editorial-eyebrow">{t('home:care.eyebrow')}</p>
          <h1 className="editorial-title text-ink">{t('home:care.title')}</h1>
          <p className="editorial-lead">{t('home:care.lead')}</p>
          <Button as="a" href="/catalog">
            {t('common:actions.explore')}
          </Button>
        </div>
        <img src="/plants/desk-plant.png" width={391} height={391} alt="" className="plant-float" />
      </div>
      <GardenNav />
      <div className="care-grid">
        {TIPS.map((tip, index) => (
          <Reveal key={tip.title} className="care-card glass-surface">
            <span className="care-number">
              {index === 0 ? (
                <Sun aria-hidden="true" />
              ) : index === 1 ? (
                <Droplets aria-hidden="true" />
              ) : (
                <Sprout aria-hidden="true" />
              )}
            </span>
            <h2>{t(tip.title)}</h2>
            <p>{t(tip.body)}</p>
            <details className="care-tip">
              <summary>{t('garden:checkGuide')}</summary>
              <p>
                {t(
                  index === 0
                    ? 'garden:tipLight'
                    : index === 1
                      ? 'garden:tipWater'
                      : 'garden:tipSpace',
                )}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
      <CarePlanner />
    </Container>
  );
};
