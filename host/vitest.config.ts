import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      'auth/authStore': path.resolve(__dirname, 'src/__mocks__/auth/authStore.ts'),
      'auth/energyStore': path.resolve(__dirname, 'src/__mocks__/auth/energyStore.ts'),
      'auth/services/emotionService': path.resolve(
        __dirname,
        'src/__mocks__/auth/services/emotionService.ts',
      ),
      'cart/features/remembering/hooks/useRememberProgress': path.resolve(
        __dirname,
        'src/__mocks__/cart/useRememberProgress.ts',
      ),
      'cart/features/remembering/hooks/useRememberingSync': path.resolve(
        __dirname,
        'src/__mocks__/cart/useRememberingSync.ts',
      ),
      'header/Header': path.resolve(__dirname, 'src/__mocks__/header/Header.tsx'),
      'products/ProductList': path.resolve(__dirname, 'src/__mocks__/products/ProductList.tsx'),
      'products/ProductDetail': path.resolve(
        __dirname,
        'src/__mocks__/products/ProductDetail.tsx',
      ),
      'cart/Cart': path.resolve(__dirname, 'src/__mocks__/cart/Cart.tsx'),
      'archive/OrderList': path.resolve(__dirname, 'src/__mocks__/archive/OrderList.tsx'),
      'archive/OrderDetail': path.resolve(__dirname, 'src/__mocks__/archive/OrderDetail.tsx'),
      'archive/EmotionCollection': path.resolve(
        __dirname,
        'src/__mocks__/archive/EmotionCollection.tsx',
      ),
    },
  },
});
