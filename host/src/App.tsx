import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastHost from './components/ToastHost';
import { useRememberProgress } from 'cart/features/remembering/hooks/useRememberProgress';
import { useRememberingSync } from 'cart/features/remembering/hooks/useRememberingSync';
import AppRoutes from './routes';
import './styles/tailwind.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useRememberingSync();
  useRememberProgress();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastHost />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
