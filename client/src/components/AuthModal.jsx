import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
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
      setError('Please enter a valid work or personal email');
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
        setCode(data.code); // Friction-free 1-click verify
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
      setError('Please enter the 6-digit verification code');
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

    const loadGoogleIdentity = () => new Promise((resolve) => {
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
      const timeout = window.setTimeout(() => resolve(), 3000);
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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] bg-white p-7 sm:p-8 shadow-2xl border border-[#e2e4ed] cursor-default font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full text-[#6c6b7e] hover:text-[#0f0e17] hover:bg-[#f6f7fb] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Outpero Official Header */}
        <div className="text-center mb-5">
          <img
            src="/outpero-wordmark-black.svg"
            alt="Outpero"
            className="h-7 w-auto mx-auto block mb-2.5"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/outpero-wordmark.png';
            }}
          />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold tracking-[0.16em] uppercase text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI phone employees
          </div>
          <div className="h-px bg-[#e2e4ed] my-4" />
          <h2 className="font-display font-semibold text-[19px] tracking-tight text-[#0f0e17] mb-1 text-center">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-[#6c6b7e] text-[13.5px] leading-relaxed text-center">
            {mode === 'signin' ? 'Manage your AI employees and calls.' : 'Free trial credits included, no card needed to start.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign-In Container */}
          <div className="flex min-h-[44px] justify-center items-center" ref={googleButtonRef} aria-label="Continue with Google">
            <button
              type="button"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#dadce0] hover:bg-zinc-50 bg-white flex items-center justify-center gap-3 font-semibold text-xs text-zinc-800 shadow-xs transition-all cursor-pointer"
            >
              <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 000 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#e2e4ed] w-full" />
            <span className="bg-white px-3 text-[11.5px] font-semibold text-[#6c6b7e] uppercase tracking-wide shrink-0">
              or use email
            </span>
          </div>

          {!codeSent ? (
            <form onSubmit={handleSendEmailCode} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#0f0e17] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9392a5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dadce0] focus:border-[#7a50dc] focus:ring-2 focus:ring-[#7a50dc]/20 text-sm text-[#0f0e17] outline-none transition-all placeholder:text-[#9392a5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-2.5 rounded-xl bg-[#0f0e17] hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {emailLoading ? 'Sending verification code…' : (mode === 'signup' ? 'Create free account' : 'Continue with Email')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-1">
                {mode === 'signin' ? (
                  <p className="text-xs text-[#6c6b7e]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-semibold text-[#7a50dc] hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#6c6b7e]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="font-semibold text-[#7a50dc] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailCode} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-semibold text-[#0f0e17]">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="text-[11px] font-medium text-[#7a50dc] hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9392a5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dadce0] focus:border-[#7a50dc] focus:ring-2 focus:ring-[#7a50dc]/20 text-sm text-[#0f0e17] font-mono tracking-widest outline-none transition-all"
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
                className="w-full py-2.5 rounded-xl bg-[#7a50dc] hover:bg-[#683cc9] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {emailLoading ? 'Verifying session…' : 'Verify & Enter Workspace'}
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-[#6c6b7e]">
            Secured with 256-bit JWT authentication &bull; Turso serverless storage
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-3 border-t border-[#e2e4ed] text-[10.5px] text-[#6c6b7e]">
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
