# Products App

상품 목록 및 상세 정보를 제공하는 마이크로 프론트엔드입니다. 장바구니 상태 관리(store)도 담당합니다.

## 포트

- **3002**

## 역할

- 상품 목록 표시 (ProductList)
- 상품 상세 정보 표시 (ProductDetail)
- 장바구니 상태 관리 (cartStore - Zustand)
- 기억/주문 상태 관리 (orderStore - Zustand)
- MSW를 통한 API 모킹

## Expose

- `./ProductList` - 상품 목록 컴포넌트
- `./ProductDetail` - 상품 상세 컴포넌트
- `./cartStore` - 장바구니 상태 관리 store (Zustand)
- `./orderStore` - 기억/주문 상태 관리 store (Zustand)

### Store 구조

**cartStore:**

- 장바구니 아이템 관리 (`items: { [itemId]: { id, product, quantity, addedAt } }`)
- 기억하는 중인 아이템과 일반 장바구니 아이템을 분리하여 관리 가능

**orderStore:**

- 기억 진행 상태 관리 (`isRemembering`, `progress`, `orderStatuses`)
- 기억 중인 아이템 ID 목록 관리 (`rememberingItemIds`)
- 기억 시작 시간 관리 (`rememberingStartTime`)
- 완료된 기억 내역 관리 (`orders`)

**cartStore와 orderStore의 관계:**

- `cartStore`: 장바구니 아이템의 상태 관리
- `orderStore`: 기억 진행 상태와 기억 중인 아이템 추적
- `rememberingItemIds`: 기억하는 중인 아이템 식별용

### cartStore와 orderStore가 Products에 있는 이유

**구조:**

```
Products (cartStore, orderStore 제공)
  ↑
  ├── Header (cartStore, orderStore 사용)
  └── Cart (cartStore, orderStore 사용)
```

**구조의 장점:**

1. **논리적 응집도**: `ProductDetail` 컴포넌트에서 `addToCart` 기능을 제공하므로, 상품 추가 로직과 장바구니 상태를 같은 앱에서 관리
2. **의존성 방향 단순**:
   - Header → Products (cartStore, orderStore 사용)
   - Cart → Products (cartStore, orderStore 사용)
   - Products는 의존하지 않음
3. **상품 도메인 중심**: 상품과 장바구니가 밀접하게 연관되어 있어 함께 관리하는 것이 합리적
4. **상태 관리 일관성**: cartStore와 orderStore가 같은 앱에 있어 서로 참조가 용이 (예: addToCart에서 orderStore 확인)

**대안 구조 (Cart 앱에 cartStore):**

```
Cart (cartStore 제공)
  ↑
  ├── Products (cartStore 사용) ← 의존성 추가
  └── Header (cartStore 사용)
```

- 이 경우 Products가 Cart에 의존하게 되어 의존성 방향이 복잡해지고, 순환 의존성 위험이 있음 (Cart → Products → Cart)

**결론**: 의존성 관리와 유지보수 측면에서 현재 구조(Products에 cartStore, orderStore)를 선택

## 공유 의존성 (Shared)

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `@tanstack/react-query` (singleton)
- `zustand` (singleton)
- `sonner` (singleton)

## 실행 방법

```bash
npm install
npm start
```
