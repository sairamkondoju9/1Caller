import React, { useState, useRef, useEffect } from 'react';
import Kbd from './ui/Kbd';
import NumberTicker from './ui/NumberTicker';
import {
  Search,
  BookOpen,
  Bell,
  Globe2,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  CreditCard,
  ChevronDown,
  User} from 'lucide-react';

export default function Navbar({
  stats,
  onOpenBilling,
  onSearch,
  currentSearch,
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigate,
  onToggleMobileMenu
}) {
const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-2xl border-b border-[#e2e4ed] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)]">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 text-[#0f0e17] hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0f0e17] flex items-center gap-1.5 font-display">
            SARVAM
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] shadow-xs shadow-[#ff7a00]/40"></span>
          </div>
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono font-medium tracking-wider text-[#0f0e17] bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200">
            Voice AI
          </span>
        </div>

        {/* Global Search */}
        <div className="relative w-72 lg:w-80 hidden md:block">
          <Search className="w-4 h-4 text-[#6c6b7e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={currentSearch || ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            placeholder="Search agents, campaigns, DND..."
            className="w-full bg-[#f6f7fb]/80 border border-[#e2e4ed] text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-[#0f0e17] focus:bg-white transition-all text-[#0f0e17] placeholder-[#6c6b7e]"
          />
          <Kbd className="absolute right-2.5 top-1/2 -translate-y-1/2">⌘K</Kbd>
        </div>
      </div>

      {/* Right Indicators & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Call Telemetry Pill (Apple HIG Frosted) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
          </span>
          <span>
            {stats?.activeCalls || 0} live calls · {stats?.callsPerMin || '0.0'} cpm
          </span>
          <span className="text-[#16a34a]/70 text-[11px] border-l border-[#bbf7d0] pl-2 font-mono">
            {stats?.talkingCount || 0} talking
          </span>
        </div>

        {/* Credit Balance Pill (Clickable) */}
        <button
          onClick={onOpenBilling}
          className="flex items-center gap-1.5 sm:gap-2 bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#ea580c] text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          title="Click to recharge wallet credits"
        >
          <span className="text-[#c2410c] font-extrabold font-mono tabular-nums text-[11px] sm:text-xs">
            ₹<NumberTicker value={Number(stats?.balanceCredits ?? 0)} decimalPlaces={2} />
          </span>
          <span className="hidden sm:inline text-[#c2410c]/70 text-[11px] font-mono tabular-nums">
            ({stats?.balanceMinutes ?? '0.0'} min)
          </span>
          <span className="w-4 h-4 rounded-full bg-[#0f0e17] text-white flex items-center justify-center text-[10px] font-black">
            +
          </span>
        </button>

        {/* Landing Page Portal Button */}
        <button
          onClick={() => onNavigate && onNavigate('landing')}
          className="hidden sm:flex items-center gap-1.5 bg-[#f6f7fb] hover:bg-[#eef0f6] text-[#0f0e17] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#e2e4ed] shadow-2xs cursor-pointer transition-all"
          title="Switch to Public Landing Page"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#0f0e17]" />
          <span>Landing Page</span>
        </button>

        {/* Top Tools Icons */}
        <div className="hidden sm:flex items-center gap-1 border-l border-[#e2e4ed] pl-2 sm:pl-3">
          <a
            href="https://sarvam.ai"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 sm:p-2 text-[#6c6b7e] hover:text-[#0f0e17] hover:bg-[#f6f7fb] rounded-xl transition-colors"
            title="Sarvam AI Platform"
          >
            <BookOpen className="w-4 h-4" />
          </a>
          <button
            onClick={() => alert("All carrier trunks operational. Low-latency multi-provider AI active.")}
            className="p-1.5 sm:p-2 text-[#6c6b7e] hover:text-[#0f0e17] hover:bg-[#f6f7fb] rounded-xl transition-colors relative cursor-pointer"
            title="System alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full absolute top-2 right-2"></span>
          </button>
        </div>

        {/* User Profile / Auth Section with Interactive Menu */}
        <div className="relative" ref={menuRef}>
          {currentUser ? (
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="flex items-center gap-2 pl-2 border-l border-[#e2e4ed] hover:opacity-85 transition-opacity cursor-pointer"
              title="Account & Workspace Settings"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-bold text-xs flex items-center justify-center text-white bg-[#0f0e17] shadow-xs shrink-0">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#0f0e17] leading-tight truncate max-w-[120px]">
                  {currentUser?.name || 'My Account'}
                </div>
                <div className="text-[10px] text-[#6c6b7e] truncate max-w-[120px] font-mono">
                  {currentUser?.email || 'authenticated'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6c6b7e] transition-transform duration-150 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-[#0f0e17] text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Account Dropdown Menu */}
          {isMenuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e2e4ed] py-2 z-50 animate-popover-in text-left">
              {/* Profile Header */}
              <div className="px-4 py-3 border-b border-[#e2e4ed]/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center text-white bg-[#0f0e17] shrink-0">
                    {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#0f0e17] truncate">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-[11px] text-[#6c6b7e] truncate font-mono">
                      {currentUser?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Workspace
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ID: {(currentUser?.id || '').slice(0, 10)}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="px-1.5 py-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onOpenBilling) onOpenBilling();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                  <span>Billing & Credits</span>
                  <span className="ml-auto font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    ₹{stats?.balanceCredits || 0}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onNavigate) onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-zinc-500" />
                  <span>Workspace Settings</span>
                </button>

                
              </div>

              {/* Sign Out Button */}
              <div className="px-1.5 pt-1.5 mt-1 border-t border-[#e2e4ed]/70">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('user_role');
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
