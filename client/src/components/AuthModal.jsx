import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [useOtp, setUseOtp] = useState(false);
  const googleButtonRef = useRef(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState('');
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

  const handleEmailAuth = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work or personal email');
      return;
    }

    if (useOtp) {
      if (!codeSent) {
        // Send OTP
        return handleSendEmailCode();
      }
      // Verify OTP
      return handleVerifyEmailCode();
    }

    // Direct password authentication
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to sign in. Please verify your credentials.');
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role || 'client');
      onLoginSuccess(data.user);
      onClose();
    } catch {
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    setLoading(true);
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
      if (data.otpToken) setOtpToken(data.otpToken);
      if (data.code) {
        setSuggestedCode(data.code);
        setCode(data.code);
      }
    } catch {
      setError('Unable to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!code || code.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setLoading(true);
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
      setError('Unable to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // Google SDK integration
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const setupGoogle = (clientId) => {
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
        console.warn('Google button init notice:', err);
      }
    };

    fetch('/api/config')
      .then(r => r.ok ? r.json() : {})
      .then(cfg => {
        if (cfg.googleClientId && window.google?.accounts?.id) {
          setupGoogle(cfg.googleClientId);
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] p-4 sm:p-6 overflow-y-auto cursor-pointer animate-fadeIn font-sans"
    >
      {/* Centered White Card (Pixel-perfect clone of app.outpero.com) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-[28px] border border-zinc-200/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.07)] p-8 sm:p-9 text-left relative cursor-default transition-all"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* OUTPERO Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center text-[28px] font-black tracking-[-0.04em] text-zinc-900 font-display select-none">
            <span>OUTPER</span>
            <span className="text-[#8b5cf6] font-extrabold ml-[0.5px]">O</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>AI PHONE EMPLOYEES</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-[19px] font-bold text-zinc-900 font-display tracking-tight">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-[13px] text-zinc-500 mt-1">
            {mode === 'signin' ? 'Manage your AI employees and calls.' : 'Free trial credits included, no card needed.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Continue with Google */}
        <div className="space-y-4">
          <div className="flex min-h-[44px] justify-center items-center" ref={googleButtonRef}>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setError('Google Sign-In is initializing. You can also sign in with email below.');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200/90 bg-[#f3f4f6] hover:bg-[#e5e7eb] flex items-center justify-center gap-3 text-[13px] font-semibold text-zinc-800 transition-all cursor-pointer shadow-2xs"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 000 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* OR USE EMAIL Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10.5px] font-semibold text-zinc-400 uppercase tracking-widest shrink-0">
              OR USE EMAIL
            </span>
          </div>

          {/* Email + Password / OTP Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-zinc-800 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:border-[#6e44ff] focus:ring-2 focus:ring-[#6e44ff]/15 text-[13.5px] text-zinc-900 outline-none transition-all placeholder:text-zinc-400 shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12.5px] font-medium text-zinc-800">
                  {useOtp ? 'Verification Code' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseOtp(!useOtp);
                    setError('');
                    if (!useOtp && email && email.includes('@')) {
                      handleSendEmailCode();
                    }
                  }}
                  className="text-[12px] font-medium text-[#6e44ff] hover:underline cursor-pointer"
                >
                  {useOtp ? 'Use password instead' : 'Forgot password?'}
                </button>
              </div>

              {useOtp ? (
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit verification code"
                    maxLength={6}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:border-[#6e44ff] focus:ring-2 focus:ring-[#6e44ff]/15 text-[13.5px] text-zinc-900 font-mono tracking-widest outline-none transition-all placeholder:text-zinc-400 shadow-2xs"
                  />
                  {suggestedCode && (
                    <div
                      onClick={() => setCode(suggestedCode)}
                      className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Code: <strong className="font-mono tracking-wider">{suggestedCode}</strong>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white/70 px-1.5 py-0.5 rounded">
                        Auto-Filled
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:border-[#6e44ff] focus:ring-2 focus:ring-[#6e44ff]/15 text-[13.5px] text-zinc-900 outline-none transition-all placeholder:text-zinc-400 shadow-2xs"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#6e44ff] hover:bg-[#5f35eb] text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-purple-500/25 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : (mode === 'signup' ? 'Create an account' : 'Sign in')}
            </button>
          </form>

          {/* New here? Create an account */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-[12.5px] text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
            >
              {mode === 'signin' ? (
                <>New here? <span className="font-semibold text-zinc-800 hover:underline">Create an account</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-zinc-800 hover:underline">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links outside the card (Exact match to app.outpero.com) */}
      <div className="flex items-center justify-center gap-4 text-[11.5px] text-zinc-400 mt-8 select-none">
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Terms</a>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Privacy</a>
        <a href="/refund" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Refund</a>
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Legal Centre</a>
        <a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">Contact</a>
      </div>
    </div>
  );
}
