import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export interface RouteAnnouncerProps {
  /** Where focus should land after a navigation. Usually the <main> element. */
  contentRef: React.RefObject<HTMLElement | null>;
}

/** Longest we wait for a lazy route's heading before announcing the path instead. */
const HEADING_TIMEOUT_MS = 2000;

/** jsdom has no layout engine and logs a "not implemented" error for scrollTo. */
const scrollToTop = (): void => {
  try {
    globalThis.scrollTo({ top: 0, behavior: 'auto' });
  } catch {
    // No scrollable window (tests, SSR). Nothing to restore.
  }
};

/**
 * Makes a client-side navigation behave like a real one.
 *
 * A browser announces the new page and resets focus on a full load; a router
 * swapping children does neither, so a screen-reader user hears nothing and a
 * keyboard user carries on tabbing from wherever they were.
 *
 * Every route here is code-split, so at the moment the path changes the new
 * page is still a Suspense fallback and its `<h1>` does not exist yet. Reading
 * the heading immediately would announce the raw URL and leave focus on the
 * spinner — so this waits for the heading to appear, and falls back to the
 * pathname only if the page never produces one.
 */
export const RouteAnnouncer = ({ contentRef }: RouteAnnouncerProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The initial load is announced by the browser itself; doing it again would
    // be noise, and stealing focus on arrival is hostile.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const content = contentRef.current;
    scrollToTop();

    let isCancelled = false;
    let observer: MutationObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stopWatching = (): void => {
      observer?.disconnect();
      if (timer !== null) clearTimeout(timer);
    };

    const announce = (heading: HTMLHeadingElement | null): void => {
      if (isCancelled) return;
      stopWatching();

      const target = heading ?? content;
      if (target) {
        // Focusable only for this move, so the heading never joins the tab order.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener(
          'blur',
          () => {
            target.removeAttribute('tabindex');
          },
          { once: true },
        );
      }

      setMessage(t('a11y.navigatedTo', { page: heading?.textContent.trim() ?? pathname }));
    };

    const existing = content?.querySelector('h1');
    if (existing) {
      announce(existing);
    } else if (content) {
      observer = new MutationObserver(() => {
        const heading = content.querySelector('h1');
        if (heading) announce(heading);
      });
      observer.observe(content, { childList: true, subtree: true });
      timer = setTimeout(() => {
        announce(null);
      }, HEADING_TIMEOUT_MS);
    } else {
      announce(null);
    }

    return () => {
      isCancelled = true;
      stopWatching();
    };
  }, [pathname, contentRef, t]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
};
