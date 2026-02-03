import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './mocks/browser';
import { useAuthStore } from 'auth/authStore';

// MSW 시작 후 앱 렌더링
worker
  .start({
    onUnhandledRequest: 'bypass',
  })
  .then(() => {
    // Firebase Auth 리스너 초기화
    useAuthStore.getState().initAuthListener();

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  });
