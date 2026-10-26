import { getAuthHeaders } from '../utils/api';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  PhoneCall,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function PerformanceView() {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/performance?range=${timeRange}`, {
      headers: getAuthHeaders(),
      signal: controller.signal
    })
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not load analytics data.');
        return json;
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching performance data:', err);
        setError(err.message || 'Could not load analytics data.');
        setLoading(false);
      });
    return () => controller.abort();
  }, [timeRange]);

  const summary = data?.summary || {
    totalCalls: 0,
    answerRate: '0%',
    totalTalkTimeHours: '0.0',
    avgDurationSec: 0,
    qualifiedRate: '0%',
    totalCost: '0.00',
    avgCostPerCall: '₹0.00'
  };

  const dailyVolume = data?.dailyVolume || [];
  const hourlyDistribution = data?.hourlyDistribution || [];
  const funnel = data?.funnel || [];
  const dispositions = data?.dispositions || [];
  const maxCallsDaily = Math.max(1, ...dailyVolume.map(d => d.calls));
  const dailyCallTotal = dailyVolume.reduce((sum, item) => sum + item.calls, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">Performance & Analytics</h1>
            <span className="text-[11px] font-mono font-medium bg-[#f6f7fb] text-[#0f0e17] px-2.5 py-0.5 rounded-full border border-[#e2e4ed]">
              WORKSPACE ANALYTICS
            </span>
          </div>
          <p className="text-xs text-[#6c6b7e] mt-1 font-sans">
            Real-time conversion funnels, answer rates, talk time metrics, and AI agent benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center apple-glass p-0.5 rounded-xl">
            {['24h', '7d', '30d', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === timeRange) return;
                  setTimeRange(tab);
                  setLoading(true);
                  setError('');
                  setData(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === tab
                    ? 'bg-white text-[#0f0e17] shadow-xs'
                    : 'text-[#6c6b7e] hover:text-[#0f0e17]'
                }`}
              >
                {tab === '24h' ? '24 Hours' : tab === '7d' ? 'Last 7 Days' : tab === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workspace KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Calls */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between text-[#6c6b7e] text-xs font-medium mb-2">
            <span>Total Calls Made</span>
            <PhoneCall className="w-4 h-4 text-[#0f0e17]" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-display">{summary.totalCalls.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[#6c6b7e]">
            {loading ? 'Loading recorded call data…' : 'Recorded calls in this workspace'}
          </div>
        </div>

        {/* Answer Rate */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between text-[#6c6b7e] text-xs font-medium mb-2">
            <span>Answer / Pickup Rate</span>
            <TrendingUp className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-display">{summary.answerRate}</div>
          <div className="mt-2 text-xs text-[#6c6b7e]">
            Answered calls divided by recorded calls
          </div>
        </div>

        {/* Total Talk Time */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between text-[#6c6b7e] text-xs font-medium mb-2">
            <span>Total Talk Time</span>
            <Clock className="w-4 h-4 text-[#0f0e17]" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-mono">{summary.totalTalkTimeHours} hrs</div>
          <div className="text-xs text-[#6c6b7e] mt-2">
            Avg <span className="font-semibold text-[#0f0e17]">{Math.floor(summary.avgDurationSec / 60)}m {summary.avgDurationSec % 60}s</span> / call
          </div>
        </div>

        {/* Qualified Lead Rate */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between text-[#6c6b7e] text-xs font-medium mb-2">
            <span>Lead Qualification</span>
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div className="text-2xl font-bold text-[#16a34a] font-display">{summary.qualifiedRate}</div>
          <div className="text-xs text-[#6c6b7e] mt-2">
            Based on qualified leads recorded in this workspace
          </div>
        </div>

        {/* Avg Cost Per Call */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between text-[#6c6b7e] text-xs font-medium mb-2">
            <span>Avg Cost / Call</span>
            <DollarSign className="w-4 h-4 text-[#ea580c]" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-mono">{summary.avgCostPerCall}</div>
          <div className="text-xs text-[#6c6b7e] mt-2">
            Based on recorded call costs
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Daily Volume & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Call Volume & Connected Bars */}
        <div className="lg:col-span-2 apple-glass p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f0e17] font-display">Calls & Answers by Day</h2>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Daily totals calculated from recorded calls in the selected period</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#cbd0df]"></span>
                <span className="text-[#3a3f5c] font-medium">Dialed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#16a34a]"></span>
                <span className="text-[#3a3f5c] font-medium">Answered</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-[#e2e4ed]">
            {!dailyVolume.length && (
              <div className="w-full text-center text-sm text-[#6c6b7e]">
                {loading ? 'Loading call history…' : 'No call history is available for this workspace yet.'}
              </div>
            )}
            {dailyVolume.map((item, idx) => {
              const heightDialed = Math.round((item.calls / maxCallsDaily) * 190);
              const heightAnswered = Math.round((item.answered / maxCallsDaily) * 190);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-16 bg-[#181335] text-white text-[11px] rounded-lg py-1.5 px-2.5 whitespace-nowrap z-20 shadow-lg transition-opacity font-mono">
                    <div className="font-bold text-[#cbd0df]">{item.day}</div>
                    <div>Dialed: {item.calls}</div>
                    <div className="text-[#16a34a]">Answered: {item.answered} ({item.calls ? Math.round((item.answered / item.calls) * 100) : 0}%)</div>
                  </div>

                  {/* Bars Group */}
                  <div className="w-full flex items-end justify-center gap-1 h-[200px]">
                    <div
                      style={{ height: `${heightDialed}px` }}
                      className="w-full max-w-[14px] bg-[#e2e4ed] group-hover:bg-[#cbd0df] rounded-t-sm transition-all"
                    ></div>
                    <div
                      style={{ height: `${heightAnswered}px` }}
                      className="w-full max-w-[14px] bg-[#16a34a]/75 group-hover:bg-[#16a34a] rounded-t-sm transition-all"
                    ></div>
                  </div>

                  <span className="text-xs font-semibold text-[#6c6b7e] group-hover:text-[#0f0e17] transition-colors font-mono">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6c6b7e] pt-2">
            <span>Calls in the displayed period: {dailyCallTotal.toLocaleString()}</span>
            <span>{dailyVolume.length ? 'Daily totals use recorded calls' : ''}</span>
          </div>
        </div>

        {/* End-to-End Conversion Funnel */}
        <div className="apple-glass p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17] font-display">Conversion Funnel</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">Drop-off rate across conversation milestones</p>
          </div>

          <div className="space-y-4 pt-1">
            {!funnel.length && (
              <p className="text-sm text-[#6c6b7e]">Funnel metrics will appear when calls and qualified leads are recorded.</p>
            )}
            {funnel.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0f0e17]">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0f0e17] font-mono">{step.count.toLocaleString()}</span>
                    <span className="text-[11px] text-[#6c6b7e] bg-white/70 border border-[#e2e4ed] px-1.5 py-0.5 rounded font-mono">
                      {step.pct}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-[#f6f7fb] border border-[#e2e4ed] rounded-full overflow-hidden">
                  <div
                    style={{ width: step.pct }}
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-[#0f0e17]'
                        : idx === 1
                        ? 'bg-[#16a34a]'
                        : idx === 2
                        ? 'bg-[#2d2b38]'
                        : idx === 3
                        ? 'bg-[#ea580c]'
                        : 'bg-[#181335]'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Hourly Heatmap & Disposition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TRAI Calling Hours Pickup Heatmap */}
        <div className="lg:col-span-2 apple-glass p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0f0e17] font-display">Busiest Hours & Pickup Likelihood</h2>
                <span className="text-[10px] font-mono font-medium bg-[#fff7ed] text-[#ea580c] px-2 py-0.5 rounded-md border border-[#fed7aa]">
                  TRAI Window: 09:00 - 21:00 IST
                </span>
              </div>
              <p className="text-xs text-[#6c6b7e] mt-0.5">
                Optimize campaign dispatch pacing when prospective customers are most likely to answer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
            {!hourlyDistribution.length && (
              <p className="col-span-full text-sm text-[#6c6b7e]">Hourly statistics will appear after calls are recorded.</p>
            )}
            {hourlyDistribution.map((item, idx) => {
              const rateNum = parseInt(item.rate);
              const isPeak = rateNum >= 80;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isPeak
                      ? 'bg-[#f0fdf4] border-[#bbf7d0] ring-1 ring-[#16a34a]/30 shadow-2xs'
                      : 'bg-white/60 border-[#e2e4ed]'
                  }`}
                >
                  <div className="text-[10px] font-mono font-medium text-[#6c6b7e]">{item.hour}</div>
                  <div className={`text-sm font-bold font-mono mt-1 ${isPeak ? 'text-[#16a34a]' : 'text-[#0f0e17]'}`}>
                    {item.rate}
                  </div>
                  <div className="text-[10px] text-[#6c6b7e] mt-0.5 font-mono">{item.calls}c</div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Call Disposition Breakdown */}
        <div className="apple-glass p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17] font-display">Call Dispositions</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">Outcome distribution of all attempted calls</p>
          </div>

          <div className="space-y-3 pt-2">
            {!dispositions.length && (
              <p className="text-sm text-[#6c6b7e]">Disposition statistics will appear when calls are recorded.</p>
            )}
            {dispositions.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="font-medium text-[#3a3f5c]">{item.label}</span>
                  </div>
                  <span className="font-semibold text-[#0f0e17] font-mono">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#f6f7fb] rounded-full overflow-hidden border border-[#e2e4ed]/50">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className={`h-full rounded-full ${item.color}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#6c6b7e] pt-3 border-t border-[#e2e4ed] flex items-center justify-between">
            <span>DND controls are managed in the workspace DND settings.</span>
          </div>
        </div>
      </div>

      {/* Employee-level metrics are not available from the current analytics API. */}
      <div className="apple-glass overflow-hidden">
        <div className="p-5.5 border-b border-[#e2e4ed] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17] font-display">AI Employee Performance</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">Employee-level performance is not included in the available call analytics.</p>
          </div>
        </div>
        <p className="p-5 text-sm text-[#6c6b7e]">
          No employee leaderboard is shown until verified call-to-employee attribution is available.
        </p>
      </div>
    </div>
  );
}