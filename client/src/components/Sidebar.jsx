import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  PhoneCall,
  Zap,
  Megaphone,
  PhoneIncoming,
  Database,
  MessageSquare,
  GraduationCap,
  Phone,
  BarChart3,
  CreditCard,
  Settings,
  Code2,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  teamWorkingCount = 3,
  currentUser,
  isMobileOpen = false,
  onCloseMobile
}) {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-employees', label: 'My Employees', icon: Users },
        { id: 'new-employee', label: 'New employee', icon: UserPlus },
        { id: 'talk-to-employee', label: 'Talk to an employee', icon: PhoneCall },
      ]
    },
    {
      title: 'CALLING CHANNELS',
      items: [
        { id: 'instant-leads', label: 'Instant Leads', icon: Zap },
        { id: 'bulk-campaigns', label: 'Bulk Campaigns', icon: Megaphone },
        { id: 'inbound-desk', label: 'Inbound Calls', icon: PhoneIncoming, badge: 'NEW' },
      ]
    },
    {
      title: 'RESULTS & SETUP',
      items: [
        { id: 'leads-results', label: 'Leads & Results', icon: Database },
        { id: 'all-conversations', label: 'All Conversations', icon: MessageSquare },
        { id: 'train-employees', label: 'Train Employees', icon: GraduationCap },
        { id: 'phone-numbers', label: 'Phone Numbers', icon: Phone },
        { id: 'performance', label: 'Performance', icon: BarChart3 },
        { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'developers', label: 'Developers & API', icon: Code2, badge: 'v1' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop Sticky + Mobile Off-Canvas Drawer) */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-50 md:z-10 w-64 bg-white/95 md:bg-white/80 backdrop-blur-2xl border-r border-[#e2e4ed] flex flex-col justify-between shrink-0 select-none h-[calc(100vh-4rem)] transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto">
          {/* Mobile Close Button Header */}
          <div className="md:hidden flex items-center justify-between pb-2 border-b border-[#e2e4ed] mb-3 px-2">
            <span className="text-xs font-bold text-[#0f0e17] font-display">Navigation Menu</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-[#6c6b7e] hover:text-[#0f0e17] hover:bg-[#f6f7fb] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-mono font-medium text-[#6c6b7e] px-3 mb-2 tracking-widest uppercase">
                {section.title}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#f6f7fb] text-[#0f0e17] font-bold shadow-xs border border-[#e2e4ed]'
                          : 'text-[#3a3f5c] hover:bg-[#f0f2f8]/80 hover:text-[#0f0e17]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-transform duration-150 ${
                            isActive
                              ? 'text-[#0f0e17]'
                              : 'text-[#9392a5]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase ${
                            isActive
                              ? 'bg-[#0f0e17] text-white'
                              : 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Customer Workspace Status */}
        <div className="p-4 border-t border-[#e2e4ed] bg-[#f6f7fb]/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#0f0e17]">AI Teammates</span>
            <span className="text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0] font-mono">
              {teamWorkingCount} Active
            </span>
          </div>
          <div className="text-[11px] text-[#6c6b7e] flex items-center justify-between pt-1 font-mono">
            <span>Telephony Gateways</span>
            <span className="text-[#16a34a] font-bold">Online · 100%</span>
          </div>

          {/* Quick Compliance & Resource Links (Identical to app.outpero.com) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-3 mt-3 border-t border-[#e2e4ed]/70 text-[10.5px] text-[#6c6b7e]">
            <a
              href="https://docs.outpero.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0f0e17] transition-colors"
            >
              Help &amp; Docs
            </a>
            <button
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab('terms');
                if (onCloseMobile) onCloseMobile();
              }}
              className="hover:text-[#0f0e17] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab('privacy');
                if (onCloseMobile) onCloseMobile();
              }}
              className="hover:text-[#0f0e17] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab('refunds');
                if (onCloseMobile) onCloseMobile();
              }}
              className="hover:text-[#0f0e17] transition-colors cursor-pointer"
            >
              Refund
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab('contact');
                if (onCloseMobile) onCloseMobile();
              }}
              className="hover:text-[#0f0e17] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <a
              href="https://www.outpero.com/ai-employee"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0f0e17] transition-colors font-medium text-[#7a50dc]"
            >
              outpero.com
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
