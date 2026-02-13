# Plutchik 감정 바퀴 Specification

## Overview

Plutchik의 감정 모델 기반 SVG 시각화. ProductList 페이지의 기본 뷰 모드.
8개 기본 감정 × 3단계 강도 + 8개 복합 감정 = 총 32개 감정 영역.

## 파일 구조

```
shared/constants/categories.ts              # 감정 시스템 단일 소스 (데이터, 라벨, 색상)
products/src/constants/plutchikWheelConfig.ts  # SVG 지오메트리 (좌표, 경로 계산)
products/src/components/PlutchikWheel.tsx      # 바퀴 렌더링 + 인터랙션
```

## 감정 시스템 (`shared/constants/categories.ts`)

단일 소스 — 모든 감정 데이터(라벨, 색상, 구조)를 한 파일에서 관리.

### 마스터 데이터

```typescript
INTENSITY_LEVELS: ['high', 'middle', 'low']  // DB 값과 일치

// 8개 기본 감정 (시계방향, 12시=joy)
BASE_EMOTIONS: BaseEmotion[]
// 순서: joy, trust, fear, surprise, sadness, disgust, anger, anticipation
// 각 감정: { code, ko, intensities: [high, middle, low] }
// 각 강도: { ko, en, color }

// 8개 복합 감정 (인접 기본 감정 사이)
COMPOSITE_EMOTIONS: CompositeEmotion[]
// 순서: love, submission, awe, disapproval, remorse, contempt, aggressiveness, optimism
```

### 파생 상수 (마스터 데이터에서 자동 생성)

```typescript
CATEGORY_LABELS: Record<string, string>       // 코드→한글 (기본+강도별+복합)
BASE_CATEGORIES: string[]                      // 기본 카테고리 코드 배열
COMPOSITE_CATEGORIES: string[]                 // 복합 카테고리 코드 배열
COMPOSITE_CATEGORY_PAIRS: Record<string, [string, string]>  // 복합→인접 기본 쌍
```

### 헬퍼 함수

```typescript
getIntensityLabel(categoryCode, ringIndex): EmotionIntensity | undefined
getIntensityColors(categoryCode): string[]
isBaseCategory(category): boolean
isCompositeCategory(category): boolean
```

## 바퀴 지오메트리 (`products/src/constants/plutchikWheelConfig.ts`)

감정 데이터는 `@shared/constants/categories`에서 import. 이 파일은 SVG 좌표/경로 계산만 담당.

```typescript
CENTER = 250;
VIEW_SIZE = 500;  // viewBox에 좌우 50 패딩 추가 → 600×600
COMPOSITE_LABEL_RADIUS = 270;

// Ring 반경: highest(안쪽) → lowest(바깥쪽)
RING_RADII: [number, number][] = [
  [60, 120],   // high
  [120, 185],  // middle
  [185, 245],  // low
];

// 8개 섹터 (BASE_EMOTIONS에서 파생)
PLUTCHIK_SECTORS: PlutchikSector[]
// 각 45도, 시작각 -90도 오프셋 (joy=12시)
```

### SVG 경로 함수

- `polarToCartesian(cx, cy, radius, angleDeg)` → `{x, y}`
- `describeArc(cx, cy, innerR, outerR, startAngle, endAngle)` → 도넛 슬라이스 SVG path
- `getSegmentPath(sectorIndex, ringIndex)` → 개별 세그먼트 경로
- `getSegmentCentroid(sectorIndex, ringIndex)` → 라벨 위치 좌표
- `getCompositePosition(sectorIndex)` → 복합 감정 라벨 위치

## PlutchikWheel 컴포넌트 (`products/src/components/PlutchikWheel.tsx`)

### Props

```typescript
interface PlutchikWheelProps {
  emotions: Emotion[] | undefined;
  conditions: CurrentConditions;
  onAddToCart: (emotion: Emotion) => void;
  cartProductIds?: Set<number>;  // 장바구니에 담긴 감정 ID (하이라이트용)
}
```

### 섹터 클릭 시스템

한 섹터(피자 조각)를 통으로 클릭. 개별 링이 아닌 **섹터 단위** 인터랙션.

| 클릭 횟수 | 선택 강도 | 링 위치 | 예시 (기쁨 섹터) |
|-----------|----------|---------|-----------------|
| 1회 | low | 바깥쪽 (ringIndex 2) | 평온 (serenity) |
| 2회 | middle | 중간 (ringIndex 1) | 기쁨 (joy) |
| 3회 | high | 안쪽 (ringIndex 0) | 황홀 (ecstasy) |

- 같은 섹터 재클릭: 1→2→3→1 순환
- 다른 섹터 클릭: 새로 1부터 시작
- **1초 타임아웃** 후 선택 확정 → 장바구니에 담기
- 동일 강도에 복수 감정 → 선택 팝업 (`createPortal`)
- 감정 없는 세그먼트 → 무시, 조건 미충족 → 토스트

### 시각 피드백

| 상태 | 시각 효과 |
|------|----------|
| 기본 | opacity 0.85 |
| 빈 세그먼트 (DB에 없음) | opacity 0.08 |
| 조건 미충족 (dimmed) | opacity 0.25 |
| 섹터 호버 | opacity +0.1, brightness(1.1) |
| 프리셀렉션 (클릭 중) | opacity 1, brightness(1.25), 흰색 스트로크 2.5px |
| 장바구니 아이템 | opacity 1, brightness(1.15), saturate(1.4), drop-shadow |

- **세그먼트 라벨**: 강도별 한글/영어 (e.g., 황홀/ecstasy)
- **high 링** (ringIndex 0): 어두운 배경이므로 **흰색 텍스트**
- **중앙 원**: 프리셀렉션 시 감정명 + `●○○` 진행 표시, 평소 "감정 바퀴"
- **복합 감정**: 이탤릭 텍스트 라벨, 클릭 시 선택 팝업

### 조작

- **중앙 원 드래그**: 바퀴 전체 이동 (pointer capture)
- **마우스 휠**: 크기 조절 (non-passive wheel event)
- **+/− 버튼**: 크기 단계 조절 (400~1200px, 100px 단위)

### 내부 상태

```typescript
sectorClickState: { sectorIndex, clickCount } | null  // 현재 클릭 추적
hoveredSector: number | null            // 섹터 단위 호버
hoveredComposite: string | null         // 복합 감정 호버
selectedInfo: SelectedInfo | null       // 팝업 데이터
wheelSize: number                       // SVG 크기 (400~1200)
offset: { x, y }                        // 드래그 이동량
```

### 스트로크 정책

세그먼트 간 테두리 아티팩트 방지를 위해:
- 기본: `stroke: none`, `strokeWidth: 0`
- 프리셀렉션: `stroke: #fff`, `strokeWidth: 2.5`
- 장바구니: 스트로크 없음, filter로 하이라이트

## ProductList 통합

```tsx
// 뷰 모드 토글 (기본값: wheel)
<ViewModeToggle mode={viewMode} />

// 바퀴 모드
<PlutchikWheel
  emotions={emotions}
  conditions={conditions}
  onAddToCart={handleAddToCart}
  cartProductIds={cartProductIds}  // Set<number>
/>

// 목록 모드: 검색 + 정렬 + 수집 필터 + 카드 그리드
```

양쪽 모드 모두 `CurrentConditionUI` + `ConditionHintPopup` 표시.
