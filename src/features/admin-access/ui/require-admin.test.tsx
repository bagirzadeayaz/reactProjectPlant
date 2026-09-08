import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { initI18n } from '../../../shared/i18n';
import { ADMIN_STORAGE_KEY, isAdminEnabled, setAdminEnabled } from '../lib/admin-flag';
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
    globalThis.localStorage.removeItem(ADMIN_STORAGE_KEY);
  });

  it('hides the child route until admin mode is entered', async () => {
    renderGuard();
    expect(screen.getByRole('heading', { level: 1, name: 'Admin area' })).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Enter demo admin' }));
    expect(screen.getByText('Admin content')).toBeInTheDocument();
    expect(isAdminEnabled()).toBe(true);
  });

  it('renders the child route straight away when the flag is set', () => {
    setAdminEnabled(true);
    renderGuard();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('clears the flag', () => {
    setAdminEnabled(true);
    setAdminEnabled(false);
    expect(isAdminEnabled()).toBe(false);
  });
});
