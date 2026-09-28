import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
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
  };
});
