import { apiFetch } from '../utils/api.js';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * High-Performance Cross-Browser Indian Speech Recognition & Fast Transcriber Hook.
 * Supports:
 * - Telugu (te-IN) - తెలుగు
 * - Tamil (ta-IN) - தமிழ்
 * - Hindi (hi-IN) - हिन्दी
 * - English (en-IN) - Indian English
 *
 * Combines zero-latency native Web Speech streaming with Groq Whisper Turbo LPU backend fallback.
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [lang, setLang] = useState('te-IN'); // Default to Telugu as requested
  const [isTranscribingServer, setIsTranscribingServer] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);
  const onTranscriptRef = useRef(null);
  const baseTextRef = useRef('');
  const lastTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    const hasMedia = typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia;
    if (!SpeechRecognition && !hasMedia) {
      setIsSupported(false);
    }
  }, []);

  const sendToServerTranscribe = async (audioBlob, language, currentBase) => {
    try {
      setIsTranscribingServer(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result;
          const langCode = (language || 'te').slice(0, 2);
          const response = await apiFetch('/api/transcribe', {
            method: 'POST',
            body: JSON.stringify({
              audioBase64: base64Audio,
              language: langCode,
              mimeType: audioBlob.type || 'audio/webm'
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.text && data.text.trim()) {
              const fullText = currentBase ? `${currentBase} ${data.text.trim()}` : data.text.trim();
              if (onTranscriptRef.current) {
                onTranscriptRef.current(fullText, {
                  final: data.text.trim(),
                  interim: '',
                  raw: data.text.trim(),
                  source: 'whisper-turbo'
                });
              }
            }
          }
        } catch (e) {
          console.warn('Server transcribe error:', e);
        } finally {
          setIsTranscribingServer(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.warn('sendToServerTranscribe failed:', err);
      setIsTranscribingServer(false);
    }
  };

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    
    // Stop Web Speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    // Stop Media Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    // Release mic stream tracks
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async ({ onTranscript, initialText = '', language = lang } = {}) => {
      const SpeechRecognition =
        typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition);

      setError(null);
      setPermissionBlocked(false);
      isManuallyStoppedRef.current = false;
      onTranscriptRef.current = onTranscript;
      baseTextRef.current = initialText ? initialText.trim() : '';
      lastTranscriptRef.current = '';
      audioChunksRef.current = [];

      // Start MediaRecorder for backup Whisper Turbo Indian transcription
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm';
          const recorder = new MediaRecorder(stream, { mimeType: mime });
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: mime });
              // If client speech produced no text or user chose server transcriber
              if (!lastTranscriptRef.current) {
                sendToServerTranscribe(audioBlob, language, baseTextRef.current);
              }
            }
          };

          recorder.start(250);
        } catch (mediaErr) {
          console.warn('Microphone stream access error:', mediaErr);
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            setPermissionBlocked(true);
            setError('Microphone permission blocked. Click the lock/mic icon in your address bar to allow microphone access.');
            setIsListening(false);
            return;
          }
        }
      }

      // If Web Speech API is supported, run live streaming
      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch (e) {}
          }

          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;

          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language || 'te-IN';
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
            setError(null);
          };

          recognition.onresult = (event) => {
            let accumulatedFinal = '';
            let interimTranscript = '';

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                accumulatedFinal += res[0].transcript + ' ';
              } else {
                interimTranscript += res[0].transcript;
              }
            }

            const base = baseTextRef.current;
            let combined = base;

            if (accumulatedFinal || interimTranscript) {
              const spoken = (accumulatedFinal + interimTranscript).trim();
              if (spoken) {
                combined = base ? `${base} ${spoken}` : spoken;
                lastTranscriptRef.current = spoken;
              }
            }

            if (onTranscriptRef.current) {
              onTranscriptRef.current(combined, {
                interim: interimTranscript,
                final: accumulatedFinal,
                raw: (accumulatedFinal + interimTranscript).trim(),
                source: 'web-speech'
              });
            }
          };

          recognition.onerror = (event) => {
            console.warn('SpeechRecognition error:', event.error, event);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setPermissionBlocked(true);
              setError(
                'Microphone access was blocked. Please click the lock or camera/mic icon in your browser URL bar, allow Microphone access, and try again.'
              );
              stopListening();
            } else if (event.error === 'no-speech') {
              // Ignore brief silence
            } else if (event.error === 'audio-capture') {
              setError('No microphone found. Please connect a microphone and try again.');
              stopListening();
            } else if (event.error === 'network') {
              // Fallback to mediaRecorder / Groq Whisper
              console.log('Falling back to Whisper Turbo transcriber on network issue');
            }
          };

          recognition.onend = () => {
            if (!isManuallyStoppedRef.current && !permissionBlocked) {
              setIsListening(false);
            } else {
              setIsListening(false);
            }
          };

          recognition.start();
          setIsListening(true);
        } catch (err) {
          console.warn('Web Speech API start error, fallback to recorder:', err);
        }
      } else {
        // If no Web Speech API, media recorder is running and will transcribe on stop
        setIsListening(true);
      }
    },
    [lang, stopListening, permissionBlocked]
  );

  const toggleListening = useCallback(
    ({ onTranscript, initialText = '', language = lang } = {}) => {
      if (isListening) {
        stopListening();
      } else {
        startListening({ onTranscript, initialText, language });
      }
    },
    [isListening, startListening, stopListening, lang]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    permissionBlocked,
    lang,
    setLang,
    isTranscribingServer,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null)
  };
}
