# Cart App

장바구니 페이지를 제공하는 마이크로 프론트엔드입니다.

## 포트
- **3003**

## 역할
- 장바구니 아이템 목록 표시 (일반 장바구니 아이템)
- 기억하는 중인 아이템 표시 (읽기 전용)
- 수량 조절 및 아이템 삭제
- 총 금액 계산 및 기억 기능
- 24시간 타이머 (장바구니 아이템 자동 삭제)
- 기억하기 진행 상태 표시 (프로그레스바)

## 아키텍처

```
src/
├── features/                # FSD 구조 
│   ├── cart-management/     # 장바구니 관리 기능
│   │   ├── components/      # CartItem, CartList, EmptyCart
│   │   └── hooks/           # useCartItems, useCartActions, useCartTimer
│   └── remembering/          # 기억하기 기능
│       ├── components/      # RememberingSection, CartSummary
│       └── hooks/           # useRememberingState, useRememberProgress
└── Cart.js                  # 페이지 컴포넌트
```

## Expose
- `./Cart` - 장바구니 컴포넌트

## 원격 의존성 (Remotes)
- `products@http://localhost:3002/remoteEntry.js`
  - `cartStore` - 장바구니 상태 관리
  - `orderStore` - 기억/주문 상태 관리
  - `utils/statusStyle` - 상태 스타일 유틸리티
  - `constants` - 상수 정의

## 공유 의존성 (Shared)
- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand` (singleton)
- `sonner` (singleton) - 토스트 알림 라이브러리

## 실행 방법
```bash
npm install
npm start
```
