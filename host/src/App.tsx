import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastHost from './components/ToastHost';
import { useRememberProgress } from 'cart/features/remembering/hooks/useRememberProgress';
import { useRememberingSync } from 'cart/features/remembering/hooks/useRememberingSync';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './styles/tailwind.css';

const Header = lazy(() => import('header/Header'));
const ProductList = lazy(() => import('products/ProductList'));
const ProductDetail = lazy(() => import('products/ProductDetail'));
const Cart = lazy(() => import('cart/Cart'));
const OrderList = lazy(() => import('archive/OrderList'));
const OrderDetail = lazy(() => import('archive/OrderDetail'));
const EmotionCollection = lazy(() => import('archive/EmotionCollection'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminEmotions = lazy(() => import('./pages/AdminEmotions'));

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
    <div className="flex min-h-[100dvh] flex-col bg-[var(--color-bg-primary)]">
      <Suspense fallback={<div>헤더 로딩 중...</div>}>
        <Header />
      </Suspense>

      <main className="flex-1 px-2 sm:px-4 md:px-1 py-3 md:py-5">
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>대시보드 로딩 중...</div>}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div>감정 도감 로딩 중...</div>}>
                  <EmotionCollection />
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
          <Route
            path="/admin/emotions"
            element={
              <AdminRoute>
                <Suspense fallback={<div>관리 페이지 로딩 중...</div>}>
                  <AdminEmotions />
                </Suspense>
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <footer className="mt-6 md:mt-10 border-t border-[var(--color-border-primary)] p-3 md:p-5 text-center">
        <p className="text-sm font-normal text-[var(--color-text-secondary)]">
          Booked by Feelings - 감정 기록 및 책 추천
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
