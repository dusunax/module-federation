import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from 'products/cartStore';
import { useAuthStore } from 'auth/authStore';
import { useEnergyStore } from 'auth/energyStore';
import { useRememberingStore } from 'auth/rememberingStore';
import BooksRecommendationButton from './components/BooksRecommendationButton';
import { UserRole } from '@shared/types/api';
import {
  List,
  ShoppingCartIcon,
  LogOutIcon,
  HistoryIcon,
  BookMarkedIcon,
  XIcon,
  UserIcon,
  LineChartIcon,
  ShieldIcon,
  MenuIcon,
} from 'lucide-react';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);

  const items = useCartStore((state) => state.items);
  const rememberingItems = useRememberingStore((state) => state.rememberingItems);
  const rememberingItemIds = Object.keys(rememberingItems).map(Number);
  const { user, signOut } = useAuthStore();
  const { current: currentEnergy, maxEnergy } = useEnergyStore();

  const totalItems = Object.values(items)
    .filter((item) => !rememberingItemIds.includes(item.id))
    .reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => {
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
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className="relative border-b border-[var(--color-border-primary)] bg-[rgba(49,54,71,0.95)] p-3 md:p-5 text-[var(--color-text-primary)] backdrop-blur-[10px]"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        <nav className="flex items-center justify-between">
          <Link
            to="/"
            className="text-[var(--color-text-primary)] no-underline hidden md:block"
          >
            <h2 className="m-0 text-lg md:text-4xl font-normal tracking-[1px]">Booked by Feelings</h2>
            <p className="mb-0 mt-1 text-xs font-normal text-[var(--color-text-secondary)] hidden sm:block">
              감정 기록 및 책 추천
            </p>
          </Link>
          <ul className="m-0 mt-1 flex list-none items-center gap-1.5 p-0 md:hidden">
            <BooksRecommendationButton
              href="https://micro-frontend-shell-two.vercel.app/books"
              label="추천"
              ariaLabel="북스 페이지로 이동"
              className="list-item md:hidden"
              anchorClassName="h-10 px-3 py-1.5 text-[11px]"
              hideTooltip
            />
          </ul>
          <ul className="m-0 mt-1 flex list-none items-center gap-1.5 sm:gap-3 p-0 md:mt-0">
            <BooksRecommendationButton
              href="https://micro-frontend-shell-two.vercel.app/books"
              label="책 추천 받기"
              ariaLabel="북스 페이지로 이동"
              tooltip="최근 경험한 감정에 어울리는 책을 알아보세요"
              className="hidden md:list-item"
            />
            <li className="hidden md:list-item">
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-green-overlay-3)] px-3 py-0.5 font-semibold text-[var(--color-accent-green)]"
                aria-label="energy-badge"
              >
                ⚡ {currentEnergy}/{maxEnergy}
              </span>
            </li>
            <li className="hidden md:list-item">
              <Link
                to="/"
                className={`flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors ${
                  isActive('/')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)]'
                }`}
                aria-label="홈 페이지로 이동"
              >
                <List className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className={`relative flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors ${
                  isActive('/cart')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)]'
                }`}
                aria-label="장바구니 페이지로 이동"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {totalItems > 0 && (
                  <span
                    className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-orange)] text-xs font-bold text-white"
                    aria-label="cart-count"
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
            <li className="hidden md:list-item">
              <Link
                to="/archive"
                className={`flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors ${
                  isActive('/archive')
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)]'
                    : 'border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)]'
                }`}
                aria-label="감정 기록으로 이동"
              >
                <HistoryIcon className="h-4 w-4" />
              </Link>
            </li>
            {user ? (
              <li className="relative hidden md:list-item" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="profile-menu-toggle"
                  className="flex h-10 w-10 md:h-8 md:w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-transparent transition-colors hover:bg-[var(--color-overlay-3)]"
                >
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-full w-full rounded-full"
                    />
                  )}
                </button>

                <div
                  className={ `absolute -top-4 right-0 w-[calc(100vw-24px)] sm:w-auto min-w-[200px] max-w-[300px] rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-dark)] pb-2 pt-6 shadow-lg ${isProfileOpen ? 'visible' : 'invisible pointer-events-none'}`}
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
                      to="/collection"
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:bg-[var(--color-bg-tertiary)] ${
                        isActive('/collection') ? 'bg-[var(--color-green-overlay-3)]' : ''
                      }`}
                    >
                      <BookMarkedIcon className="h-4 w-4" /> 감정 도감
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:bg-[var(--color-bg-tertiary)] ${
                        isActive('/dashboard') ? 'bg-[var(--color-green-overlay-3)]' : ''
                      }`}
                    >
                      <LineChartIcon className="h-4 w-4" /> 대시보드
                    </Link>
                    {user.role === UserRole.ADMIN && (
                      <Link
                        to="/admin/emotions"
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:bg-[var(--color-bg-tertiary)] ${
                          isActive('/admin/emotions') ? 'bg-[var(--color-green-overlay-3)]' : ''
                        }`}
                      >
                        <ShieldIcon className="h-4 w-4" /> 관리자 페이지
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[var(--color-border-primary)] py-1">
                    <button
                      onClick={handleSignOut}
                      aria-label="profile-logout"
                      className="flex w-full cursor-pointer items-center gap-2 bg-transparent px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                      <LogOutIcon className="h-4 w-4" /> 로그아웃
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li className="hidden md:list-item">
                <Link
                  to="/login"
                  state={{ from: location }}
                  aria-label="login-link"
                  className="flex h-10 w-10 md:h-8 md:w-8 cursor-pointer items-center justify-center rounded-full border text-2xl no-underline transition-colors hover:bg-[var(--color-overlay-3)]"
                >
                  <UserIcon className="h-4 w-4" />
                </Link>
              </li>
            )}
            <li className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="모바일 메뉴 열기"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--color-border-primary)] bg-transparent text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-overlay-3)]"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </li>
          </ul>
        </nav>
      </header>
      {/* Mobile Side Drawer — header 밖에 렌더링하여 stacking context 회피 */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[280px] max-w-[80vw] transform bg-[var(--color-bg-primary)] shadow-lg transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close Button */}
          <div className="flex items-center justify-end p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="모바일 메뉴 닫기"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-transparent text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay-3)] hover:text-[var(--color-text-primary)]"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Profile Info */}
          {user && (
            <div className="border-b border-[var(--color-border-primary)] px-5 pb-4">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {user.displayName}
                  </p>
                  <p className="m-0 truncate text-xs text-[var(--color-text-secondary)]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="border-b border-[var(--color-border-primary)] py-2">
            <Link
              to="/"
              className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                isActive('/') ? 'bg-[var(--color-green-overlay-3)]' : ''
              }`}
            >
              <List className="h-4 w-4" /> 홈
            </Link>
            <Link
              to="/cart"
              className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                isActive('/cart') ? 'bg-[var(--color-green-overlay-3)]' : ''
              }`}
            >
              <ShoppingCartIcon className="h-4 w-4" /> 장바구니
              {totalItems > 0 && (
                <span className="ml-auto rounded-full bg-[var(--color-accent-orange)] px-2 py-0.5 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                isActive('/dashboard') ? 'bg-[var(--color-green-overlay-3)]' : ''
              }`}
            >
                  <LineChartIcon className="h-4 w-4" /> 대시보드
            </Link>
            {user && (
              <>
                <Link
                  to="/collection"
                  className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                    isActive('/collection') ? 'bg-[var(--color-green-overlay-3)]' : ''
                  }`}
                >
                  <BookMarkedIcon className="h-4 w-4" /> 감정 도감
                </Link>
                <Link
                  to="/archive"
                  className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                    isActive('/archive') ? 'bg-[var(--color-green-overlay-3)]' : ''
                  }`}
                >
                  <HistoryIcon className="h-4 w-4" /> 감정 기록
                </Link>
                {user.role === UserRole.ADMIN && (
                  <Link
                    to="/admin/emotions"
                    className={`flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)] ${
                      isActive('/admin/emotions') ? 'bg-[var(--color-green-overlay-3)]' : ''
                    }`}
                  >
                    <ShieldIcon className="h-4 w-4" /> 관리자
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Energy & Plan */}
          {user && (
            <div className="border-b border-[var(--color-border-primary)] px-5 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--color-text-secondary)]">에너지:</span>
                <span>⚡ {currentEnergy}/{maxEnergy}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="text-[var(--color-text-secondary)]">플랜:</span>
                <span>{user.plan}</span>
              </div>
            </div>
          )}
          {/* Sign Out / Sign In */}
          <div className="px-5 py-3">
            {user ? (
              <button
                onClick={handleSignOut}
                aria-label="drawer-logout"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-transparent px-0 py-2 text-left text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <LogOutIcon className="h-4 w-4" /> 로그아웃
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: location }}
                className="flex w-full items-center gap-3 rounded-lg py-2 text-sm text-[var(--color-text-primary)] no-underline transition-colors hover:text-[var(--color-accent-green)]"
              >
                <UserIcon className="h-4 w-4" /> 로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
