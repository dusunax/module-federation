import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ConditionViewModel } from '../hooks/useCurrentConditions';

interface CurrentConditionUIProps {
  view: ConditionViewModel;
}

const CurrentConditionUI = ({ view }: CurrentConditionUIProps) => {
  const {
    timeHours,
    timeMinutes,
    isNight,
    seasonKey,
    dayText,
    weatherLabel,
    seasonLabel,
    eventLabels,
    temperatureText,
  } = view;

  const conditionTextParts = [
    dayText,
    weatherLabel,
    seasonLabel,
    ...eventLabels,
  ].filter(Boolean);

  const ringClass = isNight
    ? 'bg-[linear-gradient(135deg,#6366f1,#818cf8)]'
    : 'bg-[linear-gradient(135deg,#f59e0b,#fbbf24)]';
  const seasonInnerClass = {
    spring: 'bg-[radial-gradient(circle_at_top,#7a1432,#020617)]',
    summer: 'bg-[radial-gradient(circle_at_top,#7a2a0e,#020617)]',
    autumn: 'bg-[radial-gradient(circle_at_top,#7a3a0e,#020617)]',
    winter: 'bg-[radial-gradient(circle_at_top,#0e3f7a,#020617)]',
  }[seasonKey];

  return (
    <div className="flex items-center justify-center" aria-label="current-conditions">
      <div className={`h-40 w-40 rounded-full p-1 ${ringClass}`}>
        <div
          className={`flex h-full w-full flex-col items-center justify-center rounded-full text-white shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] ${seasonInnerClass}`}
        >
          <div className="text-3xl font-semibold tracking-[1px]">
            {timeHours}
            <span className="mx-0.5 animate-pulse" style={{animationDuration: '1.2s'}}>:</span>
            {timeMinutes}
          </div>

          {conditionTextParts.length > 0 && (
            <div className="max-w-[140px] mb-2 text-center text-[10px] leading-[1.4] opacity-85">
              {conditionTextParts.join('·')}
            </div>
          )}

          <div className="flex items-center gap-1">
            {isNight ? <Moon className="h-9 w-9" /> : <Sun className="h-9 w-9" />}
            <div className="text-xl min-h-7 min-w-10 font-medium opacity-90">{temperatureText}</div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CurrentConditionUI;
