import { defineConfig } from 'vitest/config';
import path from 'path';

const r = (...segments: string[]) => path.resolve(__dirname, ...segments);

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@shared': r('../shared'),
      react: r('node_modules/react'),
      'react-dom': r('node_modules/react-dom'),
      'react-router-dom': r('node_modules/react-router-dom'),
      // 모듈
      'host': r('src/__mocks__/host'),
      'auth': r('src/__mocks__/auth'),
      'header': r('src/__mocks__/header'),
      'cart': r('src/__mocks__/cart'),
      'products': r('src/__mocks__/products'),
      'archive': r('src/__mocks__/archive'),
    }
  },
});
