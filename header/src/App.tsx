import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@shared/components/AppLayout';
import Header from './Header';
import './styles/tailwind.css';

function App() {
  return (
    <AppLayout subtitle="Booked by Feelings Header - 독립 실행 모드 (포트 3001)">
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/cart" element={<Header />} />
        <Route path="/archive" element={<Header />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
