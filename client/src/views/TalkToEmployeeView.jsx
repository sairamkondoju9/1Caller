import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  Zap,
  Activity,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Radio,
  Send,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function TalkToEmployeeView({ employee }) {
  const [isCalling, setIsCalling] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState('sarvam'); // 'sarvam' | 'cartesia'
  const [selectedLang, setSelectedLang] = useState('te');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isBargedIn, setIsBargedIn] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const [connectionError, setConnectionError] = useState('');
  const wsRef = useRef(null);

  // Live Turn Telemetry
  const [latestWaterfall, setLatestWaterfall] = useState(null);

  // Connect WebSocket
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setConnectionState('disconnected');
        setConnectionError('Sign in to connect to the voice test.');
        return undefined;
      }

      let ws;
      let cancelled = false;
      fetch('/api/config').then(response => response.json()).then(config => {
        if (cancelled) return;
        if (!config.voiceWebSocketUrl) {
          setConnectionState('disconnected');
          setConnectionError('Voice testing is not configured for this deployment. A persistent VOICE_WS_URL service is required; the web server cannot host voice sessions here.');
          return;
        }
        const wsUrl = new URL(config.voiceWebSocketUrl);
        if (wsUrl.protocol !== 'wss:' && window.location.protocol === 'https:') {
          throw new Error('Voice gateway must use a secure wss:// URL.');
        }
        wsUrl.searchParams.set('token', token);
        if (employee?.id) wsUrl.searchParams.set('employeeId', employee.id);
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionState('connected');
          setConnectionError('');
        };
        ws.onerror = () => {
          setConnectionState('disconnected');
          setConnectionError('Voice gateway connection failed. Check VOICE_WS_URL service health and try again.');
        };
        ws.onclose = (event) => {
          setConnectionState('disconnected');
          if (event.code === 1008) setConnectionError(event.reason || 'Voice session could not be authorized.');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === 'session.ready') {
              setMessages([{ speaker: 'System', text: `Connected to ${msg.employee?.name || 'your employee'}. Send a message to start a test turn.` }]);
            }
            if (msg.event === 'turn.completed') {
              setMessages((prev) => [...prev, { speaker: 'AI', text: msg.turn.text, engine: msg.turn.engine }]);
              if (msg.turn.waterfall) setLatestWaterfall(msg.turn.waterfall);
            } else if (msg.event === 'turn.latency') {
              setLatestWaterfall(msg.waterfall);
            } else if (msg.event === 'barge_in.detected') {
              setIsBargedIn(true);
              setTimeout(() => setIsBargedIn(false), 2000);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }).catch(error => {
        if (!cancelled) {
          setConnectionState('disconnected');
          setConnectionError(error.message || 'Could not load voice gateway configuration.');
        }
      });

      return () => {
        cancelled = true;
        ws?.close();
      };
    } catch (err) {
      console.error(err);
    }
  }, [employee?.id]);

  const handleSendMessage = (customText) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setMessages((prev) => [...prev, { speaker: 'User', text: textToSend }]);
      setInputText('');
      wsRef.current.send(JSON.stringify({
        action: 'user_speech',
        text: textToSend,
        engine: selectedEngine,
        language: selectedLang
      }));
    } else {
      setConnectionError('The voice gateway is not connected. Your message was not sent.');
    }
  };

  const handleTriggerBargeIn = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'barge_in' }));
    } else {
      setIsBargedIn(true);
      setTimeout(() => setIsBargedIn(false), 2000);
    }
  };

  return (
    <div className="p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 font-mono">
            Voice Quality &amp; Latency Lab
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight flex items-center gap-2 font-display">
            Talk to an employee
            <span className="text-xs bg-[#f6f7fb] text-[#0f0e17] px-2.5 py-0.5 rounded-full font-bold border border-[#e2e4ed]">
              Text-to-audio test
            </span>
          </h1>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Test a text-driven conversation and audio synthesis through the configured voice gateway. This does not place a phone call.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Engine Selector Segmented Control (Apple Duo Style) */}
          <div className="flex items-center bg-[#f0f1f6] p-1 rounded-xl border border-[#e2e4ed]">
            <button
              onClick={() => {
                setSelectedEngine('sarvam');
                setSelectedLang('te');
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ action: 'change_language', language: 'te' }));
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedEngine === 'sarvam'
                  ? 'bg-white text-[#0f0e17] shadow-xs'
                  : 'text-[#6c6b7e] hover:text-[#0f0e17]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0f0e17]" />
              <span>Sarvam Bulbul V4 (Telugu/Indic)</span>
            </button>
            <button
              onClick={() => {
                setSelectedEngine('cartesia');
                setSelectedLang('en');
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ action: 'change_language', language: 'en' }));
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedEngine === 'cartesia'
                  ? 'bg-white text-[#0f0e17] shadow-xs'
                  : 'text-[#6c6b7e] hover:text-[#0f0e17]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Cartesia Sonic-2 (English/Hindi)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
            <Radio className="w-3.5 h-3.5 text-[#16a34a] animate-pulse" />
            Media Gateway: {connectionState === 'connected' ? 'Connected' : connectionState === 'connecting' ? 'Connecting…' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {connectionError && <div role="alert" className="lg:col-span-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{connectionError}</div>}
        {/* Left Column: Call Simulator & Transcript */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Visualizer & Audio Room (Apple Liquid Glass Stage Card) */}
          <div className="apple-glass-stage rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-white/10">
            {/* Top Employee Info */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f0e17] text-white font-bold flex items-center justify-center text-sm shadow-xs border border-white/15">
                  {employee?.name ? employee.name.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">{employee?.name || 'Priya - Real Estate Executive'}</h4>
                  <p className="text-[11px] text-[#cbd0df] font-mono">Telugu + English · Sarvam Bulbul V4 Flash / Cartesia Sonic-2</p>
                </div>
              </div>

              {/* Barge-In Alert Banner */}
              {isBargedIn && (
                <div className="bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] text-xs px-3 py-1 rounded-full font-bold animate-pulse flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#ea580c]" /> Barge-in triggered (142ms flush)
                </div>
              )}
            </div>

            {/* Conversation Messages Viewport */}
            <div className="h-64 overflow-y-auto space-y-3 pr-2 mb-4">
              {messages.length === 0 && <p className="text-center text-xs text-white/60">Connect to your employee to begin a test conversation.</p>}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.speaker === 'AI'
                        ? 'bg-[#1e1b4b]/80 text-white border border-white/15'
                        : 'bg-[#0f0e17] text-white shadow-xs'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-white/50 mb-1 flex items-center justify-between gap-4 font-mono">
                      <span>{msg.speaker === 'AI' ? 'AI Employee (Speaking)' : 'You (Customer)'}</span>
                      {msg.engine && <span className="text-[#cbd0df]">{msg.engine}</span>}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Audio Waveform Animation Simulation */}
            <div className="flex items-center justify-center gap-1.5 h-6 mb-4">
              {[4, 12, 18, 24, 16, 28, 20, 14, 8, 22, 18, 12, 6, 16, 20, 10].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1 bg-[#3a3f5c] rounded-full animate-pulse opacity-80"
                />
              ))}
            </div>

            {/* In-Call Controls Bar */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type what customer says (or speak)..."
                className="flex-1 bg-[#1e1b4b]/80 border border-white/15 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#0f0e17] placeholder-white/40 font-normal"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Speak
              </button>
              <button
                onClick={handleTriggerBargeIn}
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Interrupt AI speaking mid-sentence"
              >
                <Zap className="w-3.5 h-3.5" /> Barge-in
              </button>
            </div>

            {/* Quick Test Utterances */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap">
              <span className="text-[10px] text-white/50 font-bold uppercase font-mono">Quick test:</span>
              {[
                "3 BHK price entha undachu?",
                "Sunday morning 11 AM ki site visit chestanu.",
                "Can you send details on WhatsApp?",
                "Do not call me again (Opt-out test)"
              ].map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(phrase)}
                  className="text-[11px] bg-white/10 hover:bg-white/15 text-white/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Measured text-to-audio timings */}
        <div className="space-y-4">
          <div className="apple-glass rounded-2xl p-5.5 space-y-4 border border-[#e2e4ed]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e4ed]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f0e17] flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-[#0f0e17]" /> Text-to-audio timings
              </h3>
              <span className="text-[11px] font-bold text-[#6c6b7e] bg-[#f6f7fb] px-2 py-0.5 rounded-full border border-[#e2e4ed] font-mono">
                Measured
              </span>
            </div>

            {/* Total Metric Card */}
            <div className="bg-[#f8f9fc] rounded-2xl p-4 text-center border border-[#e2e4ed]">
              <div className="text-3xl font-extrabold text-[#0f0e17] tracking-tight font-mono">
                {latestWaterfall?.serverProcessingMs ?? '—'} <span className="text-sm font-semibold text-[#6c6b7e]">{latestWaterfall ? 'ms' : 'no test yet'}</span>
              </div>
              <div className="text-xs font-semibold flex items-center justify-center gap-1 mt-1 text-[#6c6b7e]">
                {latestWaterfall ? 'Server processing only; excludes speech recognition, network, and carrier time.' : 'Timing appears after a completed test turn.'}
              </div>
            </div>

            {/* Granular Latency Breakdown Table */}
            <div className="space-y-2.5 text-xs">
              {[
                { stage: 'LLM response', ms: latestWaterfall?.llmResponseMs },
                { stage: `${latestWaterfall?.ttsEngine || 'TTS'} request`, ms: latestWaterfall?.ttsRequestMs },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[#3a3f5c]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0f0e17]" />
                    <span className="text-[11px] truncate max-w-[170px]">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] font-bold text-[#0f0e17]">{item.ms == null ? '—' : `${item.ms}ms`}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Measurement scope */}
            <div className="p-3 bg-[#f6f7fb] rounded-xl text-[11px] text-[#3a3f5c] border border-[#e2e4ed] leading-relaxed">
              Timings are measured for this server-side text-to-audio request. Streaming ASR, telephony, and end-to-end call latency are not part of this test.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
