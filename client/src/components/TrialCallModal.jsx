import React, { useState, useEffect } from 'react';
import { PhoneCall, Phone, CheckCircle2, AlertCircle, Loader2, X, Sparkles, Building2, User, Key, ExternalLink } from 'lucide-react';

export default function TrialCallModal({ isOpen, onClose, employee, initialPhone = '' }) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || localStorage.getItem('last_trial_phone') || '+91');
  const [selectedTier, setSelectedTier] = useState('standard'); // 'standard' (₹5.00/min - Sarvam) | 'premium' (₹6.80/min - Cartesia)
  const [sarvamAppId, setSarvamAppId] = useState(
    employee?.sarvam_app_id || localStorage.getItem('sarvam_master_app_id') || ''
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | calling | ringing | error
  const [errorMessage, setErrorMessage] = useState('');
  const [callResult, setCallResult] = useState(null);

  useEffect(() => {
    if (initialPhone) {
      setPhoneNumber(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (employee?.sarvam_app_id) {
      setSarvamAppId(employee.sarvam_app_id);
    }
  }, [employee]);

  if (!isOpen) return null;

  const handlePhoneChange = (val) => {
    // Keep +91 prefix easily accessible
    if (!val.startsWith('+') && !val.startsWith('0') && val.length > 0 && !val.startsWith('91')) {
      setPhoneNumber('+91' + val);
    } else {
      setPhoneNumber(val);
    }
  };

  const handleDial = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      setStatus('error');
      return;
    }

    setStatus('calling');
    setErrorMessage('');
    setCallResult(null);

    // Save phone and appId to localStorage for convenience
    localStorage.setItem('last_trial_phone', phoneNumber);
    if (sarvamAppId) {
      localStorage.setItem('sarvam_master_app_id', sarvamAppId.trim());
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch('/api/calls/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          employee_id: employee?.id,
          employee: employee,
          app_id: sarvamAppId?.trim() || undefined,
          language: employee?.primary_language || 'Telugu',
          voice_tier: selectedTier
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate outbound call via Sarvam Telephony.');
      }

      setCallResult(data);
      setStatus('ringing');
    } catch (err) {
      console.error('[Trial Call Error]:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Call failed. Please verify your phone number and Sarvam configuration.');
    }
  };

  const employeeName = employee?.name || 'AI Employee';
  const businessName = employee?.business || employee?.industry || 'Our Business';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7a50dc] to-[#5b32b8] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/20 text-white font-mono">
                  Live PSTN Telephony
                </span>
                <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CLI: +917965481367
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white font-display">
                Trial Call to Original Number
              </h2>
            </div>
          </div>

          <p className="text-xs text-white/80 mt-2 leading-relaxed">
            Call your real mobile phone right now to hear <span className="font-semibold text-white">{employeeName}</span> speak live with real human conversational latency (~412ms).
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Employee Badge Summary */}
          <div className="p-3.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7a50dc] to-[#a78bfa] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {employeeName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-[#0f0e17]">{employeeName}</div>
                <div className="text-xs text-[#6c6b7e]">{businessName}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#7a50dc]/10 text-[#7a50dc]">
                {employee?.primary_language === 'te' || (employee?.language && employee?.language.includes('Telugu')) ? 'Telugu' : 'Indian English'}
              </span>
            </div>
          </div>

          {/* Success Ringing State */}
          {status === 'ringing' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Call Ringing! Check Your Phone</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Sarvam Voice Agent is calling <strong className="font-mono">{phoneNumber}</strong> from <strong className="font-mono">+917965481367</strong>. Answer the call to hear the employee live!
              </p>
              {callResult?.attempt_id && (
                <div className="text-[11px] font-mono text-emerald-600 bg-emerald-100/60 px-2 py-1 rounded-md">
                  Attempt ID: {callResult.attempt_id}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-800">Call Dispatch Notice</div>
                  <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              {errorMessage.includes('Sarvam Agent') && (
                <div className="mt-2 p-2.5 rounded-xl bg-white border border-red-200 text-[11.5px] text-zinc-700 space-y-1.5">
                  <div className="font-semibold text-zinc-900 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-[#7a50dc]" />
                    How to get your Sarvam Agent ID:
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-zinc-600 text-[11px]">
                    <li>Open <a href="https://apps.sarvam.ai" target="_blank" rel="noreferrer" className="text-[#7a50dc] underline font-medium inline-flex items-center gap-0.5">apps.sarvam.ai <ExternalLink className="w-2.5 h-2.5" /></a></li>
                    <li>Go to <strong>Build &rarr; Agents</strong></li>
                    <li>Click the <strong>···</strong> menu on your agent &rarr; <strong>Copy agent ID</strong></li>
                    <li>Paste it in the &quot;Sarvam Agent ID&quot; field below</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Voice Tier Experience Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0f0e17] flex items-center justify-between">
              <span>Select Voice Experience</span>
              <span className="text-[11px] text-[#7a50dc] font-semibold">Tier &amp; Billing Rate</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Standard: Sarvam Bulbul */}
              <div
                onClick={() => setSelectedTier('standard')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedTier === 'standard'
                    ? 'bg-[#f5f3ff] border-[#7a50dc] ring-2 ring-[#7a50dc]/30 shadow-xs'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eee8fc] text-[#7a50dc] font-mono">
                    ₹5.00 / min
                  </span>
                  {selectedTier === 'standard' && (
                    <CheckCircle2 className="w-4 h-4 text-[#7a50dc]" />
                  )}
                </div>
                <div className="text-xs font-bold text-zinc-900">Standard Voice</div>
                <div className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug">
                  Sarvam Bulbul — Best for Telugu, everyday sales &amp; support
                </div>
              </div>

              {/* Premium: Cartesia Sonic-2 / Expressive */}
              <div
                onClick={() => setSelectedTier('premium')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedTier === 'premium'
                    ? 'bg-[#fffbeb] border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
                    ₹6.80 / min
                  </span>
                  {selectedTier === 'premium' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                  <span>Premium Voice</span>
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug">
                  Cartesia Sonic-2 / Expressive — Ultra-lifelike brand voice (&lt;90ms)
                </div>
              </div>
            </div>
          </div>

          {/* Destination Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0f0e17] flex items-center justify-between">
              <span>Your Mobile Phone Number *</span>
              <span className="text-[11px] text-[#6c6b7e] font-normal">Any Indian mobile number</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-sm font-bold text-zinc-500 font-mono">🇮🇳</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+919849012345"
                disabled={status === 'calling'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 text-sm font-mono text-zinc-900 focus:outline-hidden focus:border-[#7a50dc] focus:ring-2 focus:ring-[#7a50dc]/10 shadow-xs"
              />
            </div>
            <p className="text-[11px] text-[#6c6b7e]">
              Enter in 10-digit format (e.g. 9849012345) or with +91 country code.
            </p>
          </div>

          {/* Advanced Telephony Settings (Sarvam Agent ID) */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[#7a50dc] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvanced ? '− Hide Sarvam Agent Configuration' : '+ Sarvam Agent ID (Optional / Override)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                <label className="font-bold text-zinc-800 block">
                  Sarvam Agent ID (app_id)
                </label>
                <input
                  type="text"
                  value={sarvamAppId}
                  onChange={(e) => setSarvamAppId(e.target.value)}
                  placeholder="e.g. agent-xxxx or uuid from Sarvam dashboard"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-hidden focus:border-[#7a50dc]"
                />
                <p className="text-[10.5px] text-zinc-500 leading-normal">
                  Found in <a href="https://apps.sarvam.ai" target="_blank" rel="noreferrer" className="text-[#7a50dc] underline">Sarvam Dashboard</a> under Build &rarr; Agents &rarr; &middot;&middot;&middot; &rarr; Copy agent ID. If blank, uses default workspace agent.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDial}
            disabled={status === 'calling'}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              status === 'calling'
                ? 'bg-zinc-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {status === 'calling' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dialing Sarvam Telephony...</span>
              </>
            ) : status === 'ringing' ? (
              <>
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Redial Call Now</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>📞 Dial Phone Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
