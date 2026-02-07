import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from './store/cartStore';
import { useRememberingStore } from 'auth/rememberingStore';
import { useOrderStore } from './store/orderStore';
import { getStatusConfig } from './utils/statusStyle';
import { EMOTION_STATUS } from './constants';
import { getEmotionById, Emotion } from 'auth/services/emotionService';
import BackButton from '@shared/components/BackButton';

interface RouteParams {
  id: string;
  [key: string]: string | undefined;
}

const CATEGORY_LABELS: Record<string, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '두려움',
  disgust: '혐오',
  surprise: '놀람',
  trust: '신뢰',
  love: '사랑',
  obsession: '집착',
  anxiety: '불안',
  jealousy: '질투',
  disappointment: '실망',
  contempt: '경멸',
  discouragement: '낙담',
  guilt: '죄책감',
  hope: '희망',
};

function ProductDetail(): React.ReactElement {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();

  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);

  // 장바구니에 추가 핸들러
  const handleAddToCart = () => {
    if (!emotion) return;
    addToCart(emotion);
    // 추가 후 현재 수량 확인 (기억하는 중인 아이템 제외, 일반 장바구니 아이템만)
    const cartState = useCartStore.getState();
    const rememberingState = useRememberingStore.getState();
    const rememberingItemIds = Object.keys(rememberingState.rememberingItems).map(Number);

    const normalQuantity = Object.values(cartState.items)
      .filter((item) => item.product.id === emotion.id && !rememberingItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
    toast.success(`이 순간이 ${normalQuantity}만큼 담겨있어요`);
  };

  const {
    data: emotion,
    isLoading,
    error,
  } = useQuery<Emotion, Error>({
    queryKey: ['emotion', id],
    queryFn: () => getEmotionById(Number(id)),
  });

  // 같은 productId를 가진 아이템이 있는지 확인
  const isInCart = emotion && Object.values(items).some((item) => item.product.id === emotion.id);

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <p className="font-normal text-[#FFF8D4]">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-[#FFF8D4]">
        <p>에러: {error.message}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-5 cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-6 py-3 text-sm font-normal text-[#FFF8D4]"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Prefer DB-driven status if available
  const dbStatus = emotion?.id ? orderStatuses?.[emotion.id] : undefined;
  const currentStatus = dbStatus
    ? dbStatus
    : isInCart
      ? EMOTION_STATUS.HELD
      : emotion?.status || EMOTION_STATUS.NOTICING;
  const statusStyle = getStatusConfig(currentStatus);
  const categoryLabel = emotion?.category ? CATEGORY_LABELS[emotion.category] ?? emotion.category : '';

  return (
    <div className="mx-auto max-w-[900px] p-5">
      {/* 뒤로가기 버튼 */}
      <BackButton to="/" label="목록으로" className="mb-6" />

      {/* 순간 상세 정보 */}
      <div className="rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.2)] p-10 backdrop-blur-[10px]">
        <div className="mb-10 flex flex-wrap gap-10">
          {/* 이모지 영역 */}
          <div className="flex-[0_0_180px] text-center">
            <div className="mb-4 text-[100px] leading-none opacity-90">{emotion?.emoji}</div>
            {/* 상태 표시 */}
            <div
              className={` rounded-sm border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-3 py-1.5 text-[11px] font-normal tracking-wider ${statusStyle.label ? 'inline-block' : 'hidden'}`}
              style={{ color: statusStyle.color }}
            >
              {statusStyle.label}
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="min-w-[300px] flex-1">
            <h1 className="mb-4 mt-0 text-[28px] font-normal leading-snug tracking-wider text-[#FFF8D4]">
              {emotion?.name}
            </h1>
            <p className="mb-5 text-lg font-normal tracking-wide text-[#A3B087]">
              ⚡ {emotion?.energyCost} 에너지
            </p>
            <span className="mb-5 inline-block rounded-sm bg-[rgba(67,86,99,0.3)] px-3.5 py-1.5 text-xs font-normal tracking-wider text-[rgba(255,248,212,0.9)]">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-[30px]">
          <h2 className="mb-3 text-base font-normal tracking-wider text-[#FFF8D4]">설명</h2>
          <p className="text-[15px] font-normal leading-[1.8] text-[rgba(255,248,212,0.9)]">
            {emotion?.description}
          </p>
        </div>

        {/* 상황 스토리 */}
        <div className="mb-[30px]">
          <h2 className="mb-3 text-base font-normal tracking-wider text-[#FFF8D4]">상황 스토리</h2>
          <div className="rounded border-l-2 border-[#A3B087] bg-[rgba(67,86,99,0.3)] p-6">
            <p className="m-0 text-[15px] font-normal italic leading-[1.9] text-[#FFF8D4]">
              "{emotion?.story}"
            </p>
          </div>
        </div>

        {/* 장바구니 추가 버튼 */}
        <div className="flex gap-3">
          <button
            className="flex-1 cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-4 text-[15px] font-normal tracking-wider text-[#FFF8D4] transition-all duration-300 hover:border-[rgba(163,176,135,0.7)] hover:bg-[rgba(163,176,135,0.5)]"
            onClick={handleAddToCart}
            aria-label="product-add-to-cart"
          >
            {isInCart ? '더 담기' : '담기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
