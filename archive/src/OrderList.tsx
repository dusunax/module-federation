import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, Order } from 'products/orderStore';
import { useAuthStore } from 'auth/authStore';
import { subscribeToUserOrders } from 'auth/services/orderService';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

function OrderList() {
  const navigate = useNavigate();
  const ordersFromStore = useOrderStore((state) => state.orders);
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = React.useState<Order[]>(ordersFromStore || []);

  React.useEffect(() => {
    // keep local store in sync initially
    setOrders(ordersFromStore || []);
  }, [ordersFromStore]);

  React.useEffect(() => {
    if (!user || !user.uid) return;
    const unsubscribe = subscribeToUserOrders(user.uid, (dbOrders) => {
      setOrders(dbOrders as Order[] || []);
    });
    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);

  if (orders.length === 0) {
    return (
      <div className="max-w-225 mx-auto min-h-[60vh] px-5 py-10" aria-label="orders-empty">
        <div className="py-25 px-5 text-center">
          <div className="mb-8 text-[80px] leading-none opacity-50">📚</div>
          <h2 className="mb-4 text-2xl font-normal tracking-wider text-[#FFF8D4]">
            아직 기록된 감정이 없어요
          </h2>
          <p className="max-w-100 mx-auto my-0 text-sm font-normal leading-relaxed tracking-wide text-[rgba(255,248,212,0.7)]">
            순간들을 기억으로 남기면 여기에 기록돼요
          </p>
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

  return (
    <div className="max-w-225 mx-auto px-5 py-10">
      {/* 헤더 */}
      <div className="mb-10 border-b border-[rgba(255,248,212,0.15)] pb-6">
        <h1 className="m-0 mb-2 text-[28px] font-normal tracking-wider text-[#FFF8D4]">감정 기록</h1>
        <p
          className="m-0 text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]"
          aria-label="orders-count"
        >
          {orders.length}개의 기록이 있어요
        </p>
      </div>

      {/* 기록 목록 */}
      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(EMOTION_STATUS.REMEMBERED);

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/archive/${order.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`order-card-${order.id}`}
              className="relative cursor-pointer rounded-lg border bg-[rgba(67,86,99,0.15)] p-3 md:p-4 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,248,212,0.25)] hover:bg-[rgba(67,86,99,0.25)]"
              style={{ borderColor: statusConfig.color }}
            >
              {/* 기록 날짜 */}
              <div className="mb-2 text-[12px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
                <span>

                {order.totalItems}개 감정 기록 | ⚡ {order.totalEnergy ?? 0} 에너지 사용
                </span>
                <span>
{formatDate(order.orderDate)} 
                </span>
              </div>

              {/* 기록 한 줄 요약 */}
              <div className="flex flex-nowrap items-center gap-3 border-t border-[rgba(255,248,212,0.1)] pt-3">
                <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
                  {order.items.map(({ product }) => {
                    return (
                      <span
                        key={product.id}
                        className="shrink-0 text-xl leading-none opacity-90"
                      >
                        {product.emoji}
                      </span>
                    );
                  })}
                  {order.items.length > 5 && (
                    <span className="shrink-0 text-[12px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
                      +{order.items.length - 5}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderList;
