import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub repo name for Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/color-coordinator/',
  build: { outDir: 'dist', sourcemap: false }
});
