import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';

function Header() {
  // Products 앱에서 공유되는 장바구니 items를 직접 구독
  // items가 변경되면 Header가 자동으로 리렌더링됩니다
  const items = useCartStore((state) => state.items);

  // 총 아이템 개수 계산
  const totalItems = Object.values(items).reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header style={{
      backgroundColor: '#282c34',
      padding: '20px',
      color: 'white',
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1 style={{ margin: 0 }}>🌿 Greenary</h1>
        </Link>
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '20px',
          margin: 0,
          padding: 0,
          alignItems: 'center',
        }}>
          <li>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              홈
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              style={{
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
              }}
            >
              🛒 장바구니
              {totalItems > 0 && (
                <span style={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {totalItems}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
