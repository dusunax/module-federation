import { useEffect } from 'react';
import { useAuthStore } from 'auth/authStore';
import { useRememberingStore } from 'auth/rememberingStore';

export function useRememberingSync() {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const initializeListener = useRememberingStore((state) => state.initializeListener);
  const cleanup = useRememberingStore((state) => state.cleanup);

  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      initializeListener(user.uid);
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [user?.uid, authLoading, initializeListener, cleanup]);
}
