import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Droplets, Check } from 'lucide-react';
import { useGetProductsQuery } from '../../entities/product';
import { gardenActions, selectGarden } from '../../entities/garden';
import { useLocale } from '../../shared/i18n';
import { Button } from '../../shared/ui';
export const CarePlanner = () => {
  const { t } = useTranslation(['garden', 'common']);
  const { locale, localized } = useLocale();
  const dispatch = useDispatch();
  const { checked } = useSelector(selectGarden);
  const query = useGetProductsQuery({ perPage: 100 });
  const [selected, setSelected] = useState('');
  const [interval, setIntervalDays] = useState(7);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const plants = query.data?.items ?? [];
  const plant = plants.find((p) => p.id === selected) ?? plants[0];
  const monthKey =
    String(month.getFullYear()) + '-' + String(month.getMonth() + 1).padStart(2, '0');
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const count = plant
    ? checked.filter((key) => key.startsWith(plant.id + ':' + monthKey + '-')).length
    : 0;
  const week = t('weekdays', { returnObjects: true });
  return (
    <section id="calendar" className="care-planner">
      <div className="planner-intro">
        <CalendarArt />
        <div>
          <p className="editorial-eyebrow">{t('care')}</p>
          <h2>{t('month')}</h2>
          <p>{t('careIntro')}</p>
        </div>
      </div>
      {query.isError ? (
        <Button
          onClick={() => {
            void query.refetch();
          }}
        >
          {t('common:actions.retry')}
        </Button>
      ) : query.isLoading ? (
        <p role="status">{t('common:state.loading')}</p>
      ) : !plant ? (
        <p>{t('noMatches')}</p>
      ) : (
        <>
          <div className="planner-selects">
            <label>
              {t('choose')}
              <select
                value={plant.id}
                onChange={(e) => {
                  setSelected(e.target.value);
                }}
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {localized(p.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('interval')}
              <select
                value={interval}
                onChange={(e) => {
                  setIntervalDays(Number(e.target.value));
                }}
              >
                {[7, 14, 21].map((n) => (
                  <option key={n} value={n}>
                    {t('days', { count: n })}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="calendar-heading">
            <button
              aria-label={t('previousMonth')}
              onClick={() => {
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
              }}
            >
              <ChevronLeft />
            </button>
            <h3 aria-live="polite">
              {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)}
            </h3>
            <button
              aria-label={t('nextMonth')}
              onClick={() => {
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
              }}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="calendar-week" aria-hidden="true">
            {week.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-days">
            {Array.from({ length: offset }, (_, i) => (
              <span key={'blank' + String(i)} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
              const key = plant.id + ':' + monthKey + '-' + String(i + 1).padStart(2, '0');
              const done = checked.includes(key);
              const scheduled = i % interval === 0;
              return (
                <button
                  key={i}
                  aria-pressed={done}
                  aria-label={t('mark', {
                    date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date),
                    state: done ? t('completed') : scheduled ? t('scheduled') : t('care'),
                  })}
                  className={done ? 'is-checked' : scheduled ? 'is-scheduled' : ''}
                  onClick={() => {
                    dispatch(gardenActions.checked(key));
                  }}
                >
                  <span>{i + 1}</span>
                  {done ? (
                    <Check size={14} aria-hidden="true" />
                  ) : scheduled ? (
                    <Droplets size={14} aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>
              <Droplets size={16} />
              {t('scheduled')}
            </span>
            <span>
              <Check size={16} />
              {t('completed')}
            </span>
          </div>
          <p role="status">{t('done', { count })}</p>
          <p className="garden-note">{t('calendarHint')}</p>
        </>
      )}
    </section>
  );
};
const CalendarArt = () => (
  <div className="calendar-art" aria-hidden="true">
    <Droplets size={44} />
    <img src="/plants/cal-874-plant.png" alt="" width={180} height={180} />
  </div>
);
