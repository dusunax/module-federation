import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 뒤로 가기 버튼 컴포넌트
 * @param {Object} props
 * @param {string} [props.to] - 이동할 경로 (없으면 navigate(-1))
 * @param {string} [props.label] - 버튼 텍스트 (기본값: "돌아가기")
 * @param {string} [props.className] - 추가 클래스
 */
function BackButton({ to, label = '돌아가기', className = '' }) {
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
