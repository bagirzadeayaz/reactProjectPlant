import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './reveal';

interface Entry { isIntersecting: boolean; boundingClientRect: { bottom: number } }
type Callback = (entries: Entry[]) => void;

describe('Reveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('never hides content when there is no IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal>Visible</Reveal>);
    expect(screen.getByText('Visible')).not.toHaveAttribute('data-reveal');
  });

  it('marks the element out, then in once it intersects, then stops observing', () => {
    let callback: Callback = () => undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );

    render(<Reveal>Later</Reveal>);
    const element = screen.getByText('Later');
    expect(element).toHaveAttribute('data-reveal', 'out');

    callback([{ isIntersecting: false, boundingClientRect: { bottom: 500 } }]);
    expect(element).toHaveAttribute('data-reveal', 'out');

    callback([{ isIntersecting: true, boundingClientRect: { bottom: 500 } }]);
    expect(element).toHaveAttribute('data-reveal', 'in');
    expect(disconnect).toHaveBeenCalled();
  });

  it('reveals an element the reader jumped past without ever intersecting', () => {
    let callback: Callback = () => undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    render(<Reveal>Skipped</Reveal>);
    const element = screen.getByText('Skipped');
    callback([{ isIntersecting: false, boundingClientRect: { bottom: -40 } }]);
    expect(element).toHaveAttribute('data-reveal', 'in');
  });

  it('reveals on scroll once the element is above the viewport', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    render(<Reveal>Scrolled</Reveal>);
    const element = screen.getByText('Scrolled');
    element.getBoundingClientRect = () => ({ bottom: -10 }) as DOMRect;
    window.dispatchEvent(new Event('scroll'));
    expect(element).toHaveAttribute('data-reveal', 'in');
  });
});
