import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@shared/components/AppLayout';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import './styles/tailwind.css';

function App() {
  return (
    <AppLayout subtitle="Booked by Feelings Archive - 독립 실행 모드 (포트 3004)">
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path="/archive/:orderId" element={<OrderDetail />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
