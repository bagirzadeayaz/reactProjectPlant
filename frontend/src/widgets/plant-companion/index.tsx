import { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Droplets, Hand, Heart, Moon, Sparkles, CircleAlert } from 'lucide-react';
import {
  companionActions,
  selectCompanion,
  type CompanionPreferences,
} from '../../entities/companion';
import { Modal, useToast } from '../../shared/ui';
import { useCompanionDrag } from './use-companion-drag';
import './companion.css';

const atNight = () => {
  const hour = new Date().getHours();
  return hour >= 21 || hour < 7;
};
const personalities = ['curious', 'cheerful', 'calm'] as const;
const pots = ['terracotta', 'sage', 'cream'] as const;

const Pip = ({
  pot,
  mood,
  personality,
  moving,
}: {
  pot: CompanionPreferences['pot'];
  mood: string;
  personality: CompanionPreferences['personality'];
  moving: boolean;
}) => (
  <span
    className="pip"
    data-pot={pot}
    data-mood={mood}
    data-personality={personality}
    data-moving={moving}
    aria-hidden="true"
  >
    <span className="pip__body">
      <img
        className="pip__leaves"
        src="/companion/pip-leaves.webp"
        alt=""
        width="360"
        height="360"
        draggable={false}
      />
      <span className="pip__pot">
        <span className="pip__rim" />
        <span className="pip__face">
          <i />
          <b />
          <i />
        </span>
        <span className="pip__blush" />
      </span>
    </span>
    <span className="pip__effect">
      {mood === 'error' ? (
        <CircleAlert />
      ) : mood === 'sleep' ? (
        <Moon />
      ) : mood === 'water' ? (
        <Droplets />
      ) : mood === 'hello' ? (
        <Heart />
      ) : (
        <Sparkles />
      )}
    </span>
    {mood === 'water' && (
      <span className="pip__rain">
        <i />
        <i />
        <i />
        <i />
      </span>
    )}
    <span className="pip__shadow" />
  </span>
);

export const PlantCompanion = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { toasts } = useToast();
  const announcing = toasts.length > 0;
  const { preferences, panelOpen, reaction, revision } = useSelector(selectCompanion);
  const dragHelpId = useId();
  const drag = useCompanionDrag(
    preferences.position,
    (position) => {
      dispatch(companionActions.configured({ position }));
    },
    () => {
      dispatch(companionActions.opened());
    },
  );
  const reducedMotion = useReducedMotion();
  const [night, setNight] = useState(atNight);
  const [visible, setVisible] = useState(() => !document.hidden);
  const excluded = /^\/(admin|checkout|cart)(\/|$)/.test(pathname);
  const moving = preferences.animated && !reducedMotion && visible;
  const mood = announcing
    ? toasts.some((toast) => toast.tone === 'error')
      ? 'error'
      : 'cart'
    : reaction === 'idle' && night
      ? 'sleep'
      : reaction;
  useEffect(() => {
    const refresh = () => {
      setVisible(!document.hidden);
      setNight(atNight());
    };
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  useEffect(() => {
    dispatch(companionActions.closed());
    dispatch(companionActions.settled());
    if (/^\/catalog\/[^/]+$/.test(pathname)) dispatch(companionActions.reacted('peek'));
  }, [pathname, dispatch]);
  useEffect(() => {
    if (reaction === 'idle') return;
    const timer = window.setTimeout(() => dispatch(companionActions.settled()), 4500);
    return () => {
      clearTimeout(timer);
    };
  }, [reaction, revision, dispatch]);
  if ((excluded || !preferences.enabled) && !announcing) return null;
  const message =
    reaction !== 'idle'
      ? t(`companion.reactions.${preferences.personality}.${reaction}`)
      : night
        ? t('companion.sleeping')
        : t('companion.ready');
  return (
    <>
      <aside
        className="plant-companion"
        aria-label={t('companion.name')}
        style={drag.style}
        data-side={drag.side}
        data-bubble-below={drag.bubbleBelow}
        data-dragging={drag.dragging}
        data-dock={drag.dock}
        data-announcing={announcing}
      >
        {announcing ? (
          <div
            className="plant-companion__bubble plant-companion__messages"
            style={drag.bubbleStyle}
            aria-label={t('a11y.notifications')}
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="companion-message" data-tone={toast.tone}>
                <p role={toast.tone === 'error' ? 'alert' : 'status'}>{toast.message}</p>
              </div>
            ))}
          </div>
        ) : (
          reaction !== 'idle' && (
            <p className="plant-companion__bubble" style={drag.bubbleStyle}>
              {message}
            </p>
          )
        )}
        <span id={dragHelpId} className="sr-only">
          {t('companion.dragHint')}
        </span>
        <button
          className="plant-companion__launcher"
          {...drag.handlers}
          onClick={(event) => {
            if (event.detail === 0 || !drag.consumeDrag()) dispatch(companionActions.opened());
          }}
          aria-label={t('companion.open')}
          aria-describedby={dragHelpId}
          aria-haspopup="dialog"
        >
          <Pip
            pot={preferences.pot}
            mood={mood}
            personality={preferences.personality}
            moving={moving}
          />
        </button>
      </aside>
      <Modal
        isOpen={panelOpen}
        onClose={() => dispatch(companionActions.closed())}
        title={t('companion.title')}
        closeLabel={t('companion.close')}
        className="companion-dialog"
      >
        <p className="companion-intro">{t('companion.intro')}</p>
        <div className="companion-preview">
          <Pip
            pot={preferences.pot}
            mood={mood}
            personality={preferences.personality}
            moving={moving}
          />
        </div>
        <p className="companion-response" role="status" aria-live="polite">
          {message}
        </p>
        <div className="companion-play">
          <button onClick={() => dispatch(companionActions.reacted('water'))}>
            <Droplets size={19} />
            {t('companion.water')}
          </button>
          <button onClick={() => dispatch(companionActions.reacted('hello'))}>
            <Hand size={19} />
            {t('companion.hello')}
          </button>
        </div>
        <fieldset className="companion-options">
          <legend>{t('companion.personality')}</legend>
          <div className="companion-personalities">
            {personalities.map((value) => (
              <button
                key={value}
                aria-pressed={preferences.personality === value}
                onClick={() => dispatch(companionActions.configured({ personality: value }))}
              >
                {t(`companion.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="companion-options">
          <legend>{t('companion.pot')}</legend>
          <div className="companion-pots">
            {pots.map((value) => (
              <button
                key={value}
                aria-pressed={preferences.pot === value}
                onClick={() => dispatch(companionActions.configured({ pot: value }))}
              >
                <span data-pot={value} />
                {t(`companion.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="companion-settings">
          <label>
            <input
              type="checkbox"
              checked={preferences.animated && !reducedMotion}
              disabled={Boolean(reducedMotion)}
              onChange={(e) =>
                dispatch(companionActions.configured({ animated: e.target.checked }))
              }
            />
            {t('companion.animate')}
          </label>
          <button onClick={() => dispatch(companionActions.hidden())}>{t('companion.hide')}</button>
        </div>
        <p className="companion-hint">{t('companion.dragHint')}</p>
        <p className="companion-hint">
          {reducedMotion ? t('companion.reducedMotion') : t('companion.restore')}
        </p>
      </Modal>
    </>
  );
};
