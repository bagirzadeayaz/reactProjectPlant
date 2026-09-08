import { useTranslation } from 'react-i18next';
import { LOCALES, type Locale } from '../../../shared/api';
import { useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';

export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Switches the UI language.
 *
 * Two options, so a segmented control rather than a select: both choices stay
 * visible and one click moves between them. It is a group of toggle buttons —
 * `aria-pressed` says which is active, and the group carries the label, so a
 * screen reader hears "Language, English, pressed" rather than a bare "EN".
 */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {LOCALES.map((option: Locale) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={isActive}
            onClick={() => {
              setLocale(option);
            }}
            className={cn(
              'rounded-icon px-3 py-1 text-sm uppercase transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer',
              isActive ? 'bg-surface-glass text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            <span aria-hidden="true">{option}</span>
            <span className="sr-only">{t(`language.${option}`)}</span>
          </button>
        );
      })}
    </div>
  );
};
