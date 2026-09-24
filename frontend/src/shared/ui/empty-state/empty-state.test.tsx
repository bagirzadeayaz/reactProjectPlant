import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('announces itself as a status, not an alert', () => {
    render(<EmptyState title="No plants yet" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<EmptyState title="No plants yet" />);
    expect(screen.getByText('No plants yet')).toBeInTheDocument();
  });

  it('renders description and action when given', () => {
    render(
      <EmptyState
        title="No plants yet"
        description="Try a different filter."
        action={<button type="button">Reset</button>}
      />,
    );
    expect(screen.getByText('Try a different filter.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('hides decorative media from assistive tech', () => {
    render(<EmptyState title="No plants yet" media={<span data-testid="media" />} />);
    expect(screen.getByTestId('media').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});
