import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite configuration for the frontend application.
// Includes alias resolution for shared packages and React plugin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Point @common to the root of the shared package.  Files in
      // `packages/common` can then be imported via `@common/filename`.
      '@common': path.resolve(__dirname, '../../packages/common'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});