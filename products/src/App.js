import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';

function App() {
  return (
    <div>
      <header style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0 }}>🌿 Greenary</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          독립 실행 모드 (포트 3002)
        </p>
      </header>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/detail/:id" element={<ProductDetail />} />
      </Routes>

      <footer style={{
        padding: '20px',
        marginTop: '40px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
          이 앱은 독립적으로 실행되거나 다른 앱에 통합될 수 있습니다.
        </p>
      </footer>
    </div>
  );
}

export default App;
