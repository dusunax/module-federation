# Auth App Feature Specification

## Overview

**역할**: Firebase 인증, 에너지 시스템, 기억하기 상태 추적, 감정/주문 서비스 제공. UI 없이 store/service만 expose.
**포트**: `http://localhost:3005`

## Module Federation

### Exposes

| 모듈 | 파일 |
|------|------|
| `./authStore` | `src/store/authStore.ts` |
| `./energyStore` | `src/store/energyStore.ts` |
| `./rememberingStore` | `src/store/rememberingStore.ts` |
| `./firebase` | `src/firebase/index.ts` |
| `./services/orderService` | `src/services/orderService.ts` |
| `./services/emotionService` | `src/services/emotionService.ts` |

### Remotes

없음 (다른 앱의 의존성 제공자)

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, zustand

## Firebase 설정

- **인증**: Google OAuth (`signInWithPopup`)
- **DB**: Firestore
- **환경변수**: `auth/.env` (REACT_APP_FIREBASE_*)

## Stores

### authStore (`src/store/authStore.ts`)

```typescript
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: string;           // 'none' | 'premium'
  role?: string;          // 'admin' 등
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}
```

- `signInWithGoogle`: Google 팝업 → Firestore `users/{uid}` 생성/업데이트 (plan, lastLoginAt)
- `initAuthListener`: `onAuthStateChanged` → Firestore에서 plan/role 조회 → energyStore 초기화
- `signOut`: 로그아웃 + energyStore 클리어

### energyStore (`src/store/energyStore.ts`)

```typescript
// MAX_ENERGY_FREE = 5, MAX_ENERGY_PREMIUM = 10

interface EnergyState {
  current: number;
  maxEnergy: number;
  lastResetDate: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  initializeEnergy: (userId: string, plan?: string) => Promise<void>;
  hasEnoughEnergy: (cost: number) => boolean;
  deductEnergy: (cost: number, count?: number) => Promise<number>;
  restoreEnergy: (amount: number, count?: number) => Promise<number>;
  clearEnergy: () => void;
  resetEnergy: () => Promise<void>;
  fetchDailyUsage: (days?: number) => Promise<DailyUsage[]>;
  fetchRecentOrders: (count?: number) => Promise<Order[]>;
}
```

- `initializeEnergy`: plan에 따라 maxEnergy 결정, 날짜 변경 시 자동 리셋
- `deductEnergy`: 에너지 차감 + `users/{uid}/usage/{date}` 기록
- `restoreEnergy`: 에너지 복구 (취소 시), maxEnergy 초과 방지
- `fetchDailyUsage`: N일간 사용량 조회, UTC→KST 변환

### rememberingStore (`src/store/rememberingStore.ts`)

```typescript
// REMEMBERING_DURATION = 60000 (1분)

interface RememberingItem {
  visibleItemId: string;
  cartItemId: number;
  productInfo: ProductInfo;
  startTime: number;
  duration: number;
  energyCost: number;
  status: string;           // 'in_progress'
}

interface RememberingState {
  rememberingItems: Record<string, RememberingItem>;
  loading: boolean;
  userId: string | null;
  initializeListener: (userId: string) => void;
  cleanup: () => void;
  startRemembering: (cartItemId: number, productInfo: ProductInfo, energyCost: number) => Promise<string>;
  startRememberingBatch: (items: Array<{...}>) => Promise<void>;
  cancelItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
  cancelAllRemembering: () => Promise<number>;
  completeItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
  getProgress: (visibleItemId: string) => number;
  getAllProgress: () => Record<string, {...}>;
}
```

- `initializeListener`: Firestore `users/{uid}/processing` 실시간 구독
- `startRemembering/Batch`: Firestore 문서 생성으로 기억하기 시작
- `getProgress`: `(elapsed / duration) * 100` (0~100%)

## Services

### emotionService (`src/services/emotionService.ts`)

```typescript
getAllEmotions(searchTerm?: string, options?: { includeAll?: boolean }): Promise<Emotion[]>
getEmotionById(id: number): Promise<Emotion | null>
createEmotion(data: Omit<Emotion, 'energyCost'>): Promise<void>
updateEmotion(id: number, data: Partial<Omit<Emotion, 'energyCost'>>): Promise<void>
```

- `config/rarity` 문서에서 희귀도별 energyCost/order 조회 (인메모리 캐시)
- published 필터링 (includeAll=true 시 전체)

### orderService (`src/services/orderService.ts`)

```typescript
saveUserOrder(userId: string, order: Order): Promise<void>
subscribeToUserOrders(userId: string, onUpdate: (orders: Order[]) => void): Unsubscribe
deleteUserOrder(userId: string, orderId: string | number): Promise<void>
getRecentOrders(userId: string, count?: number): Promise<Order[]>
```

### energyService (`src/services/energyService.ts`)

```typescript
getDailyUsage(userId: string, days?: number): Promise<DailyUsage[]>
```

## Firestore 컬렉션 구조

```
users/{uid}/
  ├── [email, displayName, photoURL, plan, role, lastLoginAt, createdAt]
  ├── energy/status      [current, maxEnergy, lastResetDate]
  ├── usage/{YYYY-MM-DD} [used, count, date]
  ├── processing/{id}    [cartItemId, productInfo, startTime, duration, energyCost, status]
  └── orders/{orderId}   [id, orderDate, items[], totalEnergy, totalItems, status]

emotions/{id}            [id, name, emoji, rarity, category, description, story, effects, published, image]
config/rarity            [key: { energyCost, order }]
```
