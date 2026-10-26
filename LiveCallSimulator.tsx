import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface StageLatency {
  label: string;
  stageKey: string;
  budgetMs: number;
  exampleMs: number;
  engine: string;
  status: 'passed' | 'warning' | 'failed';
}

const STAGE_BUDGETS: StageLatency[] = [
  { label: 'Carrier Ingress', stageKey: 'carrier_in', budgetMs: 20, exampleMs: 18, engine: 'Example only', status: 'passed' },
  { label: 'Jitter Buffer', stageKey: 'jitter', budgetMs: 20, exampleMs: 14, engine: 'Example only', status: 'passed' },
  { label: 'Silence Endpoint', stageKey: 'silence', budgetMs: 100, exampleMs: 95, engine: 'Example only', status: 'passed' },
  { label: 'Turn Detector', stageKey: 'detector', budgetMs: 0, exampleMs: 0, engine: 'Example only', status: 'passed' },
  { label: 'Streaming ASR Tail', stageKey: 'asr', budgetMs: 40, exampleMs: 38, engine: 'Example only', status: 'passed' },
  { label: 'Orchestrator Core', stageKey: 'orchestrator', budgetMs: 6, exampleMs: 5, engine: 'Example only', status: 'passed' },
  { label: 'LLM TTFT First Token', stageKey: 'llm', budgetMs: 120, exampleMs: 115, engine: 'Example only', status: 'passed' },
  { label: 'Sentence Cut Stream', stageKey: 'sentence', budgetMs: 8, exampleMs: 6, engine: 'Example only', status: 'passed' },
  { label: 'TTS First Chunk', stageKey: 'tts', budgetMs: 80, exampleMs: 78, engine: 'Example only', status: 'passed' },
  { label: 'Edge to Carrier', stageKey: 'carrier_out', budgetMs: 20, exampleMs: 18, engine: 'Example only', status: 'passed' },
  { label: 'Playout Buffer', stageKey: 'playout', budgetMs: 26, exampleMs: 26, engine: 'Example only', status: 'passed' }
];

