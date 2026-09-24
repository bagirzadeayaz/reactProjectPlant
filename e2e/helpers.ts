import { expect, type Page } from '@playwright/test';

/** Waits for a route to render after the API is available. */
export const gotoReady = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await expect(page.locator('main h1')).toBeVisible();
};

/** Below `sm` the language switcher lives in the hamburger menu. */
export const switchLanguage = async (page: Page, name: 'English' | 'Russian'): Promise<void> => {
  const button = page.getByRole('button', { name }).first();
  if (!(await button.isVisible())) {
    await page.getByRole('button', { name: /Open menu|Открыть меню/ }).click();
  }
  await page.getByRole('button', { name }).filter({ visible: true }).first().click();
};
