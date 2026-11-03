import React from 'react';
import { motion } from 'motion/react';

export default function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  layoutId = 'active-pill'
}) {
  return (
    <div className={`relative flex items-center p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/80 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative z-10 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
              isActive ? `text-zinc-900 ${activeTabClassName}` : 'text-zinc-600 hover:text-zinc-900'
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                className="absolute inset-0 bg-white rounded-lg shadow-xs border border-zinc-200/60 -z-10"
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-200/70 text-zinc-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
