import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CloudRain, Moon, Pause, Play, RotateCcw, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../../../shared/ui';
import type { BotanicalOptions, createBotanicalScene } from '../lib/botanical-scene';

export const BotanicalWorld = () => {
  const { t } = useTranslation('garden');
  const reducedMotion = useReducedMotion() ?? false;
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof createBotanicalScene> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [night, setNight] = useState(false);
  const [rain, setRain] = useState(false);
  const [growth, setGrowth] = useState(80);
  const [paused, setPaused] = useState(false);
  const options = useRef<BotanicalOptions>({ night, rain, growth, paused, reducedMotion });

  useEffect(() => {
    const next = { night, rain, growth, paused, reducedMotion };
    options.current = next;
    controller.current?.update(next);
  }, [night, rain, growth, paused, reducedMotion]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let cancelled = false;
    const fail = () => {
      controller.current?.dispose();
      controller.current = null;
      if (!cancelled) setStatus('error');
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void import('../lib/botanical-scene')
          .then(({ createBotanicalScene: create }) => {
            if (cancelled) return;
            controller.current = create(element, fail);
            controller.current.update(options.current);
            setStatus('ready');
          })
          .catch(fail);
      },
      { rootMargin: '250px' },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      controller.current?.dispose();
      controller.current = null;
    };
  }, [attempt]);

  const stage =
    growth < 35 ? 'sprout' : growth < 65 ? 'young' : growth < 90 ? 'unfurling' : 'canopy';
  const reset = () => {
    setNight(false);
    setRain(false);
    setGrowth(80);
    setPaused(false);
    controller.current?.reset();
  };
  return (
    <Container
      as="section"
      id="little-world"
      className="botanical-section"
      aria-labelledby="botanical-title"
    >
      <div className="botanical-world" data-night={night}>
        <div className="botanical-heading">
          <h2 id="botanical-title">{t('world.title')}</h2>
          <p>{t('world.description')}</p>
        </div>
        <div className="botanical-light" role="group" aria-label={t('world.lighting')}>
          <button
            type="button"
            aria-pressed={!night}
            onClick={() => {
              setNight(false);
            }}
            disabled={status !== 'ready'}
          >
            <Sun size={20} />
            {t('world.day')}
          </button>
          <button
            type="button"
            aria-pressed={night}
            onClick={() => {
              setNight(true);
            }}
            disabled={status !== 'ready'}
          >
            <Moon size={20} />
            {t('world.night')}
          </button>
        </div>
        <div className="botanical-stage" aria-busy={status === 'loading'}>
          <canvas
            key={attempt}
            ref={canvas}
            tabIndex={status === 'ready' ? 0 : -1}
            role="img"
            aria-label={t('world.canvas')}
            aria-describedby="botanical-hint"
          />
          {status !== 'ready' && (
            <div className="botanical-fallback" role="status">
              <img
                src="/plants/calat-o2-plant-800.webp"
                alt=""
                width={800}
                height={800}
                loading="lazy"
              />
              <p>{t(status === 'error' ? 'world.unavailable' : 'world.loading')}</p>
              {status === 'error' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('loading');
                    setAttempt((current) => current + 1);
                  }}
                >
                  {t('world.retry')}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="botanical-hint" id="botanical-hint">
          {t('world.hint')}
        </p>
        <div className="botanical-controls">
          <button
            type="button"
            className="botanical-rain"
            aria-pressed={rain}
            disabled={status !== 'ready'}
            onClick={() => {
              setRain((value) => !value);
            }}
          >
            <CloudRain size={23} />
            {t(rain ? 'world.stopRain' : 'world.rain')}
          </button>
          <label className="botanical-growth">
            <span className="botanical-growth-label">
              {t('world.growth')}
              <small>{t(`world.stages.${stage}`)}</small>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={growth}
              aria-label={t('world.growth')}
              aria-valuetext={t(`world.stages.${stage}`)}
              disabled={status !== 'ready'}
              onChange={(event) => {
                setGrowth(Number(event.target.value));
              }}
            />
          </label>
          <div className="botanical-tools">
            {!reducedMotion && (
              <button
                type="button"
                aria-label={t(paused ? 'world.play' : 'world.pause')}
                title={t(paused ? 'world.play' : 'world.pause')}
                disabled={status !== 'ready'}
                onClick={() => {
                  setPaused((value) => !value);
                }}
              >
                {paused ? <Play size={21} /> : <Pause size={21} />}
              </button>
            )}
            <button
              type="button"
              aria-label={t('world.reset')}
              title={t('world.reset')}
              disabled={status !== 'ready'}
              onClick={reset}
            >
              <RotateCcw size={21} />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};
