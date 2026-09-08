import { expect, type Page } from '@playwright/test';

/** Waits for the mock backend: the first request is gated on the worker. */
export const gotoReady = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await expect(page.locator('main h1')).toBeVisible();
};

export const enableAdmin = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    localStorage.setItem('planto:admin', '1');
  });
};

/** Below `sm` the language switcher lives in the hamburger menu. */
export const switchLanguage = async (page: Page, name: 'English' | 'Russian'): Promise<void> => {
  const button = page.getByRole('button', { name }).first();
  if (!(await button.isVisible())) {
    await page.getByRole('button', { name: /Open menu|Открыть меню/ }).click();
  }
  await page.getByRole('button', { name }).filter({ visible: true }).first().click();
};
