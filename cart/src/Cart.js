import React from 'react';
import { useCartStore } from 'products/cartStore';

function Cart() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  console.log(items);

  // items가 변경되면 자동으로 재계산됨
  const cartItems = Object.values(items);
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🛒 장바구니</h2>
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          marginTop: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
          <p style={{ color: '#888', fontSize: '18px' }}>
            장바구니가 비어있습니다
          </p>
          <p style={{ color: '#aaa', fontSize: '14px' }}>
            상품을 추가해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ margin: 0 }}>🛒 장바구니 ({totalItems}개)</h2>
        <button
          onClick={clearCart}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff5252',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e04545'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ff5252'}
        >
          전체 삭제
        </button>
      </div>

      {/* 장바구니 아이템 목록 */}
      <div style={{ marginBottom: '20px' }}>
        {cartItems.map(({ product, quantity }) => (
          <div
            key={product.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              marginBottom: '10px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            {/* 상품 이미지 */}
            <div style={{ fontSize: '48px' }}>
              {product.emoji}
            </div>

            {/* 상품 정보 */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                {product.name}
              </h3>
              <p style={{
                margin: '0',
                color: '#0066cc',
                fontWeight: 'bold',
                fontSize: '16px',
              }}>
                {product.price.toLocaleString()}원
              </p>
            </div>

            {/* 수량 조절 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '20px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              >
                -
              </button>
              <span style={{
                minWidth: '40px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
              }}>
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '20px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              >
                +
              </button>
            </div>

            {/* 소계 */}
            <div style={{
              minWidth: '100px',
              textAlign: 'right',
              fontSize: '18px',
              fontWeight: 'bold',
            }}>
              {(product.price * quantity).toLocaleString()}원
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={() => removeFromCart(product.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ff5252',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e04545'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ff5252'}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '2px solid #4CAF50',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <span style={{ fontSize: '16px', color: '#666' }}>
            총 {totalItems}개 상품
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            총 금액
          </span>
          <span style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#4CAF50',
          }}>
            {totalPrice.toLocaleString()}원
          </span>
        </div>
        <button
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          onClick={() => alert('주문 기능은 데모용입니다.')}
        >
          주문하기
        </button>
      </div>
    </div>
  );
}

export default Cart;
