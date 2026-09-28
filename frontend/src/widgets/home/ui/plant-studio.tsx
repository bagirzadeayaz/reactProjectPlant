import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sun, Moon, Droplets, MoveHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery } from '../../../entities/product';
import { useLocale, useFormatters } from '../../../shared/i18n';
import { Button } from '../../../shared/ui';

const SLUGS = ['calathea-plant', 'desk-plant', 'cal-874-plant'];

export const PlantStudio = ({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) => {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const { t } = useTranslation(['home', 'garden']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const reducedMotion = useReducedMotion();
  const { data, isLoading, isError, refetch } = useGetProductsQuery({ perPage: 100 });
  const [selected, setSelected] = useState(SLUGS[0]);
  const [evening, setEvening] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [watered, setWatered] = useState(false);
  const [room, setRoom] = useState('minimal');
  const [wall, setWall] = useState('sage');
  const [pot, setPot] = useState('original');
  const plants = SLUGS.flatMap((slug) => data?.items.find((plant) => plant.slug === slug) ?? []);
  const plant = plants.find((item) => item.slug === selected) ?? plants[0];
  if (isLoading) return <p role="status">{t('studio.loading')}</p>;
  if (isError)
    return (
      <div>
        <p role="alert">{t('studio.error')}</p>
        <Button
          onClick={() => {
            void refetch();
          }}
        >
          {t('studio.retry')}
        </Button>
      </div>
    );
  if (!plant) return <p>{t('studio.empty')}</p>;
  return (
    <div className="plant-studio">
      <div
        className={`studio-scene${evening ? ' studio-scene--evening' : ''}`}
        data-room={room}
        data-wall={wall}
      >
        <div className="studio-scene__window" aria-hidden="true" />
        <div className="studio-scene__label">
          {t(evening ? 'studio.eveningScene' : 'studio.dayScene')}
        </div>
        <div className="studio-room-decor" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="studio-scene__floor" aria-hidden="true" />
        <div className="studio-scene__pedestal" aria-hidden="true" />
        <div className="studio-plant" style={{ transform: `scale(${String(zoom / 100)})` }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={plant.id}
              src={plant.imageUrl}
              alt={localized(plant.name)}
              width={800}
              height={800}
              initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
            />
          </AnimatePresence>
          {pot !== 'original' && (
            <div className={'studio-pot studio-pot--' + pot} aria-hidden="true" />
          )}
        </div>
        {watered && (
          <div className="studio-water" aria-hidden="true">
            <Droplets />
            <Droplets />
            <Droplets />
          </div>
        )}
        <p className="studio-scene__caption">{t('studio.sceneHint')}</p>
      </div>
      <div className="studio-controls">
        <div>
          <p className="studio-eyebrow">{t('studio.eyebrow')}</p>
          <Heading>{localized(plant.name)}</Heading>
          <p className="studio-price">{format.currency(plant.price, plant.currency)}</p>
        </div>
        <p>{t('studio.intro')}</p>
        <fieldset className="studio-picker">
          <legend>{t('studio.choosePlant')}</legend>
          <div>
            {plants.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={plant.id === item.id}
                onClick={() => {
                  setSelected(item.slug);
                  setWatered(false);
                }}
              >
                <img src={item.imageUrl} alt="" width={80} height={80} />
                <span>{localized(item.name)}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="studio-light">
          <legend>{t('studio.light')}</legend>
          <div>
            <button
              type="button"
              aria-pressed={!evening}
              onClick={() => {
                setEvening(false);
              }}
            >
              <Sun aria-hidden="true" />
              {t('studio.day')}
            </button>
            <button
              type="button"
              aria-pressed={evening}
              onClick={() => {
                setEvening(true);
              }}
            >
              <Moon aria-hidden="true" />
              {t('studio.evening')}
            </button>
          </div>
        </fieldset>
        <details className="studio-styling">
          <summary>{t('garden:studio')}</summary>
          <div className="studio-selects">
            {(
              [
                { key: 'room', value: room, set: setRoom, options: ['minimal', 'cozy', 'gallery'] },
                { key: 'wall', value: wall, set: setWall, options: ['sage', 'sand', 'clay'] },
                {
                  key: 'pot',
                  value: pot,
                  set: setPot,
                  options: ['original', 'ceramic', 'terracotta'],
                },
              ] as const
            ).map((control) => (
              <label key={control.key}>
                {t(`garden:${control.key}`)}
                <select
                  aria-label={t(`garden:${control.key}`)}
                  value={control.value}
                  onChange={(e) => {
                    control.set(e.target.value);
                  }}
                >
                  {control.options.map((option) => (
                    <option key={option} value={option}>
                      {t(('garden:' + option) as 'garden:original')}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p>{t('garden:potNote')}</p>
          <button
            className="text-action"
            onClick={() => {
              setRoom('minimal');
              setWall('sage');
              setPot('original');
              setEvening(false);
              setZoom(100);
              setWatered(false);
            }}
          >
            {t('garden:resetRoom')}
          </button>
        </details>
        <label className="studio-zoom">
          <span>
            <MoveHorizontal aria-hidden="true" />
            {t('studio.zoom')}
            <output>{zoom}%</output>
          </span>
          <input
            type="range"
            min={75}
            max={115}
            step={5}
            value={zoom}
            onChange={(event) => {
              setZoom(Number(event.target.value));
            }}
          />
        </label>
        <div className="studio-care">
          <button
            type="button"
            onClick={() => {
              setWatered(!watered);
            }}
            aria-pressed={watered}
          >
            <Droplets aria-hidden="true" />
            {t('studio.water')}
          </button>
          <p role="status">{t(watered ? 'studio.waterTip' : 'studio.careHint')}</p>
        </div>
        <Button as="a" href={`/catalog/${plant.slug}`}>
          {t('studio.viewPlant')}
        </Button>
      </div>
    </div>
  );
};
