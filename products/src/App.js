import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@shared/components/AppLayout';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import './styles/tailwind.css';

function App() {
  return (
    <AppLayout subtitle="Like Real People Do - 독립 실행 모드 (포트 3002)">
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/detail/:id" element={<ProductDetail />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
