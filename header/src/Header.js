import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';
import { useAuthStore } from 'auth/authStore';
import { useEnergyStore } from 'auth/energyStore';
import { useRememberingStore } from 'auth/rememberingStore';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const rememberingItems = useRememberingStore((state) => state.rememberingItems);
  const rememberingItemIds = Object.keys(rememberingItems).map(Number);
  const { user, signOut } = useAuthStore();
  const { current: currentEnergy, maxEnergy } = useEnergyStore();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
          {user && (
            <li className="ml-4 flex items-center gap-3 border-l border-[var(--color-border-primary)] pl-4">
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-green-overlay-3)] px-3 py-1 text-sm text-[var(--color-accent-green)]">
                ⚡ {currentEnergy}/{maxEnergy}
              </span>
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName} className="h-8 w-8 rounded-full" />
              )}
              <span className="text-sm text-[var(--color-text-secondary)]">{user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="rounded border border-[var(--color-border-primary)] bg-transparent px-3 py-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                로그아웃
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
