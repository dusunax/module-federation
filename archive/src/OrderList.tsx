import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderStore, Order } from 'products/orderStore';
import { useAuthStore } from 'auth/authStore';
import { subscribeToUserOrders, deleteUserOrder } from 'auth/services/orderService';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';
import showConfirmToast from '@shared/components/showConfirmToast';

function OrderList() {
  const navigate = useNavigate();
  const ordersFromStore = useOrderStore((state) => state.orders);
  const removeOrder = useOrderStore((state) => state.removeOrder);
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = React.useState<Order[]>(ordersFromStore || []);

  React.useEffect(() => {
    // keep local store in sync initially
    setOrders(ordersFromStore || []);
  }, [ordersFromStore]);

  React.useEffect(() => {
    if (!user || !user.uid) return;
    const unsubscribe = subscribeToUserOrders(user.uid, (dbOrders) => {
      setOrders(dbOrders || []);
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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
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
      <div className="flex flex-col gap-6">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(EMOTION_STATUS.REMEMBERED);

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/archive/${order.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`order-card-${order.id}`}
              className="relative cursor-pointer rounded-lg border bg-[rgba(67,86,99,0.15)] p-8 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,248,212,0.25)] hover:bg-[rgba(67,86,99,0.25)]"
              style={{ borderColor: statusConfig.color }}
            >
              {/* 상태 배지 */}
              <div
                className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded bg-[rgba(67,86,99,0.4)] px-3 py-1.5 text-[11px] font-normal tracking-wide"
                style={{ color: statusConfig.color }}
              >
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.label}</span>
              </div>

              {/* 기록 날짜 */}
              <div className="mb-5 text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
                {formatDate(order.orderDate)}
              </div>

              {/* 기록된 순간들 미리보기 */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {order.items.slice(0, 6).map(({ product }) => (
                  <div key={product.id} className="text-[32px] leading-none opacity-90">
                    {product.emoji}
                  </div>
                ))}
                {order.items.length > 6 && (
                  <span className="text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
                    +{order.items.length - 6}개
                  </span>
                )}
              </div>

              {/* 기록 요약 */}
              <div className="flex items-center justify-between border-t border-[rgba(255,248,212,0.1)] pt-5">
                <div>
                  <p className="my-0 mb-1 text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
                    기록된 순간
                  </p>
                  <p className="m-0 text-lg font-normal tracking-wide text-[#FFF8D4]">
                    {order.totalItems}개
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirmToast({
                      title: '정말로 삭제하시겠어요?',
                      confirmLabel: '삭제',
                      cancelLabel: '취소',
                      onConfirm: async () => {
                        try {
                          const userObj = useAuthStore.getState().user;
                          if (userObj && userObj.uid) {
                            await deleteUserOrder(userObj.uid, order.id);
                          } else {
                            removeOrder(Number(order.id));
                          }
                          toast.success('기억이 삭제되었습니다.');
                        } catch (err) {
                          console.error('Failed to delete order:', err);
                          toast.error('삭제 실패');
                        }
                      },
                    });
                  }}
                  aria-label={`order-forget-${order.id}`}
                  className="cursor-pointer rounded border border-[rgba(229,115,115,0.3)] bg-[rgba(229,115,115,0.1)] px-3.5 py-2 text-xs font-normal tracking-wide text-[var(--color-text-danger)] transition-all duration-300 hover:bg-[rgba(229,115,115,0.2)]"
                >
                  잊기
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderList;
