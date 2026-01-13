import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderStore } from 'products/orderStore';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const getOrder = useOrderStore((state) => state.getOrder);
  const removeOrder = useOrderStore((state) => state.removeOrder);

  const order = getOrder(Number(orderId));

  const handleForget = () => {
    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">정말로 잊고 싶어요?</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t);
            }}
            className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.5)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(67,86,99,0.7)]"
          >
            취소
          </button>
          <button
            onClick={() => {
              removeOrder(Number(orderId));
              toast.dismiss(t);
              toast.success('기억이 삭제되었습니다.');
              navigate('/archive');
            }}
            className="cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(163,176,135,0.5)]"
          >
            잊기
          </button>
        </div>
      </div>
    ));
  };

  if (!order) {
    return (
      <div className="mx-auto max-w-[900px] px-5 py-10">
        <button
          onClick={() => navigate('/archive')}
          className="mb-5 cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2.5 text-[13px] font-light tracking-wide text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          ← 기록 목록으로
        </button>
        <div className="px-5 py-20 text-center text-[#FFF8D4]">
          <div className="mb-6 text-[64px] opacity-50">📝</div>
          <p className="text-base font-light tracking-wide">기록을 찾을 수 없어요</p>
        </div>
      </div>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = getStatusConfig(EMOTION_STATUS.REMEMBERED);

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-[30px] flex items-center justify-between">
        <button
          onClick={() => navigate('/archive')}
          className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2.5 text-[13px] font-light tracking-wide text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          ← 기록 목록으로
        </button>
        <button
          onClick={handleForget}
          className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2.5 text-[13px] font-light tracking-wide text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          잊기
        </button>
      </div>

      {/* 기록 정보 */}
      <div
        className="mb-8 rounded-lg border bg-[rgba(67,86,99,0.15)] p-8 backdrop-blur-[10px]"
        style={{ borderColor: statusConfig.color }}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="my-0 mb-4 text-2xl font-light tracking-wider text-[#FFF8D4]">
              기록 상세
            </h1>
            <div className="text-[13px] font-light tracking-wide text-[rgba(255,248,212,0.7)]">
              {formatDate(order.orderDate)}
            </div>
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded bg-[rgba(67,86,99,0.4)] px-4 py-2 text-xs font-light tracking-wide"
            style={{ color: statusConfig.color }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* 기록된 순간들 */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-light tracking-wider text-[#FFF8D4]">기록된 순간들</h2>

        <div className="flex flex-col gap-4">
          {order.items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-6 rounded-lg border border-[rgba(255,248,212,0.15)] bg-[rgba(67,86,99,0.15)] p-6 backdrop-blur-[10px] transition-all duration-300 hover:border-[rgba(255,248,212,0.25)] hover:bg-[rgba(67,86,99,0.25)]"
            >
              {/* 이모지 */}
              <div className="flex-shrink-0 text-[56px] leading-none opacity-90">
                {product.emoji}
              </div>

              {/* 상품 정보 */}
              <div className="min-w-0 flex-1">
                <h3 className="my-0 mb-2 text-lg font-light leading-snug tracking-wide text-[#FFF8D4]">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="my-0 mb-3 text-sm font-light leading-relaxed tracking-[0.2px] text-[rgba(255,248,212,0.8)]">
                    {product.description}
                  </p>
                )}
                {product.category && (
                  <div className="inline-block rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(163,176,135,0.15)] px-2.5 py-1 text-[11px] font-light tracking-wide text-[#A3B087]">
                    {product.category}
                  </div>
                )}
              </div>

              {/* 수량 */}
              <div className="flex h-fit items-center gap-2 rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2 text-[13px] font-light tracking-wide text-[rgba(255,248,212,0.9)]">
                {quantity}회
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 기록 요약 */}
      <div className="rounded-lg border border-[rgba(163,176,135,0.2)] bg-[rgba(67,86,99,0.15)] p-8 backdrop-blur-[10px]">
        <div className="mb-4 flex items-center justify-between">
          <p className="m-0 text-[13px] font-light tracking-wide text-[rgba(255,248,212,0.7)]">
            총 기록된 순간
          </p>
          <p className="m-0 text-lg font-light tracking-wide text-[#FFF8D4]">
            {order.totalItems}개
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
