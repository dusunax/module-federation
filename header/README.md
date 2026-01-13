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
- `zustand` (singleton)

## 실행 방법

```bash
npm install
npm start
```
