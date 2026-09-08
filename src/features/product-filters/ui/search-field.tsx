import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../shared/ui';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DEBOUNCE_MS = 300;

/**
 * Free-text search that writes to the URL a beat after typing stops, so the
 * address bar (and the request) do not churn on every keystroke.
 *
 * Local text is the draft; `value` is what the URL currently says. The
 * debounce is a timer armed in the change handler, not an effect, so pushing
 * to the URL is plain event work. A URL change that did *not* come from this
 * field — back button, "clear filters" — is adopted during render (React's
 * "adjust state on prop change" pattern), and `pushed` is what tells the two
 * apart so a push never echoes back as a pull.
 */
export const SearchField = ({ value, onChange }: SearchFieldProps) => {
  const { t } = useTranslation('catalog');
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const [pushed, setPushed] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (value !== seen) {
    setSeen(value);
    if (value !== pushed) {
      setPushed(value);
      setDraft(value);
    }
  }

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const handleChange = (next: string): void => {
    setDraft(next);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPushed(next);
      onChange(next);
    }, DEBOUNCE_MS);
  };

  return (
    <Input
      type="search"
      name="search"
      label={t('searchLabel')}
      placeholder={t('searchPlaceholder')}
      value={draft}
      onChange={(event) => {
        handleChange(event.target.value);
      }}
      autoComplete="off"
    />
  );
};
