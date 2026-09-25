import { expect, test } from '@playwright/test';
import { gotoReady } from './helpers';

test('featured plant selection and preview respond to keyboard and pointer', async ({ page }) => {
  await gotoReady(page, '/');
  const featured = page.locator('.featured-plant');
  await expect(featured.getByRole('heading')).toContainText('Calathea plant');
  await featured.getByRole('button', { name: 'Next featured plant' }).click();
  await expect(featured.getByRole('heading')).toContainText('Cal 874 plant');
  await featured.getByRole('button', { name: 'Show featured plant 1' }).click();
  await expect(featured.getByRole('heading')).toContainText('Calathea plant');
  await page.getByRole('button', { name: 'Play the plant preview' }).click();
  await expect(page.getByRole('dialog', { name: 'A little green, a little calm.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play the plant preview' })).toBeFocused();
});

test('design navigation reaches the care and contact pages', async ({ page }) => {
  await gotoReady(page, '/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByRole('navigation', { name: 'Menu', exact: true });
  await menu.getByRole('link', { name: 'More', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A little care. A lot of green.',
  );
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Open menu' }).click();
  await menu.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Let's keep it growing.");
  await page.getByText('How do I choose my first plant?', { exact: true }).click();
  await expect(
    page.getByText('Start with the light and space in your room.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('html').evaluate((el: { clientWidth: number }) => el.clientWidth),
  );
});

test('reduced motion removes the continuous plant animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page, '/');
  const plant = page.locator('.featured-plant__image img');
  await expect(plant).toBeVisible();
  await expect(plant).toHaveCSS('animation-name', 'none');
});
