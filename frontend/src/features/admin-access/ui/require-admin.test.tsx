import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '../../../shared/i18n';
import { isAdminEnabled, setAdminEnabled } from '../../../../test/mocks/admin-session';
import { RequireAdmin } from './require-admin';

const i18n = initI18n();

const renderGuard = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/admin/products']}>
        <Routes>
          <Route path="admin" element={<RequireAdmin />}>
            <Route path="products" element={<h1>Admin content</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );

describe('RequireAdmin', () => {
  afterEach(() => {
    setAdminEnabled(false);
  });

  it('hides the child route until the user signs in', async () => {
    renderGuard();
    expect(screen.getByRole('heading', { level: 1, name: 'Admin area' })).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(await screen.findByText('Admin content')).toBeInTheDocument();
    expect(isAdminEnabled()).toBe(true);
  });

  it('renders the child route when already signed in', async () => {
    setAdminEnabled(true);
    renderGuard();
    expect(await screen.findByText('Admin content')).toBeInTheDocument();
  });

  it('clears the flag', () => {
    setAdminEnabled(true);
    setAdminEnabled(false);
    expect(isAdminEnabled()).toBe(false);
  });
});
