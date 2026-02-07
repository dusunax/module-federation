# Header App Feature Specification

## Overview

**역할**: 글로벌 네비게이션 헤더. 라우트 인식 스타일링, 장바구니 카운터, 프로필 드롭다운, 에너지 표시 제공.
**포트**: `http://localhost:3001`

## Module Federation

### Exposes

- `./Header` → `src/Header.tsx`

### Remotes

| Remote | 사용 모듈 |
|--------|----------|
| products | `cartStore` |
| auth | `authStore`, `energyStore`, `rememberingStore` |

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, zustand

## Header 컴포넌트 (`src/Header.tsx`)

Props 없음. 훅으로 모든 상태 참조.

### 사용 Store

```typescript
const items = useCartStore((state) => state.items);
const rememberingItems = useRememberingStore((state) => state.rememberingItems);
const { user, signOut } = useAuthStore();
const { current: currentEnergy, maxEnergy } = useEnergyStore();
```

### UI 구성

1. **로고 (좌측)**: "Love at First Sight" + 부제 → `/` 링크
2. **네비게이션 아이콘 (우측)**:
   - 에너지 배지: ⚡ current/max
   - 홈 아이콘: `/` (활성 라우트 시 녹색 하이라이트)
   - 장바구니 아이콘: `/cart` + 아이템 수 뱃지 (remembering 제외)
   - 대시보드 아이콘: `/dashboard`
   - 프로필 (인증 시) / 로그인 아이콘 (미인증 시)

### 프로필 드롭다운

- 유저 정보 (사진, 이름, 이메일)
- 에너지 상태, 플랜 정보
- 네비게이션: 감정 도감(`/collection`), 감정 기록(`/archive`), 관리자(`/admin/emotions` - admin만)
- 로그아웃 버튼
- 외부 클릭/라우트 변경 시 자동 닫힘

### 장바구니 카운트 계산

```typescript
const totalItems = Object.values(items)
  .filter((item) => !rememberingItemIds.includes(item.id))
  .reduce((total, item) => total + item.quantity, 0);
```

### 활성 라우트 감지

```typescript
const isActive = (path: string) => {
  if (path === '/') return location.pathname === '/';
  return location.pathname.startsWith(path);
};
```

### 아이콘

lucide-react: HomeIcon, ShoppingCartIcon, BookOpenIcon, BookMarkedIcon, LogOutIcon, UserIcon, LayoutDashboardIcon, ShieldIcon, XIcon

## Routing (독립 실행)

```
/         → Header 표시
/cart     → Header 표시
/archive  → Header 표시
```
