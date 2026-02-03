import React, { useEffect, useState } from 'react';
import { useEnergyStore } from 'auth/energyStore';

interface DailyUsage {
  used: number;
  count: number;
  date: string;
}

interface SimpleLineChartProps {
  data?: DailyUsage[];
}

function SimpleLineChart({ data = [] }: SimpleLineChartProps) {
  if (!data || data.length === 0) return <div className="text-sm">데이터가 없습니다.</div>;

  const width = 600;
  const height = 120;
  const padding = 20;

  const values = data.map((d) => d.used || 0);
  const max = Math.max(...values, 1);

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2 || 0);
    const y = height - padding - (v / max) * (height - padding * 2 || 0);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px]">
      <polyline
        fill="none"
        stroke="#9ae6b4"
        strokeWidth="2"
        points={points.join(' ')}
      />
      {values.map((v, i) => {
        const [x, y] = points[i].split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r="3" fill="#68d391" />;
      })}
    </svg>
  );
}

export default function Dashboard() {
  const fetchDailyUsage = useEnergyStore((s) => s.fetchDailyUsage);
  const [data, setData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const items = await fetchDailyUsage(14);
      if (mounted) setData(items || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchDailyUsage]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-light text-[var(--color-text-primary)]">대시보드</h1>
      <section className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
        <h2 className="mb-2 text-sm text-[var(--color-text-secondary)]">최근 14일 에너지 사용</h2>
        {loading ? <div>로딩 중...</div> : <SimpleLineChart data={data} />}
        <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
          날짜는 KST로 표시됩니다.
        </div>
      </section>
      <section className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
        <h2 className="mb-2 text-sm text-[var(--color-text-secondary)]">요약</h2>
        <div className="text-sm text-[var(--color-text-primary)]">
          총 사용량: {data.reduce((s, d) => s + (d.used || 0), 0)} / 총 저장: {data.reduce((s, d) => s + (d.count || 0), 0)}
        </div>
      </section>
    </div>
  );
}
