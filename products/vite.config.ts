import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import federation from '@originjs/vite-plugin-federation';
import {
  MF_ROLLUP_OUTPUT_OPTIONS,
  MF_SHARED_WITH_SONNER,
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
        name: 'products',
        filename: 'remoteEntry.js',
        remotes: {
          auth: getRemoteEntry(
            resolvedEnv,
            'AUTH_REMOTE',
            'http://localhost:3005/assets/remoteEntry.js'
          ),
        },
        exposes: {
          './ProductList': './src/ProductList.tsx',
          './ProductDetail': './src/ProductDetail.tsx',
          './cartStore': './src/store/cartStore.ts',
          './orderStore': './src/store/orderStore.ts',
          './utils/statusStyle': './src/utils/statusStyle.ts',
          './constants': './src/constants/index.ts',
        },
        shared: {
          ...MF_SHARED_WITH_SONNER,
          '@tanstack/react-query': {
            singleton: true,
            version: '5.90.16',
            requiredVersion: '^5.90.16',
            strictVersion: false,
          },
        },
      }),
    ],
    server: {
      port: 3002,
      strictPort: true,
    },
    preview: {
      port: 3002,
      strictPort: true,
      cors: true,
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
  };
});
