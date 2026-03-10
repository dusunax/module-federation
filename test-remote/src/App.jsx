import { useCallback, useEffect, useRef, useState } from 'react';

const HOST_REMOTE_URL =
  import.meta.env.VITE_HOST_REMOTE || 'https://dusunax-001.web.app/assets/remoteEntry.js';
const AUTH_REMOTE_URL =
  import.meta.env.VITE_AUTH_REMOTE || 'https://auth-dusunax-001.web.app/assets/remoteEntry.js';

const MAX_TRACE_LOGS = 120;

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return 'invalid-url';
  }
}

function makeTrace(name, detail) {
  return {
    t: new Date().toISOString(),
    name,
    detail,
  };
}

function formatRecords(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return JSON.stringify([], null, 2);
  }

  return JSON.stringify(records, null, 2);
}

function formatUser(user) {
  if (!user) {
    return '(비로그인)';
  }

  return `${user.uid ?? 'uid-unknown'} (${user.email ?? 'email-unknown'})`;
}

function hasStoreApi(value) {
  return Boolean(
    value &&
      (typeof value.getState === 'function' || typeof value.setState === 'function') &&
      typeof value.subscribe === 'function'
  );
}

const isPermissionError = (message) =>
  typeof message === 'string' && message.includes('Missing or insufficient permissions');

