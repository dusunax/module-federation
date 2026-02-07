import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import ProductDetail from '../ProductDetail';
import App from '../App';
import {
  __setMockEmotionById,
  __setMockEmotions,
  Emotion,
} from 'auth/services/emotionService';
import { __setMockRememberingState } from 'auth/rememberingStore';
import { toast } from 'sonner';

const cartState = vi.hoisted(() => ({
  state: {
    items: {} as Record<number, { id: number; product: Emotion; quantity: number }>,
    addToCart: (_product: Emotion) => {},
  },
}));

vi.mock('../store/cartStore', () => ({
  useCartStore: Object.assign(
    (selector: (state: typeof cartState.state) => unknown) => selector(cartState.state),
    { getState: () => cartState.state }
  ),
}));

vi.mock('../store/orderStore', () => ({
  useOrderStore: (selector: (state: { orderStatuses: Record<number, string> }) => unknown) =>
    selector({ orderStatuses: {} }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement, route: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProductDetail', () => {
  beforeEach(() => {
    const emotion: Emotion = {
      id: 1,
      name: '첫눈에 반함',
      emoji: '💫',
      description: '테스트 설명',
      story: '테스트 스토리',
      category: '감정',
      energyCost: 2,
      status: 'NOTICING',
      effects: ['미소'],
    };
    __setMockEmotions([emotion]);
    __setMockEmotionById(emotion);
    __setMockRememberingState({ rememberingItems: {} });
    cartState.state.items = {};
    cartState.state.addToCart = vi.fn((product: Emotion) => {
      cartState.state.items = {
        1: { id: 1, product, quantity: 1 },
      };
    });
    vi.clearAllMocks();
  });

  it('renders detail route in App', async () => {
    renderWithProviders(<App />, '/detail/1');

    expect(await screen.findByText('첫눈에 반함')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.replace(/\s/g, '') === '"테스트스토리"')
    ).toBeInTheDocument();
  });

  it('adds product to cart and shows toast', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/detail/:id" element={<ProductDetail />} />
      </Routes>,
      '/detail/1'
    );

    const button = await screen.findByRole('button', { name: '담기' });
    await userEvent.click(button);

    expect(cartState.state.addToCart).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('1'));
  });
});
