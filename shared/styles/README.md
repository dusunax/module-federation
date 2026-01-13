# 스타일링 아키텍처

이 디렉토리는 프로젝트의 공통 스타일을 관리합니다.

자세한 내용은 `globals.css` 파일을 참조하세요.

## 파일 구조

- `globals.css`: 공통 CSS 변수, 기본 스타일, 컴포넌트 스타일 정의

## Tailwind CSS 4 구조

### 공통 스타일 레이어

`shared/styles/globals.css`는 Tailwind 위에 얹히는 CSS 레이어입니다.

- **CSS 변수**: 색상, 간격, 타이포그래피 등 디자인 토큰 정의
- **기본 스타일**: `body`, `html`, `h1-h6`, `p`, `a` 등 기본 요소 스타일
- **컴포넌트 스타일**: `.card`, `.btn`, `.input` 등 공통 컴포넌트 클래스

### 각 앱별 Tailwind 엔진

- 각 앱(`host`, `header`, `products`, `cart`, `archive` 등)은 독립적인 Tailwind CSS 엔진을 가집니다.
- 각 앱의 `src/styles/tailwind.css`에서 `@import "tailwindcss"`로 Tailwind 엔진을 로드합니다.
- 각 앱의 소스 파일을 `@source` 디렉티브로 스캔하여 사용된 유틸리티 클래스를 생성합니다.

### CSS import 위치

- 각 앱의 entry point에서 `tailwind.css`를 한 번만 import합니다.

## Module Federation + Tailwind 원칙

### 핵심 원칙

1. **각 앱은 자신의 Tailwind CSS를 독립적으로 로드합니다.**
   - Remote 앱이 Host에 통합되어도 각자의 CSS를 자체적으로 로드합니다.
   - Host 앱은 remote 앱의 CSS를 import하지 않습니다.

2. **컴포넌트 파일에서는 CSS를 import하지 않습니다.**
   - CSS는 앱 레벨 concern입니다.
   - Entry/bootstrap에서만 import하여 중복 로드와 스타일 순서 문제를 방지합니다.

3. **CSS는 expose하지 않습니다.**
   - Module Federation은 JS 모듈 공유가 목적입니다.
   - CSS expose는 로드 타이밍 예측 불가, 스타일 순서 보장 실패 등의 문제를 야기합니다.

4. **Shared는 순수 CSS 레이어만 제공합니다.**
   - `shared/styles/globals.css`는 Tailwind 엔진을 포함하지 않습니다.
   - Tailwind 엔진은 각 앱에서만 실행됩니다.

### 올바른 구조 예시

```css
/* products/src/styles/tailwind.css */
@import "tailwindcss";

@source "../**/*.{js,jsx,ts,tsx}";
@source "../../../shared/**/*.{js,jsx,ts,tsx}";
@import "../../../shared/styles/globals.css";
```

```javascript
// products/src/App.js
import './styles/tailwind.css'; // ✅ Entry에서 한 번만 import
```

