import { useEffect } from 'react';
import { XIcon } from 'lucide-react';
import SharedEmotionStoreExample from './SharedEmotionStoreExample';

interface SharedEmotionStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SharedEmotionStoreModal({ isOpen, onClose }: SharedEmotionStoreModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="공유 스토어 예시"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="공유 스토어 예시 닫기"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-dark)] text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-overlay-3)]"
        >
          <XIcon className="h-4 w-4" />
        </button>
        <div className="max-h-[85vh] overflow-auto p-2 sm:p-3">
          <SharedEmotionStoreExample />
        </div>
      </div>
    </div>
  );
}

export default SharedEmotionStoreModal;
