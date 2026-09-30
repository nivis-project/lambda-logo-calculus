import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2023',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
