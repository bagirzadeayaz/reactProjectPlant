import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders a button with type="button" by default', () => {
    render(<Button>Explore</Button>);
    expect(screen.getByRole('button', { name: 'Explore' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick when activated by mouse', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Explore</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is reachable and activatable by keyboard alone', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Explore</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Explore
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('swaps the label for a spinner and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading loadingLabel="Loading" onClick={onClick}>
        Explore
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders an anchor when as="a", keeping link semantics', () => {
    render(
      <Button as="a" href="/catalog">
        Catalog
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Catalog' });
    expect(link).toHaveAttribute('href', '/catalog');
  });

  it('drops the href and marks aria-disabled on a loading anchor', () => {
    render(
      <Button as="a" href="/catalog" isLoading loadingLabel="Loading">
        Catalog
      </Button>,
    );
    const anchor = screen.getByText('Loading').closest('a');
    expect(anchor).not.toHaveAttribute('href');
    expect(anchor).toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards a ref to the underlying DOM node', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Explore</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders a trailing icon alongside the label', () => {
    render(
      <Button variant="primary-with-icon" icon={<span data-testid="icon" />}>
        Buy Now
      </Button>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Buy Now');
  });

  it('lets a caller className override a default utility', () => {
    render(<Button className="rounded-icon">Explore</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-icon');
    expect(button).not.toHaveClass('rounded-control');
  });
});
