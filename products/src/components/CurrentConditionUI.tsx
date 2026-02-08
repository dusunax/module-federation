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
    timeLabel,
    isNight,
    seasonKey,
    dayText,
    weatherLabel,
    seasonLabel,
    eventLabels,
    temperatureText,
  } = view;

  const conditionTextParts = [
    timeLabel,
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
    <div className="flex items-center w-full justify-center" aria-label="current-conditions">
      <div className={`ml-0 sm:ml-8 md:ml-0 h-24 w-full md:h-40 md:w-40 rounded-full p-0.5 md:p-1 ${ringClass}`}>
        <div
          className={`flex h-full flex-wrap w-full md:flex-col items-center justify-center rounded-full gap-y-0 sm:gap-x-4 gap-x-2 text-white shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] ${seasonInnerClass}`}
        >
          <div className="sm:text-3xl text-2xl font-semibold tracking-[1px] sm:translate-y-1 md:translate-y-0 translate-y-1.5">
            {timeHours}
            <span className="mx-0.5 animate-pulse" style={{animationDuration: '1.2s'}}>:</span>
            {timeMinutes}
          </div>

          {conditionTextParts.length > 0 && (
            <div className="md:max-w-[80px] order-last md:order-0 w-full md:max-w-[140px] text-center text-base sm:text-lg md:text-[12px] leading-[1.4] opacity-85 sm:-translate-y-1 md:translate-y-0 -translate-y-1.5">
              {conditionTextParts.join('·')}
            </div>
          )}

          <div className="flex items-center gap-1 sm:translate-y-1 md:translate-y-0 translate-y-1.5">
            {isNight ? <Moon className="sm:h-10 h-6 sm:w-10 w-6 md:h-9 md:w-9" /> : <Sun className="sm:h-10 h-6 sm:w-10 w-6 md:h-9 md:w-9" />}
            <div className="text-2xl md:text-xl min-h-7 min-w-10 font-medium opacity-90 flex items-center justify-center">{temperatureText}</div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CurrentConditionUI;
