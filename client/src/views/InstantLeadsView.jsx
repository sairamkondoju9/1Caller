import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Bell,
  AlertTriangle,
  ExternalLink,
  Plus,
  X,
  Play,
  Pause,
  Filter,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  RotateCcw,
  Volume2,
  FileText,
  Sparkles,
  Phone,
  CheckCircle2,
  Settings,
  Flame,
  Send,
  Download
} from 'lucide-react';

export default function InstantLeadsView({ onNavigate }) {
  // Banners & Webhook
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const webhookUrl = "https://api.sarvam.ai/v1/webhooks/incoming-leads";

  // Calling Policy State (from Screenshots 12 & 13)
  const [dialDelaySeconds, setDialDelaySeconds] = useState(10);
  const [callingHoursStart, setCallingHoursStart] = useState('09:00 AM');
  const [callingHoursEnd, setCallingHoursEnd] = useState('08:00 PM');
  const [leadsOutsideHours, setLeadsOutsideHours] = useState('queue-next-day');
  const [retrySteps, setRetrySteps] = useState([20, 120]);
  const [newRetryVal, setNewRetryVal] = useState('');
  const [showAddRetry, setShowAddRetry] = useState(false);
  const [callingDays, setCallingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState('');
  const [respectDNC, setRespectDNC] = useState(true);
  const [maxAtOnce, setMaxAtOnce] = useState('Unlimited');
  const [duplicateWindowMinutes, setDuplicateWindowMinutes] = useState(5);
  const [policySaved, setPolicySaved] = useState(false);

  // Filters State (Screenshots 13, 14, 18, 19)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutcomes, setSelectedOutcomes] = useState(['Callback', 'Qualified', 'Voicemail']);
  const [outcomeDropdownOpen, setOutcomeDropdownOpen] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState('All'); // 'All' | 'Positive' | 'Neutral' | 'Negative'
  const [timeFilter, setTimeFilter] = useState('Any time'); // 'Any time' | 'Today' | 'Last 24h' | 'Last 7d' | 'Last 30d'
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [isHotFilter, setIsHotFilter] = useState(false);
  const [fieldFilter, setFieldFilter] = useState('All'); // 'All' | 'JEWELLERY_TYPE' | 'SEND_WHATSAPP'
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Call Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);

  // Mock Call Records matching Screenshots 13, 14, 18, 19
  const allCalls = [
    {
      id: 'call-1',
      contact: '+918919112039',
      contactName: 'Sairam',
      jewelleryType: 'Gold, Silver',
      sendWhatsapp: 'Sent',
      isHot: true,
      summary: 'Enquired about Christmas gold offer, requested catalog on WhatsApp without committing to immediate visit.',
      sentiment: 'Neutral',
      outcome: 'Qualified',
      duration: '1:30',
      time: 'Today 5:00 PM',
      audioUrl: '/audio/jagan-test-call.mp3',
      transcript: [
        { speaker: 'Jagan', text: 'à°¨à°®à°¸à±à°•à°¾à°°à°‚ à°¸à°¾à°¯à°¿à°°à°¾à°®à± à°—à°¾à°°à±, à°¨à±‡à°¨à± à°œà°¿à°²à±à°²à±‡à°¡à±à°—à±‚à°¡ à°¸à°¾à°¯à°¿à°°à°¾à°®à± à°œà±à°¯à±à°µà±†à°²à°°à±à°¸à± à°¨à±à°‚à°¡à°¿ à°œà°—à°¨à± à°®à°¾à°Ÿà±à°²à°¾à°¡à±à°¤à±à°¨à±à°¨à°¾à°¨à±.' },
        { speaker: 'Sairam', text: 'à°…à°µà±à°¨à°‚à°¡à°¿, à°•à±à°°à°¿à°¸à±à°®à°¸à± à°†à°«à°°à±à°²à± à°à°®à±ˆà°¨à°¾ à°‰à°¨à±à°¨à°¾à°¯à°¾?' },
        { speaker: 'Jagan', text: 'à°…à°µà±à°¨à°‚à°¡à°¿! à°¨à±‹ à°œà±€à°Žà°¸à±à°Ÿà±€, à°¨à±‹ à°®à±‡à°•à°¿à°‚à°—à± à°›à°¾à°°à±à°œà±†à°¸à± à°…à°¨à±à°¨à°¿ à°¬à°‚à°—à°¾à°°à±, à°µà±†à°‚à°¡à°¿ à°†à°­à°°à°£à°¾à°²à°ªà±ˆ à°¨à°¡à±à°¸à±à°¤à±à°¨à±à°¨à°¾à°¯à°¿.' },
        { speaker: 'Sairam', text: 'à°¸à°°à±‡ à°µà°¿à°µà°°à°¾à°²à± à°µà°¾à°Ÿà±à°¸à°¾à°ªà± à°ªà°‚à°ªà°¿à°‚à°šà°‚à°¡à°¿, à°šà±‚à°¸à°¿ à°µà°¸à±à°¤à°¾à°¨à±.' }
      ]
    },
    {
      id: 'call-2',
      contact: '+918919112039',
      contactName: 'Sairam',
      jewelleryType: 'â€”',
      sendWhatsapp: 'Pending',
      isHot: false,
      summary: 'Call reached voicemail after 4 rings, automatic 20 min retry scheduled.',
      sentiment: 'Neutral',
      outcome: 'Voicemail',
      duration: '0:01',
      time: 'Today 4:45 PM',
      audioUrl: null,
      transcript: []
    },
    {
      id: 'call-3',
      contact: 'Jagan Callback',
      contactName: 'Anil Kumar',
      jewelleryType: 'Silver',
      sendWhatsapp: 'Sent',
      isHot: false,
      summary: 'Customer requested callback tomorrow at 11 AM regarding silver articles for housewarming.',
      sentiment: 'Neutral',
      outcome: 'Callback',
      duration: '0:45',
      time: 'Today 4:30 PM',
      audioUrl: '/audio/jagan-test-call.mp3',
      transcript: [
        { speaker: 'Jagan', text: 'à°¹à°²à±‹ à°…à°¨à±€à°²à± à°—à°¾à°°à±, à°¸à°¾à°¯à°¿à°°à°¾à°®à± à°œà±à°¯à±à°µà±†à°²à°°à±à°¸à± à°¨à±à°‚à°šà°¿ à°…à°‚à°¡à°¿.' },
        { speaker: 'Customer', text: 'à°°à±‡à°ªà± à°‰à°¦à°¯à°‚ 11 à°—à°‚à°Ÿà°²à°•à± à°šà±‡à°¯à°‚à°¡à°¿, à°‡à°ªà±à°ªà±à°¡à± à°®à±€à°Ÿà°¿à°‚à°—à±â€Œà°²à±‹ à°‰à°¨à±à°¨à°¾à°¨à±.' },
        { speaker: 'Jagan', text: 'à°¤à°ªà±à°ªà°•à±à°‚à°¡à°¾ à°…à°‚à°¡à±€, à°°à±‡à°ªà± à°‰à°¦à°¯à°‚ 11 à°—à°‚à°Ÿà°²à°•à± à°®à°³à±à°²à±€ à°•à°¾à°²à± à°šà±‡à°¸à±à°¤à°¾à°¨à±. à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±.' }
      ]
    }
  ];

  // Filtered Calls Logic
  const filteredCalls = allCalls.filter(call => {
    // Hot filter
    if (isHotFilter && !call.isHot) return false;

    // Field filter
    if (fieldFilter === 'JEWELLERY_TYPE' && call.jewelleryType === 'â€”') return false;
    if (fieldFilter === 'SEND_WHATSAPP' && call.sendWhatsapp !== 'Sent') return false;

    // Outcome filter
    if (!selectedOutcomes.includes(call.outcome)) return false;

    // Sentiment filter
    if (sentimentFilter !== 'All' && call.sentiment !== sentimentFilter) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContact = call.contact.toLowerCase().includes(q) || call.contactName.toLowerCase().includes(q);
      const matchSummary = call.summary.toLowerCase().includes(q);
      const matchJewellery = call.jewelleryType.toLowerCase().includes(q);
      if (!matchContact && !matchSummary && !matchJewellery) return false;
    }

    return true;
  });

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleToggleDay = (day) => {
    if (callingDays.includes(day)) {
      if (callingDays.length > 1) {
        setCallingDays(callingDays.filter(d => d !== day));
      }
    } else {
      setCallingDays([...callingDays, day]);
    }
  };

  const handleAddRetry = () => {
    const val = parseInt(newRetryVal, 10);
    if (!isNaN(val) && val > 0 && retrySteps.length < 3) {
      setRetrySteps([...retrySteps, val].sort((a, b) => a - b));
      setNewRetryVal('');
      setShowAddRetry(false);
    }
  };

  const handleRemoveRetry = (index) => {
    setRetrySteps(retrySteps.filter((_, i) => i !== index));
  };

  const handleAddHoliday = () => {
    if (newHoliday.trim() && !holidays.includes(newHoliday.trim())) {
      setHolidays([...holidays, newHoliday.trim()]);
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (h) => {
    setHolidays(holidays.filter(item => item !== h));
  };

  const handleSavePolicy = () => {
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const handleToggleOutcome = (outcome) => {
    if (selectedOutcomes.includes(outcome)) {
      setSelectedOutcomes(selectedOutcomes.filter(o => o !== outcome));
    } else {
      setSelectedOutcomes([...selectedOutcomes, outcome]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedOutcomes(['Callback', 'Qualified', 'Voicemail']);
    setSentimentFilter('All');
    setTimeFilter('Any time');
    setIsHotFilter(false);
    setFieldFilter('All');
  };

  const handlePlayAudio = (call) => {
    if (!call.audioUrl) return;

    if (playingAudioId === call.id) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(call.audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
      setAudioElement(audio);
      setPlayingAudioId(call.id);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6 font-sans">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#6c6b7e] uppercase tracking-wider mb-1">
            <span>Calling Channels</span>
            <span>Â·</span>
            <span className="text-[#d97757] font-semibold">Speed-to-Lead</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight flex items-center gap-2.5 font-display">
            Instant Leads
            <span className="text-xs font-bold bg-[#fff7ed] text-[#c2410c] px-2.5 py-0.5 rounded-full border border-[#fed7aa] font-mono">
              Sub-30s Response
            </span>
          </h1>
          <p className="text-xs text-[#6c6b7e] mt-1 font-sans">
            Calls brand-new leads within seconds of submission â€” before your competitor's human team even opens their CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate && onNavigate('new-employee')}
            className="sarvam-btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create AI Employee
          </button>
        </div>
      </div>

      {/* Notice Banner 1: Buy a Phone Number (Exact copy from Screenshots 18 & 19) */}
      <div className="apple-glass rounded-2xl p-4 border border-[#fed7aa] bg-[#fff7ed]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center shrink-0 border border-[#fed7aa]">
            <AlertTriangle className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0f0e17] font-sans">
              Buy a phone number and assign it to start making calls in production
            </h4>
            <p className="text-[11px] text-[#6c6b7e]">
              It won't dial yet, so you can test safely before flipping the live switch.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('phone-numbers')}
          className="text-xs font-bold text-[#c2410c] hover:text-[#9a3412] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#fed7aa] transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Buy a phone number <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Notice Banner 2: API Key Banner (Exact copy from Screenshots 18 & 19) */}
      <div className="apple-glass rounded-2xl p-4 border border-[#e2e4ed] bg-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f6f7fb] text-[#0f0e17] flex items-center justify-center shrink-0 border border-[#e2e4ed]">
            <ShieldCheck className="w-4 h-4 text-[#0f0e17]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0f0e17] font-sans">
              Get an API key to send leads into Sarvam from your own tools
            </h4>
            <p className="text-[11px] text-[#6c6b7e]">
              Integrate with webhooks, Zapier, Make.com, or your custom CRM backends.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('developers')}
          className="text-xs font-bold text-[#0f0e17] hover:text-[#3a3f5c] flex items-center gap-1 bg-[#f6f7fb] px-3 py-1.5 rounded-xl border border-[#e2e4ed] transition-colors shrink-0 cursor-pointer shadow-2xs font-mono"
        >
          Get an API key <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Section 1: Connect your leads Card */}
      <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono font-medium text-[#6c6b7e] uppercase tracking-wider mb-0.5">
              Instant Ingestion Webhook
            </div>
            <h3 className="text-sm font-bold text-[#0f0e17] font-display">
              Connect your leads
            </h3>
            <p className="text-xs text-[#6c6b7e] mt-0.5">
              Jagan calls new leads within seconds of submission â€” before your competitor's human team even opens their CRM.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-mono font-medium self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            Listening on endpoint
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="apple-glass-input flex-1 p-2.5 text-xs font-mono text-[#0f0e17] bg-white/90 select-all"
          />
          <button
            onClick={handleCopyWebhook}
            className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedWebhook ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Supported Lead Sources */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#f0f2f8]">
          <span className="text-[10px] font-mono text-[#6c6b7e] uppercase">Compatible with:</span>
          {['Meta Lead Ads', 'Google Forms', 'Zapier', 'Make.com', 'Custom Webhooks'].map((src, i) => (
            <span key={i} className="text-[11px] font-medium text-[#3a3f5c] bg-[#f6f7fb] border border-[#e2e4ed] px-2.5 py-0.5 rounded-md">
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Section 2: Calling Policy (Matching Screenshots 12 & 13) */}
      <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e2e4ed] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0f0e17] font-display">Calling policy</h3>
            <p className="text-xs text-[#6c6b7e]">
              Set operational windows, dial pacing, retry backoffs, and compliance rules.
            </p>
          </div>

          <button
            onClick={handleSavePolicy}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              policySaved
                ? 'bg-[#16a34a] text-white'
                : 'sarvam-btn-primary'
            }`}
          >
            {policySaved ? <Check className="w-3.5 h-3.5" /> : null}
            {policySaved ? 'Calling policy saved!' : 'Save calling policy'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Call Delay */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f0e17]">Call delay</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="120"
                value={dialDelaySeconds}
                onChange={(e) => setDialDelaySeconds(e.target.value)}
                className="apple-glass-input w-24 p-2 text-xs font-mono font-bold text-[#0f0e17]"
              />
              <span className="text-xs text-[#6c6b7e] font-mono">seconds</span>
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Wait before dialing newly captured leads.</p>
          </div>

          {/* Calling Hours */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f0e17]">Calling hours</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={callingHoursStart}
                onChange={(e) => setCallingHoursStart(e.target.value)}
                className="apple-glass-input w-24 p-2 text-xs font-mono font-medium text-[#0f0e17]"
              />
              <span className="text-xs text-[#6c6b7e]">to</span>
              <input
                type="text"
                value={callingHoursEnd}
                onChange={(e) => setCallingHoursEnd(e.target.value)}
                className="apple-glass-input w-24 p-2 text-xs font-mono font-medium text-[#0f0e17]"
              />
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Leads outside calling hours: Queue &amp; call at 09:00 AM next day.</p>
          </div>

          {/* Retry No Answer */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f0e17]">Retry no answer</label>
            <div className="flex items-center flex-wrap gap-2">
              {retrySteps.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-[#f6f7fb] border border-[#e2e4ed] px-2.5 py-1 rounded-lg text-xs font-mono text-[#0f0e17]">
                  <span>{m} min</span>
                  <button onClick={() => handleRemoveRetry(idx)} className="text-[#6c6b7e] hover:text-[#c2410c] cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {retrySteps.length < 3 && !showAddRetry && (
                <button
                  onClick={() => setShowAddRetry(true)}
                  className="text-xs text-[#0f0e17] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add step
                </button>
              )}
              {showAddRetry && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="min"
                    value={newRetryVal}
                    onChange={(e) => setNewRetryVal(e.target.value)}
                    className="apple-glass-input w-16 p-1 text-xs font-mono text-[#0f0e17]"
                  />
                  <button onClick={handleAddRetry} className="text-xs bg-[#0f0e17] text-white px-2 py-1 rounded-md cursor-pointer">
                    Add
                  </button>
                  <button onClick={() => setShowAddRetry(false)} className="text-xs text-[#6c6b7e] p-1 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Up to 3 attempts total.</p>
          </div>

          {/* Calling Days */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f0e17]">Calling days</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    callingDays.includes(day)
                      ? 'bg-[#0f0e17] text-white shadow-xs'
                      : 'bg-[#f6f7fb] text-[#6c6b7e] hover:bg-[#eef0f7] border border-[#e2e4ed]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#6c6b7e]">
              {callingDays.length === 7 ? 'Calls every day.' : `${callingDays.length} days active.`}
            </p>
          </div>

          {/* Holidays */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f0e17]">Holidays â€” never call on</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="apple-glass-input p-2 text-xs font-mono text-[#0f0e17]"
              />
              <button
                type="button"
                onClick={handleAddHoliday}
                className="text-xs bg-[#f6f7fb] hover:bg-[#eef0f7] border border-[#e2e4ed] text-[#0f0e17] font-semibold px-3 py-2 rounded-xl cursor-pointer"
              >
                + Add
              </button>
            </div>
            {holidays.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {holidays.map((h, i) => (
                  <span key={i} className="text-[10px] font-mono bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] px-2 py-0.5 rounded-md flex items-center gap-1">
                    {h}
                    <button onClick={() => handleRemoveHoliday(h)} className="cursor-pointer">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Do Not Call & Duplicate Window */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0f0e17]">Respect Do-Not-Call list</label>
                <input
                  type="checkbox"
                  checked={respectDNC}
                  onChange={(e) => setRespectDNC(e.target.checked)}
                  className="w-4 h-4 accent-[#0f0e17] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#6c6b7e]">Skip numbers your account has opted out.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f0e17]">Duplicate lead window</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={duplicateWindowMinutes}
                  onChange={(e) => setDuplicateWindowMinutes(e.target.value)}
                  className="apple-glass-input w-20 p-1.5 text-xs font-mono text-[#0f0e17]"
                />
                <span className="text-xs text-[#6c6b7e]">min</span>
              </div>
              <p className="text-[11px] text-[#6c6b7e]">Same number again within this many minutes is skipped.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Lead Quality Breakdown & Analytics Donut (Matching Screenshot 13) */}
      <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0f0e17] font-display">Lead quality breakdown</h3>
            <p className="text-xs text-[#6c6b7e]">Distribution of outcomes from instant callbacks.</p>
          </div>

          <div className="flex items-center gap-6">
            {/* SVG Donut Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e4ed]"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 50% Qualified (Emerald) */}
                <path
                  className="text-[#10b981]"
                  strokeDasharray="50, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 50% Voicemail (Slate/Indigo) */}
                <path
                  className="text-[#64748b]"
                  strokeDasharray="50, 100"
                  strokeDashoffset="-50"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[#0f0e17] font-mono leading-none">2</span>
                <span className="text-[8px] text-[#6c6b7e] uppercase font-mono mt-0.5">total</span>
              </div>
            </div>

            {/* Breakdown Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="font-semibold text-[#0f0e17]">1 Qualified</span>
                <span className="text-[#6c6b7e] font-mono">(50%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span>
                <span className="font-semibold text-[#0f0e17]">1 Voicemail</span>
                <span className="text-[#6c6b7e] font-mono">(50%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97757]"></span>
                <span className="font-semibold text-[#0f0e17]">1 Callback</span>
                <span className="text-[#6c6b7e] font-mono">(scheduled)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Call Log Table with Interactive Filters (Matching Screenshots 13, 14, 18, 19) */}
      <div className="apple-glass rounded-2xl border border-[#e2e4ed] overflow-hidden shadow-xs">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-[#e2e4ed] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0f0e17] font-display">Call log</h3>
              <p className="text-xs text-[#6c6b7e]">
                Showing {filteredCalls.length} of {allCalls.length} calls
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Rows Per Page Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-[#6c6b7e]">
                <span>Rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="apple-glass-input py-1 px-2 text-xs font-mono font-medium text-[#0f0e17]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const csv = allCalls.map(c => `"${c.contact}","${c.contactName}","${c.jewelleryType}","${c.sendWhatsapp}","${c.outcome}","${c.sentiment}","${c.duration}","${c.time}"`).join('\n');
                  const blob = new Blob([`Contact,Name,JewelleryType,SendWhatsapp,Outcome,Sentiment,Duration,Time\n${csv}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'instant_leads_calls.csv';
                  a.click();
                }}
                className="text-xs bg-[#f6f7fb] hover:bg-[#eef0f7] text-[#0f0e17] border border-[#e2e4ed] px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Filter Toolbar (Matching Screenshots 14, 18, 19) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#f0f2f8]">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#6c6b7e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contact, captured info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-glass-input w-full pl-8 pr-3 py-1.5 text-xs text-[#0f0e17]"
              />
            </div>

            {/* Filter by Field Dropdown (Screenshots 18 & 19) */}
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="apple-glass-input px-3 py-1.5 text-xs font-medium text-[#0f0e17] cursor-pointer"
            >
              <option value="All">Filter by field...</option>
              <option value="JEWELLERY_TYPE">JEWELLERY_TYPE</option>
              <option value="SEND_WHATSAPP">SEND_WHATSAPP</option>
            </select>

            {/* Hot Leads Toggle Button */}
            <button
              type="button"
              onClick={() => setIsHotFilter(!isHotFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
                isHotFilter
                  ? 'bg-[#ea580c] text-white border-[#ea580c]'
                  : 'bg-white hover:bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Hot leads</span>
            </button>

            {/* Outcome Filter Multi-Select Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOutcomeDropdownOpen(!outcomeDropdownOpen)}
                className="flex items-center gap-1.5 bg-white hover:bg-[#f6f7fb] border border-[#e2e4ed] px-3 py-1.5 rounded-xl text-xs font-medium text-[#0f0e17] cursor-pointer shadow-2xs"
              >
                <Filter className="w-3 h-3 text-[#6c6b7e]" />
                <span>Outcome ({selectedOutcomes.length})</span>
                <ChevronDown className="w-3 h-3 text-[#6c6b7e]" />
              </button>

              {outcomeDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl border border-[#e2e4ed] rounded-xl shadow-xl z-20 p-2 space-y-1">
                  {['Qualified', 'Callback', 'Voicemail'].map(outcome => (
                    <label
                      key={outcome}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#f6f7fb] rounded-lg text-xs text-[#0f0e17] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOutcomes.includes(outcome)}
                        onChange={() => handleToggleOutcome(outcome)}
                        className="w-3.5 h-3.5 accent-[#0f0e17] cursor-pointer"
                      />
                      <span>{outcome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sentiment Dropdown */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="apple-glass-input px-3 py-1.5 text-xs font-medium text-[#0f0e17] cursor-pointer"
            >
              <option value="All">All sentiment</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>

            {/* Time Filter Dropdown (with Blue Highlight active styling from Screenshot 14) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                className="flex items-center gap-1.5 bg-white hover:bg-[#f6f7fb] border border-[#e2e4ed] px-3 py-1.5 rounded-xl text-xs font-medium text-[#0f0e17] cursor-pointer shadow-2xs"
              >
                <Clock className="w-3 h-3 text-[#6c6b7e]" />
                <span>{timeFilter}</span>
                <ChevronDown className="w-3 h-3 text-[#6c6b7e]" />
              </button>

              {timeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white/95 backdrop-blur-xl border border-[#e2e4ed] rounded-xl shadow-xl z-20 p-1 space-y-0.5">
                  {['Any time', 'Today', 'Last 24h', 'Last 7d', 'Last 30d'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTimeFilter(opt);
                        setTimeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        timeFilter === opt
                          ? 'bg-[#2563eb] text-white font-semibold'
                          : 'text-[#0f0e17] hover:bg-[#f6f7fb]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Link */}
            {(searchQuery || selectedOutcomes.length < 3 || sentimentFilter !== 'All' || timeFilter !== 'Any time' || isHotFilter || fieldFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#2563eb] hover:underline font-medium cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Call Records List or Empty State */}
        {filteredCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e4ed] bg-[#f8f9fc] text-[10px] font-mono font-medium text-[#6c6b7e] uppercase tracking-wider">
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5">Jewellery_Type</th>
                  <th className="py-3 px-5">Send_Whatsapp</th>
                  <th className="py-3 px-5">Summary</th>
                  <th className="py-3 px-5">Sentiment</th>
                  <th className="py-3 px-5">Outcome</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Time</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e4ed] text-xs">
                {filteredCalls.slice(0, rowsPerPage).map((call) => (
                  <tr key={call.id} className="hover:bg-[#f6f7fb]/80 transition-colors group">
                    <td className="py-3.5 px-5 font-medium text-[#0f0e17]">
                      <div className="flex items-center gap-1.5">
                        {call.isHot && <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-current" />}
                        <span>{call.contactName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#6c6b7e]">{call.contact}</div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[#3a3f5c]">
                      <span className="bg-[#f6f7fb] text-[#0f0e17] px-2 py-0.5 rounded border border-[#e2e4ed] text-[11px]">
                        {call.jewelleryType}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        call.sendWhatsapp === 'Sent'
                          ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                          : 'bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1]'
                      }`}>
                        {call.sendWhatsapp}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-[#3a3f5c] max-w-xs truncate">
                      {call.summary}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-mono bg-[#f6f7fb] text-[#6c6b7e] px-2 py-0.5 rounded-full border border-[#e2e4ed]">
                        {call.sentiment}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                          call.outcome === 'Qualified'
                            ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                            : call.outcome === 'Callback'
                            ? 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]'
                            : 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]'
                        }`}
                      >
                        {call.outcome}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[#6c6b7e]">
                      {call.duration}
                    </td>

                    <td className="py-3.5 px-5 text-[#6c6b7e] font-mono text-[11px]">
                      {call.time}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {call.audioUrl && (
                          <button
                            onClick={() => handlePlayAudio(call)}
                            className="p-1.5 rounded-lg bg-[#f6f7fb] hover:bg-[#0f0e17] text-[#0f0e17] hover:text-white transition-all cursor-pointer border border-[#e2e4ed]"
                            title="Play call recording"
                          >
                            {playingAudioId === call.id ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        )}
                        {call.transcript.length > 0 && (
                          <button
                            onClick={() => setSelectedTranscriptCall(call)}
                            className="p-1.5 rounded-lg bg-[#f6f7fb] hover:bg-[#f0f2f8] text-[#0f0e17] transition-all cursor-pointer border border-[#e2e4ed]"
                            title="View transcript"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State (Exact text from Screenshot 14) */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f6f7fb] border border-[#e2e4ed] flex items-center justify-center mx-auto text-[#6c6b7e]">
              <Search className="w-5 h-5 text-[#6c6b7e]" />
            </div>
            <h4 className="text-sm font-bold text-[#0f0e17] font-display">
              No calls match your filters.
            </h4>
            <p className="text-xs text-[#6c6b7e] max-w-sm mx-auto">
              Try adjusting your search query, sentiment, or outcome filters to see your call history.
            </p>
            <button
              onClick={handleClearFilters}
              className="sarvam-btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedTranscriptCall && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e2e4ed] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f0e17] font-display">
                  Call Transcript Â· {selectedTranscriptCall.contactName}
                </h3>
                <p className="text-[11px] font-mono text-[#6c6b7e]">
                  {selectedTranscriptCall.contact} Â· {selectedTranscriptCall.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="p-1 rounded-lg text-[#6c6b7e] hover:bg-[#f6f7fb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {selectedTranscriptCall.transcript.map((turn, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    turn.speaker === 'Jagan'
                      ? 'bg-[#f6f7fb] border-[#e2e4ed] text-[#0f0e17]'
                      : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase mb-1">
                    {turn.speaker}
                  </div>
                  <div className="leading-relaxed font-sans">{turn.text}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e2e4ed] flex items-center justify-between">
              <span className="text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Outcome: {selectedTranscriptCall.outcome}
              </span>
              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="px-4 py-2 text-xs bg-[#0f0e17] text-white font-semibold rounded-xl hover:bg-[#1f1e28] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
