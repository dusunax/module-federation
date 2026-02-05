import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, loading, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>인증 상태 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl">Auth App</h1>
      {user ? (
        <div className="text-center">
          <p>로그인됨: {user.displayName}</p>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>로그인되지 않음</p>
      )}
    </div>
  );
}

export default App;
