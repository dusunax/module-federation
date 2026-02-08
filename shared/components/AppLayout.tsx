import React, { ReactNode } from 'react';

interface AppLayoutProps {
  subtitle?: string;
  children: ReactNode;
}

function AppLayout({ subtitle, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--color-border-primary)] bg-black px-3 md:px-6 py-2">
        <h1 className="font-normal tracking-wider text-[var(--color-text-primary)]">
          Between Lines
        </h1>
        {subtitle && (
          <p className="text-xs font-normal text-[var(--color-text-secondary)] opacity-70">
            {subtitle}
          </p>
        )}
      </header>

      <main className="min-h-0 flex-1 p-3 md:p-6">{children}</main>

      <footer className="border-t border-[var(--color-border-primary)] bg-black  p-4 text-center font-normal">
        <p className="text-sm text-[var(--color-text-muted)]">
          이 앱은 독립적으로 실행되거나 다른 앱에 통합될 수 있습니다.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
