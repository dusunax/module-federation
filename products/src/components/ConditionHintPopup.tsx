import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, InfoIcon, Lock, X } from 'lucide-react';
import {
  VisibilityCondition,
  CurrentConditions,
  CONDITION_META,
  EVENT_DATES,
} from '../utils/conditions';

interface EmotionLike {
  emoji: string;
  published: boolean;
  visibility: VisibilityCondition;
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
  isComposite: boolean;
}

interface ConditionCategory {
  keys: string[];
}

type ConditionType = 'time' | 'weather' | 'season' | 'day' | 'event';

type Tab = 'current' | 'all';

const TIME_KEYS = ['day', 'night'];
const WEATHER_KEYS = ['clear', 'cloudy', 'rain', 'snow', 'storm'];
const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'];
const DAY_KEYS = ['weekday', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CONDITION_TYPE_LABEL: Record<ConditionType, string> = {
  time: '시간',
  weather: '날씨',
  season: '계절',
  day: '요일',
  event: '이벤트',
};

function getConditionType(key: string): ConditionType {
  if (TIME_KEYS.includes(key)) return 'time';
  if (WEATHER_KEYS.includes(key)) return 'weather';
  if (SEASON_KEYS.includes(key)) return 'season';
  if (DAY_KEYS.includes(key)) return 'day';
  return 'event';
}

function splitConditionKey(conditionKey: string): string[] {
  return conditionKey.split('&&').map((part) => part.trim()).filter(Boolean);
}

function getConditionLabel(conditionKey: string): string {
  const keys = splitConditionKey(conditionKey);
  const labels = keys.map((key) => CONDITION_META[key]?.label ?? key);
  return labels.join(' · ');
}

function isSingleConditionMet(conditionKey: string, conditions: CurrentConditions): boolean {
  const allDays = [conditions.day, ...conditions.dayExtras];

  if (TIME_KEYS.includes(conditionKey)) return conditions.time === conditionKey;
  if (DAY_KEYS.includes(conditionKey)) {
    return allDays.includes(conditionKey as typeof conditions.day);
  }
  if (WEATHER_KEYS.includes(conditionKey)) return conditions.weather === conditionKey;
  if (SEASON_KEYS.includes(conditionKey)) return conditions.season === conditionKey;
  return conditions.events.includes(conditionKey);
}

function isConditionMet(conditionKey: string, conditions: CurrentConditions): boolean {
  const keys = splitConditionKey(conditionKey);
  return keys.every((key) => isSingleConditionMet(key, conditions));
}

function addGroupEmoji(groupMap: Map<string, Set<string>>, key: string, emoji: string): void {
  if (!groupMap.has(key)) groupMap.set(key, new Set());
  groupMap.get(key)!.add(emoji);
}

function buildConditionCombos(categories: ConditionCategory[]): string[][] {
  if (categories.length === 0) return [];

  return categories.reduce<string[][]>((acc, category) => {
    const next: string[][] = [];
    for (const combo of acc) {
      for (const key of category.keys) {
        next.push([...combo, key]);
      }
    }
    return next;
  }, [[]]);
}

function getEventDateLabel(eventKey: string): string | null {
  const config = EVENT_DATES[eventKey];
  if (!config) return null;

  const year = new Date().getFullYear();

  if (config.yearlyDates?.[year]) {
    const ranges = config.yearlyDates[year];
    return ranges
      .map((r) => `${r.startMonth}/${r.startDay} ~ ${r.endMonth}/${r.endDay}`)
      .join(', ');
  }

  if (config.ranges.length > 0) {
    return config.ranges
      .map((r) => `${r.startMonth}/${r.startDay} ~ ${r.endMonth}/${r.endDay}`)
      .join(', ');
  }

  return null;
}

function groupSinglesByCategory(groups: ConditionGroup[]): Map<ConditionType, ConditionGroup[]> {
  const map = new Map<ConditionType, ConditionGroup[]>();
  for (const group of groups) {
    const type = getConditionType(group.conditionKey);
    if (!map.has(type)) map.set(type, []);
    map.get(type)!.push(group);
  }
  return map;
}

function renderGroupRow(group: ConditionGroup, showEventDate = false) {
  const eventDate = showEventDate ? getEventDateLabel(group.conditionKey) : null;

  return (
    <div
      key={group.conditionKey}
      className={`flex items-center justify-between gap-2.5 rounded-md px-3 py-2 ${
        group.isMet
          ? 'bg-[var(--color-green-overlay-1)]'
          : 'bg-[var(--color-overlay-2)] opacity-60'
      }`}
    >
      <div className="flex shrink-0 items-center gap-2">
        {group.isMet ? (
          <Check size={16} className="shrink-0 text-[var(--color-accent-green)]" />
        ) : (
          <Lock size={14} className="shrink-0 text-[var(--color-text-faded)]" />
        )}
        <span className="shrink-0 text-sm">
          {group.conditionLabel}
          {eventDate && (
            <span className="ml-1 text-xs text-[var(--color-text-muted)]">({eventDate})</span>
          )}
          :
        </span>
      </div>
      <div className="flex flex-1 flex-wrap justify-end gap-1 text-[var(--color-text-muted)]">
        {group.isMet && group.emotionEmojis.length > 0 ? (
          group.emotionEmojis.map((emoji, i) => (
            <span key={i} className="text-base text-[var(--color-text-primary)]">
              {emoji}
            </span>
          ))
        ) : (
          <span className="text-xs">{group.emotionEmojis.length}개</span>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  label,
  count,
  defaultOpen = false,
  children,
}: {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="border mt-1.5 mb-2 border-[var(--color-border-primary)] rounded-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 pl-3 pr-4 py-2.5 text-sm font-medium tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        aria-label={`toggle-${label}`}
      >
        <div className="flex items-center gap-1">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {label}:
        </div>
        <div>
          {count}개
        </div>
      </button>
      {isOpen && <div className="flex flex-col gap-1 px-3 pb-3">{children}</div>}
    </div>
  );
}

function CategorySubHeader({ label }: { label: string }) {
  return (
    <div className="mt-0.5 flex items-center gap-1.5 px-1">
      <div className="h-px flex-1 bg-[var(--color-border-primary)]" />
      <span className="inline-block rounded-sm bg-[var(--color-overlay-3)] px-1.5 py-px text-[10px] text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-primary)]" />
    </div>
  );
}

function renderSinglesWithCategoryHeaders(
  groups: ConditionGroup[],
  showEventDate = false,
) {
  const byCategory = groupSinglesByCategory(groups);
  const categoryOrder: ConditionType[] = ['time', 'weather', 'season', 'day', 'event'];
  const elements: React.ReactNode[] = [];

  for (const type of categoryOrder) {
    const catGroups = byCategory.get(type);
    if (!catGroups || catGroups.length === 0) continue;
    elements.push(
      <CategorySubHeader key={`header-${type}`} label={CONDITION_TYPE_LABEL[type]} />,
    );
    for (const group of catGroups) {
      elements.push(renderGroupRow(group, showEventDate || type === 'event'));
    }
  }

  return elements;
}

function CurrentTab({
  alwaysGroup,
  activeGroups,
}: {
  alwaysGroup: ConditionGroup | null;
  activeGroups: ConditionGroup[];
}) {
  const activeSingles = activeGroups.filter((g) => !g.isComposite);
  const activeComposites = activeGroups.filter((g) => g.isComposite);
  const hasAny = alwaysGroup || activeSingles.length > 0 || activeComposites.length > 0;

  return (
    <div className="flex flex-col gap-1.5" aria-label="current-conditions-tab">
      {alwaysGroup && renderGroupRow(alwaysGroup)}

      {activeSingles.length > 0 && (
        <>
          {renderSinglesWithCategoryHeaders(activeSingles)}
        </>
      )}

      {activeComposites.length > 0 && (
        <>
          <CategorySubHeader label="복합 조건" />
          {activeComposites.map((group) => renderGroupRow(group))}
        </>
      )}

      {!hasAny && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          조건부 아이템이 없습니다.
        </p>
      )}
    </div>
  );
}

function AllTab({
  alwaysGroup,
  allGroups,
}: {
  alwaysGroup: ConditionGroup | null;
  allGroups: ConditionGroup[];
}) {
  const singles = allGroups.filter((g) => !g.isComposite && getConditionType(g.conditionKey) !== 'event');
  const composites = allGroups.filter((g) => g.isComposite);
  const events = allGroups.filter((g) => !g.isComposite && getConditionType(g.conditionKey) === 'event');

  const activeSingles = singles.filter((g) => g.isMet);
  const inactiveSingles = singles.filter((g) => !g.isMet);
  const activeComposites = composites.filter((g) => g.isMet);
  const inactiveComposites = composites.filter((g) => !g.isMet);
  const activeEvents = events.filter((g) => g.isMet);
  const inactiveEvents = events.filter((g) => !g.isMet);

  return (
    <div className="flex flex-col gap-2" aria-label="all-conditions-tab">
      {alwaysGroup && renderGroupRow(alwaysGroup)}

      {singles.length > 0 && (
        <div>
          <div className="px-1 pt-4 mb-1 text-sm font-medium tracking-wider text-[var(--color-text-muted)]">
            단일 조건 ({singles.length}개)
          </div>
          {activeSingles.length > 0 && (
            <div className="mt-1 flex flex-col gap-1">
              {renderSinglesWithCategoryHeaders(activeSingles)}
            </div>
          )}

          <div className='mt-1.5'>
            <CategorySubHeader label="비활성화" />
            {inactiveSingles.length > 0 && (
              <CollapsibleSection label="비활성화" count={inactiveSingles.length}>
                {renderSinglesWithCategoryHeaders(inactiveSingles)}
              </CollapsibleSection>
            )}
          </div>
        </div>
      )}

      {composites.length > 0 && (
        <div>
          <div className="px-1 pt-4 mb-1 text-sm font-medium tracking-wider text-[var(--color-text-muted)]">
            복합 조건 ({composites.length}개)
          </div>
          {activeComposites.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {activeComposites.map((group) => renderGroupRow(group))}
            </div>
          )}
          {inactiveComposites.length > 0 && (
            <CollapsibleSection label="비활성화" count={inactiveComposites.length}>
              {inactiveComposites.map((group) => renderGroupRow(group))}
            </CollapsibleSection>
          )}
        </div>
      )}

      {events.length > 0 && (
        <div>
          <div className="px-1 pt-2 mb-1 text-sm font-medium tracking-wider text-[var(--color-text-muted)]">
            시즌 이벤트 ({events.length}개)
          </div>
          {activeEvents.length > 0 && (
            <div className="mt-1 flex flex-col gap-1">
              {activeEvents.map((group) => renderGroupRow(group, true))}
            </div>
          )}
          {inactiveEvents.length > 0 && (
            <CollapsibleSection label="비활성화" count={inactiveEvents.length}>
              {inactiveEvents.map((group) => renderGroupRow(group, true))}
            </CollapsibleSection>
          )}
        </div>
      )}

      {allGroups.length === 0 && !alwaysGroup && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          조건부 아이템이 없습니다.
        </p>
      )}
    </div>
  );
}

