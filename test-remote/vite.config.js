import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hostRemote = env.VITE_HOST_REMOTE || 'https://dusunax-001.web.app/assets/remoteEntry.js';
  const authRemote = env.VITE_AUTH_REMOTE || 'https://auth-dusunax-001.web.app/assets/remoteEntry.js';

  return {
    esbuild: {
      target: 'esnext',
    },
    build: {
      target: 'esnext',
    },
    plugins: [
      react(),
      federation({
        name: 'hostRemoteTest',
        remotes: {
          host: hostRemote,
          auth: authRemote,
        },
        shared: {
          react: {
            singleton: true,
            version: '19.0.0',
            requiredVersion: '^19.0.0',
          },
          'react-dom': {
            singleton: true,
            version: '19.0.0',
            requiredVersion: '^19.0.0',
          },
          zustand: {
            singleton: true,
            version: '5.0.9',
            requiredVersion: '^5.0.9',
            strictVersion: false,
          },
        },
      }),
    ],
    server: {
      host: true,
      port: 4173,
      strictPort: true,
    },
  };
});
