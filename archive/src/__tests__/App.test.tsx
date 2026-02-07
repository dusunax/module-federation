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

describe('Archive App', () => {
  it('renders OrderList on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('OrderList')).toBeInTheDocument();
  });

  it('renders OrderDetail on detail route', () => {
    render(
      <MemoryRouter initialEntries={['/archive/123']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('OrderDetail')).toBeInTheDocument();
  });
});