export const LiveCallSimulator: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [activeLang, setActiveLang] = useState<'te' | 'hi' | 'ta' | 'en'>('te');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bargeInTriggered, setBargeInTriggered] = useState(false);
  const [bargeInMs, setBargeInMs] = useState(142);
  const turns: Array<{ role: 'user' | 'assistant'; text: string; latency: number }> = [
    {
      role: 'assistant',
      text: 'నమస్కారం రాజేష్ గారు! సాయి మెడోస్ నుంచి ప్రియ మాట్లాడుతున్నాను. మీరు వెబ్సైట్లో చూసిన 3 BHK ఈస్ట్ ఫేసింగ్ అపార్ట్‌మెంట్ వివరాలు చెప్పమంటారా?',
      latency: 412
    }
  ];

  const stages = STAGE_BUDGETS;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exampleTurnaround = stages.reduce((acc, stage) => acc + stage.exampleMs, 0);

  // Handle call timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  const handleStartCall = () => {
    setCallDuration(0);
    setIsCalling(true);
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2800);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setCallDuration(0);
    setIsSpeaking(false);
    setBargeInTriggered(false);
  };

  const handleBargeIn = () => {
    if (!isSpeaking) return;
    setBargeInTriggered(true);
    const flushTime = 142; // measured p95 target <= 150ms
    setBargeInMs(flushTime);
    setIsSpeaking(false);

    setTimeout(() => {
      setBargeInTriggered(false);
    }, 2000);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-[1160px] mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header & Stage Budget Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e4ed]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold text-[#0f0e17] tracking-[-0.02em] font-display">
              Voice Pipeline Demo
            </h1>
            <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
              SIMULATED
            </span>
          </div>
          <p className="text-[15px] text-[#6c6b7e] mt-0.5">
            Interactive UI demo only. No call is placed, no providers are connected, and the displayed timings are examples—not measurements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center p-1 bg-[#f0f1f6] rounded-xl border border-[#e2e4ed]">
            {(['te', 'hi', 'ta', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setActiveLang(l)}
                className={cn(
                  'px-3 py-1 text-[13px] font-medium rounded-lg transition-all min-h-[32px] cursor-pointer',
                  activeLang === l
                    ? 'bg-white text-[#0f0e17] shadow-xs font-semibold'
                    : 'text-[#6c6b7e] hover:text-[#0f0e17]'
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Demo Toggle Button */}
          {isCalling ? (
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[13px] font-semibold transition-all min-h-[44px] shadow-sm cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              End Demo ({formatTimer(callDuration)})
            </button>
          ) : (
            <button
              onClick={handleStartCall}
              className="flex items-center gap-2 px-5 py-2 bg-[#0f0e17] hover:bg-[#1f1e28] text-white rounded-xl text-[13px] font-semibold transition-all min-h-[44px] shadow-sm cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              Start Demo
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Audio Session & Real-Time Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Demo Controls & Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="apple-glass rounded-2xl p-6 border border-[#e2e4ed] relative overflow-hidden shadow-xs">
            {/* Call State Pill */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  isCalling ? (isSpeaking ? 'bg-[#16a34a] animate-pulse' : 'bg-[#16a34a]') : 'bg-black/20'
                )} />
                <span className="text-[13px] font-semibold text-[#0f0e17]">
                  {isCalling ? (isSpeaking ? 'Demo Speaking' : 'Demo Paused') : 'Demo Ready'}
                </span>
              </div>
              <div className="text-[13px] font-mono text-[#6c6b7e]">
                Sample audio format • 16kHz PCM
              </div>
            </div>

            {/* Audio Wave Visualizer using Motion Spring Physics */}
            <div className="h-32 flex items-center justify-center gap-1.5 px-4 bg-[#f8f9fc] rounded-xl border border-[#e2e4ed] mb-6">
              {[35, 60, 45, 90, 70, 100, 85, 40, 65, 95, 50, 80, 60, 40].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isSpeaking ? [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] : '16%'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    repeat: isSpeaking ? Infinity : 0,
                    repeatType: 'reverse',
                    delay: i * 0.05
                  }}
                  className={cn(
                    'w-1.5 rounded-full transition-colors',
                    isSpeaking ? 'bg-[#0f0e17]' : 'bg-[#e2e4ed]'
                  )}
                />
              ))}
            </div>

            {/* Agent Info & Barge-In Trigger */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e2e4ed]">
              <div>
                <div className="text-[15px] font-semibold text-[#0f0e17]">
                  {activeLang === 'te' ? 'Priya (Telugu)' : activeLang === 'hi' ? 'Aarav (Hindi)' : 'Vikram (English)'}
                </div>
                <div className="text-[13px] text-[#6c6b7e]">
                  Example voice configuration (not connected)
                </div>
              </div>

              {/* Barge-In Cutoff Button (min 44px hit target) */}
              <button
                disabled={!isCalling}
                onClick={handleBargeIn}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all min-h-[44px]',
                  isCalling
                    ? 'bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa] cursor-pointer'
                    : 'bg-[#f0f1f6] text-[#6c6b7e] border border-[#e2e4ed] cursor-not-allowed'
                )}
              >
                <Zap className="w-4 h-4 text-[#ea580c]" />
                Simulate Barge-In
              </button>
            </div>

            {/* Barge-In Telemetry Alert */}
            <AnimatePresence>
              {bargeInTriggered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[13px] text-[#16a34a] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                    <span className="font-semibold">Simulated barge-in</span>
                  </div>
                  <span className="font-mono font-bold text-[#16a34a]">Example: {bargeInMs} ms (not measured)</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sample Turn Stream */}
          <div className="apple-glass rounded-2xl p-5 border border-[#e2e4ed] shadow-xs">
            <div className="flex items-center justify-between mb-3 text-[13px] font-semibold text-[#6c6b7e] uppercase tracking-wider">
              <span>Conversational Turns</span>
              <span className="font-mono text-[11px] text-[#0f0e17] font-bold">Local demo</span>
            </div>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {turns.map((t, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-3 rounded-xl text-[13px] leading-relaxed',
                    t.role === 'assistant'
                      ? 'bg-[#f8f9fc] border border-[#e2e4ed] text-[#0f0e17]'
                      : 'bg-[#f6f7fb] border border-[#e2e4ed] text-[#0f0e17]'
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#6c6b7e] mb-1 font-mono">
                    <span className="font-semibold text-[#0f0e17]">{t.role === 'assistant' ? 'AI Voice Agent' : 'Customer'}</span>
                    <span>{t.latency} ms example</span>
                  </div>
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Example Stage Timings */}
        <div className="lg:col-span-7 apple-glass rounded-2xl p-6 border border-[#e2e4ed] shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#e2e4ed]">
            <div>
              <div className="text-[17px] font-semibold text-[#0f0e17]">
                Example Stage Timings
              </div>
              <div className="text-[13px] text-[#6c6b7e]">
                Illustrative values only; no RTP session or live telemetry is connected.
              </div>
            </div>

            <div className="text-right">
              <div className="text-[22px] font-semibold font-mono text-[#16a34a]">
                {exampleTurnaround} ms
              </div>
              <div className="text-[11px] text-[#6c6b7e] font-mono">
                Example total
              </div>
            </div>
          </div>

          {/* Interactive Waterfall Rows */}
          <div className="space-y-2.5">
            {stages.map((stage) => {
              const pct = Math.min(100, Math.max(8, (stage.exampleMs / 120) * 100));
              return (
                <div
                  key={stage.stageKey}
                  className="p-2.5 rounded-xl bg-white/70 border border-[#e2e4ed] hover:border-[#e2e4ed] transition-all"
                >
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#0f0e17]">{stage.label}</span>
                      <span className="text-[11px] text-[#6c6b7e] font-mono bg-[#f8f9fc] px-2 py-0.5 rounded border border-[#e2e4ed]">
                        {stage.engine}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[13px]">
                      <span className="text-[#6c6b7e]">Budget: {stage.budgetMs}ms</span>
                      <span className="font-semibold text-[#0f0e17] w-14 text-right">
                        {stage.exampleMs} ms
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar with Spring Motion */}
                  <div className="w-full bg-[#e2e4ed] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className={cn(
                        'h-full rounded-full',
                        stage.exampleMs <= stage.budgetMs ? 'bg-[#16a34a]' : 'bg-rose-500'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hard Target Compliance Guard */}
          <div className="mt-6 p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#16a34a]" />
              <div>
                <div className="text-[13px] font-semibold text-[#0f0e17]">
                  No production SLO verified
                </div>
                <div className="text-[11px] text-[#3a3f5c]">
                  These sample values do not reflect a deployed carrier, media path, or measured user traffic.
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#16a34a] bg-white px-2 py-1 rounded border border-[#bbf7d0]">
              DEMO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
