import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOrderStore } from "products/orderStore";
import { getStatusConfig, EMOTION_STATUS } from "products/utils/statusStyle";

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const getOrder = useOrderStore((state) => state.getOrder);
  const removeOrder = useOrderStore((state) => state.removeOrder);

  const order = getOrder(Number(orderId));

  const handleForget = () => {
    toast.custom((t) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          background: "rgba(67, 86, 99, 0.95)",
          border: "1px solid rgba(163, 176, 135, 0.3)",
          borderRadius: "8px",
          minWidth: "300px",
        }}
      >
        <div
          style={{
            color: "#FFF8D4",
            fontSize: "14px",
            fontWeight: 300,
            letterSpacing: "0.3px",
          }}
        >
          정말로 잊고 싶어요?
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => {
              toast.dismiss(t);
            }}
            style={{
              padding: "8px 16px",
              background: "rgba(67, 86, 99, 0.5)",
              color: "#FFF8D4",
              border: "1px solid rgba(255, 248, 212, 0.2)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 300,
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(67, 86, 99, 0.7)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(67, 86, 99, 0.5)";
            }}
          >
            취소
          </button>
          <button
            onClick={() => {
              removeOrder(Number(orderId));
              toast.dismiss(t);
              toast.success("기억이 삭제되었습니다.");
              navigate("/archive");
            }}
            style={{
              padding: "8px 16px",
              background: "rgba(163, 176, 135, 0.3)",
              color: "#FFF8D4",
              border: "1px solid rgba(163, 176, 135, 0.5)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 300,
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(163, 176, 135, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(163, 176, 135, 0.3)";
            }}
          >
            잊기
          </button>
        </div>
      </div>
    ));
  };

  if (!order) {
    return (
      <div
        style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}
      >
        <button
          onClick={() => navigate("/archive")}
          style={{
            marginBottom: "20px",
            padding: "10px 18px",
            fontSize: "13px",
            background: "rgba(67, 86, 99, 0.3)",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#FFF8D4",
            fontWeight: 300,
            letterSpacing: "0.3px",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.4)";
            e.target.style.borderColor = "#A3B087";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.3)";
            e.target.style.borderColor = "rgba(255, 248, 212, 0.2)";
          }}
        >
          ← 기록 목록으로
        </button>
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#FFF8D4",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "24px",
              opacity: 0.5,
            }}
          >
            📝
          </div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 300,
              letterSpacing: "0.3px",
            }}
          >
            기록을 찾을 수 없어요
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusConfig = getStatusConfig(EMOTION_STATUS.REMEMBERED);

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => navigate("/archive")}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            background: "rgba(67, 86, 99, 0.3)",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#FFF8D4",
            fontWeight: 300,
            letterSpacing: "0.3px",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.4)";
            e.target.style.borderColor = "#A3B087";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.3)";
            e.target.style.borderColor = "rgba(255, 248, 212, 0.2)";
          }}
        >
          ← 기록 목록으로
        </button>
        <button
          onClick={handleForget}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            background: "rgba(67, 86, 99, 0.3)",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#FFF8D4",
            fontWeight: 300,
            letterSpacing: "0.3px",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.4)";
            e.target.style.borderColor = "#A3B087";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(67, 86, 99, 0.3)";
            e.target.style.borderColor = "rgba(255, 248, 212, 0.2)";
          }}
        >
          잊기
        </button>
      </div>

      {/* 기록 정보 */}
      <div
        style={{
          padding: "32px",
          background: "rgba(67, 86, 99, 0.15)",
          border: `1px solid ${statusConfig.color}`,
          borderRadius: "8px",
          marginBottom: "32px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 16px 0",
                fontWeight: 300,
                letterSpacing: "1px",
                color: "#FFF8D4",
                fontSize: "24px",
              }}
            >
              기록 상세
            </h1>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255, 248, 212, 0.7)",
                fontWeight: 300,
                letterSpacing: "0.3px",
              }}
            >
              {formatDate(order.orderDate)}
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: "rgba(67, 86, 99, 0.4)",
              borderRadius: "4px",
              fontSize: "12px",
              color: statusConfig.color,
              fontWeight: 300,
              letterSpacing: "0.3px",
            }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* 기록된 순간들 */}
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h2
          style={{
            fontWeight: 300,
            letterSpacing: "0.5px",
            marginBottom: "24px",
            color: "#FFF8D4",
            fontSize: "20px",
          }}
        >
          기록된 순간들
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {order.items.map(({ product, quantity }) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                gap: "24px",
                padding: "24px",
                background: "rgba(67, 86, 99, 0.15)",
                border: "1px solid rgba(255, 248, 212, 0.15)",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(67, 86, 99, 0.25)";
                e.currentTarget.style.borderColor = "rgba(255, 248, 212, 0.25)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(67, 86, 99, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 248, 212, 0.15)";
              }}
            >
              {/* 이모지 */}
              <div
                style={{
                  fontSize: "56px",
                  lineHeight: 1,
                  opacity: 0.9,
                  flexShrink: 0,
                }}
              >
                {product.emoji}
              </div>

              {/* 상품 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    fontWeight: 300,
                    color: "#FFF8D4",
                    letterSpacing: "0.3px",
                    lineHeight: 1.4,
                  }}
                >
                  {product.name}
                </h3>
                {product.description && (
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      color: "rgba(255, 248, 212, 0.8)",
                      fontWeight: 300,
                      fontSize: "14px",
                      letterSpacing: "0.2px",
                      lineHeight: 1.6,
                    }}
                  >
                    {product.description}
                  </p>
                )}
                {product.category && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      background: "rgba(163, 176, 135, 0.15)",
                      border: "1px solid rgba(163, 176, 135, 0.3)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "#A3B087",
                      fontWeight: 300,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {product.category}
                  </div>
                )}
              </div>

              {/* 수량 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(67, 86, 99, 0.3)",
                  border: "1px solid rgba(255, 248, 212, 0.2)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "rgba(255, 248, 212, 0.9)",
                  fontWeight: 300,
                  letterSpacing: "0.3px",
                  height: "fit-content",
                }}
              >
                {quantity}회
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 기록 요약 */}
      <div
        style={{
          padding: "32px",
          background: "rgba(67, 86, 99, 0.15)",
          borderRadius: "8px",
          border: "1px solid rgba(163, 176, 135, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "rgba(255, 248, 212, 0.7)",
              fontWeight: 300,
              letterSpacing: "0.3px",
            }}
          >
            총 기록된 순간
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
}

export default OrderDetail;
