import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';

vi.mock('../OrderList', () => ({
  default: () => <div>OrderList</div>,
}));

vi.mock('../OrderDetail', () => ({
  default: () => <div>OrderDetail</div>,
}));

describe('아카이브 앱', () => {
  it('루트에서 OrderList를 렌더링한다', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('OrderList')).toBeInTheDocument();
  });

  it('상세 라우트에서 OrderDetail을 렌더링한다', () => {
    render(
      <MemoryRouter initialEntries={['/archive/123']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('OrderDetail')).toBeInTheDocument();
  });
});
