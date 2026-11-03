import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configAttempt, setConfigAttempt] = useState(0);
  const googleButtonRef = useRef(null);

  // Email OTP state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpToken, setOtpToken] = useState('');

  const handleGoogleCredential = async (credential) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Google sign-in failed');
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role || 'client');
      onLoginSuccess(data.user);
      onClose();
    } catch {
      setError('Connection to authentication service failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setEmailLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send verification code');
        return;
      }
      setCodeSent(true);
      if (data.otpToken) {
        setOtpToken(data.otpToken);
      }
      if (data.code) {
        setSuggestedCode(data.code);
        setCode(data.code); // Auto-fill for friction-free sign-in
      }
    } catch {
      setError('Unable to send code. Please check your internet connection.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e) => {
    e?.preventDefault();
    if (!code || code.trim().length < 4) {
      setError('Please enter the verification code');
      return;
    }
    setEmailLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), otpToken })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid verification code');
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role || 'client');
      onLoginSuccess(data.user);
      onClose();
    } catch {
      setError('Connection to verification service failed.');
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCodeSent(false);
      setCode('');
      setError('');
      return undefined;
    }

    let cancelled = false;
    const setupGoogleSignIn = (clientId) => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => handleGoogleCredential(credential)
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: 340
        });
      } catch (err) {
        console.warn('Google sign-in render notice:', err);
      }
    };

    const loadGoogleIdentity = () => new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      let script = document.getElementById('google-identity-services');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-identity-services';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      const timeout = window.setTimeout(() => resolve(), 3000); // Soft timeout so email login remains active
      script.addEventListener('load', () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
      script.addEventListener('error', () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });

    fetch('/api/config')
      .then(response => response.ok ? response.json() : {})
      .then(config => {
        if (config.googleClientId) {
          return loadGoogleIdentity().then(() => setupGoogleSignIn(config.googleClientId));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (googleButtonRef.current) googleButtonRef.current.innerHTML = '';
    };
  }, [isOpen, configAttempt]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white p-7 sm:p-8 shadow-2xl border border-[#e8eaed] cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Heading */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 font-bold text-xl tracking-tight text-[#202124] font-display">
            SARVAM
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] shadow-xs shadow-[#ff7a00]/40"></span>
          </div>
          <h2 className="text-xl font-bold text-[#202124] font-display tracking-tight">
            Sign in to Voice Console
          </h2>
          <p className="text-xs text-[#5f6368]">
            Deploy autonomous multilingual AI telecallers across Indian languages
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign-In Container */}
          <div className="flex min-h-[44px] justify-center items-center" ref={googleButtonRef} aria-label="Continue with Google" />

          {loading && <p className="text-center text-xs text-[#5f6368] animate-pulse">Verifying Google identity…</p>}

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#e8eaed] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              or continue with email
            </span>
          </div>

          {!codeSent ? (
            <form onSubmit={handleSendEmailCode} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                  Work or Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dadce0] focus:border-[#7a50dc] focus:ring-2 focus:ring-[#7a50dc]/20 text-sm text-[#202124] outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-2.5 rounded-xl bg-[#0f0e17] hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {emailLoading ? 'Sending verification code…' : 'Continue with Email'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailCode} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-medium text-zinc-700">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="text-[11px] text-[#7a50dc] hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dadce0] focus:border-[#7a50dc] focus:ring-2 focus:ring-[#7a50dc]/20 text-sm text-[#202124] font-mono tracking-widest outline-none transition-all"
                  />
                </div>
                {suggestedCode && (
                  <div
                    onClick={() => setCode(suggestedCode)}
                    className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verification Code: <strong className="font-mono tracking-wider">{suggestedCode}</strong>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white/70 px-1.5 py-0.5 rounded">
                      Auto-Filled
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-2.5 rounded-xl bg-[#7a50dc] hover:bg-[#683cc9] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {emailLoading ? 'Verifying session…' : 'Verify & Enter Workspace'}
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-[#5f6368]">
            Secured with 256-bit JWT authentication &bull; Turso serverless storage
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-2 border-t border-[#e2e4ed]/60 text-[10.5px] text-[#6c6b7e]">
            <a href="https://docs.outpero.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0f0e17]">Help &amp; Docs</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#0f0e17]">Terms</a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#0f0e17]">Privacy</a>
            <a href="/refund" target="_blank" rel="noopener noreferrer" className="hover:text-[#0f0e17]">Refund</a>
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-[#0f0e17]">Contact</a>
            <a href="https://www.outpero.com/ai-employee" target="_blank" rel="noopener noreferrer" className="text-[#7a50dc] font-medium hover:underline">outpero.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
