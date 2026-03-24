# Booked by Feelings

**감정 기록 및 책 추천**

감정 기록과 책 추천을 연결한 감성 플랫폼입니다. 감정을 저장하고 회고하면서, 감정에 맞는 책을 발견하는 흐름을 제공합니다. Vite + Module Federation 기반 마이크로 프론트엔드 아키텍처로 구축되었습니다.

## 프로젝트 구조

```
booked-by-feelings/
├── host/            # 호스트 앱 (포트 3000) - 메인 컨테이너, 라우팅, 대시보드
├── header/          # 헤더 앱 (포트 3001) - 네비게이션, 프로필 드롭다운
├── products/        # 상품 앱 (포트 3002) - 상품 목록/상세 + 장바구니/주문 상태
├── cart/            # 장바구니 앱 (포트 3003) - 장바구니, 주문(기억하기) 기능
├── archive/         # 기록 앱 (포트 3004) - 주문 내역(감정 기록), 감정 컬렉션
├── auth/            # 인증 앱 (포트 3005) - Google 로그인, Firebase, 에너지 시스템
├── shared/          # 공유 리소스
│   ├── components/    # 공통 컴포넌트 (AppLayout, BackButton, ConfirmDialog 등)
│   ├── constants/     # 공통 상수 (remembering duration 등)
│   └── styles/        # 공통 스타일 (globals.css, 디자인 시스템)
└── .claude/         # Claude Code 설정
    ├── commands/      # 슬래시 커맨드 (code-review, refactor-clean)
    └── rules/         # 프로젝트 규칙
        ├── guidelines/  # 코딩 가이드라인 (coding-style, performance, security)
        └── specs/       # 앱별 기능 명세 (host)

- books/             # 호스트 외부 모듈
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 코어 | React 19.2, TypeScript 5.3 |
| 번들러 | Vite 4 + @originjs/vite-plugin-federation |
| 라우팅 | React Router 7.12 |
| 전역 상태 관리 | Zustand |
| 서버 상태 관리 | @tanstack/react-query 5 |
| 스타일링 | Tailwind CSS 4 |
| 인증/DB | Firebase (Authentication, Firestore) |
| 알림 UI | Sonner |
| 테스트 | Vitest, @testing-library/react |

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

### 공유 감정 스토어 가이드

공유 감정 스토어 사용 가이드는 아래 문서로 분리했습니다.  

- [공유 감정 스토어 가이드](./shared-emotion-store-guide.md): 호스트 브릿지 API, 사용 예시, 소비 앱 연동 방식

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

루트에서 MF 앱들을 한 번에 실행합니다:

```bash
# 통합 실행 (prod-like 모드)
npm run start:mf

# 통합 실행 (dev 모드: 각 remote는 build --watch + vite preview)
npm run start:mf:dev

# 단일 앱 실행(개별 디버깅)
# 터미널 1
cd host && npm install && npm start
# 터미널 2
cd header && npm install && npm start
# 터미널 3
cd products && npm install && npm start
# 터미널 4
cd cart && npm install && npm start
# 터미널 5
cd archive && npm install && npm start
# 터미널 6
cd auth && npm install && npm start
```

모든 앱이 실행되면 `http://localhost:3000`에서 통합된 애플리케이션을 확인할 수 있습니다.

## 배포

- **Host 앱**: `https://dusunax-001.web.app/`
- `npm run deploy`는 각 앱을 build 후 Firebase Hosting으로 배포합니다.

## 테스트

```bash
# host 앱 테스트 실행
cd host && npm test

# watch 모드
cd host && npm run test:watch
```

## 환경 변수

`auth/.env` 파일에 Firebase 설정이 필요합니다 (`VITE_*` 형식):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 사용자 권한 규칙

- 사용자 역할은 `@shared/types/api.ts`의 `UserRole` enum(`USER`, `ADMIN`)으로 관리합니다.
- `User.role`은 필수 필드이며, 신규 사용자 생성 시 `UserRole.USER`가 기본값입니다.
- 관리자 라우트/메뉴는 `user.role === UserRole.ADMIN` 조건으로만 노출/허용합니다.
