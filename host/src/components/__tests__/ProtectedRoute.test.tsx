import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { __setAuthState, __resetAuthState } from '../../__mocks__/auth/authStore';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Protected</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    __resetAuthState();
  });

  it('loading 상태에서 스피너를 표시한다', () => {
    __setAuthState({ loading: true });
    renderWithRouter('/');

    expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('비인증 사용자가 "/" 접근 시 children을 렌더링한다', () => {
    __setAuthState({ user: null, loading: false });
    renderWithRouter('/');

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('비인증 사용자가 다른 경로 접근 시 /login으로 리다이렉트한다', () => {
    __setAuthState({ user: null, loading: false });
    renderWithRouter('/dashboard');

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('인증된 사용자가 children을 렌더링한다', () => {
    __setAuthState({
      user: {
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        plan: 'free',
      },
      loading: false,
    });
    renderWithRouter('/dashboard');

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
