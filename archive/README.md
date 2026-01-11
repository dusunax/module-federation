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
- `products@http://localhost:3002/remoteEntry.js`
  - `orderStore` - 기억/주문 상태 관리 (완료된 기억 내역 조회)
  - `utils/statusStyle` - 상태 스타일 유틸리티
  - `constants` - 상수 정의 (EMOTION_STATUS)

## 공유 의존성 (Shared)
- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand` (singleton)
- `sonner` (singleton)

## 주요 기능
- **기억 내역 목록**: 완료된 모든 기억을 시간순으로 표시
- **기억 상세**: 특정 기억의 상세 정보 표시
- **잊기 기능**: 기억을 삭제하는 기능 (toast 커스텀 모달 사용)

## 실행 방법
```bash
npm install
npm start
```
