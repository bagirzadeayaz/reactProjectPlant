import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Playwright owns e2e/; Vitest must not pick those specs up.
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/main.tsx',
        'src/app/testing/**',
        'src/**/*.d.ts',
        // Legacy pre-FSD code, migrated in prompts 8-11. See ARCHITECTURE.md.
        'src/components/**',
        'src/data/**',
        'src/store/**',
        'src/types/**',
        'src/App.tsx',
        // Dev-only route
        'src/pages/ui-kit/**',
        // Dev/test infrastructure (MSW). Exercised by the tests, not tested itself.
        'src/mocks/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
