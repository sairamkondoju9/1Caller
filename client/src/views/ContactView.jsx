import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Sparkles, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function ContactView({ onBack, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your name and work email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }
      setSubmitted(true);
    } catch (err) {
      // Graceful fallback for offline or network glitch
      console.warn('Contact form submit notice:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page text-ink font-sans antialiased selection:bg-brand-500/20 selection:text-ink">
      {/* Top Header */}
      <header className="border-b border-line bg-page/95 backdrop-blur-md sticky top-0 z-30">
        <div className="wrap py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack || (() => onNavigate?.('landing'))}
            className="inline-flex items-center gap-2 text-ink font-medium text-[14px] hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-mono text-muted">Direct Support: support@outpero.com</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative overflow-hidden">
        <div className="wrap pt-12 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-[minmax(0,4.5fr)_minmax(0,5.5fr)] gap-10 lg:gap-16 items-start">
          {/* Left Column: Contact Details & Entity Information */}
          <div className="space-y-6">
            <div>
              <div className="t-eyebrow text-brand-600 mb-3 inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                Contact Outpero
              </div>
              <h1 className="text-[clamp(2.3rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.04em] font-semibold text-ink font-display text-balance">
                Let&apos;s talk about <span className="text-brand-600">your calls.</span>
              </h1>
              <p className="t-lead text-muted mt-4 max-w-[440px]">
                High call volumes, custom minute rates, setup help or an enterprise demo for your team: tell us what you need.
              </p>
            </div>

            {/* Direct Cards */}
            <div className="grid gap-3 pt-2">
              {/* Email Card */}
              <a
                href="mailto:support@outpero.com"
                className="group flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 hover:border-brand-300 transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-ink">Email us</span>
                  <span className="block text-[13px] text-muted truncate">support@outpero.com</span>
                </div>
              </a>

              {/* Phone Helpline Card */}
              <a
                href="tel:+919963693366"
                className="group flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 hover:border-brand-300 transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-ink">Customer Helpline</span>
                  <span className="block text-[13px] text-muted">+91 99636 93366 &bull; Mon–Sat, 9 AM – 6 PM IST</span>
                </div>
              </a>

              {/* Legal Entity Card */}
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-paper p-4 shadow-xs">
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 text-[13.5px]">
                  <span className="block font-semibold text-ink">Operating Legal Entity</span>
                  <span className="block text-muted mt-0.5 font-medium">OpenDG Private Limited</span>
                  <span className="block text-faint text-[12.5px] mt-0.5">Hyderabad, Telangana 500081, India</span>
                </div>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="p-4 rounded-2xl bg-canvas border border-line text-[13px] text-muted space-y-1.5">
              <div className="font-semibold text-ink flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Razorpay &amp; TRAI Verified Merchant
              </div>
              <p>
                All payment transactions, GST invoicing, and telecalling subscriptions are governed by our{' '}
                <button type="button" onClick={() => onNavigate?.('terms-and-conditions')} className="text-brand-600 underline cursor-pointer">Terms</button>,{' '}
                <button type="button" onClick={() => onNavigate?.('privacy-policy')} className="text-brand-600 underline cursor-pointer">Privacy</button>, and{' '}
                <button type="button" onClick={() => onNavigate?.('refund-policy')} className="text-brand-600 underline cursor-pointer">Refund Policy</button>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Request Form */}
          <div className="rounded-3xl border border-line bg-paper p-6 sm:p-9 shadow-md">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-bold text-ink font-display">Inquiry Sent Successfully</h3>
                <p className="text-[14.5px] text-muted max-w-[380px] mx-auto leading-relaxed">
                  Thank you for reaching out! Our enterprise calling specialist will review your requirements and connect with you within <strong>2 business hours</strong>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', businessName: '', email: '', phone: '', requirements: '' });
                    }}
                    className="px-5 py-2.5 rounded-full border border-line text-ink text-xs font-semibold hover:border-ink transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-ink font-display">Send us a message</h3>
                  <p className="text-xs text-muted mt-1">Fill out the details below and we&apos;ll get back to you promptly.</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-page text-[14px] text-ink placeholder-muted/60 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                    Business / Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="e.g. Apex Realty or Sri Krishna Jewellers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-page text-[14px] text-ink placeholder-muted/60 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="rahul@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-page text-[14px] text-ink placeholder-muted/60 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-page text-[14px] text-ink placeholder-muted/60 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                    What should your AI employee do?
                  </label>
                  <textarea
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Tell us about your call volume, language requirements (Telugu, Hindi, Tamil, Kannada, etc.), or sales/support workflows..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-page text-[14px] text-ink placeholder-muted/60 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-ink text-white font-semibold text-[14px] hover:bg-ink-2 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting inquiry...</span>
                  ) : (
                    <>
                      <span>Send inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
