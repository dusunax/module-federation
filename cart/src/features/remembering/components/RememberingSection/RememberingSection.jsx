import React from "react";
import { getStatusConfig, EMOTION_STATUS } from "products/utils/statusStyle";

export function RememberingSection({
  rememberingItems,
  rememberingTotalItems,
  isRemembering,
  progress,
  orderStatuses,
  rememberingStartTime,
}) {
  if (rememberingItems.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "40px" }}>
      <div
        style={{
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(163, 176, 135, 0.3)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 300,
            letterSpacing: "1px",
            color: "#A3B087",
            fontSize: "20px",
          }}
        >
          이해되는 중 ({rememberingTotalItems}개)
        </h2>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "12px",
            color: "rgba(163, 176, 135, 0.8)",
            fontWeight: 300,
            letterSpacing: "0.3px",
          }}
        >
          기억으로 남기는 중입니다
        </p>
      </div>

      {/* 프로그레스바 */}
      {isRemembering && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            background: "rgba(67, 86, 99, 0.3)",
            borderRadius: "4px",
            border: "1px solid rgba(163, 176, 135, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "rgba(255, 248, 212, 0.9)",
                fontWeight: 300,
                letterSpacing: "0.3px",
              }}
            >
              이해되는 중이에요...
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#A3B087",
                fontWeight: 300,
                letterSpacing: "0.3px",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(67, 86, 99, 0.5)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, rgba(163, 176, 135, 0.6) 0%, rgba(163, 176, 135, 0.9) 100%)",
                borderRadius: "3px",
                transition: "width 0.1s ease-out",
              }}
            />
          </div>
        </div>
      )}

      {/* 이해되는 중인 아이템 목록 (읽기 전용) */}
      <div style={{ marginBottom: "20px" }}>
        {rememberingItems.map((item) => {
          const { product, quantity } = item;
          const currentStatus =
            orderStatuses[product.id] || EMOTION_STATUS.HELD;
          const statusStyle = getStatusConfig(currentStatus);

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "24px",
                marginBottom: "16px",
                background: "rgba(163, 176, 135, 0.1)",
                border: "1px solid rgba(163, 176, 135, 0.3)",
                borderRadius: "4px",
                backdropFilter: "blur(10px)",
                opacity: 0.8,
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
                {rememberingStartTime && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(163, 176, 135, 0.7)",
                      fontWeight: 300,
                      letterSpacing: "0.3px",
                      marginTop: "4px",
                    }}
                  >
                    기록 시작: {new Date(rememberingStartTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
              <div
                style={{
                  minWidth: "40px",
                  textAlign: "center",
                  fontSize: "15px",
                  fontWeight: 300,
                  color: "rgba(255, 248, 212, 0.7)",
                  padding: "8px 16px",
                  background: "rgba(67, 86, 99, 0.3)",
                  borderRadius: "4px",
                }}
              >
                {quantity}개
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
