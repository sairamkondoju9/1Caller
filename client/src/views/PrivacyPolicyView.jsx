import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export default function PrivacyPolicyView({ onBack, onNavigate }) {
  const sections = [
    { id: 'who-we-are', num: '01', title: 'Who we are and what this covers' },
    { id: 'what-we-collect', num: '02', title: 'What we collect' },
    { id: 'how-we-use-it', num: '03', title: 'How we use it' },
    { id: 'who-we-share-it-with', num: '04', title: 'Who we share it with' },
    { id: 'where-data-is-processed', num: '05', title: 'Where data is processed' },
    { id: 'how-long-we-keep-it', num: '06', title: 'How long we keep it' },
    { id: 'how-we-protect-it', num: '07', title: 'How we protect it' },
    { id: 'your-rights', num: '08', title: 'Your rights under DPDP Act' },
    { id: 'cookies', num: '09', title: 'Cookies' },
    { id: 'children', num: '10', title: 'Children' },
    { id: 'grievance-officer', num: '11', title: 'Grievance Officer' },
    { id: 'changes-to-policy', num: '12', title: 'Changes to this policy' }
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
            <span className="text-[12px] font-mono text-muted">DPDP Act (India) Compliant</span>
          </div>
        </div>
      </header>

      {/* Hero Header with Document Navigation Pills */}
      <div className="border-b border-line bg-page">
        <div className="wrap pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="t-eyebrow text-brand-600 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
            Legal &amp; Privacy
          </div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.035em] font-semibold text-ink font-display">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            Last updated: 14 October 2026 &bull; Compliant with Digital Personal Data Protection Act, 2023 &amp; IT Act, 2000
          </p>

          {/* Navigation Pills Bar */}
          <nav aria-label="Legal documents" className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('terms-and-conditions')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-paper text-ink-2 border-line hover:border-line-2 hover:text-ink cursor-pointer"
            >
              Terms and Conditions
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('privacy-policy')}
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-ink text-white border-ink cursor-pointer"
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
          <nav aria-label="On this page" className="sticky top-28">
            <div className="t-eyebrow text-faint mb-4">On this page</div>
            <ol className="grid gap-1 border-l border-line text-[13px]">
              {sections.map(s => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex gap-2.5 -ml-px border-l border-transparent px-3 py-1.5 text-muted hover:text-ink hover:border-ink transition-colors"
                  >
                    <span className="font-mono text-faint">{s.num}</span>
                    <span>{s.title}</span>
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
                Who we are and what this covers
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Outpero is an autonomous AI telecalling software platform operated by <strong>OpenDG Private Limited</strong>, Hyderabad, Telangana, India (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains how we handle personal data under India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000.
              </p>
              <p>We handle personal data in two distinct legal capacities:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong className="text-ink">As a Data Fiduciary:</strong> For visitors who browse our website, create an account, or contact our team. We determine the purpose and means of processing that data.
                </li>
                <li>
                  <strong className="text-ink">As a Data Processor:</strong> For our business customers&apos; call data &mdash; including contacts a business uploads or connects, telephony recordings, automated transcripts, and call summaries. The customer decides who is called and why, and is legally responsible for having a lawful basis and giving requisite notice. We process that data strictly on the customer&apos;s written instructions.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 02 */}
          <section id="what-we-collect" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                02
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                What we collect
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p><strong className="text-ink">From visitors and account holders:</strong></p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>Contact details: Full name, work email address, phone number, business organization name, and operational role.</li>
                <li>Regulatory verification details: KYC documents and business registrations needed to provision virtual Indian telephony numbers.</li>
                <li>Billing records: Invoicing records, credit purchase ledgers, and transaction references. Card, netbanking, and UPI details are processed directly by our PCI-DSS Level 1 certified payment aggregator (Razorpay) and are never stored on our servers.</li>
                <li>Customer support messages: Inquiries sent through our contact forms or support email.</li>
                <li>Telemetry data: IP address, browser type, operating system, network latency diagnostics, and session performance.</li>
              </ul>
              <p className="pt-2"><strong className="text-ink">On behalf of our customers (Call Data):</strong></p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>Uploaded lead contacts: Names, phone numbers, and custom qualification parameters.</li>
                <li>Call audio and transcripts: Real-time telephone audio recordings, speech-to-text transcripts, and conversation summaries.</li>
                <li>Telephony metadata: Call timestamp, duration, connection status, caller ID, and disposition tags.</li>
                <li>Connected integrations: Data exchanged with your connected Google Calendar, Google Sheets, CRMs, or webhooks.</li>
              </ul>
            </div>
          </section>

          {/* Section 03 */}
          <section id="how-we-use-it" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                03
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                How we use it
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>We process personal data solely for legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>To provide the Service: Place and answer autonomous calls, execute campaign workflows, and display real-time analytics on your dashboard.</li>
                <li>To authenticate accounts, issue virtual business numbers, and prevent fraudulent telephony usage.</li>
                <li>To meter credit consumption, bill your account, and maintain statutory financial and tax records.</li>
                <li>To dispatch critical service notifications, low-balance warnings, and updates to our terms.</li>
                <li>To monitor uptime, measure sub-420ms response latencies, and enhance conversational telephony stability.</li>
              </ul>
              <div className="p-4 rounded-2xl bg-canvas border border-line text-[14px]">
                <strong className="text-ink">Zero Public LLM Training:</strong> Your uploaded customer lists, call audio recordings, proprietary scripts, and business data are never sold and are never used to train external public foundation models.
              </div>
            </div>
          </section>

          {/* Section 04 */}
          <section id="who-we-share-it-with" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                04
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Who we share it with
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We do not sell personal data. We share data strictly with vetted third-party service providers acting as our processors under binding data processing agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">Cloud Hosting &amp; Storage:</strong> Secure cloud data centers located in India (Mumbai and Hyderabad regions).</li>
                <li><strong className="text-ink">Licensed Telecom Carriers:</strong> Tier-1 Indian telecom operators for routing telephone calls over the Public Switched Telephone Network (PSTN).</li>
                <li><strong className="text-ink">Speech &amp; AI Engines:</strong> Low-latency voice synthesis and speech-to-text models (including Sarvam Bulbul and Cartesia Sonic).</li>
                <li><strong className="text-ink">Payment Processors:</strong> Razorpay for secure PCI-DSS compliant credit card, netbanking, and UPI payment settlement.</li>
                <li><strong className="text-ink">Customer Integrations:</strong> Third-party tools you explicitly connect (such as Google Calendar, Sheets, or custom webhooks).</li>
              </ul>
            </div>
          </section>

          {/* Section 05 */}
          <section id="where-data-is-processed" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                05
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Where data is processed
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We are headquartered in India. Our primary databases, telephony switches, and media storage are located within India. Any cross-border data transfer required for global AI inference is performed strictly in compliance with Section 16 of the Digital Personal Data Protection Act, 2023, subject to robust contractual security safeguards.
              </p>
            </div>
          </section>

          {/* Section 06 */}
          <section id="how-long-we-keep-it" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                06
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                How long we keep it
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">Account Data:</strong> Retained for the duration your account is active, then deleted or anonymized within 90 days of account termination, except where statutory Indian tax or corporate law mandates longer retention.</li>
                <li><strong className="text-ink">Call Data:</strong> Call audio recordings and transcripts are retained for 90 days by default (or the custom retention window configured by the customer), after which they are permanently expunged.</li>
                <li><strong className="text-ink">Financial Records:</strong> Transaction records, GST invoices, and payment references are retained as required by Indian taxation statutes.</li>
              </ul>
            </div>
          </section>

          {/* Section 07 */}
          <section id="how-we-protect-it" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                07
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                How we protect it
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We implement industry-standard technical and operational safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>All network communications and audio streams are encrypted in transit via TLS 1.3.</li>
                <li>All persistent databases and call recording archives are encrypted at rest with AES-256.</li>
                <li>Access to production databases is strictly restricted through role-based access controls and hardware MFA.</li>
                <li>In the event of a personal data breach, we will notify the Data Protection Board of India and affected data principals in compliance with DPDP Act mandates.</li>
              </ul>
            </div>
          </section>

          {/* Section 08 */}
          <section id="your-rights" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                08
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Your rights under the DPDP Act
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Under India&apos;s Digital Personal Data Protection Act, 2023, data principals have the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">Right to Access:</strong> Request a summary of your personal data processed by us and the identities of third parties with whom it was shared.</li>
                <li><strong className="text-ink">Right to Correction &amp; Erasure:</strong> Request the correction, completion, or deletion of your personal data.</li>
                <li><strong className="text-ink">Right to Withdraw Consent:</strong> Withdraw previously granted consent as effortlessly as it was provided.</li>
                <li><strong className="text-ink">Right of Grievance Redressal:</strong> Submit a complaint regarding the handling of your data to our Grievance Officer.</li>
                <li><strong className="text-ink">Right to Nominate:</strong> Nominate an individual to exercise these rights in the event of death or incapacity.</li>
              </ul>
            </div>
          </section>

          {/* Section 09 */}
          <section id="cookies" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                09
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Cookies
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We use strictly essential cookies to maintain user authentication and security, and minimal privacy-preserving analytics cookies to assess site performance. We do not use third-party cross-site advertising cookies.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="children" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                10
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Children
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                The Service is exclusively designed for business use and is not directed at individuals under 18 years of age. Customers are prohibited from uploading contact lists targeting minors without verifiable parental consent.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="grievance-officer" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                11
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Grievance Officer
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                In compliance with the DPDP Act, 2023 and the Information Technology Rules, 2021, our designated Grievance Officer is:
              </p>
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-1.5 text-[14px]">
                <div className="font-semibold text-ink">Grievance &amp; Data Protection Officer</div>
                <div className="text-muted">Entity: <strong>OpenDG Private Limited</strong></div>
                <div className="text-muted">Email: <a href="mailto:support@outpero.com" className="text-brand-600 font-medium underline">support@outpero.com</a></div>
                <div className="text-muted">Operating Address: Hyderabad, Telangana 500081, India</div>
                <p className="text-xs text-faint pt-1">
                  We acknowledge all data grievance requests within 24 hours and provide resolution within the statutory timeframe mandated by the DPDP Act.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section id="changes-to-policy" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                12
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Changes to this policy
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                We may modify this policy periodically to reflect evolving regulatory requirements. The revised version will be published here with an updated date, and account holders will be notified of material changes via email or dashboard announcements.
              </p>
            </div>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-canvas border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-ink text-[16px]">Questions regarding your personal data?</div>
              <div className="text-[14px] text-muted mt-0.5">Reach out to our Data Protection and Grievance Office.</div>
            </div>
            <a
              href="mailto:support@outpero.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-medium text-[13.5px] hover:bg-ink-2 transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Grievance Officer</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
