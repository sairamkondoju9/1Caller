import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Zap,
  Megaphone,
  PhoneIncoming,
  Play,
  Square,
  ArrowRight,
  ChevronDown,
  Globe,
  Mic,
  ShieldCheck,
  Building2,
  Stethoscope,
  Car,
  BadgeCheck,
  Check,
  MessageCircle,
  Clock,
  Lock,
  Braces,
  PhoneOutgoing,
  MapPin,
  Volume2,
  RefreshCcw,
  Gauge,
  Wallet,
  Menu,
  X
} from 'lucide-react';

export default function LandingPageView({ onLaunchConsole, onTalkToAgent, onOpenAuth }) {
  // Rotating word state in Hero
  const rotatingWords = [
    { word: 'नमस्ते', lang: 'hi' },
    { word: 'నమస్కారం', lang: 'te' },
    { word: 'வணக்கம்', lang: 'ta' },
    { word: 'ನಮಸ್ಕಾರ', lang: 'kn' },
    { word: 'നമസ്കാരം', lang: 'ml' },
    { word: 'नमस्कार', lang: 'mr' },
    { word: 'Hello', lang: 'en' }
  ];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Hero interactive prompt state
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [bottomBrandMask, setBottomBrandMask] = useState('sarvam');
  const [promptText, setPromptText] = useState('');

  const samplePrompts = [
    { label: 'Remind about renewals', text: 'Call policyholders whose car insurance expires in 7 days, verify policy number, and offer 10% renewal discount.' },
    { label: 'Call new property leads', text: 'Qualify prospective home buyers for 2BHK and 3BHK flats, discover budget and schedule a site visit for Saturday 11 AM.' },
    { label: 'Remind patients', text: "Confirm tomorrow's dental appointments, remind patients to arrive 15 minutes early and bring past X-ray reports." },
    { label: 'Wake up an old list', text: 'Re-engage past leads who enquired 6 months ago, check if they are still looking and offer our new festive pricing.' },
    { label: 'Book test drives', text: 'Follow up with EV car enquiry leads, offer home test drive slot this weekend and share brochure on WhatsApp.' }
  ];

  // Section 2: "How it works" language state & transcripts
  const languagesList = [
    { id: 'hi', label: 'हिन्दी', name: 'Hindi' },
    { id: 'te', label: 'తెలుగు', name: 'Telugu' },
    { id: 'ta', label: 'தமிழ்', name: 'Tamil' },
    { id: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { id: 'ml', label: 'മലയാളം', name: 'Malayalam' },
    { id: 'mr', label: 'मराठी', name: 'Marathi' },
    { id: 'en', label: 'English', name: 'English' }
  ];
  const [activeHowLang, setActiveHowLang] = useState('hi');

  const transcriptsByLang = {
    hi: [
      { sender: 'ai', text: 'नमस्ते अमन जी! मैं मीरा, Nest Realty से। आपने Sector 150 में 2BHK के बारे में जानकारी मांगी थी। क्या अभी दो मिनट बात कर सकते हैं?' },
      { sender: 'user', text: 'हाँ जी, बताइए।' },
      { sender: 'ai', text: 'आप घर में रहने के लिए देख रहे हैं या निवेश के लिए?' },
      { sender: 'user', text: 'रहने के लिए। बजट लगभग 90 लाख है।' },
      { sender: 'ai', text: 'ई शनिवारी सुबह 11 बजे साइट विज़िट एर्पाट चेय्यना? WhatsApp लो लोकेशन भेज दूँगी।', action: 'Location sent on WhatsApp' },
      { sender: 'user', text: 'हाँ, भेज दीजिए।' }
    ],
    te: [
      { sender: 'ai', text: 'నమస్కారం అమన్ గారు! నేను మీరా, Nest Realty నుంచి మాట్లాడుతున్నాను. Sector 150లో 2BHK గురించి మీరు enquiry చేశారు కదా?' },
      { sender: 'user', text: 'అవును, చెప్పండి.' },
      { sender: 'ai', text: 'మీరు నివసించడానికి చూస్తున్నారా, లేక పెట్టుబడి కోసం చూస్తున్నారా?' },
      { sender: 'user', text: 'నివసించడానికి. బడ్జెట్ సుమారు 90 లక్షలు.' },
      { sender: 'ai', text: 'ఈ శనివారి కాలై 11 గంటలకు సైట్ విజిట్ ఏర్పాటు చేయనా? WhatsAppలో లొకేషన్ పంపిస్తాను.', action: 'WhatsAppలో లొకేషన్ పంపబడింది' },
      { sender: 'user', text: 'అవును, పంపండి.' }
    ],
    ta: [
      { sender: 'ai', text: 'வணக்கம் அமன்! நான் மீரா, Nest Realty-லிருந்து பேசுகிறேன். Sector 150-ல் 2BHK பற்றி விசாரித்தீர்களே?' },
      { sender: 'user', text: 'ஆம், சொல்லுங்கள்.' },
      { sender: 'ai', text: 'நீங்கள் வசிப்பதற்காகப் பார்க்கிறீர்களா அல்லது முதலீட்டிற்காகவா?' },
      { sender: 'user', text: 'வசிப்பதற்காக. பட்ஜெட் சுமார் 90 லட்சம்.' },
      { sender: 'ai', text: 'இந்த சனிக்கிழமை காலை 11 மணிக்கு தளப் பார்வையை ஏற்பாடு செய்யவா? இடத்தை WhatsApp-ல் அனுப்புகிறேன்.', action: 'இடம் WhatsApp-ல் அனுப்பப்பட்டது' },
      { sender: 'user', text: 'சரி, அனுப்புங்கள்.' }
    ],
    kn: [
      { sender: 'ai', text: 'ನಮಸ್ಕಾರ ಅಮನ್ ಅವರೇ! ನಾನು ಮೀರಾ, Nest Realtyಯಿಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. Sector 150ರ 2BHK ಬಗ್ಗೆ ವಿಚಾರಿಸಿದ್ದಿರಿ, ಅಲ್ಲವೇ?' },
      { sender: 'user', text: 'ಹೌದು, ಹೇಳಿ.' },
      { sender: 'ai', text: 'ನೀವು ವಾಸಿಸಲು ನೋಡುತ್ತಿದ್ದೀರಾ ಅಥವಾ ಹೂಡಿಕೆಗಾಗಿ ನೋಡುತ್ತಿದ್ದೀರಾ?' },
      { sender: 'user', text: 'ವಾಸಿಸಲು. ಬಡ್ಜೆಟ್ ಸುಮಾರು 90 ಲಕ್ಷ.' },
      { sender: 'ai', text: 'ಈ ಶನಿವಾರ ಬೆಳಿಗ್ಗೆ 11ಕ್ಕೆ ಸೈಟ್ ವಿಸಿಟ್ ಏರ್ಪಡಿಸಲೇ? ಸ್ಥಳವನ್ನು WhatsApp-ಲ್ಲಿ ಕಳುಹಿಸುತ್ತೇನೆ.', action: 'ಸ್ಥಳವನ್ನು WhatsApp-ಲ್ಲಿ ಕಳುಹಿಸಲಾಗಿದೆ' },
      { sender: 'user', text: 'ಹೌದು, ಕಳುಹಿಸಿ.' }
    ],
    ml: [
      { sender: 'ai', text: 'നമസ്കാരം അമൻ! ഞാൻ മീര, Nest Realty-യിൽ നിന്ന് സംസാരിക്കുന്നു. Sector 150-ലെ 2BHK-യെക്കുറിച്ച് അന്വേഷിച്ചിരുന്നല്ലോ?' },
      { sender: 'user', text: 'അതെ, പറയൂ.' },
      { sender: 'ai', text: 'താമസിക്കാനാണോ നോക്കുന്നത്, അതോ നിക്ഷേപത്തിനാണോ?' },
      { sender: 'user', text: 'താമസിക്കാൻ. ഏകദേശം 90 ലക്ഷം ബജറ്റുണ്ട്.' },
      { sender: 'ai', text: 'ഈ ശനിയാഴ്ച രാവിലെ 11-ന് സൈറ്റ് സന്ദർശനം ക്രമീകരിക്കട്ടേ? ലൊക്കേഷൻ WhatsApp-ൽ അയക്കാം.', action: 'ലൊക്കേഷൻ WhatsApp-ൽ അയച്ചു' },
      { sender: 'user', text: 'ശരി, അയക്കൂ.' }
    ],
    mr: [
      { sender: 'ai', text: 'नमस्कार अमनजी! मी मीरा, Nest Realty मधून बोलतेय. Sector 150 मधील 2BHK बद्दल तुम्ही चौकशी केली होती, बरोबर?' },
      { sender: 'user', text: 'हो, सांगा.' },
      { sender: 'ai', text: 'तुम्ही स्वतः राहण्यासाठी पाहत आहात की गुंतवणुकीसाठी?' },
      { sender: 'user', text: 'राहण्यासाठी. बजेट साधारण 90 लाख आहे.' },
      { sender: 'ai', text: 'या शनिवारी सकाळी 11 वाजता साइट व्हिजिट ठरवू का? लोकेशन WhatsApp वर पाठवते.', action: 'लोकेशन WhatsApp वर पाठवले' },
      { sender: 'user', text: 'हो, पाठवा.' }
    ],
    en: [
      { sender: 'ai', text: 'Hello Aman! This is Meera from Nest Realty. You enquired about our Sector 150 2BHK apartments. Do you have two minutes?' },
      { sender: 'user', text: 'Yes, please go ahead.' },
      { sender: 'ai', text: 'Are you looking for a home to live in or for an investment?' },
      { sender: 'user', text: 'For myself. My budget is around 90 lakhs.' },
      { sender: 'ai', text: 'Shall I book a site visit for Saturday at 11 AM? I can send the location over WhatsApp.', action: 'Location sent on WhatsApp' },
      { sender: 'user', text: 'Sure, please do.' }
    ]
  };

  // Section 3: "Hear our voices" state
  const [activeVoiceLang, setActiveVoiceLang] = useState('hi');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioContextRef = useRef(null);

  const voiceCards = [
    {
      id: 'voice-1',
      category: 'Loans & insurance',
      duration: '1:10',
      title: 'Screens eligibility and chases documents',
      name: 'Sneha',
      code: 'Voice P02',
      avatarInitial: 'S',
      type: 'Outbound',
      frequencies: [38, 35, 48, 57, 29, 65, 64, 60, 25, 50, 27, 88, 33, 60, 67, 46, 63, 64, 95, 57, 34, 39, 96, 44, 27, 46, 88, 77, 77, 82, 43, 76, 73, 70, 27, 63, 59, 65, 63, 48]
    },
    {
      id: 'voice-2',
      category: 'Real estate',
      duration: '1:10',
      title: 'Qualifies a property lead and books a site visit',
      name: 'Neha',
      code: 'Voice P01',
      avatarInitial: 'N',
      type: 'Outbound',
      frequencies: [45, 60, 35, 80, 55, 70, 65, 40, 50, 75, 60, 90, 85, 40, 60, 55, 75, 80, 65, 45, 70, 85, 55, 60, 40, 65, 75, 80, 50, 65, 70, 85, 40, 60, 75, 65, 50, 60, 70, 55]
    },
    {
      id: 'voice-3',
      category: 'Education',
      duration: '1:10',
      title: 'Counsels a student and books a free demo class',
      name: 'Meera',
      code: 'Voice P03',
      avatarInitial: 'M',
      type: 'Outbound',
      frequencies: [30, 45, 65, 50, 70, 85, 40, 60, 75, 50, 65, 70, 80, 55, 60, 75, 65, 45, 60, 75, 70, 50, 65, 80, 60, 45, 70, 75, 60, 50, 65, 70, 55, 45, 60, 65, 50, 55, 60, 45]
    },
    {
      id: 'voice-4',
      category: 'Customer support',
      duration: '1:10',
      title: 'Answers product questions and resolves issues',
      name: 'Kavya',
      code: 'Voice P04',
      avatarInitial: 'K',
      type: 'Inbound',
      frequencies: [50, 65, 45, 75, 60, 85, 70, 55, 60, 80, 65, 90, 75, 50, 65, 80, 70, 60, 75, 85, 65, 55, 70, 85, 60, 50, 65, 80, 70, 55, 65, 75, 60, 50, 60, 70, 55, 50, 65, 50]
    }
  ];

  const handleTogglePlayVoice = (id) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(id);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(id === 'voice-2' ? 440 : id === 'voice-3' ? 520 : 380, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.2);
      }
    } catch (e) {}

    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 3200);
  };

  // Section 4: Channel selector state
  const [activeChannel, setActiveChannel] = useState('campaigns');

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-ink antialiased font-sans selection:bg-brand-500/20 selection:text-brand-700">
      {/* ========================================================================= */}
      {/* 1. EXACT STICKY HEADER (SARVAM NAVBAR) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 lg:pt-3 lg:px-5 pointer-events-none">
        <div className="relative pointer-events-auto mx-auto max-w-[1160px] flex items-center rounded-full border pl-4 lg:pl-5 pr-2 transition-[height,box-shadow,background-color,border-color] duration-200 max-lg:rounded-none max-lg:border-x-0 max-lg:border-t-0 max-lg:shadow-none max-lg:h-14 max-lg:pr-3 h-[60px] bg-paper/90 sm:bg-paper/60 sm:backdrop-blur-md border-line/70 shadow-[0_4px_18px_-10px_rgba(30,20,60,0.18)] max-lg:border-b-transparent">
          {/* Sarvam Logo */}
          <a aria-label="Sarvam AI home" className="shrink-0 mr-3 lg:mr-6 inline-flex items-center min-h-11" href="/">
            <img alt="Sarvam AI" width={140} height={36} className="h-7 lg:h-8 w-auto object-contain" src="/sarvam-logo-black.svg" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="relative hidden lg:flex items-center gap-1 text-[14px]" aria-label="Main">
            <div className="relative">
              <button
                type="button"
                className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
              >
                Product
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
              href="#hear"
            >
              Voices
            </a>
            <a
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
              href="#contact"
            >
              Contact
            </a>
            <a
              href="https://sarvam.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
            >
              Docs
            </a>
            <a
              href="https://sarvam.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600"
            >
              API
            </a>
          </nav>

          {/* Right Desktop CTA Buttons */}
          <div className="ml-auto hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 h-10 px-4 font-medium rounded-full cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={onLaunchConsole}
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-all select-none btn-fill magnet hover:shadow-[0_14px_30px_-12px_rgba(15,14,23,0.3)] bg-brand-600 text-white hover:bg-brand-700 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_20px_-8px_rgba(15,14,23,0.25)] text-[13px] gap-1.5 h-10 px-4.5 rounded-full cursor-pointer"
            >
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Actions */}
          <button
            onClick={onLaunchConsole}
            className="ml-auto lg:hidden shrink-0 whitespace-nowrap inline-flex items-center gap-1 h-9 pl-3 pr-2.5 rounded-lg bg-brand-600 text-white text-[13px] font-semibold"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-1 lg:hidden shrink-0 grid place-items-center w-10 h-10 rounded-lg transition-colors text-ink hover:bg-brand-50"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto lg:hidden mx-3 mt-2 p-4 rounded-2xl bg-paper border border-line shadow-card space-y-2 text-[14px]">
            <a href="#hear" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-ink-2">Voices</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-ink-2">Pricing</a>
            <button onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }} className="block w-full text-left py-2 text-ink-2">Sign in</button>
            <button onClick={() => { setMobileMenuOpen(false); onLaunchConsole(); }} className="block w-full py-2.5 rounded-xl bg-brand-600 text-white font-medium text-center">Open Console</button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden max-sm:min-h-[calc(100svh-72px)] max-sm:flex max-sm:flex-col max-sm:justify-center">
        <div aria-hidden="true" className="absolute inset-0 grid-bg" />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-[38%] w-[1100px] h-[560px] rounded-full opacity-[0.22] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, #2d2b38, transparent)' }}
        />

        <div className="relative wrap py-4 sm:pt-14 sm:pb-14">
          <div className="w-full flex flex-col items-center text-center">
            {/* Speaks 7 Indian Languages Pill */}
            <div className="rise rise-1">
              <span className="inline-flex items-center gap-2 sm:gap-3 h-9 sm:pl-1.5 sm:pr-4 sm:rounded-full sm:border sm:border-line sm:bg-paper/90 sm:backdrop-blur sm:shadow-card">
                <span className="max-sm:hidden grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white">
                  <PhoneCall className="w-3 h-3" />
                </span>
                <span aria-hidden="true" className="hidden sm:flex items-center gap-[2px] h-3.5">
                  <span className="w-[2.5px] rounded-full bg-brand-400" style={{ height: '50%' }} />
                  <span className="w-[2.5px] rounded-full bg-brand-400" style={{ height: '90%' }} />
                  <span className="w-[2.5px] rounded-full bg-brand-400" style={{ height: '65%' }} />
                  <span className="w-[2.5px] rounded-full bg-brand-400" style={{ height: '100%' }} />
                  <span className="w-[2.5px] rounded-full bg-brand-400" style={{ height: '55%' }} />
                </span>
                <span className="relative inline-flex items-center sm:justify-center max-sm:justify-end w-[76px] sm:w-[84px] h-full text-[14px] leading-none font-semibold text-ink">
                  <span lang={rotatingWords[wordIdx].lang} className="animate-word-in whitespace-nowrap">
                    {rotatingWords[wordIdx].word}
                  </span>
                </span>
                <span className="text-[13px] text-muted sm:border-l sm:border-line sm:pl-3 whitespace-nowrap">
                  <span className="sm:hidden">· 7 Indian languages</span>
                  <span className="hidden sm:inline">Speaks 7 Indian languages</span>
                </span>
                <a
                  href="#hear"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700 hover:text-brand-800 border-l border-line pl-3 whitespace-nowrap"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Hear a call
                </a>
              </span>
            </div>

            {/* H1 & Subtitle */}
            <h1 className="rise rise-2 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center mt-6 max-w-[1000px] mx-auto text-balance px-4 leading-[1.1] text-ink">
              AI telecalling software.
            </h1>
            <p className="rise rise-3 text-sm sm:text-lg lg:text-xl mt-3 text-muted text-center max-w-xl mx-auto px-4 leading-relaxed">
              India&apos;s most <span className="text-brand-600 font-semibold">natural-sounding</span> voice agents.
            </p>

            {/* 3 Channels Pill Bar */}
            <ul className="rise rise-4 mt-6 sm:mt-7 hidden sm:grid grid-cols-3 w-full max-w-[1000px] overflow-hidden rounded-2xl border border-line bg-paper/90 sm:bg-paper/70 sm:backdrop-blur shadow-card divide-x divide-line text-left">
              <li>
                <a className="group flex flex-col items-center text-center gap-1.5 px-1.5 py-3 sm:flex-row sm:text-left sm:gap-3 sm:px-5 h-full hover:bg-canvas/60 transition-colors" href="#channels">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] sm:text-[14.5px] font-semibold text-ink">Instant leads</span>
                    <span className="hidden sm:block text-[13px] leading-snug text-muted mt-0.5 sm:whitespace-nowrap">Calls new enquiries within 30 seconds</span>
                  </span>
                </a>
              </li>
              <li>
                <a className="group flex flex-col items-center text-center gap-1.5 px-1.5 py-3 sm:flex-row sm:text-left sm:gap-3 sm:px-5 h-full hover:bg-canvas/60 transition-colors" href="#channels">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600 shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] sm:text-[14.5px] font-semibold text-ink">Bulk campaigns</span>
                    <span className="hidden sm:block text-[13px] leading-snug text-muted mt-0.5 sm:whitespace-nowrap">Works through lists, many calls at once</span>
                  </span>
                </a>
              </li>
              <li>
                <a className="group flex flex-col items-center text-center gap-1.5 px-1.5 py-3 sm:flex-row sm:text-left sm:gap-3 sm:px-5 h-full hover:bg-canvas/60 transition-colors" href="#channels">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600 shrink-0 mt-0.5">
                    <PhoneIncoming className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] sm:text-[14.5px] font-semibold text-ink">Inbound</span>
                    <span className="hidden sm:block text-[13px] leading-snug text-muted mt-0.5 sm:whitespace-nowrap">Answers your number, day and night</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Interactive Hero Stage Card */}
          <div className="rise rise-5 w-full mt-8 sm:mt-10 max-w-[1200px] mx-auto">
            <div className="rounded-[24px] sm:rounded-[28px] sm:p-1.5 shadow-stage" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))' }}>
              <div
                className="relative flex flex-col rounded-[24px] sm:rounded-[22px] text-white px-5 pt-5 pb-4 sm:p-7"
                style={{ background: 'radial-gradient(130% 140% at 0% 0%, #1e1b4b 0%, #0f0e26 50%, #070712 100%)' }}
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] sm:rounded-[22px]">
                  <span className="absolute -top-28 right-[22%] w-[420px] h-[420px] rounded-full opacity-30" style={{ background: 'radial-gradient(closest-side, #3a3f5c, transparent)' }} />
                </span>

                <div className="relative flex-1 flex flex-col">
                  {/* Top Prompt Question & Language Selector */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[20px] font-semibold tracking-tight">
                    <label htmlFor="brief">What should your AI telecaller do?</label>
                    <span className="relative inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-brand-300 hover:bg-white/10 transition-colors">
                      <span aria-hidden="true" className="inline-flex items-center gap-1">
                        <span className="text-white/50 font-normal">in</span>
                        <span>{selectedLanguage === 'hi-IN' ? 'Hindi' : selectedLanguage === 'te-IN' ? 'Telugu' : selectedLanguage === 'ta-IN' ? 'Tamil' : selectedLanguage === 'kn-IN' ? 'Kannada' : selectedLanguage === 'ml-IN' ? 'Malayalam' : selectedLanguage === 'mr-IN' ? 'Marathi' : 'English'}</span>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        aria-label="Language of the calls"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="hi-IN">Hindi</option>
                        <option value="te-IN">Telugu</option>
                        <option value="ta-IN">Tamil</option>
                        <option value="kn-IN">Kannada</option>
                        <option value="ml-IN">Malayalam</option>
                        <option value="mr-IN">Marathi</option>
                        <option value="en-IN">English</option>
                      </select>
                    </span>
                  </div>

                  {/* Textarea */}
                  <div className="relative mt-4 rounded-2xl bg-white/[0.07] border border-white/12 focus-within:border-brand-400 focus-within:bg-white/[0.09] transition-colors">
                    <textarea
                      id="brief"
                      maxLength={1500}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="e.g. Remind customers whose EMI is due this week, and note who promises to pay."
                      className="block w-full resize-none min-h-[8rem] sm:min-h-[10rem] rounded-2xl bg-transparent px-4 py-3.5 text-[16px] sm:text-[16px] leading-relaxed text-white placeholder:text-white/40 outline-none"
                      rows={3}
                    />
                  </div>

                  {/* "Try:" Quick Example Buttons */}
                  <div className="mt-3 hidden sm:flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-[12.5px] sm:text-[13px] text-white/45 mr-0.5">Try:</span>
                    {samplePrompts.map((sp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptText(sp.text)}
                        className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-[13px] font-medium transition-colors border-white/15 bg-white/[0.05] text-white/75 hover:bg-white/[0.12] hover:text-white cursor-pointer"
                      >
                        {idx === 0 && <ShieldCheck className="w-3.5 h-3.5" />}
                        {idx === 1 && <Building2 className="w-3.5 h-3.5" />}
                        {idx === 2 && <Stethoscope className="w-3.5 h-3.5" />}
                        {idx === 3 && <Building2 className="w-3.5 h-3.5" />}
                        {idx === 4 && <Car className="w-3.5 h-3.5" />}
                        <span>{sp.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bottom Actions: Mic & Build */}
                  <div className="mt-6 flex flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={onTalkToAgent}
                      className="group inline-flex items-center gap-3 rounded-full border pl-1.5 pr-4 py-1.5 transition-colors border-brand-300/40 bg-brand-500/15 hover:bg-brand-500/25 hover:border-brand-300/70 cursor-pointer"
                    >
                      <span className="relative grid place-items-center w-10 h-10 shrink-0">
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full animate-orbit"
                          style={{
                            background: 'conic-gradient(from 0deg, transparent 0%, transparent 72%, #E7B84B 90%, transparent 100%)',
                            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
                            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))'
                          }}
                        />
                        <span
                          className="grid place-items-center w-8 h-8 rounded-full text-white transition-transform group-hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #2d2b38, #0f0e17)', boxShadow: '0 6px 16px -6px rgba(15,14,23,0.35)' }}
                        >
                          <Mic className="w-4 h-4" />
                        </span>
                      </span>
                      <span className="text-left leading-tight hidden sm:block">
                        <span className="block text-[14px] font-semibold text-white">Describe it by voice</span>
                        <span className="block text-[12px] text-white/55">Speak in your language. We’ll write it up.</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={onLaunchConsole}
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-stage text-[15px] font-semibold hover:bg-brand-50 transition-colors shadow-[0_10px_30px_-10px_rgba(15,14,23,0.2)] cursor-pointer"
                    >
                      Build my employee
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted By Badge */}
            <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper pl-3.5 pr-5 py-2.5 shadow-card">
                <BadgeCheck className="w-4.5 h-4.5 text-ok" />
                <span className="whitespace-nowrap text-[13.5px] sm:text-[15px] text-ink-2">
                  <strong className="font-semibold text-ink">Designed for</strong> customer conversations at scale
                </span>
              </div>
              <p className="text-center text-[12.5px] sm:text-[13px] text-muted">
                Start with a free account · No card required · Plans from ₹5 per minute
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: HOW IT WORKS (PHONE MOCKUP & CRM CONSOLE) */}
      {/* ========================================================================= */}
      <section className="py-14 lg:py-16 bg-canvas border-y border-line overflow-hidden">
        <div className="wrap">
          <div className="mx-auto text-center items-center flex flex-col max-w-[760px] mb-6">
            <h2 className="t-h2-md text-ink text-balance">How it works</h2>
          </div>

          {/* Language Selector Pill Tabs */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div role="tablist" aria-label="Call language" className="flex items-center gap-1 p-1 rounded-2xl bg-paper border border-line shadow-card max-w-full overflow-x-auto">
              {languagesList.map((lang) => (
                <button
                  key={lang.id}
                  role="tab"
                  aria-selected={activeHowLang === lang.id}
                  onClick={() => setActiveHowLang(lang.id)}
                  className={`shrink-0 h-9 px-3.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer ${
                    activeHowLang === lang.id
                      ? 'bg-ink text-white'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Showcase */}
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-[268px_minmax(0,1fr)] gap-8 lg:gap-10 items-center">
            {/* Left Column: Realistic iPhone Device Mockup */}
            <div className="relative mx-auto">
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -inset-8 rounded-full opacity-40 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(closest-side, #2d2b38, transparent)' }}
              />
              <div className="swing relative w-[268px] h-[540px] rounded-[46px] p-[10px] bg-[#0B0A10] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_50px_100px_-30px_rgba(15,14,23,0.12),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
                {/* Hardware buttons */}
                <span aria-hidden="true" className="absolute -left-[3px] top-[104px] w-[3px] h-[30px] rounded-l bg-[#1a1820]" />
                <span aria-hidden="true" className="absolute -left-[3px] top-[146px] w-[3px] h-[50px] rounded-l bg-[#1a1820]" />
                <span aria-hidden="true" className="absolute -right-[3px] top-[130px] w-[3px] h-[70px] rounded-r bg-[#1a1820]" />

                {/* Inner Screen */}
                <div
                  className="relative h-full rounded-[37px] overflow-hidden text-white flex flex-col"
                  style={{ background: 'radial-gradient(140% 90% at 50% 0%, #1e1b4b 0%, #0f0e26 45%, #070712 100%)' }}
                >
                  {/* Status Bar */}
                  <div className="relative flex items-center justify-between px-6 pt-3 text-[11.5px] font-semibold">
                    <span>9:41</span>
                    <span aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 top-2 w-[84px] h-[25px] rounded-full bg-black" />
                    <span className="flex items-center gap-1 text-[12.5px]">
                      5G
                    </span>
                  </div>

                  {/* Caller Header */}
                  <div className="flex flex-col items-center pt-5 pb-3">
                    <span className="relative grid place-items-center w-14 h-14 rounded-full bg-white/10 border border-white/15 text-[17px] font-semibold">
                      NR
                    </span>
                    <div className="mt-2.5 text-[17px] font-semibold tracking-tight">Nest Realty</div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-white/55 mt-0.5">
                      <span className="font-mono">1:08</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> Noida
                      </span>
                    </div>

                    {/* Animated voice wave */}
                    <div className="mt-2 flex items-end gap-[3px] h-3.5" aria-hidden="true">
                      {[40, 75, 50, 95, 60, 100, 70, 45, 80, 60, 90, 50, 85, 40].map((h, i) => (
                        <span
                          key={i}
                          className="w-[3px] rounded-full bg-brand-300 animate-pulse"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Conversation Chat Bubbles */}
                  <div className="flex-1 overflow-y-auto scroll-none px-3.5 pb-2 flex flex-col gap-1.5 [mask-image:linear-gradient(to_bottom,transparent,#000_14%)]">
                    <div className="flex-1" />
                    {(transcriptsByLang[activeHowLang] || transcriptsByLang.hi).map((msg, i) => (
                      <div key={i} className="contents">
                        <div
                          className={`max-w-[88%] rounded-2xl px-3 py-1.5 text-[12px] leading-[1.45] ${
                            msg.sender === 'ai'
                              ? 'self-start bg-white/[0.09] rounded-bl-md'
                              : 'self-end bg-brand-500/45 rounded-br-md'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {msg.action && (
                          <div className="self-center my-0.5 inline-flex items-center gap-1.5 rounded-full bg-ok/20 text-[#7FE0B5] px-2.5 py-1 text-[12px] font-medium">
                            <MessageCircle className="w-2.5 h-2.5" /> {msg.action}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Phone Dialpad Controls */}
                  <div className="grid grid-cols-4 gap-2 px-5 pt-2 pb-5">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-white/10 justify-self-center">
                      <Mic className="w-4 h-4 text-white/80" />
                    </span>
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-white/10 justify-self-center">
                      <GridIcon />
                    </span>
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-white/10 justify-self-center">
                      <Volume2 className="w-4 h-4 text-white/80" />
                    </span>
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-[#E5484D] justify-self-center">
                      <PhoneOff className="w-4 h-4 text-white" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sarvam CRM Console Card */}
            <div className="swing lg:h-[540px] flex flex-col">
              <div className="tilt h-full flex flex-col rounded-2xl border border-line bg-paper shadow-lift overflow-hidden">
                {/* Console Window Header */}
                <div className="flex items-center gap-3 h-11 px-4 border-b border-line bg-paper">
                  <span className="hidden sm:flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-line" />
                    <span className="w-2.5 h-2.5 rounded-full bg-line" />
                    <span className="w-2.5 h-2.5 rounded-full bg-line" />
                  </span>
                  <img
                    alt="Sarvam AI" width={80} height={18} className="shrink-0 ml-1 h-3.5 w-auto object-contain" src="/sarvam-wordmark-black.svg"
                  />
                  <span className="text-line-2 -mx-1">/</span>
                  <span className="min-w-0 text-[13px] text-muted font-medium truncate">Conversations</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium leading-none bg-ok-soft text-ok border-[#C7EBD9]">
                      <Check className="w-3 h-3" /> Site visit booked
                    </span>
                  </span>
                </div>

                {/* Lead Summary Header */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-50 text-brand-700 text-[12.5px] font-semibold shrink-0">
                      AV
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold tracking-tight">Aman Verma</div>
                      <div className="text-[12px] text-muted font-mono truncate">+91 98765 43210 · Meta ad · Noida</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium leading-none bg-brand-50 text-brand-700 border-brand-100 shrink-0">
                      {languagesList.find((l) => l.id === activeHowLang)?.name || 'Hindi'} + English
                    </span>
                  </div>

                  {/* 4 Extracted Data Tiles */}
                  <div className="mt-4 grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-line bg-line">
                    <div className="bg-paper px-3.5 py-2.5">
                      <div className="text-[11.5px] text-muted">Looking for</div>
                      <div className="flex items-center gap-1.5 text-[14px] font-medium text-ink mt-0.5">
                        <span className="truncate">2BHK, Sector 150</span>
                        <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-ok-soft text-ok shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                    <div className="bg-paper px-3.5 py-2.5">
                      <div className="text-[11.5px] text-muted">Purpose</div>
                      <div className="flex items-center gap-1.5 text-[14px] font-medium text-ink mt-0.5">
                        <span className="truncate">To live in</span>
                        <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-ok-soft text-ok shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                    <div className="bg-paper px-3.5 py-2.5">
                      <div className="text-[11.5px] text-muted">Budget</div>
                      <div className="flex items-center gap-1.5 text-[14px] font-medium text-ink mt-0.5">
                        <span className="truncate">~₹90L</span>
                        <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-ok-soft text-ok shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                    <div className="bg-paper px-3.5 py-2.5">
                      <div className="text-[11.5px] text-muted">Site visit</div>
                      <div className="flex items-center gap-1.5 text-[14px] font-medium text-ink mt-0.5">
                        <span className="truncate">Sat, 11:00 AM</span>
                        <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-ok-soft text-ok shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-canvas border border-line text-[13px] leading-relaxed text-ink-2">
                    <span className="font-semibold text-ink block mb-1">Call Summary:</span>
                    Aman enquired for 2BHK in Sector 150 for self-use. Budget is approximately 90 Lakhs. Scheduled site visit for Saturday 11 AM. Floor plans and project brochure shared via WhatsApp.
                  </div>

                  {/* Action pill tags */}
                  <div className="mt-auto pt-4 flex flex-wrap gap-2 text-[12px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ok-soft text-ok font-medium border border-[#C7EBD9]">
                      <Check className="w-3 h-3" /> WhatsApp Sent
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 font-medium border border-brand-100">
                      <Clock className="w-3 h-3" /> Calendar Confirmed
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-canvas text-ink-2 font-medium border border-line">
                      CRM Sync: Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: HEAR OUR VOICES (PLAYABLE VOICE TILES) */}
      {/* ========================================================================= */}
      <section id="hear" className="py-12 lg:py-16 scroll-mt-16">
        <div className="wrap">
          <div className="flex flex-col max-w-[760px] mb-6 sm:mb-8">
            <h2 className="t-h2-md text-ink text-balance">Hear our voices</h2>
          </div>

          {/* Language Tabs */}
          <div className="flex justify-start mb-5 sm:mb-6">
            <div role="tablist" aria-label="Language" className="flex items-center gap-1 p-1 rounded-2xl bg-paper border border-line shadow-card max-w-full overflow-x-auto">
              {languagesList.map((lang) => (
                <button
                  key={lang.id}
                  role="tab"
                  aria-selected={activeVoiceLang === lang.id}
                  onClick={() => setActiveVoiceLang(lang.id)}
                  className={`shrink-0 h-9 px-3.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer ${
                    activeVoiceLang === lang.id
                      ? 'bg-ink text-white'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {voiceCards.map((vc) => {
              const isPlaying = playingVoiceId === vc.id;
              return (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => handleTogglePlayVoice(vc.id)}
                  className="lift group text-left rounded-2xl border p-4 border-line bg-paper hover:border-line-2 hover:shadow-card transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="t-eyebrow text-[12.5px] text-muted">{vc.category}</span>
                    <span className="font-mono text-[12px] text-faint">{vc.duration}</span>
                  </div>
                  <div className="mt-2.5 text-[14.5px] font-medium leading-snug text-ink min-h-[40px]">
                    {vc.title}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-[12.5px] font-semibold">
                      {vc.avatarInitial}
                    </span>
                    <span className="truncate">
                      <span className="text-ink-2 font-medium">{vc.name}</span> · Voice <span className="font-mono">{vc.code}</span>
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[12.5px] text-muted">
                      <PhoneOutgoing className="w-2.5 h-2.5" />
                      {vc.type}
                    </span>
                  </div>

                  {/* Play Button & Wave Bars */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 transition-colors ${isPlaying ? 'bg-brand-600 text-white' : 'bg-ink text-white group-hover:bg-brand-600'}`}>
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </span>
                    <span className="flex items-center gap-[2px] h-7 flex-1" aria-hidden="true">
                      {vc.frequencies.map((h, i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-150 ${isPlaying ? 'bg-brand-600' : 'bg-line-2'}`}
                          style={{
                            height: isPlaying ? `${Math.max(20, (h * (i % 3 + 1)) % 100)}%` : `${h}%`
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: ONE SARVAM AI EMPLOYEE, EVERY CHANNEL */}
      {/* ========================================================================= */}
      <section id="channels" className="py-12 lg:py-16">
        <div className="wrap">
          <div className="flex flex-col max-w-[760px] mb-8 max-w-none">
            
            <h2 className="t-h2-md text-ink text-balance">
              New leads, old lists, incoming calls. <span className="text-muted">Same employee.</span>
            </h2>
          </div>

          {/* 3 Channels Selector Tabs */}
          <div role="tablist" aria-label="Channels" className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-8">
            <button
              role="tab"
              aria-selected={activeChannel === 'instant'}
              onClick={() => setActiveChannel('instant')}
              className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 text-left transition-all cursor-pointer ${
                activeChannel === 'instant'
                  ? 'bg-paper border-brand-300 shadow-lift ring-1 ring-brand-200'
                  : 'bg-canvas border-line hover:bg-paper hover:border-line-2'
              }`}
            >
              <span className={`grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 transition-colors ${activeChannel === 'instant' ? 'bg-brand-600 text-white' : 'bg-paper border border-line text-muted'}`}>
                <Zap className="w-4.5 h-4.5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold text-ink">Instant leads</span>
                <span className="block text-[13px] text-muted truncate">Call every enquiry in 30s</span>
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeChannel === 'campaigns'}
              onClick={() => setActiveChannel('campaigns')}
              className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 text-left transition-all cursor-pointer ${
                activeChannel === 'campaigns'
                  ? 'bg-paper border-brand-300 shadow-lift ring-1 ring-brand-200'
                  : 'bg-canvas border-line hover:bg-paper hover:border-line-2'
              }`}
            >
              <span className={`grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 transition-colors ${activeChannel === 'campaigns' ? 'bg-brand-600 text-white' : 'bg-paper border border-line text-muted'}`}>
                <Megaphone className="w-4.5 h-4.5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold text-ink">Bulk campaigns</span>
                <span className="block text-[13px] text-muted truncate">Work through your lists</span>
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeChannel === 'inbound'}
              onClick={() => setActiveChannel('inbound')}
              className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 text-left transition-all cursor-pointer ${
                activeChannel === 'inbound'
                  ? 'bg-paper border-brand-300 shadow-lift ring-1 ring-brand-200'
                  : 'bg-canvas border-line hover:bg-paper hover:border-line-2'
              }`}
            >
              <span className={`grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 transition-colors ${activeChannel === 'inbound' ? 'bg-brand-600 text-white' : 'bg-paper border border-line text-muted'}`}>
                <PhoneIncoming className="w-4.5 h-4.5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold text-ink">Inbound</span>
                <span className="block text-[13px] text-muted truncate">Answer your number 24/7</span>
              </span>
            </button>
          </div>

          {/* Active Channel Details Box */}
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-14 items-center">
            <div>
              <h3 className="text-[26px] sm:text-[30px] leading-[1.1] tracking-[-0.03em] font-semibold text-ink">
                {activeChannel === 'instant'
                  ? 'Call every enquiry while they are still on your page.'
                  : activeChannel === 'campaigns'
                  ? 'Hand over the list. Get back the interested ones.'
                  : 'Never miss an inbound call, day or night.'}
              </h3>
              <p className="text-[15px] sm:text-[16px] leading-relaxed text-muted mt-4">
                {activeChannel === 'instant'
                  ? 'Connect Facebook, Google Lead Forms or Webhooks. Sarvam AI calls within 30 seconds of enquiry submission.'
                  : activeChannel === 'campaigns'
                  ? 'As many calls at once as you have channels. Calling during working hours only, dropping answering machines, updating your CRM as she goes.'
                  : 'Route incoming calls directly to your Sarvam employee. She handles queries, schedules appointments, or transfers high-intent calls to human staff.'}
              </p>

              <ul className="mt-6 space-y-3 text-[14px] text-ink-2 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Drop a CSV, connect Google Sheets or push via API</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Set your calling window, pacing and retry rules</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Live dashboard: who picked, who&apos;s interested, who asked to call back</span>
                </li>
              </ul>
            </div>

            {/* Campaign Console Preview Card */}
            <div className="rounded-2xl border border-line bg-paper p-5 shadow-lift">
              <div className="flex items-center justify-between pb-3 border-b border-line text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
                  <span className="font-semibold text-ink">Active Campaign: Q4 High Priority List</span>
                </div>
                <span className="font-mono text-muted">21 calls / min pacing</span>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { name: 'Karthik Varma', phone: '+91 98490 12345', status: 'Site visit booked', time: '1m 24s', tagColor: 'bg-ok-soft text-ok' },
                  { name: 'Pooja Sharma', phone: '+91 97011 88321', status: 'Callback scheduled', time: '42s', tagColor: 'bg-gold-200 text-[#A87E29]' },
                  { name: 'Rahul Deshmukh', phone: '+91 91234 56789', status: 'Floor plan sent', time: '1m 08s', tagColor: 'bg-brand-50 text-brand-700' }
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line text-[13px]">
                    <div>
                      <div className="font-semibold text-ink">{row.name}</div>
                      <div className="text-[11.5px] font-mono text-muted">{row.phone}</div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11.5px] font-medium ${row.tagColor}`}>
                        {row.status}
                      </span>
                      <div className="text-[12.5px] font-mono text-muted mt-0.5">{row.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 5: AGENTIC, NOT JUST TALKING (NOW WITH HANDS) */}
      {/* ========================================================================= */}
      <section className="py-12 lg:py-16 overflow-hidden">
        <div className="wrap">
          <div
            className="rounded-[28px] border border-line px-4 py-7 sm:px-10 sm:py-10 lg:px-12 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-6 md:gap-10 items-center"
            style={{ background: 'radial-gradient(110% 120% at 100% 0%, #f6f7fb 0%, #f0f2f8 40%, #ffffff 100%)' }}
          >
            <div>
              
              <h2 className="t-h2-md text-ink text-balance">
                India&apos;s best voices. <span className="text-brand-600">Now with hands.</span>
              </h2>
              <p className="text-[16px] leading-relaxed text-muted mt-4 max-w-[420px]">
                While she talks, she works: books, sends, looks things up and hands over, mid-call.
              </p>
            </div>

            {/* 6 Integration Tools Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: 'WhatsApp', desc: 'Location sent', icon: MessageCircle },
                { title: 'Google Calendar', desc: 'Booked Sat, 11:00', icon: Clock },
                { title: 'Your CRM', desc: 'Lead fetched', icon: ShieldCheck },
                { title: 'Custom API', desc: 'EMI ₹1.04L/mo', icon: Braces },
                { title: 'Call transfer', desc: 'Sent to your team', icon: PhoneOutgoing },
                { title: 'Caller memory', desc: 'Remembers past calls', icon: RefreshCcw }
              ].map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-paper border border-line shadow-card flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-ink">{tool.title}</div>
                      <div className="text-[12px] text-muted mt-0.5">{tool.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION 6: BUILT IN, SO YOU DON'T HAVE TO */}
      {/* ========================================================================= */}
      <section className="py-12 lg:py-16">
        <div className="wrap">
          <div className="flex flex-col max-w-[760px] max-w-none">
            
            <h2 className="t-h2-md text-ink text-balance">
              Built in, <span className="text-muted">so you don&apos;t have to.</span>
            </h2>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-4">
            {/* Card 1: Numbers in 5 mins (Span 2) */}
            <div className="lg:col-span-2 lift rounded-2xl border border-line bg-paper shadow-card p-2 grid sm:grid-cols-2 gap-2 items-center">
              <div className="p-4 sm:p-5">
                <h3 className="text-[20px] font-semibold tracking-tight">Numbers in 5 mins</h3>
                <p className="text-[14px] text-muted mt-1">
                  Complete digital KYC and get an IVRS-ready business number.
                </p>
                <div className="flex gap-1.5 mt-4">
                  <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium leading-none bg-ok-soft text-ok border-[#C7EBD9]">
                    <ShieldCheck className="w-3 h-3" /> KYC done
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium leading-none bg-canvas text-ink-2 border-line">
                    IVRS-ready
                  </span>
                </div>
              </div>

              <div className="hidden sm:block rounded-xl p-3" style={{ background: 'linear-gradient(160deg, #f6f7fb 0%, #f6f7fb 75%)' }}>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5 bg-paper border-brand-300 shadow-card">
                    <span className="grid place-items-center w-7 h-7 rounded-lg text-[12px] font-semibold bg-brand-600 text-white">1</span>
                    <span className="font-mono text-[13.5px] tracking-tight text-ink font-medium">+91 79 6548 1367</span>
                    <Check className="w-4 h-4 ml-auto text-brand-600" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5 bg-paper border-line">
                    <span className="grid place-items-center w-7 h-7 rounded-lg text-[12px] font-semibold bg-canvas text-muted">2</span>
                    <span className="font-mono text-[13.5px] tracking-tight text-muted">+91 80 4567 8901</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5 bg-paper border-line">
                    <span className="grid place-items-center w-7 h-7 rounded-lg text-[12px] font-semibold bg-canvas text-muted">3</span>
                    <span className="font-mono text-[13.5px] tracking-tight text-muted">+91 40 6789 0123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Auto-retries (Row Span 2) */}
            <div className="lg:row-span-2 lift rounded-2xl border border-line bg-paper shadow-card p-5 flex flex-col">
              <h3 className="text-[20px] font-semibold tracking-tight">Auto-retries</h3>
              <p className="text-[14px] text-muted mt-1">
                Busy, no answer, or “call me later”: handled on its own.
              </p>
              <ol className="relative hidden sm:grid gap-6 mt-8 flex-1 content-center">
                <span aria-hidden="true" className="absolute left-[15px] top-4 bottom-4 w-px border-l border-dashed border-line-2" />
                <li className="relative flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-full ring-4 ring-paper z-10 shrink-0 bg-[#FBE6E7] text-[#C7434A]">
                    <PhoneOff className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-0.5">
                    <span className="block text-[14px] font-semibold text-ink">10:00 AM · Call 1</span>
                    <span className="block text-[13px] text-muted">Busy</span>
                  </span>
                </li>
                <li className="relative flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-full ring-4 ring-paper z-10 shrink-0 bg-gold-200 text-[#A87E29]">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-0.5">
                    <span className="block text-[14px] font-semibold text-ink">Auto-scheduled</span>
                    <span className="block text-[13px] text-muted">for 5:00 PM</span>
                  </span>
                </li>
                <li className="relative flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-full ring-4 ring-paper z-10 shrink-0 bg-ok-soft text-ok">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-0.5">
                    <span className="block text-[14px] font-semibold text-ok">5:00 PM · Call 2</span>
                    <span className="block text-[13px] text-muted">Connected · site visit booked</span>
                  </span>
                </li>
              </ol>
            </div>

            {/* Card 3: Trust & compliance */}
            <div className="lift rounded-2xl border border-line bg-paper shadow-card p-5">
              <div className="flex gap-2 mb-4">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-ok-soft text-ok">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </span>
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-ok-soft text-ok">
                  <Lock className="w-4.5 h-4.5" />
                </span>
              </div>
              <h3 className="text-[17px] font-semibold tracking-tight">Trust &amp; compliance</h3>
              <p className="text-[14px] text-muted mt-1">
                DLT-registered numbers and consent checks, built in.
              </p>
            </div>

            {/* Card 4: Never drops the ball */}
            <div className="lift rounded-2xl border border-line bg-paper shadow-card p-5 flex flex-col">
              <h3 className="text-[17px] font-semibold tracking-tight mb-3">Never drops the ball</h3>
              <ul className="grid gap-2 text-[13.5px] font-medium text-ink-2">
                <li className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-brand-50 text-brand-600">
                    <RefreshCcw className="w-3 h-3" />
                  </span>
                  Recovers mid-call
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-brand-50 text-brand-600">
                    <Lock className="w-3 h-3" />
                  </span>
                  Never calls anyone twice
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-brand-50 text-brand-600">
                    <Gauge className="w-3 h-3" />
                  </span>
                  Steady under load
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-brand-50 text-brand-600">
                    <PhoneOff className="w-3 h-3" />
                  </span>
                  Auto-pause on carrier refusals
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-brand-50 text-brand-600">
                    <Wallet className="w-3 h-3" />
                  </span>
                  Spend floor on every call
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECTION 7: FOR DEVELOPERS (API INTRO) */}
      {/* ========================================================================= */}
      <section className="py-10 lg:py-14">
        <div className="wrap">
          <div className="rounded-[24px] border border-line bg-paper shadow-card overflow-hidden grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              
              <h2 className="mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight tracking-[-0.03em] font-semibold text-ink text-balance">
                Build on Sarvam AI with our API.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted max-w-[460px]">
                Send leads in with one request, get every call&apos;s outcome back by webhook.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href="https://sarvam.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none btn-fill magnet hover:shadow-[0_14px_30px_-12px_rgba(15,14,23,0.3)] bg-ink text-white hover:bg-ink-2 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset] text-[13px] gap-1.5 h-10 px-4.5 rounded-full"
                >
                  Read the API docs
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Code Box */}
            <div className="bg-[#0f0e1a] text-white p-5 sm:p-6 font-mono text-[13px] leading-relaxed flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="text-white/40 mb-2">// Send a lead for instant outbound call</div>
              <div className="text-brand-300 font-bold">POST /lead-intake/&#123;slug&#125;</div>
              <div className="text-white/60 text-[12px] mt-1">X-Sarvam-Lead-Secret: [configured]</div>
              <pre className="mt-3 text-emerald-400 text-[12.5px] overflow-x-auto">
{`{
  "phone": "+919876543210",
  "name": "Rahul Verma",
  "variables": {
    "property": "Sector 150",
    "budget": "90L"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECTION 8: PRICING (PAY FOR TALK TIME. NOTHING ELSE.) */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-16 lg:py-20 bg-canvas border-y border-line">
        <div className="wrap">
          <div className="mx-auto text-center items-center flex flex-col max-w-[760px]">
            
            <h2 className="t-h2-md text-ink text-balance">Pay for talk time. Nothing else.</h2>
            <p className="t-lead text-muted mt-5 max-w-[620px] text-pretty">
              One credit is one rupee. Pick a voice per employee, top up when you need to, and your credits never expire.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4 max-w-[1040px] mx-auto">
            {/* Standard Plan */}
            <div className="lift relative rounded-2xl border bg-paper p-5 sm:p-7 border-brand-300 shadow-lift">
              <span className="absolute -top-2.5 left-7 t-eyebrow text-[12.5px] bg-brand-600 text-white rounded-md px-2 py-1 font-semibold">
                Most chosen
              </span>
              <div className="text-[15px] font-medium text-ink">Standard</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[44px] font-semibold tracking-[-0.04em] leading-none">₹5</span>
                <span className="text-[14px] text-muted">/ min</span>
              </div>
              <p className="text-[14px] leading-relaxed text-muted mt-4">
                More expressive voices for everyday sales and support.
              </p>
              <button
                onClick={onLaunchConsole}
                className="mt-6 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[13px] transition-colors cursor-pointer"
              >
                Get started
              </button>
            </div>

            {/* Premium Plan */}
            <div className="lift relative rounded-2xl border bg-paper p-5 sm:p-7 border-line shadow-card">
              <div className="text-[15px] font-medium text-ink">Premium</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[44px] font-semibold tracking-[-0.04em] leading-none">₹6.8</span>
                <span className="text-[14px] text-muted">/ min</span>
              </div>
              <p className="text-[14px] leading-relaxed text-muted mt-4">
                Our most lifelike voices, for calls where the impression matters most.
              </p>
              <button
                onClick={onLaunchConsole}
                className="mt-6 w-full py-2.5 rounded-xl bg-ink hover:bg-ink-2 text-white font-semibold text-[13px] transition-colors cursor-pointer"
              >
                Get started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="lift relative rounded-2xl border bg-paper p-5 sm:p-7 border-line shadow-card">
              <div className="text-[15px] font-medium text-ink">Enterprise</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[44px] font-semibold tracking-[-0.04em] leading-none">Custom</span>
              </div>
              <p className="text-[14px] leading-relaxed text-muted mt-4">
                High volume, dedicated trunks, custom voices, custom integrations, SLAs.
              </p>
              <a
                href="#contact"
                className="mt-6 block text-center w-full py-2.5 rounded-xl bg-canvas hover:bg-line text-ink font-semibold text-[13px] transition-colors"
              >
                Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. SECTION 9: CALL TO ACTION BOTTOM BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20">
        <div className="wrap">
          <div
            className="relative overflow-hidden rounded-[28px] px-6 py-16 sm:px-12 sm:py-20 text-center text-white"
            style={{ background: 'radial-gradient(120% 140% at 50% 0%, #1e1b4b 0%, #0f0e26 55%, #070712 100%)' }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 -top-40 w-[640px] h-[420px] rounded-full opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(closest-side, #3a3f5c, transparent)' }}
            />
            <div className="relative">
              <h2 className="t-h2 font-display text-balance max-w-[720px] mx-auto text-[32px] sm:text-[44px] font-normal sm:font-medium tracking-tight text-white">
                Your first employee can be calling leads today.
              </h2>
              <p className="t-lead font-sans text-white/70 mt-5 max-w-[520px] mx-auto text-[16px] leading-relaxed">
                Create and review an AI employee before connecting a calling provider or adding credits.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={onLaunchConsole}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-stage text-[15px] font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors shadow-lg cursor-pointer"
                >
                  Start free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#contact"
                  className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors text-white hover:bg-white/10 border border-white/20 h-12 px-6 rounded-xl text-[15px]"
                >
                  Talk to us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FOOTER (EXACT 5-COLUMN FOOTER WITH LOGOS & GIANT SARVAM WATERMARK) */}
      {/* ========================================================================= */}
      <footer id="contact" className="border-t border-line bg-page">
        <div className="wrap pt-12 sm:pt-16 pb-8 sm:pb-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-12 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
            {/* Col 1: Sarvam Brand */}
            <div className="col-span-2 lg:col-span-1 max-w-[300px]">
              <img alt="Sarvam AI" width={140} height={36} className="h-8 w-auto object-contain" src="/sarvam-logo-black.svg" />
              <p className="text-[14px] leading-relaxed text-muted mt-4">
                AI employees that make your business calls: every lead, every list, in seven Indian languages.
              </p>
              <a href="mailto:support@sarvam.ai" className="inline-flex items-center min-h-11 mt-2 text-[14px] text-ink-2 hover:text-brand-600">
                support@sarvam.ai
              </a>
            </div>

            {/* Col 2: Product */}
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-ink mb-1 sm:mb-4">Product</div>
              <ul className="grid gap-0 sm:gap-2.5">
                <li><a className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors" href="#channels">Instant leads</a></li>
                <li><a className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors" href="#channels">Bulk campaigns</a></li>
                <li><a className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors" href="#channels">Inbound</a></li>
                <li><a className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors" href="#hear">Voices</a></li>
                <li><a className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors" href="#pricing">Pricing</a></li>
              </ul>
            </div>

            {/* Col 3: Industries */}
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-ink mb-1 sm:mb-4">Industries</div>
              <ul className="grid gap-0 sm:gap-2.5">
                <li><span className="inline-flex items-center text-[14px] text-muted">BFSI</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Real estate</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Healthcare</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Education</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Automotive</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">E-commerce</span></li>
              </ul>
            </div>

            {/* Col 4: By language */}
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-ink mb-1 sm:mb-4">By language</div>
              <ul className="grid gap-0 sm:gap-2.5">
                <li><span className="inline-flex items-center text-[14px] text-muted">Tamil AI voice agents</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Telugu AI voice agents</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Kannada AI voice agents</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Malayalam AI voice agents</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Hindi AI voice agents</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Marathi AI voice agents</span></li>
              </ul>
            </div>

            {/* Col 5: Resources */}
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-ink mb-1 sm:mb-4">Resources</div>
              <ul className="grid gap-0 sm:gap-2.5">
                <li><a href="https://sarvam.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors">Docs</a></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Blog</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Glossary</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Comparisons</span></li>
              </ul>
            </div>

            {/* Col 6: Company */}
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-ink mb-1 sm:mb-4">Company</div>
              <ul className="grid gap-0 sm:gap-2.5">
                <li><span className="inline-flex items-center text-[14px] text-muted">Contact</span></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Agency services</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Supported By (Sarvam + Cartesia) */}
          <div className="mt-10 sm:mt-16 pt-6 border-t border-line flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
              <span>© 2026 Sarvam Telephony &amp; Voice AI. All rights reserved.</span>
              <button type="button" onClick={() => onNavigate?.('terms')} className="hover:text-ink cursor-pointer">Terms</button>
              <button type="button" onClick={() => onNavigate?.('privacy')} className="hover:text-ink cursor-pointer">Privacy</button>
              <button type="button" onClick={() => onNavigate?.('terms')} className="hover:text-ink cursor-pointer">Refunds</button>
            </div>

            {/* Supported By Logos */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-[12.5px] uppercase tracking-wider text-faint">Supported by</span>
              <a
                href="https://www.sarvam.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  alt="Sarvam AI startup programme"
                  className="h-3.5 w-auto"
                  src="/sarvam-logo.png"
                />
              </a>
              <a
                href="https://cartesia.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  alt="Cartesia startup programme"
                  className="h-4 w-auto"
                  src="/cartesia-logo.png"
                />
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SARVAM AI SIGNATURE BOTTOM BRAND FLOWING INDIAN ART VIDEO MASK ANIMATION */}
        {/* ========================================================================= */}
        <div className="relative -mt-6 md:mt-2 -mb-2 md:-mb-5 mx-auto w-full max-w-[1240px] px-4 select-none" aria-hidden="true">
{/* Desktop Masked Video (Exact Sarvam AI Spec: aspect-[202/32]) */}
          <div className="hidden md:block">
            <div
              className="w-full aspect-[202/32] max-w-[1160px] mx-auto bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900"
              style={{
                WebkitMaskImage: 'url(/sarvam-wordmark-black.svg)',
                maskImage: 'url(/sarvam-wordmark-black.svg)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center'
              }}
              aria-hidden="true"
            />
          </div>

          {/* Mobile Masked Video (Exact Sarvam AI Spec: aspect-square) */}
          <div className="block md:hidden overflow-hidden translate-y-1/3">
            <div
              className="w-full aspect-square max-h-[160px] mx-auto bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900"
              style={{
                WebkitMaskImage: 'url(/sarvam-logo-black.svg)',
                maskImage: 'url(/sarvam-logo-black.svg)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center'
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}
