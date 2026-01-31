import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthStore } from 'auth/authStore';
import { useRememberingStore } from 'auth/rememberingStore';
import { subscribeToUserOrders } from 'auth/services/orderService';
import { useOrderStore } from './store/orderStore';
import { worker } from './mocks/browser';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

// MSW 시작 후 앱 렌더링
worker
  .start({
    onUnhandledRequest: 'bypass',
  })
  .then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Mirror user's processing/orders into products orderStatuses for UI
    let ordersUnsub = null;

    const unsubAuthUser = useAuthStore.subscribe(
      (s) => s.user,
      (user) => {
        if (ordersUnsub) {
          ordersUnsub();
          ordersUnsub = null;
        }

        if (!user) {
          useOrderStore.getState().updateAllOrderStatuses({});
          return;
        }

        ordersUnsub = subscribeToUserOrders(user.uid, (orders) => {
          const statuses = {};

          orders.forEach((order) => {
            const items = order.items || [];
            items.forEach((it) => {
              const pid = it?.product?.id || it?.productId || it?.id;
              if (pid) statuses[pid] = 'remembered';
            });
          });

          const rememberingItems = useRememberingStore.getState().rememberingItems || {};
          Object.values(rememberingItems).forEach((it) => {
            const pid = it?.productInfo?.id || it?.productInfo?.product?.id;
            if (pid && statuses[pid] !== 'remembered') {
              statuses[pid] = 'being_understood';
            }
          });

          useOrderStore.getState().updateAllOrderStatuses(statuses);
        });
      }
    );

    const unsubRemembering = useRememberingStore.subscribe(
      (s) => s.rememberingItems,
      (rememberingItems) => {
        const current = useOrderStore.getState().orderStatuses || {};
        const next = { ...current };
        Object.values(rememberingItems || {}).forEach((it) => {
          const pid = it?.productInfo?.id || it?.productInfo?.product?.id;
          if (pid && next[pid] !== 'remembered') next[pid] = 'being_understood';
        });
        useOrderStore.getState().updateAllOrderStatuses(next);
      }
    );

    if (module && module.hot) {
      module.hot.dispose(() => {
        if (ordersUnsub) ordersUnsub();
        unsubAuthUser();
        unsubRemembering();
      });
    }
  });
