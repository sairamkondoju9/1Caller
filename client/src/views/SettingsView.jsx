import { getAuthHeaders } from '../utils/api';
import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Clock,
  PhoneCall,
  Sliders,
  Bell,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck,
  RefreshCw,
  Cpu,
  Sparkles,
  Zap
} from 'lucide-react';

export default function SettingsView({ onTriggerWelcomeCredits }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'calling-rules' | 'smart-followups' | 'dnd'
  
  // Settings Form State
  const [settings, setSettings] = useState({
    companyName: 'Sarvam Real Estate AI',
    supportEmail: 'contact@sarvamvoice.com',
    alertPhone: '+91 98490 12345',
    defaultLanguage: 'te',
    traiEnforced: true,
    pacingCps: 5,
    maxConcurrency: 50,
    callerMemory: true,
    autoReschedule: true,
    maxRetries: 2,
    retryDelayHours: 3,
    carrierFallback: true
  });

  // DND Registry State
  const [dncList, setDncList] = useState([]);
  const [dncSearch, setDncSearch] = useState('');
  const [newDncPhone, setNewDncPhone] = useState('');
  const [newDncReason, setNewDncReason] = useState('Customer opt-out request');
  const [showAddDnc, setShowAddDnc] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkDnc, setShowBulkDnc] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load Settings and DND List
  const fetchSettingsAndDnc = () => {
    fetch('/api/settings', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            companyName: data.company_name || prev.companyName,
            supportEmail: data.support_email || prev.supportEmail,
            alertPhone: data.alert_phone || prev.alertPhone,
            defaultLanguage: data.default_language || prev.defaultLanguage,
            traiEnforced: data.trai_enforced !== 'false',
            pacingCps: parseInt(data.pacing_cps) || prev.pacingCps,
            maxConcurrency: parseInt(data.max_concurrency) || prev.maxConcurrency,
            callerMemory: data.caller_memory !== 'false',
            autoReschedule: data.auto_reschedule !== 'false',
            maxRetries: parseInt(data.max_retries) || prev.maxRetries
          }));
        }
      })
      .catch(console.error);

    fetch('/api/dnc', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setDncList(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSettingsAndDnc();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const payload = {
        company_name: settings.companyName,
        support_email: settings.supportEmail,
        alert_phone: settings.alertPhone,
        default_language: settings.defaultLanguage,
        trai_enforced: settings.traiEnforced,
        pacing_cps: settings.pacingCps,
        max_concurrency: settings.maxConcurrency,
        caller_memory: settings.callerMemory,
        auto_reschedule: settings.autoReschedule,
        max_retries: settings.maxRetries
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    }
  };

  const handleAddSingleDnc = async (e) => {
    e.preventDefault();
    if (!newDncPhone.trim()) return;

    try {
      const res = await fetch('/api/dnc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ phone: newDncPhone, reason: newDncReason })
      });
      const data = await res.json();
      if (data.success) {
        setNewDncPhone('');
        setShowAddDnc(false);
        fetchSettingsAndDnc();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAddDnc = async () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length === 0) return;

    for (const phone of lines) {
      await fetch('/api/dnc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ phone, reason: 'Bulk CSV / Manual Upload' })
      });
    }

    setBulkInput('');
    setShowBulkDnc(false);
    fetchSettingsAndDnc();
  };

  const handleDeleteDnc = async (id) => {
    try {
      await fetch(`/api/dnc/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchSettingsAndDnc();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDnc = dncList.filter(item =>
    item.phone.toLowerCase().includes(dncSearch.toLowerCase()) ||
    item.reason.toLowerCase().includes(dncSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#0f0e17] font-display">Settings &amp; Rules</h1>
            <span className="text-xs bg-[#f0f1f6] text-[#3a3f5c] font-semibold px-2.5 py-0.5 rounded-full border border-[#e2e4ed]">
              Workspace Config
            </span>
          </div>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Configure dial pacing, strict TRAI compliance hours, Smart Follow-ups memory, and DND registry.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-[#f0f1f6] p-1 rounded-xl border border-[#e2e4ed]">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'general' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('calling-rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'calling-rules' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Calling &amp; Pacing
          </button>
          <button
            onClick={() => setActiveTab('smart-followups')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'smart-followups' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Smart Follow-ups
          </button>
          <button
            onClick={() => setActiveTab('dnd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'dnd' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            DND Registry
          </button>
        </div>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17]">Organization &amp; Workspace Profile</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">Basic details used across employee greetings and system alerts.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a3f5c]">Company / Brand Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="apple-glass-input w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a3f5c]">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="apple-glass-input w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a3f5c]">Alert Phone Number</label>
                <input
                  type="text"
                  value={settings.alertPhone}
                  onChange={(e) => setSettings({ ...settings, alertPhone: e.target.value })}
                  className="apple-glass-input w-full text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a3f5c]">Default Primary Language</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="apple-glass-input w-full text-xs"
                >
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="en">English (Indian)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a3f5c]">Timezone</label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (IST - UTC+05:30)"
                  className="apple-glass-input w-full text-xs text-[#6c6b7e] cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Onboarding & Welcome Bonus Modal Testing */}
            <div className="pt-4 border-t border-[#e2e4ed] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#0f0e17] font-display">Welcome ₹50 Free Credits Dialog</h3>
                <p className="text-[11px] text-[#6c6b7e]">Shown selectively upon new account onboarding or first sign-in (controlled via localStorage).</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('outpero_welcome_credits_claimed');
                    alert('Bonus state reset in browser localStorage. The ₹50 credit modal will display upon next sign-in or preview.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e4ed] text-[11px] font-semibold text-[#6c6b7e] hover:bg-[#f0f1f6] cursor-pointer"
                >
                  Reset Bonus State
                </button>
                {onTriggerWelcomeCredits && (
                  <button
                    type="button"
                    onClick={onTriggerWelcomeCredits}
                    className="px-3 py-1.5 rounded-lg bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] text-[11px] font-bold hover:bg-[#f0f2f8] cursor-pointer"
                  >
                    Preview ₹50 Modal
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e4ed] flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Changes
            </button>
            {savedSuccess && (
              <span className="text-xs text-[#16a34a] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved!
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CALLING & PACING RULES */}
      {activeTab === 'calling-rules' && (
        <div className="space-y-6 max-w-4xl">
          {/* TRAI Hours Strict Enforcement Card */}
          <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f0e17]">TRAI Regulatory Calling Window (09:00 - 21:00 IST)</h3>
                  <p className="text-xs text-[#6c6b7e] mt-0.5 max-w-xl">
                    Indian telecom regulations strictly prohibit automated promotional calls outside 9:00 AM to 9:00 PM. Calls queued outside this window will automatically hold until 09:00 AM next morning.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.traiEnforced}
                  onChange={(e) => setSettings({ ...settings, traiEnforced: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e2e4ed] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e4ed] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f0e17]"></div>
              </label>
            </div>

            <div className="bg-[#f8f9fc] p-3 rounded-lg border border-[#e2e4ed] text-xs text-[#3a3f5c] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ea580c] shrink-0" />
              <span>
                Status: <strong>Fail-Closed Gate Active</strong>. System drops dials immediately if server timestamp is outside 09:00:00 - 20:59:59 IST.
              </span>
            </div>
          </div>

          {/* Dial Pacing & Concurrency Controls */}
          <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#0f0e17]">Dial Pacing &amp; Concurrency Limits</h3>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Control Calls Per Second (CPS) to prevent carrier spam flagging.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#3a3f5c]">Calls Per Second (CPS) Pacing</span>
                  <span className="text-[#0f0e17] font-bold bg-[#f6f7fb] px-2 py-0.5 rounded border border-[#e2e4ed]">
                    {settings.pacingCps} CPS
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="21"
                  value={settings.pacingCps}
                  onChange={(e) => setSettings({ ...settings, pacingCps: parseInt(e.target.value) })}
                  className="w-full accent-[#0f0e17] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6c6b7e]">
                  <span>1 CPS (Conservative)</span>
                  <span>10 CPS</span>
                  <span>21 CPS (Max Trunk Rate)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#3a3f5c]">Max Concurrent Simultaneous Calls</span>
                  <span className="text-[#0f0e17] font-bold bg-[#f6f7fb] px-2 py-0.5 rounded border border-[#e2e4ed]">
                    {settings.maxConcurrency} Calls
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={settings.maxConcurrency}
                  onChange={(e) => setSettings({ ...settings, maxConcurrency: parseInt(e.target.value) })}
                  className="w-full accent-[#0f0e17] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6c6b7e]">
                  <span>5 Live</span>
                  <span>250 Live</span>
                  <span>500 Live CCU</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e2e4ed] flex items-center justify-between">
              <div className="text-xs text-[#6c6b7e]">
                Primary Carrier: <strong className="text-[#0f0e17]">Sarvam Telephony Direct Trunk</strong> (Auto-failover to Exotel &amp; Plivo)
              </div>
              <button
                onClick={handleSaveSettings}
                className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs"
              >
                Apply Pacing Rules
              </button>
            </div>
          </div>

          {/* Primary Voice Engine Card */}
          <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f0e17]">Primary Voice Synthesis Engine</h3>
                <p className="text-xs text-[#6c6b7e] mt-0.5">Select default streaming TTS engine across all outbound campaigns</p>
              </div>
              <span className="text-[10px] font-bold bg-[#f0fdf4] text-[#16a34a] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                Sarvam + Cartesia Dual-Path Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl border-2 border-[#0f0e17] bg-[#f6f7fb]/50 space-y-2 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f0e17] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Cartesia Sonic-2 (Primary)
                  </span>
                  <span className="text-[10px] font-black bg-[#0f0e17] text-white px-2 py-0.5 rounded-full uppercase">
                    Default
                  </span>
                </div>
                <p className="text-[11px] text-[#3a3f5c] leading-relaxed">
                  Sub-80ms first audio chunk streaming. High emotional prosody for English, Hindi, and Hinglish calls.
                </p>
                <div className="text-[10px] font-mono text-[#0f0e17] pt-1 border-t border-[#e2e4ed]">
                  Latency: 78ms · Voice: Kavya / Arjun Natural
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] space-y-2 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f0e17] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0f0e17]" />
                    Sarvam Bulbul V4 Flash
                  </span>
                  <span className="text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                    Indic Sovereign
                  </span>
                </div>
                <p className="text-[11px] text-[#6c6b7e] leading-relaxed">
                  Regional Indic engine for Telugu, Tamil, Kannada, Marathi, and Bengali native phrasing.
                </p>
                <div className="text-[10px] font-mono text-[#6c6b7e] pt-1 border-t border-[#e2e4ed]">
                  Latency: 95ms · Language: te-IN / ta-IN / kn-IN
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART FOLLOW-UPS & MEMORY */}
      {activeTab === 'smart-followups' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17]">Smart Follow-ups &amp; Caller Memory</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">
              Empower your AI employees with context persistence and automated callback rescheduling.
            </p>
          </div>

          <div className="divide-y divide-[#e2e4ed] space-y-5">
            {/* Feature 1: Caller Memory */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#0f0e17] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#0f0e17]" />
                  Cross-Campaign Caller Memory
                </div>
                <p className="text-xs text-[#6c6b7e] leading-relaxed max-w-xl">
                  When a lead calls back or answers a second campaign, the AI remembers their previous answers (e.g. "Hi Ramesh, following up on the 3 BHK villa in Gachibowli we discussed earlier!").
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.callerMemory}
                  onChange={(e) => setSettings({ ...settings, callerMemory: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e2e4ed] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e4ed] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f0e17]"></div>
              </label>
            </div>

            {/* Feature 2: Automated Callback Rescheduling */}
            <div className="pt-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#0f0e17] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#16a34a]" />
                  Automated Callback Rescheduling
                </div>
                <p className="text-xs text-[#6c6b7e] leading-relaxed max-w-xl">
                  If the prospect says "I'm in a meeting, call me at 4 PM" or "Call tomorrow morning", the AI parses the exact requested timestamp and automatically places an outbound call at that precise time.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.autoReschedule}
                  onChange={(e) => setSettings({ ...settings, autoReschedule: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e2e4ed] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e4ed] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f0e17]"></div>
              </label>
            </div>

            {/* Feature 3: Unanswered Call Auto-Retries */}
            <div className="pt-5 space-y-3">
              <div className="text-sm font-bold text-[#0f0e17] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#0f0e17]" />
                Unanswered &amp; Busy Line Auto-Retries
              </div>
              <p className="text-xs text-[#6c6b7e] max-w-xl">
                Automatically re-attempt calls when line is busy or unanswered.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3a3f5c]">Max Retry Attempts</label>
                  <select
                    value={settings.maxRetries}
                    onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
                    className="apple-glass-input w-full text-xs"
                  >
                    <option value={1}>1 Retry</option>
                    <option value={2}>2 Retries (Recommended)</option>
                    <option value={3}>3 Retries</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3a3f5c]">Delay Between Retries</label>
                  <select
                    value={settings.retryDelayHours}
                    onChange={(e) => setSettings({ ...settings, retryDelayHours: parseInt(e.target.value) })}
                    className="apple-glass-input w-full text-xs"
                  >
                    <option value={2}>After 2 Hours</option>
                    <option value={3}>After 3 Hours</option>
                    <option value={24}>Next Day at same time</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e4ed] flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              Save Follow-up Rules
            </button>
            {savedSuccess && (
              <span className="text-xs text-[#16a34a] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Saved successfully!
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DND / DO NOT CALL REGISTRY */}
      {activeTab === 'dnd' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0f0e17]">Do Not Call (DND) Blacklist</h2>
                <span className="text-xs bg-[#f0fdf4] text-[#16a34a] font-semibold px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                  TRAI NDNC Scrubbing Active
                </span>
              </div>
              <p className="text-xs text-[#6c6b7e] mt-0.5">
                Phone numbers in this list will never be dialed under any campaign. Automatic zero-cost scrub.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowAddDnc(true)}
                className="flex items-center gap-1.5 bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Number
              </button>
              <button
                onClick={() => setShowBulkDnc(true)}
                className="flex items-center gap-1.5 bg-[#f0f1f6] hover:bg-[#e2e4ed] text-[#0f0e17] font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-[#e2e4ed]"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk Import
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#6c6b7e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={dncSearch}
              onChange={(e) => setDncSearch(e.target.value)}
              placeholder="Search phone number or reason..."
              className="apple-glass-input w-full pl-9 pr-3 py-1.5 text-xs"
            />
          </div>

          {/* DND List Table */}
          <div className="border border-[#e2e4ed] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fc] text-[#6c6b7e] font-semibold border-b border-[#e2e4ed] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Blocked Phone Number</th>
                  <th className="py-2.5 px-4">Reason / Source</th>
                  <th className="py-2.5 px-4">Date Added</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e4ed] text-[#3a3f5c]">
                {filteredDnc.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6c6b7e]">
                      No blocked numbers found.
                    </td>
                  </tr>
                ) : (
                  filteredDnc.map((item) => (
                    <tr key={item.id} className="hover:bg-white/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#0f0e17]">{item.phone}</td>
                      <td className="py-3 px-4 text-[#3a3f5c]">{item.reason}</td>
                      <td className="py-3 px-4 text-[#6c6b7e]">
                        {item.added_at ? new Date(item.added_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteDnc(item.id)}
                          className="text-[#6c6b7e] hover:text-red-600 p-1 rounded cursor-pointer transition-colors"
                          title="Remove from DND"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Single DND Modal */}
      {showAddDnc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="apple-glass rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-white/80 bg-white/95 backdrop-blur-2xl">
            <h3 className="font-bold text-[#0f0e17] text-sm">Add Phone to DND Blacklist</h3>
            <form onSubmit={handleAddSingleDnc} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3a3f5c]">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newDncPhone}
                  onChange={(e) => setNewDncPhone(e.target.value)}
                  className="apple-glass-input w-full text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3a3f5c]">Reason</label>
                <input
                  type="text"
                  value={newDncReason}
                  onChange={(e) => setNewDncReason(e.target.value)}
                  className="apple-glass-input w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDnc(false)}
                  className="px-3 py-1.5 text-xs text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#0f0e17] hover:bg-[#1f1e28] text-white rounded-xl cursor-pointer shadow-xs"
                >
                  Add to Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add DND Modal */}
      {showBulkDnc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="apple-glass rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-white/80 bg-white/95 backdrop-blur-2xl">
            <div>
              <h3 className="font-bold text-[#0f0e17] text-sm">Bulk Import DND Numbers</h3>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Paste one phone number per line.</p>
            </div>

            <textarea
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="+91 9876543210&#10;+91 9123456789&#10;+91 9988776655"
              className="apple-glass-input w-full text-xs font-mono resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkDnc(false)}
                className="px-3 py-1.5 text-xs text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAddDnc}
                className="px-4 py-1.5 text-xs font-bold bg-[#0f0e17] hover:bg-[#1f1e28] text-white rounded-xl cursor-pointer shadow-xs"
              >
                Import Numbers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
