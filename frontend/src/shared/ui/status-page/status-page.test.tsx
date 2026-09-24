import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusPage } from './status-page';

describe('StatusPage', () => {
  it('renders the title as the h1 and the code decoratively', () => {
    render(
      <StatusPage
        code="404"
        title="Not here"
        description="Try the menu."
        action={<a href="/">Home</a>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Not here' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Try the menu.');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('404').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('can be an alert', () => {
    render(<StatusPage role="alert" title="Broken" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Broken');
  });
});
