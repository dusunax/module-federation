import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Header from '../Header';
import { __setMockCartState } from 'products/cartStore';
import { __setMockAuthState } from 'auth/authStore';
import { __setMockEnergyState } from 'auth/energyStore';
import { __setMockRememberingState } from 'auth/rememberingStore';

describe('Header', () => {
  const renderHeader = (path = '/') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Header />
      </MemoryRouter>
    );

  beforeEach(() => {
    __setMockCartState({
      items: {
        1: { id: 1, quantity: 2 },
        2: { id: 2, quantity: 1 },
      },
    });
    __setMockRememberingState({ rememberingItems: {} });
    __setMockEnergyState({ current: 3, maxEnergy: 5 });
    __setMockAuthState({
      user: {
        displayName: '테스트 사용자',
        email: 'test@example.com',
        photoURL: '',
        plan: 'none',
        role: 'user',
      },
      signOut: async () => {},
    });
  });

  it('renders title, energy, and cart count', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Love at First Sight')).toBeInTheDocument();
    expect(screen.getByText('⚡ 3/5')).toBeInTheDocument();
    const cartLink = screen.getByLabelText('장바구니 페이지로 이동');
    expect(cartLink.querySelector('span')).toHaveTextContent('3');
  });

  it('hides cart count when there are no items', () => {
    __setMockCartState({ items: {} });

    renderHeader();

    const cartLink = screen.getByLabelText('장바구니 페이지로 이동');
    expect(cartLink.querySelector('span')).toBeNull();
  });

  it('shows login link when user is logged out', () => {
    __setMockAuthState({ user: null });

    renderHeader();

    const loginLink = document.querySelector('a[href="/login"]');
    expect(loginLink).toBeTruthy();
  });

  it('opens profile menu and calls signOut', async () => {
    const signOut = vi.fn();
    __setMockAuthState({ signOut });

    renderHeader('/dashboard');

    const button = document.querySelector('button') as HTMLButtonElement;
    const user = userEvent.setup();
    await user.click(button);

    const logoutButton = screen.getByText('로그아웃');
    await user.click(logoutButton);

    expect(signOut).toHaveBeenCalled();
  });
});
