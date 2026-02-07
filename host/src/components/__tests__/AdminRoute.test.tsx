import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import AdminRoute from '../AdminRoute';
import { __setAuthState, __resetAuthState } from '../../__mocks__/auth/authStore';

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/admin/emotions']}>
      <Routes>
        <Route
          path="/admin/emotions"
          element={
            <AdminRoute>
              <div data-testid="admin-content">Admin</div>
            </AdminRoute>
          }
        />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    __resetAuthState();
  });

  it('loading 상태에서 스피너를 표시한다', () => {
    __setAuthState({ loading: true });
    renderWithRouter();

    expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('비인증 사용자가 /로 리다이렉트된다', () => {
    __setAuthState({ user: null, loading: false });
    renderWithRouter();

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('일반 사용자(role !== "admin")가 /로 리다이렉트된다', () => {
    __setAuthState({
      user: {
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        plan: 'free',
        role: 'user',
      },
      loading: false,
    });
    renderWithRouter();

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('admin 사용자가 children을 렌더링한다', () => {
    __setAuthState({
      user: {
        uid: 'admin-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        photoURL: null,
        plan: 'pro',
        role: 'admin',
      },
      loading: false,
    });
    renderWithRouter();

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
