import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CartList } from '../features/cart-management/components/CartList/CartList';
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

describe('CartList', () => {
  it('clears all items on confirm', async () => {
    const removeFromCart = vi.fn();
    const normalItems = [
      {
        id: 1,
        product: { id: 1, name: '첫눈', emoji: '💫', energyCost: 2 },
        quantity: 1,
        addedAt: Date.now(),
      },
      {
        id: 2,
        product: { id: 2, name: '설렘', emoji: '🌙', energyCost: 3 },
        quantity: 2,
        addedAt: Date.now(),
      },
    ];

    render(
      <CartList
        normalItems={normalItems}
        normalTotalItems={3}
        items={{}}
        orderStatuses={{}}
        timeRemaining={{}}
        updateQuantity={vi.fn()}
        removeFromCart={removeFromCart}
      />
    );

    await userEvent.click(screen.getByLabelText('cart-clear-all'));

    const showConfirmToastMock = showConfirmToast as unknown as ReturnType<typeof vi.fn>;
    expect(showConfirmToastMock).toHaveBeenCalled();
    const { onConfirm } = showConfirmToastMock.mock.calls[0][0];
    onConfirm();

    expect(removeFromCart).toHaveBeenCalledTimes(2);
    expect(removeFromCart).toHaveBeenCalledWith(1);
    expect(removeFromCart).toHaveBeenCalledWith(2);
    const toastSuccess = toast.success as unknown as ReturnType<typeof vi.fn>;
    expect(toastSuccess).toHaveBeenCalledWith('장바구니가 비워졌습니다.');
  });
});
