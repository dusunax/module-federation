import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from 'auth/authStore';

type EmotionIntensity = 1 | 2 | 3 | 4 | 5;
type SharedEmotionSource = 'chatbot' | 'manual' | 'imported';

const RECENT_PAGE_SIZE = 5;

type SharedEmotionRecord = {
  id: string;
  emotion: string;
  date: string;
  intensity: EmotionIntensity;
  note?: string;
  source: SharedEmotionSource;
  createdAt: number;
};

type WeeklyEmotionPayload = {
  startDate: string;
  endDate: string;
  records: SharedEmotionRecord[];
};

type WeeklyEmotionBatch = {
  startDate: string;
  endDate: string;
  records: SharedEmotionRecord[];
};

type ViewMode = 'thisWeek' | 'weeklyBatches';

type SharedEmotionStoreSnapshot = {
  records: SharedEmotionRecord[];
};

type SharedEmotionStoreBridge = {
  getRecentWeekPayload?: (baseDate?: string | Date) => WeeklyEmotionPayload;
  getState?: () => SharedEmotionStoreSnapshot;
  subscribe?: (
    listener: (
      state: Partial<SharedEmotionStoreSnapshot>,
      prevState: Partial<SharedEmotionStoreSnapshot>
    ) => void
  ) => () => void;
};

const getBridge = (): SharedEmotionStoreBridge | null => {
  const root = globalThis as {
    __sharedEmotionStoreBridge__?: SharedEmotionStoreBridge;
    __BOOKED_BY_FEELINGS__?: {
      sharedEmotionStore?: SharedEmotionStoreBridge;
    };
  };
  return root.__BOOKED_BY_FEELINGS__?.sharedEmotionStore ?? root.__sharedEmotionStoreBridge__ ?? null;
};

const normalizeEmotionText = (value: string) => value.trim().toLowerCase();

const isRecord = (value: unknown): value is SharedEmotionRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    emotion?: unknown;
    date?: unknown;
    intensity?: unknown;
    note?: unknown;
    source?: unknown;
    createdAt?: unknown;
  };

  return (
    (candidate.id === undefined || typeof candidate.id === 'string') &&
    typeof candidate.emotion === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.intensity === 'number' &&
    [1, 2, 3, 4, 5].includes(candidate.intensity) &&
    (candidate.source === undefined ||
      candidate.source === 'chatbot' ||
      candidate.source === 'manual' ||
      candidate.source === 'imported')
  );
};

const resolveRecordCreatedAt = (record: SharedEmotionRecord): number => {
  const createdAt = typeof record.createdAt === 'number' ? record.createdAt : Number(record.createdAt);
  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  const dateMs = Date.parse(record.date);
  if (Number.isFinite(dateMs)) {
    return dateMs;
  }

  return 0;
};

const normalizeRecord = (record: SharedEmotionRecord, fallbackSource: SharedEmotionSource = 'imported'): SharedEmotionRecord => ({
  ...record,
  id: record.id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  emotion: normalizeEmotionText(record.emotion),
  source: record.source || fallbackSource,
  createdAt: resolveRecordCreatedAt(record),
  date: record.date,
});

const buildPayloadFromRecords = (records: SharedEmotionRecord[]): WeeklyEmotionPayload => {
  const now = new Date().toISOString().slice(0, 10);
  const safeRecords = records
    .filter(isRecord)
    .map((record) => normalizeRecord(record));
  const orderedRecords = [...safeRecords].sort((a, b) => b.createdAt - a.createdAt);
  const sortedDates = orderedRecords.map((record) => record.date).filter(Boolean);

  return {
    startDate: sortedDates[sortedDates.length - 1] ?? now,
    endDate: sortedDates[0] ?? now,
    records: orderedRecords,
  };
};

const getSundayStart = (value: string | Date): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0: Sunday
  date.setDate(date.getDate() - day);
  return date;
};

const getSaturdayEndFromSundayStart = (sundayStart: Date): Date => {
  const saturday = new Date(sundayStart);
  saturday.setDate(saturday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);
  return saturday;
};

const toISODate = (value: Date): string => value.toISOString().slice(0, 10);

