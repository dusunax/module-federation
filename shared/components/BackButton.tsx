import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

function BackButton({ to, label = '돌아가기', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-3)] px-4 py-2.5 text-[13px] text-[var(--color-text-primary)] transition-all duration-300 hover:border-[var(--color-accent-green)] hover:bg-[var(--color-overlay-4)] ${className}`}
    >
      ← {label}
    </button>
  );
}

export default BackButton;
