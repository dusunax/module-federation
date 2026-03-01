import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import federation from '@originjs/vite-plugin-federation';
import {
  MF_ROLLUP_OUTPUT_OPTIONS,
  MF_SHARED_CORE,
} from '../scripts/mf.shared';

export default defineConfig(() => ({
  esbuild: {
    target: 'esnext',
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: MF_ROLLUP_OUTPUT_OPTIONS,
  },
  plugins: [
    react(),
    federation({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './authStore': './src/store/authStore.ts',
        './firebase': './src/firebase/index.ts',
        './energyStore': './src/store/energyStore.ts',
        './rememberingStore': './src/store/rememberingStore.ts',
        './services/orderService': './src/services/orderService.ts',
        './services/emotionService': './src/services/emotionService.ts',
        './services/energyService': './src/services/energyService.ts',
        './services/seedService': './src/services/seedService.ts',
      },
      shared: MF_SHARED_CORE,
    }),
  ],
  server: {
    port: 3005,
    strictPort: true,
  },
  preview: {
    port: 3005,
    strictPort: true,
    cors: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
}));
