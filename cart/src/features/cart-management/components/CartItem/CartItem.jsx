import React from "react";
import { toast } from "sonner";
import { getStatusConfig, EMOTION_STATUS } from "products/utils/statusStyle";

export function CartItem({
  product,
  quantity,
  orderStatuses,
  timeRemaining,
  item,
  itemId,
  updateQuantity,
  removeFromCart,
}) {
  const currentStatus = orderStatuses[product.id] || EMOTION_STATUS.HELD;
  const statusStyle = getStatusConfig(currentStatus);
  const timer = item?.addedAt ? timeRemaining[itemId] : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "24px",
        marginBottom: "16px",
        background: "rgba(67, 86, 99, 0.2)",
        border: "1px solid rgba(255, 248, 212, 0.2)",
        borderRadius: "4px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          opacity: 0.9,
        }}
      >
        {product.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: 300,
            color: "#FFF8D4",
            letterSpacing: "0.3px",
          }}
        >
          {product.name}
        </h3>
        <p
          style={{
            margin: "0 0 6px 0",
            color: "#FFF8D4",
            fontWeight: 300,
            fontSize: "14px",
            letterSpacing: "0.3px",
          }}
        >
          {product.price === 0
            ? "무료"
            : `${product.price.toLocaleString()}원`}
        </p>
        <div>
          <div
            style={{
              fontSize: "11px",
              color: statusStyle.color,
              fontWeight: 300,
              letterSpacing: "0.3px",
              marginTop: "4px",
            }}
          >
            {statusStyle.icon} {statusStyle.label}
          </div>
          {timer && (
            <div
              style={{
                fontSize: "10px",
                color: "rgba(163, 176, 135, 0.8)",
                fontWeight: 300,
                letterSpacing: "0.3px",
                marginTop: "4px",
              }}
            >
              남은 시간: {String(timer.hours).padStart(2, "0")}:
              {String(timer.minutes).padStart(2, "0")}:
              {String(timer.seconds).padStart(2, "0")}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => updateQuantity(itemId, quantity - 1)}
          style={{
            width: "32px",
            height: "32px",
            fontSize: "18px",
            background: "rgba(67, 86, 99, 0.3)",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#FFF8D4",
            fontWeight: 300,
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
          −
        </button>
        <span
          style={{
            minWidth: "40px",
            textAlign: "center",
            fontSize: "15px",
            fontWeight: 300,
            color: "#FFF8D4",
          }}
        >
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(itemId, quantity + 1)}
          style={{
            width: "32px",
            height: "32px",
            fontSize: "18px",
            background: "rgba(67, 86, 99, 0.3)",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#FFF8D4",
            fontWeight: 300,
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
          +
        </button>
      </div>
      <div
        style={{
          minWidth: "100px",
          textAlign: "right",
          fontSize: "16px",
          fontWeight: 300,
          color: "#FFF8D4",
          letterSpacing: "0.3px",
        }}
      >
        {product.price === 0
          ? "무료"
          : `${(product.price * quantity).toLocaleString()}원`}
      </div>
      <button
        onClick={() => {
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
                이 기억을 그냥 넘어갈까요?
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
                    removeFromCart(itemId);
                    toast.dismiss(t);
                    toast.success("기억이 삭제되었습니다.");
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
                  웃어 넘기기
                </button>
              </div>
            </div>
          ));
        }}
        style={{
          padding: "8px 14px",
          background: "rgba(67, 86, 99, 0.3)",
          color: "#FFF8D4",
          border: "1px solid rgba(255, 248, 212, 0.2)",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
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
        웃어 넘기기
      </button>
    </div>
  );
}
