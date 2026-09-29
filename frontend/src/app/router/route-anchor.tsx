import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Handles links into lazy pages as well as links within the current page. */
export const RouteAnchor = () => {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) return;
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    let frame = 0;
    const reveal = () => {
      const target = document.getElementById(id);
      if (!target || target.closest('[aria-busy="true"]')) return false;
      frame = requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
        const previous = target.getAttribute('tabindex');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener(
          'blur',
          () => {
            if (previous === null) target.removeAttribute('tabindex');
            else target.setAttribute('tabindex', previous);
          },
          { once: true },
        );
      });
      return true;
    };
    if (reveal())
      return () => {
        cancelAnimationFrame(frame);
      };
    const observer = new MutationObserver(() => {
      if (reveal()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
    const timer = setTimeout(() => {
      observer.disconnect();
    }, 8000);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [pathname, hash, key]);
  return null;
};
