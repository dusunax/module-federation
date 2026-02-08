import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAuthStore } from 'auth/authStore';

const startApp = () => {
  // Firebase Auth 리스너 초기화
  useAuthStore.getState().initAuthListener();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
};

startApp();
