import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';
import { useAuthStore } from 'auth/authStore';
import { useEnergyStore } from 'auth/energyStore';
import { useRememberingStore } from 'auth/rememberingStore';
import {
  HomeIcon,
  ShoppingCartIcon,
  LogOutIcon,
  BookOpenIcon,
  XIcon,
  UserIcon,
} from 'lucide-react';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const items = useCartStore((state) => state.items);
  const rememberingItems = useRememberingStore((state) => state.rememberingItems);
  const rememberingItemIds = Object.keys(rememberingItems).map(Number);
  const { user, signOut } = useAuthStore();
  const { current: currentEnergy, maxEnergy } = useEnergyStore();

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
      setIsProfileOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="relative border-b border-[var(--color-border-primary)] bg-[rgba(49,54,71,0.95)] p-5 text-[var(--color-text-primary)] backdrop-blur-[10px]"
      style={{ zIndex: 'var(--z-sticky)' }}
    >
      <nav className="flex items-center justify-between">
        <Link to="/" className="text-[var(--color-text-primary)] no-underline">
          <h2 className="m-0 font-light tracking-[1px]">Love at First Sight</h2>
          <p className="mb-0 mt-1 text-xs font-light text-[var(--color-text-secondary)]">
            기억하고, 저장하며, 마음에 남겨두세요
          </p>
        </Link>
        <ul className="m-0 flex list-none items-center gap-3 p-0">
          <li>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-green-overlay-3)] px-3 py-0.5 font-semibold text-[var(--color-accent-green)]">
              ⚡ {currentEnergy}/{maxEnergy}
            </span>
          </li>
          <li>
            <Link
              to="/"
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors ${
                isActive('/')
                  ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                  : 'border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)]'
              }`}
              aria-label="홈 페이지로 이동"
            >
              <HomeIcon className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors ${
                isActive('/cart')
                  ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                  : 'border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)]'
              }`}
              aria-label="장바구니 페이지로 이동"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-orange)] text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </li>
          {user ? (
            <li className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-transparent transition-colors hover:bg-[var(--color-overlay-3)]"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-full w-full rounded-full"
                  />
                )}
              </button>

              {isProfileOpen && (
                <div
                  className="absolute -top-4 right-0 min-w-[200px] rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-dark)] pb-2 pt-6 shadow-lg"
                  style={{ zIndex: 'var(--z-dropdown)' }}
                >
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-transparent text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay-3)] hover:text-[var(--color-text-primary)]"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col border-b border-[var(--color-border-primary)] px-4 pb-4 pt-3">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="h-10 w-10 rounded-full"
                      />
                      <p className="m-0 text-sm font-medium text-[var(--color-text-primary)]">
                        {user.displayName}
                      </p>
                    </div>
                    <div className="m-0 text-center text-sm text-[var(--color-text-secondary)]">
                      {user.email}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-b border-[var(--color-border-primary)] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="m-0 font-medium text-[var(--color-text-secondary)]">
                        Energy :
                      </div>
                      <span>
                        ⚡ {currentEnergy}/{maxEnergy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="m-0 font-medium text-[var(--color-text-secondary)]">
                        Plan :
                      </div>
                      <span>{user.plan}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/archive"
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:bg-[var(--color-bg-tertiary)] ${
                        isActive('/archive') ? 'bg-[var(--color-green-overlay-3)]' : ''
                      }`}
                    >
                      <BookOpenIcon className="h-4 w-4" /> 감정 기록
                    </Link>
                  </div>

                  <div className="border-t border-[var(--color-border-primary)] py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full cursor-pointer items-center gap-2 bg-transparent px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                      <LogOutIcon className="h-4 w-4" /> 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </li>
          ) : (
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border text-2xl no-underline transition-colors hover:bg-[var(--color-overlay-3)]">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
