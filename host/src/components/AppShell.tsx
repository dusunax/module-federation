import React from 'react';
import SuspenseRoute from './SuspenseRoute';
import Header from 'header/Header';
import ChatbotWidget from './ChatbotWidget';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="host-theme flex min-h-[100dvh] flex-col bg-[var(--color-bg-primary)]">
        <SuspenseRoute fallbackKey="header">
          <Header />
        </SuspenseRoute>
        <main className="flex-1 px-2 py-3 sm:px-4 md:px-1 md:py-5">{children}</main>
        <footer className="mt-6 border-t border-[var(--color-border-primary)] p-3 text-center md:mt-10 md:p-5">
          <p className="text-sm font-normal text-[var(--color-text-secondary)]">
            Booked by Feelings - 감정 기록 및 책 추천
          </p>
        </footer>
      </div>
      <ChatbotWidget />
    </>
  );
}

export default AppShell;
