import React from 'react';
import { Compass, Home, LayoutDashboard, PlusCircle, ArrowLeft, PhoneCall } from 'lucide-react';

export default function NotFoundView({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#0c0a17] text-white flex flex-col items-center justify-center p-6 text-center font-sans antialiased selection:bg-amber-400 selection:text-[#130e26]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(122,80,220,0.25),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative max-w-lg w-full space-y-6">
        {/* 404 badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-300">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          HTTP 404 &bull; PAGE NOT FOUND
        </div>

        {/* Large 404 Text */}
        <div className="text-7xl sm:text-9xl font-black font-display tracking-tight text-white select-none">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Lost in Autonomous Space?
          </h1>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-md mx-auto">
            The page or voice agent route you are looking for has moved, expired, or doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Quick Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Dashboard</div>
              <div className="text-xs text-white/50">Your active AI employees</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('new-employee')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#a78bfa]/50 hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7a50dc]/20 text-[#a78bfa] flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Create Employee</div>
              <div className="text-xs text-white/50">Build in under 3 minutes</div>
            </div>
          </button>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('landing')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] text-[#130e26] font-bold text-sm flex items-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
