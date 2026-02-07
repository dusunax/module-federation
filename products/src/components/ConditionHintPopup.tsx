import React, { useMemo } from 'react';
import { Check, InfoIcon, Lock, X } from 'lucide-react';
import {
  VisibilityCondition,
  CurrentConditions,
  CONDITION_META,
  isEmotionVisible,
} from '../utils/conditions';

interface EmotionLike {
  emoji?: string;
  visibility?: VisibilityCondition;
}

interface Props {
  emotions: EmotionLike[];
  conditions: CurrentConditions;
  isOpen: boolean;
  onClose: () => void;
}

interface ConditionGroup {
  conditionKey: string;
  conditionLabel: string;
  emotionEmojis: string[];
  isMet: boolean;
}

function isConditionMet(conditionKey: string, conditions: CurrentConditions): boolean {
  const allDays = [conditions.day, ...conditions.dayExtras];

  if (['day', 'night'].includes(conditionKey)) return conditions.time === conditionKey;
  if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'weekday', 'weekend'].includes(conditionKey)) {
    return allDays.includes(conditionKey as typeof conditions.day);
  }
  if (['clear', 'cloudy', 'rain', 'snow', 'storm'].includes(conditionKey)) return conditions.weather === conditionKey;
  if (['spring', 'summer', 'autumn', 'winter'].includes(conditionKey)) return conditions.season === conditionKey;
  return conditions.events.includes(conditionKey);
}

function ConditionHintPopup({ emotions, conditions, isOpen, onClose }: Props): React.ReactElement | null {
  const groups = useMemo((): ConditionGroup[] => {
    const groupMap = new Map<string, Set<string>>();
    const alwaysEmojis = new Set<string>();

    for (const emotion of emotions) {
      const v = emotion.visibility;
      if (!v) {
        alwaysEmojis.add(emotion.emoji ?? '?');
        continue;
      }

      const hasCondition =
        v.time.length > 0 ||
        v.day.length > 0 ||
        v.weather.length > 0 ||
        v.season.length > 0 ||
        v.event.length > 0;
      if (!hasCondition) {
        alwaysEmojis.add(emotion.emoji ?? '?');
        continue;
      }

      // Only include emoji if the entire visibility condition is met
      const isVisible = isEmotionVisible({ visibility: v }, conditions);
      if (!isVisible) {
        continue;
      }

      const allKeys = [...v.time, ...v.day, ...v.weather, ...v.season, ...v.event];
      for (const key of allKeys) {
        if (!groupMap.has(key)) groupMap.set(key, new Set());
        groupMap.get(key)!.add(emotion.emoji ?? '?');
      }
    }

    const conditionGroups = Array.from(groupMap.entries()).map(([key, emojis]) => ({
      conditionKey: key,
      conditionLabel: CONDITION_META[key]?.label ?? key,
      emotionEmojis: Array.from(emojis),
      isMet: isConditionMet(key, conditions),
    }));
    const activeGroups = conditionGroups.filter((group) => group.isMet);
    const inactiveGroups = conditionGroups.filter((group) => !group.isMet);
    const alwaysGroup: ConditionGroup | null =
      alwaysEmojis.size > 0
        ? {
            conditionKey: 'always',
            conditionLabel: '항상',
            emotionEmojis: Array.from(alwaysEmojis),
            isMet: true,
          }
        : null;

    const ordered = [...activeGroups, ...inactiveGroups];
    return alwaysGroup ? [alwaysGroup, ...ordered] : ordered;
  }, [emotions, conditions]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      aria-label="condition-hint-overlay"
    >
      <div
        className="relative max-h-[80vh] w-[340px] overflow-y-auto rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="condition-hint-popup"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <InfoIcon className="text-[var(--color-text-muted)]" />
            <span>현재 조건</span>
          </div>

          <button
            onClick={onClose}
            aria-label="condition-hint-close"
            className="cursor-pointer rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-overlay-3)] hover:text-[var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <div
              key={group.conditionKey}
              className={`flex items-center justify-between gap-2.5 rounded-md px-3 py-2 ${
                group.isMet
                  ? 'bg-[var(--color-green-overlay-1)]'
                  : 'bg-[var(--color-overlay-2)] opacity-50'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                {group.isMet ? (
                  <Check size={16} className="shrink-0 text-[var(--color-accent-green)]" />
                ) : (
                  <Lock size={14} className="shrink-0 text-[var(--color-text-faded)]" />
                )}
                <span className="shrink-0 text-sm">{group.conditionLabel}:</span>
              </div>
              <div className="flex flex-wrap justify-end gap-1 text-[var(--color-text-muted)]">
                {group.isMet && group.emotionEmojis.length > 0 ? (
                  group.emotionEmojis.map((emoji, i) => (
                    <span key={i} className="text-base text-[var(--color-text-primary)]">
                      {emoji}
                    </span>
                  ))
                ) : (
                  <span className="text-sm">-</span>
                )}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              조건부 아이템이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConditionHintPopup;
