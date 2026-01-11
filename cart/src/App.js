import React from 'react';
import Cart from './Cart';

function App() {
  return (
    <div>
      <h1 style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        Cart 독립 실행 모드
      </h1>
      <Cart />
      <div style={{ padding: '20px' }}>
        <p>이 앱은 독립적으로 실행되거나 다른 앱에 통합될 수 있습니다.</p>
      </div>
    </div>
  );
}

export default App;
