import React from 'react';

export default function StatusBadge({
  status = 'online', // 'online' | 'busy' | 'offline'
  label = 'Online',
  sublabel = null,
  pulse = true,
  className = ''
}) {
  const statusColors = {
    online: {
      bg: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-800',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400'
    },
    busy: {
      bg: 'bg-amber-50/90 border-amber-200/80 text-amber-800',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400'
    },
    offline: {
      bg: 'bg-zinc-100 border-zinc-200 text-zinc-600',
      dot: 'bg-zinc-400',
      ping: 'bg-zinc-300'
    }
  };

  const current = statusColors[status] || statusColors.online;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-tight shadow-2xs select-none ${current.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      <span>{label}</span>
      {sublabel && (
        <span className="text-[10px] opacity-75 font-mono tabular-nums border-l border-current/20 pl-1.5 ml-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}
