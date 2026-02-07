import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  Flower2,
  Leaf,
  PartyPopper,
  Heart,
  Gift,
  Skull,
  MoonStar,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CurrentConditions as CurrentConditionsType } from '../utils/conditions';

interface ConditionCellConfig {
  icon: LucideIcon;
  label: string;
  gradient: string;
  glowColor: string;
}

const TIME_CONFIG: Record<string, ConditionCellConfig> = {
  day: {
    icon: Sun,
    label: '낮',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  night: {
    icon: Moon,
    label: '밤',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
};

const DAY_LABELS: Record<string, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일',
};

const WEATHER_CONFIG: Record<string, ConditionCellConfig> = {
  clear: {
    icon: Sun,
    label: '맑음',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  cloudy: {
    icon: Cloud,
    label: '흐림',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
    glowColor: 'rgba(148, 163, 184, 0.4)',
  },
  rain: {
    icon: CloudRain,
    label: '비',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  snow: {
    icon: Snowflake,
    label: '눈',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    glowColor: 'rgba(34, 211, 238, 0.4)',
  },
  storm: {
    icon: CloudLightning,
    label: '폭풍',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
};

const SEASON_CONFIG: Record<string, ConditionCellConfig> = {
  spring: {
    icon: Flower2,
    label: '봄',
    gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  summer: {
    icon: Sun,
    label: '여름',
    gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  autumn: {
    icon: Leaf,
    label: '가을',
    gradient: 'linear-gradient(135deg, #b45309, #d97706)',
    glowColor: 'rgba(217, 119, 6, 0.4)',
  },
  winter: {
    icon: Snowflake,
    label: '겨울',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
};

const EVENT_CONFIG: Record<string, ConditionCellConfig> = {
  newyear: {
    icon: PartyPopper,
    label: '새해',
    gradient: 'linear-gradient(135deg, #dc2626, #f59e0b)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  valentines: {
    icon: Heart,
    label: '발렌타인',
    gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  whiteday: {
    icon: Gift,
    label: '화이트데이',
    gradient: 'linear-gradient(135deg, #e2e8f0, #f8fafc)',
    glowColor: 'rgba(226, 232, 240, 0.4)',
  },
  halloween: {
    icon: Skull,
    label: '할로윈',
    gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  christmas: {
    icon: Gift,
    label: '크리스마스',
    gradient: 'linear-gradient(135deg, #16a34a, #dc2626)',
    glowColor: 'rgba(22, 163, 74, 0.4)',
  },
  chuseok: {
    icon: MoonStar,
    label: '추석',
    gradient: 'linear-gradient(135deg, #ca8a04, #eab308)',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
};

const STYLES = `
@keyframes condition-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes condition-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.condition-cell {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.condition-cell:hover {
  transform: scale(1.08);
}
.condition-icon {
  animation: condition-pulse 3s ease-in-out infinite;
}
.clock-colon {
  animation: blink 1s step-end infinite;
}
`;

interface ConditionCellProps {
  config: ConditionCellConfig;
  extraLabel?: string;
}

function ConditionCell({ config, extraLabel }: ConditionCellProps): React.ReactElement {
  const Icon = config.icon;
  const label = extraLabel ? `${config.label} (${extraLabel})` : config.label;

  return (
    <span
      className="condition-cell inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
      style={{
        background: config.gradient,
        boxShadow: `0 0 8px ${config.glowColor}`,
      }}
    >
      <Icon size={14} className="condition-icon shrink-0 text-white" />
      <span className="text-[10px] font-medium text-white">{label}</span>
    </span>
  );
}

interface Props {
  conditions: CurrentConditionsType;
}

function CurrentConditions({ conditions }: Props): React.ReactElement {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  const timeConfig = TIME_CONFIG[conditions.time];
  const isWeekend = conditions.dayExtras.includes('weekend');
  const dayLabel = DAY_LABELS[conditions.day] ?? conditions.day;
  const weatherConfig = WEATHER_CONFIG[conditions.weather];
  const seasonConfig = SEASON_CONFIG[conditions.season];

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="current-conditions">
      <style>{STYLES}</style>

      <span
        className="condition-cell inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          boxShadow: '0 0 8px rgba(51, 65, 85, 0.5)',
        }}
      >
        <Clock size={14} className="shrink-0 text-white" />
        <span className="text-[10px] font-medium tabular-nums text-white">
          {hours}
          <span className="clock-colon">:</span>
          {minutes}
        </span>
      </span>

      {timeConfig && <ConditionCell config={timeConfig} />}

      <span
        className="condition-cell inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
        }}
      >
        <Calendar size={14} className="condition-icon shrink-0 text-white" />
        <span className="text-[10px] font-medium text-white">
          {dayLabel} ({isWeekend ? '주말' : '평일'})
        </span>
      </span>

      {weatherConfig && <ConditionCell config={weatherConfig} />}

      {seasonConfig && <ConditionCell config={seasonConfig} />}

      {conditions.events.map((event) => {
        const eventConfig = EVENT_CONFIG[event];
        if (!eventConfig) return null;
        return <ConditionCell key={event} config={eventConfig} />;
      })}
    </div>
  );
}

export default CurrentConditions;
