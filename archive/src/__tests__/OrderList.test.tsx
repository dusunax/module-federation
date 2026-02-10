import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderList from '../OrderList';
import { __setMockOrderState, Order } from 'products/orderStore';
import { __setMockAuthState } from 'auth/authStore';

describe('OrderList', () => {
  beforeEach(() => {
    __setMockAuthState({ user: null });
    __setMockOrderState({
      orders: [],
      removeOrder: vi.fn(),
      getOrder: () => undefined,
    });
  });

  it('비어있을 때 빈 상태를 보여준다', () => {
    render(
      <MemoryRouter>
        <OrderList />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('orders-empty')).toBeInTheDocument();
  });

  it('주문 목록을 렌더링한다', () => {
    const orders: Order[] = [
      {
        id: '1',
        orderDate: { toDate: () => new Date() },
        items: [
          {
            product: {
              id: 1,
              name: '',
              emoji: '💫',
              intensity: 'low',
              category: '',
              description: '',
              story: '',
              published: false,
              image: null,
              energyCost: 0,
              intensityOrder: 0,
              createdAt: { toDate: () => new Date() },
              visibility: { time: [], day: [], weather: [], season: [], event: [] },
            },
            quantity: 1,
            eventCount: { combine: 1 },
            addedAt: { toDate: () => new Date() },
          },
        ],
        totalItems: 1,
        totalEnergy: 0,
        status: 'completed',
      },
    ];
    __setMockOrderState({ orders });

    render(
      <MemoryRouter>
        <OrderList />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('orders-count')).toHaveTextContent('1개의 기록이 있어요');
    expect(screen.getByLabelText('order-card-1')).toBeInTheDocument();
  });

});
