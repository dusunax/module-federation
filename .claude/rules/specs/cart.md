# Cart App Feature Specification

## Overview

**역할**: 장바구니 페이지. 아이템 관리, 기억하기(주문) 기능, 진행 상태 추적.
**포트**: `http://localhost:3003`

## Module Federation

### Exposes

| 모듈 | 파일 |
|------|------|
| `./Cart` | `src/Cart.tsx` |
| `./features/remembering/hooks/useRememberProgress` | 기억하기 진행 추적 훅 |
| `./features/remembering/hooks/useRememberingSync` | 기억하기 상태 동기화 훅 |

### Remotes

| Remote | 사용 모듈 |
|--------|----------|
| products | `cartStore`, `orderStore`, `utils/statusStyle`, `constants` |
| auth | `authStore`, `energyStore`, `rememberingStore`, `orderService` |

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, zustand, sonner

## 아키텍처 (FSD 구조)

```
src/
├── features/
│   ├── cart-management/
│   │   ├── components/     CartItem, CartList, EmptyCart
│   │   └── hooks/          useCartItems, useCartActions, useCartTimer
│   └── remembering/
│       ├── components/     RememberingSection, CartSummary
│       └── hooks/          useRememberingState, useRememberProgress, useRememberingSync
└── Cart.tsx                페이지 컴포넌트
```

## 주요 기능

### Cart 페이지 (`src/Cart.tsx`)

- 일반 장바구니 아이템 목록 (수량 조절, 삭제)
- 기억하는 중인 아이템 표시 (읽기 전용)
- 총 에너지 계산 및 기억하기 실행
- 24시간 타이머 (장바구니 아이템 자동 삭제)
- 프로그레스바로 기억하기 진행 상태 표시

### useRememberProgress 훅

host의 AppContent에서 호출. 100ms 간격으로 rememberingItems 진행도 체크.

**동작 흐름**:
1. `rememberingItems` 감시 (100ms 인터벌)
2. progress >= 100% 도달한 아이템 수집
3. `completeItemRemembering()` 호출 (Firestore 문서 삭제)
4. 완료된 아이템으로 Order 생성
5. Firestore에 주문 저장 (`saveUserOrder`)
6. 장바구니에서 제거 + 상태를 REMEMBERED로 업데이트
7. 토스트: "기억으로 남았어요. (⚡ N 소모)"

```typescript
// 완료 감지 로직
const elapsed = Date.now() - item.startTime;
const progress = Math.min((elapsed / item.duration) * 100, 100);
if (progress >= 100) completedNow.push(visibleItemId);
```

### useRememberingSync 훅

host의 AppContent에서 호출. 인증 상태에 따라 rememberingStore 리스너 관리.

```typescript
// user 로그인 시 → initializeListener(user.uid)
// user 로그아웃 시 → cleanup()
```
