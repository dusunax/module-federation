# 커밋 가이드라인

## 커밋 메시지 형식

### Conventional Commits 형식 사용

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 설정, 패키지 매니저 등

### Scope (선택사항)

각 마이크로 프론트엔드 앱을 scope로 지정:

- `host`: Host 앱 관련 변경
- `header`: Header 앱 관련 변경
- `products`: Products 앱 관련 변경
- `cart`: Cart 앱 관련 변경
- `shared`: 공통 설정, 공유 코드
- `config`: webpack, package.json 등 설정 파일

### Subject (필수)

- 50자 이내
- 명령형으로 작성 (과거형 X)
- 마지막에 마침표(.) 사용하지 않음

### Body (선택사항)

- 변경 이유와 방법 설명
- 이전 동작과의 차이점
- 72자마다 줄바꿈

### Footer (선택사항)

- Breaking changes: `BREAKING CHANGE: <설명>`
- Issues: `Closes #123`, `Fixes #456`

## 커밋 예시

### 단일 앱 변경

```bash
git commit -m "feat(products): add product detail page"
git commit -m "fix(host): resolve router context for remote components"
git commit -m "docs(header): update README with cart store usage"
```

### 여러 앱 변경 (각각 커밋)

```bash
# Products 앱 변경
git add products/
git commit -m "feat(products): expose cartStore for shared state"

# Host 앱 변경
git add host/
git commit -m "feat(host): integrate products cartStore"
```

### 공통 설정 변경

```bash
git commit -m "chore(shared): update webpack Module Federation config"
git commit -m "chore(config): add CSS loader to all apps"
```

### Breaking Change

```bash
git commit -m "feat(products)!: change cartStore API

BREAKING CHANGE: cartStore export 방식 변경
기존: default export
변경: named export (useCartStore)
"
```

## 커밋 전략

### 1. 앱별로 분리 커밋

각 마이크로 프론트엔드 앱의 변경사항은 별도로 커밋하는 것을 권장합니다.

```bash
# 좋은 예
git add products/src/store/cartStore.js
git commit -m "feat(products): add zustand cart store"

git add header/src/Header.js
git commit -m "feat(header): integrate cart store in header"
```

### 2. 관련 변경사항은 함께 커밋

같은 기능을 위한 여러 파일 변경은 하나의 커밋으로 묶습니다.

```bash
# 좋은 예
git add products/src/store/cartStore.js products/webpack.config.js
git commit -m "feat(products): expose cartStore via Module Federation"
```

### 3. 설정 변경은 별도 커밋

webpack 설정, package.json 등은 별도로 커밋합니다.

```bash
git add host/webpack.config.js
git commit -m "chore(host): add CSS loader configuration"
```

## 브랜치 전략

### 메인 브랜치

- `main` 또는 `master`: 프로덕션 배포용

### 개발 브랜치

- `develop`: 개발 통합 브랜치

### 기능 브랜치

- `feature/<scope>/<feature-name>`
  - 예: `feature/products/cart-store`
  - 예: `feature/host/global-styles`

### 수정 브랜치

- `fix/<scope>/<issue-description>`
  - 예: `fix/host/router-context`
  - 예: `fix/products/store-sync`

## 예시 워크플로우

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/products/cart-store

# 2. 변경사항 커밋
git add products/src/store/cartStore.js
git commit -m "feat(products): add zustand cart store"

git add products/webpack.config.js
git commit -m "chore(products): expose cartStore via Module Federation"

# 3. 다른 앱에서 사용
git add header/src/Header.js
git commit -m "feat(header): integrate cart store"

# 4. develop 브랜치로 머지
git checkout develop
git merge feature/products/cart-store
```
