import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface RevealProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

/**
 * Fades and lifts its content in the first time it scrolls into view.
 *
 * No React state: the effect marks the element `data-reveal="out"`, an
 * IntersectionObserver flips it to `"in"`, and CSS does the rest — only under
 * `prefers-reduced-motion: no-preference`, so a reader who asked for less
 * motion gets plain content. Without JS, or in jsdom, nothing is ever hidden:
 * the `out` state exists only once an observer is there to undo it.
 *
 * Use it on content below the fold. Above the fold the observer fires on
 * the first frame and the lift would read as a flicker.
 */
export const Reveal = ({ children, className, ...props }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    element.dataset.reveal = 'out';
    const show = (): void => {
      element.dataset.reveal = 'in';
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    // A jump past the element (anchor, End key, a fast fling) never
    // intersects, so the observer alone would leave it hidden. The scroll
    // listener catches "already above the viewport" and is removed on reveal.
    const onScroll = (): void => {
      if (element.getBoundingClientRect().bottom < 0) show();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.boundingClientRect.bottom < 0))
          show();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={cn('reveal', className)} {...props}>
      {children}
    </div>
  );
};
