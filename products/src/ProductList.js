import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from './store/cartStore';
import { useOrderStore } from './store/orderStore';
import { getStatusConfig } from './utils/statusStyle';
import { EMOTION_STATUS } from './constants';

function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);

  const {
    data: emotions,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['emotions', searchTerm],
    queryFn: async () => {
      const url = searchTerm
        ? `/api/emotions?search=${encodeURIComponent(searchTerm)}`
        : '/api/emotions';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('순간 데이터를 불러오는데 실패했습니다.');
      }
      return response.json();
    },
    keepPreviousData: true,
  });

  const handleProductClick = (id) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] p-5">
      {/* 검색 입력창 */}
      <div className="mb-[30px]">
        <input
          type="text"
          placeholder="순간, 카테고리, 스토리로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-[500px] rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-3.5 text-sm font-light text-[#FFF8D4] outline-none transition-all duration-300 focus:border-[#A3B087] focus:bg-[rgba(67,86,99,0.4)]"
        />
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-5 rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.2)] p-5 text-center text-[#FFF8D4]">
          <p>에러: {error.message}</p>
        </div>
      )}

      {/* 검색 결과 표시 */}
      {searchTerm && (
        <p className="mb-5 text-[13px] font-light text-[rgba(255,248,212,0.85)]">
          검색 결과: {emotions?.length || 0}개
          {isFetching && <span className="ml-2.5 text-xs">업데이트 중...</span>}
        </p>
      )}

      {/* 로딩 상태 */}
      {isLoading && !emotions && (
        <div className="py-15 text-center">
          <p className="font-light text-[#FFF8D4]">로딩 중...</p>
        </div>
      )}

      {/* 순간 카드 목록 */}
      {!isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {emotions?.map((emotion) => {
            // 장바구니에 담겨있으면 held 상태로 표시
            // 같은 productId를 가진 아이템이 있는지 확인
            const hasInCart = Object.values(cartItems).some(
              (item) => item.product.id === emotion.id
            );
            // Prefer DB-driven status if available
            const dbStatus = orderStatuses ? orderStatuses[emotion.id] : undefined;
            const currentStatus = dbStatus
              ? dbStatus
              : hasInCart
                ? EMOTION_STATUS.HELD
                : emotion.status;
            const statusStyle = getStatusConfig(currentStatus);
            return (
              <div
                key={emotion.id}
                onClick={() => handleProductClick(emotion.id)}
                className="relative flex cursor-pointer flex-col rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.2)] p-6 text-left backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.3)]"
              >
                {/* 상태 표시 */}
                <div
                  className="absolute right-4 top-4 rounded-sm bg-[rgba(67,86,99,0.4)] px-2 py-1 text-[10px] font-light tracking-wide"
                  style={{ color: statusStyle.color }}
                >
                  {statusStyle.icon} {statusStyle.label}
                </div>

                <div className="mb-4 text-5xl opacity-90">{emotion.emoji}</div>
                <h3 className="mb-1 text-base font-light leading-6 tracking-wide ">
                  {emotion.name}
                </h3>
                <p className="mb-4 line-clamp-5 min-h-0 flex-1 text-[13px] font-light leading-relaxed text-[rgba(255,248,212,0.85)]">
                  {emotion.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[rgba(255,248,212,0.1)] pt-4">
                  <span className="rounded-sm bg-[rgba(67,86,99,0.3)] px-2.5 py-1 text-[11px] font-light tracking-wider text-[rgba(255,248,212,0.75)]">
                    {emotion.category}
                  </span>
                  <span className="text-sm font-light tracking-wider text-[#A3B087]">
                    ⚡ {emotion.energyCost}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && emotions?.length === 0 && (
        <div className="py-15 px-5 text-center text-[rgba(255,248,212,0.8)]">
          <p className="font-light">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
