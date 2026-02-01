import React from 'react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

// options: { title, description, confirmLabel, cancelLabel, onConfirm, onCancel }
export default function showConfirmToast(options) {
  const { title, description, confirmLabel, cancelLabel, onConfirm, onCancel } = options || {};
  // keep the toast until user interacts (use 0 so sonner treats it as persistent)
  toast.custom(
    (t) => (
      <ConfirmDialog
        toastId={t?.id}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={() => onConfirm && onConfirm()}
        onCancel={() => onCancel && onCancel()}
      />
    ),
    { duration: 0 }
  );
}
