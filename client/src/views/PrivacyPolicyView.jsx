import React from 'react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export default function PrivacyPolicyView({ onBack, onNavigate }) {
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-300">DPDP Act (India) & GDPR Compliant</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300 font-mono">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            LEGAL & COMPLIANCE &bull; LAST UPDATED OCTOBER 2026
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            At Sarvam Voice AI (Sarvam Technologies Private Limited), your privacy, biometric voice confidentiality, and enterprise data security are our highest priorities.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <div className="text-sm font-bold text-white">AES-256 Voice Encryption</div>
            <p className="text-xs text-white/60 leading-relaxed">
              All telephone audio streams and transcripts are encrypted in transit via TLS 1.3 and at rest with AES-256.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div className="text-sm font-bold text-white">Explicit Call Consent</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Autonomous employees announce call recording and business identification in accordance with TRAI regulations.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Shield className="w-5 h-5 text-[#a78bfa]" />
            <div className="text-sm font-bold text-white">Zero Third-Party Training</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Your business catalogs, lead conversations, and proprietary scripts are never used to train external public LLMs.
            </p>
          </div>
        </div>

        {/* Detailed Legal Clauses */}
        <div className="space-y-10 text-sm sm:text-[15px] text-white/80 leading-relaxed divide-y divide-white/10">
          <section className="space-y-3 pt-6">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">1.</span> Information We Collect
            </h2>
            <p>
              We collect information to provide, maintain, and enhance our multilingual Autonomous Voice Employee services:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li><strong className="text-white">Account Information:</strong> Name, business name, work email address, phone number, and billing credentials.</li>
              <li><strong className="text-white">Telephony & Call Data:</strong> Real-time audio recordings, telephony metadata (caller ID, duration, time of call, call status), and automated ASR transcripts.</li>
              <li><strong className="text-white">Business Knowledge & Prompts:</strong> Uploaded training documents, PDF brochures, FAQs, WhatsApp templates, and call flows configured by your workspace.</li>
              <li><strong className="text-white">Technical Telemetry:</strong> IP address, device fingerprints, browser version, and real-time latency diagnostics.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">2.</span> How We Use Your Data
            </h2>
            <p>
              Your data is exclusively utilized for executing the autonomous voice communications you authorize:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li>Dispatching outbound customer callback inquiries and qualifying inbound leads.</li>
              <li>Synthesizing ultra-low latency real-time voice audio via Sarvam Bulbul and Cartesia Sonic-2 models.</li>
              <li>Delivering automated WhatsApp brochures and notifications upon call completion.</li>
              <li>Providing real-time analytics, latency waterfalls, and conversion tracking in your customer dashboard.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">3.</span> Data Retention and Deletion Rights
            </h2>
            <p>
              Under the Digital Personal Data Protection (DPDP) Act of India and international standards:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li>Call recordings and transcripts are retained for 90 days by default, after which they are automatically expunged unless your organization configures extended archiving.</li>
              <li>You may request complete erasure of your workspace data, employee configurations, or call logs at any time by contacting our data protection officer.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">4.</span> Security & Infrastructure
            </h2>
            <p>
              Our infrastructure is hosted in ISO 27001 and SOC 2 Type II certified data centers within India (Hyderabad and Mumbai availability zones). All network communications require TLS 1.3 encryption. Internal access to databases is gated by role-based access control (RBAC) and hardware-token multi-factor authentication.
            </p>
          </section>

          <section className="space-y-3 pt-8">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-amber-400">5.</span> Contact Privacy & Grievance Officer
            </h2>
            <p>
              For privacy inquiries, data subject requests, or regulatory compliance questions, reach our Data Protection Officer:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-white/90">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Grievance & Privacy Office</div>
                <div className="text-xs text-white/60">Email: <a href="mailto:privacy@sarvam.ai" className="text-amber-400 underline">privacy@sarvam.ai</a> &bull; Address: Hitech City, Hyderabad, Telangana 500081, India</div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
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
