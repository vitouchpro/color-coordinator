import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the domain root on Vercel, so base is '/'.
// (For GitHub Pages project sites, this would need to be '/color-coordinator/'.)
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { outDir: 'dist', sourcemap: false },
  // Pure color/exporter utils run in a plain Node environment (no DOM needed).
  test: { environment: 'node', include: ['src/**/*.test.js'] }
});