const buildWeeklyBatches = (
  records: SharedEmotionRecord[],
  anchor: string | Date = new Date()
): WeeklyEmotionBatch[] => {
  const safeRecords = records
    .filter(isRecord)
    .map((record) => normalizeRecord(record))
    .filter((record) => Number.isFinite(record.createdAt))
    .sort((a, b) => b.createdAt - a.createdAt);

  if (safeRecords.length === 0) {
    return [];
  }

  const startSunday = getSundayStart(anchor);
  const oldestSunday = getSundayStart(new Date(Math.min(...safeRecords.map((record) => record.createdAt))));
  const batches: WeeklyEmotionBatch[] = [];

  for (let cursor = new Date(startSunday); cursor >= oldestSunday; cursor.setDate(cursor.getDate() - 7)) {
    const weekStart = toISODate(cursor);
    const weekEndDate = getSaturdayEndFromSundayStart(cursor);
    const weekEnd = toISODate(weekEndDate);
    const weeklyRecords = safeRecords.filter(
      (record) => record.createdAt >= cursor.getTime() && record.createdAt <= weekEndDate.getTime()
    );

    if (weeklyRecords.length > 0) {
      batches.push({
        startDate: weekStart,
        endDate: weekEnd,
        records: weeklyRecords.map((record) => ({ ...record })),
      });
    }
  }

  return batches;
};

const getPayloadFromSnapshot = (snapshot: SharedEmotionStoreSnapshot): WeeklyEmotionPayload | null => {
  if (!Array.isArray(snapshot.records)) {
    return null;
  }
  return buildPayloadFromRecords(snapshot.records);
};

const getPayloadFromBridge = (bridge: SharedEmotionStoreBridge): WeeklyEmotionPayload | null => {
  if (typeof bridge.getRecentWeekPayload === 'function') {
    const payload = bridge.getRecentWeekPayload();
    if (payload) {
      return payload;
    }
  }

  if (typeof bridge.getState === 'function') {
    const snapshot = bridge.getState();
    if (snapshot) {
      return getPayloadFromSnapshot(snapshot);
    }
  }

  return null;
};

const getRecordsFromBridge = (bridge: SharedEmotionStoreBridge): SharedEmotionRecord[] | null => {
  if (typeof bridge.getState === 'function') {
    const snapshot = bridge.getState();
    if (snapshot && Array.isArray(snapshot.records)) {
      return snapshot.records.filter(isRecord);
    }
  }

  return null;
};

const emptyPayload = (today: string): WeeklyEmotionPayload => ({
  startDate: today,
  endDate: today,
  records: [],
});

