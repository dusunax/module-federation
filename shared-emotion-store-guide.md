# 공유 감정 스토어 가이드

## 0) 먼저 읽기

- 브릿지는 `window.__sharedEmotionStoreBridge__` 에 노출됩니다.
- 버전은 `1.0.0`이고, 버전 비교는 문자열 비교가 아니라 숫자 분해 비교를 사용합니다.
- `getState()`는 **읽기 전용 스냅샷**입니다. 직접 수정하지 마세요.
- 구독은 상태 참조가 바뀐 시점에 발생합니다(불필요한 렌더 최소화를 위해 `records`의 키만 비교하세요).
- 브릿지가 없거나 버전이 맞지 않으면 fallback UI를 띄워야 합니다.

## 1) 브릿지 기본

### 노출 위치

- 파일: `host/src/bootstrap.tsx`
- 기본 키: `window.__sharedEmotionStoreBridge__`
- 권장 키: `window.__BOOKED_BY_FEELINGS__.sharedEmotionStore`
- 용도: 감정 기록을 앱 간 읽기/구독하는 공유 상태 인터페이스

### 타입(요약)

```ts
type SharedEmotionRecord = {
  id: string;
  emotion: string;
  date: string;          // YYYY-MM-DD (집계 키)
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  source: 'chatbot' | 'manual' | 'imported';
  createdAt: number;     // unix ms
};

type WeeklyEmotionPayload = {
  version: '1.0.0';
  startDate: string; // YYYY-MM-DD (일~토 구간)
  endDate: string;   // YYYY-MM-DD (일~토 구간)
  records: SharedEmotionRecord[];
};

type SharedEmotionStoreSnapshot = {
  records: SharedEmotionRecord[];
};

type SharedEmotionStoreBridge = {
  version: '1.0.0';
  getState: () => SharedEmotionStoreSnapshot;
  subscribe: (
    listener: (state: SharedEmotionStoreSnapshot, prevState: SharedEmotionStoreSnapshot) => void
  ) => () => void;
  getRecentWeekPayload: (baseDate?: string | Date) => WeeklyEmotionPayload;
};
```

## 2) 기본 사용 순서 (권장)

1. 브릿지 조회/대기 (`resolveSharedBridge`, `waitForSharedBridge`)
2. 버전 확인 (`isSupportedVersion`)
3. 데이터 사용 (`getState`, `getRecentWeekPayload`)
4. 변경 반영 (`subscribe`)
5. 컴포넌트 언마운트 시 `unsubscribe`

```ts
const isSupportedBridge = (bridge: unknown): bridge is SharedEmotionStoreBridge => {
  const b = bridge as SharedEmotionStoreBridge | null;
  return !!b && typeof b.version === 'string' && isSupportedVersion(b.version) && typeof b.getState === 'function';
};

(async () => {
  let unsubscribe: (() => void) | null = null;

  try {
    const bridge = await waitForSharedBridge(4000);
    if (!isSupportedBridge(bridge)) return;

    const state = bridge.getState();
    const thisWeek = bridge.getRecentWeekPayload(new Date());
    console.log('current', state.records.length, thisWeek);

    unsubscribe = bridge.subscribe((next, prev) => {
      if (next.records.length === prev.records.length) return;
      console.log('records changed');
    });
  } catch (error) {
    // fallback: 로컬 상태만 표시하거나 안내 UI
    console.warn('shared bridge fallback', error);
  }

  return () => unsubscribe?.();
})();
```

## 3) 각 API 쉽게 쓰기

### `getState()`
- 현재 감정 기록 전체를 가져옵니다.
- **반환값은 변경 금지** (`state.records.push()` 금지).

### `subscribe(listener)`
- 기록이 바뀌었을 때 호출되는 이벤트 구독입니다.
- 반환값은 `unsubscribe` 함수.
- 사용 시 `unmount` 에서 반드시 해제.

### `getRecentWeekPayload(baseDate?)`
- `baseDate`를 기준으로 일요일~토요일 구간을 계산해 반환.
- 기본값은 현재 시각.
- `startDate`, `endDate`: `YYYY-MM-DD`
- `date`: 집계 키, `createdAt`: 정렬용.

## 4) 버전/호환성

```ts
type BridgeVersion = '1.0.0';
type ParsedVersion = { major: number; minor: number; patch: number };
const MIN_SHARED_EMOTION_STORE_VERSION: BridgeVersion = '1.0.0';

const parseVersion = (value: string): ParsedVersion | null => {
  const [major, minor, patch] = value.split('.').map((segment) => Number(segment));
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return null;
  return { major, minor, patch };
};

const isSupportedVersion = (value?: string): boolean => {
  if (!value) return false;
  const target = parseVersion(value);
  const minimum = parseVersion(MIN_SHARED_EMOTION_STORE_VERSION);
  if (!target || !minimum) return false;
  if (target.major !== minimum.major) return target.major > minimum.major;
  if (target.minor !== minimum.minor) return target.minor > minimum.minor;
  return target.patch >= minimum.patch;
};
```

## 5) 브릿지 준비 유틸 (요약)

```ts
type ReadyBridge = SharedEmotionStoreBridge;
type SharedBridge =
  typeof window extends Window & { __sharedEmotionStoreBridge__?: ReadyBridge }
    ? NonNullable<Window['__sharedEmotionStoreBridge__']>
    : never;

const resolveSharedBridge = (): SharedBridge | null => {
  const root = window as Window & {
    __sharedEmotionStoreBridge__?: SharedBridge;
    __BOOKED_BY_FEELINGS__?: { sharedEmotionStore?: SharedBridge };
  };
  return root.__BOOKED_BY_FEELINGS__?.sharedEmotionStore ?? root.__sharedEmotionStoreBridge__ ?? null;
};

const waitForSharedBridge = (timeoutMs = 5000): Promise<SharedBridge> =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const bridge = resolveSharedBridge();
      if (bridge && isSupportedVersion(bridge.version)) {
        resolve(bridge);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('shared emotion bridge timeout'));
        return;
      }
      window.setTimeout(tick, 16);
    };
    tick();
  });
```

## 6) 체크리스트

- 브릿지 존재/버전 확인
- `getState` 수정 금지
- `subscribe` 후 반드시 `unsubscribe`
- `date`는 집계 키, `createdAt`는 최신순 정렬용
- `source` 값은 계약된 값만 처리
- 브릿지 미연결/버전 미지원 시 fallback UI

