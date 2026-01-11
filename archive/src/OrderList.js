import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from 'products/orderStore';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

function OrderList() {
  const navigate = useNavigate();
  const orders = useOrderStore((state) => state.orders);

  if (orders.length === 0) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '60vh' }}>
        <div style={{
          textAlign: 'center',
          padding: '100px 20px',
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '32px',
            opacity: 0.5,
            lineHeight: 1,
          }}>📚</div>
          <h2 style={{
            fontWeight: 300,
            letterSpacing: '1px',
            marginBottom: '16px',
            color: '#FFF8D4',
            fontSize: '24px',
          }}>
            아직 기록된 감정이 없어요
          </h2>
          <p style={{
            color: 'rgba(255, 248, 212, 0.7)',
            fontSize: '14px',
            fontWeight: 300,
            letterSpacing: '0.3px',
            lineHeight: 1.6,
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            순간들을 기억으로 남기면 여기에 기록돼요
          </p>
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

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{
        marginBottom: '40px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 248, 212, 0.15)',
      }}>
        <h1 style={{
          margin: 0,
          fontWeight: 300,
          letterSpacing: '1px',
          color: '#FFF8D4',
          fontSize: '28px',
          marginBottom: '8px',
        }}>
          감정 기록
        </h1>
        <p style={{
          margin: 0,
          color: 'rgba(255, 248, 212, 0.7)',
          fontSize: '13px',
          fontWeight: 300,
          letterSpacing: '0.3px',
        }}>
          {orders.length}개의 기록이 있어요
        </p>
      </div>

      {/* 기록 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.map((order) => {
          const statusConfig = getStatusConfig(EMOTION_STATUS.REMEMBERED);
          
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/archive/${order.id}`)}
              style={{
                padding: "32px",
                background: "rgba(67, 86, 99, 0.15)",
                border: "1px solid rgba(255, 248, 212, 0.15)",
                border: `1px solid ${statusConfig.color}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
                position: "relative",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(67, 86, 99, 0.25)";
                e.currentTarget.style.borderColor = "rgba(255, 248, 212, 0.25)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(67, 86, 99, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 248, 212, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* 상태 배지 */}
              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "rgba(67, 86, 99, 0.4)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: statusConfig.color,
                  fontWeight: 300,
                  letterSpacing: "0.3px",
                }}
              >
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.label}</span>
              </div>

              {/* 기록 날짜 */}
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 248, 212, 0.7)",
                  fontWeight: 300,
                  marginBottom: "20px",
                  letterSpacing: "0.3px",
                }}
              >
                {formatDate(order.orderDate)}
              </div>

              {/* 기록된 순간들 미리보기 */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {order.items.slice(0, 6).map(({ product }) => (
                  <div
                    key={product.id}
                    style={{
                      fontSize: "32px",
                      opacity: 0.9,
                      lineHeight: 1,
                    }}
                  >
                    {product.emoji}
                  </div>
                ))}
                {order.items.length > 6 && (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 248, 212, 0.7)",
                      fontWeight: 300,
                      letterSpacing: "0.3px",
                    }}
                  >
                    +{order.items.length - 6}개
                  </span>
                )}
              </div>

              {/* 기록 요약 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 248, 212, 0.1)",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "13px",
                      color: "rgba(255, 248, 212, 0.7)",
                      fontWeight: 300,
                      letterSpacing: "0.3px",
                    }}
                  >
                    기록된 순간
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      color: "#FFF8D4",
                      fontWeight: 300,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {order.totalItems}개
                  </p>
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
