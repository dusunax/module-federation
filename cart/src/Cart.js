import React, { useState } from 'react';
import { useCartStore } from 'products/cartStore';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

function Cart() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [orderStatuses, setOrderStatuses] = useState({}); // 각 아이템의 주문 상태 관리

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
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontWeight: 300,
          letterSpacing: '1px',
          marginBottom: '20px',
          color: '#FFF8D4',
        }}>
          장바구니
        </h2>
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          background: 'rgba(67, 86, 99, 0.2)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 248, 212, 0.2)',
          marginTop: '20px',
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            opacity: 0.6,
          }}>💭</div>
          <p style={{ 
            color: '#FFF8D4', 
            fontSize: '16px',
            fontWeight: 300,
            marginBottom: '8px',
          }}>
            장바구니가 비어있습니다
          </p>
          <p style={{ 
            color: 'rgba(255, 248, 212, 0.85)', 
            fontSize: '13px',
            fontWeight: 300,
          }}>
            순간을 추가해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h2 style={{ 
          margin: 0,
          fontWeight: 300,
          letterSpacing: '1px',
          color: '#FFF8D4',
        }}>
          장바구니 ({totalItems}개)
        </h2>
        <button
          onClick={() => {
            if (window.confirm('모든 기억을 삭제하시겠습니까?')) {
              clearCart();
            }
          }}
          style={{
            padding: '10px 18px',
            background: 'rgba(67, 86, 99, 0.3)',
            color: '#FFF8D4',
            border: '1px solid rgba(255, 248, 212, 0.2)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 300,
            letterSpacing: '0.3px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(67, 86, 99, 0.4)';
            e.target.style.borderColor = '#A3B087';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(67, 86, 99, 0.3)';
            e.target.style.borderColor = 'rgba(255, 248, 212, 0.2)';
          }}
        >
          전체 삭제
        </button>
      </div>

      {/* 장바구니 아이템 목록 */}
      <div style={{ marginBottom: '30px' }}>
        {cartItems.map(({ product, quantity }) => (
          <div
            key={product.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '24px',
              marginBottom: '16px',
              background: 'rgba(67, 86, 99, 0.2)',
              border: '1px solid rgba(255, 248, 212, 0.2)',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 상품 이미지 */}
            <div style={{ 
              fontSize: '48px',
              opacity: 0.9,
            }}>
              {product.emoji}
            </div>

            {/* 상품 정보 */}
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '16px',
                fontWeight: 300,
                color: '#FFF8D4',
                letterSpacing: '0.3px',
              }}>
                {product.name}
              </h3>
              <p style={{
                margin: '0 0 6px 0',
                color: '#FFF8D4',
                fontWeight: 300,
                fontSize: '14px',
                letterSpacing: '0.3px',
              }}>
                {product.price === 0 ? '무료' : `${product.price.toLocaleString()}원`}
              </p>
              {/* 상태 표시 */}
              {(() => {
                const currentStatus = orderStatuses[product.id] || EMOTION_STATUS.HELD;
                const statusStyle = getStatusConfig(currentStatus);
                return (
                  <div style={{
                    fontSize: '11px',
                    color: statusStyle.color,
                    fontWeight: 300,
                    letterSpacing: '0.3px',
                    marginTop: '4px',
                  }}>
                    {statusStyle.icon} {statusStyle.label}
                  </div>
                );
              })()}
            </div>

            {/* 수량 조절 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  background: 'rgba(67, 86, 99, 0.3)',
                  border: '1px solid rgba(255, 248, 212, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#FFF8D4',
                  fontWeight: 300,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(67, 86, 99, 0.4)';
                  e.target.style.borderColor = '#A3B087';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(67, 86, 99, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 248, 212, 0.2)';
                }}
              >
                −
              </button>
              <span style={{
                minWidth: '40px',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: 300,
                color: '#FFF8D4',
              }}>
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  background: 'rgba(67, 86, 99, 0.3)',
                  border: '1px solid rgba(255, 248, 212, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#FFF8D4',
                  fontWeight: 300,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(67, 86, 99, 0.4)';
                  e.target.style.borderColor = '#A3B087';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(67, 86, 99, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 248, 212, 0.2)';
                }}
              >
                +
              </button>
            </div>

            {/* 소계 */}
            <div style={{
              minWidth: '100px',
              textAlign: 'right',
              fontSize: '16px',
              fontWeight: 300,
              color: '#FFF8D4',
              letterSpacing: '0.3px',
            }}>
              {product.price === 0 ? '무료' : `${(product.price * quantity).toLocaleString()}원`}
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={() => {
                if (window.confirm('이 기억을 삭제하시겠습니까?')) {
                  removeFromCart(product.id);
                }
              }}
              style={{
                padding: '8px 14px',
                background: 'rgba(67, 86, 99, 0.3)',
                color: '#FFF8D4',
                border: '1px solid rgba(255, 248, 212, 0.2)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 300,
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(67, 86, 99, 0.4)';
                e.target.style.borderColor = '#A3B087';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(67, 86, 99, 0.3)';
                e.target.style.borderColor = 'rgba(255, 248, 212, 0.2)';
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div style={{
        padding: '30px',
        background: 'rgba(67, 86, 99, 0.2)',
        borderRadius: '4px',
        border: '1px solid rgba(163, 176, 135, 0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: 'rgba(255, 248, 212, 0.9)',
            fontWeight: 300,
            letterSpacing: '0.3px',
          }}>
            총 {totalItems}개 순간
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 300,
            color: '#FFF8D4',
            letterSpacing: '0.5px',
          }}>
            총 금액
          </span>
          <span style={{
            fontSize: '24px',
            fontWeight: 300,
            color: '#FFF8D4',
            letterSpacing: '0.5px',
          }}>
            {totalPrice === 0 ? '무료' : `${totalPrice.toLocaleString()}원`}
          </span>
        </div>
        <button
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '16px',
            fontWeight: 300,
            background: 'rgba(163, 176, 135, 0.3)',
            color: '#FFF8D4',
            border: '1px solid rgba(163, 176, 135, 0.5)',
            borderRadius: '4px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(163, 176, 135, 0.5)';
            e.target.style.borderColor = 'rgba(163, 176, 135, 0.7)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(163, 176, 135, 0.3)';
            e.target.style.borderColor = 'rgba(163, 176, 135, 0.5)';
            e.target.style.transform = 'translateY(0)';
          }}
          onClick={() => {
            if (window.confirm('정말 주문하시겠습니까?')) {
              // 모든 아이템을 being_understood 상태로 변경
              const newStatuses = {};
              cartItems.forEach(({ product }) => {
                newStatuses[product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
              });
              setOrderStatuses(newStatuses);
              
              // 2초 후 remembered 상태로 변경
              setTimeout(() => {
                const finalStatuses = {};
                cartItems.forEach(({ product }) => {
                  finalStatuses[product.id] = EMOTION_STATUS.REMEMBERED;
                });
                setOrderStatuses(finalStatuses);
                alert('기억으로 남았어요. (데모)');
              }, 2000);
            }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Cart;
