import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  PhoneCall,
  Sliders,
  Megaphone,
  BarChart3,
  Globe2,
  ShieldAlert,
  Zap,
  Sparkles,
  PhoneForwarded,
  Search
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // toggled from parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-[#e4e4e9] rounded-2xl shadow-2xl overflow-hidden">
        <Command label="Global Command Palette">
          <div className="flex items-center px-4 py-3 border-b border-[#e4e4e9]">
            <Search className="w-4 h-4 text-[#6b6b78] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a screen, intent, or agent action... (Esc to close)"
              className="w-full bg-transparent text-xs text-[#0f0e17] placeholder:text-[#6b6b78] focus:outline-none"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-[#6b6b78]">
              No matching modules or actions found.
            </Command.Empty>

            <Command.Group heading="CORE SCREENS & MODULES" className="text-[10px] font-mono font-medium text-[#6b6b78] px-3 py-1.5 uppercase tracking-wider">
              <Command.Item
                onSelect={() => {
                  onSelectTab('simulator');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#0f0e17]" />
                <span className="font-medium">Live Call Simulator &amp; Stage Waterfall</span>
                <span className="ml-auto text-[11px] text-[#6b6b78] font-mono">413ms p50</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSelectTab('builder');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <Sliders className="w-4 h-4 text-[#149e6a]" />
                <span className="font-medium">Voice Agent Workspace &amp; Flow Builder</span>
                <span className="ml-auto text-[11px] text-[#6b6b78] font-mono">Sarvam + Cartesia</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSelectTab('fleet');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <Megaphone className="w-4 h-4 text-[#d97706]" />
                <span className="font-medium">Campaign &amp; Inbound Fleet Manager</span>
                <span className="ml-auto text-[11px] text-[#6b6b78] font-mono">21 CPS agreed</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSelectTab('analytics');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-[#0f0e17]" />
                <span className="font-medium">Executive Analytics &amp; Latency Board</span>
                <span className="ml-auto text-[11px] text-[#6b6b78] font-mono">71.4% Margin</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="QUICK ACTIONS" className="text-[10px] font-mono font-medium text-[#6b6b78] px-3 py-1.5 uppercase tracking-wider mt-2 border-t border-[#e4e4e9] pt-2">
              <Command.Item
                onSelect={() => {
                  onSelectTab('simulator');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-[#d97706]" />
                <span className="font-medium">Trigger 142ms Barge-in Test</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  onSelectTab('landing');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0f0e17] hover:bg-[#f6f7fb] hover:text-[#0f0e17] cursor-pointer transition-colors"
              >
                <Globe2 className="w-4 h-4 text-[#0f0e17]" />
                <span className="font-medium">Open Public Apple Duo Landing Portal</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};