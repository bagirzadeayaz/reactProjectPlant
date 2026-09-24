import { defineConfig, devices } from '@playwright/test';

/**
 * Real HTTP server with isolated repositories. Never uses the live Firebase project.
 */
const isCI = process.env.CI !== undefined;
const backendUrl = `http://127.0.0.1:${process.env.E2E_PORT ?? '4173'}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: backendUrl,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  globalSetup: './backend/test/e2e-server.js',
});
