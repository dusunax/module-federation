import React from "react";

export function EmptyCart() {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2
        style={{
          fontWeight: 300,
          letterSpacing: "1px",
          marginBottom: "20px",
          color: "#FFF8D4",
        }}
      >
        장바구니
      </h2>
      <div
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "rgba(67, 86, 99, 0.2)",
          borderRadius: "4px",
          border: "1px solid rgba(255, 248, 212, 0.2)",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "24px",
            opacity: 0.6,
          }}
        >
          💭
        </div>
        <p
          style={{
            color: "#FFF8D4",
            fontSize: "16px",
            fontWeight: 300,
            marginBottom: "8px",
          }}
        >
          장바구니가 비어있습니다
        </p>
        <p
          style={{
            color: "rgba(255, 248, 212, 0.85)",
            fontSize: "13px",
            fontWeight: 300,
          }}
        >
          순간을 추가해보세요
        </p>
      </div>
    </div>
  );
}
