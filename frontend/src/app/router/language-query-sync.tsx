import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LANGUAGE_QUERY_PARAM, normalizeLocale, useLocale } from '../../shared/i18n';

/**
 * Keeps `?lang=` and the active language in agreement.
 *
 * Language is a query parameter rather than a path prefix: a prefix would double
 * every entry in the route table for content that differs only in its strings.
 * A switch therefore only ever rewrites the query, so the pathname, the route
 * params and any other search values survive untouched.
 *
 * The direction matters, and getting it wrong loops: `changeLanguage` is async,
 * so a naive "URL wins" effect and a naive "state wins" effect will each see
 * the other's stale value and overwrite it forever. So:
 *
 *  - the URL is read whenever it changes (arrival, a shared link, the back
 *    button) and applied to i18n;
 *  - the URL is written only when the language actually changed since the last
 *    render — that is, when a person switched it.
 *
 * A URL with no `lang` is left alone, so an ordinary link keeps its shape and
 * opens in the reader's own stored or browser language.
 *
 * Renders nothing.
 */
export const LanguageQuerySync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locale, setLocale } = useLocale();
  const urlLocale = searchParams.get(LANGUAGE_QUERY_PARAM);
  const previousLocale = useRef(locale);

  // URL -> i18n.
  useEffect(() => {
    if (urlLocale === null) return;
    const requested = normalizeLocale(urlLocale);
    if (requested !== locale) setLocale(requested);
  }, [urlLocale, locale, setLocale]);

  // i18n -> URL, only for a genuine change of language.
  useEffect(() => {
    if (previousLocale.current === locale) return;
    previousLocale.current = locale;

    if (searchParams.get(LANGUAGE_QUERY_PARAM) === locale) return;

    const next = new URLSearchParams(searchParams);
    next.set(LANGUAGE_QUERY_PARAM, locale);
    // `replace` keeps the back button meaning "the previous page", not
    // "the same page in the previous language".
    setSearchParams(next, { replace: true });
  }, [locale, searchParams, setSearchParams]);

  return null;
};
