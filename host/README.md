# Host App

Module Federation의 호스트(메인) 애플리케이션입니다. 다른 마이크로 프론트엔드 앱들을 통합하여 하나의 애플리케이션으로 구성합니다.

## 포트

- **3000**

## 역할

- Header, Products, Cart, Archive 앱을 통합하는 컨테이너
- 라우팅 관리 (React Router)
- React Query 클라이언트 제공

## 원격 앱 (Remotes)

- `header@http://localhost:3001/remoteEntry.js`
- `products@http://localhost:3002/remoteEntry.js`
- `cart@http://localhost:3003/remoteEntry.js`
- `archive@http://localhost:3004/remoteEntry.js`

## 공유 의존성 (Shared)

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `@tanstack/react-query` (singleton)
- `zustand` (singleton)
- `sonner` (singleton)

## 스타일링

- **Tailwind CSS 4**: `src/styles/tailwind.css`에서 Tailwind 엔진을 import하고 `shared/styles/globals.css`를 포함합니다.
- **Remote 앱 소스 스캔**: Host 앱의 Tailwind가 모든 remote 앱의 소스 파일을 스캔하여 유틸리티 클래스를 생성합니다.
- **Module Federation 원칙**: 각 remote 앱은 자신의 CSS를 독립적으로 로드하며, Host는 remote CSS를 import하지 않습니다.

## 실행 방법

```bash
npm install
npm start
```
