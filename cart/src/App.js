import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@shared/components/AppLayout';
import Cart from './Cart';
import './styles/tailwind.css';

function App() {
  return (
    <AppLayout subtitle="Cart - 독립 실행 모드 (포트 3003)">
      <Routes>
        <Route path="/" element={<Cart />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
