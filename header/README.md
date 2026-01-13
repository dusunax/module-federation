# Header App

네비게이션 헤더 컴포넌트를 제공하는 마이크로 프론트엔드입니다.

## 포트

- **3001**

## 역할

- 전역 네비게이션 헤더 컴포넌트 제공
- 장바구니 아이템 개수 표시 (products/cartStore)

## Expose

- `./Header` - 헤더 컴포넌트

## 원격 의존성 (Remotes)

- `products@http://localhost:3002/remoteEntry.js`

## 공유 의존성 (Shared)

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand` (singleton)

## 스타일링

- **Tailwind CSS 4**: `src/styles/tailwind.css`에서 Tailwind 엔진을 import하고 `shared/styles/globals.css`를 포함합니다.
- **공통 레이아웃**: 독립 실행 시 `shared/components/AppLayout` 컴포넌트를 사용합니다.

## 실행 방법

```bash
npm install
npm start
```
