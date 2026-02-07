# Archive App Feature Specification

## Overview

**역할**: 감정 기록(주문 내역) 관리 및 감정 컬렉션(도감) 표시.
**포트**: `http://localhost:3004`

## Module Federation

### Exposes

| 모듈 | 파일 |
|------|------|
| `./OrderList` | `src/OrderList.tsx` |
| `./OrderDetail` | `src/OrderDetail.tsx` |
| `./EmotionCollection` | `src/EmotionCollection.tsx` |

### Remotes

| Remote | 사용 모듈 |
|--------|----------|
| products | `orderStore`, `utils/statusStyle`, `constants` |
| auth | `authStore`, `orderService`, `emotionService` |

### 공유 모듈 (singleton)

react, react-dom, react-router-dom, zustand, sonner

## Pages

### OrderList (`src/OrderList.tsx`)

- 완료된 기억(주문) 목록을 최신순으로 표시
- 카드: 날짜(KR 로케일), 이모지 프리뷰(최대 6개 + "+N"), 총 아이템 수, 상태 뱃지
- 삭제("잊기"): `showConfirmToast` → 인증 시 `deleteUserOrder()`, 미인증 시 `removeOrder()`
- 빈 상태: 📚 아이콘 + 안내 메시지
- 데이터: Zustand store 초기값 + Firebase 실시간 구독 (`subscribeToUserOrders`)

### OrderDetail (`src/OrderDetail.tsx`)

- URL 파라미터: `orderId`
- 표시: 날짜, 상태 뱃지, 각 감정(이모지, 이름, 설명, 카테고리, 수량)
- 삭제("잊기"): 확인 후 삭제 → `/archive`로 이동
- 404 처리: 주문 미발견 시 에러 메시지

### EmotionCollection (`src/EmotionCollection.tsx`)

- 포켓몬 도감 스타일 감정 컬렉션
- 진행률: "{수집됨} / {전체} 수집 완료" + 프로그레스 바 + 퍼센트
- 수집된 감정: 이모지, 이름, 카테고리, 에너지 비용 표시
- 미수집 감정: 잠금 아이콘, "???" 이름, 에너지 비용만 표시
- 희귀도별 스타일링:
  - common: 기본 테두리
  - rare: 파란 테두리 + 파란 글로우
  - epic: 보라 테두리 + 보라 글로우
- 정렬: rarityOrder 기준
- 데이터: `getAllEmotions()` + `subscribeToUserOrders()`로 수집 여부 판별

## Routing (독립 실행)

```
/                    → OrderList
/archive/:orderId    → OrderDetail
```
