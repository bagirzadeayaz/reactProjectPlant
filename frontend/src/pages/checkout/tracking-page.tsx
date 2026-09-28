import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Package, Truck, Leaf } from 'lucide-react';
import { Button, Container } from '../../shared/ui';
import { GardenNav } from '../../features/garden-tools';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { readReceipt, saveReceipt } from './receipt';
const STAGES = ['received', 'packed', 'transit', 'delivered'] as const;
const ICONS = [Check, Package, Truck, Leaf];
export const TrackingPage = () => {
  const { t } = useTranslation('garden');
  const [receipt, setReceipt] = useState(readReceipt);
  const [playing, setPlaying] = useState(false);
  const stage = receipt?.stage ?? 0;
  const advance = () => {
    if (!receipt) return;
    const next = { ...receipt, stage: Math.min(3, stage + 1) };
    saveReceipt(next);
    setReceipt(next);
  };
  useEffect(() => {
    if (!playing || !receipt || stage === 3) return;
    const timer = setTimeout(() => {
      const next = { ...receipt, stage: stage + 1 };
      saveReceipt(next);
      setReceipt(next);
    }, 2500);
    return () => {
      clearTimeout(timer);
    };
  }, [playing, receipt, stage]);
  const Icon = ICONS[stage] ?? Check;
  const key = STAGES[stage] ?? 'received';
  return (
    <Container as="section" className="garden-page">
      <DocumentMeta title={t('tracking') + ' · Planto.'} description={t('simulationNote')} />
      <p className="editorial-eyebrow">{t('simulation')}</p>
      <h1 className="editorial-title">{t('journeyTitle')}</h1>
      <p className="editorial-lead">{t('simulationNote')}</p>
      <GardenNav />
      {!receipt ? (
        <div className="garden-empty">
          <Package size={48} aria-hidden="true" />
          <p>{t('trackingEmpty')}</p>
          <Button
            onClick={() => {
              const example = {
                reference: 'PREVIEW-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
                total: 35,
                count: 1,
                delivery: 'delivery' as const,
                stage: 0,
              };
              saveReceipt(example);
              setReceipt(example);
            }}
          >
            {t('startExample')}
          </Button>
        </div>
      ) : (
        <div className="journey-panel">
          <div className="journey-art" data-stage={stage}>
            <Icon size={80} strokeWidth={1} aria-hidden="true" />
            <span className="journey-orbit" />
          </div>
          <p className="editorial-eyebrow">{receipt.reference}</p>
          <div role="status">
            <h2>{t(key)}</h2>
            <p>{t((key + 'Body') as 'receivedBody')}</p>
          </div>
          <ol className="journey-steps">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={i <= stage ? 'is-complete' : ''}
                aria-current={i === stage ? 'step' : undefined}
              >
                <span>{i < stage ? <Check size={18} aria-hidden="true" /> : i + 1}</span>
                {t(s)}
              </li>
            ))}
          </ol>
          <div className="garden-actions">
            <Button
              disabled={stage === 3}
              onClick={() => {
                setPlaying(false);
                advance();
              }}
            >
              {t('advance')}
            </Button>
            <Button
              variant="ghost"
              disabled={stage === 3}
              onClick={() => {
                setPlaying(!playing);
              }}
            >
              {t(playing && stage < 3 ? 'pause' : 'play')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPlaying(false);
                const next = { ...receipt, stage: 0 };
                saveReceipt(next);
                setReceipt(next);
              }}
            >
              {t('restart')}
            </Button>
          </div>
          <Button as="a" href="/care#calendar">
            {t('checkGuide')}
          </Button>
        </div>
      )}
    </Container>
  );
};
