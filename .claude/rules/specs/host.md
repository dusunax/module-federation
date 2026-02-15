# Host App Feature Specification

## Overview

**앱 이름**: Love at Sight
**역할**: Module Federation 호스트 앱. 5개 리모트(header, products, cart, archive, auth)를 통합하고, 인증·대시보드·감정 관리 등 핵심 기능 제공.
**포트**: `http://localhost:3000`

## Tech Stack

- React 18.2, TypeScript 5.3, Webpack 5 (Module Federation)
- react-router-dom 7.12, @tanstack/react-query 5.90, zustand
- sonner (토스트), Tailwind CSS 4.1
- Vitest 4.0 + @testing-library/react + MSW 2.12

## Module Federation

### 리모트 앱

| Remote | Port | 제공 모듈 |
|--------|------|----------|
| header | 3001 | `Header` 컴포넌트 |
| products | 3002 | `ProductList`, `ProductDetail` |
| cart | 3003 | `Cart`, `useRememberProgress`, `useRememberingSync` |
| archive | 3004 | `OrderList`, `OrderDetail`, `EmotionCollection` |
| auth | 3005 | `authStore`, `energyStore`, `emotionService` |

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, @tanstack/react-query, zustand, sonner

## Routing

```
/login                → Login (public)
/                     → ProductList (ProtectedRoute, 미인증도 접근 가능)
/detail/:id           → ProductDetail (ProtectedRoute)
/cart                 → Cart (ProtectedRoute)
/archive              → OrderList (ProtectedRoute)
/archive/:orderId     → OrderDetail (ProtectedRoute)
/dashboard            → Dashboard (ProtectedRoute)
/collection           → EmotionCollection (ProtectedRoute)
/admin/emotions       → AdminEmotions (AdminRoute, role === 'admin')
```

### 접근 제어

- **ProtectedRoute**: 미인증 시 `/login`으로 리다이렉트. 단, `/`는 미인증 허용.
- **AdminRoute**: `user.role === 'admin'`이 아니면 `/`로 리다이렉트.
- 모든 보호 라우트는 인증 로딩 중 스피너 표시.

## 컴포넌트 구조

```
<App>
  <QueryClientProvider>
    <BrowserRouter>
      <ToastHost />           ← sonner Toaster (bottom-right)
      <Routes>
        /login → <Login />
        /* → <AppContent>
          <Header />          ← header 리모트
          useRememberingSync()  ← cart 리모트 훅
          useRememberProgress() ← cart 리모트 훅
          <Routes>
            각 페이지 (lazy + Suspense)
          </Routes>
          <footer>
```

모든 페이지 컴포넌트는 `React.lazy()`로 동적 로딩, 한국어 로딩 메시지 포함.

## Pages

### Login (`/src/pages/Login.tsx`)
- Google OAuth 로그인 (`authStore.signInWithGoogle()`)
- 에러 메시지 표시/해제, 로딩 상태 관리
- BackButton으로 이전 페이지 복귀

### Dashboard (`/src/pages/Dashboard.tsx`)
- **UsageChart**: 14일간 에너지 사용량 SVG 그래프 (사용량 실선 + 저장 횟수 점선)
- **RecentOrders**: 최근 20건 주문 목록 (날짜별 그룹핑)
- **요약 통계**: 총 에너지 사용량, 총 저장 횟수
- 데이터: `energyStore.fetchDailyUsage(14)`, `energyStore.fetchRecentOrders(20)`
- 유틸: `fillDateGaps()`, `formatDateLabel()`, `groupOrdersByDate()`, `getYTicks()`

### AdminEmotions (`/src/pages/AdminEmotions.tsx`)
- 감정 목록 테이블 (ID, 이모지, 이름, 강도, 카테고리, 노출 조건, 공개 여부)
- 추가/수정 모달 (이름 ko/en, 이모지, 강도, 카테고리, 설명 ko/en, 공개 토글, 노출 조건: 시간/요일/날씨/계절/이벤트)
- 폼 검증: nameKo, nameEn, emoji, category, intensity, descriptionKo, descriptionEn 필수 (미충족 시 저장 버튼 비활성화)
- API: `emotionService.getAllEmotions()`, `createEmotion()`, `updateEmotion()`
- React Query 캐시 (`['admin-emotions']`) 저장 후 무효화

## State Management

### authStore (auth 리모트, zustand)

```typescript
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}
```

### energyStore (auth 리모트, zustand)

```typescript
interface DailyUsage { used: number; count: number; date: string }

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

### React Query

- staleTime: 5분, refetchOnWindowFocus: false

## emotionService API

```typescript
getAllEmotions(searchTerm?: string, options?: { includeAll?: boolean }): Promise<Emotion[]>
getEmotionById(id: number): Promise<Emotion | null>
createEmotion(data: Omit<Emotion, 'energyCost'>): Promise<void>
updateEmotion(id: number, data: Partial<Omit<Emotion, 'energyCost'>>): Promise<void>
```

### Emotion 타입

`shared/types/api.ts` 참조. 주요 필드:

```typescript
interface I18nText {
  ko: string;
  en: string;
}

interface Emotion {
  id: number;
  name: I18nText;
  emoji: string;
  intensity: 'high' | 'middle' | 'low';  // Plutchik 강도
  category: string;                        // 소문자 영문 코드
  description: I18nText;
  published: boolean;
  image: string | null;
  energyCost: number;
  intensityOrder: number;
  createdAt: FirestoreTimestamp;
  visibility: VisibilityCondition;
}
```

## Bootstrap 순서

1. Firebase auth 리스너 초기화 (`initAuthListener()`)
2. React 렌더링 (`createRoot(#root).render(<App />)`)
3. AppContent에서 emotions 컬렉션 시드 체크 (`isEmotionsCollectionEmpty()` → `seedEmotions()`)

## Testing

- **프레임워크**: Vitest + jsdom + @testing-library/react
- **모킹**: 모든 리모트 모듈을 `src/__mocks__/`에서 모킹
- **테스트 헬퍼**: `__setAuthState()`, `__resetAuthState()`, `__setEnergyState()`, `__resetEnergyState()`
- **테스트 파일**: ProtectedRoute, AdminRoute, Login, Dashboard, AdminEmotions

## Styling

- Tailwind CSS 4.1 + PostCSS
- CSS 변수 기반 다크 테마: `--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-accent-*`, `--color-overlay-*`
- 전역 스타일: `shared/styles/globals.css`
