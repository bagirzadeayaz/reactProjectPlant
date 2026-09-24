import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

test('admin pages ask for manual Google sign-in', async ({ page }) => {
  await gotoReady(page, '/admin/products');
  await expect(page.getByRole('heading', { level: 1, name: 'Admin area' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Manage products' })).toHaveCount(0);
});
