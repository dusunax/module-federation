import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useRememberProgress } from 'cart/features/remembering/hooks/useRememberProgress';
import './styles/globals.css';

const Header = lazy(() => import("header/Header"));
const ProductList = lazy(() => import("products/ProductList"));
const ProductDetail = lazy(() => import("products/ProductDetail"));
const Cart = lazy(() => import("cart/Cart"));
const OrderList = lazy(() => import("archive/OrderList"));
const OrderDetail = lazy(() => import("archive/OrderDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useRememberProgress();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <div
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: "flex",
            flexDirection: "column",
            height: "100dvh",
            background: "#313647",
            minHeight: "100vh",
          }}
        >
          <Suspense fallback={<div>헤더 로딩 중...</div>}>
            <Header />
          </Suspense>

          <main style={{ padding: "20px 4px", flex: 1 }}>
            <Routes>
              <Route
                path='/'
                element={
                  <Suspense fallback={<div>제품 목록 로딩 중...</div>}>
                    <ProductList />
                  </Suspense>
                }
              />
              <Route
                path='/detail/:id'
                element={
                  <Suspense fallback={<div>상품 상세 로딩 중...</div>}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path='/cart'
                element={
                  <Suspense fallback={<div>장바구니 로딩 중...</div>}>
                    <Cart />
                  </Suspense>
                }
              />
              <Route
                path='/archive'
                element={
                  <Suspense fallback={<div>감정 기록 로딩 중...</div>}>
                    <OrderList />
                  </Suspense>
                }
              />
              <Route
                path='/archive/:orderId'
                element={
                  <Suspense fallback={<div>기억 상세 로딩 중...</div>}>
                    <OrderDetail />
                  </Suspense>
                }
              />
            </Routes>
          </main>

          <footer
            style={{
              marginTop: "40px",
              padding: "20px",
              textAlign: "center",
              borderTop: "1px solid rgba(255, 248, 212, 0.2)",
            }}
          >
            <p
              style={{
                color: "rgba(255, 248, 212, 0.8)",
                fontSize: "14px",
                fontWeight: 300,
              }}
            >
              Between Lines - Like Real People Do
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
