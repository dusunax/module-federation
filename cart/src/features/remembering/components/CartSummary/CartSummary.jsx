import React from "react";
import { toast } from "sonner";
import { EMOTION_STATUS } from "products/utils/statusStyle";

export function CartSummary({
  normalItems,
  normalTotalItems,
  normalTotalPrice,
  startRemembering,
  updateAllOrderStatuses,
}) {
  if (normalItems.length === 0) {
    return null;
  }

  const handleRemember = () => {
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
          정말 기억하시겠습니까?
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
              startRemembering();

              const newStatuses = {};
              normalItems.forEach((item) => {
                newStatuses[item.product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
              });
              updateAllOrderStatuses(newStatuses);
              toast.dismiss(t);
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
            기억하기
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "rgba(67, 86, 99, 0.2)",
        borderRadius: "4px",
        border: "1px solid rgba(163, 176, 135, 0.3)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: "rgba(255, 248, 212, 0.9)",
            fontWeight: 300,
            letterSpacing: "0.3px",
          }}
        >
          총 {normalTotalItems}개 순간
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "#FFF8D4",
            letterSpacing: "0.5px",
          }}
        >
          총 금액
        </span>
        <span
          style={{
            fontSize: "24px",
            fontWeight: 300,
            color: "#FFF8D4",
            letterSpacing: "0.5px",
          }}
        >
          {normalTotalPrice === 0
            ? "무료"
            : `${normalTotalPrice.toLocaleString()}원`}
        </span>
      </div>

      <button
        onClick={handleRemember}
        style={{
          width: "100%",
          padding: "18px",
          fontSize: "16px",
          fontWeight: 300,
          background: "rgba(163, 176, 135, 0.3)",
          color: "#FFF8D4",
          border: "1px solid rgba(163, 176, 135, 0.5)",
          borderRadius: "4px",
          cursor: "pointer",
          letterSpacing: "0.5px",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "rgba(163, 176, 135, 0.5)";
          e.target.style.borderColor = "rgba(163, 176, 135, 0.7)";
          e.target.style.transform = "translateY(-1px)";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "rgba(163, 176, 135, 0.3)";
          e.target.style.borderColor = "rgba(163, 176, 135, 0.5)";
          e.target.style.transform = "translateY(0)";
        }}
      >
        기억하기
      </button>
    </div>
  );
}
