import React from 'react';

export function EmptyCart() {
  return (
    <div className="mx-auto max-w-[800px] p-5">
      <h2 className="mb-5 font-normal tracking-wider text-[#FFF8D4]">장바구니</h2>
      <div className="mt-5 rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.2)] px-5 py-20 text-center">
        <div className="mb-6 text-[64px] opacity-60">💭</div>
        <p className="mb-2 text-base font-normal text-[#FFF8D4]">장바구니가 비어있습니다</p>
        <p className="text-[13px] font-normal text-[rgba(255,248,212,0.85)]">순간을 추가해보세요</p>
      </div>
    </div>
  );
}
