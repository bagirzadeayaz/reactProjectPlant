import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  it('animates while it waits', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('takes its size from the caller', () => {
    render(<Skeleton className="h-40 w-full" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-40');
    expect(skeleton).toHaveClass('w-full');
  });
});
