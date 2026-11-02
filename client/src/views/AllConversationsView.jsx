import React, { useState } from 'react';
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

export default function AllConversationsView({ calls = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  const defaultCalls = [
    {
      id: 'conv-1',
      contact_name: 'Sairam',
      phone: '+918919112039',
      employee_name: 'Jagan',
      direction: 'Outbound Instant',
      qualification: 'qualified',
      duration: '1m 30s',
      cost: 13.6,
      date: 'Today 5:00 PM',
      audioUrl: '/audio/jagan-test-call.mp3',
      summary: 'Caller interested in Christmas gold offer (no GST, no making charges) for Jillelaguda shop, requested WhatsApp catalog.',
      transcript: [
        { speaker: 'Jagan', text: 'నమస్కారం సాయిరామ్ గారు, నేను జిల్లేడుగూడ సాయిరామ్ జ్యువెలర్స్ నుండి జగన్ మాట్లాడుతున్నాను.' },
        { speaker: 'Sairam', text: 'అవునండి, క్రిస్మస్ ఆఫర్లు ఏమైనా ఉన్నాయా?' },
        { speaker: 'Jagan', text: 'అవునండి! నో జీఎస్టీ, నో మేకింగ్ ఛార్జెస్ అన్ని బంగారు, వెండి ఆభరణాలపై నడుస్తున్నాయి.' },
        { speaker: 'Sairam', text: 'సరే వివరాలు వాట్సాప్ పంపించండి, చూసి వస్తాను.' }
      ]
    },
    {
      id: 'conv-2',
      contact_name: 'Anil Kumar',
      phone: '+919848012345',
      employee_name: 'Jagan',
      direction: 'Outbound Instant',
      qualification: 'callback',
      duration: '45s',
      cost: 6.8,
      date: 'Today 4:30 PM',
      audioUrl: '/audio/jagan-test-call.mp3',
      summary: 'Customer busy in meeting, requested callback tomorrow at 11 AM regarding silver articles for housewarming.',
      transcript: [
        { speaker: 'Jagan', text: 'హలో అనీల్ గారు, సాయిరామ్ జ్యువెలర్స్ నుంచి అండి.' },
        { speaker: 'Customer', text: 'రేపు ఉదయం 11 గంటలకు చేయండి, ఇప్పుడు మీటింగ్‌లో ఉన్నాను.' },
        { speaker: 'Jagan', text: 'తప్పకుండా అండీ, రేపు ఉదయం 11 గంటలకు మళ్లీ కాల్ చేస్తాను. ధన్యవాదాలు.' }
      ]
    },
    {
      id: 'conv-3',
      contact_name: 'Sairam',
      phone: '+918919112039',
      employee_name: 'Jagan',
      direction: 'Outbound Instant',
      qualification: 'voicemail',
      duration: '1s',
      cost: 0.0,
      date: 'Today 4:45 PM',
      audioUrl: null,
      summary: 'Call reached voicemail after 4 rings, retry scheduled in 20 minutes.',
      transcript: []
    }
  ];

  const activeCalls = (calls && calls.length > 0) ? calls : defaultCalls;

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
  const qualifiedCalls = activeCalls.filter((c) => c.qualification === 'qualified').length;
  const totalCreditsUsed = activeCalls.reduce((acc, c) => acc + (c.cost || 0), 0);

  const handlePlayAudio = (call) => {
    if (!call.audioUrl) return;
    if (playingId === call.id) {
      if (audioObj) audioObj.pause();
      setPlayingId(null);
    } else {
      if (audioObj) audioObj.pause();
      const sound = new Audio(call.audioUrl);
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

        <button
          onClick={() => {
            const csv = activeCalls.map(c => `"${c.contact_name}","${c.phone}","${c.employee_name}","${c.qualification}","${c.duration}","${c.cost}","${c.date}"`).join('\n');
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
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] flex items-center justify-center mb-2 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-display">{totalCalls}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Calls · all time</div>
        </div>

        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center mb-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#16a34a] font-display">{qualifiedCalls}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Qualified · all time</div>
        </div>

        <div className="apple-glass p-5 rounded-2xl border border-[#e2e4ed] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] flex items-center justify-center mb-2 shadow-2xs">
            <span className="text-sm font-bold font-mono">₹</span>
          </div>
          <div className="text-2xl font-bold text-[#0f0e17] font-mono">₹{totalCreditsUsed.toFixed(2)}</div>
          <div className="text-xs text-[#6c6b7e] font-medium">Credits used · all time</div>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Conversations Table */}
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
                    <div>{c.contact_name}</div>
                    <div className="text-[11px] font-mono text-[#6c6b7e]">{c.phone}</div>
                  </td>

                  <td className="py-3.5 px-5 font-medium text-[#0f0e17]">
                    <span className="bg-[#f6f7fb] border border-[#e2e4ed] px-2 py-0.5 rounded text-[11px]">
                      {c.employee_name}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-xs text-[#6c6b7e] font-mono">
                    {c.direction}
                  </td>

                  <td className="py-3.5 px-5 max-w-xs truncate text-[#3a3f5c]">
                    {c.summary}
                  </td>

                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${
                        c.qualification === 'qualified'
                          ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]'
                          : c.qualification === 'callback'
                          ? 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]'
                          : 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]'
                      }`}
                    >
                      {c.qualification}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 font-mono text-[#6c6b7e]">
                    {c.duration}
                  </td>

                  <td className="py-3.5 px-5 font-mono text-[#0f0e17]">
                    ₹{c.cost.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-5 text-[11px] font-mono text-[#6c6b7e]">
                    {c.date}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.audioUrl && (
                        <button
                          onClick={() => handlePlayAudio(c)}
                          className="p-1.5 rounded-lg bg-[#f6f7fb] hover:bg-[#0f0e17] text-[#0f0e17] hover:text-white transition-all cursor-pointer border border-[#e2e4ed]"
                          title="Play call recording"
                        >
                          {playingId === c.id ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      )}
                      {c.transcript && c.transcript.length > 0 && (
                        <button
                          onClick={() => setSelectedCall(c)}
                          className="p-1.5 rounded-lg bg-[#f6f7fb] hover:bg-[#f0f2f8] text-[#0f0e17] transition-all cursor-pointer border border-[#e2e4ed]"
                          title="View transcript"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e2e4ed] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f0e17] font-display">
                  Call Recording &amp; Transcript
                </h3>
                <p className="text-[11px] font-mono text-[#6c6b7e]">
                  {selectedCall.contact_name} ({selectedCall.phone}) · {selectedCall.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1 rounded-lg text-[#6c6b7e] hover:bg-[#f6f7fb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {selectedCall.transcript.map((turn, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    turn.speaker === 'Jagan'
                      ? 'bg-[#f6f7fb] border-[#e2e4ed] text-[#0f0e17]'
                      : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase mb-1">
                    {turn.speaker}
                  </div>
                  <div className="leading-relaxed font-sans">{turn.text}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e2e4ed] flex items-center justify-between">
              <span className="text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Outcome: {selectedCall.qualification}
              </span>
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 text-xs bg-[#0f0e17] text-white font-semibold rounded-xl hover:bg-[#1f1e28] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
