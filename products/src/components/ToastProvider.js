import React from 'react';
import { Toaster } from 'sonner';

// Toaster를 제공하는 컴포넌트
// host 앱에서 import하여 사용
function ToastProvider() {
  return <Toaster position="top-center" richColors />;
}

export default ToastProvider;
