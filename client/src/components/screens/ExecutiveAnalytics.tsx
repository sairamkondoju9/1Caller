import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  Globe2,
  DollarSign,
  Cpu,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ExecutiveAnalytics: React.FC = () => {
  const languageMetrics = [
    { lang: 'Telugu (తెలుగు)', calls: 14200, successPct: 94.2, p50Ms: 408, werPct: 6.8, engine: 'Bulbul V4 + Saaras v3' },
    { lang: 'Hindi (हिंदी)', calls: 12480, successPct: 93.8, p50Ms: 412, werPct: 7.1, engine: 'Bulbul V4 + Saaras v3' },
    { lang: 'English / Hinglish', calls: 8940, successPct: 96.1, p50Ms: 395, werPct: 5.4, engine: 'Cartesia Sonic-2' },
    { lang: 'Tamil (தமிழ்)', calls: 3290, successPct: 91.5, p50Ms: 422, werPct: 7.9, engine: 'Bulbul V4 Flash' }
  ];

  return (
    <div className="space-y-6 max-w-[1160px] mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e4ed]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold text-[#0f0e17] tracking-[-0.02em] font-display">
              Executive Analytics Board
            </h1>
            <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
              Media Edge Mumbai
            </span>
          </div>
          <p className="text-[15px] text-[#6c6b7e] mt-0.5">
            Minimalist metrics grid tracking latency distributions, multilingual intent qualification, and gross margin economics.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[13px] text-[#6c6b7e]">
          <span>Window: <strong>Last 24 Hours</strong></span>
        </div>
      </div>

      {/* Top 4 KPI Minimal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-1">
          <div className="text-[12px] text-[#6c6b7e] font-mono uppercase tracking-wider">
            p50 Voice Turnaround
          </div>
          <div className="text-[34px] font-semibold text-[#16a34a] font-mono tracking-tight">
            413 ms
          </div>
          <div className="text-[12px] text-[#3a3f5c]">
            Physical floor: 370 ms (&le; 420 ms SLO)
          </div>
        </div>

        <div className="p-5 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-1">
          <div className="text-[12px] text-[#6c6b7e] font-mono uppercase tracking-wider">
            p95 Tail Latency
          </div>
          <div className="text-[34px] font-semibold text-[#0f0e17] font-mono tracking-tight">
            830 ms
          </div>
          <div className="text-[12px] text-[#16a34a] font-medium">
            Hard Target: &le; 850 ms (0 violations)
          </div>
        </div>

        <div className="p-5 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-1">
          <div className="text-[12px] text-[#6c6b7e] font-mono uppercase tracking-wider">
            Gross Margin
          </div>
          <div className="text-[34px] font-semibold text-[#0f0e17] font-mono tracking-tight">
            71.4%
          </div>
          <div className="text-[12px] text-[#3a3f5c]">
            Unit cost: &#8377;1.43 / min blended
          </div>
        </div>

        <div className="p-5 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-1">
          <div className="text-[12px] text-[#6c6b7e] font-mono uppercase tracking-wider">
            Live CCU Headroom
          </div>
          <div className="text-[34px] font-semibold text-[#0f0e17] font-mono tracking-tight">
            1,420
          </div>
          <div className="text-[12px] text-[#3a3f5c]">
            Design capacity: 500,000 CCU
          </div>
        </div>
      </div>

      {/* Multilingual Intent Success Matrix */}
      <div className="apple-glass rounded-2xl border border-[#e2e4ed] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e2e4ed] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#0f0e17]">
              Multilingual Intent Performance
            </h2>
            <p className="text-[13px] text-[#6c6b7e]">
              Language distribution, speech word error rate (WER), and p50 latency
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-full border border-[#bbf7d0]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Accent Drift Verified
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f9fc] text-[#6c6b7e] font-mono uppercase text-[11px] border-b border-[#e2e4ed]">
              <tr>
                <th className="py-3 px-5">Language / Region</th>
                <th className="py-3 px-5">Total 2-Way Turns</th>
                <th className="py-3 px-5">Intent Success Rate</th>
                <th className="py-3 px-5">p50 Latency</th>
                <th className="py-3 px-5">ASR WER</th>
                <th className="py-3 px-5">Voice Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e4ed]">
              {languageMetrics.map((row) => (
                <tr key={row.lang} className="hover:bg-white/50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#0f0e17]">
                    {row.lang}
                  </td>
                  <td className="py-4 px-5 font-mono text-[#0f0e17]">
                    {row.calls.toLocaleString()}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#16a34a]">
                        {row.successPct}%
                      </span>
                      <div className="w-20 bg-[#e2e4ed] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#16a34a] h-full rounded-full"
                          style={{ width: `${row.successPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-[#0f0e17]">
                    {row.p50Ms} ms
                  </td>
                  <td className="py-4 px-5 font-mono text-[#3a3f5c]">
                    {row.werPct}% (&lt;9% clean)
                  </td>
                  <td className="py-4 px-5 text-[11px] font-mono text-[#0f0e17] bg-transparent">
                    {row.engine}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit Economics & Gross Margin Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-3">
          <h3 className="text-[17px] font-semibold text-[#0f0e17]">
            Unit Cost Breakdown (Per Minute)
          </h3>
          <p className="text-[13px] text-[#6c6b7e]">
            Blended unit economics for telecom, ASR, LLM, and TTS inference.
          </p>

          <div className="space-y-2 pt-2 text-[13px]">
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Sarvam Saaras v3 ASR (38ms)</span>
              <span className="font-mono font-semibold text-[#0f0e17]">&#8377;0.24 / min</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Sarvam-M 30B FP8 LLM (115ms)</span>
              <span className="font-mono font-semibold text-[#0f0e17]">&#8377;0.28 / min</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Cartesia Sonic-2 / Bulbul V4 TTS</span>
              <span className="font-mono font-semibold text-[#0f0e17]">&#8377;0.58 / min</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Sarvam Telephony SIP Ingress</span>
              <span className="font-mono font-semibold text-[#0f0e17]">&#8377;0.33 / min</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-bold text-[#16a34a]">
              <span>Total Blended Cost</span>
              <span className="font-mono">&#8377;1.43 / min</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-3">
          <h3 className="text-[17px] font-semibold text-[#0f0e17]">
            Customer Billing Margin
          </h3>
          <p className="text-[13px] text-[#6c6b7e]">
            Standard customer billing rate vs unit cost realization.
          </p>

          <div className="space-y-2 pt-2 text-[13px]">
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Customer Standard Rate</span>
              <span className="font-mono font-semibold text-[#0f0e17]">&#8377;5.00 / min</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Net Gross Realization</span>
              <span className="font-mono font-semibold text-[#16a34a]">&#8377;3.57 / min</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#e2e4ed]">
              <span className="text-[#3a3f5c]">Platform Margin Realized</span>
              <span className="font-mono font-bold text-[#0f0e17]">71.4%</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-bold text-[#16a34a]">
              <span>Monthly Volume (2.84M mins)</span>
              <span className="font-mono">&#8377;1.42 Crores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
