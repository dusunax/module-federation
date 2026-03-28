# 공유 감정 스토어 가이드

## 1) 현재 구조 요약

- `sharedEmotionStore`는 **호스트가 소유**하는 상태입니다.
- 호스트는 Module Federation으로 다음을 노출합니다.
  - `host/sharedEmotionStore`
  - `host/EmotionStoreInitializer`
- 호스트 노출 모듈을 가져온 원격 앱에서 상태를 구독해 UI를 구성합니다.
- 인증 객체는 공유하지 않고, `userId`를 기준으로 주문 데이터를 다시 조회해 스토어를 갱신합니다.

## 2) 주 의존 파일

- [host/src/vite.config.ts](/Users/du/repository/test-claude-code/host/src/vite.config.ts): MF expose 설정
- [host/src/bootstrap.tsx](/Users/du/repository/test-claude-code/host/src/bootstrap.tsx): 브릿지 등록과 동기화 스케줄러 시작
- [host/src/stores/sharedEmotionStore.ts](/Users/du/repository/test-claude-code/host/src/stores/sharedEmotionStore.ts): Zustand 스토어, 주간 payload 계산
- [host/src/stores/EmotionStoreInitializer.tsx](/Users/du/repository/test-claude-code/host/src/stores/EmotionStoreInitializer.tsx): 사용자 식별 기반 주문 동기화

## 3) 상태 계약(Bridge 타입)

```ts
export type SharedEmotionRecord = {
  id: string;
  emotion: string;
  date: string; // YYYY-MM-DD
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: number; // unix ms
};

type WeeklyEmotionPayload = {
  version: '1.0.0';
  startDate: string; // Sunday
  endDate: string; // Saturday
  records: SharedEmotionRecord[];
};

export type SharedEmotionStoreSnapshot = {
  records: SharedEmotionRecord[];
};

export type SharedEmotionStoreBridge = {
  version: '1.0.0';
  getState: () => SharedEmotionStoreSnapshot;
  subscribe: (
    listener: (
      state: SharedEmotionStoreSnapshot,
      prevState: SharedEmotionStoreSnapshot
    ) => void
  ) => () => void;
  getRecentWeekPayload: (baseDate?: string | Date) => WeeklyEmotionPayload;
};
```

- `version`은 현재 `1.0.0` 입니다.
- `getRecentWeekPayload`는 일요일~토요일 구간의 주간 레코드를 반환합니다.
- 주간 계산/정렬의 기본 키는 각 레코드의 `createdAt`입니다.

## 4) 호스트 동기화 파이프라인

1. `bootstrap`에서 인증 리스너와 동기화 초기화 실행
2. `resolveEmotionUserId()`에서 사용자 식별을 결정
   - `auth` 상태의 `user.uid` 우선 (동일 오리진 모듈에서 사용)
   - 없으면 `window.location.search`의 `userId` (오리진이 다른 모듈에서 사용)
3. `userId` 존재 시 `getRecentOrders(userId, limit)` 조회
4. 주문을 `setEmotionRecordsFromOrders`로 변환해 `records` 갱신
5. 사용자 변경 시 동기화를 다시 수행, 없으면 `clearEmotionRecords()`

`host/src/bootstrap.tsx`와 `host/src/stores/EmotionStoreInitializer.tsx`가 이 경로를 공유합니다.

## 5) 원격 앱 소비 패턴

```ts
const module = await import('host/sharedEmotionStore');
const store = module.useSharedEmotionStore;

const applyState = () => {
  const nextState = store.getState();
  const payload = nextState.getRecentWeekPayload?.(new Date());
  const nextRecords = payload?.records ?? nextState.records ?? [];
  // 렌더 상태 업데이트
};

applyState();
const unsubscribe = store.subscribe(() => applyState());
```

- `Initializer`는 `host/EmotionStoreInitializer`를 동적으로 받아 렌더링하고,
  host 쪽 동기화 훅을 트리거합니다.

## 6) 글로벌 브릿지(호환 경로)

- `window.__sharedEmotionStoreBridge__`
- `window.__BOOKED_BY_FEELINGS__?.sharedEmotionStore`

현재 원격 앱은 기본적으로 MF 모듈 import 방식을 사용하며, 글로벌 브릿지는 예비/호환 경로입니다.

## 7) 사용 시 주의점(특히 오리진 혼용)

- `getState` 결과는 읽기 전용으로 취급합니다.
- `subscribe` 해제 누락 시 메모리 누수/중복 이벤트가 발생합니다.
- `useEffect` 재실행으로 구독 중복이 생기지 않도록 의존성 관리를 최소화합니다.
- 인증 라우팅(ProtectedRoute)과는 분리되어야 하며, 조회 실패 시 사용자 메시지/폴백 UI를 분리합니다.
- remoteEntry URL이 바뀌면 스키마 불일치가 발생할 수 있으므로 배포/캐시 관리를 명확히 합니다.

## 8) 권장 디버그 체크리스트

- 임포트 상태
  - `host.sharedEmotionStore.import.success`
  - `host.emotionStoreInitializer.import.success`
- 동기화 상태
  - `EmotionStoreInitializer.hydrate.start`
  - `EmotionStoreInitializer.hydrate.success`(`ordersCount`)
  - `EmotionStoreInitializer.auth.changed`
- 표시 상태
  - `host.store.updated`(`count`)
  - `fullState.json`, `weeklyPayload.json`
- 빈 데이터 판별
  - `ordersCount === 0`인지
  - `userId`가 실제 주문 조회 대상으로 맞는지
  - `createdAt/date`가 주간 범위 밖인지
