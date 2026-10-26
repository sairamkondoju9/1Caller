import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Megaphone,
  Activity,
  Play,
  Pause,
  AlertTriangle,
  ShieldCheck,
  PhoneCall,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Server,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CampaignRow {
  id: string;
  name: string;
  agent: string;
  language: string;
  totalLeads: number;
  completed: number;
  qualified: number;
  currentCps: number;
  targetCps: number;
  status: 'active' | 'paused' | 'completed';
}

interface CarrierTrunk {
  name: string;
  role: 'primary' | 'secondary' | 'tertiary';
  status: 'operational' | 'standby' | 'circuit_break';
  currentCPS: string;
  maxCPS: number;
  warmCLIs: number;
  latencyMs: number;
}

export const FleetManager: React.FC = () => {
  const [circuitBreakerTripped, setCircuitBreakerTripped] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([
    {
      id: 'camp-1',
      name: 'Sai Meadows — Phase 2 Launch',
      agent: 'Priya (Telugu)',
      language: 'Telugu',
      totalLeads: 2500,
      completed: 1840,
      qualified: 412,
      currentCps: 18.4,
      targetCps: 21.0,
      status: 'active'
    },
    {
      id: 'camp-2',
      name: 'Axis Bank — Priority KYC Refresh',
      agent: 'Aarav (Hindi)',
      language: 'Hindi',
      totalLeads: 10000,
      completed: 3200,
      qualified: 1890,
      currentCps: 2.1,
      targetCps: 21.0,
      status: 'active'
    },
    {
      id: 'camp-3',
      name: 'Tata Capital — 30-Day Recovery',
      agent: 'Vikram (English)',
      language: 'English/Hinglish',
      totalLeads: 5000,
      completed: 5000,
      qualified: 1240,
      currentCps: 0.0,
      targetCps: 21.0,
      status: 'completed'
    }
  ]);

  const [trunks, setTrunks] = useState<CarrierTrunk[]>([
    {
      name: 'Sarvam Telephony Network (Mumbai Edge)',
      role: 'primary',
      status: 'operational',
      currentCPS: '18.4 CPS',
      maxCPS: 21.0,
      warmCLIs: 214,
      latencyMs: 12
    },
    {
      name: 'Exotel Secondary Trunk Rack',
      role: 'secondary',
      status: 'standby',
      currentCPS: '2.1 CPS',
      maxCPS: 21.0,
      warmCLIs: 48,
      latencyMs: 24
    },
    {
      name: 'Plivo / Twilio Tertiary Trunk',
      role: 'tertiary',
      status: 'standby',
      currentCPS: '0.0 CPS',
      maxCPS: 21.0,
      warmCLIs: 12,
      latencyMs: 38
    }
  ]);

  const toggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
  };

  const handleEmergencyFreeze = () => {
    setCircuitBreakerTripped(!circuitBreakerTripped);
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        status: !circuitBreakerTripped ? 'paused' : 'active'
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-[1160px] mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e4ed]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold text-[#0f0e17] tracking-[-0.02em] font-display">
              Campaign &amp; Inbound Fleet Manager
            </h1>
            <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
              High-Throughput Pacer
            </span>
          </div>
          <p className="text-[15px] text-[#6c6b7e] mt-0.5">
            Real-time telephony pacing curve (0 &rarr; 21 CPS agreed capacity), NDNC scrub gates, and carrier rack health.
          </p>
        </div>

        {/* Emergency Kill-Switch */}
        <button
          onClick={handleEmergencyFreeze}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all min-h-[44px] shadow-sm cursor-pointer',
            circuitBreakerTripped
              ? 'bg-[#16a34a] hover:bg-[#15803d] text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          {circuitBreakerTripped ? 'Resume All Outbound Dials' : 'Emergency Fail-Closed Freeze'}
        </button>
      </div>

      {circuitBreakerTripped && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <div className="text-[14px] font-semibold">
                Platform Carrier Outbound Halted
              </div>
              <div className="text-[12px] text-rose-800/80">
                All 7 SIP trunks set to 0.0 CPS. Inbound customer lines remain active.
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-rose-200 text-rose-950 px-2.5 py-1 rounded-md font-bold">
            FAIL-CLOSED ACTIVE
          </span>
        </div>
      )}

      {/* Carrier Rack Telemetry (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trunks.map((trunk) => (
          <div
            key={trunk.name}
            className="p-5 rounded-2xl apple-glass border border-[#e2e4ed] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#f0f1f6] text-[#6c6b7e] border border-[#e2e4ed]">
                {trunk.role.toUpperCase()} TRUNK
              </span>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  trunk.status === 'operational' ? 'bg-[#16a34a] animate-pulse' : 'bg-amber-400'
                )} />
                <span className="text-[12px] font-medium text-[#0f0e17] capitalize">
                  {trunk.status}
                </span>
              </div>
            </div>

            <div className="text-[15px] font-semibold text-[#0f0e17] leading-snug">
              {trunk.name}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2e4ed] text-[12px] font-mono">
              <div>
                <span className="text-[#6c6b7e] block">Throughput</span>
                <span className="font-semibold text-[#0f0e17]">{trunk.currentCPS}</span>
              </div>
              <div>
                <span className="text-[#6c6b7e] block">Warm CLIs</span>
                <span className="font-semibold text-[#0f0e17]">{trunk.warmCLIs} Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Campaigns Table with Virtualized Apple-Grade Styling */}
      <div className="apple-glass rounded-2xl border border-[#e2e4ed] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e2e4ed] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#0f0e17]">
              Active Outbound Campaigns
            </h2>
            <p className="text-[13px] text-[#6c6b7e]">
              Automated 21 CPS smooth curve pacing with TRAI NDNC scrubbing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-full border border-[#bbf7d0]">
              09:00 - 21:00 IST Window: Valid
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f9fc] text-[#6c6b7e] font-mono uppercase text-[11px] border-b border-[#e2e4ed]">
              <tr>
                <th className="py-3 px-5">Campaign / Agent</th>
                <th className="py-3 px-5">Dispatched / Total</th>
                <th className="py-3 px-5">Qualified</th>
                <th className="py-3 px-5">Pacing CPS</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e4ed]">
              {campaigns.map((c) => {
                const progressPct = Math.round((c.completed / c.totalLeads) * 100);
                return (
                  <tr key={c.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#0f0e17]">{c.name}</div>
                      <div className="text-[11px] text-[#6c6b7e]">{c.agent} • {c.language}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-mono text-[#0f0e17]">
                        {c.completed.toLocaleString()} / {c.totalLeads.toLocaleString()} ({progressPct}%)
                      </div>
                      <div className="w-32 bg-[#e2e4ed] h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#0f0e17] h-full rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono font-semibold text-[#16a34a]">
                      {c.qualified.toLocaleString()} leads
                    </td>
                    <td className="py-4 px-5 font-mono text-[#0f0e17]">
                      {c.currentCps} / {c.targetCps} CPS
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn(
                        'text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full',
                        c.status === 'active'
                          ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          : c.status === 'paused'
                          ? 'bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]'
                          : 'bg-[#f0f1f6] text-[#6c6b7e] border border-[#e2e4ed]'
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {c.status !== 'completed' && (
                        <button
                          onClick={() => toggleCampaign(c.id)}
                          className="px-3 py-1.5 bg-[#f0f1f6] hover:bg-[#e2e4ed] text-[#0f0e17] border border-[#e2e4ed] rounded-lg text-[12px] font-semibold transition-all min-h-[36px] cursor-pointer"
                        >
                          {c.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
