import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CartItem } from '../features/cart-management/components/CartItem/CartItem';
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

describe('CartItem', () => {
  it('플러스/마이너스 버튼으로 수량을 변경한다', async () => {
    const updateQuantity = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <CartItem
        product={{ id: 1, name: '첫눈', emoji: '💫', energyCost: 2 }}
        quantity={2}
        orderStatuses={{}}
        timeRemaining={{}}
        item={{ id: 1, product: { id: 1 }, quantity: 2, addedAt: Date.now() }}
        itemId={1}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    );

    await userEvent.click(screen.getByLabelText('cart-qty-decrease'));
    await userEvent.click(screen.getByLabelText('cart-qty-increase'));

    expect(updateQuantity).toHaveBeenCalledWith(1, 1);
    expect(updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('확인 시 아이템을 삭제한다', async () => {
    const updateQuantity = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <CartItem
        product={{ id: 1, name: '첫눈', emoji: '💫', energyCost: 2 }}
        quantity={1}
        orderStatuses={{}}
        timeRemaining={{}}
        item={{ id: 1, product: { id: 1 }, quantity: 1, addedAt: Date.now() }}
        itemId={1}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    );

    await userEvent.click(screen.getByLabelText('cart-remove-item'));

    const showConfirmToastMock = showConfirmToast as unknown as ReturnType<typeof vi.fn>;
    const { onConfirm } = showConfirmToastMock.mock.calls[0][0];
    onConfirm();

    expect(removeFromCart).toHaveBeenCalledWith(1);
    const toastSuccess = toast.success as unknown as ReturnType<typeof vi.fn>;
    expect(toastSuccess).toHaveBeenCalledWith('기억이 삭제되었습니다.');
  });
});
