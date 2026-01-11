# Between Lines

**Like Real People Do**

사랑에 대한 순간들을 담은 이커머스 서비스입니다. 감정의 순간을 기억하고, 저장하며, 마음에 남겨두는 마이크로 프론트엔드 기반 플랫폼입니다.

## 프로젝트 구조

```
test-claud-code/
├── host/          # 호스트 앱 (포트 3000) - 메인 컨테이너
├── header/        # 헤더 앱 (포트 3001) - 네비게이션
├── products/      # 상품 앱 (포트 3002) - 상품 목록/상세 + 상태 관리
├── cart/          # 장바구니 앱 (포트 3003) - 장바구니 페이지
└── archive/       # 기록 앱 (포트 3004) - 감정 기록(상품 내역) 페이지
```

## 주요 기능

- **Module Federation**: 각 앱을 독립적으로 개발하고 배포(예정)
- **상태 공유**: Zustand store(cartStore, orderStore)를 통한 앱 간 상태 동기화
- **의존성 공유**: React, React Router, Zustand, Sonner 등을 singleton으로 공유
- **MSW**: API 모킹을 통한 개발 환경

## 아키텍처

### 의존성 방향
```
Host
 ├── Header → Products (cartStore, orderStore)
 ├── Products (cartStore, orderStore 제공)
 ├── Cart → Products (cartStore, orderStore, utils, constants)
 └── Archive → Products (orderStore, utils, constants)
```

### 상태 관리
- **products/cartStore**: 장바구니 아이템 관리 (itemId 기반, 같은 productId를 가진 여러 아이템 저장 가능)
- **products/orderStore**: 기억 진행 상태 및 완료된 기억 내역 관리
- 모든 앱이 동일한 store 인스턴스를 공유하여 실시간 동기화

## 실행 방법

각 앱을 별도의 터미널에서 실행합니다:

```bash
# 터미널 1: Host 앱
cd host
npm install
npm start

# 터미널 2: Header 앱
cd header
npm install
npm start

# 터미널 3: Products 앱
cd products
npm install
npm start

# 터미널 4: Cart 앱
cd cart
npm install
npm start

# 터미널 5: Archive 앱 (선택사항)
cd archive
npm install
npm start
```

모든 앱이 실행되면 `http://localhost:3000`에서 통합된 애플리케이션을 확인할 수 있습니다.

## 기술 스택

- **React 18.2.0**
- **Webpack 5** (Module Federation)
- **React Router 7.12.0**
- **Zustand** (상태 관리)
- **React Query** (데이터 페칭)
- **MSW** (API 모킹)
- **Sonner** (토스트 알림)

## 각 모듈 상세

각 모듈의 상세 정보는 해당 폴더의 README.md를 참조하세요:
- [Host App](./host/README.md)
- [Header App](./header/README.md)
- [Products App](./products/README.md) - cartStore, orderStore 제공
- [Cart App](./cart/README.md)
- [Archive App](./archive/README.md) - 감정 기록 페이지
