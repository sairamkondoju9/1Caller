import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  AlertCircle,
  X,
  Building2,
  Tag,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function TrainEmployeesView({ knowledge = [], onAddKnowledge, onNavigate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('pricing');

  // Interactive "Try it" Tester State (Matching Screenshots 9 & 10)
  const [testerInput, setTesterInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'system',
      text: "Test what Jagan knows. Ask any question about pricing, location, or offers to verify her instant factual recall."
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Default Facts taught to Jagan (from Screenshots & Jewelry Onboarding)
  const [factsList, setFactsList] = useState([
    {
      id: 'f-1',
      title: 'Christmas Jewelry Offers',
      category: 'offers',
      content: 'No GST and zero making charges across all gold, silver, and diamond jewellery items until December 31st.'
    },
    {
      id: 'f-2',
      title: 'Store Location & Landmark',
      category: 'location',
      content: 'Main road, directly opposite Hanuman Temple, Jillelaguda, Saroornagar Mandal, Hyderabad - 500079.'
    },
    {
      id: 'f-3',
      title: 'Store Operating Hours',
      category: 'timings',
      content: 'Open from 09:00 AM to 09:00 PM every day of the week (Monday through Sunday).'
    },
    {
      id: 'f-4',
      title: 'Gold Hallmarking & Guarantee',
      category: 'quality',
      content: '100% BIS Hallmarked 916 (22 Karat) gold. Certified VVS-VS natural diamonds with IGI lab guarantee certificates.'
    },
    {
      id: 'f-5',
      title: 'Payment & Exchange Options',
      category: 'payments',
      content: 'We accept Cash, UPI, Debit/Credit cards, and 0% interest EMI options on purchases above ₹25,000. Old gold exchange at live market valuation.'
    }
  ]);

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    const newFact = {
      id: `f-${Date.now()}`,
      title,
      content,
      category
    };
    setFactsList([...factsList, newFact]);
    if (onAddKnowledge) onAddKnowledge(newFact);
    setTitle('');
    setContent('');
    setShowAddModal(false);
  };

  const handleDeleteFact = (id) => {
    setFactsList(factsList.filter(f => f.id !== id));
  };

  const handleSendTestQuery = () => {
    if (!testerInput.trim()) return;
    const userMsg = testerInput.trim();
    setTesterInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsSimulating(true);

    setTimeout(() => {
      let reply = "I'm checking my knowledge base...";
      const q = userMsg.toLowerCase();

      if (q.includes('gst') || q.includes('offer') || q.includes('making')) {
        reply = "నమస్కారం! మా దగ్గర క్రిస్మస్ స్పెషల్ ఆఫర్ కింద అన్ని బంగారు, వెండి, డైమండ్ ఆభరణాలపై నో జీఎస్టీ మరియు నో మేకింగ్ ఛార్జెస్ నడుస్తున్నాయి.";
      } else if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('shop')) {
        reply = "మా షాప్ హైదరాబాద్ జిల్లేడుగూడ మెయిన్ రోడ్డులో, హనుమాన్ టెంపుల్ ఎదురుగా ఉంది అండి.";
      } else if (q.includes('time') || q.includes('open') || q.includes('timing') || q.includes('sunday')) {
        reply = "మేము వారంలో 7 రోజులు, రోజూ ఉదయం 9:00 నుండి రాత్రి 9:00 వరకు తెరిచి ఉంటాము.";
      } else if (q.includes('hallmark') || q.includes('purity') || q.includes('916') || q.includes('gold')) {
        reply = "మా దగ్గర ఉన్న గోల్డ్ అంతా 100% BIS హాల్‌మార్క్డ్ 916 (22 క్యారెట్) ప్యూరిటీ మాత్రమే ఉంటుంది అండి.";
      } else {
        reply = "ఖచ్చితంగా అండి, మీరు షాప్‌కి వచ్చి నేరుగా కలెక్షన్స్ చూడవచ్చు లేదా వివరాలు వాట్సాప్‌లో పంపించమంటారా?";
      }

      setChatMessages(prev => [...prev, { sender: 'jagan', text: reply }]);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6 font-sans">
      {/* Header (Exact text matching Screenshot 9: Script is what they say. Training is facts they look up only when asked.) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#6c6b7e] uppercase tracking-wider mb-1">
            <span>Employee Training</span>
            <span>·</span>
            <span className="text-[#d97757] font-semibold">Fact Grounding</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">
            Teach your employee
          </h1>
          <p className="text-xs text-[#6c6b7e] mt-1 font-sans">
            Script is what they say. Training is facts they look up only when asked. Type or just talk — either way it's something it can use.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="sarvam-btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Knowledge Fact
        </button>
      </div>

      {/* Main Grid: Left Column (What Jagan Knows) vs Right Column (Try It Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WHAT JAGAN KNOWS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0f0e17]" />
              WHAT JAGAN KNOWS ({factsList.length})
            </h3>
            <span className="text-[11px] text-[#16a34a] font-mono font-medium bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
              Active in RAG Memory
            </span>
          </div>

          <div className="space-y-3">
            {factsList.map((fact) => (
              <div
                key={fact.id}
                className="apple-glass rounded-2xl p-4.5 border border-[#e2e4ed] shadow-xs hover:border-[#cbd0df] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                    <h4 className="text-xs font-bold text-[#0f0e17] font-display">
                      {fact.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium uppercase bg-[#f6f7fb] text-[#6c6b7e] px-2 py-0.5 rounded-full border border-[#e2e4ed]">
                      {fact.category}
                    </span>
                    <button
                      onClick={() => handleDeleteFact(fact.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#6c6b7e] hover:text-[#c2410c] transition-opacity cursor-pointer"
                      title="Remove fact"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#3a3f5c] leading-relaxed bg-[#f8f9fc] rounded-xl p-3 border border-[#e2e4ed]">
                  {fact.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: "Try it with Jagan" Interactive Tester (5 Cols - Matching Screenshot 9) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Try it with Jagan
            </h3>
            <span className="text-[11px] font-mono text-[#6c6b7e]">
              Instant Verification
            </span>
          </div>

          <div className="apple-glass rounded-2xl border border-[#e2e4ed] shadow-xs overflow-hidden flex flex-col h-[480px]">
            {/* Simulator Header */}
            <div className="p-3.5 border-b border-[#e2e4ed] bg-[#f8f9fc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#16151f] text-white flex items-center justify-center text-xs font-bold font-display">
                  J
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f0e17]">Jagan (Sales Assistant)</div>
                  <div className="text-[10px] font-mono text-[#16a34a]">Telugu + English · Real-time RAG</div>
                </div>
              </div>
              <button
                onClick={() => setChatMessages([{ sender: 'system', text: "Chat reset. Ask any question to test recall." }])}
                className="text-[11px] text-[#6c6b7e] hover:text-[#0f0e17] font-mono cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'jagan'
                      ? 'items-start'
                      : 'items-center text-center'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="p-2 rounded-lg bg-[#f6f7fb] text-[11px] text-[#6c6b7e] border border-[#e2e4ed] max-w-xs">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0f0e17] text-white rounded-br-xs'
                          : 'bg-[#f6f7fb] border border-[#e2e4ed] text-[#0f0e17] rounded-bl-xs'
                      }`}
                    >
                      <div className="text-[9px] font-mono font-bold uppercase mb-1 opacity-70">
                        {msg.sender === 'user' ? 'You (Caller)' : 'Jagan (AI Employee)'}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  )}
                </div>
              ))}
              {isSimulating && (
                <div className="flex items-center gap-1.5 text-xs text-[#6c6b7e] font-mono p-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6c6b7e] animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6c6b7e] animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6c6b7e] animate-pulse"></span>
                  <span className="ml-1">Retrieving facts...</span>
                </div>
              )}
            </div>

            {/* Quick Test Chips */}
            <div className="p-2 border-t border-[#f0f2f8] bg-[#fafafa] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {['Offers?', 'Store address?', 'Timings?', 'Hallmarking?'].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTesterInput(chip);
                  }}
                  className="bg-white hover:bg-[#f0f2f8] border border-[#e2e4ed] px-2 py-0.5 rounded-md text-[#3a3f5c] shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-[#e2e4ed] bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Jagan anything to test her knowledge..."
                value={testerInput}
                onChange={(e) => setTesterInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTestQuery()}
                className="apple-glass-input flex-1 p-2 text-xs text-[#0f0e17]"
              />
              <button
                onClick={handleSendTestQuery}
                disabled={!testerInput.trim()}
                className="bg-[#0f0e17] disabled:bg-gray-200 text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section: WHERE JAGAN STRUGGLED ON REAL CALLS (Exact text matching Screenshot 9) */}
      <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e]">
            WHERE JAGAN STRUGGLED ON REAL CALLS
          </h3>
          <span className="text-[10px] font-mono text-[#6c6b7e]">0 flags</span>
        </div>

        <div className="p-8 text-center bg-[#f8f9fc] rounded-xl border border-dashed border-[#e2e4ed] space-y-1.5">
          <CheckCircle className="w-5 h-5 text-[#16a34a] mx-auto" />
          <h4 className="text-xs font-bold text-[#0f0e17]">
            No struggles yet —
          </h4>
          <p className="text-xs text-[#6c6b7e] max-w-md mx-auto">
            struggles appear when callers ask questions Jagan couldn't answer, giving you immediate recommendations to teach new facts.
          </p>
        </div>
      </div>

      {/* Add Knowledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-2xl">
            <h3 className="text-sm font-bold text-[#0f0e17] font-display">Add Knowledge Fact</h3>
            <div>
              <label className="block text-xs font-semibold text-[#0f0e17] mb-1">Fact Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Return Policy &amp; Hallmark Certification"
                className="apple-glass-input w-full p-2.5 text-xs text-[#0f0e17] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f0e17] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="apple-glass-input w-full p-2 text-xs font-medium text-[#0f0e17]"
              >
                <option value="offers">Offers &amp; Discounts</option>
                <option value="pricing">Pricing &amp; Commercials</option>
                <option value="timings">Timings &amp; Operating Days</option>
                <option value="location">Location &amp; Landmark</option>
                <option value="quality">Quality &amp; Hallmarking</option>
                <option value="payments">Payments &amp; EMI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f0e17] mb-1">Knowledge Details</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. 100% money-back guarantee within 7 days with original invoice and certificate..."
                className="apple-glass-input w-full p-3 text-xs text-[#0f0e17] resize-none font-normal"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 text-xs text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="sarvam-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Save Fact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
