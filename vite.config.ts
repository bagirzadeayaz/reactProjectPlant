import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const envDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const backendUrl = `http://localhost:${loadEnv(mode, envDir, '').PORT || '3001'}`;
  return {
    root: 'frontend',
    envDir,
    plugins: [react(), tailwindcss()],
    server: { proxy: { '/api': backendUrl } },
    preview: { proxy: { '/api': backendUrl } },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
      },
    },
    test: {
      maxWorkers: 2,
      testTimeout: 15_000,
      // Playwright owns e2e/; Vitest must not pick those specs up.
      include: ['src/**/*.test.{ts,tsx}'],
      globals: true,
      environment: 'jsdom',
      setupFiles: [fileURLToPath(new URL('./frontend/test/setup.ts', import.meta.url))],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/index.ts',
          'src/main.tsx',
          'src/**/*.d.ts',
          // Dev-only route
          'src/pages/ui-kit/**',
        ],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  };
});
