import React, { useState, useEffect } from 'react';
import { Phone, Plus, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Zap, Radio, FileText, Building2, User, Check, X, Clock, Link2, ExternalLink } from 'lucide-react';
import { getAuthHeaders } from '../utils/api';

export default function PhoneNumbersView({ onBuyNumber, onBalanceUpdate }) {
  const [numbersList, setNumbersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [modalMode, setModalMode] = useState('order_new'); // 'order_new' | 'link_existing'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields for Client KYC Purchase
  const [seriesType, setSeriesType] = useState('commercial-did');
  const [businessName, setBusinessName] = useState('Sai Constructions Pvt Ltd');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [existingSarvamNumber, setExistingSarvamNumber] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('emp-lakshmi');
  const [panError, setPanError] = useState('');
  const [successToast, setSuccessToast] = useState(null);

  const fetchNumbers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/phone-numbers', { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Phone-number inventory is unavailable.');
      if (!Array.isArray(data)) throw new Error('Phone-number inventory returned an invalid response.');
      setNumbersList(data);
      setLoadError('');
    } catch (e) {
      console.error('Failed to fetch phone numbers:', e);
      setNumbersList([]);
      setLoadError(e.message || 'Phone-number inventory is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const handlePanChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setPanNumber(val);
    if (val.length === 10) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(val)) {
        setPanError('Invalid Indian PAN format (Example: ABCDE1234F)');
      } else {
        setPanError('');
      }
    } else {
      setPanError('');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (modalMode === 'order_new') {
      if (panNumber.length !== 10) {
        setPanError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)');
        return;
      }
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panNumber)) {
        setPanError('Invalid PAN format (Must be 5 letters, 4 numbers, 1 letter: ABCDE1234F)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = modalMode === 'link_existing' 
        ? {
            number: existingSarvamNumber.trim(),
            provider: 'Sarvam Telephony Network (Samvaad)',
            employee_id: assignedEmployee,
            monthly_cost: 649
          }
        : {
            provider: 'Sarvam Telephony Network (Samvaad)',
            series_type: seriesType,
            employee_id: assignedEmployee,
            monthly_cost: 649,
            businessName: businessName.trim() || 'My Business',
            panNumber: panNumber.trim(),
            gstin: gstin.trim()
          };

      const res = await fetch('/api/phone-numbers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowBuyModal(false);
        setSuccessToast(data.message || 'Operation successful!');
        setTimeout(() => setSuccessToast(null), 7000);
        await fetchNumbers();
        if (onBalanceUpdate) onBalanceUpdate();
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while processing Sarvam telephony line');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLines = numbersList.filter(n => n.status === 'active');
  const pendingOrders = numbersList.filter(n => n.status !== 'active');

  return (
    <div className="p-6 sm:p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-[#16a34a] hover:text-[#15803d]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
            <span>Setup • Telephony Lines</span>
            <span className="text-[10px] font-bold bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full border border-[#bbf7d0] uppercase">
              Carrier inventory
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">
            Phone Numbers
          </h1>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Phone lines provisioned for this workspace by a connected carrier.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setModalMode('link_existing');
              setShowBuyModal(true);
            }}
            className="border border-[#e2e4ed] hover:bg-[#f8f9fc] text-[#0f0e17] font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Link2 className="w-4 h-4 text-[#7a50dc]" /> Link Sarvam Number
          </button>
          <button
            onClick={() => {
              setModalMode('order_new');
              setShowBuyModal(true);
            }}
            className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Order Dedicated Line
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="apple-glass rounded-2xl p-6 sm:p-8 text-center border border-[#e2e4ed] space-y-6 max-w-3xl mx-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0f0e17] text-white flex items-center justify-center shadow-md">
          <Phone className="w-7 h-7 text-[#4ade80]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-bold text-[#16a34a]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carrier integration</span>
          </div>
          <h2 className="text-xl font-bold text-[#0f0e17] tracking-tight">
            Workspace phone lines
          </h2>
          <p className="text-xs text-[#6c6b7e] max-w-lg mx-auto leading-relaxed">
            Phone numbers and compliance information are shown only when confirmed by the configured carrier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="apple-glass rounded-xl p-3 border border-[#e2e4ed]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f0e17] mb-1">
              <Zap className="w-3.5 h-3.5 text-[#7a50dc]" />
              <span>Carrier latency</span>
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Latency depends on the selected carrier and its route.</p>
          </div>
          <div className="apple-glass rounded-xl p-3 border border-[#e2e4ed]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f0e17] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>DLT Registration</span>
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Registration status is reported per provisioned line.</p>
          </div>
          <div className="apple-glass rounded-xl p-3 border border-[#e2e4ed]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f0e17] mb-1">
              <Radio className="w-3.5 h-3.5 text-[#0f0e17]" />
              <span>Verified Business PAN</span>
            </div>
            <p className="text-[11px] text-[#6c6b7e]">Carrier ordering is unavailable until an ordering provider is connected.</p>
          </div>
        </div>
      </div>

      {/* Active Verified Lines Table */}
      <div className="apple-glass rounded-2xl p-5 border border-[#e2e4ed] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e4ed]">
          <h3 className="text-xs font-bold text-[#0f0e17] uppercase tracking-wider font-mono">Your Active Phone Lines</h3>
          <span className="text-[11px] font-bold text-[#16a34a] font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            {activeLines.length} Line{activeLines.length === 1 ? '' : 's'} Live &amp; Ready
          </span>
        </div>

        <div className="divide-y divide-[#e2e4ed]">
          {loadError && <p className="py-4 text-sm text-red-700" role="alert">{loadError}</p>}
          {!isLoading && !loadError && activeLines.length === 0 && (
            <p className="py-4 text-sm text-[#6c6b7e]">No phone lines have been provisioned for this workspace.</p>
          )}
          {activeLines.map((n) => (
            <div key={n.id || n.number} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold font-mono text-[#0f0e17]">{n.number}</span>
                    <span className="text-[10px] font-bold bg-[#f6f7fb] text-[#0f0e17] px-2 py-0.5 rounded uppercase border border-[#e2e4ed] font-mono">
                      {n.series_type || 'Virtual DID'}
                    </span>
                    <span className="text-[10px] font-bold bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full border border-[#bbf7d0] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Active &amp; Verified
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#6c6b7e] mt-1 space-x-2">
                    <span>Vendor: <strong>{n.provider || 'Not reported'}</strong></span>
                    <span>•</span>
                    <span>Attached to: <strong className="text-[#0f0e17]">{n.attachedEmployee || n.employee_id || 'Unassigned'}</strong></span>
                    <span>•</span>
                    <span>Channels: <strong>{n.channels ?? 'Not reported'}</strong></span>
                    {n.renews_at && (
                      <>
                        <span>•</span>
                        <span className="text-zinc-500 font-mono">Renews: {n.renews_at}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                {Boolean(n.is_dlt_registered) && (
                  <span className="text-xs font-bold text-[#16a34a] flex items-center gap-1 bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#bbf7d0]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DLT Registered
                  </span>
                )}
                {n.monthly_cost != null && <span className="text-sm font-black text-[#0f0e17] font-mono">₹{n.monthly_cost}/mo</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending KYC & Carrier Verification Orders (if any exist) */}
      {pendingOrders.length > 0 && (
        <div className="apple-glass rounded-2xl p-5 border border-[#fed7aa] bg-[#fffaf0]/60 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#fed7aa]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ea580c]" />
              <h3 className="text-xs font-bold text-[#9a3412] uppercase tracking-wider font-mono">
                Carrier KYC Applications In Progress
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#ea580c] font-mono">
              {pendingOrders.length} Order{pendingOrders.length === 1 ? '' : 's'} Under Telecom Review
            </span>
          </div>

          <div className="divide-y divide-[#fed7aa]/50">
            {pendingOrders.map((n) => (
              <div key={n.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-[#0f0e17]">{n.number}</span>
                      <span className="text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] px-2 py-0.5 rounded-full border border-[#fed7aa]">
                        KYC Under Verification (TRAI DLT)
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#6c6b7e] mt-0.5">
                      Vendor: <strong>Sarvam Carrier Network</strong> • Series: <strong>{n.series_type}</strong> • Turnaround: <strong>24-48 hrs</strong>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#9a3412] font-semibold bg-[#ffedd5] px-3 py-1.5 rounded-lg border border-[#fed7aa] self-end md:self-auto">
                  Awaiting Telecom Carrier Allocation
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Directives Banner */}
      <div className="apple-glass rounded-xl p-4 text-xs text-[#9a3412] space-y-1.5 border border-[#fed7aa] bg-[#fff7ed]/80">
        <div className="font-bold flex items-center gap-1.5 text-[#c2410c]">
          <AlertTriangle className="w-4 h-4 text-[#ea580c]" /> Indian Telecom Regulatory Directives (TRAI &amp; TCCCPR):
        </div>
        <p>• <strong>Commercial Virtual DID:</strong> Standard 10-digit virtual lines (+91 79 / 80 / 40 / 22) for client reception and two-way calling.</p>
        <p>• <strong>140-Series Line:</strong> Required by TRAI for all promotional marketing, lead follow-ups, and sales outreach.</p>
        <p>• <strong>1600-Series Line:</strong> Reserved for BFSI, appointment reminders, OTPs, and clinic booking support.</p>
        <p>• <strong>Telecom KYC Policy:</strong> Commercial phone lines cannot be generated virtually without valid Business PAN verification and DoT approval.</p>
      </div>

      {/* Modal: Link Existing or Order Dedicated Line */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="apple-glass-card rounded-2xl p-6 sm:p-7 max-w-lg w-full space-y-5 border border-[#e2e4ed] shadow-2xl bg-white max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2e4ed] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0f0e17]">
                  {modalMode === 'link_existing' ? 'Link Verified Sarvam Line' : 'Order Dedicated Indian Virtual Line'}
                </h3>
                <p className="text-xs text-[#6c6b7e] mt-0.5">
                  {modalMode === 'link_existing'
                    ? 'Attach a number already rented in your Sarvam account to an AI employee.'
                    : 'Submit Business KYC to order a new dedicated line via Sarvam Wholesale Carrier.'}
                </p>
              </div>
              <button
                onClick={() => setShowBuyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#f0f1f6] flex items-center justify-center text-[#6c6b7e] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#f0f1f6] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalMode('link_existing')}
                className={`py-2 rounded-lg transition-all ${
                  modalMode === 'link_existing' ? 'bg-white text-[#0f0e17] shadow-xs' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
                }`}
              >
                Link Sarvam Line (Instant)
              </button>
              <button
                type="button"
                onClick={() => setModalMode('order_new')}
                className={`py-2 rounded-lg transition-all ${
                  modalMode === 'order_new' ? 'bg-white text-[#0f0e17] shadow-xs' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
                }`}
              >
                Order New Line (KYC)
              </button>
            </div>

            {modalMode === 'link_existing' ? (
              /* Link Existing Number View */
              <div className="space-y-4">
                <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] text-xs text-[#15803d] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Carrier linking is unavailable</span>
                    <p className="text-[11px] text-[#16a34a] mt-0.5">
                      No carrier-ordering integration is connected. No number will be linked or purchased.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0f0e17] mb-1">
                    Sarvam Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={existingSarvamNumber}
                    onChange={(e) => setExistingSarvamNumber(e.target.value)}
                    placeholder="+91XXXXXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] text-xs font-mono font-bold focus:outline-none focus:border-[#7a50dc] focus:bg-white"
                  />
                  <p className="text-[10px] text-[#6c6b7e] mt-1">
                    Must be rented from Sarvam Dashboard (<a href="https://indus.sarvam.ai/samvaad" target="_blank" rel="noreferrer" className="text-[#7a50dc] underline inline-flex items-center gap-0.5">indus.sarvam.ai/samvaad <ExternalLink className="w-2.5 h-2.5" /></a>).
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0f0e17] mb-1">
                    Assign to AI Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] text-xs font-medium focus:outline-none focus:border-[#7a50dc] focus:bg-white cursor-pointer"
                  >
                    <option value="emp-lakshmi">Lakshmi &mdash; Real Estate Sales (Telugu + English)</option>
                    <option value="emp-bhuvana">Bhuvana &mdash; Car &amp; Bike Dealership (Telugu + English)</option>
                    <option value="emp-ananya">Dr. Ananya &mdash; Sanjeevani Clinic Care (Telugu + English)</option>
                    <option value="emp-jagan">Jagan &mdash; Jewellery Shop Sales Executive</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2e4ed]">
                  <button
                    type="button"
                    onClick={() => setShowBuyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !existingSarvamNumber.trim()}
                    className="px-5 py-2.5 text-xs bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    {isSubmitting ? 'Linking Line...' : 'Link Sarvam Number Now'}
                  </button>
                </div>
              </div>
            ) : (
              /* Order Dedicated Number View */
              <div className="space-y-4">
                {/* Series Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0f0e17]">1. Number Series Type</label>
                  <div className="space-y-1.5">
                    <label
                      onClick={() => setSeriesType('commercial-did')}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        seriesType === 'commercial-did' ? 'border-[#7a50dc] bg-[#f4effe]/60 ring-1 ring-[#7a50dc]' : 'border-[#e2e4ed] hover:bg-[#f8f9fc]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0f0e17]">Commercial Virtual DID (+91 79 / 80 / 40 / 22)</div>
                        <div className="text-[10px] text-[#6c6b7e]">Dedicated business line for both inbound &amp; outbound calls.</div>
                      </div>
                      <input type="radio" checked={seriesType === 'commercial-did'} readOnly className="accent-[#7a50dc]" />
                    </label>

                    <label
                      onClick={() => setSeriesType('140-promotional')}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        seriesType === '140-promotional' ? 'border-[#7a50dc] bg-[#f4effe]/60 ring-1 ring-[#7a50dc]' : 'border-[#e2e4ed] hover:bg-[#f8f9fc]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0f0e17]">140-Series (Promotional &amp; Lead Outreach)</div>
                        <div className="text-[10px] text-[#6c6b7e]">Mandated by TRAI for sales follow-ups and marketing campaigns.</div>
                      </div>
                      <input type="radio" checked={seriesType === '140-promotional'} readOnly className="accent-[#7a50dc]" />
                    </label>

                    <label
                      onClick={() => setSeriesType('1600-transactional')}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        seriesType === '1600-transactional' ? 'border-[#7a50dc] bg-[#f4effe]/60 ring-1 ring-[#7a50dc]' : 'border-[#e2e4ed] hover:bg-[#f8f9fc]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0f0e17]">1600-Series (Toll-Free &amp; Service Inbound)</div>
                        <div className="text-[10px] text-[#6c6b7e]">Reserved for clinic OPDs, banking OTPs, and customer support.</div>
                      </div>
                      <input type="radio" checked={seriesType === '1600-transactional'} readOnly className="accent-[#7a50dc]" />
                    </label>
                  </div>
                </div>

                {/* KYC Section */}
                <div className="space-y-3 pt-1 border-t border-[#e2e4ed]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0f0e17] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#7a50dc]" />
                      <span>2. Business KYC (TRAI &amp; DoT Mandatory)</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                      Carrier Verified
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0f0e17] mb-1">
                      Business Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sai Constructions Pvt Ltd, Sanjeevani Clinic"
                      className="w-full p-2.5 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] text-xs font-medium focus:outline-none focus:border-[#7a50dc] focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-[#0f0e17]">
                        Business PAN Number <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-[#6c6b7e]">10 characters (e.g. ABCDE1234F)</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={panNumber}
                      onChange={handlePanChange}
                      placeholder="ABCDE1234F"
                      className={`w-full p-2.5 rounded-xl border text-xs font-mono uppercase tracking-wider focus:outline-none ${
                        panError ? 'border-red-500 bg-red-50/50' : 'border-[#e2e4ed] bg-[#f8f9fc] focus:border-[#7a50dc] focus:bg-white'
                      }`}
                    />
                    {panError && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {panError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0f0e17] mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 36AABCS1429B1Z4"
                      className="w-full p-2.5 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] text-xs font-mono uppercase focus:outline-none focus:border-[#7a50dc] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0f0e17] mb-1">
                      Assign to AI Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assignedEmployee}
                      onChange={(e) => setAssignedEmployee(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e4ed] bg-[#f8f9fc] text-xs font-medium focus:outline-none focus:border-[#7a50dc] focus:bg-white cursor-pointer"
                    >
                      <option value="emp-lakshmi">Lakshmi &mdash; Real Estate Sales (Telugu + English)</option>
                      <option value="emp-bhuvana">Bhuvana &mdash; Car &amp; Bike Dealership (Telugu + English)</option>
                      <option value="emp-ananya">Dr. Ananya &mdash; Sanjeevani Clinic Care (Telugu + English)</option>
                      <option value="emp-jagan">Jagan &mdash; Jewellery Shop Sales Executive</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#f8f9fc] p-3 rounded-xl text-xs flex justify-between items-center border border-[#e2e4ed]">
                  <div>
                    <div className="font-bold text-[#0f0e17]">Business number</div>
                    <div className="text-[10px] text-[#6c6b7e]">Includes one channel; extra channels are charged separately.</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#0f0e17] font-mono">₹649 / mo</span>
                    <div className="text-[10px] text-[#ea580c] font-bold">KYC Verification Required</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e2e4ed]">
                  <button
                    type="button"
                    onClick={() => setShowBuyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !businessName.trim() || panNumber.length !== 10 || !!panError}
                    className="px-5 py-2.5 text-xs bg-[#0f0e17] hover:bg-[#1f1e28] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    {isSubmitting ? (
                      <span>Submitting KYC to Carrier...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                        <span>Submit KYC to Sarvam Telecom Carrier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
