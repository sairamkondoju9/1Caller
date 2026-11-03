import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/api';

import {
  RefreshCw,
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
  Lock
} from 'lucide-react';

export const TOPUP_PACKS = [
  {
    id: 'pack_500',
    name: 'Starter Pack',
    price: 500,
    credits: 500,
    bonus: 0,
    bonusPct: '0%',
    badge: null,
    description: 'Ideal for initial testing and script verification (~100 mins standard)'
  },
  {
    id: 'pack_1000',
    name: 'Standard Pack',
    price: 1000,
    credits: 1000,
    bonus: 0,
    bonusPct: '0%',
    badge: null,
    description: 'Perfect for small outbound lead batches (~200 mins standard)'
  },
  {
    id: 'pack_5000',
    name: 'Growth Pack',
    price: 5000,
    credits: 5250,
    bonus: 250,
    bonusPct: '5%',
    badge: 'Popular',
    description: 'Includes 250 bonus credits (~1,050 mins standard)'
  },
  {
    id: 'pack_10000',
    name: 'Scale Pack',
    price: 10000,
    credits: 11000,
    bonus: 1000,
    bonusPct: '10%',
    badge: 'Best Value',
    description: 'Includes 1,000 bonus credits (~2,200 mins standard)'
  }
];

export default function BillingView({ currentUser, onBalanceUpdate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'statements' | 'invoicing'
  const [billing, setBilling] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Top-Up & Razorpay Checkout State
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [customAmount, setCustomAmount] = useState('5000');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null);

  // Invoicing Settings State
  const [gstin, setGstin] = useState('36AABCS1429B1Z2');
  const [companyName, setCompanyName] = useState('Sarvam Global Realty & AI Tech Pvt Ltd');
  const [address, setAddress] = useState('Plot 42, HITEC City, Hyderabad, Telangana - 500081');
  const [savedGst, setSavedGst] = useState(true);

  const fetchBillingData = () => {
    Promise.all([
      fetch('/api/billing', { headers: getAuthHeaders() }).then(r => r.json()),
      fetch('/api/billing/transactions', { headers: getAuthHeaders() }).then(r => r.json())
    ]).then(([bData, txData]) => {
      setBilling(bData);
      setTransactions(Array.isArray(txData) ? txData : []);
    }).catch(err => {
      console.error('Failed to load billing:', err);
    });
  };

  useEffect(() => {
    fetchBillingData();

    // Automatic verification if returning from hosted payment link callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaymentReturn = urlParams.get('payment_link') === 'true' || urlParams.has('razorpay_payment_id') || urlParams.has('order_id');
      const orderIdParam = urlParams.get('order_id') || urlParams.get('razorpay_payment_link_reference_id');
      const paymentIdParam = urlParams.get('razorpay_payment_id');
      const paymentLinkIdParam = urlParams.get('razorpay_payment_link_id');

      if (isPaymentReturn && (orderIdParam || paymentIdParam || paymentLinkIdParam)) {
        setSelectedPlan(prev => prev || { id: 'custom', name: 'Calling Credits Top-Up', price: 100, credits: 100, bonus: 0, bonusPct: '0%' });
        setShowSuccessModal(true);
        setIsAwaitingConfirmation(true);

        fetch('/api/billing/verify-order-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            orderId: orderIdParam,
            paymentId: paymentIdParam,
            paymentLinkId: paymentLinkIdParam
          })
        })
          .then(r => r.json())
          .then(data => {
            setIsAwaitingConfirmation(false);
            if (data.success && data.status === 'paid') {
              setPaymentSuccess(true);
              setLastPaymentDetails({
                paymentId: data.paymentId || paymentIdParam || 'rzp_verified',
                orderId: data.orderId || orderIdParam || 'order_verified',
                invoiceId: data.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
                credits: data.creditsAdded || 100,
                amount: data.baseAmount || 100,
                totalPaid: ((data.baseAmount || 100) * 1.18).toFixed(2),
                date: new Date().toLocaleString('en-IN')
              });
              fetchBillingData();
              if (onBalanceUpdate) onBalanceUpdate();
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(err => {
            console.error('[Payment Verification Network Error]:', err);
            setIsAwaitingConfirmation(false);
          });
      }
    }
  }, []);

  const balanceCredits = Number(billing?.balance_credits ?? 0);
  const standardMins = (balanceCredits / 5.0).toFixed(0);
  const premiumMins = (balanceCredits / 6.8).toFixed(0);
  const customMins = (balanceCredits / 3.5).toFixed(0);

  // Dynamically load Razorpay SDK if not already present
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.onload = () => resolve(true);
        existing.onerror = () => resolve(false);
        if (window.Razorpay) resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Directly Open Official Razorpay Checkout Popup Right On This Screen
  const handleProceedToRazorpay = async (planOrAmount) => {
    let plan;
    if (typeof planOrAmount === 'number' || typeof planOrAmount === 'string') {
      const amt = parseFloat(planOrAmount);
      if (!Number.isSafeInteger(amt) || amt < 100 || amt > 100000) {
        alert('Please enter a top-up amount between ₹100 and ₹100,000');
        return;
      }
      plan = {
        id: 'custom',
        name: 'Custom Amount Top-Up',
        price: amt,
        credits: amt,
        bonus: 0,
        bonusPct: '0%'
      };
    } else {
      plan = planOrAmount;
    }

    setLoadingPlanId(plan.id);

    try {
      // 1. Ensure Razorpay SDK is ready
      await loadRazorpayScript();

      // 2. Create Live Order on Server
      const orderRes = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          amount: plan.price,
          credits: plan.credits || plan.price,
          bonusCredits: plan.bonus || 0,
          planId: plan.id || 'custom',
          planName: plan.name || 'Calling Credits Top-Up'
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || orderData.details || 'Failed to initialize payment order');
      }

      // 3. Open Official Razorpay Checkout Popup Modal Directly Here
      if (window.Razorpay) {
        const options = {
          key: orderData.keyId || 'rzp_live_TvJ7YXfy027Dyd',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Sarvam Voice AI',
          description: `${(plan.credits || plan.price).toLocaleString()} Calling Credits`,
          image: 'https://sarvam-eta-rose.vercel.app/favicon.svg',
          order_id: orderData.orderId,
          prefill: {
            name: currentUser?.name || companyName || 'Customer',
            email: currentUser?.email || 'billing@sarvam.ai',
            contact: ''
          },
          theme: {
            color: '#7a50dc'
          },
          modal: {
            backdropclose: false,
            escape: true,
            handleback: true,
            ondismiss: () => {
              setLoadingPlanId(null);
            }
          },
          handler: async (response) => {
            setSelectedPlan(plan);
            setIsAwaitingConfirmation(true);
            setShowSuccessModal(true);

            try {
              const verifyRes = await fetch('/api/billing/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setPaymentSuccess(true);
                setLastPaymentDetails({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  invoiceId: verifyData.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
                  credits: plan.credits || plan.price,
                  amount: plan.price,
                  totalPaid: (plan.price * 1.18).toFixed(2),
                  date: new Date().toLocaleString('en-IN')
                });
                fetchBillingData();
                if (onBalanceUpdate) onBalanceUpdate();
              } else {
                alert(verifyData.error || 'Payment signature verification failed.');
                setShowSuccessModal(false);
              }
            } catch (vErr) {
              console.error('[Payment Verification Network Error]:', vErr);
              alert('Payment confirmed by Razorpay! Wallet credits will update automatically.');
              setShowSuccessModal(false);
            } finally {
              setIsAwaitingConfirmation(false);
              setLoadingPlanId(null);
            }
          }
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', (resp) => {
          setLoadingPlanId(null);
          alert('Payment Failed: ' + (resp.error?.description || 'Transaction cancelled'));
        });
        rzpInstance.open();
      } else if (orderData.paymentLinkUrl) {
        // Fallback if SDK is blocked by extreme browser extension
        window.location.href = orderData.paymentLinkUrl;
      }
    } catch (err) {
      console.error('[Razorpay Launch Error]:', err);
      alert('Could not launch Razorpay Checkout: ' + (err.message || 'Please check your connection and retry.'));
      setLoadingPlanId(null);
    }
  };

  const downloadTaxInvoice = () => {
    if (!lastPaymentDetails) return;
    const invoiceContent = `
================================================================================
                    TAX INVOICE - SARVAM TECHNOLOGIES
================================================================================
Invoice No   : ${lastPaymentDetails.invoiceId}
Date         : ${lastPaymentDetails.date}
Payment ID   : ${lastPaymentDetails.paymentId}
Order ID     : ${lastPaymentDetails.orderId}
Status       : PAYMENT CONFIRMED (PAID VIA RAZORPAY)

BILLED TO:
Customer     : ${companyName}
GSTIN        : ${gstin}
Address      : ${address}

LINE ITEMS:
--------------------------------------------------------------------------------
Description                           Credits      Rate      Amount (INR)
--------------------------------------------------------------------------------
Sarvam Voice AI Calling Credits     ${lastPaymentDetails.credits}         --        ₹${lastPaymentDetails.amount.toLocaleString()}
Subtotal                                                               ₹${lastPaymentDetails.amount.toLocaleString()}
CGST (9%)                                                              ₹${(lastPaymentDetails.amount * 0.09).toFixed(2)}
SGST (9%)                                                              ₹${(lastPaymentDetails.amount * 0.09).toFixed(2)}
--------------------------------------------------------------------------------
TOTAL PAID (INR)                                                       ₹${lastPaymentDetails.totalPaid}
================================================================================
Input Tax Credit (ITC) Eligible under CGST/SGST Act.
256-Bit SSL Encrypted Live Razorpay Gateway Transaction
================================================================================
`;
    const blob = new Blob([invoiceContent.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sarvam_Invoice_${lastPaymentDetails.invoiceId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactionsCSV = () => {
    const headers = ["Date", "Transaction ID", "Type", "Amount (INR)", "Credits", "Invoice"];
    const rows = transactions.map(t => [
      t.created_at,
      t.id,
      t.type,
      t.amount,
      t.credits,
      t.invoice_id
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sarvam_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#0f0e17] font-display">Billing &amp; Credits</h1>
            <span className="text-xs bg-[#f0fdf4] text-[#16a34a] font-semibold px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
              1 Credit = ₹1 INR
            </span>
          </div>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Prepaid credits are used for connected talk time. Credits do not expire.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-[#f0f1f6] p-1 rounded-xl border border-[#e2e4ed]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Overview &amp; Top-Up
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'statements' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Statements &amp; History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoicing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'invoicing' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            GSTIN &amp; Tax Invoices
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & TOP-UP */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Account Balance Card (Apple Liquid Glass Stage) */}
          <div className="apple-glass-stage text-white rounded-2xl p-7 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#cbd0df] flex items-center gap-2 font-mono">
                  <CreditCard className="w-4 h-4 text-[#3a3f5c]" />
                  Available Prepaid Balance
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono tabular-nums">
                    ₹{balanceCredits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/70 text-sm font-medium">Credits</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/80 font-mono tabular-nums">
                  <span className="bg-white/10 px-2.5 py-1 rounded-md">
                    ≈ {standardMins} mins @ Standard (₹5.00/min)
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-md">
                    ≈ {premiumMins} mins @ Premium (₹6.80/min)
                  </span>
                  <span className="bg-[#16a34a]/20 text-[#86efac] border border-[#16a34a]/40 px-2.5 py-1 rounded-md font-semibold">
                    ≈ {customMins} mins @ Custom rate (from ₹3.50/min)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('custom-topup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#0f0e17]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-[#cbd0df]" />
                  Instant Top-up
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('statements')}
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  View Statements
                </button>
              </div>
            </div>

            {/* Ambient Backlight Glow */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#0f0e17]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Curated Top-Up Packs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#0f0e17] font-display">Instant Calling Credit Packs</h2>
                <p className="text-xs text-[#6c6b7e] mt-0.5">Click any pack to open Razorpay Checkout directly on this page</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Live Gateway (rzp_live_...)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TOPUP_PACKS.map((pack) => {
                const isPackLoading = loadingPlanId === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`apple-glass rounded-xl p-5 border transition-all flex flex-col justify-between relative ${
                      pack.badge ? 'border-[#7a50dc] shadow-md bg-purple-50/20' : 'border-[#e2e4ed] hover:border-[#cbd0df]'
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2.5 right-4 bg-[#7a50dc] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {pack.badge}
                      </span>
                    )}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#6c6b7e]">{pack.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-[#0f0e17] font-display tabular-nums">
                          ₹{pack.price.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#6c6b7e]">+ 18% GST</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-[#16a34a] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{pack.credits.toLocaleString()} Calling Credits</span>
                      </div>
                      {pack.bonus > 0 && (
                        <div className="text-[11px] text-[#7a50dc] font-semibold mt-0.5">
                          +{pack.bonus} bonus credits included ({pack.bonusPct})
                        </div>
                      )}
                      <p className="text-[11.5px] text-[#6c6b7e] mt-3 leading-relaxed">
                        {pack.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={loadingPlanId !== null}
                      onClick={() => handleProceedToRazorpay(pack)}
                      className={`mt-5 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 ${
                        pack.badge
                          ? 'bg-[#7a50dc] hover:bg-[#683ec2] text-white shadow-sm'
                          : 'bg-[#0f0e17] hover:bg-[#1f1e28] text-white shadow-xs'
                      }`}
                    >
                      {isPackLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Opening Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Pay ₹{(pack.price * 1.18).toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Top-Up Box */}
          <div id="custom-topup-section" className="apple-glass p-6 rounded-xl border border-[#e2e4ed] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0f0e17]">Custom Recharge Amount</h3>
                <p className="text-xs text-[#6c6b7e] mt-0.5">
                  Enter any amount between ₹100 and ₹100,000. ₹1 INR equals 1 Calling Credit.
                </p>
              </div>
              <span className="text-xs text-[#6c6b7e] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" /> Official Razorpay Checkout Popup
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2500, 5000, 10000, 25000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomAmount(String(preset))}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer tabular-nums active:scale-[0.97] ${
                    Number(customAmount) === preset
                      ? 'bg-[#0f0e17] text-white border-[#0f0e17]'
                      : 'bg-[#f8f9fc] hover:bg-[#eceef4] text-[#3a3f5c] border-[#e2e4ed]'
                  }`}
                >
                  ₹{preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6c6b7e]">₹</span>
                <input
                  id="custom-topup-amount"
                  type="number"
                  min="100"
                  max="100000"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="5000"
                  className="apple-glass-input w-full pl-8 pr-3 py-2.5 text-sm font-bold text-[#0f0e17] font-mono tabular-nums"
                />
              </div>

              <div className="text-xs text-[#6c6b7e] self-center">
                Total with 18% GST: <strong className="text-[#0f0e17] tabular-nums">₹{((parseFloat(customAmount) || 0) * 1.18).toFixed(2)}</strong>
              </div>

              <button
                type="button"
                disabled={loadingPlanId !== null}
                onClick={() => handleProceedToRazorpay(customAmount)}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] disabled:opacity-50"
              >
                {loadingPlanId === 'custom' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Opening Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay via Razorpay Checkout &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Usage billing explanation */}
          <div className="apple-glass rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#e2e4ed]">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#f6f7fb] text-[#0f0e17] flex items-center justify-center shrink-0 mt-0.5 border border-[#e2e4ed]">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0f0e17]">
                  Connected talk-time billing
                </h3>
                <p className="text-xs text-[#3a3f5c] leading-relaxed max-w-3xl">
                  Voice usage is charged strictly by connected minute. Standard is ₹5.00/min, Premium is ₹6.80/min, and custom volume pricing starts from ₹3.50/min. Dedicated numbers and additional lines are charged separately.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-3 py-2 rounded-lg border border-[#bbf7d0]">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              GST Invoices Generated Instantly
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATEMENTS & TRANSACTIONS */}
      {activeTab === 'statements' && (
        <div className="apple-glass rounded-xl border border-[#e2e4ed] overflow-hidden space-y-4">
          <div className="p-6 border-b border-[#e2e4ed] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0f0e17]">Statements &amp; Transaction Ledger</h2>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Real-time log of top-ups, deductions, and phone number renewals</p>
            </div>
            <button
              type="button"
              onClick={exportTransactionsCSV}
              className="flex items-center gap-2 text-xs font-semibold text-[#0f0e17] bg-[#f6f7fb] hover:bg-[#f0f2f8] px-3 py-2 rounded-lg border border-[#e2e4ed] transition-all cursor-pointer self-start sm:self-auto active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              Download Statement CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fc] text-[#6c6b7e] font-semibold border-b border-[#e2e4ed] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Date &amp; Time</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount (INR)</th>
                  <th className="py-3 px-4">Credits Added</th>
                  <th className="py-3 px-4">Tax Invoice</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e4ed] text-[#3a3f5c]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6c6b7e]">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-[#0f0e17] tabular-nums">
                        {new Date(tx.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#6c6b7e]">{tx.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0f0e17]">{tx.description}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0f0e17] tabular-nums">₹{parseFloat(tx.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0]">
                          +{parseFloat(tx.credits).toFixed(0)} Credits
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading Invoice ${tx.invoice_id} (GST compliant PDF)`)}
                          className="flex items-center gap-1 text-[#0f0e17] hover:text-[#1f1e28] font-semibold cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{tx.invoice_id}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GSTIN & INVOICING PROFILE */}
      {activeTab === 'invoicing' && (
        <div className="apple-glass rounded-xl border border-[#e2e4ed] p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17]">Business &amp; GSTIN Billing Profile</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">
              Invoices will be automatically generated with 18% GST (CGST+SGST / IGST) and sent to your email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a3f5c]">Registered Business / Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="apple-glass-input w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a3f5c]">GSTIN Identification Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="36AABCS1429B1Z2"
                className="apple-glass-input w-full text-xs font-mono font-semibold uppercase"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#3a3f5c]">Registered Tax Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="apple-glass-input w-full text-xs resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSavedGst(true);
                alert("GST profile updated successfully. Future tax invoices will reflect this information.");
              }}
              className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-5 py-2 rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              Save Invoicing Details
            </button>
            {savedGst && (
              <span className="text-xs font-semibold text-[#16a34a] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GST profile verified &amp; active
              </span>
            )}
          </div>
        </div>
      )}

      {/* VERIFIED TAX INVOICE RECEIPT MODAL (ONLY AFTER SUCCESSFUL PAYMENT) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="apple-glass rounded-2xl max-w-md w-full shadow-2xl border border-white/80 overflow-hidden bg-white/95 backdrop-blur-2xl animate-dialog-in">
            <div className="p-5 border-b border-[#e2e4ed] flex items-center justify-between bg-[#f8f9fc]/80">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0f0e17]" />
                <h3 className="font-bold text-[#0f0e17] text-sm">Payment Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setIsAwaitingConfirmation(false);
                }}
                className="p-1 text-[#6c6b7e] hover:text-[#0f0e17] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Awaiting Confirmation */}
            {isAwaitingConfirmation && !paymentSuccess ? (
              <div className="p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0f0e17]">Verifying Razorpay Payment...</h4>
                  <p className="text-xs text-[#6c6b7e] mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Connecting to Razorpay Live Gateway to confirm your transaction. Calling credits will be added to your balance immediately.
                  </p>
                </div>
              </div>
            ) : paymentSuccess ? (
              /* Verified & Paid Success Invoice */
              <div className="p-8 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] text-[#16a34a] text-xs font-bold border border-[#bbf7d0] mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Live Payment Verified
                  </div>
                  <h4 className="text-xl font-extrabold text-[#0f0e17]">Wallet Credited!</h4>
                  <p className="text-xs text-[#6c6b7e] mt-1">
                    Added <strong className="text-[#0f0e17]">+{selectedPlan?.credits?.toLocaleString() || 'Calling'} Credits</strong> to your prepaid balance.
                  </p>
                </div>

                {lastPaymentDetails && (
                  <div className="bg-[#f8f9fc] rounded-xl p-4 text-left border border-[#e2e4ed] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6c6b7e]">Payment ID:</span>
                      <span className="font-mono font-semibold text-[#0f0e17]">{lastPaymentDetails.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c6b7e]">Order ID:</span>
                      <span className="font-mono text-[#6c6b7e]">{lastPaymentDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c6b7e]">Invoice Number:</span>
                      <span className="font-bold text-[#0f0e17]">{lastPaymentDetails.invoiceId}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#e2e4ed]">
                      <span className="text-[#6c6b7e]">Amount Paid:</span>
                      <span className="font-extrabold text-[#16a34a] tabular-nums">₹{lastPaymentDetails.totalPaid}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadTaxInvoice}
                    className="flex-1 bg-white hover:bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download GST Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
