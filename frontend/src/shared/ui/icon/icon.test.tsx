import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './icon';
import { ICONS } from './registry';

describe('Icon', () => {
  it('hides a decorative icon from assistive tech', () => {
    const { container } = render(<Icon name="bag" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes an image role and name when labelled', () => {
    render(<Icon name="search" label="Search" />);
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
  });

  it('applies the large size', () => {
    const { container } = render(<Icon name="bag" size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('size-(--size-icon-lg)');
  });

  it('renders every icon the design calls for', () => {
    for (const name of Object.keys(ICONS)) {
      const { container, unmount } = render(<Icon name={name as keyof typeof ICONS} />);
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
    expect(Object.keys(ICONS)).toEqual(
      expect.arrayContaining(['search', 'bag', 'chevron', 'arrow-right', 'play', 'hamburger']),
    );
  });
});
