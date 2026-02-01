import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastHost from './components/ToastHost';
import { useRememberProgress } from 'cart/features/remembering/hooks/useRememberProgress';
import { useRememberingSync } from 'cart/features/remembering/hooks/useRememberingSync';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/tailwind.css';

const Header = lazy(() => import('header/Header'));
const ProductList = lazy(() => import('products/ProductList'));
const ProductDetail = lazy(() => import('products/ProductDetail'));
const Cart = lazy(() => import('cart/Cart'));
const OrderList = lazy(() => import('archive/OrderList'));
const OrderDetail = lazy(() => import('archive/OrderDetail'));
const Login = lazy(() => import('./pages/Login'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useRememberingSync();
  useRememberProgress();

  return (
    <div className="flex h-[100dvh] min-h-screen flex-col bg-[var(--color-bg-primary)]">
      <Suspense fallback={<div>헤더 로딩 중...</div>}>
        <Header />
      </Suspense>

      <main className="flex-1 px-1 py-5">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>제품 목록 로딩 중...</div>}>
                  <ProductList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>상품 상세 로딩 중...</div>}>
                  <ProductDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>장바구니 로딩 중...</div>}>
                  <Cart />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>감정 기록 로딩 중...</div>}>
                  <OrderList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive/:orderId"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>기억 상세 로딩 중...</div>}>
                  <OrderDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="mt-10 border-t border-[var(--color-border-primary)] p-5 text-center">
        <p className="text-sm font-light text-[var(--color-text-secondary)]">
          Between Lines - Like Real People Do
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastHost />
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<div>로딩 중...</div>}>
                <Login />
              </Suspense>
            }
          />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
