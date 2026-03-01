# Archive App

감정 기록(기억 내역) 페이지를 제공하는 마이크로 프론트엔드입니다.

## 포트

- **3004**

## 역할

- 완료된 기억 내역 목록 표시 (OrderList)
- 기억 상세 정보 표시 (OrderDetail)
- 기억 삭제 기능 ("잊기")

## Expose

- `./OrderList` - 기억 내역 목록 컴포넌트
- `./OrderDetail` - 기억 상세 컴포넌트

## 원격 의존성 (Remotes)

- `products@http://localhost:3002/assets/remoteEntry.js`
  - `orderStore` - 기억/주문 상태 관리 (완료된 기억 내역 조회)
  - `utils/statusStyle` - 상태 스타일 유틸리티
  - `constants` - 상수 정의 (EMOTION_STATUS)

## 공유 의존성 (Shared)

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand` (singleton)
- `sonner` (singleton)

## 스타일링

- **Tailwind CSS 4**: `src/styles/tailwind.css`에서 Tailwind 엔진을 import하고 `shared/styles/globals.css`를 포함합니다.
- **공통 레이아웃**: 독립 실행 시 `shared/components/AppLayout` 컴포넌트를 사용합니다.

## 주요 기능

- **기억 내역 목록**: 완료된 모든 기억을 시간순으로 표시
- **기억 상세**: 특정 기억의 상세 정보 표시
- **잊기 기능**: 기억을 삭제하는 기능 (toast 커스텀 모달 사용)

## 실행 방법

```bash
npm install
npm start
```
