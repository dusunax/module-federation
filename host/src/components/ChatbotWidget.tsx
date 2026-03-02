import { MessageCircle, X } from 'lucide-react';
import {
  useState,
  type ComponentType,
  isValidElement,
  type ReactElement,
} from 'react';

type RemoteModule = Record<string, unknown>;

const toReactComponent = (value: unknown): ComponentType => {
  if (typeof value === 'function') {
    return value as ComponentType;
  }

  if (isValidElement(value)) {
    const element = value as ReactElement;
    return () => element;
  }

  if (value && typeof value === 'object') {
    const module = value as RemoteModule;
    if ('default' in module) return toReactComponent(module.default);
    if ('Chatbot' in module) return toReactComponent(module.Chatbot);
  }

  throw new Error('Invalid chatbot remote module shape');
};

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [Chatbot, setChatbot] = useState<ComponentType | null>(null);

  const loadChatbot = async () => {
    if (loading || Chatbot) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setErrorMessage(null);

    try {
      const module = await import('chatbot/Chatbot');
      const NextChatbot = toReactComponent(module as unknown);
      setChatbot(() => NextChatbot);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[chatbot] failed to load remote', error);
      setErrorMessage('챗봇을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={loadChatbot}
        aria-label="챗봇 열기"
        title="챗봇 열기"
        className="fixed right-4 bottom-4 z-[10000] flex h-20 w-20 items-center justify-center rounded-full border-0  to-[#667eea] from-[#764ba2] bg-gradient-to-br cursor-pointer text-2xl shadow-2xl font-semibold text-white"
      >
        <MessageCircle size='32' />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-[2147483647] flex h-[520px] w-[380px] flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="챗봇 닫기"
          title="닫기"
          className="absolute right-1 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/90 text-white transition duration-150  cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-1 rounded-xl">
        {loading ? (
          <div className="p-3">챗봇 로딩 중...</div>
        ) : errorMessage ? (
          <div className="p-3 text-red-600">{errorMessage}</div>
        ) : Chatbot ? (
          <Chatbot />
        ) : (
          <div className="p-3">챗봇을 준비 중...</div>
        )}
      </div>
    </div>
  );
}

export default ChatbotWidget;
