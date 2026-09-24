import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResponsiveImage } from './responsive-image';

const sources = [
  { src: '/p-400.webp', width: 400 },
  { src: '/p-800.webp', width: 800 },
];

describe('ResponsiveImage', () => {
  it('reserves its box with width and height', () => {
    render(<ResponsiveImage src="/p.png" width={800} height={600} alt="A plant" />);
    const img = screen.getByRole('img', { name: 'A plant' });
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
  });

  it('builds a srcset from the sources', () => {
    render(<ResponsiveImage src="/p.png" sources={sources} width={1} height={1} alt="A plant" />);
    expect(screen.getByRole('img')).toHaveAttribute('srcset', '/p-400.webp 400w, /p-800.webp 800w');
  });

  it('renders typed sources as a picture, AVIF before WebP, PNG as the fallback', () => {
    const typed = [
      { src: '/p-400.webp', width: 400, type: 'image/webp' as const },
      { src: '/p-400.avif', width: 400, type: 'image/avif' as const },
    ];
    const { container } = render(
      <ResponsiveImage
        src="/p.png"
        sources={typed}
        sizes="50vw"
        width={1}
        height={1}
        alt="A plant"
      />,
    );
    const picture = container.querySelector('picture');
    expect(picture).not.toBeNull();
    const types = [...container.querySelectorAll('source')].map((s) => s.getAttribute('type'));
    expect(types).toEqual(['image/avif', 'image/webp']);
    expect(container.querySelector('source')).toHaveAttribute('sizes', '50vw');
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/p.png');
    expect(img).not.toHaveAttribute('srcset');
  });

  it('lazy-loads by default and eager-loads priority images', () => {
    const { rerender } = render(<ResponsiveImage src="/p.png" width={1} height={1} alt="x" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');

    rerender(<ResponsiveImage src="/p.png" width={1} height={1} alt="x" priority />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
    expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
  });

  it('is hidden from assistive tech when the alt is empty', () => {
    render(<ResponsiveImage src="/p.png" width={1} height={1} alt="" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
