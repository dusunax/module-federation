import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuspenseRoute from './components/SuspenseRoute';
import { ProductListShell } from './components/ProductListFallback';

const ProductList = lazy(() => import('products/ProductList'));
const ProductDetail = lazy(() => import('products/ProductDetail'));
const Cart = lazy(() => import('cart/Cart'));
const OrderList = lazy(() => import('archive/OrderList'));
const OrderDetail = lazy(() => import('archive/OrderDetail'));
const EmotionCollection = lazy(() => import('archive/EmotionCollection'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminEmotions = lazy(() => import('./pages/AdminEmotions'));
const Header = lazy(() => import('header/Header'));

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <SuspenseRoute fallbackKey="login">
            <Login />
          </SuspenseRoute>
        }
      />
      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProductListShell>
                      <ProductList />
                    </ProductListShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detail/:id"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="productDetail">
                      <ProductDetail />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="cart">
                      <Cart />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/archive"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="orderList">
                      <OrderList />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="dashboard">
                      <Dashboard />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collection"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="collection">
                      <EmotionCollection />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/archive/:orderId"
                element={
                  <ProtectedRoute>
                    <SuspenseRoute fallbackKey="orderDetail">
                      <OrderDetail />
                    </SuspenseRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/emotions"
                element={
                  <AdminRoute>
                    <SuspenseRoute fallbackKey="adminEmotions">
                      <AdminEmotions />
                    </SuspenseRoute>
                  </AdminRoute>
                }
              />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
