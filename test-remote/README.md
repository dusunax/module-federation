# Host sharedEmotionStore 외부 도메인 테스트 모듈

`host` 앱의 `/assets/remoteEntry.js`를 외부 origin에서 로드해
`sharedEmotionStore` 모듈을 가져오는지 확인하는 테스트 앱입니다.

## 로컬 실행

```bash
cd /Users/du/repository/test-claude-code/host-remote-test
npm install
npm run dev
```

브라우저에서 `http://localhost:4173` 접속 후

- `RemoteEntry` 값이 `https://dusunax-001.web.app/assets/remoteEntry.js`
- 상태가 `성공`인지
- `전체 기록 수`가 정상 노출되는지 확인하세요.

원하면 `VITE_HOST_REMOTE`를 바꿔 다른 도메인으로 시험 가능합니다.

```bash
VITE_HOST_REMOTE=https://example.com/assets/remoteEntry.js npm run dev
```

## Vercel 배포

```bash
cd /Users/du/repository/test-claude-code/host-remote-test
npm install
npx vercel
```

- Production 배포를 원하면 `npx vercel --prod`
- 환경변수 `VITE_HOST_REMOTE`를 필요 시 Vercel 프로젝트 환경변수로 등록
