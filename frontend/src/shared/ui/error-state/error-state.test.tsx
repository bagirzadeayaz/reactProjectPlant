import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('announces itself as an alert', () => {
    render(<ErrorState title="Could not load plants" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the title and description', () => {
    render(<ErrorState title="Could not load plants" description="Check your connection." />);
    expect(screen.getByText('Could not load plants')).toBeInTheDocument();
    expect(screen.getByText('Check your connection.')).toBeInTheDocument();
  });

  it('renders a recovery action', () => {
    render(
      <ErrorState title="Could not load plants" action={<button type="button">Retry</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('omits the description element when none is given', () => {
    render(<ErrorState title="Could not load plants" />);
    expect(screen.getByRole('alert').querySelectorAll('p')).toHaveLength(1);
  });
});
