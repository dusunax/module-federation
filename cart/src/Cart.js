import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "products/cartStore";
import { useOrderStore } from "products/orderStore";
import { getStatusConfig, EMOTION_STATUS } from "products/utils/statusStyle";

function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const completeRememberingItems = useOrderStore(
    (state) => state.completeRememberingItems
  );
  const isRemembering = useOrderStore((state) => state.isRemembering);
  const progress = useOrderStore((state) => state.progress);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);
  const rememberingItemIds = useOrderStore((state) => state.rememberingItemIds);
  const startRemembering = useOrderStore((state) => state.startRemembering);
  const updateProgress = useOrderStore((state) => state.updateProgress);
  const updateAllOrderStatuses = useOrderStore(
    (state) => state.updateAllOrderStatuses
  );
  const completeRemembering = useOrderStore(
    (state) => state.completeRemembering
  );
  const intervalRef = useRef(null); // interval 참조

  // 컴포넌트 언마운트 시 interval 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 기억 진행 중일 때 프로그레스바 업데이트
  useEffect(() => {
    if (!isRemembering) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 이미 진행 중이면 재시작하지 않음
    if (intervalRef.current) {
      return;
    }

    const duration = 30000; // 30초
    const interval = 100; // 100ms마다 업데이트
    const steps = duration / interval; // 총 600단계
    let currentStep = Math.floor((progress / 100) * steps);

    intervalRef.current = setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      updateProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        // 기억 완료 - rememberingItemIds에 있는 아이템만 처리
        const currentState = useOrderStore.getState();
        const { rememberingItemIds: currentRememberingIds } = currentState;

        const finalStatuses = {};
        currentRememberingIds.forEach((productId) => {
          finalStatuses[productId] = EMOTION_STATUS.REMEMBERED;
        });
        updateAllOrderStatuses(finalStatuses);

        // 기억 완료 처리 (rememberingItemIds에 있는 아이템만)
        const order = completeRememberingItems();
        if (order) {
          completeRemembering();
          alert("기억으로 남았어요.");
          navigate("/archive");
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isRemembering,
    progress,
    updateProgress,
    updateAllOrderStatuses,
    completeRememberingItems,
    completeRemembering,
    navigate,
  ]);

  const cartItems = Object.values(items);

  // 아이템을 두 그룹으로 분리
  const rememberingItems = cartItems.filter(({ product }) =>
    rememberingItemIds.includes(product.id)
  );
  const normalItems = cartItems.filter(
    ({ product }) => !rememberingItemIds.includes(product.id)
  );

  // 전체 통계
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // 일반 아이템 통계
  const normalTotalItems = normalItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const normalTotalPrice = normalItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // 기억 중인 아이템 통계
  const rememberingTotalItems = rememberingItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const rememberingTotalPrice = rememberingItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
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

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* 장바구니 아이템 섹션 */}
      {normalItems.length > 0 && (
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
              onClick={() => {
                if (window.confirm("장바구니를 비우시겠습니까?")) {
                  normalItems.forEach(({ product }) => {
                    removeFromCart(product.id);
                  });
                }
              }}
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

          {/* 장바구니 아이템 목록 (편집 가능) */}
          <div style={{ marginBottom: "20px" }}>
            {normalItems.map(({ product, quantity }) => (
              <div
                key={product.id}
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
                  {(() => {
                    const currentStatus =
                      orderStatuses[product.id] || EMOTION_STATUS.HELD;
                    const statusStyle = getStatusConfig(currentStatus);
                    return (
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
                    );
                  })()}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
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
                    onClick={() => updateQuantity(product.id, quantity + 1)}
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
                    if (window.confirm("이 기억을 삭제하시겠습니까?")) {
                      removeFromCart(product.id);
                    }
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
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이해되는 중인 아이템 섹션 */}
      {rememberingItems.length > 0 && (
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
            {rememberingItems.map(({ product, quantity }) => (
              <div
                key={product.id}
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
                  {(() => {
                    const currentStatus =
                      orderStatuses[product.id] || EMOTION_STATUS.HELD;
                    const statusStyle = getStatusConfig(currentStatus);
                    return (
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
                    );
                  })()}
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
            ))}
          </div>
        </div>
      )}

      {/* 합계 및 기억하기 버튼 (장바구니 아이템이 있을 때만) */}
      {normalItems.length > 0 && (
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
            onClick={() => {
              if (window.confirm("정말 기억하시겠습니까?")) {
                // 기억 시작
                startRemembering();

                const newStatuses = {};
                normalItems.forEach(({ product }) => {
                  newStatuses[product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
                });
                updateAllOrderStatuses(newStatuses);
              }
            }}
          >
            기억하기
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
