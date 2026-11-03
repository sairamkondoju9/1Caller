import React from 'react';

export default function Kbd({ children, className = '' }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10.5px] font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/90 rounded-[5px] shadow-[0_1px_0_1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] select-none uppercase tracking-wider ${className}`}
    >
      {children}
    </kbd>
  );
}
