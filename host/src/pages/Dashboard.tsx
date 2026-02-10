import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnergyStore } from 'auth/energyStore';
import { CATEGORY_LABELS } from '@shared/constants/categories';
import type { DailyUsage, Order, FirestoreTimestamp } from '@shared/types/api';

interface ChartProps {
  data?: DailyUsage[];
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 20, bottom: 40, left: 45 };

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

function UsageChart({ data = [] }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[var(--color-text-muted)]">
        데이터가 없습니다.
      </div>
    );
  }

  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const usedValues = data.map((d) => d.used || 0);
  const countValues = data.map((d) => d.count || 0);
  const maxVal = Math.max(...usedValues, ...countValues, 1);
  const yTicks = getYTicks(maxVal);

  const toX = (i: number) =>
    PADDING.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const toY = (v: number) => PADDING.top + plotH - (v / maxVal) * plotH;

  const buildLine = (values: number[]) =>
    values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  const buildArea = (values: number[]) => {
    const baseline = toY(0);
    const pts = values.map((v, i) => `${toX(i)},${toY(v)}`);
    return `${toX(0)},${baseline} ${pts.join(' ')} ${toX(values.length - 1)},${baseline}`;
  };

  const xLabelInterval = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 3;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full">
      {/* grid lines */}
      {yTicks.map((tick) => (
        <line
          key={`grid-${tick}`}
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={toY(tick)}
          y2={toY(tick)}
          stroke="var(--color-border-faded)"
          strokeDasharray="4 4"
        />
      ))}

      {/* used area fill */}
      <polygon points={buildArea(usedValues)} fill="var(--color-green-overlay-1)" />

      {/* count line */}
      <polyline
        fill="none"
        stroke="var(--color-text-muted)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        points={buildLine(countValues)}
      />

      {/* used line */}
      <polyline
        fill="none"
        stroke="var(--color-accent-green)"
        strokeWidth="2"
        points={buildLine(usedValues)}
      />

      {/* used data points */}
      {usedValues.map((v, i) => (
        <g key={`used-${i}`}>
          <circle cx={toX(i)} cy={toY(v)} r="4" fill="var(--color-bg-dark)" stroke="var(--color-accent-green)" strokeWidth="2" />
          {v > 0 && (
            <text
              x={toX(i)}
              y={toY(v) - 8}
              textAnchor="middle"
              fontSize="9"
              fill="var(--color-text-secondary)"
            >
              {v}
            </text>
          )}
        </g>
      ))}

      {/* count data points */}
      {countValues.map((v, i) => (
        <circle
          key={`count-${i}`}
          cx={toX(i)}
          cy={toY(v)}
          r="2.5"
          fill="var(--color-text-muted)"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={PADDING.left - 8}
          y={toY(tick) + 3}
          textAnchor="end"
          fontSize="10"
          fill="var(--color-text-faded)"
        >
          {tick}
        </text>
      ))}

      {/* X axis labels */}
      {data.map((d, i) =>
        i % xLabelInterval === 0 || i === data.length - 1 ? (
          <text
            key={`x-${i}`}
            x={toX(i)}
            y={CHART_HEIGHT - PADDING.bottom + 16}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-text-faded)"
          >
            {formatDateLabel(d.date)}
          </text>
        ) : null,
      )}

      {/* axis lines */}
      <line
        x1={PADDING.left}
        x2={PADDING.left}
        y1={PADDING.top}
        y2={PADDING.top + plotH}
        stroke="var(--color-border-secondary)"
      />
      <line
        x1={PADDING.left}
        x2={CHART_WIDTH - PADDING.right}
        y1={PADDING.top + plotH}
        y2={PADDING.top + plotH}
        stroke="var(--color-border-secondary)"
      />
    </svg>
  );
}

const CHART_DAYS = 14;

function dateKeyFromTimestamp(value: FirestoreTimestamp): string {
  return value.toDate().toISOString().split('T')[0];
}

function makeDateLikeFromKey(dateKey: string): FirestoreTimestamp {
  return { toDate: () => new Date(`${dateKey}T00:00:00Z`) };
}

function fillDateGaps(data: DailyUsage[], days: number): DailyUsage[] {
  const lookup = new Map<string, DailyUsage>();
  for (const d of data) {
    lookup.set(dateKeyFromTimestamp(d.date), d);
  }

  const result: DailyUsage[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(
      lookup.get(key) ?? {
        date: makeDateLikeFromKey(key),
        used: 0,
        count: 0,
        updatedAt: makeDateLikeFromKey(key),
      }
    );
  }
  return result;
}

