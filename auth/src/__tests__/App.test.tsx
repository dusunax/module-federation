import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

let mockState = {
  user: null as null | { displayName: string | null; email: string | null },
  loading: false,
  initAuthListener: vi.fn(() => () => {}),
};

vi.mock('../store/authStore', () => ({
  useAuthStore: () => mockState,
}));

describe('Auth App', () => {
  it('renders logged-out view', async () => {
    mockState = {
      user: null,
      loading: false,
      initAuthListener: vi.fn(() => () => {}),
    };

    render(<App />);

    await waitFor(() => {
      expect(mockState.initAuthListener).toHaveBeenCalled();
    });

    expect(screen.getByText('로그인되지 않음')).toBeInTheDocument();
  });

  it('renders user info when logged in', () => {
    mockState = {
      user: { displayName: '테스트 사용자', email: 'test@example.com' },
      loading: false,
      initAuthListener: vi.fn(() => () => {}),
    };

    render(<App />);

    expect(screen.getByText('로그인됨: 테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
