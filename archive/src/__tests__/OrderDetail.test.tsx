import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderDetail from '../OrderDetail';
import { __setMockOrderState, Order } from 'products/orderStore';

const renderWithRoute = (orderId: string) =>
  render(
    <MemoryRouter initialEntries={[`/archive/${orderId}`]}>
      <Routes>
        <Route path="/archive" element={<div aria-label="archive-root" />} />
        <Route path="/archive/:orderId" element={<OrderDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('OrderDetail', () => {
  beforeEach(() => {
    __setMockOrderState({
      orders: [],
      removeOrder: vi.fn(),
      getOrder: () => undefined,
    });
  });

  it('주문이 없으면 안내를 표시한다', () => {
    renderWithRoute('1');
    expect(screen.getByLabelText('order-not-found')).toBeInTheDocument();
  });

  it('주문 상세를 렌더링한다', () => {
    const order: Order = {
      id: '1',
      orderDate: { toDate: () => new Date() },
      items: [
        {
          product: {
            id: 10,
            name: { ko: '첫눈', en: 'First Snow' },
            emoji: '💫',
            intensity: 'low',
            category: 'joy',
            description: { ko: '설명', en: 'Description' },
            published: false,
            image: null,
            energyCost: 0,
            intensityOrder: 0,
            createdAt: { toDate: () => new Date() },
            visibility: { time: [], day: [], weather: [], season: [], event: [] },
          },
          quantity: 2,
          eventCount: { combine: 2 },
          addedAt: { toDate: () => new Date() },
        },
      ],
      totalItems: 1,
      totalEnergy: 0,
      status: 'completed',
    };
    __setMockOrderState({
      orders: [order],
      getOrder: (id) => (id === 1 ? order : undefined),
      removeOrder: vi.fn(),
    });

    renderWithRoute('1');
    expect(screen.getByLabelText('order-item-10')).toBeInTheDocument();
  });

});
