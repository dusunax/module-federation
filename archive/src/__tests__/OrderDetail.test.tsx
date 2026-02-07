import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderDetail from '../OrderDetail';
import { __setMockOrderState, Order } from 'products/orderStore';
import showConfirmToast from '@shared/components/showConfirmToast';
import { toast } from 'sonner';

vi.mock('@shared/components/showConfirmToast', () => ({
  default: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

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
      orderDate: new Date().toISOString(),
      items: [
        {
          product: { id: 10, name: '첫눈', emoji: '💫', description: '설명', category: '감정' },
          quantity: 2,
        },
      ],
      totalItems: 1,
    };
    __setMockOrderState({
      orders: [order],
      getOrder: (id) => (id === 1 ? order : undefined),
      removeOrder: vi.fn(),
    });

    renderWithRoute('1');
    expect(screen.getByLabelText('order-item-10')).toBeInTheDocument();
  });

  it('확인 시 주문을 삭제한다', async () => {
    const removeOrder = vi.fn();
    const order: Order = {
      id: '1',
      orderDate: new Date().toISOString(),
      items: [
        {
          product: { id: 10, name: '첫눈', emoji: '💫', description: '설명', category: '감정' },
          quantity: 2,
        },
      ],
      totalItems: 1,
    };
    __setMockOrderState({
      orders: [order],
      getOrder: (id) => (id === 1 ? order : undefined),
      removeOrder,
    });

    renderWithRoute('1');

    await userEvent.click(screen.getByLabelText('order-detail-forget'));
    const confirmMock = showConfirmToast as unknown as ReturnType<typeof vi.fn>;
    const { onConfirm } = confirmMock.mock.calls[0][0];
    await act(async () => {
      onConfirm();
    });

    expect(removeOrder).toHaveBeenCalledWith(1);
    const toastSuccess = toast.success as unknown as ReturnType<typeof vi.fn>;
    expect(toastSuccess).toHaveBeenCalledWith('기억이 삭제되었습니다.');
  });
});
