import { useCallback, useEffect, useState } from 'react';

const HOST_REMOTE_URL =
  import.meta.env.VITE_HOST_REMOTE || 'https://dusunax-001.web.app/assets/remoteEntry.js';

const MAX_TRACE_LOGS = 120;
const getQueryUserId = () => {
  try {
    return new URLSearchParams(window.location.search).get('userId');
  } catch {
    return null;
  }
};

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

export default function App() {
  const [status, setStatus] = useState('로딩 중');
  const [error, setError] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  const [records, setRecords] = useState([]);
  const [rawPayload, setRawPayload] = useState('');
  const [queryUserId] = useState(() => getQueryUserId());
  const [Initializer, setInitializer] = useState(null);
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
      isHostLocalhost: getOrigin(HOST_REMOTE_URL).includes('localhost'),
      queryUserId: queryUserId ?? null,
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

    })();

    return () => {
      mounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [addTrace]);

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
                <strong>상태</strong>
                <span style={{ ...chipStyle, background: statusColor(status) }}>{status}</span>
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: '#0f172a' }}>인증 상태</h2>
            <div style={sectionMetaStyle}>
              <div>
                <strong>query userId</strong> {queryUserId ?? '(없음)'}
              </div>
              <div>
                <strong>감정 조회 userId</strong>{' '}
                {queryUserId ?? '(없음)'}
              </div>
            </div>
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
