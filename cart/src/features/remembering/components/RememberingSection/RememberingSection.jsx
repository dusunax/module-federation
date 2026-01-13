import React from 'react';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

export function RememberingSection({
  rememberingItems,
  rememberingTotalItems,
  isRemembering,
  progress,
  orderStatuses,
  rememberingStartTime,
}) {
  if (rememberingItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-5 border-b border-[rgba(163,176,135,0.3)] pb-4">
        <h2 className="m-0 text-xl font-light tracking-wider text-[#A3B087]">
          이해되는 중 ({rememberingTotalItems}개)
        </h2>
        <p className="mb-0 mt-1 text-xs font-light tracking-wide text-[rgba(163,176,135,0.8)]">
          기억으로 남기는 중입니다
        </p>
      </div>

      {/* 프로그레스바 */}
      {isRemembering && (
        <div className="mb-5 rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.3)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-light tracking-wide text-[rgba(255,248,212,0.9)]">
              이해되는 중이에요...
            </span>
            <span className="text-[13px] font-light tracking-wide text-[#A3B087]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-[3px] bg-[rgba(67,86,99,0.5)]">
            <div
              className="h-full rounded-[3px] transition-[width] duration-100 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, rgba(163, 176, 135, 0.6) 0%, rgba(163, 176, 135, 0.9) 100%)',
              }}
            />
          </div>
        </div>
      )}

      {/* 이해되는 중인 아이템 목록 (읽기 전용) */}
      <div className="mb-5">
        {rememberingItems.map((item) => {
          const { product, quantity } = item;
          const currentStatus = orderStatuses[product.id] || EMOTION_STATUS.HELD;
          const statusStyle = getStatusConfig(currentStatus);

          return (
            <div
              key={item.id}
              className="mb-4 flex items-center gap-5 rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(163,176,135,0.1)] p-6 opacity-80 backdrop-blur-[10px]"
            >
              <div className="text-5xl opacity-90">{product.emoji}</div>
              <div className="flex-1">
                <h3 className="my-0 mb-2 text-base font-light tracking-wide text-[#FFF8D4]">
                  {product.name}
                </h3>
                <p className="my-0 mb-1.5 text-sm font-light tracking-wide text-[#FFF8D4]">
                  {product.price === 0 ? '무료' : `${product.price.toLocaleString()}원`}
                </p>
                <div
                  className="mt-1 text-[11px] font-light tracking-wide"
                  style={{ color: statusStyle.color }}
                >
                  {statusStyle.icon} {statusStyle.label}
                </div>
                {rememberingStartTime && (
                  <div className="mt-1 text-[10px] font-light tracking-wide text-[rgba(163,176,135,0.7)]">
                    기록 시작:{' '}
                    {new Date(rememberingStartTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
              <div className="min-w-[40px] rounded bg-[rgba(67,86,99,0.3)] px-4 py-2 text-center text-[15px] font-light text-[rgba(255,248,212,0.7)]">
                {quantity}개
              </div>
              <div className="min-w-[100px] text-right text-base font-light tracking-wide text-[#FFF8D4]">
                {product.price === 0 ? '무료' : `${(product.price * quantity).toLocaleString()}원`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
