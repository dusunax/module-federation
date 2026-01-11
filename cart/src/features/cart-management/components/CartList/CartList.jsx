import React from "react";
import { toast } from "sonner";
import { CartItem } from "../CartItem/CartItem";

export function CartList({
  normalItems,
  normalTotalItems,
  items,
  orderStatuses,
  timeRemaining,
  updateQuantity,
  removeFromCart,
}) {
  const handleClearAll = () => {
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
          장바구니를 비우시겠습니까?
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
              normalItems.forEach((item) => {
                removeFromCart(item.id);
              });
              toast.dismiss(t);
              toast.success("장바구니가 비워졌습니다.");
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
            비우기
          </button>
        </div>
      </div>
    ));
  };

  if (normalItems.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255, 248, 212, 0.2)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontWeight: 300,
              letterSpacing: "1px",
              color: "#FFF8D4",
              fontSize: "20px",
            }}
          >
            장바구니 ({normalTotalItems}개)
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "rgba(255, 248, 212, 0.7)",
              fontWeight: 300,
              letterSpacing: "0.3px",
            }}
          >
            편집 가능한 순간들
          </p>
        </div>
        <button
          onClick={handleClearAll}
          style={{
            padding: "10px 18px",
            background: "rgba(67, 86, 99, 0.3)",
            color: "#FFF8D4",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
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
          전체 삭제
        </button>
      </div>
      <div style={{ marginBottom: "20px" }}>
        {normalItems.map((item) => (
          <CartItem
            key={item.id}
            product={item.product}
            quantity={item.quantity}
            orderStatuses={orderStatuses}
            timeRemaining={timeRemaining}
            item={item}
            itemId={item.id}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        ))}
      </div>
    </div>
  );
}
