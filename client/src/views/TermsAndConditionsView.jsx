import React from 'react';
import { FileText, ArrowLeft, ShieldAlert, PhoneCall, Scale, CreditCard, Mail } from 'lucide-react';

export default function TermsAndConditionsView({ onBack, onNavigate }) {
  return (
    <div className="min-h-screen bg-[#0c0a17] text-white font-sans antialiased selection:bg-amber-400 selection:text-[#130e26]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0c0a17]/90 backdrop-blur-xl border-b border-white/10 px-6 sm:px-12 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack || (() => onNavigate?.('landing'))}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sarvam</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-mono text-amber-300">Enterprise Service Terms v2.4</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300 font-mono">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            TERMS OF SERVICE &bull; EFFECTIVE OCTOBER 2026
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
            Terms & Conditions
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Please read these Terms and Conditions carefully before provisioning autonomous voice employees, conducting telephone campaigns, or deploying virtual telephony on Sarvam.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <div className="text-sm font-bold text-white">TRAI Telecom Regulations</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Strict adherence to Indian telecom regulations, operating hours (9 AM - 8 PM), and National Do Not Call (NDNC) registers.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div className="text-sm font-bold text-white">Strict Anti-Spam Policy</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Zero tolerance for deceptive caller ID spoofing, unsolicited cold spamming, political robocalls, or harassment.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div className="text-sm font-bold text-white">Transparent Per-Minute Billing</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Real-time per-second billing: Standard Indian voices @ â‚¹5/min, Premium Ultra-realistic voices @ â‚¹6.8/min.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm sm:text-[15px] text-white/80 leading-relaxed divide-y divide-white/10">
          <section className="space-y-3 pt-6">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">1.</span> Acceptance and Provision of Services
            </h2>
            <p>
              By signing up, accessing our API, or launching automated voice calling campaigns through Sarvam, you agree to be legally bound by these terms. If you represent an entity, you warrant that you possess the full legal authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">2.</span> Autonomous Telephony and Permitted Use
            </h2>
            <p>
              Sarvam provides autonomous conversational AI employees for customer service, lead qualification, appointment confirmations, and catalog delivery. Customers represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li>All phone numbers uploaded into Instant Leads or Bulk Campaigns have provided opt-in consent to be contacted.</li>
              <li>Outbound calls shall strictly operate during legally permitted commercial calling hours (09:00 to 20:00 Indian Standard Time).</li>
              <li>Calls will immediately honor user opt-outs, DND requests, and callback preferences.</li>
              <li>You shall not impersonate government agencies, financial institutions, or emergency services.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">3.</span> Virtual Phone Numbers and Telephony KYC
            </h2>
            <p>
              Virtual Indian telephony numbers (+91) provisioned via Sarvam require regulatory Know-Your-Customer (KYC) verification under Department of Telecommunications (DoT) guidelines. Sarvam reserves the right to suspend any telephony line immediately upon discovery of falsified KYC documentation or misuse.
            </p>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">4.</span> WhatsApp Business Integration
            </h2>
            <p>
              Automated WhatsApp catalogs, brochures, and confirmation messages dispatched by Sarvam employees operate in compliance with the Meta WhatsApp Business Messaging Policy. Senders must not dispatch prohibited categories including illegal items, unregulated financial schemes, or misleading medical claims.
            </p>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">5.</span> Service Level Commitment (SLA) & Latency
            </h2>
            <p>
              Sarvam commits to a 99.9% platform availability SLA for enterprise tiers. Sub-420ms real-time voice response latency is measured at the gateway boundary during active duplex WebSocket streaming under standard 4G/5G/Broadband network connectivity.
            </p>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">6.</span> Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Sarvam Technologies Private Limited. All rights reserved.
          </p>
          <button
            type="button"
            onClick={onBack || (() => onNavigate?.('landing'))}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] text-[#130e26] font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95"
          >
            <span>Return to Dashboard</span>
          </button>
        </div>
      </main>
    </div>
  );
}