function formatOrderDate(value: FirestoreTimestamp): string {
  const date = value.toDate();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function groupOrdersByDate(orders: Order[]): Map<string, Order[]> {
  const grouped = new Map<string, Order[]>();
  for (const order of orders) {
    const dateKey = dateKeyFromTimestamp(order.orderDate);
    const existing = grouped.get(dateKey);
    if (existing) {
      existing.push(order);
    } else {
      grouped.set(dateKey, [order]);
    }
  }
  return grouped;
}

function RecentOrders({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent-green)] border-t-transparent" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-[var(--color-text-muted)]">
        저장된 기록이 없습니다.
      </div>
    );
  }

  const grouped = groupOrdersByDate(orders);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateKey, dateOrders]) => (
        <div key={dateKey}>
          <div className="mb-2 text-xs font-medium text-[var(--color-text-faded)]">
            {formatOrderDate(dateOrders[0].orderDate)}
          </div>
          <div className="space-y-1.5">
            {dateOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const items = order.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] px-3 py-2">
        <span className="text-sm text-[var(--color-text-muted)]">(항목 없음)</span>
        <span className="text-xs text-[var(--color-text-faded)]">
          {order.totalEnergy != null && `${order.totalEnergy}`}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] px-3 py-2">
      {items.map((item, idx) => {
        const product = item.product;
        const emoji = product?.emoji ?? '';
        const name = product?.name ?? '알 수 없는 항목';
        const category = product?.category;
        const cost = (product?.energyCost ?? 1) * (item.quantity ?? 1);
        return (
          <div key={idx} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2">
              {emoji && <span className="text-base">{emoji}</span>}
              <span className="text-sm text-[var(--color-text-primary)]">{name}</span>
              {category && (
                <span className="text-xs text-[var(--color-text-faded)]">{CATEGORY_LABELS[category] ?? category}</span>
              )}
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{cost}</span>
          </div>
        );
      })}
    </div>
  );
}

const RECENT_ORDERS_COUNT = 20;

export default function Dashboard() {
  const fetchDailyUsage = useEnergyStore((s) => s.fetchDailyUsage);
  const fetchRecentOrders = useEnergyStore((s) => s.fetchRecentOrders);
  const [data, setData] = useState<DailyUsage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadUsage = useCallback(async () => {
    setLoading(true);
    const items = await fetchDailyUsage(CHART_DAYS);
    setData(fillDateGaps(items || [], CHART_DAYS));
    setLoading(false);
  }, [fetchDailyUsage]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    const result = await fetchRecentOrders(RECENT_ORDERS_COUNT);
    setOrders(result || []);
    setOrdersLoading(false);
  }, [fetchRecentOrders]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Promise.all([loadUsage(), loadOrders()]);
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [loadUsage, loadOrders]);

  const totalUsed = useMemo(() => data.reduce((s, d) => s + (d.used || 0), 0), [data]);
  const totalCount = useMemo(() => data.reduce((s, d) => s + (d.count || 0), 0), [data]);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-normal text-[var(--color-text-primary)]">대시보드</h1>

      <section className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm text-[var(--color-text-secondary)]">최근 14일 에너지 사용</h2>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-faded)]">
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-0.5 w-4 rounded"
                style={{ background: 'var(--color-accent-green)' }}
              />
              에너지
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-0.5 w-4 rounded border-t border-dashed"
                style={{ borderColor: 'var(--color-text-muted)' }}
              />
              저장 수
            </span>
          </div>
        </div>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent-green)] border-t-transparent" />
          </div>
        ) : (
          <UsageChart data={data} />
        )}
        <div className="mt-2 text-xs text-[var(--color-text-faded)]">날짜는 KST 기준입니다.</div>
      </section>

      <section className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <h2 className="mb-3 text-sm text-[var(--color-text-secondary)]">요약</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] p-3">
            <div className="text-xs text-[var(--color-text-faded)]">총 에너지 사용</div>
            <div className="mt-1 text-xl font-normal text-[var(--color-accent-green)]">
              {totalUsed}
            </div>
          </div>
          <div className="rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] p-3">
            <div className="text-xs text-[var(--color-text-faded)]">총 저장 수</div>
            <div className="mt-1 text-xl font-normal text-[var(--color-text-primary)]">
              {totalCount}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <h2 className="mb-3 text-sm text-[var(--color-text-secondary)]">최근 저장 기록</h2>
        <RecentOrders orders={orders} loading={ordersLoading} />
      </section>
    </div>
  );
}
