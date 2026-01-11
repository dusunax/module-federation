import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from './store/cartStore';
import { getStatusConfig } from "./utils/statusStyle";
import { EMOTION_STATUS } from "./constants";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const items = useCartStore((state) => state.items);

  // 장바구니에 추가 핸들러
  const handleAddToCart = () => {
    addToCart(emotion);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  // 환불 핸들러
  const handleRefund = () => {
    if (window.confirm("정말로 잊고 싶어요?")) {
      removeFromCart(emotion.id);
      setShowRefundModal(false);
      alert("기억이 삭제되었습니다.");
    }
  };

  const {
    data: emotion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["emotion", id],
    queryFn: async () => {
      const response = await fetch(`/api/emotions/${id}`);
      if (!response.ok) {
        throw new Error("순간 정보를 불러오는데 실패했습니다.");
      }
      return response.json();
    },
  });

  const isInCart = emotion && items[emotion.id];

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#FFF8D4", fontWeight: 300 }}>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#FFF8D4" }}>
        <p>에러: {error.message}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            fontSize: "14px",
            cursor: "pointer",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            background: "rgba(67, 86, 99, 0.3)",
            color: "#FFF8D4",
            fontWeight: 300,
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 장바구니에 담겨있으면 held 상태로 표시
  const currentStatus = isInCart ? EMOTION_STATUS.HELD : (emotion?.status || EMOTION_STATUS.NOTICING);
  const statusStyle = getStatusConfig(currentStatus);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "24px",
          padding: "10px 20px",
          fontSize: "13px",
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
        ← 목록으로
      </button>

      {/* 순간 상세 정보 */}
      <div
        style={{
          border: "1px solid rgba(255, 248, 212, 0.2)",
          borderRadius: "4px",
          padding: "40px",
          background: "rgba(67, 86, 99, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {/* 이모지 영역 */}
          <div
            style={{
              flex: "0 0 180px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "100px",
                lineHeight: "1",
                marginBottom: "16px",
                opacity: 0.9,
              }}
            >
              {emotion?.emoji}
            </div>
            {/* 상태 표시 */}
            <div
              style={{
                display: "inline-block",
                fontSize: "11px",
                color: statusStyle.color,
                fontWeight: 300,
                letterSpacing: "0.5px",
                padding: "6px 12px",
                border: "1px solid rgba(255, 248, 212, 0.2)",
                borderRadius: "2px",
                background: "rgba(67, 86, 99, 0.3)",
              }}
            >
              {statusStyle.icon} {statusStyle.label}
            </div>
          </div>

          {/* 기본 정보 */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h1
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontWeight: 300,
                letterSpacing: "0.5px",
                color: "#FFF8D4",
                fontSize: "28px",
                lineHeight: "1.4",
              }}
            >
              {emotion?.name}
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "#FFF8D4",
                fontWeight: 300,
                marginBottom: "20px",
                letterSpacing: "0.3px",
              }}
            >
              {emotion?.price === 0
                ? "무료"
                : `${emotion?.price.toLocaleString()}원`}
            </p>
            <span
              style={{
                display: "inline-block",
                background: "rgba(67, 86, 99, 0.3)",
                color: "rgba(255, 248, 212, 0.9)",
                padding: "6px 14px",
                borderRadius: "2px",
                fontSize: "12px",
                fontWeight: 300,
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              {emotion?.category}
            </span>
          </div>
        </div>

        {/* 설명 */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "16px",
              marginBottom: "12px",
              fontWeight: 300,
              color: "#FFF8D4",
              letterSpacing: "0.5px",
            }}
          >
            설명
          </h2>
          <p
            style={{
              lineHeight: "1.8",
              color: "rgba(255, 248, 212, 0.9)",
              fontSize: "15px",
              fontWeight: 300,
            }}
          >
            {emotion?.description}
          </p>
        </div>

        {/* 상황 스토리 */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "16px",
              marginBottom: "12px",
              fontWeight: 300,
              color: "#FFF8D4",
              letterSpacing: "0.5px",
            }}
          >
            상황 스토리
          </h2>
          <div
            style={{
              background: "rgba(67, 86, 99, 0.3)",
              padding: "24px",
              borderRadius: "4px",
              borderLeft: "2px solid #A3B087",
            }}
          >
            <p
              style={{
                lineHeight: "1.9",
                color: "#FFF8D4",
                fontStyle: "italic",
                margin: 0,
                fontSize: "15px",
                fontWeight: 300,
              }}
            >
              "{emotion?.story}"
            </p>
          </div>
        </div>

        {/* 효과 */}
        {emotion?.effects && emotion.effects.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                fontWeight: 300,
                color: "#FFF8D4",
                letterSpacing: "0.5px",
              }}
            >
              효과
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {emotion.effects.map((effect, index) => (
                <span
                  key={index}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(67, 86, 99, 0.3)",
                    color: "#A3B087",
                    borderRadius: "2px",
                    fontSize: "12px",
                    fontWeight: 300,
                    letterSpacing: "0.3px",
                  }}
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 장바구니 추가 버튼 / 환불 버튼 */}
        {showAddedMessage && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              background: "rgba(163, 176, 135, 0.3)",
              color: "#FFF8D4",
              borderRadius: "4px",
              textAlign: "center",
              fontWeight: 300,
              fontSize: "14px",
            }}
          >
            ✓ 장바구니에 추가되었습니다
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          {!isInCart ? (
            <button
              style={{
                flex: 1,
                padding: "16px",
                fontSize: "15px",
                fontWeight: 300,
                background: "rgba(163, 176, 135, 0.3)",
                color: "#FFF8D4",
                border: "1px solid rgba(163, 176, 135, 0.5)",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(163, 176, 135, 0.5)";
                e.target.style.borderColor = "rgba(163, 176, 135, 0.7)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(163, 176, 135, 0.3)";
                e.target.style.borderColor = "rgba(163, 176, 135, 0.5)";
              }}
              onClick={handleAddToCart}
            >
              장바구니에 추가
            </button>
          ) : (
            <button
              style={{
                flex: 1,
                padding: "16px",
                fontSize: "15px",
                fontWeight: 300,
                background: "rgba(67, 86, 99, 0.3)",
                color: "#FFF8D4",
                border: "1px solid rgba(255, 248, 212, 0.2)",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(67, 86, 99, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(67, 86, 99, 0.3)";
              }}
              onClick={() => setShowRefundModal(true)}
            >
              잊기
            </button>
          )}
        </div>

        {/* 환불 모달 */}
        {showRefundModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowRefundModal(false)}
          >
            <div
              style={{
                background: "#313647",
                padding: "40px",
                borderRadius: "4px",
                border: "1px solid rgba(255, 248, 212, 0.2)",
                maxWidth: "400px",
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontWeight: 300,
                  color: "#FFF8D4",
                  fontSize: "18px",
                  letterSpacing: "0.5px",
                }}
              >
                정말로 잊고 싶어요?
              </h3>
              <p
                style={{
                  margin: "0 0 30px 0",
                  color: "rgba(255, 248, 212, 0.9)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  fontWeight: 300,
                }}
              >
                이 순간을 기억에서 삭제하시겠습니까? 되돌릴 수 없습니다.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleRefund}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 300,
                    background: "rgba(163, 176, 135, 0.3)",
                    color: "#FFF8D4",
                    border: "1px solid rgba(163, 176, 135, 0.5)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 300,
                    background: "rgba(67, 86, 99, 0.3)",
                    color: "#FFF8D4",
                    border: "1px solid rgba(255, 248, 212, 0.2)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
