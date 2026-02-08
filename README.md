# Love at First Sight

**사랑에 대한 순간들**

이커머스를 모티브로 한 감성 플랫폼입니다. 상품을 장바구니에 담고 주문하는 흐름을 통해 사랑의 순간들을 기억하고, 저장하며, 마음에 남겨두는 경험을 제공합니다. Webpack Module Federation 기반 마이크로 프론트엔드 아키텍처로 구축되었습니다.

## 프로젝트 구조

```
love-at-first-sight/
├── host/            # 호스트 앱 (포트 3000) - 메인 컨테이너, 라우팅, 대시보드
├── header/          # 헤더 앱 (포트 3001) - 네비게이션, 프로필 드롭다운
├── products/        # 상품 앱 (포트 3002) - 상품 목록/상세 + 장바구니/주문 상태
├── cart/            # 장바구니 앱 (포트 3003) - 장바구니, 주문(기억하기) 기능
├── archive/         # 기록 앱 (포트 3004) - 주문 내역(감정 기록), 감정 컬렉션
├── auth/            # 인증 앱 (포트 3005) - Google 로그인, Firebase, 에너지 시스템
├── shared/          # 공유 리소스
│   ├── components/    # 공통 컴포넌트 (AppLayout, BackButton, ConfirmDialog 등)
│   └── styles/        # 공통 스타일 (globals.css, 디자인 시스템)
└── .claude/         # Claude Code 설정
    ├── commands/      # 슬래시 커맨드 (code-review, refactor-clean)
    └── rules/         # 프로젝트 규칙
        ├── guidelines/  # 코딩 가이드라인 (coding-style, performance, security)
        └── specs/       # 앱별 기능 명세 (host)
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI | React 18.2, TypeScript 5.3 |
| 번들러 | Webpack 5 (Module Federation) |
| 라우팅 | React Router 7.12 |
| 상태 관리 | Zustand |
| 데이터 페칭 | @tanstack/react-query 5 |
| 스타일링 | Tailwind CSS 4 |
| 인증/DB | Firebase (Authentication, Firestore) |
| 토스트 | Sonner |
| 테스트 | Vitest 4, @testing-library/react |
| 트랜스파일 | Babel (preset-typescript) |

## 아키텍처

### Module Federation 구조

```
Host (포트 3000)
 ├── Header (3001) → Auth, Products
 ├── Products (3002) → Auth
 ├── Cart (3003) → Auth, Products
 ├── Archive (3004) → Auth, Products
 └── Auth (3005) - Firebase 인증/DB 제공
```

### 모듈별 Exposes

| 모듈 | Exposes |
|------|---------|
| **auth** | authStore, energyStore, rememberingStore, firebase, orderService, emotionService |
| **products** | ProductList, ProductDetail, cartStore, orderStore, utils, constants |
| **cart** | Cart, useRememberProgress, useRememberingSync |
| **archive** | OrderList, OrderDetail, EmotionCollection |
| **header** | Header |

### 공유 의존성 (singleton)

react, react-dom, react-router-dom, @tanstack/react-query, zustand, sonner

### 상태 관리

| Store | 위치 | 역할 |
|-------|------|------|
| authStore | auth | 사용자 인증 상태 (Google 로그인, plan, role) |
| energyStore | auth | 에너지 시스템 (일일 제한, 소비/복구, 사용량 통계) |
| rememberingStore | auth | 기억하기 진행 상태 |
| cartStore | products | 장바구니 아이템 관리 (쿠키 저장) |
| orderStore | products | 주문 상태 관리 |

### 데이터 저장소

- **Firebase Firestore**: 사용자 정보, 에너지, 주문 내역, 감정 데이터
- **쿠키**: 장바구니 아이템 (로컬 저장)

## 주요 기능

- **Google 로그인**: Firebase Authentication 기반 소셜 로그인
- **Module Federation**: 각 앱을 독립 개발/배포, 런타임 통합
- **감정 시스템**: 감정 목록 조회, 컬렉션, 관리자 CRUD
- **에너지 시스템**: 일일 에너지 제한, 소비/복구, 사용량 대시보드
- **장바구니/주문**: 장바구니 담기 → 기억하기(주문) → 기록 보관
- **대시보드**: 14일간 에너지 사용량 그래프, 최근 주문 내역
- **실시간 상태 동기화**: Zustand store를 통한 앱 간 상태 공유

## 실행 방법

각 앱을 별도의 터미널에서 실행합니다:

```bash
# 터미널 1: Auth 앱 (다른 앱의 의존성이므로 먼저 실행)
cd auth && npm install && npm start

# 터미널 2-6: 나머지 앱 (순서 무관)
cd host && npm install && npm start
cd header && npm install && npm start
cd products && npm install && npm start
cd cart && npm install && npm start
cd archive && npm install && npm start
```

모든 앱이 실행되면 `http://localhost:3000`에서 통합된 애플리케이션을 확인할 수 있습니다.

## 배포

- **Host 앱**: `https://dusunax-001.web.app/`

## 테스트

```bash
# host 앱 테스트 실행
cd host && npm test

# watch 모드
cd host && npm run test:watch
```

## 환경 변수

`auth/.env` 파일에 Firebase 설정이 필요합니다:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```
