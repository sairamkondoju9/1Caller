import React from 'react';
import { X, Phone, Sparkles } from 'lucide-react';

export default function WelcomeCreditsModal({
  isOpen,
  onClose,
  onStartFirstCall,
  onLookAround
}) {
  if (!isOpen) return null;

  const handleStartCall = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    if (onStartFirstCall) {
      onStartFirstCall();
    } else {
      onClose();
    }
  };

  const handleLookAround = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    if (onLookAround) {
      onLookAround();
    } else {
      onClose();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    onClose();
  };

  return (
    <div 
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn cursor-pointer"
    >
      {/* Modal Card (Google Stitch Clean White Card) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[28px] p-7 sm:p-9 shadow-2xl border border-[#e2e4ed] text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Top-Right Circular Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#6c6b7e] hover:text-[#0f0e17] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sarvam Squircle Phone Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0f0e17] flex items-center justify-center shadow-lg shadow-[#0f0e17]/30 mb-4">
          <Phone className="w-7 h-7 text-white fill-white rotate-[-12deg]" />
        </div>

        {/* Big Amount Typography */}
        <div className="text-5xl font-black text-[#0f0e17] tracking-tight font-display mb-1">
          ₹50
        </div>

        {/* Headline */}
        <h3 className="text-lg sm:text-xl font-black text-[#0f0e17] tracking-tight font-display mb-3">
          free credits, added to your account
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#6c6b7e] leading-relaxed max-w-xs mb-7 font-sans">
          That&apos;s about 6 real calls — enough to hear your employee work. Yours to spend whenever you like — they never expire, and there&apos;s nothing to enter.
        </p>

        {/* CTAs */}
        <div className="w-full space-y-3">
          <button
            onClick={handleStartCall}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm tracking-tight shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            Start my first call
          </button>

          <button
            onClick={handleLookAround}
            className="w-full py-2.5 text-xs font-semibold text-[#6c6b7e] hover:text-[#0f0e17] transition-colors cursor-pointer"
          >
            Look around first
          </button>
        </div>
      </div>
    </div>
  );
}
