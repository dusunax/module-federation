import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from 'auth/authStore';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-green)] border-t-transparent mx-auto" />
          <p className="text-[var(--color-text-secondary)]">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