function ConditionHintPopup({ emotions, conditions, isOpen, onClose }: Props): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<Tab>('current');

  const { alwaysGroup, allGroups } = useMemo(() => {
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

      const categories: ConditionCategory[] = [
        { keys: v.time },
        { keys: v.day },
        { keys: v.weather },
        { keys: v.season },
        { keys: v.event },
      ].filter((category) => category.keys.length > 0);

      const emoji = emotion.emoji ?? '?';
      if (categories.length <= 1) {
        const singleKeys = categories.length === 0 ? [] : categories[0].keys;
        for (const key of singleKeys) addGroupEmoji(groupMap, key, emoji);
        continue;
      }

      const combos = buildConditionCombos(categories);
      for (const combo of combos) {
        const comboKey = combo.join(' && ');
        addGroupEmoji(groupMap, comboKey, emoji);
      }
    }

    const conditionGroups = Array.from(groupMap.entries()).map(([key, emojis]) => ({
      conditionKey: key,
      conditionLabel: getConditionLabel(key),
      emotionEmojis: Array.from(emojis),
      isMet: isConditionMet(key, conditions),
      isComposite: key.includes('&&'),
    }));

    const always: ConditionGroup | null =
      alwaysEmojis.size > 0
        ? {
            conditionKey: 'always',
            conditionLabel: '항상',
            emotionEmojis: Array.from(alwaysEmojis),
            isMet: true,
            isComposite: false,
          }
        : null;

    return { alwaysGroup: always, allGroups: conditionGroups };
  }, [emotions, conditions]);

  const activeGroups = useMemo(
    () => allGroups.filter((g) => g.isMet),
    [allGroups],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50"
      onClick={onClose}
      aria-label="condition-hint-overlay"
    >
      <div
        className="relative max-h-[80vh] w-[calc(100vw-32px)] max-w-[360px] overflow-y-auto rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-5 shadow-xl scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        aria-label="condition-hint-popup"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <InfoIcon className="text-[var(--color-text-muted)]" />
            <span>조건 안내</span>
          </div>

          <button
            onClick={onClose}
            aria-label="condition-hint-close"
            className="cursor-pointer rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-overlay-3)] hover:text-[var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-md bg-[var(--color-overlay-2)] p-1">
          <button
            onClick={() => setActiveTab('current')}
            aria-label="tab-current"
            className={`flex-1 cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'current'
                ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            현재 조건
          </button>
          <button
            onClick={() => setActiveTab('all')}
            aria-label="tab-all"
            className={`flex-1 cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            전체 조건
          </button>
        </div>

        {activeTab === 'current' ? (
          <CurrentTab alwaysGroup={alwaysGroup} activeGroups={activeGroups} />
        ) : (
          <AllTab alwaysGroup={alwaysGroup} allGroups={allGroups} />
        )}
      </div>
    </div>
  );
}

export default ConditionHintPopup;
