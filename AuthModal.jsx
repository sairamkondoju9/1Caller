import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configAttempt, setConfigAttempt] = useState(0);
  const googleButtonRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    const setupGoogleSignIn = (clientId) => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => handleGoogleCredential(credential)
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 360
      });
    };

    const loadGoogleIdentity = () => new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      let script = document.getElementById('google-identity-services');
      if (script?.dataset.loaded === 'true') {
        reject(new Error('Google sign-in did not initialize. Check the authorized origins in Google Cloud.'));
        return;
      }
      const isNewScript = !script;
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-identity-services';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
      }
      const timeout = window.setTimeout(() => reject(new Error('Google sign-in could not load. Check network/content blockers and retry.')), 10000);
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        window.clearTimeout(timeout);
        window.google?.accounts?.id ? resolve() : reject(new Error('Google sign-in loaded without initializing.'));
      }, { once: true });
      script.addEventListener('error', () => {
        window.clearTimeout(timeout);
        reject(new Error('Google sign-in script failed to load. Check network/content blockers and retry.'));
      }, { once: true });
      if (isNewScript) document.head.appendChild(script);
    });

    setError('');
    fetch('/api/config')
      .then(response => {
        if (!response.ok) throw new Error(`Sign-in configuration failed (${response.status}).`);
        return response.json();
      })
      .then(config => {
        if (!config.hasPersistentDatabase) {
          throw new Error('Sign-in is unavailable because this deployment has no persistent account database. Configure Turso and redeploy.');
        }
        if (!config.hasGoogleAuth || !config.googleClientId) {
          throw new Error('Google sign-in is not configured on this deployment. Add GOOGLE_CLIENT_ID in the deployment environment and redeploy.');
        }
        return loadGoogleIdentity().then(() => setupGoogleSignIn(config.googleClientId));
      })
      .catch(error => {
        if (!cancelled) setError(error.message || 'Unable to initialize Google sign-in.');
      });

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
      {/* Google Stitch Design System Modal Card */}
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
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 font-bold text-xl tracking-tight text-[#202124] font-display">
            SARVAM
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] shadow-xs shadow-[#ff7a00]/40"></span>
          </div>
          <h2 className="text-xl font-bold text-[#202124] font-display tracking-tight">
            Sign in to Voice Console
          </h2>
          <p className="text-xs text-[#5f6368]">
            Deploy autonomous voice AI employees across 22 Indian languages
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Single Google Sign-In Button */}
          <div className="flex min-h-11 justify-center" ref={googleButtonRef} aria-label="Continue with Google" />

          {loading && <p className="text-center text-xs text-[#5f6368]">Verifying your Google account…</p>}
          {error && (
            <button type="button" onClick={() => setConfigAttempt(attempt => attempt + 1)} className="mx-auto block text-xs font-semibold text-[#1a73e8] hover:underline">
              Retry Google sign-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
