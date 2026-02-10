import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderStore } from 'products/orderStore';
import { useAuthStore } from 'auth/authStore';
import { getUserOrderById } from 'auth/services/orderService';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';
import BackButton from '@shared/components/BackButton';
import { CATEGORY_LABELS } from '@shared/constants/categories';

function OrderDetail() {
  const { orderId } = useParams();
  const getOrder = useOrderStore((state) => state.getOrder);
  const user = useAuthStore((state) => state.user);

  const [order, setOrder] = React.useState(() => getOrder(Number(orderId)));

  React.useEffect(() => {
    const local = getOrder(Number(orderId));
    if (local) {
      setOrder(local);
      return;
    }

    if (!user?.uid || !orderId) return;
    getUserOrderById(user.uid, orderId)
      .then((result) => {
        if (result) setOrder(result as typeof local);
      })
      .catch((err) => {
        console.error('Failed to fetch order by id:', err);
      });
  }, [orderId, user?.uid, getOrder]);


  if (!order) {
    return (
      <div className="max-w-225 mx-auto px-5 py-10" aria-label="order-not-found">
        <BackButton to="/archive" label="기록 목록으로" className="mb-5" />
        <div className="px-5 py-20 text-center text-[#FFF8D4]">
          <div className="mb-6 text-[64px] opacity-50">📝</div>
          <p className="text-base font-normal tracking-wide">기록을 찾을 수 없어요</p>
        </div>
      </div>
    );
  }

  const formatDate = (value: { toDate?: () => Date } | string | number) => {
    const date =
      typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : value?.toDate
          ? value.toDate()
          : new Date();
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
    <div className="max-w-225 mx-auto px-5 py-10">
      <div className="mb-7.5 flex items-center justify-between">
        <BackButton to="/archive" label="기록 목록으로" />
        <div />
      </div>

      {/* 기록 정보 */}
      <div
        className="rounded-lg border bg-[rgba(67,86,99,0.15)] p-5 md:p-8"
        style={{ borderColor: statusConfig.color }}
      >
        <div className='flex mb-6'>
          <div className="flex items-start justify-between">
            <h1 className="mb-4 text-2xl font-normal tracking-wider text-[#FFF8D4]">
              기록 상세
            </h1>
          </div>
          <div className="flex flex-col flex-1 items-end">
            <div className="text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
              {formatDate(order.orderDate)}
            </div>
            <p className="text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
              총 기록된 순간
            </p>
            <p className="text-lg font-normal tracking-wide text-[#FFF8D4]">
              {order.totalItems}개
            </p>
          </div>
        </div>

        {/* 기록된 순간들 */}
        <ul className="flex flex-col gap-4">
          {order.items.map(({ product, quantity }) => {
            const categoryLabel = product.category
              ? CATEGORY_LABELS[product.category] ?? product.category
              : '';
            return (
              <li
                key={product.id}
                aria-label={`order-item-${product.id}`}
                className="flex flex-wrap gap-4 md:gap-6 rounded-lg border border-[rgba(255,248,212,0.15)] bg-[rgba(67,86,99,0.15)] p-4 md:p-6 backdrop-blur-[10px] transition-all duration-300 hover:border-[rgba(255,248,212,0.25)] hover:bg-[rgba(67,86,99,0.25)]"
              >
                {/* 이모지 */}
                <div className="shrink-0 text-[40px] md:text-[56px] leading-none opacity-90">
                  {product.emoji}
                </div>

                {/* 상품 정보 */}
                <div className="min-w-0 flex-1">
                  <h3 className="my-0 mb-2 text-lg font-normal leading-snug tracking-wide text-[#FFF8D4]">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="my-0 mb-3 text-sm font-normal leading-relaxed tracking-[0.2px] text-[rgba(255,248,212,0.8)]">
                      {product.description}
                    </p>
                  )}
                  {categoryLabel && (
                    <div className="inline-block rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(163,176,135,0.15)] px-2.5 py-1 text-[11px] font-normal tracking-wide text-[#A3B087]">
                      {categoryLabel}
                    </div>
                  )}
                </div>

                {/* 수량 */}
                <div className="flex h-fit items-center gap-2 rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2 text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.9)]">
                  {quantity}개
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default OrderDetail;
