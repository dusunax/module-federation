import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // React Query를 사용한 데이터 페칭
  const { data: products, isLoading, isFetching, error } = useQuery({
    queryKey: ['plants', searchTerm],
    queryFn: async () => {
      const url = searchTerm
        ? `/api/plants?search=${encodeURIComponent(searchTerm)}`
        : '/api/plants';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('상품 데이터를 불러오는데 실패했습니다.');
      }
      return response.json();
    },
    // 기존 데이터를 유지하면서 새 데이터를 가져오도록 설정
    keepPreviousData: true,
  });

  const handleProductClick = (id) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Greenary 당일 배송 식물</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        오늘 주문하면 오늘 받아보세요!
      </p>

      {/* 검색 입력창 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="식물 이름, 카테고리로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {/* 에러 표시 */}
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', marginBottom: '20px' }}>
          <p>에러: {error.message}</p>
        </div>
      )}

      {/* 검색 결과 표시 */}
      {searchTerm && (
        <p style={{ color: '#666', marginBottom: '10px' }}>
          검색 결과: {products?.length || 0}개
          {isFetching && <span style={{ marginLeft: '10px', fontSize: '14px' }}>업데이트 중...</span>}
        </p>
      )}

      {/* 로딩 상태 (초기 로딩만) */}
      {isLoading && !products && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>로딩 중...</p>
        </div>
      )}

      {/* 상품 목록 */}
      {!isLoading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {products?.map(product => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {product.emoji}
            </div>
            <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
            <p style={{
              color: '#0066cc',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              {product.price.toLocaleString()}원
            </p>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🚚 {product.delivery}
            </span>
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#888'
            }}>
              {product.category} · {product.difficulty}
            </div>
          </div>
          ))}
        </div>
      )}

      {!isLoading && products?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
