import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
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
    const now = Date.now();
    const data: Emotion[] = [
      {
        id: 1,
        name: '첫눈에 반함',
        emoji: '💫',
        description: '테스트 설명',
        category: 'joy',
        energyCost: 2,
        intensity: 'low',
        story: '',
        published: false,
        image: null,
        intensityOrder: 0,
        createdAt: Timestamp.fromMillis(now),
        visibility: { time: [], day: [], weather: [], season: [], event: [] },
      },
      {
        id: 2,
        name: '설레는 밤',
        emoji: '🌙',
        description: '두 번째 설명',
        category: 'sadness',
        energyCost: 5,
        intensity: 'low',
        story: '',
        published: false,
        image: null,
        intensityOrder: 0,
        createdAt: Timestamp.fromMillis(now + 1),
        visibility: { time: [], day: [], weather: [], season: [], event: [] },
      },
    ];
    __setMockEmotions(data);
  });

  it('API 데이터로 상품 카드가 렌더링된다', async () => {
    renderWithProviders(<ProductList />);

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('view-mode-list'));

    expect(await screen.findByLabelText('products-search')).toBeInTheDocument();
    expect(screen.getByLabelText('products-sort-energy')).toBeInTheDocument();
    expect(screen.getByLabelText('products-filter-collection')).toBeInTheDocument();
    expect(await screen.findByLabelText('product-card-1')).toBeInTheDocument();
    expect(screen.getByLabelText('product-card-2')).toBeInTheDocument();
  });
});
