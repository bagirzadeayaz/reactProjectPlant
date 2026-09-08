import { expect, test } from '@playwright/test';
import { gotoReady, switchLanguage } from './helpers';

test('language switch preserves the route, the filters and the cart', async ({ page }) => {
  await gotoReady(page, '/catalog/desk-plant');
  await page.getByRole('button', { name: 'Buy Now' }).first().click();
  await expect(page.getByRole('button', { name: 'Cart, 1 item' })).toBeVisible();

  await gotoReady(page, '/catalog?category=top-selling');
  await expect(page.getByText('2 plants')).toBeVisible();

  await switchLanguage(page, 'Russian');
  await expect(page.getByRole('heading', { level: 1, name: 'Каталог' })).toBeVisible();
  await expect(page).toHaveURL(/\/catalog\?/);
  await expect(page).toHaveURL(/category=top-selling/);
  await expect(page).toHaveURL(/lang=ru/);
  await expect(page.getByText('2 растения')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Корзина, 1 товар' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

  // The choice sticks across a reload without the query parameter.
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { level: 1, name: 'Каталог' })).toBeVisible();
});
