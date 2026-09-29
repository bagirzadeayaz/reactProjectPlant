import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion, type MotionStyle } from 'framer-motion';
import {
  Sun,
  Moon,
  Droplets,
  Shuffle,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { companionActions } from '../../../entities/companion';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery, productImageSources } from '../../../entities/product';
import { useLocale, useFormatters } from '../../../shared/i18n';
import { Button, ResponsiveImage } from '../../../shared/ui';

const SLUGS = ['calathea-plant', 'desk-plant', 'cal-874-plant'];
const ROOMS = ['minimal', 'cozy', 'gallery'] as const;
type Room = (typeof ROOMS)[number];
// Measured transparent image margins and table heights keep pots on the surface.
const BASELINE: Record<string, number> = {
  'calathea-plant': 4.9,
  'desk-plant': 11.5,
  'cal-874-plant': 3.8,
};
const SURFACE: Record<Room, number> = { minimal: 72, cozy: 68, gallery: 74 };

export const PlantStudio = ({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) => {
  const dispatch = useDispatch();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const { t } = useTranslation(['home', 'garden']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const reducedMotion = useReducedMotion();
  const { data, isLoading, isError, refetch } = useGetProductsQuery({ perPage: 100 });
  const [selected, setSelected] = useState(SLUGS[0]);
  const [room, setRoom] = useState<Room>('minimal');
  const [evening, setEvening] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState(50);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [watering, setWatering] = useState(false);
  const [watered, setWatered] = useState(false);
  const plants = SLUGS.flatMap((slug) => data?.items.find((plant) => plant.slug === slug) ?? []);
  const plant = plants.find((item) => item.slug === selected) ?? plants[0];
  const animate = motionEnabled && !reducedMotion;
  const duration = animate ? 0.55 : 0;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSelected((previous) => {
        const available = SLUGS.filter((slug) => data?.items.some((item) => item.slug === slug));
        return available[(available.indexOf(previous ?? '') + 1) % available.length] ?? previous;
      });
      setRoom((previous) => ROOMS[(ROOMS.indexOf(previous) + 1) % ROOMS.length] ?? 'minimal');
      setWatered(false);
    }, 5000);
    const hide = (): void => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [playing, data]);
  useEffect(() => {
    if (!watering) return;
    const timer = window.setTimeout(() => {
      setWatering(false);
    }, 2200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [watering]);

  const reset = (): void => {
    setSelected(SLUGS[0]);
    setRoom('minimal');
    setEvening(false);
    setZoom(100);
    setPosition(50);
    setPlaying(false);
    setWatering(false);
    setWatered(false);
  };
  if (isLoading)
    return (
      <div className="rs-loading" role="status">
        <Sparkles aria-hidden="true" />
        {t('studio.loading')}
      </div>
    );
  if (isError)
    return (
      <div className="rs-loading">
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
  if (!plant) return <p className="rs-loading">{t('studio.empty')}</p>;

  return (
    <div className="room-studio" data-motion={animate ? 'on' : 'off'}>
      <div className={`rs-canvas${evening ? ' rs-canvas--evening' : ''}`}>
        <div className="rs-room-art" aria-hidden="true">
          {ROOMS.map((key) => (
            <motion.img
              key={key}
              src={`/rooms/${key}.webp`}
              alt=""
              width={1400}
              height={933}
              initial={false}
              animate={{ opacity: key === room ? 1 : 0 }}
              transition={{ duration }}
            />
          ))}
        </div>
        <div className="rs-evening-light" aria-hidden="true" />
        <div className="rs-sunbeam" aria-hidden="true" />
        <div className="rs-canvas-top">
          <span className="rs-scene-label">
            {evening ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}{' '}
            {t(`garden:${room}`)} · {t(evening ? 'studio.evening' : 'studio.day')}
          </span>
          <button
            type="button"
            className="rs-motion"
            aria-pressed={animate}
            disabled={!!reducedMotion}
            aria-label={t(animate ? 'studio.pauseMotion' : 'studio.enableMotion')}
            onClick={() => {
              setMotionEnabled(!motionEnabled);
            }}
          >
            <Sparkles size={18} aria-hidden="true" />
          </button>
        </div>
        <motion.div
          className="rs-plant-anchor"
          style={{ '--zoom': zoom / 100 } as MotionStyle}
          initial={false}
          animate={{ left: `${String(position)}%`, bottom: `${String(100 - SURFACE[room])}%` }}
          transition={{ duration }}
        >
          <div className="rs-contact-shadow" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={plant.id}
              className="rs-plant-art"
              initial={animate ? { opacity: 0, y: 12, scale: 0.92 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: animate ? -8 : 0 }}
              transition={{ duration: duration * 0.6 }}
            >
              <div
                className="rs-sway"
                style={{ '--baseline': `${String(BASELINE[plant.slug] ?? 0)}%` } as CSSProperties}
              >
                <ResponsiveImage
                  src={plant.imageUrl}
                  sources={productImageSources(plant)}
                  width={800}
                  height={800}
                  alt={localized(plant.name)}
                  sizes="(max-width: 700px) 240px, 500px"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>
          {watering && (
            <div className="rs-water" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((n) => (
                <Droplets key={n} style={{ '--drop': n } as CSSProperties} />
              ))}
            </div>
          )}
        </motion.div>
        <div className="rs-scene-actions">
          <button
            type="button"
            aria-pressed={playing}
            onClick={() => {
              setPlaying(!playing);
            }}
          >
            {playing ? (
              <Pause size={17} aria-hidden="true" />
            ) : (
              <Play size={17} aria-hidden="true" />
            )}
            {t(playing ? 'studio.pausePreview' : 'studio.playPreview')}
          </button>
          <span aria-hidden="true" />
          <button
            type="button"
            disabled={watering}
            onClick={() => {
              setPlaying(false);
              setWatering(true);
              setWatered(true);
            }}
          >
            <Droplets size={17} aria-hidden="true" />
            {t('studio.water')}
          </button>
        </div>
        {watered && (
          <div className="rs-care-message" role="status">
            {t('studio.waterTip')}
            <button
              type="button"
              onClick={() => {
                setWatered(false);
                setWatering(false);
              }}
              aria-label={t('studio.dismissTip')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="rs-controls">
        <div className="rs-product-summary">
          <img src={plant.imageUrl} alt="" width={64} height={72} />
          <div>
            <Heading>{localized(plant.name)}</Heading>
            <p>{format.currency(plant.price, plant.currency)}</p>
          </div>
        </div>
        <fieldset className="rs-plants">
          <legend className="sr-only">{t('studio.choosePlant')}</legend>
          <div>
            {plants.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === plant.id}
                aria-label={localized(item.name)}
                onClick={() => {
                  setPlaying(false);
                  setSelected(item.slug);
                  dispatch(companionActions.reacted('studio'));
                  setWatered(false);
                  setWatering(false);
                }}
              >
                <img src={item.imageUrl} alt="" width={80} height={80} />
                <span>{localized(item.name)}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="rs-segment">
          <legend>{t('studio.roomMood')}</legend>
          <div>
            {ROOMS.map((key) => (
              <button
                type="button"
                key={key}
                aria-pressed={room === key}
                onClick={() => {
                  setPlaying(false);
                  setRoom(key);
                  dispatch(companionActions.reacted('studio'));
                }}
              >
                {t(`garden:${key}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="rs-segment">
          <legend>{t('studio.lightLabel')}</legend>
          <div>
            {[false, true].map((night) => (
              <button
                type="button"
                key={String(night)}
                aria-pressed={evening === night}
                onClick={() => {
                  setEvening(night);
                }}
              >
                {night ? (
                  <Moon size={17} aria-hidden="true" />
                ) : (
                  <Sun size={17} aria-hidden="true" />
                )}
                {t(night ? 'studio.evening' : 'studio.day')}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="rs-range">
          <span>
            {t('studio.plantSize')}
            <output>{zoom}%</output>
          </span>
          <input
            type="range"
            min={80}
            max={115}
            step={5}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
          />
        </label>
        <label className="rs-range">
          <span>
            {t('studio.position')}
            <output>
              {t(position < 48 ? 'studio.left' : position > 52 ? 'studio.right' : 'studio.center')}
            </output>
          </span>
          <input
            type="range"
            min={38}
            max={62}
            step={1}
            value={position}
            onChange={(e) => {
              setPosition(Number(e.target.value));
            }}
          />
        </label>
        <div className="rs-tools">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setRoom(
                ROOMS[(ROOMS.indexOf(room) + 1 + Math.floor(Math.random() * 2)) % 3] ?? 'minimal',
              );
              setSelected(plants[(plants.indexOf(plant) + 1) % plants.length]?.slug);
              setEvening(Math.random() > 0.5);
              setWatered(false);
              setWatering(false);
            }}
          >
            <Shuffle size={17} aria-hidden="true" />
            {t('studio.shuffle')}
          </button>
          <button type="button" onClick={reset}>
            <RotateCcw size={17} aria-hidden="true" />
            {t('studio.reset')}
          </button>
        </div>
        <Link className="rs-product-link" to={`/catalog/${plant.slug}`}>
          {t('studio.viewPlant')}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <p className="rs-scale-note">{t('studio.scaleNote')}</p>
      </div>
    </div>
  );
};
