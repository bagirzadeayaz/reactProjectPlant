import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from './toast-provider';
import { useToast } from './use-toast';

const Trigger = () => {
  const { show } = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          show({ message: 'Added to cart' });
        }}
      >
        Notify
      </button>
      <button
        type="button"
        onClick={() => {
          show({ message: 'Could not add', tone: 'error', duration: 0 });
        }}
      >
        Fail
      </button>
    </>
  );
};

const renderWithProvider = () =>
  render(
    <ToastProvider regionLabel="Notifications" dismissLabel="Dismiss">
      <Trigger />
    </ToastProvider>,
  );

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes a labelled region for the stack', () => {
    renderWithProvider();
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('shows a queued message as a polite status', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toHaveTextContent('Added to cart');
  });

  it('announces an error toast as an alert', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not add');
  });

  it('auto-dismisses after its duration', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Added to cart')).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.queryByText('Added to cart')).not.toBeInTheDocument();
  });

  it('keeps a zero-duration toast until dismissed', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(screen.getByText('Could not add')).toBeInTheDocument();
  });

  it('dismisses from the close button', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Added to cart')).not.toBeInTheDocument();
  });

  it('clears the stack on Escape', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(2);

    screen.getByRole('region', { name: 'Notifications' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('stacks several toasts at once', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    await userEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getAllByRole('status')).toHaveLength(2);
  });

  it('throws a clear error when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Trigger />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });
});
