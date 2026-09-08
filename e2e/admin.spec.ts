import { expect, test } from '@playwright/test';
import { enableAdmin, gotoReady } from './helpers';

test('admin create → verify on catalog', async ({ page }) => {
  await enableAdmin(page);
  await gotoReady(page, '/admin/products/new');
  await expect(page.getByRole('heading', { level: 1, name: 'New product' })).toBeVisible();

  const name = page.getByRole('group', { name: 'Name' });
  await name.getByLabel('English').fill('E2E fern');
  await name.getByLabel('Russian').fill('Папоротник');
  const description = page.getByRole('group', { name: 'Description' });
  await description.getByLabel('English').fill('Planted by Playwright.');
  await description.getByLabel('Russian').fill('Посажен Playwright.');
  await page.getByLabel('Price').fill('123');
  await page.getByLabel('Category').selectOption('trendy');
  await page.getByLabel('Image URL').fill('/plants/desk-plant.png');
  await page.getByRole('button', { name: 'Create product' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Manage products' })).toBeVisible();
  await expect(page.getByText('Product created')).toBeVisible();
  await expect(page.getByRole('link', { name: 'E2E fern', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Catalog' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Catalog' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'E2E fern' })).toBeVisible();
  await expect(page.getByText('7 plants')).toBeVisible();
});

test('the admin is gated behind the demo flag', async ({ page }) => {
  await gotoReady(page, '/admin/products');
  await expect(page.getByRole('heading', { level: 1, name: 'Admin area' })).toBeVisible();
  await page.getByRole('button', { name: 'Enter demo admin' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Manage products' })).toBeVisible();
});
