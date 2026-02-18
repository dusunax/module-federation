import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import ToastHost from './components/ToastHost';
import { useRememberProgress } from 'cart/features/remembering/hooks/useRememberProgress';
import { useRememberingSync } from 'cart/features/remembering/hooks/useRememberingSync';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuthStore } from 'auth/authStore';
import { seedEmotions } from 'auth/services/seedService';
import HeaderSkeleton from '@shared/components/skeletons/HeaderSkeleton';
import ProductListSkeleton from '@shared/components/skeletons/ProductListSkeleton';
import ProductDetailSkeleton from '@shared/components/skeletons/ProductDetailSkeleton';
import CartSkeleton from '@shared/components/skeletons/CartSkeleton';
import OrderListSkeleton from '@shared/components/skeletons/OrderListSkeleton';
import OrderDetailSkeleton from '@shared/components/skeletons/OrderDetailSkeleton';
import DashboardSkeleton from '@shared/components/skeletons/DashboardSkeleton';
import CollectionSkeleton from '@shared/components/skeletons/CollectionSkeleton';
import AdminSkeleton from '@shared/components/skeletons/AdminSkeleton';
import LoginSkeleton from '@shared/components/skeletons/LoginSkeleton';
import CurrentConditionSkeleton from '@shared/components/skeletons/CurrentConditionSkeleton';
import WheelSkeleton from '@shared/components/skeletons/WheelSkeleton';
import './styles/tailwind.css';

const VIEW_MODE_KEY = 'emotion-view-mode';

function getSavedViewMode(): 'list' | 'wheel' {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'list' || saved === 'wheel') return saved;
  } catch { /* ignore */ }
  return 'wheel';
}

function ProductListFallback() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || getSavedViewMode();
  return view === 'list' ? (
    <ProductListSkeleton />
  ) : (
    <>
      <CurrentConditionSkeleton />
      <WheelSkeleton />
    </>
  );
}

/** query string 없이 / 접근 시 localStorage 또는 기본값으로 정규화 */
function ProductListWithDefault() {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!searchParams.get('view')) {
      const defaultView = getSavedViewMode();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('view', defaultView);
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <Suspense fallback={<ProductListFallback />}>
      <ProductList />
    </Suspense>
  );
}

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

function useEmotionsSeed(enabled: boolean) {
  const seeded = useRef(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    if (seeded.current) return;
    seeded.current = true;

    seedEmotions()
      .then((created) => {
        qc.invalidateQueries({ queryKey: ['emotions'] });
        qc.invalidateQueries({ queryKey: ['admin-emotions'] });
        console.info(`Seeded emotions: ${created} added.`);
      })
      .catch((err) => {
      console.error('Seed check failed:', err);
      seeded.current = false;
      });
  }, [enabled, qc]);
}

function AppContent() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEmotionsSeed(false);
  useRememberingSync();
  useRememberProgress();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--color-bg-primary)]">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <main className="flex-1 px-2 sm:px-4 md:px-1 py-3 md:py-5">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProductListWithDefault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<ProductDetailSkeleton />}>
                  <ProductDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Suspense fallback={<CartSkeleton />}>
                  <Cart />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive"
            element={
              <ProtectedRoute>
                <Suspense fallback={<OrderListSkeleton />}>
                  <OrderList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <Suspense fallback={<CollectionSkeleton />}>
                  <EmotionCollection />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive/:orderId"
            element={
              <ProtectedRoute>
                <Suspense fallback={<OrderDetailSkeleton />}>
                  <OrderDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/emotions"
            element={
              <AdminRoute>
                <Suspense fallback={<AdminSkeleton />}>
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
              <Suspense fallback={<LoginSkeleton />}>
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
