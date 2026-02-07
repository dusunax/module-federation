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

describe('인증 앱', () => {
  it('로그아웃 상태 화면을 렌더링한다', async () => {
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

  it('로그인 상태에서 사용자 정보를 렌더링한다', () => {
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
