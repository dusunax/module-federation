import React from 'react';
import Header from './Header';

function App() {
  return (
    <div>
      <Header />
      <div style={{ padding: '20px' }}>
        <h2>Header 독립 실행 모드</h2>
        <p>이 앱은 독립적으로 실행되거나 다른 앱에 통합될 수 있습니다.</p>
      </div>
    </div>
  );
}

export default App;
