import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from "./store/cartStore";
import { getStatusConfig } from "./utils/statusStyle";
import { EMOTION_STATUS } from "./constants";

function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);

  const {
    data: emotions,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["emotions", searchTerm],
    queryFn: async () => {
      const url = searchTerm
        ? `/api/emotions?search=${encodeURIComponent(searchTerm)}`
        : "/api/emotions";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("순간 데이터를 불러오는데 실패했습니다.");
      }
      return response.json();
    },
    keepPreviousData: true,
  });

  const handleProductClick = (id) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h2
        style={{
          fontWeight: 300,
          letterSpacing: "1px",
          marginBottom: "8px",
          color: "#FFF8D4",
        }}
      >
        사랑에 대한 순간들
      </h2>
      <p
        style={{
          color: "rgba(255, 248, 212, 0.85)",
          fontSize: "14px",
          marginBottom: "30px",
          fontWeight: 300,
        }}
      >
        기억하고, 저장하며, 마음에 남겨두세요
      </p>

      {/* 검색 입력창 */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="순간, 카테고리, 스토리로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "14px 18px",
            fontSize: "14px",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            outline: "none",
            background: "rgba(67, 86, 99, 0.3)",
            color: "#FFF8D4",
            fontWeight: 300,
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#A3B087";
            e.target.style.background = "rgba(67, 86, 99, 0.4)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 248, 212, 0.2)";
            e.target.style.background = "rgba(67, 86, 99, 0.3)";
          }}
        />
      </div>

      {/* 에러 표시 */}
      {error && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#FFF8D4",
            marginBottom: "20px",
            border: "1px solid rgba(255, 248, 212, 0.2)",
            borderRadius: "4px",
            background: "rgba(67, 86, 99, 0.2)",
          }}
        >
          <p>에러: {error.message}</p>
        </div>
      )}

      {/* 검색 결과 표시 */}
      {searchTerm && (
        <p
          style={{
            color: "rgba(255, 248, 212, 0.85)",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: 300,
          }}
        >
          검색 결과: {emotions?.length || 0}개
          {isFetching && (
            <span style={{ marginLeft: "10px", fontSize: "12px" }}>
              업데이트 중...
            </span>
          )}
        </p>
      )}

      {/* 로딩 상태 */}
      {isLoading && !emotions && (
        <div style={{ padding: "60px", textAlign: "center" }}>
          <p style={{ color: "#FFF8D4", fontWeight: 300 }}>로딩 중...</p>
        </div>
      )}

      {/* 순간 카드 목록 */}
      {!isLoading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {emotions?.map((emotion) => {
            // 장바구니에 담겨있으면 held 상태로 표시
            const currentStatus = cartItems[emotion.id]
              ? EMOTION_STATUS.HELD
              : emotion.status;
            const statusStyle = getStatusConfig(currentStatus);
            return (
              <div
                key={emotion.id}
                onClick={() => handleProductClick(emotion.id)}
                style={{
                  border: "1px solid rgba(255, 248, 212, 0.2)",
                  borderRadius: "4px",
                  padding: "24px",
                  textAlign: "left",
                  background: "rgba(67, 86, 99, 0.2)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                  backdropFilter: "blur(10px)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#A3B087";
                  e.currentTarget.style.background = "rgba(67, 86, 99, 0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255, 248, 212, 0.2)";
                  e.currentTarget.style.background = "rgba(67, 86, 99, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* 상태 표시 */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    fontSize: "10px",
                    color: statusStyle.color,
                    fontWeight: 300,
                    letterSpacing: "0.3px",
                    background: "rgba(67, 86, 99, 0.4)",
                    padding: "4px 8px",
                    borderRadius: "2px",
                  }}
                >
                  {statusStyle.icon} {statusStyle.label}
                </div>

                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    opacity: 0.9,
                  }}
                >
                  {emotion.emoji}
                </div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    fontWeight: 300,
                    color: "#FFF8D4",
                    letterSpacing: "0.3px",
                  }}
                >
                  {emotion.name}
                </h3>
                <p
                  style={{
                    color: "rgba(255, 248, 212, 0.85)",
                    fontSize: "13px",
                    marginBottom: "16px",
                    minHeight: "40px",
                    lineHeight: "1.6",
                    fontWeight: 300,
                  }}
                >
                  {emotion.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 248, 212, 0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 248, 212, 0.75)",
                      background: "rgba(67, 86, 99, 0.3)",
                      padding: "4px 10px",
                      borderRadius: "2px",
                      fontWeight: 300,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {emotion.category}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 300,
                      color: "#FFF8D4",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {emotion.price === 0 ? "무료" : `${emotion.price}원`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && emotions?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255, 248, 212, 0.8)",
          }}
        >
          <p style={{ fontWeight: 300 }}>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
