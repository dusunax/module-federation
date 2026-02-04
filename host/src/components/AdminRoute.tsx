import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from 'auth/authStore';

interface AdminRouteProps {
  children: ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-green)] border-t-transparent" />
          <p className="text-[var(--color-text-secondary)]">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
