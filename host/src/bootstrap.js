import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './mocks/browser';

// MSW 시작 후 앱 렌더링
worker
  .start({
    onUnhandledRequest: 'bypass',
  })
  .then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  });
