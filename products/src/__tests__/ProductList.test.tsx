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
const mockUseCurrentConditions = vi.fn();

vi.mock('../store/cartStore', () => ({
  useCartStore: (selector: (state: typeof cartState) => unknown) => selector(cartState),
}));

vi.mock('../store/orderStore', () => ({
  useOrderStore: (selector: (state: { orderStatuses: Record<number, string> }) => unknown) =>
    selector({ orderStatuses: {} }),
}));

vi.mock('../hooks/useCurrentConditions', () => ({
  useCurrentConditions: () => mockUseCurrentConditions(),
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
    mockUseCurrentConditions.mockReturnValue({
      conditions: {
        time: 'day',
        day: 'monday',
        dayExtras: ['weekday'],
        weather: 'clear',
        season: 'winter',
        events: ['christmas'],
      },
      loading: false,
      view: {
        timeHours: '09',
        timeMinutes: '30',
        timeLabel: '낮',
        isNight: false,
        seasonKey: 'winter',
        dayText: '월·평일',
        weatherLabel: '맑음',
        seasonLabel: '겨울',
        eventLabels: ['크리스마스'],
        temperatureText: '12°C',
      },
    });

    const now = Date.now();
    const data: Emotion[] = [
      {
        id: 1,
        name: { ko: '첫눈에 반함', en: 'Love at First Sight' },
        emoji: '💫',
        description: { ko: '테스트 설명', en: 'Test description' },
        category: 'joy',
        energyCost: 2,
        intensity: 'low',
        published: false,
        image: null,
        intensityOrder: 0,
        createdAt: Timestamp.fromMillis(now),
        visibility: { time: [], day: [], weather: [], season: [], event: [] },
      },
      {
        id: 2,
        name: { ko: '설레는 밤', en: 'Exciting Night' },
        emoji: '🌙',
        description: { ko: '두 번째 설명', en: 'Second description' },
        category: 'sadness',
        energyCost: 5,
        intensity: 'low',
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

  it('활성 기념일이 있으면 리스트 상단에 배너를 표시한다', async () => {
    renderWithProviders(<ProductList />);

    expect(await screen.findByText('기념일')).toBeInTheDocument();
    expect(screen.getByText('크리스마스')).toBeInTheDocument();
    expect(screen.getByText('(12/24 ~ 12/26)')).toBeInTheDocument();
  });
});
