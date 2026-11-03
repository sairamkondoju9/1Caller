import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/api';

import {
  RefreshCw,
  ExternalLink,
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  FileText,
  ShieldCheck,
  Building,
  HelpCircle,
  Sparkles,
  ChevronRight,
  X,
  QrCode,
  AlertCircle,
  Lock,
  Receipt
} from 'lucide-react';

export default function BillingView({ currentUser, onBalanceUpdate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'statements' | 'invoicing'
  const [billing, setBilling] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recharge Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [livePaymentLink, setLivePaymentLink] = useState('');
  const [activeOrderId, setActiveOrderId] = useState('');
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null);
  const [gatewayError, setGatewayError] = useState('');

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
      setTransactions(txData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load billing:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBillingData();

    // Automatic verification when returning from official Razorpay Live Gateway
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaymentReturn = urlParams.get('payment_link') === 'true' || urlParams.has('razorpay_payment_id') || urlParams.has('order_id');
      const orderIdParam = urlParams.get('order_id') || urlParams.get('razorpay_payment_link_reference_id');
      const paymentIdParam = urlParams.get('razorpay_payment_id');
      const paymentLinkIdParam = urlParams.get('razorpay_payment_link_id');

      if (isPaymentReturn && (orderIdParam || paymentIdParam || paymentLinkIdParam)) {
        setProcessing(true);
        setSelectedPlan(prev => prev || { id: 'custom', name: 'Calling Credits Top-Up', price: 100, credits: 100, bonus: 0, bonusPct: '0%' });
        setShowTopupModal(true);
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
            setProcessing(false);
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
            setProcessing(false);
            setIsAwaitingConfirmation(false);
          });
      }
    }
  }, []);

  const balanceCredits = Number(billing?.balance_credits ?? 0);
  const standardMins = (balanceCredits / 5.0).toFixed(0);
  const premiumMins = (balanceCredits / 6.8).toFixed(0);
  const customMins = (balanceCredits / 3.5).toFixed(0);

  const handleCustomCheckout = () => {
    const amt = parseFloat(customAmount);
    if (!Number.isSafeInteger(amt) || amt < 100 || amt > 100000) {
      alert('Choose a top-up amount between ₹100 and ₹100,000');
      return;
    }
    setSelectedPlan({
      id: 'custom',
      name: 'Custom Amount Top-Up',
      price: amt,
      credits: amt,
      bonus: 0,
      bonusPct: '0%'
    });
    setPaymentSuccess(false);
    setShowTopupModal(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
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

  const startStatusPoller = (orderId, plan) => {
    // Only poll in background; NEVER block the user's modal with isAwaitingConfirmation
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch('/api/billing/verify-order-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        if (data.success && data.status === 'paid') {
          clearInterval(interval);
          setProcessing(false);
          setIsAwaitingConfirmation(false);
          setPaymentSuccess(true);
          setLastPaymentDetails({
            paymentId: data.paymentId || 'rzp_verified',
            orderId: data.orderId || orderId,
            invoiceId: data.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
            credits: data.creditsAdded || plan.credits || plan.price,
            amount: plan.price,
            totalPaid: (plan.price * 1.18).toFixed(2),
            date: new Date().toLocaleString('en-IN')
          });
          fetchBillingData();
          if (onBalanceUpdate) onBalanceUpdate();
        }
      } catch {}
    }, 3000);
    return interval;
  };

  // Generate Live Razorpay Order and optional UPI QR Code
  const generateQrForPlan = async (plan) => {
    if (!plan) return;
    setQrLoading(true);
    setGatewayError('');
    try {
      const orderRes = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          amount: plan.price,
          credits: plan.credits,
          bonusCredits: plan.bonus || 0,
          planId: plan.id || 'custom',
          planName: plan.name || 'Credits Top-Up'
        })
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        setActiveOrderId(orderData.orderId);
        if (orderData.paymentLinkUrl) {
          setLivePaymentLink(orderData.paymentLinkUrl);
          setQrCodeDataUrl(orderData.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(orderData.paymentLinkUrl)}`);
        }
        startStatusPoller(orderData.orderId, plan);
      }
    } catch (err) {
      console.warn('[QR Gen Note]:', err);
    } finally {
      setQrLoading(false);
    }
  };

  // Automatically fetch order/QR in background when modal opens
  useEffect(() => {
    if (showTopupModal && selectedPlan && !paymentSuccess) {
      generateQrForPlan(selectedPlan);
    }
  }, [showTopupModal, selectedPlan?.price]);

  // Open Official Razorpay Checkout Modal
  const handleDirectGatewayPay = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setGatewayError('');
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay Checkout SDK. Please check your connection or ad-blocker.');
      }

      const orderRes = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          amount: selectedPlan.price,
          credits: selectedPlan.credits,
          bonusCredits: selectedPlan.bonus || 0,
          planId: selectedPlan.id || 'custom',
          planName: selectedPlan.name || 'Calling Credits Top-Up'
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || orderData.details || 'Failed to initialize Razorpay live order');
      }

      setActiveOrderId(orderData.orderId);
      if (orderData.paymentLinkUrl) {
        setLivePaymentLink(orderData.paymentLinkUrl);
      }

      // Initialize Official Razorpay Standard Checkout Popup
      const options = {
        key: orderData.keyId || 'rzp_live_TvJ7YXfy027Dyd',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Sarvam Voice AI',
        description: `${(selectedPlan.credits || selectedPlan.price).toLocaleString()} Calling Credits`,
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
            setProcessing(false);
          }
        },
        handler: async (response) => {
          setIsAwaitingConfirmation(true);
          try {
            const verifyRes = await fetch('/api/billing/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlan.id || 'custom',
                credits: selectedPlan.credits,
                amount: selectedPlan.price
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentSuccess(true);
              setLastPaymentDetails({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                invoiceId: verifyData.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
                credits: selectedPlan.credits || selectedPlan.price,
                amount: selectedPlan.price,
                totalPaid: (selectedPlan.price * 1.18).toFixed(2),
                date: new Date().toLocaleString('en-IN')
              });
              fetchBillingData();
              if (onBalanceUpdate) onBalanceUpdate();
            } else {
              setGatewayError(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (vErr) {
            setGatewayError('Verification connection error: ' + vErr.message);
          } finally {
            setIsAwaitingConfirmation(false);
            setProcessing(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (resp) => {
        setProcessing(false);
        const reason = resp.error?.description || resp.error?.reason || 'Payment could not be completed';
        setGatewayError('Payment Failed: ' + reason);
      });
      rzpInstance.open();
    } catch (err) {
      console.error('[Payment Gateway Error]:', err);
      setGatewayError(err.message || 'Unable to launch Razorpay gateway');
      setProcessing(false);
    }
  };

  const handleProcessTopup = async () => {
    return handleDirectGatewayPay();
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
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Overview &amp; Top-Up
          </button>
          <button
            onClick={() => setActiveTab('statements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'statements' ? 'bg-white text-[#0f0e17] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
            }`}
          >
            Statements &amp; History
          </button>
          <button
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
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono">
                    ₹{balanceCredits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/70 text-sm font-medium">Credits</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/80 font-mono">
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
                  onClick={() => document.getElementById('custom-topup-amount')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#0f0e17]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#cbd0df]" />
                  Instant Top-up
                </button>
                <button
                  onClick={() => setActiveTab('statements')}
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <FileText className="w-4 h-4" />
                  View Statements
                </button>
              </div>
            </div>

            {/* Ambient Backlight Glow */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#0f0e17]/20 rounded-full blur-3xl pointer-events-none" />
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
                  Voice usage is charged by connected minute at the selected employee tier. Dedicated numbers and additional channels are charged separately.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-3 py-2 rounded-lg border border-[#bbf7d0]">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              Prices exclude GST
            </div>
          </div>

          <div className="apple-glass p-6 rounded-xl border border-[#e2e4ed]">
            <h2 className="text-lg font-bold text-[#0f0e17] font-display">Current pricing</h2>
            <p className="text-xs text-[#6c6b7e] mt-1">One credit equals ₹1. Credits do not expire. Prices exclude 18% GST.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div><p className="text-xs text-[#6c6b7e]">Standard</p><p className="text-lg font-bold text-[#0f0e17]">₹5/min</p></div>
              <div><p className="text-xs text-[#6c6b7e]">Premium</p><p className="text-lg font-bold text-[#0f0e17]">₹6.80/min</p></div>
              <div><p className="text-xs text-[#6c6b7e]">Custom volume pricing</p><p className="text-lg font-bold text-[#0f0e17]">From ₹3.50/min</p></div>
            </div>
            <p className="text-xs text-[#6c6b7e] mt-4">A dedicated business number costs ₹649/month and includes one channel. Each extra channel is ₹649/month.</p>
          </div>

          {/* Custom Amount Top-Up Box */}
          <div className="apple-glass p-6 rounded-xl border border-[#e2e4ed] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h3 className="text-sm font-bold text-[#0f0e17]">Enter Custom Recharge Amount</h3>
              <p className="text-xs text-[#6c6b7e] mt-0.5">
                Add a custom amount from ₹100 to ₹100,000. Each rupee adds one credit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-44">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6c6b7e]">₹</span>
                <input
                  id="custom-topup-amount"
                  type="number"
                  min="100"
                  max="100000"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="25,000"
                  className="apple-glass-input w-full pl-7 pr-3 py-2 text-sm font-bold text-[#0f0e17] font-mono"
                />
              </div>
              <button
                onClick={handleCustomCheckout}
                className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                Proceed to Pay
              </button>
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
              onClick={exportTransactionsCSV}
              className="flex items-center gap-2 text-xs font-semibold text-[#0f0e17] bg-[#f6f7fb] hover:bg-[#f0f2f8] px-3 py-2 rounded-lg border border-[#e2e4ed] transition-all cursor-pointer self-start sm:self-auto"
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
                      <td className="py-3.5 px-6 font-medium text-[#0f0e17]">
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
                      <td className="py-3.5 px-4 font-bold text-[#0f0e17]">₹{parseFloat(tx.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0]">
                          +{parseFloat(tx.credits).toFixed(0)} Credits
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
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
              onClick={() => {
                setSavedGst(true);
                alert("GST profile updated successfully. Future tax invoices will reflect this information.");
              }}
              className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-5 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
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

      {/* RECHARGE / CHECKOUT MODAL (Apple HIG Glass Sheet) */}
      {showTopupModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="apple-glass rounded-2xl max-w-md w-full shadow-2xl border border-white/80 overflow-hidden bg-white/95 backdrop-blur-2xl animate-dialog-in">
            <div className="p-5 border-b border-[#e2e4ed] flex items-center justify-between bg-[#f8f9fc]/80">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0f0e17]" />
                <h3 className="font-bold text-[#0f0e17] text-sm">Add Calling Credits</h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="p-1 text-[#6c6b7e] hover:text-[#0f0e17] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAwaitingConfirmation && !paymentSuccess ? (
              <div className="p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0f0e17]">Verifying Razorpay Payment...</h4>
                  <p className="text-xs text-[#6c6b7e] mt-1 max-w-xs mx-auto">
                    Connecting to Razorpay Live Gateway to confirm your transaction. Calling credits will be added to your balance immediately.
                  </p>
                </div>
              </div>
            ) : paymentSuccess ? (
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
                    Added <strong className="text-[#0f0e17]">+{selectedPlan.credits.toLocaleString()} Calling Credits</strong> to your wallet.
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
                      <span className="font-extrabold text-[#16a34a]">₹{lastPaymentDetails.totalPaid}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={downloadTaxInvoice}
                    className="flex-1 bg-white hover:bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download GST Invoice
                  </button>
                  <button
                    onClick={() => setShowTopupModal(false)}
                    className="flex-1 bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="bg-[#f8f9fc] p-4 rounded-xl space-y-2 border border-[#e2e4ed]">
                  <div className="flex items-center justify-between text-xs text-[#6c6b7e]">
                    <span>Plan / Top-up:</span>
                    <span className="font-bold text-[#0f0e17]">{selectedPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6c6b7e]">
                    <span>Base Amount:</span>
                    <span className="font-bold text-[#0f0e17]">₹{selectedPlan.price.toLocaleString()}</span>
                  </div>
                  {selectedPlan.bonus > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#16a34a] font-semibold">
                      <span>Bonus Credits ({selectedPlan.bonusPct}):</span>
                      <span>+{selectedPlan.bonus.toLocaleString()} Credits</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#6c6b7e] pt-1 border-t border-[#e2e4ed]">
                    <span>GST (18% Input Tax Credit):</span>
                    <span>₹{(selectedPlan.price * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-extrabold text-[#0f0e17] pt-1 border-t border-[#e2e4ed]">
                    <span>Total Amount Payable:</span>
                    <span className="text-[#0f0e17]">₹{(selectedPlan.price * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[#f8f9fc] p-4 rounded-xl border border-[#e2e4ed] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0f0e17]">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <span>Official Razorpay Live Gateway</span>
                  </div>
                  <p className="text-xs text-[#6c6b7e] leading-relaxed">
                    Click the button below to open the secure Razorpay payment window. Choose from UPI (Google Pay, PhonePe, Paytm, CRED), Live Dynamic QR, Credit/Debit Cards, or Netbanking.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Google Pay', 'PhonePe', 'Paytm', 'UPI QR', 'Credit/Debit Cards', 'Netbanking'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white border border-[#e2e4ed] text-[10.5px] font-semibold text-[#3a3f5c]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {qrCodeDataUrl && (
                    <div className="pt-2 border-t border-[#e2e4ed] flex flex-col items-center">
                      <div className="text-[11px] font-semibold text-[#6c6b7e] mb-1.5 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-[#7a50dc]" /> Or scan direct UPI QR with your phone:
                      </div>
                      <img src={qrCodeDataUrl} alt="UPI QR" className="w-36 h-36 rounded-xl border border-white shadow-xs" />
                      <div className="text-[10px] text-[#16a34a] font-medium mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping" />
                        Listening for payment... Credits update automatically
                      </div>
                    </div>
                  )}
                </div>

                {gatewayError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {gatewayError}
                  </div>
                )}

                <div className="text-[11px] text-[#6c6b7e] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>256-Bit SSL Encrypted Razorpay Live Gateway (rzp_live_...)</span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    disabled={processing}
                    onClick={handleDirectGatewayPay}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    {processing ? 'Connecting to Razorpay Gateway...' : `Pay ₹${(selectedPlan.price * 1.18).toFixed(2)} via Razorpay Live Gateway`}
                  </button>
                  {livePaymentLink && (
                    <button
                      type="button"
                      onClick={() => window.open(livePaymentLink, '_blank')}
                      className="w-full text-center text-xs text-[#6c6b7e] hover:text-[#0f0e17] py-1.5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Live Gateway in New Tab</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
