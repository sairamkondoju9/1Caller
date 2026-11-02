import React from 'react';
import { ArrowLeft, Clock, Zap, CheckCircle2, ShieldAlert, Mail } from 'lucide-react';

export default function ShippingPolicyView({ onBack, onNavigate }) {
  const sections = [
    { id: 'nature-of-services', num: '01', title: 'Nature of services' },
    { id: 'delivery-method', num: '02', title: 'Digital delivery method' },
    { id: 'delivery-timelines', num: '03', title: 'Delivery timelines' },
    { id: 'delivery-confirmation', num: '04', title: 'Confirmation of delivery' },
    { id: 'delivery-support', num: '05', title: 'Delivery support & helpdesk' }
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
            <span className="text-[12px] font-mono text-muted">Razorpay Verified Merchant Policy</span>
          </div>
        </div>
      </header>

      {/* Hero Header with Document Navigation Pills */}
      <div className="border-b border-line bg-page">
        <div className="wrap pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="t-eyebrow text-brand-600 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
            Legal &amp; Fulfillment
          </div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.035em] font-semibold text-ink font-display">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            Last updated: 14 October 2026 &bull; Digital Service Fulfillment Guidelines for Indian Payment Gateways
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
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-ink text-white border-ink cursor-pointer"
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
          <section id="nature-of-services" className="scroll-mt-28 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                01
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Nature of services
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Outpero is a Software-as-a-Service (SaaS) and autonomous AI telecalling platform operated by <strong>OpenDG Private Limited</strong>, based in Hyderabad, Telangana, India.
              </p>
              <p>
                We provide digital cloud software, autonomous conversational telecalling employees, API integrations, and prepaid telephony talk-time credits. <strong>Because all services and products provided on this platform are 100% digital, no physical goods, physical items, or tangible shipments are dispatched or delivered.</strong>
              </p>
            </div>
          </section>

          {/* Section 02 */}
          <section id="delivery-method" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                02
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Digital delivery method
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                All purchases, wallet top-ups, and subscriptions made through our payment gateway (Razorpay) are fulfilled electronically. Delivery of our services and credit allocation is made directly to your authenticated user account dashboard at <a href="https://sarvam-eta-rose.vercel.app" className="text-brand-600 underline">sarvam-eta-rose.vercel.app</a>.
              </p>
              <p>
                Upon authorization by your issuing bank, UPI application, or card network, the purchased credits or features are provisioned directly to your organization&apos;s workspace without requiring manual intervention.
              </p>
            </div>
          </section>

          {/* Section 03 */}
          <section id="delivery-timelines" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                03
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Delivery timelines
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-canvas border border-line space-y-2">
                  <div className="flex items-center gap-2 text-ink font-semibold text-[14.5px]">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Prepaid Calling Credits</span>
                  </div>
                  <p className="text-[13.5px] text-muted leading-relaxed">
                    <strong>Instant fulfillment (0 to 15 minutes):</strong> Credits are added to your workspace balance immediately upon payment gateway authorization.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-canvas border border-line space-y-2">
                  <div className="flex items-center gap-2 text-ink font-semibold text-[14.5px]">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Virtual Business Numbers (+91)</span>
                  </div>
                  <p className="text-[13.5px] text-muted leading-relaxed">
                    <strong>1 to 24 business hours:</strong> Dedicated Indian virtual phone numbers require regulatory Know-Your-Customer (KYC) verification under Department of Telecommunications (DoT) mandates before telecom carrier routing is activated.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04 */}
          <section id="delivery-confirmation" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                04
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Confirmation of delivery
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                In compliance with Razorpay Merchant Guidelines, electronic confirmation of service delivery is provided through two automated channels:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">Registered Email Receipt:</strong> A digital tax invoice and payment acknowledgement containing your Razorpay Payment ID, top-up amount, and updated credit balance is dispatched instantly to your registered account email.</li>
                <li><strong className="text-ink">In-App Dashboard Notification:</strong> An immediate real-time balance update and transaction log entry appears on your workspace billing ledger.</li>
              </ul>
            </div>
          </section>

          {/* Section 05 */}
          <section id="delivery-support" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                05
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Delivery support &amp; helpdesk
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                If your payment was completed successfully but your credits do not appear in your account balance within <strong>15 minutes</strong>, please contact our delivery helpdesk immediately:
              </p>
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-2 text-[14px]">
                <div className="font-semibold text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Service Fulfillment Helpdesk:
                </div>
                <div className="text-muted leading-relaxed">
                  Email: <a href="mailto:support@outpero.com" className="text-brand-600 font-medium underline">support@outpero.com</a> &bull; Phone: <span className="text-ink font-medium">+91 99636 93366</span>
                </div>
                <div className="text-xs text-faint">
                  Operating Address: OpenDG Private Limited, Hyderabad, Telangana, India. Business hours: Monday to Saturday, 9:00 AM &ndash; 6:00 PM IST.
                </div>
              </div>
            </div>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-canvas border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-ink text-[16px]">Need assistance with service provisioning?</div>
              <div className="text-[14px] text-muted mt-0.5">Reach out to our customer operations team for immediate assistance.</div>
            </div>
            <a
              href="mailto:support@outpero.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-medium text-[13.5px] hover:bg-ink-2 transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Delivery Helpdesk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
