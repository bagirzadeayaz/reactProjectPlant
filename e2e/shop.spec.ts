import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

test('browse → filter → open product → add to cart', async ({ page }) => {
  await gotoReady(page, '/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Breath Natural');

  await page.getByRole('link', { name: 'Catalog' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Catalog' })).toBeVisible();
  await expect(page.getByText('6 plants')).toBeVisible();

  await page.getByRole('combobox', { name: /^Category:/ }).click();
  await page.getByRole('option', { name: 'Top selling', exact: true }).click();
  await expect(page.getByText('2 plants')).toBeVisible();
  await expect(page).toHaveURL(/category=top-selling/);

  await page.getByRole('link', { name: 'Desk plant' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Desk plant' })).toBeVisible();

  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'Buy Now' }).first().click();
  await expect(page.getByRole('button', { name: 'Cart, 2 items' })).toBeVisible();

  await page.getByRole('button', { name: 'Cart, 2 items' }).click();
  const dialog = page.getByRole('dialog', { name: /Your cart/ });
  await expect(dialog.getByRole('link', { name: 'Desk plant' })).toBeVisible();
  await expect(dialog).toContainText('718');

  // The cart outlives a reload.
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cart, 2 items' })).toBeVisible();
});
