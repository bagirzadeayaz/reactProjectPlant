import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './error-boundary';

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('kaboom');
  return <p>all good</p>;
};

const Fallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div>
    <p>caught: {error.message}</p>
    <button type="button" onClick={reset}>
      reset
    </button>
  </div>
);

describe('ErrorBoundary', () => {
  // React logs the caught error; that is expected here and only clutters output.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children while nothing throws', () => {
    render(
      <ErrorBoundary fallback={Fallback}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('renders the fallback with the error when a child throws', () => {
    render(
      <ErrorBoundary fallback={Fallback}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('caught: kaboom')).toBeInTheDocument();
  });

  it('reports the error to onError', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary fallback={Fallback} onError={onError}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledOnce();
  });

  it('recovers when the fallback asks it to', async () => {
    const Harness = () => {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setShouldThrow(false);
            }}
          >
            fix it
          </button>
          <ErrorBoundary fallback={Fallback}>
            <Boom shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    };

    render(<Harness />);
    expect(screen.getByText('caught: kaboom')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'fix it' }));
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));

    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('clears itself when the reset key changes — as on a route change', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={Fallback} resetKey="/a">
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('caught: kaboom')).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={Fallback} resetKey="/b">
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });
});
