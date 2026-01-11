import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from './store/cartStore';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  // Zustand store에서 장바구니 함수 가져오기
  const addToCart = useCartStore((state) => state.addToCart);

  // 장바구니에 추가 핸들러
  const handleAddToCart = () => {
    addToCart(product);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  // React Query를 사용한 상품 상세 데이터 페칭
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['plant', id],
    queryFn: async () => {
      const response = await fetch(`/api/plants/${id}`);
      if (!response.ok) {
        throw new Error('상품 정보를 불러오는데 실패했습니다.');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>에러: {error.message}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          fontSize: '14px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
      >
        ← 목록으로
      </button>

      {/* 상품 상세 정보 */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '30px',
        backgroundColor: 'white',
      }}>
        <div style={{
          display: 'flex',
          gap: '30px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}>
          {/* 이미지 영역 */}
          <div style={{
            flex: '0 0 200px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '120px',
              lineHeight: '1',
            }}>
              {product.image}
            </div>
          </div>

          {/* 기본 정보 */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ marginTop: 0, marginBottom: '10px' }}>
              {product.name}
            </h1>
            <p style={{
              fontSize: '28px',
              color: '#0066cc',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}>
              {product.price.toLocaleString()}원
            </p>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}>
              🚚 {product.delivery}
            </span>

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px',
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>카테고리:</strong> {product.category}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>키우기 난이도:</strong> {product.difficulty}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>크기:</strong> {product.size}
              </div>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>상품 설명</h2>
          <p style={{ lineHeight: '1.6', color: '#333' }}>
            {product.description}
          </p>
        </div>

        {/* 관리 정보 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>💡</div>
            <strong>햇빛</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              {product.light}
            </p>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>💧</div>
            <strong>물주기</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              {product.water}
            </p>
          </div>
        </div>

        {/* 식물의 효능 */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>이 식물의 효능</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {product.benefits.map((benefit, index) => (
              <span
                key={index}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                ✓ {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* 장바구니 추가 버튼 */}
        {showAddedMessage && (
          <div style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            ✓ 장바구니에 추가되었습니다!
          </div>
        )}
        <button
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#F57C00'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#FF9800'}
          onClick={handleAddToCart}
        >
          🛒 장바구니에 추가
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
