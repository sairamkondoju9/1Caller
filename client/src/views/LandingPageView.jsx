import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Zap,
  Megaphone,
  PhoneIncoming,
  Play,
  Pause,
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

export default function LandingPageView({ onLaunchConsole, onTalkToAgent, onOpenAuth, onNavigate }) {
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
    { id: 'en', label: 'English', name: 'English' },
    { id: 'te', label: 'తెలుగు', name: 'Telugu' },
    { id: 'hi', label: 'हिन्दी', name: 'Hindi' },
    { id: 'ta', label: 'தமிழ்', name: 'Tamil' },
    { id: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { id: 'ml', label: 'മലയാളം', name: 'Malayalam' },
    { id: 'mr', label: 'मराठी', name: 'Marathi' }
  ];

  const voiceLanguagesList = [
    { id: 'en', label: 'English', name: 'English' },
    { id: 'te', label: 'తెలుగు', name: 'Telugu' },
    { id: 'hi', label: 'हिन्दी', name: 'Hindi' },
    { id: 'ta', label: 'தமிழ்', name: 'Tamil' },
    { id: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { id: 'ml', label: 'മലയാളം', name: 'Malayalam' },
    { id: 'mr', label: 'मराठी', name: 'Marathi' }
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

  // Section 3: "Hear our voices" state (Real conversation audio across 7 regional languages)
  const voiceClipsData = {
  "hi": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/hindi/hindi_loans_insurance_P02.mp3",
      "direction": "outbound",
      "agent": "Sneha",
      "voice": "P02",
      "secs": 70,
      "frequencies": [
        38,
        35,
        48,
        57,
        29,
        65,
        64,
        60,
        25,
        50,
        27,
        88,
        33,
        60,
        67,
        46,
        63,
        64,
        95,
        57,
        34,
        39,
        96,
        44,
        27,
        46,
        88,
        77,
        77,
        82,
        43,
        76,
        73,
        70,
        27,
        63,
        59,
        65,
        63,
        48
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/hindi/hindi_loans_insurance_P02.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/hindi/hindi_real_estate_P01.mp3",
      "direction": "outbound",
      "agent": "Neha",
      "voice": "P01",
      "secs": 70,
      "frequencies": [
        43,
        51,
        34,
        37,
        40,
        70,
        70,
        29,
        36,
        34,
        35,
        88,
        38,
        75,
        87,
        90,
        49,
        83,
        87,
        56,
        74,
        36,
        80,
        28,
        88,
        29,
        27,
        75,
        64,
        52,
        32,
        34,
        43,
        67,
        35,
        35,
        26,
        29,
        34,
        48
      ],
      "id": "voice-realestate",
      "avatarInitial": "N",
      "fallbackSrc": "https://outpero.com/site/calls/hindi/hindi_real_estate_P01.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/hindi/hindi_coaching_P09.mp3",
      "direction": "outbound",
      "agent": "Ankit",
      "voice": "P09",
      "secs": 72,
      "frequencies": [
        33,
        39,
        35,
        55,
        33,
        74,
        68,
        66,
        38,
        33,
        55,
        71,
        84,
        25,
        76,
        25,
        71,
        59,
        42,
        72,
        46,
        53,
        77,
        94,
        73,
        93,
        65,
        83,
        76,
        47,
        31,
        34,
        81,
        72,
        63,
        61,
        55,
        63,
        65,
        55
      ],
      "id": "voice-education",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/hindi/hindi_coaching_P09.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/hindi/hindi_hospitals_P02.mp3",
      "direction": "inbound",
      "agent": "Pooja",
      "voice": "P02",
      "secs": 72,
      "frequencies": [
        29,
        25,
        53,
        52,
        55,
        58,
        76,
        56,
        76,
        65,
        71,
        52,
        33,
        65,
        27,
        57,
        41,
        92,
        46,
        25,
        44,
        30,
        85,
        80,
        30,
        91,
        34,
        60,
        43,
        30,
        27,
        30,
        50,
        51,
        30,
        70,
        27,
        57,
        24,
        54
      ],
      "id": "voice-customersupport",
      "avatarInitial": "P",
      "fallbackSrc": "https://outpero.com/site/calls/hindi/hindi_hospitals_P02.mp3"
    }
  ],
  "te": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/telugu/telugu_loans_insurance_P02.mp3",
      "direction": "outbound",
      "agent": "Sneha",
      "voice": "P02",
      "secs": 54,
      "frequencies": [
        31,
        36,
        27,
        44,
        45,
        65,
        22,
        50,
        61,
        77,
        43,
        90,
        71,
        76,
        51,
        43,
        55,
        80,
        23,
        87,
        88,
        77,
        77,
        51,
        78,
        74,
        22,
        23,
        42,
        86,
        24,
        66,
        30,
        40,
        52,
        64,
        57,
        52,
        30,
        47
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/telugu/telugu_loans_insurance_P02.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/telugu/telugu_real_estate_P01.mp3",
      "direction": "outbound",
      "agent": "Neha",
      "voice": "P01",
      "secs": 83,
      "frequencies": [
        50,
        55,
        23,
        52,
        69,
        59,
        55,
        80,
        25,
        22,
        53,
        73,
        48,
        42,
        44,
        74,
        85,
        61,
        48,
        61,
        44,
        58,
        36,
        30,
        52,
        76,
        54,
        79,
        67,
        23,
        45,
        85,
        51,
        72,
        42,
        33,
        38,
        39,
        49,
        41
      ],
      "id": "voice-realestate",
      "avatarInitial": "N",
      "fallbackSrc": "https://outpero.com/site/calls/telugu/telugu_real_estate_P01.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/telugu/telugu_coaching_P09.mp3",
      "direction": "outbound",
      "agent": "Meera",
      "voice": "P09",
      "secs": 91,
      "frequencies": [
        50,
        34,
        51,
        48,
        44,
        69,
        66,
        22,
        27,
        44,
        58,
        41,
        27,
        30,
        79,
        70,
        63,
        93,
        59,
        79,
        36,
        31,
        46,
        59,
        35,
        45,
        47,
        36,
        30,
        90,
        39,
        48,
        29,
        65,
        76,
        53,
        69,
        44,
        46,
        29
      ],
      "id": "voice-education",
      "avatarInitial": "M",
      "fallbackSrc": "https://outpero.com/site/calls/telugu/telugu_coaching_P09.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/telugu/telugu_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Kavya",
      "voice": "P07",
      "secs": 63,
      "frequencies": [
        57,
        37,
        51,
        68,
        33,
        42,
        62,
        50,
        30,
        69,
        41,
        34,
        54,
        40,
        80,
        90,
        30,
        86,
        31,
        58,
        78,
        87,
        36,
        50,
        59,
        52,
        94,
        71,
        59,
        73,
        74,
        54,
        58,
        80,
        51,
        69,
        51,
        24,
        31,
        23
      ],
      "id": "voice-customersupport",
      "avatarInitial": "K",
      "fallbackSrc": "https://outpero.com/site/calls/telugu/telugu_hospitals_P07.mp3"
    }
  ],
  "ta": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/tamil/tamil_loans_insurance_P07.mp3",
      "direction": "outbound",
      "agent": "Suresh",
      "voice": "P07",
      "secs": 66,
      "frequencies": [
        50,
        27,
        34,
        48,
        69,
        38,
        26,
        55,
        27,
        29,
        22,
        51,
        88,
        51,
        67,
        38,
        54,
        50,
        80,
        64,
        81,
        67,
        92,
        84,
        30,
        87,
        24,
        73,
        83,
        85,
        28,
        38,
        72,
        46,
        72,
        39,
        33,
        39,
        53,
        29
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/tamil/tamil_loans_insurance_P07.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/tamil/tamil_real_estate_P01.mp3",
      "direction": "outbound",
      "agent": "Kavya",
      "voice": "P01",
      "secs": 66,
      "frequencies": [
        60,
        30,
        46,
        57,
        54,
        42,
        59,
        40,
        51,
        80,
        58,
        84,
        73,
        86,
        87,
        94,
        27,
        22,
        82,
        68,
        58,
        80,
        72,
        66,
        72,
        53,
        46,
        31,
        46,
        37,
        29,
        31,
        57,
        40,
        71,
        56,
        60,
        48,
        51,
        41
      ],
      "id": "voice-realestate",
      "avatarInitial": "K",
      "fallbackSrc": "https://outpero.com/site/calls/tamil/tamil_real_estate_P01.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/tamil/tamil_coaching_P06.mp3",
      "direction": "outbound",
      "agent": "Deepa",
      "voice": "P06",
      "secs": 61,
      "frequencies": [
        44,
        36,
        32,
        55,
        63,
        61,
        32,
        47,
        35,
        53,
        69,
        30,
        39,
        29,
        53,
        77,
        39,
        60,
        81,
        69,
        98,
        24,
        46,
        31,
        26,
        77,
        90,
        81,
        86,
        22,
        60,
        65,
        61,
        73,
        37,
        47,
        31,
        34,
        25,
        37
      ],
      "id": "voice-education",
      "avatarInitial": "D",
      "fallbackSrc": "https://outpero.com/site/calls/tamil/tamil_coaching_P06.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/tamil/tamil_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Prakash",
      "voice": "P07",
      "secs": 71,
      "frequencies": [
        60,
        39,
        44,
        49,
        56,
        35,
        44,
        28,
        36,
        27,
        77,
        45,
        25,
        46,
        55,
        39,
        66,
        49,
        49,
        74,
        26,
        86,
        95,
        96,
        42,
        57,
        67,
        77,
        89,
        59,
        70,
        60,
        63,
        23,
        49,
        74,
        44,
        69,
        49,
        22
      ],
      "id": "voice-customersupport",
      "avatarInitial": "P",
      "fallbackSrc": "https://outpero.com/site/calls/tamil/tamil_hospitals_P07.mp3"
    }
  ],
  "kn": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/kannada/kannada_loans_insurance_P07.mp3",
      "direction": "outbound",
      "agent": "Ravi",
      "voice": "P07",
      "secs": 71,
      "frequencies": [
        40,
        63,
        66,
        60,
        30,
        36,
        75,
        39,
        81,
        54,
        61,
        58,
        44,
        81,
        95,
        88,
        97,
        53,
        64,
        36,
        62,
        74,
        59,
        93,
        62,
        91,
        40,
        30,
        25,
        30,
        85,
        64,
        52,
        54,
        46,
        53,
        49,
        27,
        65,
        53
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "R",
      "fallbackSrc": "https://outpero.com/site/calls/kannada/kannada_loans_insurance_P07.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/kannada/kannada_real_estate_P01.mp3",
      "direction": "outbound",
      "agent": "Shwetha",
      "voice": "P01",
      "secs": 64,
      "frequencies": [
        25,
        51,
        52,
        28,
        59,
        63,
        35,
        25,
        26,
        53,
        62,
        47,
        47,
        64,
        53,
        74,
        78,
        40,
        67,
        67,
        89,
        99,
        82,
        38,
        94,
        33,
        64,
        90,
        83,
        31,
        49,
        31,
        31,
        60,
        75,
        48,
        51,
        42,
        38,
        48
      ],
      "id": "voice-realestate",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/kannada/kannada_real_estate_P01.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/kannada/kannada_coaching_P02.mp3",
      "direction": "outbound",
      "agent": "Arpitha",
      "voice": "P02",
      "secs": 61,
      "frequencies": [
        59,
        35,
        49,
        62,
        65,
        75,
        64,
        71,
        48,
        35,
        26,
        42,
        74,
        66,
        71,
        54,
        31,
        80,
        93,
        57,
        28,
        89,
        85,
        66,
        82,
        43,
        50,
        38,
        72,
        53,
        75,
        23,
        67,
        77,
        23,
        27,
        33,
        57,
        46,
        52
      ],
      "id": "voice-education",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/kannada/kannada_coaching_P02.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/kannada/kannada_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Santosh",
      "voice": "P07",
      "secs": 68,
      "frequencies": [
        45,
        52,
        66,
        62,
        67,
        50,
        59,
        27,
        38,
        23,
        38,
        46,
        89,
        86,
        24,
        40,
        80,
        41,
        82,
        72,
        81,
        28,
        80,
        95,
        30,
        33,
        85,
        80,
        27,
        42,
        25,
        49,
        28,
        70,
        70,
        74,
        52,
        26,
        61,
        35
      ],
      "id": "voice-customersupport",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/kannada/kannada_hospitals_P07.mp3"
    }
  ],
  "ml": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/malayalam/malayalam_loans_insurance_P02.mp3",
      "direction": "outbound",
      "agent": "Anjali",
      "voice": "P02",
      "secs": 76,
      "frequencies": [
        54,
        44,
        44,
        52,
        60,
        31,
        24,
        35,
        38,
        45,
        51,
        64,
        65,
        40,
        75,
        77,
        97,
        60,
        82,
        40,
        28,
        24,
        92,
        44,
        74,
        81,
        67,
        46,
        39,
        36,
        45,
        62,
        55,
        76,
        46,
        50,
        70,
        47,
        39,
        51
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/malayalam/malayalam_loans_insurance_P02.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/malayalam/malayalam_real_estate_P06.mp3",
      "direction": "outbound",
      "agent": "Athira",
      "voice": "P06",
      "secs": 74,
      "frequencies": [
        52,
        59,
        55,
        49,
        22,
        44,
        53,
        59,
        44,
        56,
        88,
        46,
        77,
        89,
        35,
        62,
        35,
        73,
        71,
        45,
        78,
        86,
        88,
        91,
        97,
        23,
        68,
        94,
        37,
        29,
        53,
        46,
        62,
        38,
        75,
        64,
        35,
        51,
        40,
        24
      ],
      "id": "voice-realestate",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/malayalam/malayalam_real_estate_P06.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/malayalam/malayalam_coaching_P09.mp3",
      "direction": "outbound",
      "agent": "Arun",
      "voice": "P09",
      "secs": 64,
      "frequencies": [
        42,
        40,
        30,
        26,
        69,
        35,
        28,
        73,
        83,
        69,
        29,
        88,
        41,
        59,
        27,
        95,
        24,
        98,
        77,
        67,
        39,
        61,
        91,
        65,
        45,
        79,
        79,
        51,
        91,
        81,
        86,
        72,
        49,
        70,
        75,
        25,
        55,
        48,
        31,
        33
      ],
      "id": "voice-education",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/malayalam/malayalam_coaching_P09.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/malayalam/malayalam_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Joseph",
      "voice": "P07",
      "secs": 74,
      "frequencies": [
        58,
        38,
        28,
        25,
        33,
        56,
        76,
        80,
        23,
        34,
        60,
        54,
        52,
        79,
        40,
        55,
        95,
        39,
        33,
        48,
        78,
        62,
        80,
        52,
        70,
        77,
        49,
        33,
        67,
        73,
        69,
        82,
        76,
        32,
        70,
        66,
        23,
        55,
        60,
        53
      ],
      "id": "voice-customersupport",
      "avatarInitial": "J",
      "fallbackSrc": "https://outpero.com/site/calls/malayalam/malayalam_hospitals_P07.mp3"
    }
  ],
  "mr": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/marathi/marathi_loans_insurance_P02.mp3",
      "direction": "outbound",
      "agent": "Megha",
      "voice": "P02",
      "secs": 75,
      "frequencies": [
        61,
        51,
        45,
        32,
        51,
        49,
        51,
        38,
        40,
        80,
        61,
        73,
        72,
        59,
        38,
        77,
        26,
        47,
        70,
        43,
        64,
        87,
        88,
        42,
        64,
        62,
        38,
        71,
        62,
        89,
        42,
        59,
        43,
        50,
        23,
        47,
        61,
        49,
        41,
        54
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "M",
      "fallbackSrc": "https://outpero.com/site/calls/marathi/marathi_loans_insurance_P02.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/marathi/marathi_real_estate_P02.mp3",
      "direction": "outbound",
      "agent": "Priya",
      "voice": "P02",
      "secs": 72,
      "frequencies": [
        43,
        25,
        41,
        31,
        67,
        34,
        46,
        60,
        32,
        77,
        37,
        73,
        29,
        67,
        43,
        63,
        88,
        86,
        85,
        59,
        34,
        40,
        82,
        65,
        43,
        31,
        75,
        46,
        90,
        36,
        29,
        82,
        59,
        50,
        31,
        52,
        67,
        28,
        43,
        58
      ],
      "id": "voice-realestate",
      "avatarInitial": "P",
      "fallbackSrc": "https://outpero.com/site/calls/marathi/marathi_real_estate_P02.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/marathi/marathi_coaching_P06.mp3",
      "direction": "outbound",
      "agent": "Snehal",
      "voice": "P06",
      "secs": 70,
      "frequencies": [
        44,
        31,
        23,
        47,
        59,
        46,
        42,
        35,
        31,
        25,
        42,
        60,
        89,
        40,
        71,
        62,
        43,
        63,
        98,
        22,
        81,
        99,
        70,
        75,
        34,
        47,
        26,
        69,
        29,
        36,
        29,
        55,
        57,
        38,
        35,
        63,
        62,
        66,
        34,
        35
      ],
      "id": "voice-education",
      "avatarInitial": "S",
      "fallbackSrc": "https://outpero.com/site/calls/marathi/marathi_coaching_P06.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/marathi/marathi_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Amit",
      "voice": "P07",
      "secs": 73,
      "frequencies": [
        58,
        22,
        65,
        66,
        53,
        70,
        42,
        57,
        59,
        24,
        76,
        69,
        63,
        25,
        33,
        26,
        41,
        65,
        86,
        53,
        67,
        27,
        91,
        43,
        77,
        81,
        58,
        72,
        43,
        48,
        66,
        51,
        63,
        27,
        75,
        43,
        36,
        40,
        45,
        48
      ],
      "id": "voice-customersupport",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/marathi/marathi_hospitals_P07.mp3"
    }
  ],
  "en": [
    {
      "category": "Loans & insurance",
      "title": "Screens eligibility and chases documents",
      "src": "/site/calls/english/english_loans_insurance_P02.mp3",
      "direction": "outbound",
      "agent": "Kavya",
      "voice": "P02",
      "secs": 71,
      "frequencies": [
        23,
        51,
        50,
        44,
        24,
        37,
        77,
        62,
        66,
        77,
        49,
        58,
        46,
        93,
        64,
        66,
        23,
        25,
        28,
        46,
        96,
        28,
        75,
        55,
        78,
        52,
        90,
        50,
        54,
        79,
        58,
        36,
        76,
        47,
        60,
        42,
        38,
        44,
        24,
        54
      ],
      "id": "voice-loansinsurance",
      "avatarInitial": "K",
      "fallbackSrc": "https://outpero.com/site/calls/english/english_loans_insurance_P02.mp3"
    },
    {
      "category": "Real estate",
      "title": "Qualifies a property lead and books a site visit",
      "src": "/site/calls/english/english_real_estate_P06.mp3",
      "direction": "outbound",
      "agent": "Ananya",
      "voice": "P06",
      "secs": 70,
      "frequencies": [
        50,
        27,
        39,
        64,
        64,
        55,
        44,
        46,
        24,
        67,
        68,
        26,
        76,
        39,
        46,
        79,
        59,
        60,
        81,
        37,
        73,
        56,
        79,
        61,
        97,
        51,
        54,
        28,
        47,
        61,
        64,
        31,
        38,
        72,
        76,
        44,
        33,
        50,
        38,
        54
      ],
      "id": "voice-realestate",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/english/english_real_estate_P06.mp3"
    },
    {
      "category": "Education",
      "title": "Counsels a student and books a free demo class",
      "src": "/site/calls/english/english_coaching_P07.mp3",
      "direction": "outbound",
      "agent": "Karthik",
      "voice": "P07",
      "secs": 80,
      "frequencies": [
        30,
        55,
        47,
        53,
        51,
        56,
        71,
        70,
        40,
        28,
        56,
        61,
        66,
        86,
        43,
        68,
        82,
        88,
        51,
        96,
        83,
        84,
        79,
        34,
        85,
        74,
        72,
        77,
        60,
        90,
        74,
        34,
        22,
        48,
        27,
        47,
        56,
        47,
        49,
        48
      ],
      "id": "voice-education",
      "avatarInitial": "K",
      "fallbackSrc": "https://outpero.com/site/calls/english/english_coaching_P07.mp3"
    },
    {
      "category": "Customer support",
      "title": "Answers product questions and resolves issues",
      "src": "/site/calls/english/english_hospitals_P07.mp3",
      "direction": "inbound",
      "agent": "Arjun",
      "voice": "P07",
      "secs": 71,
      "frequencies": [
        42,
        34,
        38,
        67,
        51,
        55,
        56,
        79,
        28,
        82,
        28,
        24,
        25,
        58,
        61,
        79,
        81,
        95,
        34,
        34,
        49,
        49,
        99,
        54,
        68,
        74,
        46,
        35,
        52,
        83,
        28,
        72,
        52,
        49,
        27,
        39,
        50,
        33,
        46,
        54
      ],
      "id": "voice-customersupport",
      "avatarInitial": "A",
      "fallbackSrc": "https://outpero.com/site/calls/english/english_hospitals_P07.mp3"
    }
  ]
};

  const [activeVoiceLang, setActiveVoiceLang] = useState('en');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const audioPlayerRef = useRef(null);
  const currentClipRef = useRef(null);

  // Pause audio when unmounting
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  const formatVoiceTime = (totalSec) => {
    const s = Math.max(0, Math.floor(totalSec || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  };

  const handleTogglePlayVoice = (vc) => {
    if (playingVoiceId === vc.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingVoiceId(null);
      return;
    }

    currentClipRef.current = vc;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.addEventListener('timeupdate', () => {
        const audio = audioPlayerRef.current;
        if (audio && audio.duration) {
          setVoiceProgress(audio.currentTime / audio.duration);
          setCurrentTimeSec(audio.currentTime);
        }
      });
      audioPlayerRef.current.addEventListener('ended', () => {
        setPlayingVoiceId(null);
        setVoiceProgress(0);
        setCurrentTimeSec(0);
      });
      audioPlayerRef.current.addEventListener('error', () => {
        const activeClip = currentClipRef.current;
        if (audioPlayerRef.current && activeClip?.fallbackSrc && !audioPlayerRef.current.src.includes('outpero.com')) {
          audioPlayerRef.current.src = activeClip.fallbackSrc;
          audioPlayerRef.current.play().catch(() => setPlayingVoiceId(null));
        } else {
          setPlayingVoiceId(null);
        }
      });
    }

    const audio = audioPlayerRef.current;
    audio.src = vc.src;
    setVoiceProgress(0);
    setCurrentTimeSec(0);
    setPlayingVoiceId(vc.id);

    audio.play().catch((err) => {
      console.warn('Playback fallback to remote source:', err.message);
      if (vc.fallbackSrc) {
        audio.src = vc.fallbackSrc;
        audio.play().catch(() => setPlayingVoiceId(null));
      } else {
        setPlayingVoiceId(null);
      }
    });
  };

  const handleLanguageChange = (langId) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setPlayingVoiceId(null);
    setVoiceProgress(0);
    setCurrentTimeSec(0);
    setActiveVoiceLang(langId);
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
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600 cursor-pointer"
              href="#hear"
              onClick={(e) => { e.preventDefault(); document.getElementById('hear')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Voices
            </a>
            <a
              className="btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none text-ink-2 hover:text-ink hover:bg-canvas text-[13px] gap-1.5 relative z-[1] h-9 px-3 font-medium rounded-full hover:bg-transparent hover:translate-y-0 hover:text-brand-600 cursor-pointer"
              href="#pricing"
              onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
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
              onClick={() => onLaunchConsole?.(promptText)}
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
            <a href="#hear" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('hear')?.scrollIntoView({ behavior: 'smooth' }); }} className="block py-2 text-ink-2">Voices</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="block py-2 text-ink-2">Pricing</a>
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
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('hear');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                    const clips = voiceClipsData[activeVoiceLang] || voiceClipsData.en;
                    if (clips && clips[0] && !playingVoiceId) {
                      setTimeout(() => {
                        handleTogglePlayVoice(clips[0]);
                      }, 350);
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700 hover:text-brand-800 border-l border-line pl-3 whitespace-nowrap cursor-pointer"
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
              {voiceLanguagesList.map((lang) => (
                <button
                  key={lang.id}
                  role="tab"
                  aria-selected={activeVoiceLang === lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
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

          {/* 4 Real Conversational Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(voiceClipsData[activeVoiceLang] || voiceClipsData.en).map((vc) => {
              const isPlaying = playingVoiceId === vc.id;
              return (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => handleTogglePlayVoice(vc)}
                  className={`lift group text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                    isPlaying
                      ? 'border-brand-400 bg-paper shadow-lift ring-1 ring-brand-400/20'
                      : 'border-line bg-paper hover:border-line-2 hover:shadow-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="t-eyebrow text-[12.5px] text-muted">{vc.category}</span>
                    <span className="font-mono text-[12px] text-faint">
                      {isPlaying ? formatVoiceTime(currentTimeSec) : formatVoiceTime(vc.secs)}
                    </span>
                  </div>
                  <div className="mt-2.5 text-[14.5px] font-medium leading-snug text-ink min-h-[40px]">
                    {vc.title}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-[12.5px] font-semibold">
                      {vc.avatarInitial}
                    </span>
                    <span className="truncate">
                      <span className="text-ink-2 font-medium">{vc.agent}</span> · Voice <span className="font-mono">{vc.voice}</span>
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[12.5px] text-muted">
                      {vc.direction === 'inbound' ? (
                        <PhoneIncoming className="w-2.5 h-2.5 text-brand-600" />
                      ) : (
                        <PhoneOutgoing className="w-2.5 h-2.5 text-muted" />
                      )}
                      {vc.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                    </span>
                  </div>

                  {/* Play Button & Wave Bars with Live Audio Progress Filling */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 transition-colors ${
                      isPlaying ? 'bg-brand-600 text-white shadow-sm' : 'bg-ink text-white group-hover:bg-brand-600'
                    }`}>
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </span>
                    <span className="flex items-center gap-[2px] h-7 flex-1" aria-hidden="true">
                      {vc.frequencies.map((h, i) => {
                        const isFilled = isPlaying && (i / vc.frequencies.length) <= voiceProgress;
                        return (
                          <span
                            key={i}
                            className={`flex-1 rounded-full transition-colors duration-100 ${
                              isFilled ? 'bg-brand-600' : 'bg-line-2'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
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
                <li><button type="button" onClick={() => onNavigate?.('contact')} className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors cursor-pointer">Contact Us</button></li>
                <li><button type="button" onClick={() => onNavigate?.('shipping-and-delivery')} className="inline-flex items-center text-[14px] text-muted hover:text-brand-600 transition-colors cursor-pointer">Shipping &amp; Delivery</button></li>
                <li><span className="inline-flex items-center text-[14px] text-muted">Agency services</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Supported By (Sarvam + Cartesia) */}
          <div className="mt-10 sm:mt-16 pt-6 border-t border-line flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
              <span>© 2026 Outpero &bull; OpenDG Private Limited. All rights reserved.</span>
              <a href="https://docs.outpero.com/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Help &amp; Docs</a>
              <button type="button" onClick={() => onNavigate?.('terms-and-conditions')} className="hover:text-ink cursor-pointer">Terms</button>
              <button type="button" onClick={() => onNavigate?.('privacy-policy')} className="hover:text-ink cursor-pointer">Privacy</button>
              <button type="button" onClick={() => onNavigate?.('refund-policy')} className="hover:text-ink cursor-pointer">Refund</button>
              <button type="button" onClick={() => onNavigate?.('shipping-and-delivery')} className="hover:text-ink cursor-pointer">Shipping &amp; Delivery</button>
              <button type="button" onClick={() => onNavigate?.('contact')} className="hover:text-ink cursor-pointer">Contact</button>
              <a href="https://www.outpero.com/ai-employee" target="_blank" rel="noopener noreferrer" className="hover:text-ink text-[#7a50dc] font-medium">outpero.com</a>
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
