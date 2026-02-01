import React from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'sonner';

// Small presentational centered confirmation dialog used inside toast.custom
// Uses portal to escape sonner's transform container and render at viewport center
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4 backdrop-blur-sm">
        {title && <div className="text-sm font-light tracking-wide text-[#FFF8D4]">{title}</div>}
        {description && <div className="text-xs font-light text-[#A3B087]">{description}</div>}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              if (typeof toast === 'function') {
                // fallback
                toast.dismiss();
              } else {
                // sonner exposes dismiss on the imported toast
                toast.dismiss && toast.dismiss();
              }
              onCancel && onCancel();
            }}
            className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.5)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(67,86,99,0.7)]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              if (typeof toast === 'function') {
                toast.dismiss();
              } else {
                toast.dismiss && toast.dismiss();
              }
              onConfirm && onConfirm();
            }}
            className="cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(163,176,135,0.5)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
