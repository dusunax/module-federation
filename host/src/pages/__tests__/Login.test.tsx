import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Login from '../Login';
import { __setAuthState, __resetAuthState, useAuthStore } from '../../__mocks__/auth/authStore';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    __resetAuthState();
  });

  it('로그인 버튼을 렌더링한다', () => {
    renderLogin();

    expect(screen.getByRole('button', { name: /google로 로그인/i })).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('Google 로그인 클릭 시 signInWithGoogle을 호출한다', async () => {
    const signInWithGoogle = vi.fn(async () => {});
    __setAuthState({ signInWithGoogle });

    renderLogin();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /google로 로그인/i }));

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('에러 메시지를 표시하고 닫기 버튼으로 clearError를 호출한다', async () => {
    const clearError = vi.fn();
    __setAuthState({ error: '로그인에 실패했습니다.', clearError });

    renderLogin();

    expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('닫기'));

    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('loading 상태에서 버튼이 비활성화되고 텍스트가 변경된다', () => {
    __setAuthState({ loading: true });

    renderLogin();

    const button = screen.getByRole('button', { name: /로그인 중/i });
    expect(button).toBeDisabled();
  });
});
