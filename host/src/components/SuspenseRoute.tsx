import React, { Suspense } from 'react';
import AdminSkeleton from '@shared/components/skeletons/AdminSkeleton';
import CartSkeleton from '@shared/components/skeletons/CartSkeleton';
import CollectionSkeleton from '@shared/components/skeletons/CollectionSkeleton';
import DashboardSkeleton from '@shared/components/skeletons/DashboardSkeleton';
import HeaderSkeleton from '@shared/components/skeletons/HeaderSkeleton';
import LoginSkeleton from '@shared/components/skeletons/LoginSkeleton';
import OrderDetailSkeleton from '@shared/components/skeletons/OrderDetailSkeleton';
import OrderListSkeleton from '@shared/components/skeletons/OrderListSkeleton';
import ProductDetailSkeleton from '@shared/components/skeletons/ProductDetailSkeleton';

type SuspenseFallbackKey =
  | 'header'
  | 'productDetail'
  | 'cart'
  | 'orderList'
  | 'orderDetail'
  | 'dashboard'
  | 'collection'
  | 'adminEmotions'
  | 'login';

interface SuspenseRouteProps {
  fallbackKey: SuspenseFallbackKey;
  children: React.ReactNode;
}

const FALLBACKS: Record<SuspenseFallbackKey, React.ReactNode> = {
  header: <HeaderSkeleton />,
  productDetail: <ProductDetailSkeleton />,
  cart: <CartSkeleton />,
  orderList: <OrderListSkeleton />,
  orderDetail: <OrderDetailSkeleton />,
  dashboard: <DashboardSkeleton />,
  collection: <CollectionSkeleton />,
  adminEmotions: <AdminSkeleton />,
  login: <LoginSkeleton />,
};

function SuspenseRoute({ fallbackKey, children }: SuspenseRouteProps) {
  return <Suspense fallback={FALLBACKS[fallbackKey]}>{children}</Suspense>;
}

export default SuspenseRoute;
