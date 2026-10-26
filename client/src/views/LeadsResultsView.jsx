import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserCheck,
  Send,
  Sparkles
} from 'lucide-react';

export default function LeadsResultsView({ leads = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  const activeLeads = Array.isArray(leads) ? leads : [];

  const filteredLeads = activeLeads.filter((l) => {
    if (channelFilter !== 'all' && (l.channel || 'instant') !== channelFilter) return false;
    const matchesSearch =
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.phone && l.phone.includes(searchQuery)) ||
      (l.extracted_data && JSON.stringify(l.extracted_data).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalCount = activeLeads.length;
  const qualifiedCount = activeLeads.filter((l) => l.status === 'qualified').length;
  const pendingCount = activeLeads.filter((l) => l.status === 'pending').length;
  const hotCount = activeLeads.filter((l) => l.isHot).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 font-mono">
            Results &amp; Analytics
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">
            Leads &amp; Results
          </h1>
          <p className="text-xs text-[#6c6b7e] mt-1 font-sans">
            Every contact your employees have spoken with — across inbound, instant and bulk.
          </p>
        </div>

        <button
          onClick={() => {
            const csv = activeLeads.map(l => `"${l.name}","${l.phone}","${l.status}","${l.call_duration}s","${JSON.stringify(l.extracted_data).replace(/"/g, '""')}"`).join('\n');
            const blob = new Blob([`Name,Phone,Status,Duration,ExtractedData\n${csv}`], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sarvam_leads_results.csv';
            a.click();
          }}
          className="apple-glass hover:bg-white text-[#0f0e17] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e2e4ed] shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#0f0e17]" /> Export CSV
        </button>
      </div>

      {/* KPI Cards Row (Apple Liquid Glass) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="apple-glass rounded-xl p-4 border border-[#e2e4ed]">
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#0f0e17]" /> Total Leads
          </div>
          <div className="text-2xl font-extrabold text-[#0f0e17] font-mono">{totalCount}</div>
          <div className="text-[11px] text-[#6c6b7e] mt-0.5">{totalCount} contacts in this workspace</div>
        </div>

        <div className="apple-glass rounded-xl p-4 border border-[#e2e4ed]">
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Qualified
          </div>
          <div className="text-2xl font-extrabold text-[#16a34a] font-mono">{qualifiedCount}</div>
          <div className="text-[11px] text-[#6c6b7e] mt-0.5">positive outcome</div>
        </div>

        <div className="apple-glass rounded-xl p-4 border border-[#e2e4ed]">
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#ea580c]" /> Pending Callback
          </div>
          <div className="text-2xl font-extrabold text-[#ea580c] font-mono">{pendingCount}</div>
          <div className="text-[11px] text-[#6c6b7e] mt-0.5">need follow-up</div>
        </div>

        <div className="apple-glass rounded-xl p-4 border border-[#e2e4ed]">
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" /> Hot Leads
          </div>
          <div className="text-2xl font-extrabold text-[#dc2626] font-mono">{hotCount}</div>
          <div className="text-[11px] text-[#6c6b7e] mt-0.5">high intent</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 apple-glass rounded-xl p-3 border border-[#e2e4ed]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#6c6b7e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone or captured info..."
            className="apple-glass-input w-full pl-9 pr-3 py-2 text-xs text-[#0f0e17]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'inbound', 'instant', 'bulk'].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                channelFilter === ch
                  ? 'bg-[#0f0e17] text-white shadow-xs'
                  : 'bg-[#f0f1f6] hover:bg-[#e2e4ed] text-[#0f0e17] border border-[#e2e4ed]'
              }`}
            >
              {ch === 'all' ? 'All channels' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="apple-glass rounded-2xl overflow-hidden border border-[#e2e4ed] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed] text-[#6c6b7e] font-bold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Extracted Info &amp; Variables</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e4ed] text-[#3a3f5c]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#0f0e17]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] flex items-center justify-center font-bold text-xs font-mono">
                        {(lead.name || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {lead.isHot && <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-current" />}
                          <span>{lead.name}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6c6b7e]">{lead.phone}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${
                        lead.status === 'qualified'
                          ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
                          : 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{lead.call_duration || 0}s</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lead.extracted_data &&
                        Object.entries(lead.extracted_data).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-white/70 border border-[#e2e4ed] text-[#0f0e17] px-2 py-0.5 rounded text-[10px] font-medium font-mono"
                          >
                            <strong>{k}:</strong> {String(v)}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      disabled
                      title="Calling is unavailable until a compliant telephony provider is configured."
                      className="text-[#6c6b7e] font-bold text-xs cursor-not-allowed disabled:opacity-60"
                    >
                      Calling unavailable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-[#6c6b7e]">
              {activeLeads.length === 0 ? 'No leads yet. Add contacts in Leads CRM or import a CSV to create a campaign draft.' : 'No leads match your current search or filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
