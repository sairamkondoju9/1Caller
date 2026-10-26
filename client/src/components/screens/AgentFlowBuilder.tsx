import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sliders,
  Sparkles,
  Layers,
  Globe2,
  Cpu,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Database,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToolBinding {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  latencyBudgetMs: number;
  enabled: boolean;
}

interface StepNode {
  id: string;
  name: string;
  intent: string;
  prompt: string;
  targetLanguage: string;
  ttsEngine: 'cartesia' | 'sarvam';
}

export const AgentFlowBuilder: React.FC = () => {
  const [agentName, setAgentName] = useState('Priya - Real Estate Executive');
  const [industry, setIndustry] = useState('Real Estate');
  const [primaryLang, setPrimaryLang] = useState('te');
  const [openingGreeting, setOpeningGreeting] = useState(
    'నమస్కారం {{customer_name}} గారు! సాయి మెడోస్ నుంచి మాట్లాడుతున్నాను. మీరు వెబ్సైట్లో చూసిన ఈస్ట్ ఫేసింగ్ 3 BHK ఫ్లాట్స్ వివరాలు చెప్పమంటారా?'
  );

  const [steps, setSteps] = useState<StepNode[]>([
    {
      id: 'step-1',
      name: '1. Identification & Consent',
      intent: 'verify_identity_and_consent',
      prompt: 'Confirm caller name and obtain affirmative consent for property consultation as required by DPDP 2023.',
      targetLanguage: 'te-IN',
      ttsEngine: 'sarvam'
    },
    {
      id: 'step-2',
      name: '2. Budget & Configuration Discovery',
      intent: 'discover_budget_and_config',
      prompt: 'Check whether caller prefers 2 BHK (48L-58L) or 3 BHK (68L-88L) and requested facing (East / West).',
      targetLanguage: 'te-IN',
      ttsEngine: 'sarvam'
    },
    {
      id: 'step-3',
      name: '3. Site Visit Scheduling',
      intent: 'schedule_site_visit',
      prompt: 'Propose Saturday 11:00 AM or Sunday 3:00 PM for executive walkthrough at Narsingi site.',
      targetLanguage: 'te-IN',
      ttsEngine: 'sarvam'
    }
  ]);

  const [tools, setTools] = useState<ToolBinding[]>([
    {
      id: 'tool-crm',
      name: 'CRM Customer Lookup',
      description: 'Fetches caller profile, past inquiries & WhatsApp verification status',
      endpoint: '/v1/tools/crm/lookup',
      latencyBudgetMs: 18,
      enabled: true
    },
    {
      id: 'tool-calendar',
      name: 'Google / Outlook Calendar Booking',
      description: 'Reserves site visit appointment slot and sends invite SMS',
      endpoint: '/v1/tools/calendar/book-slot',
      latencyBudgetMs: 25,
      enabled: true
    },
    {
      id: 'tool-sms-brochure',
      name: 'WhatsApp Floor Plan Dispatch',
      description: 'Sends instant East/West facing PDF brochure to caller WhatsApp',
      endpoint: '/v1/tools/whatsapp/send-brochure',
      latencyBudgetMs: 30,
      enabled: true
    },
    {
      id: 'tool-payment',
      name: 'Razorpay UPI Token Advance',
      description: 'Generates ₹10,000 priority booking token link via SMS',
      endpoint: '/v1/tools/payments/razorpay-link',
      latencyBudgetMs: 22,
      enabled: false
    }
  ]);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const toggleTool = (id: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const addStep = () => {
    const newIdx = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        name: `${newIdx}. Follow-up Action`,
        intent: 'qualify_next_intent',
        prompt: 'State the resolution and thank the caller warmly.',
        targetLanguage: primaryLang === 'en' ? 'en' : `${primaryLang}-IN`,
        ttsEngine: primaryLang === 'en' ? 'cartesia' : 'sarvam'
      }
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    setSaveStatus('Saving agent flow...');
    setTimeout(() => {
      setSaveStatus('Saved & Deployed to Media Edge Mumbai');
      setTimeout(() => setSaveStatus(null), 2500);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-[1160px] mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e4ed]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold text-[#0f0e17] tracking-[-0.02em] font-display">
              Voice Agent Workspace &amp; Flow Builder
            </h1>
            <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed]">
              State Canvas
            </span>
          </div>
          <p className="text-[15px] text-[#6c6b7e] mt-0.5">
            Configure prompt states, dynamic tool-calling bindings, and Cartesia vs Sarvam engine routing.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f0e17] hover:bg-[#1f1e28] text-white rounded-xl text-[13px] font-semibold transition-all min-h-[44px] shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#cbd0df]" />
          Deploy Agent to EKS Edge
        </button>
      </div>

      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-xl text-[13px] font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          <span>{saveStatus}</span>
        </motion.div>
      )}

      {/* Main Grid: Parameters + Conversation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Agent Identity & Engine Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
            <h2 className="text-[17px] font-semibold text-[#0f0e17]">
              Agent Identity &amp; Engine
            </h2>

            <div>
              <label className="block text-[13px] font-medium text-[#0f0e17] mb-1.5">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="apple-glass-input w-full px-3.5 py-2 rounded-xl text-[15px] text-[#0f0e17] min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#0f0e17] mb-1.5">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="apple-glass-input w-full px-3 py-2 rounded-xl text-[13px] text-[#0f0e17] min-h-[44px]"
                >
                  <option value="Real Estate">Real Estate</option>
                  <option value="BFSI Collections">BFSI Collections</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="EdTech">EdTech</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0f0e17] mb-1.5">
                  Primary Language
                </label>
                <select
                  value={primaryLang}
                  onChange={(e) => setPrimaryLang(e.target.value)}
                  className="apple-glass-input w-full px-3 py-2 rounded-xl text-[13px] text-[#0f0e17] min-h-[44px]"
                >
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="en">English (Cartesia)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0f0e17] mb-1.5">
                Opening Greeting (First Audio Turn)
              </label>
              <textarea
                rows={3}
                value={openingGreeting}
                onChange={(e) => setOpeningGreeting(e.target.value)}
                className="apple-glass-input w-full p-3 rounded-xl text-[13px] text-[#0f0e17] leading-relaxed resize-none"
              />
              <span className="text-[11px] text-[#6c6b7e] mt-1 block font-mono">
                Variables: &#123;&#123;customer_name&#125;&#125;, &#123;&#123;project_name&#125;&#125;, &#123;&#123;due_date&#125;&#125;
              </span>
            </div>

            {/* Engine Routing Strategy */}
            <div className="p-3.5 rounded-xl bg-[#f8f9fc] border border-[#e2e4ed] space-y-2">
              <div className="text-[13px] font-semibold text-[#0f0e17]">
                Engine Routing Strategy
              </div>
              <div className="text-[12px] text-[#3a3f5c] leading-relaxed">
                {primaryLang === 'en'
                  ? 'Fast Path: Cartesia Sonic-2 (80ms TTFB WebSocket stream). Ideal for English & Hinglish conversational code-mixing.'
                  : 'Indic Core: Sarvam Bulbul V4 Flash (95ms TTFB). Authentic regional prosody & pronunciation.'}
              </div>
            </div>
          </div>

          {/* Tool-Calling Bindings */}
          <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#0f0e17]">
                Real-Time Tool Bindings
              </h2>
              <span className="text-[11px] font-mono text-[#6c6b7e]">Sub-30ms budget</span>
            </div>

            <div className="space-y-2.5">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between min-h-[44px]',
                    tool.enabled
                      ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                      : 'bg-white/60 border-[#e2e4ed] opacity-60'
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="text-[13px] font-semibold text-[#0f0e17] flex items-center gap-1.5">
                      {tool.name}
                      {tool.enabled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#3a3f5c]">{tool.description}</div>
                  </div>
                  <span className="text-[11px] font-mono text-[#6c6b7e] shrink-0 ml-2">
                    {tool.latencyBudgetMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): State Canvas & Transition Sequence */}
        <div className="lg:col-span-7 apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e4ed]">
            <div>
              <div className="text-[17px] font-semibold text-[#0f0e17]">
                Conversation State Machine
              </div>
              <div className="text-[13px] text-[#6c6b7e]">
                Sequential state transitions executed inside the 6ms orchestrator budget
              </div>
            </div>

            <button
              onClick={addStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f1f6] hover:bg-[#e2e4ed] text-[#0f0e17] border border-[#e2e4ed] rounded-xl text-[13px] font-semibold transition-all min-h-[36px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add State Step
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-white/70 border border-[#e2e4ed] hover:border-[#e2e4ed] transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#0f0e17]">
                      {s.name}
                    </span>
                    <span className="text-[10px] font-mono bg-[#f8f9fc] px-2 py-0.5 rounded border border-[#e2e4ed] text-[#6c6b7e]">
                      intent: {s.intent}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#0f0e17] bg-[#f6f7fb] border border-[#e2e4ed] px-2 py-0.5 rounded">
                      {s.ttsEngine === 'cartesia' ? 'Sonic-2' : 'Bulbul V4'}
                    </span>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(s.id)}
                        className="text-[#6c6b7e] hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={s.prompt}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setSteps((prev) =>
                      prev.map((item) => (item.id === s.id ? { ...item, prompt: newText } : item))
                    );
                  }}
                  className="apple-glass-input w-full p-2.5 rounded-lg text-[13px] text-[#0f0e17] leading-relaxed resize-none"
                />
              </div>
            ))}
          </div>

          <div className="p-4 bg-white/70 rounded-xl border border-[#e2e4ed] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 text-[#0f0e17]">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              <span>Orchestrator per-turn execution budget verified: <strong>5.2 ms / 6.0 ms</strong></span>
            </div>
            <span className="text-[11px] font-mono text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0] font-bold">
              SLO PASS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
