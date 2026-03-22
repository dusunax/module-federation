import { BookOpenTextIcon } from "lucide-react";

interface BooksRecommendationButtonProps {
  href: string;
  label: string;
  tooltip?: string;
  ariaLabel: string;
  target?: string;
  rel?: string;
  className?: string;
  anchorClassName?: string;
  hideTooltip?: boolean;
}

function BooksRecommendationButton({
  href,
  label,
  tooltip,
  ariaLabel,
  target = '_blank',
  rel = 'noopener noreferrer',
  className = 'hidden md:list-item',
  anchorClassName = '',
  hideTooltip = false,
}: BooksRecommendationButtonProps) {
  return (
    <li className={`relative ${className}`}>
      <a
        href={href}
        target={target}
        rel={rel}
        className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-accent-green)] bg-[var(--color-green-overlay-3)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-green)] no-underline transition-colors hover:bg-[var(--color-overlay-3)] ${anchorClassName}`}
        aria-label={ariaLabel}
      >
        <BookOpenTextIcon className="h-4 w-4" />
        {label}
      </a>
      {!hideTooltip && tooltip && (
        <div className="pointer-events-none absolute right-0 top-10 translate-y-0.5 w-auto rounded-md border border-[var(--color-accent-orange)] bg-[#0f2b3f] px-2 py-1 text-[11px] text-[#d6fbff] shadow-lg shadow-black/45 font-semibold">
          <span className="absolute right-2 top-[-8px] border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-[var(--color-accent-orange)]"></span>
          <span className="absolute right-2 top-[-6px] border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#0f2b3f]"></span>
          <p className="m-0 whitespace-nowrap font-medium">{tooltip}</p>
        </div>
      )}
    </li>
  );
}

export default BooksRecommendationButton;
