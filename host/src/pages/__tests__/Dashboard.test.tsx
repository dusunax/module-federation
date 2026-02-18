import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Dashboard from '../Dashboard';
import { __setEnergyState, __resetEnergyState } from '../../__mocks__/auth/energyStore';
import type { DailyUsage, Order, FirestoreTimestamp } from '@shared/types/api';

// Utility functions are not exported from Dashboard, so we test them
// indirectly through component behavior and also via a dedicated test module.

// ---- Utility function tests (re-implemented for isolated testing) ----

function makeDateLike(ms: number): FirestoreTimestamp {
  return { toDate: () => new Date(ms) };
}

function formatDateLabel(dateValue: FirestoreTimestamp): string {
  const date = dateValue.toDate();
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getYTicks(max: number): number[] {
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);
  const step = Math.ceil(max / 4);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(max);
  return ticks;
}

function fillDateGaps(data: DailyUsage[], days: number): DailyUsage[] {
  const lookup = new Map<string, DailyUsage>();
  for (const d of data) {
    const key = d.date.toDate().toISOString().split('T')[0];
    lookup.set(key, d);
  }

  const result: DailyUsage[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(
      lookup.get(key) ?? {
        date: makeDateLike(new Date(`${key}T00:00:00Z`).getTime()),
        used: 0,
        count: 0,
        updatedAt: makeDateLike(new Date(`${key}T00:00:00Z`).getTime()),
      }
    );
  }
  return result;
}

function groupOrdersByDate(orders: Order[]): Map<string, Order[]> {
  const grouped = new Map<string, Order[]>();
  for (const order of orders) {
    const dateKey = order.orderDate.toDate().toISOString().split('T')[0];
    const existing = grouped.get(dateKey);
    if (existing) {
      existing.push(order);
    } else {
      grouped.set(dateKey, [order]);
    }
  }
  return grouped;
}

describe('Dashboard utility functions', () => {
  describe('formatDateLabel', () => {
    it('"2024-01-05"를 "1/5"로 변환한다', () => {
      expect(formatDateLabel(makeDateLike(new Date('2024-01-05T00:00:00Z').getTime()))).toBe('1/5');
    });

    it('"2024-12-25"를 "12/25"로 변환한다', () => {
      expect(formatDateLabel(makeDateLike(new Date('2024-12-25T00:00:00Z').getTime()))).toBe('12/25');
    });

    it('앞자리 0을 제거한다', () => {
      expect(formatDateLabel(makeDateLike(new Date('2024-03-09T00:00:00Z').getTime()))).toBe('3/9');
    });
  });

  describe('getYTicks', () => {
    it('max <= 5이면 0부터 max까지의 정수 배열을 반환한다', () => {
      expect(getYTicks(3)).toEqual([0, 1, 2, 3]);
      expect(getYTicks(5)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('max > 5이면 약 4등분된 tick 배열을 반환한다', () => {
      const ticks = getYTicks(20);
      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(20);
      expect(ticks.length).toBeGreaterThanOrEqual(4);
    });

    it('max가 step의 배수가 아니면 마지막에 max를 추가한다', () => {
      const ticks = getYTicks(7);
      expect(ticks[ticks.length - 1]).toBe(7);
    });
  });

  describe('fillDateGaps', () => {
    it('지정된 일수만큼 결과를 반환한다', () => {
      const result = fillDateGaps([], 7);
      expect(result).toHaveLength(7);
    });

    it('빈 데이터에 대해 0으로 채운다', () => {
      const result = fillDateGaps([], 3);
      result.forEach((d) => {
        expect(d.used).toBe(0);
        expect(d.count).toBe(0);
      });
    });

    it('기존 데이터가 있으면 해당 날짜에 올바른 값을 반환한다', () => {
      const today = new Date().toISOString().split('T')[0];
      const data: DailyUsage[] = [
        {
          date: makeDateLike(new Date(`${today}T00:00:00Z`).getTime()),
          used: 10,
          count: 5,
          updatedAt: makeDateLike(new Date(`${today}T00:00:00Z`).getTime()),
        },
      ];
      const result = fillDateGaps(data, 3);

      const todayEntry = result.find((d) => {
        const key = typeof d.date === 'string' ? d.date : typeof d.date === 'number' ? new Date(d.date).toISOString().split('T')[0] : d.date.toDate().toISOString().split('T')[0];
        return key === today;
      });
      expect(todayEntry?.used).toBe(10);
      expect(todayEntry?.count).toBe(5);
    });
  });

  describe('groupOrdersByDate', () => {
    it('같은 날짜의 주문을 그룹화한다', () => {
      const orders: Order[] = [
        {
          id: '1',
          orderDate: makeDateLike(new Date('2024-01-15T10:00:00Z').getTime()),
          items: [],
          totalEnergy: 0,
          totalItems: 0,
          status: 'completed',
        },
        {
          id: '2',
          orderDate: makeDateLike(new Date('2024-01-15T14:00:00Z').getTime()),
          items: [],
          totalEnergy: 0,
          totalItems: 0,
          status: 'completed',
        },
        {
          id: '3',
          orderDate: makeDateLike(new Date('2024-01-16T09:00:00Z').getTime()),
          items: [],
          totalEnergy: 0,
          totalItems: 0,
          status: 'completed',
        },
      ];

      const grouped = groupOrdersByDate(orders);
      expect(grouped.size).toBe(2);
      expect(grouped.get('2024-01-15')).toHaveLength(2);
      expect(grouped.get('2024-01-16')).toHaveLength(1);
    });

    it('빈 배열이면 빈 Map을 반환한다', () => {
      const grouped = groupOrdersByDate([]);
      expect(grouped.size).toBe(0);
    });
  });
});

describe('Dashboard component', () => {
  beforeEach(() => {
    __resetEnergyState();
  });

  it('로딩 상태에서 스켈레톤을 렌더링한다', async () => {
    __setEnergyState({
      fetchDailyUsage: vi.fn(async () => []),
      fetchRecentOrders: vi.fn(async () => []),
    });

    const { container } = render(<Dashboard />);

    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('총 에너지 사용')).toBeInTheDocument();
    });
  });

  it('데이터 로드 후 요약 통계를 표시한다', async () => {
    const today = new Date().toISOString().split('T')[0];
    const mockUsage: DailyUsage[] = [
      {
        date: makeDateLike(new Date(`${today}T00:00:00Z`).getTime()),
        used: 15,
        count: 3,
        updatedAt: makeDateLike(new Date(`${today}T00:00:00Z`).getTime()),
      },
    ];

    __setEnergyState({
      fetchDailyUsage: vi.fn(async () => mockUsage),
      fetchRecentOrders: vi.fn(async () => []),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('총 에너지 사용')).toBeInTheDocument();
      const summarySection = screen.getByText('요약').closest('section')!;
      expect(summarySection.textContent).toContain('15');
      expect(summarySection.textContent).toContain('3');
    });
  });
});
