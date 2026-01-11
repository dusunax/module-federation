# Cart App

장바구니 페이지를 제공하는 마이크로 프론트엔드입니다.

## 포트
- **3003**

## 역할
- 장바구니 아이템 목록 표시
- 수량 조절 및 아이템 삭제
- 총 금액 계산 및 주문 기능

## Expose
- `./Cart` - 장바구니 컴포넌트

## 원격 의존성 (Remotes)
- `products@http://localhost:3002/remoteEntry.js` (cartStore)

## 공유 의존성 (Shared)
- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand` (singleton)

## 실행 방법
```bash
npm install
npm start
```
