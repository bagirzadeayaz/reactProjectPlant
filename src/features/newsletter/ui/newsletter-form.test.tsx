import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { initI18n } from '../../../shared/i18n';
import { ToastProvider } from '../../../shared/ui';
import { NEWSLETTER_STORAGE_KEY } from '../model/subscribe';
import { NewsletterForm } from './newsletter-form';

const i18n = initI18n();

const renderForm = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <ToastProvider regionLabel="Notifications" dismissLabel="Dismiss">
        <NewsletterForm />
      </ToastProvider>
    </I18nextProvider>,
  );

describe('NewsletterForm', () => {
  it('has a labelled email field and a submit button', () => {
    renderForm();
    expect(screen.getByLabelText('Email address')).toHaveAttribute('type', 'email');
    expect(screen.getByRole('button', { name: 'Subscribe' })).toHaveAttribute('type', 'submit');
  });

  it('rejects an invalid address inline without submitting', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address');
    expect(globalThis.localStorage.getItem(NEWSLETTER_STORAGE_KEY)).toBeNull();
  });

  it('clears the error as soon as the user edits', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email address'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Email address'), '@x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a busy state, then a success toast, and resets', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email address'), 'ramazan@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
    expect(await screen.findByText('Thanks — you are on the list.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('');
    expect(globalThis.localStorage.getItem(NEWSLETTER_STORAGE_KEY)).toBe('ramazan@example.com');
  });

  it('reports a failed subscription as an alert toast', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email address'), 'someone@fail.test');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not subscribe');
  });
});
