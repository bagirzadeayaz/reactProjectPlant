import { ArrowRight, ArrowUpRight, Armchair, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '../../../shared/ui';

/** An editorial invitation to the existing interactive plant tools. */
export const DiscoveryCallout = () => {
  const { t } = useTranslation('garden');
  return (
    <Container as="section" className="playground-section" aria-labelledby="playground-heading">
      <div className="playground-panel">
        <div className="playground-copy">
          <p className="playground-eyebrow">{t('featureLabel')}</p>
          <h2 id="playground-heading">{t('allFeatures')}</h2>
          <p className="playground-description">{t('playgroundDescription')}</p>
          <Link className="playground-discover" to="/discover">
            {t('nav')}
            <ArrowUpRight size={23} aria-hidden="true" />
          </Link>
        </div>
        <div className="playground-experiences">
          <div className="playground-art" aria-hidden="true">
            <span className="playground-glow" />
            <img
              className="playground-plant playground-plant--tall"
              src="/plants/calat-o2-plant-800.webp"
              width={800}
              height={800}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="playground-plant playground-plant--leafy"
              src="/plants/calathea-plant-800.webp"
              width={800}
              height={800}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="playground-plant playground-plant--small"
              src="/plants/trendy-succulent-400.webp"
              width={400}
              height={400}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="playground-links">
            <Link to="/finder">
              <Compass size={26} strokeWidth={1.5} aria-hidden="true" />
              <span>{t('finder')}</span>
              <ArrowRight size={21} aria-hidden="true" />
            </Link>
            <Link to="/studio">
              <Armchair size={26} strokeWidth={1.5} aria-hidden="true" />
              <span>{t('studio')}</span>
              <ArrowRight size={21} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
};
