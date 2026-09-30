import { memo, useEffect, useRef, useState } from 'react';
import type { PipOptions, PipScene } from './pip-scene';

const PipPoster = ({ pot, hidden = false }: { pot: PipOptions['pot']; hidden?: boolean }) => (
  <img
    className="pip__poster"
    src={`/companion/pip-3d-${pot}.png`}
    alt=""
    width="392"
    height="432"
    draggable={false}
    data-hidden={hidden}
  />
);

const PipCanvas = memo(function PipCanvas(options: PipOptions) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(options);
  const scene = useRef<PipScene | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  useEffect(() => {
    latest.current = options;
    scene.current?.update(options);
  }, [options]);
  useEffect(() => {
    let cancelled = false;
    const lose = () => {
      scene.current?.dispose();
      scene.current = null;
      if (!cancelled) setStatus('fallback');
    };
    void import('./pip-scene')
      .then(({ createPipScene }) => {
        if (cancelled || !canvas.current) return;
        scene.current = createPipScene(canvas.current, latest.current, lose, () => {
          if (!cancelled) setStatus('ready');
        });
      })
      .catch(lose);
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);
  return (
    <>
      <PipPoster pot={options.pot} hidden={status === 'ready'} />
      <canvas ref={canvas} className="pip__canvas" data-ready={status === 'ready'} />
    </>
  );
});

export const Pip = ({ active = true, ...options }: PipOptions & { active?: boolean }) => (
  <span
    className="pip"
    data-pot={options.pot}
    data-mood={options.mood}
    data-personality={options.personality}
    data-moving={options.moving}
    aria-hidden="true"
  >
    {active ? <PipCanvas {...options} /> : <PipPoster pot={options.pot} />}
  </span>
);
