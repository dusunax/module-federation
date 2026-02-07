import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, vi } from 'vitest';
import ProductList from '../ProductList';
import { __setMockEmotions, Emotion } from 'auth/services/emotionService';

const cartState = { items: {} as Record<number, { product: { id: number } }> };

vi.mock('../store/cartStore', () => ({
  useCartStore: (selector: (state: typeof cartState) => unknown) => selector(cartState),
}));

vi.mock('../store/orderStore', () => ({
  useOrderStore: (selector: (state: { orderStatuses: Record<number, string> }) => unknown) =>
    selector({ orderStatuses: {} }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProductList', () => {
  beforeEach(() => {
    const data: Emotion[] = [
      {
        id: 1,
        name: '첫눈에 반함',
        emoji: '💫',
        description: '테스트 설명',
        category: '감정',
        energyCost: 2,
        status: 'NOTICING',
        createdAt: { seconds: 10 },
      },
      {
        id: 2,
        name: '설레는 밤',
        emoji: '🌙',
        description: '두 번째 설명',
        category: '기분',
        energyCost: 5,
        status: 'NOTICING',
        createdAt: { seconds: 20 },
      },
    ];
    __setMockEmotions(data);
  });

  it('renders product cards from api data', async () => {
    renderWithProviders(<ProductList />);

    expect(await screen.findByText('첫눈에 반함')).toBeInTheDocument();
    expect(screen.getByText('설레는 밤')).toBeInTheDocument();
    expect(screen.getByText('⚡ 2')).toBeInTheDocument();
    expect(screen.getByText('⚡ 5')).toBeInTheDocument();
  });
});
