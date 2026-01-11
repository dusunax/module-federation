# Host App

Module Federation의 호스트(메인) 애플리케이션입니다. 다른 마이크로 프론트엔드 앱들을 통합하여 하나의  애플리케이션으로 구성합니다.

## 포트
- **3000**

## 역할
- Header, Products, Cart 앱을 통합하는 컨테이너
- 라우팅 관리 (React Router)
- React Query 클라이언트 제공
- MSW를 통한 API 모킹
- 전역 CSS 스타일 관리 (`src/styles/globals.css`)

## 원격 앱 (Remotes)
- `header@http://localhost:3001/remoteEntry.js`
- `products@http://localhost:3002/remoteEntry.js`
- `cart@http://localhost:3003/remoteEntry.js`

## 공유 의존성 (Shared)
- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `@tanstack/react-query` (singleton)
- `zustand` (singleton)

## 실행 방법
```bash
npm install
npm start
```
