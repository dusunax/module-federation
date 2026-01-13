import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';
import { useOrderStore } from 'products/orderStore';

function Header() {
  const location = useLocation();
  const items = useCartStore((state) => state.items);
  const rememberingItemIds = useOrderStore((state) => state.rememberingItemIds);

  // 기억하는 중인 아이템을 제외한 장바구니 아이템 수량 계산
  const totalItems = Object.values(items)
    .filter((item) => !rememberingItemIds.includes(item.id))
    .reduce((total, item) => total + item.quantity, 0);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-[var(--color-border-primary)] bg-[rgba(49,54,71,0.95)] p-5 text-[var(--color-text-primary)] backdrop-blur-[10px]">
      <nav className="flex items-center justify-between">
        <Link to="/" className="text-[var(--color-text-primary)] no-underline">
          <h1 className="m-0 font-light tracking-[1px]">Between Lines</h1>
          <p className="mb-0 mt-1 text-xs font-light text-[var(--color-text-secondary)]">
            Like Real People Do
          </p>
        </Link>
        <ul className="m-0 flex list-none items-center gap-5 p-0">
          <li>
            <Link
              to="/"
              className={`
                rounded border-b-2 px-3 py-2 text-[var(--color-text-primary)]
                no-underline transition-all duration-300 ease-in-out
                ${
                  isActive('/')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-transparent bg-transparent'
                }
              `}
            >
              홈
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className={`
                relative flex items-center gap-2 rounded
                border-b-2 px-3 py-2 text-[var(--color-text-primary)] no-underline transition-all duration-300 ease-in-out
                ${
                  isActive('/cart')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-transparent bg-transparent'
                }
              `}
            >
              🛒 장바구니
              {totalItems > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-orange)] text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/archive"
              className={`
                flex items-center gap-2 rounded border-b-2
                px-3 py-2 text-[var(--color-text-primary)] no-underline transition-all duration-300 ease-in-out
                ${
                  isActive('/archive')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-transparent bg-transparent'
                }
              `}
            >
              📚 감정 기록
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
