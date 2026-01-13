import React from 'react';

/**
 * 공통 앱 레이아웃 컴포넌트
 * @param {Object} props
 * @param {string} props.subtitle - 헤더 부제목 (예: "Products - 독립 실행 모드 (포트 3002)")
 * @param {React.ReactNode} props.children - 메인 컨텐츠
 */
function AppLayout({ subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--color-border-primary)] bg-black px-6 py-2">
        <h1 className="font-light tracking-wider text-[var(--color-text-primary)]">
          Between Lines
        </h1>
        {subtitle && (
          <p className="text-xs font-light text-[var(--color-text-secondary)] opacity-70">
            {subtitle}
          </p>
        )}
      </header>

      <main className="min-h-0 flex-1 p-6">{children}</main>

      <footer className="border-t border-[var(--color-border-primary)] bg-black  p-4 text-center font-light">
        <p className="text-sm text-[var(--color-text-muted)]">
          이 앱은 독립적으로 실행되거나 다른 앱에 통합될 수 있습니다.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
