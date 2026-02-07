import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderList from '../OrderList';
import { __setMockOrderState, Order } from 'products/orderStore';
import { __setMockAuthState } from 'auth/authStore';
import showConfirmToast from '@shared/components/showConfirmToast';
import { toast } from 'sonner';

vi.mock('@shared/components/showConfirmToast', () => ({
  default: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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
        orderDate: new Date().toISOString(),
        items: [{ product: { id: 1, emoji: '💫' }, quantity: 1 }],
        totalItems: 1,
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

  it('확인 시 목록에서 삭제한다', async () => {
    const removeOrder = vi.fn();
    const orders: Order[] = [
      {
        id: '1',
        orderDate: new Date().toISOString(),
        items: [{ product: { id: 1, emoji: '💫' }, quantity: 1 }],
        totalItems: 1,
      },
    ];
    __setMockOrderState({ orders, removeOrder });

    render(
      <MemoryRouter>
        <OrderList />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByLabelText('order-forget-1'));

    const confirmMock = showConfirmToast as unknown as ReturnType<typeof vi.fn>;
    expect(confirmMock).toHaveBeenCalled();
    const { onConfirm } = confirmMock.mock.calls[0][0];
    await onConfirm();

    expect(removeOrder).toHaveBeenCalledWith(1);
    const toastSuccess = toast.success as unknown as ReturnType<typeof vi.fn>;
    expect(toastSuccess).toHaveBeenCalledWith('기억이 삭제되었습니다.');
  });
});
