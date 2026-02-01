import React from 'react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

// options: { title, description, confirmLabel, cancelLabel, onConfirm, onCancel }
export default function showConfirmToast(options) {
  const { title, description, confirmLabel, cancelLabel, onConfirm, onCancel } = options || {};
  // keep the toast until user interacts
  toast.custom(
    (t) => (
      <ConfirmDialog
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={() => onConfirm && onConfirm()}
        onCancel={() => onCancel && onCancel()}
      />
    ),
    { duration: Infinity }
  );
}