function AuthStoreObserver({ useAuthStore, onAuthState }) {
  const authState = useAuthStore();
  const didInitAuthListener = useRef(false);

  useEffect(() => {
    if (!authState || typeof authState.initAuthListener !== 'function' || didInitAuthListener.current) {
      return;
    }

    didInitAuthListener.current = true;
    const unsubscribe = authState.initAuthListener();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [authState]);

  useEffect(() => {
    onAuthState?.(authState ?? null);
  }, [authState?.loading, authState?.user?.uid, authState?.user?.email, onAuthState]);

  return null;
}

export default function App() {
  const [status, setStatus] = useState('로딩 중');
  const [error, setError] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  const [records, setRecords] = useState([]);
  const [rawPayload, setRawPayload] = useState('');
  const [authStatus, setAuthStatus] = useState('로그인 상태 확인 전');
  const [authUser, setAuthUser] = useState(null);
  const [authActionError, setAuthActionError] = useState('');
  const [Initializer, setInitializer] = useState(null);
  const [authStore, setAuthStore] = useState(null);
  const [traceEvents, setTraceEvents] = useState([]);

  const addTrace = useCallback((name, detail = {}) => {
    setTraceEvents((prev) => {
      const next = [...prev, makeTrace(name, detail)];
      if (next.length > MAX_TRACE_LOGS) {
        return next.slice(next.length - MAX_TRACE_LOGS);
      }
      return next;
    });
  }, []);

  const applyAuthState = useCallback(
    (authState) => {
      setAuthUser(authState?.user ?? null);
      setAuthStatus(
        authState?.loading
          ? '인증 로딩 중'
          : authState?.user
          ? '로그인 유지 중'
          : '비로그인'
      );
      addTrace('auth.state.updated', {
        uid: authState?.user?.uid ?? null,
        email: authState?.user?.email ?? null,
        loading: authState?.loading ?? null,
      });
    },
    [addTrace]
  );

  const handleInitializerTrace = useCallback(
    (name, detail) => {
      addTrace(`EmotionStoreInitializer.${name}`, detail);
    },
    [addTrace]
  );

  useEffect(() => {
    addTrace('boot.config', {
      pageOrigin: window.location.origin,
      hostRemote: HOST_REMOTE_URL,
      hostRemoteOrigin: getOrigin(HOST_REMOTE_URL),
      authRemote: AUTH_REMOTE_URL,
      authRemoteOrigin: getOrigin(AUTH_REMOTE_URL),
      isHostLocalhost: getOrigin(HOST_REMOTE_URL).includes('localhost'),
      isAuthLocalhost: getOrigin(AUTH_REMOTE_URL).includes('localhost'),
      publicUrl: import.meta.env.BASE_URL,
      mode: import.meta.env.MODE,
    });
  }, [addTrace]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;

    (async () => {
      try {
        addTrace('host.sharedEmotionStore.import.start', {
          remote: HOST_REMOTE_URL,
        });
        const module = await import('host/sharedEmotionStore');

        if (!mounted) return;

        const store = module.useSharedEmotionStore;
        if (!store || typeof store.getState !== 'function' || typeof store.subscribe !== 'function') {
          addTrace('host.sharedEmotionStore.invalid', {
            hasStore: Boolean(store),
            hasGetState: typeof store?.getState,
            hasSubscribe: typeof store?.subscribe,
          });
          throw new Error('host/sharedEmotionStore 모듈에서 useSharedEmotionStore를 찾지 못했습니다.');
        }

        addTrace('host.sharedEmotionStore.import.success', {});

        const applyState = () => {
          if (!mounted) return;
          const nextState = store.getState?.();
          const payload = nextState?.getRecentWeekPayload
            ? nextState.getRecentWeekPayload(new Date())
            : null;
          const nextRecords = payload?.records ?? nextState?.records ?? [];

          if (nextState) {
            console.info('[sharedEmotionStore] fullState.json', JSON.stringify(nextState, null, 2));
          }
          if (payload) {
            console.info('[sharedEmotionStore] weeklyPayload.json', JSON.stringify(payload, null, 2));
          }

          setRecords(nextRecords);
          setRecordCount(nextRecords.length);

          const payloadText = payload
            ? `${payload.startDate} ~ ${payload.endDate} / records=${payload.records?.length ?? 0}`
            : 'payload 함수 미지원';
          setRawPayload(payloadText);
          addTrace('host.store.updated', {
            count: nextRecords.length,
            hasPayload: Boolean(payload),
          });
        };

        applyState();
        unsubscribe = store.subscribe(() => applyState());
        setStatus('성공');
        addTrace('host.store.subscribed', { count: recordCount });

        try {
          addTrace('host.emotionStoreInitializer.import.start', {
            remote: HOST_REMOTE_URL,
          });
          const initializerModule = await import('host/EmotionStoreInitializer');
          const InitializerComp = initializerModule?.default;
          addTrace('host.emotionStoreInitializer.import.success', {
            exported: Boolean(InitializerComp),
            type: typeof InitializerComp,
          });

          if (!mounted) return;

          if (typeof InitializerComp === 'function') {
            setInitializer(() => InitializerComp);
            addTrace('host.emotionStoreInitializer.bound', {});
          } else {
            addTrace('host.emotionStoreInitializer.invalid', {
              type: typeof InitializerComp,
            });
          }
  } catch (err) {
          addTrace('host.emotionStoreInitializer.import.failed', {
            message: err instanceof Error ? err.message : String(err),
          });
        }
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : String(err);
        setStatus('실패');
        setError(message);
        addTrace('host.sharedEmotionStore.import.failed', { message });
      }

      try {
        addTrace('auth.import.start', {
          remote: AUTH_REMOTE_URL,
        });
        const authModule = await import('auth/authStore');
        const resolvedAuthStore =
          authModule?.useAuthStore ??
          authModule?.default?.useAuthStore ??
          authModule?.default ??
          null;

        if (!mounted) return;

        if (typeof resolvedAuthStore !== 'function' && !hasStoreApi(resolvedAuthStore)) {
          setAuthStatus('authStore 인터페이스 불일치: useAuthStore 훅/스토어가 없음');
          addTrace('auth.import.invalid', {
            type: typeof resolvedAuthStore,
          });
          return;
        }

        setAuthStore(() => resolvedAuthStore);
        setAuthStatus('authStore 로드 완료');
        addTrace('auth.import.success', {
          api: hasStoreApi(resolvedAuthStore) ? 'store-api' : 'hook',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'authStore 로드 실패';
        setAuthStatus(`authStore 로드 실패: ${message}`);
        addTrace('auth.import.failed', { message });
      }
    })();

    return () => {
      mounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [addTrace, recordCount]);

  useEffect(() => {
    if (!authStore) {
      return;
    }

    if (!hasStoreApi(authStore)) {
      if (typeof authStore !== 'function') {
        setAuthStatus('authStore 인터페이스 불일치: 함수가 아닙니다.');
        addTrace('auth.binding.invalid', {
          type: typeof authStore,
        });
      }
      return;
    }

    const unsubscribeAuth = authStore.subscribe((state) => {
      applyAuthState(state);
    });

    const currentState = authStore.getState?.();
    if (currentState) {
      applyAuthState(currentState);

      if (typeof currentState.initAuthListener === 'function') {
        const unsubscribe = currentState.initAuthListener();
        setAuthStatus('인증 리스너 초기화 중');
        addTrace('auth.listener.called', {
          mode: 'store-api',
        });

        return () => {
          unsubscribeAuth?.();
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      }
    }

    return () => {
      unsubscribeAuth?.();
    };
  }, [applyAuthState, authStore, addTrace]);

  const shouldUseObserver =
    typeof authStore === 'function' && !hasStoreApi(authStore);

  const runSignIn = async () => {
    if (!hasStoreApi(authStore)) {
      setAuthActionError('authStore 객체 모드가 아닙니다.');
      return;
    }

    const signInWithGoogle = authStore.getState?.()?.signInWithGoogle;
    if (typeof signInWithGoogle !== 'function') {
      setAuthActionError('signInWithGoogle를 찾지 못했습니다.');
      return;
    }

    try {
      setAuthActionError('');
      addTrace('auth.action.signIn.start', {});
      await signInWithGoogle();
      addTrace('auth.action.signIn.success', {
        uid: authStore.getState?.()?.user?.uid ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isPermissionError(message)) {
        setAuthActionError(message);
      } else {
        setAuthActionError('');
      }
      addTrace('auth.action.signIn.failed', { message });
    }
  };

  const runSignOut = async () => {
    if (!hasStoreApi(authStore)) {
      setAuthActionError('authStore 객체 모드가 아닙니다.');
      return;
    }

    const signOut = authStore.getState?.()?.signOut;
    if (typeof signOut !== 'function') {
      setAuthActionError('signOut를 찾지 못했습니다.');
      return;
    }

    try {
      setAuthActionError('');
      addTrace('auth.action.signOut.start', {});
      await signOut();
      addTrace('auth.action.signOut.success', {});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isPermissionError(message)) {
        setAuthActionError(message);
      } else {
        setAuthActionError('');
      }
      addTrace('auth.action.signOut.failed', { message });
    }
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #dce7ff',
    borderRadius: 16,
    padding: '18px 18px 16px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
  };

  const sectionMetaStyle = { display: 'grid', rowGap: 8 };

  const statusColor = (value) => {
    if (value === '성공') {
      return '#0f766e';
    }
    if (value === '실패') {
      return '#b91c1c';
    }
    return '#b45309';
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: '4px 12px',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    marginLeft: 8,
  };

  const actionButtonStyle = {
    border: 'none',
    color: 'white',
    padding: '10px 18px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  };

  const detailPreStyle = {
    whiteSpace: 'pre-wrap',
    background: '#f8fbff',
    border: '1px solid #e5edff',
    borderRadius: 12,
    padding: 12,
    margin: 0,
    color: '#0f172a',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.5,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 20,
        background: 'radial-gradient(circle at 10% 0%, #edf2ff 0%, #f8fbff 45%, #f0f8ff 100%)',
        fontFamily: 'Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", Arial, sans-serif',
      }}
    >
      {Initializer ? <Initializer onTrace={handleInitializerTrace} /> : null}
      {shouldUseObserver ? (
        <AuthStoreObserver useAuthStore={authStore} onAuthState={applyAuthState} />
      ) : null}

      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 0,
            letterSpacing: '-0.01em',
            color: '#0f172a',
            fontSize: 32,
            lineHeight: 1.2,
          }}
        >
          sharedEmotionStore 외부 도메인 연결 테스트
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: '#0f172a' }}>연결 상태</h2>
            <div style={sectionMetaStyle}>
              <div>
                <strong>RemoteEntry</strong>
                <div
                  style={{
                    fontSize: 12,
                    color: '#334155',
                    wordBreak: 'break-all',
                    marginTop: 6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  }}
                >
                  {HOST_REMOTE_URL}
                </div>
              </div>
              <div>
                <strong>Auth Remote</strong>
                <div
                  style={{
                    fontSize: 12,
                    color: '#334155',
                    wordBreak: 'break-all',
                    marginTop: 6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  }}
                >
                  {AUTH_REMOTE_URL}
                </div>
              </div>
              <div>
                <strong>상태</strong>
                <span style={{ ...chipStyle, background: statusColor(status) }}>{status}</span>
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: '#0f172a' }}>인증 상태</h2>
            <div style={sectionMetaStyle}>
              <div>
                <strong>로그인 사용자</strong> {formatUser(authUser)}
              </div>
              <div>
                <strong>로그인 상태</strong> {authStatus}
              </div>
              <div>
                <strong>authStore 객체</strong> {hasStoreApi(authStore) ? 'yes' : 'no'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
              <button
                type="button"
                onClick={runSignIn}
                disabled={!hasStoreApi(authStore)}
                style={{
                  ...actionButtonStyle,
                  background: '#2563eb',
                  cursor: !hasStoreApi(authStore) ? 'not-allowed' : 'pointer',
                  opacity: !hasStoreApi(authStore) ? 0.55 : 1,
                }}
              >
                Google 로그인
              </button>
              <button
                type="button"
                onClick={runSignOut}
                disabled={!hasStoreApi(authStore) || !authUser}
                style={{
                  ...actionButtonStyle,
                  background: '#0f172a',
                  cursor: !hasStoreApi(authStore) || !authUser ? 'not-allowed' : 'pointer',
                  opacity: !hasStoreApi(authStore) || !authUser ? 0.55 : 1,
                }}
              >
                로그아웃
              </button>
            </div>
            {authActionError && (
              <p style={{ color: '#b91c1c', marginTop: 10, marginBottom: 0 }}>
                로그인 동작 오류: {authActionError}
              </p>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: '#0f172a' }}>실행 요약</h2>
            <div style={sectionMetaStyle}>
              <div>
                <strong>현재 레코드 수</strong> {recordCount}
              </div>
              <div>
                <strong>현재 상태</strong> {status}
              </div>
              <div>
                <strong>상태 상세</strong>{' '}
                {status === '실패' ? error : '정상'}
              </div>
            </div>
          </section>
        </div>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: '#0f172a' }}>이번 주 스토어 레코드</h2>
          <p style={{ marginTop: 0, marginBottom: 10 }}>
            <strong>이번 주 payload:</strong> {rawPayload}
          </p>
          <p style={{ marginTop: 0, marginBottom: 10 }}>
            <strong>이번 주 레코드 수:</strong> {recordCount}
          </p>
          <pre style={detailPreStyle}>{formatRecords(records)}</pre>
        </section>

        {status === '실패' && (
          <section
            style={{
              ...cardStyle,
              background: '#fff2f2',
              border: '1px solid #ffd1d5',
              color: '#a10000',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 17, color: '#7f1d1d' }}>실패 상세</h2>
            <pre style={detailPreStyle}>{error}</pre>
          </section>
        )}

        <details
          style={{
            background: '#0b1020',
            borderRadius: 12,
            padding: 8,
          }}
        >
          <summary style={{ color: '#d7dcef', cursor: 'pointer', padding: 6 }}>실행 트레이스 (디버그)</summary>
          <pre
            style={{
              color: '#d7dcef',
              padding: 12,
              margin: '10px 0 0',
              maxHeight: 260,
              overflow: 'auto',
              borderRadius: 10,
              background: '#020617',
              whiteSpace: 'pre-wrap',
            }}
          >
            {JSON.stringify(traceEvents, null, 2)}
          </pre>
        </details>

        <p style={{ color: '#475569', marginTop: 4, marginBottom: 0, fontSize: 12 }}>
          CORS가 정상이라면 status가 <strong>성공</strong>으로 바뀌고 host의 remote 모듈이 로딩됩니다.
        </p>
      </div>
    </div>
  );
}
