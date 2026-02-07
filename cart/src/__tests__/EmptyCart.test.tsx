import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyCart } from '../features/cart-management/components/EmptyCart/EmptyCart';

describe('EmptyCart', () => {
  it('shows empty cart message', () => {
    render(<EmptyCart />);

    expect(screen.getByText('장바구니가 비어있습니다')).toBeInTheDocument();
    expect(screen.getByText('순간을 추가해보세요')).toBeInTheDocument();
  });
});
