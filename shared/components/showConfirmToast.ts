import React from 'react';
import { toast } from 'sonner';
import ConfirmDialog, { ConfirmDialogProps } from './ConfirmDialog';

export type ConfirmToastOptions = ConfirmDialogProps;

export default function showConfirmToast(options: ConfirmToastOptions) {
  const { title, description, confirmLabel, cancelLabel, onConfirm, onCancel } = options || {};
  // keep the toast until user interacts (use 0 so sonner treats it as persistent)
  toast.custom(
    (t) =>
      React.createElement(ConfirmDialog, {
        title,
        description,
        confirmLabel,
        cancelLabel,
        onConfirm: () => onConfirm && onConfirm(),
        onCancel: () => onCancel && onCancel(),
      }),
    { duration: 0 }
  );
}
