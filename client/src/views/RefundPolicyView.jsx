import React from 'react';
import { ArrowLeft, ShieldCheck, Mail, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function RefundPolicyView({ onBack, onNavigate }) {
  const sections = [
    { id: 'how-billing-works', num: '01', title: 'How billing works' },
    { id: 'unused-credits', num: '02', title: 'Unused credits' },
    { id: 'numbers-and-channels', num: '03', title: 'Business numbers & channels' },
    { id: 'failed-payments', num: '04', title: 'Failed payments & billing errors' },
    { id: 'how-to-ask-for-refund', num: '05', title: 'How to ask for a refund' }
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
            Legal &amp; Compliance
          </div>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.035em] font-semibold text-ink font-display">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            Last updated: 14 October 2026 &bull; Compliant with RBI Master Directions &amp; Payment Aggregator Guidelines
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
              className="inline-flex items-center h-9 sm:h-8 px-3.5 rounded-full border text-[13px] font-medium transition-colors bg-ink text-white border-ink cursor-pointer"
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
          <section id="how-billing-works" className="scroll-mt-28 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                01
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                How billing works
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Outpero is a prepaid AI telecalling platform operated by <strong>OpenDG Private Limited</strong>. You buy credits (where <strong>one credit equals one rupee &mdash; ₹1</strong>), and calls consume credits per connected minute at your chosen employee&apos;s voice tier rate.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li><strong className="text-ink">Standard Indian Voices:</strong> ₹5.00 / minute (billed per second).</li>
                <li><strong className="text-ink">Premium Lifelike Voices:</strong> ₹6.80 / minute (billed per second).</li>
                <li><strong className="text-ink">Zero Charges for Unconnected Calls:</strong> Unanswered, busy, invalid, or failed calls are never charged.</li>
              </ul>
              <p>
                A dedicated business phone number (including one concurrent channel) and any additional concurrent channels are charged monthly from your credit balance. All prices exclude Goods and Services Tax (GST), which is added at the applicable rate (currently 18%). Full pricing details are published on our pricing page and in our Terms and Conditions.
              </p>
            </div>
          </section>

          {/* Section 02 */}
          <section id="unused-credits" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                02
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Unused credits
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Purchased credits do not expire while your account remains active, so you never need to rush to use them.
              </p>
              <p>
                If you choose to permanently close your account, you can request a refund of the unused credits you paid for, provided your request is submitted within <strong>180 days of your most recent wallet top-up</strong>. We will refund the rupee value of those unconsumed paid credits, minus any non-recoverable payment-gateway processing charges incurred from Razorpay or acquiring banks.
              </p>
              <div className="p-4 rounded-2xl bg-canvas border border-line space-y-2 text-[14px]">
                <div className="font-semibold text-ink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Non-refundable exclusions:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-muted">
                  <li>Free or promotional credits (e.g. signup bonus credits) are non-refundable and have no cash redemption value.</li>
                  <li>Credits already consumed for connected calls, active phone numbers, or provisioned channels cannot be refunded.</li>
                  <li>Credits on accounts suspended or terminated for material breach of our terms, fraud, or TRAI spam violations are non-refundable.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 03 */}
          <section id="numbers-and-channels" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                03
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Business numbers and channels
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                Monthly rental charges for dedicated Indian business phone numbers (+91 virtual numbers) or extra concurrent calling channels are paid in advance and are non-refundable for the current billing month once provisioned.
              </p>
              <p>
                You can release a phone number or cancel additional channels at any time from your dashboard settings, and your account will not be charged for them starting from the subsequent billing cycle.
              </p>
            </div>
          </section>

          {/* Section 04 */}
          <section id="failed-payments" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                04
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                Failed payments and billing errors
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                If a transaction fails at the payment gateway but funds are debited from your bank account, card, or UPI wallet, or if you were charged multiple times due to a gateway timeout, the duplicate or failed charge will be refunded in full automatically.
              </p>
              <p>
                If you believe an incorrect deduction was made for a call (for instance, due to a carrier dropped-line anomaly or platform error), please notify our team within <strong>30 days of the call timestamp</strong>. We will audit the telephony log and credit the disputed amount back to your workspace balance immediately.
              </p>
            </div>
          </section>

          {/* Section 05 */}
          <section id="how-to-ask-for-refund" className="scroll-mt-28 space-y-3.5 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                05
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink font-display tracking-tight">
                How to ask for a refund
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-ink-2 space-y-3">
              <p>
                To initiate a refund request, send an email to <a href="mailto:support@outpero.com" className="text-brand-600 underline font-medium">support@outpero.com</a> from your registered workspace account email with the following details:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted">
                <li>Your registered Outpero account name and email address.</li>
                <li>The Razorpay Payment ID or Transaction Reference Number from your top-up receipt.</li>
                <li>The reason for your refund request.</li>
              </ul>
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-2 mt-4 text-[14px]">
                <div className="font-semibold text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Processing Turnaround &amp; Payout:
                </div>
                <p className="text-muted leading-relaxed">
                  We acknowledge and audit all requests within <strong>3 business days</strong>. Approved refunds are credited directly back to the original source payment method (bank account, UPI, credit/debit card) within <strong>5 to 7 business days</strong>, in accordance with standard banking and Razorpay settlement protocols. GST adjustments are handled in accordance with the Central Goods and Services Tax Act.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-2xl bg-canvas border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-ink text-[16px]">Have questions regarding your balance?</div>
              <div className="text-[14px] text-muted mt-0.5">Our finance and billing support team is available Monday to Saturday.</div>
            </div>
            <a
              href="mailto:support@outpero.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-medium text-[13.5px] hover:bg-ink-2 transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Email Billing Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
