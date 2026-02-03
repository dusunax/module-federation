import React from 'react';
import { Toaster } from 'sonner';

// Shared toaster host used by the host app. Placed bottom-right to avoid covering content.
export default function ToastHost() {
  return <Toaster position="bottom-right" richColors />;
}