function SharedEmotionStoreExample() {
  const today = new Date().toISOString().slice(0, 10);
  const { user, signInWithGoogle } = useAuthStore();
  const [payload, setPayload] = useState<WeeklyEmotionPayload>(emptyPayload(today));
  const [allRecords, setAllRecords] = useState<SharedEmotionRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [readyBridge, setReadyBridge] = useState(false);
  const [recentPage, setRecentPage] = useState(1);
  const [isThisWeekOpen, setIsThisWeekOpen] = useState(false);
  const [openWeeklyBatchKeys, setOpenWeeklyBatchKeys] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<ViewMode>('thisWeek');
  const [loginError, setLoginError] = useState('');

  const refresh = useCallback(() => {
    const nextDate = new Date().toISOString().slice(0, 10);
    const bridge = getBridge();

    if (!bridge) {
      setReadyBridge(false);
      setPayload(emptyPayload(nextDate));
      setAllRecords([]);
      setIsLoaded(true);
      return;
    }

    const nextPayload = getPayloadFromBridge(bridge);
    const nextAllRecords =
      getRecordsFromBridge(bridge) ??
      nextPayload?.records ??
      emptyPayload(nextDate).records;

    setPayload(nextPayload ?? emptyPayload(nextDate));
    setAllRecords(nextAllRecords);
    setReadyBridge(true);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const bridge = getBridge();
    if (!bridge?.subscribe) {
      const timer = window.setInterval(() => {
        refresh();
      }, 1000);
      return () => window.clearInterval(timer);
    }

    const unsubscribe = bridge.subscribe(() => {
      refresh();
    });

    return () => unsubscribe();
  }, [refresh]);

  const averageIntensity = useMemo(() => {
    if (payload.records.length === 0) {
      return 0;
    }
    return (
      Math.round(
        (payload.records.reduce((acc, record) => acc + record.intensity, 0) / payload.records.length) * 10
      ) / 10
    );
  }, [payload.records]);

  const allRecordsAverageIntensity = useMemo(() => {
    if (allRecords.length === 0) {
      return 0;
    }
    return (
      Math.round((allRecords.reduce((acc, record) => acc + record.intensity, 0) / allRecords.length) * 10) / 10
    );
  }, [allRecords]);

  const weeklyBatches = useMemo(
    () => buildWeeklyBatches(allRecords.length > 0 ? allRecords : payload.records, new Date()),
    [allRecords, payload.records]
  );

  const weeklySummaryPeriod = useMemo(() => {
    if (weeklyBatches.length === 0) {
      return {
        startDate: payload.startDate,
        endDate: payload.endDate,
      };
    }

    return {
      startDate: weeklyBatches[weeklyBatches.length - 1].startDate,
      endDate: weeklyBatches[0].endDate,
    };
  }, [payload.startDate, payload.endDate, weeklyBatches]);

  const summaryPeriod = mode === 'weeklyBatches' ? weeklySummaryPeriod : { startDate: payload.startDate, endDate: payload.endDate };

  const totalRecords = payload.records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / RECENT_PAGE_SIZE));
  const safePage = Math.min(Math.max(recentPage, 1), totalPages);

  useEffect(() => {
    if (recentPage !== safePage) {
      setRecentPage(safePage);
    }
  }, [recentPage, safePage]);

  useEffect(() => {
    if (mode !== 'weeklyBatches' || weeklyBatches.length === 0) {
      return;
    }

    if (openWeeklyBatchKeys.size === 0) {
      const latestBatch = `${weeklyBatches[0].startDate}_${weeklyBatches[0].endDate}`;
      setOpenWeeklyBatchKeys(new Set([latestBatch]));
    }
  }, [mode, weeklyBatches, openWeeklyBatchKeys.size]);

  const recentSlice = payload.records.slice((safePage - 1) * RECENT_PAGE_SIZE, safePage * RECENT_PAGE_SIZE);
  const getBatchKey = (batch: WeeklyEmotionBatch) => `${batch.startDate}_${batch.endDate}`;

  const toggleThisWeek = () => {
    setIsThisWeekOpen((prev) => !prev);
  };

  const toggleBatch = (batch: WeeklyEmotionBatch) => {
    const key = getBatchKey(batch);
    setOpenWeeklyBatchKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const debugPayload = useMemo(
    () =>
      mode === 'thisWeek'
        ? {
            period: {
              startDate: summaryPeriod.startDate,
              endDate: summaryPeriod.endDate,
            },
            summary: {
              total: payload.records.length,
              averageIntensity,
            },
            records: payload.records.map((item) => ({
              id: item.id,
              emotion: item.emotion,
              intensity: item.intensity,
              date: item.date,
            })),
          }
        : {
            period: {
              startDate: summaryPeriod.startDate,
              endDate: summaryPeriod.endDate,
            },
            summary: {
              total: allRecords.length,
              averageIntensity: allRecordsAverageIntensity,
              batchCount: weeklyBatches.length,
            },
            weeklyBatches,
          },
    [allRecords, allRecordsAverageIntensity, averageIntensity, mode, payload.endDate, payload.records, payload.startDate, summaryPeriod, weeklyBatches]
  );

  const handleLogin = useCallback(async () => {
    setLoginError('');
    try {
      await signInWithGoogle();
      refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  }, [refresh, signInWithGoogle]);

  if (!isLoaded) {
    return (
      <section className="mx-3 mb-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
        공유 감정 스토어 브릿지가 아직 준비되지 않았습니다.
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-3 mb-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-3 py-3 text-xs text-[var(--color-text-secondary)]">
        <p className="m-0 mb-2 font-semibold text-[var(--color-text-primary)]">공유 감정 스토어</p>
        <p className="m-0 mb-3">
          감정 데이터를 보려면 먼저 로그인해야 합니다.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          className="cursor-pointer rounded border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
        >
          Google 로그인
        </button>
        {loginError ? <p className="m-0 mt-2 text-red-400">{loginError}</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-3 mb-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold text-[var(--color-text-primary)]">공유 감정 스토어</span>
      </div>
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--color-border-secondary)] pb-2">
        <button
          type="button"
          onClick={() => setMode('thisWeek')}
          className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-bg-tertiary)] ${
            mode === 'thisWeek'
              ? 'border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
              : 'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
          }`}
        >
          최근 1주
        </button>
        <button
          type="button"
          onClick={() => setMode('weeklyBatches')}
          className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-bg-tertiary)] ${
            mode === 'weeklyBatches'
              ? 'border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
              : 'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
          }`}
        >
          위클리 배치
        </button>
      </div>
      <div className="grid gap-2 xl:grid-cols-2">
        <div className="space-y-2">
          <div className="rounded border border-[var(--color-border-secondary)] p-2">
            <p className="m-0 mb-2 font-semibold text-[var(--color-text-primary)]">요약</p>
            <p className="m-0 text-xs text-[var(--color-text-secondary)]">
              브릿지: <span className="text-[var(--color-text-primary)]">{readyBridge ? '연결됨' : '미연결'}</span>
            </p>
            <p className="m-0 text-xs text-[var(--color-text-secondary)]">
              기간: <span className="text-[var(--color-text-primary)]">{summaryPeriod.startDate}</span> ~{' '}
              <span className="text-[var(--color-text-primary)]">{summaryPeriod.endDate}</span>
            </p>
            <p className="m-0 text-xs text-[var(--color-text-secondary)]">
              총 건수:{' '}
              <span className="text-[var(--color-text-primary)]">
                {mode === 'thisWeek' ? payload.records.length : allRecords.length}
              </span>{' '}
              / 평균 강도:{' '}
              <span className="text-[var(--color-text-primary)]">
                {mode === 'thisWeek' ? averageIntensity : allRecordsAverageIntensity}
              </span>
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-secondary)] p-2">
            <button
              type="button"
              onClick={toggleThisWeek}
              className="mb-1 flex w-full cursor-pointer items-center justify-between rounded border border-[var(--color-border-primary)]/60 bg-[var(--color-bg-primary)] px-2 py-2 text-left font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <span>{mode === 'thisWeek' ? '이번 주 기록' : '주차별 배치'}</span>
              <span className="text-sm leading-none">{isThisWeekOpen ? '▾' : '▸'}</span>
            </button>
            <div className={isThisWeekOpen ? 'block' : 'hidden'}>
              {mode === 'thisWeek' ? (
                payload.records.length === 0 ? (
                  <p className="m-0 text-[var(--color-text-faded)]">최근 기록 없음</p>
                ) : (
                  <div>
                    <ul className="m-0 list-none space-y-1 p-0">
                      {recentSlice.map((item) => (
                        <li
                          key={item.id}
                          className="rounded border border-[var(--color-border-primary)] p-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                        >
                          <span
                            className="font-semibold text-[var(--color-text-primary)]"
                            title={item.emotion}
                          >
                            {item.emotion}
                          </span>
                          {` / 강도 ${item.intensity} / ${item.date}`}
                          {item.note ? ` / ${item.note}` : ''}
                        </li>
                      ))}
                    </ul>
                    {totalPages > 1 ? (
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setRecentPage((current) => Math.max(current - 1, 1))}
                          disabled={safePage <= 1}
                          className="rounded border border-[var(--color-border-secondary)] px-2 py-1 transition-colors cursor-pointer hover:bg-[var(--color-bg-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          이전
                        </button>
                        <span className="text-[var(--color-text-secondary)]">
                          {safePage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecentPage((current) => Math.min(current + 1, totalPages))}
                          disabled={safePage >= totalPages}
                          className="rounded border border-[var(--color-border-secondary)] px-2 py-1 transition-colors cursor-pointer hover:bg-[var(--color-bg-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          다음
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              ) : weeklyBatches.length === 0 ? (
                <p className="m-0 text-[var(--color-text-faded)]">주차 배치 없음</p>
              ) : (
                <ul className="m-0 list-none space-y-2 p-0">
                  {weeklyBatches.map((batch) => {
                    const key = `${batch.startDate}_${batch.endDate}`;
                    const isOpen = openWeeklyBatchKeys.has(key);

                    return (
                      <li
                        key={key}
                        className="rounded border border-[var(--color-border-primary)] p-2"
                      >
                        <button
                          type="button"
                          onClick={() => toggleBatch(batch)}
                          className="mb-1 flex w-full cursor-pointer items-center justify-between rounded border border-[var(--color-border-secondary)] bg-[var(--color-bg-tertiary)] px-2 py-1.5 text-left font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                        >
                          <span>
                            {batch.startDate} ~ {batch.endDate}
                          </span>
                          <span className="text-sm leading-none">{isOpen ? '▾' : '▸'}</span>
                        </button>
                        <div className={isOpen ? 'block' : 'hidden'}>
                          <p className="m-0 mb-1 text-xs text-[var(--color-text-secondary)]">건수: {batch.records.length}</p>
                          <ul className="m-0 list-none space-y-1 p-0">
                            {batch.records.map((item) => (
                              <li
                                key={item.id}
                                className="rounded border border-[var(--color-border-secondary)] p-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                              >
                                <span
                                  className="font-semibold text-[var(--color-text-primary)]"
                                  title={item.emotion}
                                >
                                  {item.emotion}
                                </span>
                                {` / 강도 ${item.intensity} / ${item.date}`}
                                {item.note ? ` / ${item.note}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <pre className="m-0 max-h-80 overflow-auto rounded border border-[var(--color-border-secondary)] bg-black/20 p-2 text-[11px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-all">
          {JSON.stringify(debugPayload, null, 2)}
        </pre>
      </div>
    </section>
  );
}

export default SharedEmotionStoreExample;
