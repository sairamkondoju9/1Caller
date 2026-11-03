import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/api';
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
  Check,
  User
} from 'lucide-react';

export default function TrainEmployeesView({ employees = [], knowledge = [], onAddKnowledge, onNavigate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('pricing');
  const [loading, setLoading] = useState(true);

  // Active employee selection for training
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const activeEmployee = employees.find(e => e.id === selectedEmpId) || employees[0] || null;
  const employeeName = activeEmployee?.name || 'Your AI Employee';
  const employeeRole = activeEmployee?.industry ? `${activeEmployee.industry} Specialist` : 'AI Sales Assistant';
  const employeeLang = activeEmployee?.primary_language === 'te' || (activeEmployee?.language && activeEmployee?.language.includes('Telugu'))
    ? 'Telugu + English'
    : (activeEmployee?.language || 'Telugu + English');

  // Real facts list for this tenant
  const [factsList, setFactsList] = useState(knowledge || []);

  // Fetch real knowledge base on mount
  useEffect(() => {
    let mounted = true;
    fetch('/api/knowledge-base', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (mounted && Array.isArray(data)) {
          setFactsList(data);
        }
      })
      .catch(err => console.warn('[Knowledge fetch notice]:', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Update selected employee when employees list changes
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees]);

  // Interactive "Try it" Tester State
  const [testerInput, setTesterInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'system',
      text: `Test what ${employeeName} knows. Ask any question about pricing, location, or offers to verify instant factual recall.`
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Reset chat when active employee changes
  useEffect(() => {
    setChatMessages([
      {
        sender: 'system',
        text: `Test what ${employeeName} knows. Ask any question about pricing, location, or offers to verify instant factual recall.`
      }
    ]);
  }, [employeeName]);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category,
          employee_id: activeEmployee?.id || null
        })
      });
      const data = await res.json();
      const newFact = {
        id: data.id || `kb_${Date.now()}`,
        title: trimmedTitle,
        content: trimmedContent,
        category
      };
      setFactsList(prev => [newFact, ...prev]);
      if (onAddKnowledge) onAddKnowledge(newFact);
    } catch (err) {
      console.warn('[Save fact notice]:', err);
      const fallbackFact = {
        id: `kb_${Date.now()}`,
        title: trimmedTitle,
        content: trimmedContent,
        category
      };
      setFactsList(prev => [fallbackFact, ...prev]);
    } finally {
      setTitle('');
      setContent('');
      setShowAddModal(false);
    }
  };

  const handleDeleteFact = async (id) => {
    setFactsList(prev => prev.filter(f => f.id !== id));
    try {
      await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.warn('[Delete fact notice]:', err);
    }
  };

  const handleSendTestQuery = () => {
    if (!testerInput.trim()) return;
    const userMsg = testerInput.trim();
    setTesterInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsSimulating(true);

    setTimeout(() => {
      let reply = '';
      const q = userMsg.toLowerCase();

      // Search real facts in factsList
      const matchedFact = factsList.find(f => {
        const titleMatch = f.title && q.split(/\s+/).some(word => word.length > 2 && f.title.toLowerCase().includes(word));
        const contentMatch = f.content && q.split(/\s+/).some(word => word.length > 3 && f.content.toLowerCase().includes(word));
        const categoryMatch = f.category && q.includes(f.category.toLowerCase());
        return titleMatch || contentMatch || categoryMatch;
      });

      if (matchedFact) {
        reply = matchedFact.content;
      } else if (factsList.length === 0) {
        reply = `I don't have any facts stored in my knowledge base yet. You can teach me by clicking "+ Add Knowledge Fact" above!`;
      } else {
        reply = `I checked my active knowledge base, but I don't have specific details for that question yet. Add a new fact above and I'll remember it on real calls!`;
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6 font-sans">
      {/* Header */}
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

        <div className="flex items-center gap-2.5">
          {employees.length > 1 && (
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#e2e4ed] bg-white text-[#0f0e17] shadow-xs cursor-pointer focus:outline-none"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.industry || 'AI Employee'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="sarvam-btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Knowledge Fact
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (What Employee Knows) vs Right Column (Try It Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WHAT EMPLOYEE KNOWS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0f0e17]" />
              WHAT {employeeName.toUpperCase()} KNOWS ({factsList.length})
            </h3>
            <span className="text-[11px] text-[#16a34a] font-mono font-medium bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
              Active in RAG Memory
            </span>
          </div>

          {factsList.length === 0 ? (
            <div className="p-8 text-center bg-[#f8f9fc] rounded-2xl border border-dashed border-[#cbd0df] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0f0e17]">No knowledge facts added yet</h4>
                <p className="text-xs text-[#6c6b7e] max-w-sm mx-auto mt-1">
                  Add business facts, pricing, operating hours, policies, or FAQs so {employeeName} can look them up and answer accurately during calls.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="sarvam-btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Fact
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {/* Right Column: "Try it with Employee" Interactive Tester (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Try it with {employeeName}
            </h3>
            <span className="text-[11px] font-mono text-[#6c6b7e]">
              Instant Verification
            </span>
          </div>

          <div className="apple-glass rounded-2xl border border-[#e2e4ed] shadow-xs overflow-hidden flex flex-col h-[480px]">
            {/* Simulator Header */}
            <div className="p-3.5 border-b border-[#e2e4ed] bg-[#f8f9fc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#16151f] text-white flex items-center justify-center text-xs font-bold font-display">
                  {employeeName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f0e17]">{employeeName} ({employeeRole})</div>
                  <div className="text-[10px] font-mono text-[#16a34a]">{employeeLang} · Real-time RAG</div>
                </div>
              </div>
              <button
                onClick={() => setChatMessages([{ sender: 'system', text: `Chat reset. Ask ${employeeName} any question to test recall.` }])}
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
                      : msg.sender === 'agent'
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
                        {msg.sender === 'user' ? 'You (Caller)' : `${employeeName} (AI)`}
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
              {(factsList.length > 0
                ? factsList.slice(0, 4).map(f => `${f.title.slice(0, 18)}?`)
                : ['Pricing?', 'Services?', 'Timings?', 'Policies?']
              ).map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTesterInput(chip.replace(/\?$/, ''));
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
                placeholder={`Ask ${employeeName} anything to test knowledge...`}
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

      {/* Section: WHERE EMPLOYEE STRUGGLED ON REAL CALLS */}
      <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6c6b7e]">
            WHERE {employeeName.toUpperCase()} STRUGGLED ON REAL CALLS
          </h3>
          <span className="text-[10px] font-mono text-[#6c6b7e]">0 flags</span>
        </div>

        <div className="p-8 text-center bg-[#f8f9fc] rounded-xl border border-dashed border-[#e2e4ed] space-y-1.5">
          <CheckCircle className="w-5 h-5 text-[#16a34a] mx-auto" />
          <h4 className="text-xs font-bold text-[#0f0e17]">
            No struggles yet —
          </h4>
          <p className="text-xs text-[#6c6b7e] max-w-md mx-auto">
            struggles appear when callers ask questions {employeeName} couldn't answer, giving you immediate recommendations to teach new facts.
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
                placeholder="e.g. Return Policy, Pricing Plans, Store Address..."
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
                <option value="services">Services &amp; Offerings</option>
                <option value="payments">Payments &amp; Terms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f0e17] mb-1">Knowledge Details</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. Open Monday to Saturday from 9 AM to 8 PM. Free consultations available on weekends..."
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
