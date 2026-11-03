import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  ChevronDown,
  Volume2,
  CheckCircle2,
  FileText,
  X,
  PhoneCall,
  Clock,
  Sparkles
} from 'lucide-react';
import { getAuthHeaders } from '../utils/api';

export default function AllConversationsView({ calls = [], employees = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [realCalls, setRealCalls] = useState(calls);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/calls', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (mounted && Array.isArray(data)) {
          setRealCalls(data);
        }
      })
      .catch(err => console.warn('[Calls fetch notice]:', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const activeCalls = realCalls;

  const filteredCalls = activeCalls.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.contact_name && c.contact_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.employee_name && c.employee_name.toLowerCase().includes(q))
    );
  });

  const totalCalls = activeCalls.length;
  const qualifiedCalls = activeCalls.filter((c) => c.qualification === 'qualified' || c.status === 'qualified').length;
  const totalCreditsUsed = activeCalls.reduce((acc, c) => acc + (c.cost || c.credits_used || 0), 0);

  const handlePlayAudio = (call) => {
    if (!call.audioUrl && !call.recording_url) return;
    const url = call.audioUrl || call.recording_url;
    if (playingId === call.id) {
      if (audioObj) audioObj.pause();
      setPlayingId(null);
    } else {
      if (audioObj) audioObj.pause();
      const sound = new Audio(url);
      sound.play().catch(err => console.warn("Audio playback notice:", err.message));
      sound.onended = () => setPlayingId(null);
      setAudioObj(sound);
      setPlayingId(call.id);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] mb-2">
            CONVERSATIONS
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">
            Conversations
          </h1>
          <p className="text-xs text-[#6c6b7e] mt-1 font-sans">
            Every call your employees handled — filter, sort, and export. Call recordings are kept for 90 days, then automatically deleted — the transcript and summary stay for as long as your account is active.
          </p>
        </div>

        {activeCalls.length > 0 && (
          <button
            onClick={() => {
              const csv = activeCalls.map(c => `"${c.contact_name || c.contact || ''}","${c.phone || ''}","${c.employee_name || ''}","${c.qualification || c.status || ''}","${c.duration || ''}","${c.cost || 0}","${c.date || c.created_at || ''}"`).join('\n');
              const blob = new Blob([`Name,Phone,Employee,Qualification,Duration,Cost,Date\n${csv}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'conversations_log.csv';
              a.click();
            }}
            className="apple-glass text-[#0f0e17] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#6c6b7e]" /> Export CSV
          </button>
        )}
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] flex items-center justify-center mb-2 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-display tabular-nums">{totalCalls}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Calls · all time</div>
        </div>

        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center mb-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#16a34a] font-display tabular-nums">{qualifiedCalls}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Qualified · all time</div>
        </div>

        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] flex items-center justify-center mb-2 shadow-2xs">
            <span className="text-sm font-bold font-mono">₹</span>
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-mono tabular-nums">₹{totalCreditsUsed.toFixed(2)}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Credits used · all time</div>
        </div>
      </div>

      {/* Search Bar */}
      {activeCalls.length > 0 && (
        <div className="apple-glass p-3.5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6c6b7e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contact, phone, employee, summary..."
              className="apple-glass-input w-full text-xs pl-9 pr-3 py-2 text-[#0f0e17] placeholder:text-[#6c6b7e]"
            />
          </div>
        </div>
      )}

      {/* Conversations Table or Clean Empty State */}
      {filteredCalls.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#e2e4ed] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7a50dc] mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f0e17]">No conversations recorded yet</h3>
            <p className="text-xs text-[#6c6b7e] max-w-md mx-auto mt-1">
              When your AI employees make or receive calls, recordings, full transcripts, and lead qualification statuses will automatically appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="apple-glass rounded-2xl overflow-hidden border border-[#e2e4ed] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed] text-[#6c6b7e] font-bold uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5">Employee</th>
                  <th className="py-3 px-5">Direction</th>
                  <th className="py-3 px-5">Summary</th>
                  <th className="py-3 px-5">Qualification</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Cost</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e4ed] text-[#3a3f5c]">
                {filteredCalls.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f6f7fb]/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#0f0e17]">
                      <div>{c.contact_name || c.contact || 'Direct Call'}</div>
                      <div className="text-[11px] font-mono text-[#6c6b7e]">{c.phone || c.to_number}</div>
                    </td>

                    <td className="py-3.5 px-5 font-medium text-[#0f0e17]">
                      <span className="bg-[#f6f7fb] border border-[#e2e4ed] px-2 py-0.5 rounded text-[11px]">
                        {c.employee_name || 'AI Employee'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-[#6c6b7e] font-mono">
                      {c.direction || 'Outbound'}
                    </td>

                    <td className="py-3.5 px-5 max-w-xs truncate text-[#3a3f5c]">
                      {c.summary || c.call_summary || 'Completed conversation'}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[10.5px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                          (c.qualification === 'qualified' || c.status === 'qualified')
                            ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
                            : (c.qualification === 'callback' || c.status === 'callback')
                            ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'
                            : 'bg-[#f6f7fb] text-[#6c6b7e] border-[#e2e4ed]'
                        }`}
                      >
                        {c.qualification || c.status || 'Completed'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[#6c6b7e]">
                      {c.duration || '0s'}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[#0f0e17]">
                      ₹{Number(c.cost || c.credits_used || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-5 text-[#6c6b7e]">
                      {c.date || (c.created_at ? new Date(c.created_at).toLocaleString() : 'Recent')}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(c.audioUrl || c.recording_url) && (
                          <button
                            onClick={() => handlePlayAudio(c)}
                            className="p-1.5 rounded-lg bg-[#f6f7fb] hover:bg-[#eef0f7] text-[#0f0e17] transition-colors cursor-pointer"
                            title="Play Recording"
                          >
                            {playingId === c.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCall(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0f0e17] bg-[#f6f7fb] hover:bg-[#eef0f7] border border-[#e2e4ed] rounded-lg cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-[#e2e4ed] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0f0e17] font-display">
                  {selectedCall.contact_name || selectedCall.contact || 'Direct Call'}
                </h3>
                <p className="text-xs text-[#6c6b7e] font-mono">{selectedCall.phone || selectedCall.to_number}</p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="p-1 text-[#6c6b7e] hover:text-[#0f0e17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e2e4ed] text-xs">
                <div className="font-bold text-[#0f0e17] mb-1">AI Call Summary</div>
                <div className="text-[#3a3f5c] leading-relaxed">{selectedCall.summary || selectedCall.call_summary || 'No summary available.'}</div>
              </div>

              {selectedCall.transcript && Array.isArray(selectedCall.transcript) && selectedCall.transcript.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#0f0e17]">Transcript</div>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-[#f8f9fc] rounded-xl border border-[#e2e4ed] text-xs">
                    {selectedCall.transcript.map((t, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <strong className="text-[#0f0e17]">{t.speaker}: </strong>
                        <span className="text-[#3a3f5c]">{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedCall(null)} className="sarvam-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
