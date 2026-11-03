import React from 'react';

export default function BorderBeam({
  size = 200,
  duration = 8,
  delay = 0,
  colorFrom = '#7a50dc',
  colorTo = '#16a34a',
  className = ''
}) {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--delay': `-${delay}s`,
        '--color-from': colorFrom,
        '--color-to': colorTo
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square inset-0 w-full animate-border-beam"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, var(--color-from) 40deg, var(--color-to) 80deg, transparent 120deg)`
        }}
      />
    </div>
  );
}
