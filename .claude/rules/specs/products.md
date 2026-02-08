# Products App Feature Specification

## Overview

**역할**: 감정(상품) 카탈로그. 상품 목록/상세, 장바구니 store, 주문 store, 상태 상수/유틸 제공.
**포트**: `http://localhost:3002`

## Module Federation

### Exposes

| 모듈 | 파일 |
|------|------|
| `./ProductList` | `src/ProductList.tsx` |
| `./ProductDetail` | `src/ProductDetail.tsx` |
| `./cartStore` | `src/store/cartStore.ts` |
| `./orderStore` | `src/store/orderStore.ts` |
| `./utils/statusStyle` | `src/utils/statusStyle.ts` |
| `./constants` | `src/constants/index.ts` |

### Remotes

| Remote | 사용 모듈 |
|--------|----------|
| auth | `authStore`, `rememberingStore`, `emotionService`, `orderService` |

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, @tanstack/react-query, zustand, sonner

## Pages

### ProductList (`src/ProductList.tsx`)

- 검색: 이름, 카테고리, 스토리 실시간 검색
- 정렬: 날짜(최신/오래된), 에너지(낮은/높은) — localStorage(`emotion-sort-prefs`) 저장
- 상품 카드: 이모지, 이름, 설명(5줄), 카테고리(한글 라벨), 에너지(⚡), 상태 뱃지
- 상태 우선순위: DB(orderStatuses) > 장바구니(HELD) > emotion.status
- React Query: `['emotions', searchTerm]`

### ProductDetail (`src/ProductDetail.tsx`)

- URL 파라미터: `id`
- 표시: 이모지(100px), 이름, 에너지, 카테고리(한글 라벨), 설명, 스토리
- 장바구니 담기: `addToCart(emotion)` → 토스트 ("이 순간이 N만큼 담겨있어요")
- remembering 아이템 제외하여 수량 계산
- React Query: `['emotion', id]`

## Stores

### cartStore (`src/store/cartStore.ts`)

```typescript
interface CartItem {
  id: number;
  product: Emotion;
  productId?: number;
  quantity: number;
  addedAt: number;
}

interface CartState {
  items: Record<number, CartItem>;
  nextItemId: number;
  __rehydrate(): Promise<void>;
  addToCart(product: Emotion): void;
  updateQuantity(itemId: number, quantity: number): void;
  removeFromCart(itemId: number): void;
  clearCart(): void;
  getTotalItems(): number;
}
```

- **쿠키 저장**: `sentimo_cart_v1` (최소 데이터, 30일 만료)
- **Rehydrate**: 쿠키 → `getAllEmotions()` 조회 → 병합
- **addToCart**: 동일 상품이면 수량 증가 (remembering 제외), 신규면 새 아이템

### orderStore (`src/store/orderStore.ts`)

```typescript
interface Order {
  id: number;
  items: CartItem[];
  totalEnergy: number;
  totalItems: number;
  orderDate: string;
  status: string;
}

interface OrderState {
  orders: Order[];
  itemProgress: Record<number, ItemProgress>;
  orderStatuses: Record<number, string>;
  completeOrder(): Order | null;
  completeRememberingItems(): Order | null;
  getOrder(orderId: number): Order | undefined;
  removeOrder(orderId: number): void;
  startRemembering(itemIds?: number[]): void;
  updateItemProgress(itemId: number, progress: number): void;
  cancelItemRemembering(itemId: number): ItemProgress | null;
  completeItemRemembering(itemId: number): Order | null;
  updateProgress(newProgress: number): void;
  updateOrderStatus(productId: number, status: string): void;
  updateAllOrderStatuses(statuses: Record<number, string>): void;
  // ... 개별 아이템 remembering 관리 메서드들
}
```

## Constants

### EMOTION_STATUS (`src/constants/emotionStatus.ts`)

```typescript
const EMOTION_STATUS = {
  NOTICING: 'noticing',
  HELD: 'held',
  BEING_UNDERSTOOD: 'being_understood',
  REMEMBERED: 'remembered',
} as const;
```

- `EMOTION_STATUS_CONFIG`: 상태별 color, label, order 정의
- `getStatusConfig(status)`: 상태 스타일 반환

## 조건별 아이템 출력

### VisibilityCondition 타입

```typescript
interface VisibilityCondition {
  time: ('day' | 'night')[];
  day: ('monday' | ... | 'sunday' | 'weekday' | 'weekend')[];
  weather: ('clear' | 'cloudy' | 'rain' | 'snow' | 'storm')[];
  season: ('spring' | 'summer' | 'autumn' | 'winter')[];
  event: string[];  // 'valentines', 'christmas', 'newyear', 'chuseok', 'halloween' 등
}
```

- `Emotion.visibility` 필드: 빈 배열 = 해당 카테고리 조건 없음 (항상 통과)
- 카테고리 간(time/day/weather/season/event): AND, 카테고리 내 값들: OR

### 카테고리 규칙

- 감정 카테고리 값은 **소문자 영문 코드**로 저장합니다. 예: `joy`, `sadness`, `love`
- 일반 사용자에게 노출되는 ProductList/ProductDetail에서는 **한글 라벨만** 출력합니다.

### 조건 판정 (`src/utils/conditions.ts`)

- `getCurrentTimeOfDay()`: 6~18시 → 'day', 그 외 → 'night'
- `getCurrentDayInfo()`: 요일 + weekday/weekend 판정
- `getCurrentSeason()`: 월 기반 (봄 3~5, 여름 6~8, 가을 9~11, 겨울 12~2)
- `getActiveEvents()`: 기념일별 활성 날짜 범위로 판정 (추석은 연도별 하드코딩 2024-2027)
- `isEmotionVisible(emotion, conditions)`: 노출 여부 판정
- `mapWeatherCode(wmoCode)`: WMO 코드 → WeatherType 변환

### 날씨 (`src/hooks/useWeather.ts`)

- Open-Meteo API (`https://api.open-meteo.com/v1/forecast?...&current_weather=true`)
- `navigator.geolocation` 사용, 실패 시 서울(37.57, 126.98) 폴백
- React Query 10분 캐시

### 현재 조건 집계 (`src/hooks/useCurrentConditions.ts`)

- useWeather + getCurrentTimeOfDay + getCurrentDayInfo + getCurrentSeason + getActiveEvents
- 1분 인터벌 갱신

### UI 컴포넌트

- `CurrentConditionUI` (`src/components/CurrentConditionUI.tsx`): 정렬 바 아래 뱃지 바
- `ConditionHintPopup` (`src/components/ConditionHintPopup.tsx`): 조건별 그룹핑 모달, Lucide 아이콘 + 이모지 전용

### ProductList 통합

- `sortedEmotions` → `isEmotionVisible` 필터 → `visibleEmotions`
- 검색 결과 카운트는 `visibleEmotions` 기준
- 💡 버튼으로 힌트 팝업 열기

## Bootstrap 순서

1. React Query 설정 (staleTime: 5분)
2. MSW 시작 (`onUnhandledRequest: 'bypass'`)
3. 장바구니 rehydrate (`cartStore.__rehydrate()`)
4. Firebase 주문 구독 (user 로그인 시 `subscribeToUserOrders` → `updateAllOrderStatuses`)

## Routing (독립 실행)

```
/           → ProductList
/detail/:id → ProductDetail
```
