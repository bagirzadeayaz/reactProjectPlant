import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('exposes a status role so assistive tech announces it', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the label for screen readers only', () => {
    render(<Spinner label="Loading plants" />);
    expect(screen.getByText('Loading plants')).toHaveClass('sr-only');
  });

  it('renders no label element when none is given', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.sr-only')).toBeNull();
  });

  it('merges a caller className', () => {
    render(<Spinner className="text-ink" />);
    expect(screen.getByRole('status')).toHaveClass('text-ink');
  });
});
