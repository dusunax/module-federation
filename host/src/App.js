import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';

// 원격 컴포넌트를 동적으로 로드
const Header = lazy(() => import('header/Header'));
const ProductList = lazy(() => import('products/ProductList'));
const ProductDetail = lazy(() => import('products/ProductDetail'));
const Cart = lazy(() => import('cart/Cart'));

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ fontFamily: 'Arial, sans-serif' , display: 'flex', flexDirection: 'column', height: '100dvh' }}>
          <Suspense fallback={<div>헤더 로딩 중...</div>}>
            <Header />
          </Suspense>

          <main style={{ padding: '20px 4px', flex: 1 }}>
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div>제품 목록 로딩 중...</div>}>
                    <ProductList />
                  </Suspense>
                }
              />
              <Route
                path="/detail/:id"
                element={
                  <Suspense fallback={<div>상품 상세 로딩 중...</div>}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="/cart"
                element={
                  <Suspense fallback={<div>장바구니 로딩 중...</div>}>
                    <Cart />
                  </Suspense>
                }
              />
            </Routes>
          </main>

          <footer style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f0f0f0',
            textAlign: 'center'
          }}>
            <p>Greenary - 플랜테리어 & 라이프스타일 쇼핑몰</p>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
