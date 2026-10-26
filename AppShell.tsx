import React, { useState } from 'react';
import {
  PhoneCall,
  Sliders,
  Megaphone,
  BarChart3,
  Globe2,
  Search,
  Sparkles,
  Command as CommandIcon,
  Crown,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CommandPalette } from '../ui/CommandPalette';

interface AppShellProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
  onOpenAuth: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  children
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const navItems = [
    { id: 'simulator', label: 'Call Simulator', icon: PhoneCall, badge: '413ms' },
    { id: 'builder', label: 'Flow Builder', icon: Sliders, badge: 'Sarvam+Cartesia' },
    { id: 'fleet', label: 'Fleet Manager', icon: Megaphone, badge: '21 CPS' },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, badge: '71.4%' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-[#0f0f14] antialiased">
      {/* Top Dynamic Navigation Chrome */}
      <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-[#e4e4e9] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 font-display text-lg tracking-tight font-bold text-[#0f0f14]">
              OUTPERO
              <span className="w-2 h-2 rounded-full bg-[#149e6a] inline-block animate-pulse"></span>
            </div>
            <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-[#f6f7fb] text-[#0f0e17] border border-[#f0f2f8] hidden sm:inline-flex">
              500k CCU Engine
            </span>
          </div>

          {/* Module Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all min-h-[34px] cursor-pointer',
                    isActive
                      ? 'bg-[#f6f7fb] text-[#0f0e17] font-semibold border border-[#f0f2f8]'
                      : 'text-[#6c6b7e] hover:text-[#0f0f14] hover:bg-[#f6f6f8]'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#0f0e17]' : 'text-[#6c6b7e]')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Spotlight Command Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f6f6f8] hover:bg-white text-[12px] text-[#6c6b7e] hover:text-[#0f0f14] border border-[#e4e4e9] transition-all min-h-[34px] cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search actions</span>
            <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#e4e4e9] text-[#6c6b7e] shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Public Landing Portal Toggle */}
          <button
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f6f8] hover:bg-white text-[12px] font-semibold text-[#0f0f14] border border-[#e4e4e9] transition-all min-h-[34px] cursor-pointer"
            title="Switch to Public Landing Page"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#0f0e17]" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          {/* User Account & Persona Switcher */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#f6f6f8] border border-transparent hover:border-[#e4e4e9] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#0f0e17] text-white flex items-center justify-center text-xs font-semibold font-display shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-[12px] leading-tight">
              <div className="font-semibold text-[#0f0f14] truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#6c6b7e] capitalize font-mono">
                {currentUser.role}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 pb-12">
        {children}
      </main>

      {/* Spotlight Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={onSelectTab}
      />
    </div>
  );
};