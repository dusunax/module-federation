import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getEnv = (key: string) => {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[`VITE_${key}`];

  if (!value) {
    throw new Error(`[firebase] Missing required environment variable: VITE_${key}`);
  }

  return value;
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 사용자 재접속/새로고침 시 로그인 상태가 유지되도록 명시적으로 로컬 지속성 설정
void setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Firebase auth persistence 설정 실패:', error);
});

export { app, auth, db };
