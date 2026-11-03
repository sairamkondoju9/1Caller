import React from 'react';

export default function HaikeiBackground({
  variant = 'dots', // 'dots' | 'wave' | 'mesh' | 'grid'
  className = '',
  opacity = 0.5
}) {
  if (variant === 'dots') {
    return (
      <svg
        className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="haikei-dots-pattern"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-zinc-300" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#haikei-dots-pattern)" />
      </svg>
    );
  }

  if (variant === 'wave') {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
        style={{ opacity }}
      >
        <svg
          viewBox="0 0 900 600"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 450L37.5 440C75 430 150 410 225 415C300 420 375 450 450 455C525 460 600 440 675 425C750 410 825 400 862.5 395L900 390V600H862.5C825 600 750 600 675 600C600 600 525 600 450 600C375 600 300 600 225 600C150 600 75 600 37.5 600H0Z"
            fill="rgba(122, 80, 220, 0.04)"
          />
          <path
            d="M0 510L37.5 500C75 490 150 470 225 465C300 460 375 470 450 480C525 490 600 500 675 495C750 490 825 470 862.5 460L900 450V600H862.5C825 600 750 600 675 600C600 600 525 600 450 600C375 600 300 600 225 600C150 600 75 600 37.5 600H0Z"
            fill="rgba(22, 163, 74, 0.03)"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <svg
        className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="haikei-grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-zinc-200/60"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#haikei-grid-pattern)" />
      </svg>
    );
  }

  // Default mesh gradient
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none ${className}`}
      style={{
        opacity,
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(122, 80, 220, 0.08) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(22, 163, 74, 0.06) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(122, 80, 220, 0.04) 0px, transparent 50%)
        `
      }}
    />
  );
}
