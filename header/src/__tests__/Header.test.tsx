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
import { UserRole } from '@shared/types/api';

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
        role: UserRole.USER,
      },
      signOut: async () => {},
    });
  });

  it('제목, 에너지, 장바구니 수를 표시한다', () => {
    renderHeader();

    expect(screen.getByText('Booked by Feelings')).toBeInTheDocument();
    expect(screen.getByLabelText('energy-badge')).toHaveTextContent('⚡ 3/5');
    const cartLink = screen.getByLabelText('장바구니 페이지로 이동');
    expect(cartLink.querySelector('span')).toHaveTextContent('3');
  });

  it('장바구니가 비어있으면 수량 배지를 숨긴다', () => {
    __setMockCartState({ items: {} });

    renderHeader();

    const cartLink = screen.getByLabelText('장바구니 페이지로 이동');
    expect(cartLink.querySelector('span')).toBeNull();
  });

  it('로그아웃 상태에서 로그인 링크를 표시한다', () => {
    __setMockAuthState({ user: null });

    renderHeader();

    expect(screen.getByLabelText('login-link')).toBeInTheDocument();
  });

  it('프로필 메뉴에서 로그아웃을 호출한다', async () => {
    const signOut = vi.fn();
    __setMockAuthState({ signOut });

    renderHeader('/dashboard');

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('profile-menu-toggle'));
    await user.click(screen.getByLabelText('profile-logout'));

    expect(signOut).toHaveBeenCalled();
  });
});
