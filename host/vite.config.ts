import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import federation from '@originjs/vite-plugin-federation';
import {
  MF_SHARED_HOST,
  MF_ROLLUP_OUTPUT_OPTIONS,
  getRemoteEntry,
} from '../scripts/mf.shared';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devEnv = loadEnv('development', process.cwd(), '');
  const resolvedEnv = mode === 'production' ? env : devEnv;

  return {
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
        name: 'host',
        filename: 'remoteEntry.js',
        exposes: {
          './sharedEmotionStore': './src/stores/sharedEmotionStore.ts',
        },
        remotes: {
          header: getRemoteEntry(
            resolvedEnv,
            'HEADER_REMOTE',
            'http://localhost:3001/assets/remoteEntry.js'
          ),
          products: getRemoteEntry(
            resolvedEnv,
            'PRODUCTS_REMOTE',
            'http://localhost:3002/assets/remoteEntry.js'
          ),
          cart: getRemoteEntry(
            resolvedEnv,
            'CART_REMOTE',
            'http://localhost:3003/assets/remoteEntry.js'
          ),
          archive: getRemoteEntry(
            resolvedEnv,
            'ARCHIVE_REMOTE',
            'http://localhost:3004/assets/remoteEntry.js'
          ),
          auth: getRemoteEntry(
            resolvedEnv,
            'AUTH_REMOTE',
            'http://localhost:3005/assets/remoteEntry.js'
          ),
          chatbot: getRemoteEntry(
            resolvedEnv,
            'CHATBOT_REMOTE',
            'https://micro-frontends-chatbot.vercel.app/assets/remoteEntry.js'
          ),
        },
        shared: MF_SHARED_HOST,
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
      open: true,
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
  };
});
