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
        name: 'cart',
        filename: 'remoteEntry.js',
        remotes: {
          products: getRemoteEntry(
            resolvedEnv,
            'PRODUCTS_REMOTE',
            'http://localhost:3002/assets/remoteEntry.js'
          ),
          auth: getRemoteEntry(
            resolvedEnv,
            'AUTH_REMOTE',
            'http://localhost:3005/assets/remoteEntry.js'
          ),
        },
        exposes: {
          './Cart': './src/Cart.tsx',
          './features/remembering/hooks/useRememberProgress':
            './src/features/remembering/hooks/useRememberProgress.ts',
          './features/remembering/hooks/useRememberingSync':
            './src/features/remembering/hooks/useRememberingSync.ts',
        },
        shared: MF_SHARED_WITH_SONNER,
      }),
    ],
    server: {
      port: 3003,
      strictPort: true,
    },
    preview: {
      port: 3003,
      strictPort: true,
      cors: true,
    },
    resolve: {
      alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      sonner: path.resolve(__dirname, './node_modules/sonner'),
      },
    },
  };
});
