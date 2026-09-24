import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ToastProvider } from '../../shared/ui';
import { UiKitPage } from './ui-kit-page';

// The app layout provides the toast region; standalone, the page needs one.
const renderPage = () =>
  render(
    <ToastProvider regionLabel="Notifications" dismissLabel="Dismiss">
      <UiKitPage />
    </ToastProvider>,
  );

/**
 * The checkpoint for prompt 4: /ui-kit renders every primitive and the whole
 * page is usable with the keyboard alone.
 */
describe('UiKitPage', () => {
  it('renders a section for each group of primitives', () => {
    renderPage();
    for (const name of ['Buttons', 'Form fields', 'Layout and icons', 'Feedback', 'Overlays']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('renders every button variant', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Explore' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Live Demo...' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'As a link' })).toBeInTheDocument();
  });

  it('renders every labelled field', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText(/Invalid field/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('reaches every interactive control by Tab alone', async () => {
    renderPage();
    const expected = screen.getAllByRole('button').length + screen.getAllByRole('link').length + 4;

    const seen = new Set<Element>();
    for (let i = 0; i < expected + 5; i += 1) {
      await userEvent.tab();
      if (document.activeElement && document.activeElement !== document.body) {
        seen.add(document.activeElement);
      }
    }

    expect(seen.size).toBeGreaterThanOrEqual(10);
    for (const element of seen) {
      expect(element).not.toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('opens the modal from the keyboard and closes it with Escape', async () => {
    renderPage();
    const trigger = screen.getByRole('button', { name: 'Open modal' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: 'Confirm removal' });
    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('raises a toast from the keyboard', async () => {
    renderPage();
    screen.getByRole('button', { name: 'Show info toast' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Added to cart')).toBeInTheDocument();
  });
});
