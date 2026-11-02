import React from 'react';
import { ArrowLeft, Scale, ShieldAlert, PhoneCall, CreditCard, Mail, CheckCircle2 } from 'lucide-react';

export default function TermsAndConditionsView({ onBack, onNavigate }) {
  const sections = [
    { id: 'who-we-are', num: '01', title: 'Who we are & scope' },
    { id: 'your-account', num: '02', title: 'Your account' },
    { id: 'the-service', num: '03', title: 'The Service' },
    { id: 'credits-and-billing', num: '04', title: 'Credits, prices & billing' },
    { id: 'calling-responsibilities', num: '05', title: 'Calling rules in India' },
    { id: 'acceptable-use', num: '06', title: 'Acceptable use' },
    { id: 'ai-conversations', num: '07', title: 'AI-generated conversations' },
    { id: 'carriers-and-third-parties', num: '08', title: 'Carriers & third parties' },
    { id: 'availability-and-support', num: '09', title: 'Availability & support' },
    { id: 'your-data', num: '10', title: 'Your data ownership' },
    { id: 'intellectual-property', num: '11', title: 'Intellectual property' },
    { id: 'confidentiality', num: '12', title: 'Confidentiality' },
    { id: 'liability', num: '13', title: 'Liability limitations' },
    { id: 'indemnity', num: '14', title: 'Indemnity' },
    { id: 'termination', num: '15', title: 'Ending the agreement' },
    { id: 'changes', num: '16', title: 'Changes to terms' },
    { id: 'governing-law', num: '17', title: 'Governing law & disputes' },
    { id: 'contact', num: '18', title: 'Contact & legal entity' }
  ];

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
            <span className="text-[12px] font-mono text-muted">TRAI &amp; DoT Telecom Compliant</span>
          </div>
        </div>
      </header>

      {/* Hero Header with Document Navigation Pills */}
      <div className="border-b border-line bg-page">
        <div className="wrap pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="t-eyebrow text-brand-600 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
            Legal &amp; Terms
          </div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.035em] font-semibold text-ink font-display">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            Last updated: 14 October 2026 &bull; Master Enterprise Telephony Terms &amp; Conditions
          </p>

          {/* Navigation Pills Bar */}
          <nav aria-label="Legal documents" className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('terms-and-conditions')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-ink text-white border-ink cursor-pointer"
            >
              Terms and Conditions
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('privacy-policy')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-paper text-ink-2 border-line hover:border-line-2 hover:text-ink cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('refund-policy')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-paper text-ink-2 border-line hover:border-line-2 hover:text-ink cursor-pointer"
            >
              Refund Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('shipping-and-delivery')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-paper text-ink-2 border-line hover:border-line-2 hover:text-ink cursor-pointer"
            >
              Shipping &amp; Delivery
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('contact')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-paper text-ink-2 border-line hover:border-line-2 hover:text-ink cursor-pointer"
            >
              Contact Us
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="wrap pt-10 sm:pt-12 pb-16 lg:pb-24 lg:grid lg:grid-cols-[220px_minmax(0,720px)] lg:gap-16 items-start">
        {/* Sticky Desktop Sidebar */}
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28 max-h-[80vh] overflow-y-auto scroll-none">
            <div className="t-eyebrow text-faint mb-4">On this page</div>
            <ol className="grid gap-1 border-l border-line text-[12.5px]">
              {sections.map(s => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex gap-2.5 -ml-px border-l border-transparent px-3 py-1 text-muted hover:text-ink hover:border-ink transition-colors"
                  >
                    <span className="font-mono text-faint">{s.num}</span>
                    <span className="truncate">{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Detailed Sections Column */}
        <div className="space-y-12">
          {/* Section 01 */}
          <section id="who-we-are" className="scroll-mt-28 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                01
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Who we are and what these terms cover
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Outpero is an autonomous AI telecalling software platform operated by <strong>OpenDG Private Limited</strong> (&ldquo;Outpero&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), based in Hyderabad, Telangana, India.
              </p>
              <p>
                These terms apply to our website, the web app at sarvam-eta-rose.vercel.app, our APIs and webhooks, and the autonomous calling service provided through them (collectively, the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these terms on behalf of yourself and the business you represent (&ldquo;you&rdquo;). If you do not agree, do not use the Service. Our Privacy Policy and Refund Policy form an integral part of these terms.
              </p>
            </div>
          </section>

          {/* Section 02 */}
          <section id="your-account" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                02
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Your account
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                The Service is designed exclusively for business and professional organizations. You must be at least 18 years old and legally competent to enter into binding commercial contracts.
              </p>
              <p>
                You agree to provide true, accurate, and current KYC and organizational credentials. We require verified documentation to provision virtual Indian business phone numbers under Department of Telecommunications (DoT) regulations. You are solely responsible for all actions conducted through your account and API credentials. Notify us immediately at <a href="mailto:support@outpero.com" className="text-brand-600 underline">support@outpero.com</a> if you suspect unauthorized access.
              </p>
            </div>
          </section>

          {/* Section 03 */}
          <section id="the-service" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                03
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                The Service
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                The Service empowers your business to deploy conversational AI voice employees that dial outbound leads within 30 seconds, execute bulk qualification campaigns, answer inbound customer inquiries, and perform automated actions (including Google Calendar bookings, WhatsApp confirmations, and CRM updates).
              </p>
              <p>
                We continuously improve and optimize the Service. If any platform modification materially restricts a paid capability, we will provide advance notice where reasonably practicable.
              </p>
            </div>
          </section>

          {/* Section 04 */}
          <section id="credits-and-billing" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                04
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Credits, prices and billing
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                The Service operates on a 100% transparent prepaid credit system:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">One credit equals one rupee (₹1).</strong></li>
                <li>Credits do not expire while your workspace account remains open.</li>
                <li>Connected calls are charged per connected minute (billed per second) according to your voice tier: Standard @ ₹5/min, Premium @ ₹6.8/min.</li>
                <li><strong className="text-ink">Unanswered, busy, or failed calls are never charged.</strong></li>
                <li>Dedicated virtual phone numbers and concurrent channels are charged monthly from your credit balance.</li>
                <li>All prices exclude 18% GST, which is added at checkout.</li>
              </ul>
              <p>
                Wallet top-ups are processed securely via Razorpay. Refunds are governed strictly by our <button type="button" onClick={() => onNavigate?.('refund-policy')} className="text-brand-600 underline font-medium cursor-pointer">Refund Policy</button>.
              </p>
            </div>
          </section>

          {/* Section 05 */}
          <section id="calling-responsibilities" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                05
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Your responsibilities when calling people in India
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                You determine who is dialed, what information is conveyed, and the purpose of the call. You are legally responsible for ensuring every call placed through your account complies with Indian law:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>You warrant that you possess a lawful basis and valid opt-in consent to call every uploaded telephone number.</li>
                <li>You strictly adhere to Telecom Regulatory Authority of India (TRAI) regulations, including the Telecom Commercial Communications Customer Preference Regulations (TCCCPR), enterprise DLT registration, and scrubbing against the National Do Not Call (NDNC / DND) registry.</li>
                <li>You must strictly observe statutory commercial calling hours (<strong>09:00 AM to 08:00 PM Indian Standard Time</strong>).</li>
                <li>Your voice employee must clearly disclose your business entity name and state that the call is recorded where applicable.</li>
                <li>You must immediately honor any verbal or automated opt-out request made by the callee.</li>
              </ul>
            </div>
          </section>

          {/* Section 06 */}
          <section id="acceptable-use" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                06
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Acceptable use
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>You must not use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>Harass, threaten, defraud, or impersonate government bodies, banks, or emergency authorities.</li>
                <li>Execute debt collection calls through intimidation or at prohibited hours in violation of Reserve Bank of India (RBI) guidelines.</li>
                <li>Promote illicit goods, pyramid schemes, or attempt to extract OTPs, passwords, or credit card PINs.</li>
                <li>Synthesize or clone the voice of a real individual without verifiable written consent.</li>
                <li>Place emergency 112/100/108 calls or use the service for safety-critical communication.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts immediately upon receiving carrier notices or detecting violations of this clause.
              </p>
            </div>
          </section>

          {/* Section 07 */}
          <section id="ai-conversations" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                07
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                AI-generated conversations
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Your employees communicate using artificial intelligence language and voice synthesis models. You are responsible for testing your agent&apos;s prompts and reviewing call transcripts. We do not guarantee specific business conversions, appointment numbers, or revenue outcomes.
              </p>
            </div>
          </section>

          {/* Section 08 */}
          <section id="carriers-and-third-parties" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                08
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Carriers and third-party services
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Calls transit over licensed Indian telecommunications carriers. We are not liable for transient network congestion or carrier-level outages, though we commit to restoring telephony routing promptly. Third-party integrations (WhatsApp Meta Cloud API, Google Calendar) are governed by their respective platform policies.
              </p>
            </div>
          </section>

          {/* Section 09 */}
          <section id="availability-and-support" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                09
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Availability and support
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We target <strong>99.9% uptime</strong> and sub-420ms response latencies. Support is available via <a href="mailto:support@outpero.com" className="text-brand-600 underline font-medium">support@outpero.com</a> during business hours (Monday to Saturday, 9:00 AM &ndash; 6:00 PM IST).
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="your-data" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                10
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Your data ownership
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                <strong>You retain 100% full ownership</strong> of your Customer Data, including contact lists, audio recordings, transcripts, and business catalogs. You grant us permission to process this data solely to execute the Service. Your data is never sold or used for public foundation model training.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="intellectual-property" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                11
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Intellectual property
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                The platform, codebase, proprietary voice synthesis pipeline, and Outpero trademarks belong exclusively to OpenDG Private Limited or its licensors. We grant you a revocable, non-exclusive license to utilize the Service during your subscription.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="confidentiality" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                12
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Confidentiality
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Both parties agree to treat non-public technical, commercial, and operational information as confidential, safeguarding it with reasonable professional care.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="liability" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                13
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Liability limitations
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                To the maximum extent permitted by Indian law, our total aggregate liability arising out of or related to the Service in any 12-month period is limited to the total fees paid by you in the <strong>three months preceding the claim</strong>. We are not liable for indirect, incidental, or consequential business damages.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section id="indemnity" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                14
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Indemnity
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                You agree to indemnify and hold harmless OpenDG Private Limited, its directors, and officers against third-party claims, legal fees, or regulatory penalties resulting from your telephone calls, Customer Data, or breach of applicable Indian laws.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="termination" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                15
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Ending the agreement
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                You may close your account at any time from your settings or by emailing <a href="mailto:support@outpero.com" className="text-brand-600 underline">support@outpero.com</a>. We may suspend or terminate service immediately for severe terms breach, fraud, non-payment, or carrier mandates.
              </p>
            </div>
          </section>

          {/* Section 16 */}
          <section id="changes" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                16
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Changes to terms
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We may revise these terms with 15 days&apos; advance notice for material amendments. Continued use of the platform after effective dates constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Section 17 */}
          <section id="governing-law" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                07
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Governing law and disputes
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                These terms are governed exclusively by the laws of India. Both parties agree to undertake 30 days of good-faith amicable negotiation before commencing litigation. The courts at <strong>Hyderabad, Telangana</strong> have exclusive territorial jurisdiction over any disputes.
              </p>
            </div>
          </section>

          {/* Section 18 */}
          <section id="contact" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                18
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Contact &amp; legal entity
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-1.5 text-[14px]">
                <div className="font-semibold text-ink">OpenDG Private Limited</div>
                <div className="text-muted">Operating Address: Hyderabad, Telangana, India</div>
                <div className="text-muted">Support Email: <a href="mailto:support@outpero.com" className="text-brand-600 font-medium underline">support@outpero.com</a></div>
                <div className="text-muted">Customer Support Helpline: +91 99636 93366</div>
              </div>
            </div>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-canvas border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-ink text-[16px]">Questions regarding our commercial terms?</div>
              <div className="text-[14px] text-muted mt-0.5">Reach out to our legal and enterprise contracts team.</div>
            </div>
            <a
              href="mailto:support@outpero.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-medium text-[13.5px] hover:bg-ink-2 transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Legal Team</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
