import { getAuthHeaders } from '../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { pickAutoNameAndVoice } from './DashboardView';
import { INDUSTRY_TEMPLATES, getIndustryDefaults } from '../utils/industryData';
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  Zap,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Phone,
  PhoneCall,
  PhoneOff,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Camera,
  Bot,
  PenTool,
  Sprout,
  RotateCcw,
  Building2,
  GraduationCap,
  Stethoscope,
  Car,
  Home,
  Sliders,
  X,
  FileText,
  CheckCircle2,
  Smile,
  ExternalLink,
  Lock,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  User,
  SlidersHorizontal,
  Wand2,
  Star,
  Music,
  Download,
  Flame,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Columns,
  BookOpen,
  Compass,
  Bell,
  Wallet,
  ChevronDown,
  Globe,
  Loader2,
  Headphones,
  Coffee,
  Store,
  Crown,
} from 'lucide-react';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';

function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function NewEmployeeView({ 
  onSaveEmployee, 
  onBuildEmployee,
  onNavigate, 
  initialStep = 4, 
  initialData = null,
  initialTab = null
}) {
  // Main Stepper: 2 = 'describe', 3 = 'hear-refine', 4 = 'employee-detail'
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [employeeId, setEmployeeId] = useState(initialData?.id || null);

  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  // Within Step 2 (Describe): 'brief' -> 'analyzing' -> 'quick-details'
  const [step2Mode, setStep2Mode] = useState('brief');

  // Brief prompt text (starts clean or from initialData)
  const [promptText, setPromptText] = useState(initialData?.prompt || '');
  const [employeePurpose, setEmployeePurpose] = useState(
    initialData?.purpose ||
      (initialData?.type === 'customer_support' || /customer support|customer service|support agent/i.test(initialData?.prompt || initialData?.prompt_text || '')
        ? 'support'
        : 'sales')
  );
  const [supportPolicies, setSupportPolicies] = useState(initialData?.supportPolicies || '');
  const [supportIssues, setSupportIssues] = useState(initialData?.supportIssues || '');
  const [employeeGenerationError, setEmployeeGenerationError] = useState('');
  const [isGeneratingEmployee, setIsGeneratingEmployee] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.industry || null);
  const [otherCategoryText, setOtherCategoryText] = useState('');
  const [otherNextActionText, setOtherNextActionText] = useState('');
  const [otherActionText, setOtherActionText] = useState('');

  const promptSpeech = useSpeechRecognition();
  const swaraSpeech = useSpeechRecognition();
  const factSpeech = useSpeechRecognition();

  const PRIMARY_LANGUAGES = [
    { code: 'te', langCode: 'te-IN', label: 'తెలుగు', name: 'Telugu' },
    { code: 'hi', langCode: 'hi-IN', label: 'हिन्दी', name: 'Hindi' },
    { code: 'ta', langCode: 'ta-IN', label: 'தமிழ்', name: 'Tamil' },
    { code: 'kn', langCode: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { code: 'ml', langCode: 'ml-IN', label: 'മലയാളം', name: 'Malayalam' },
    { code: 'mr', langCode: 'mr-IN', label: 'मराठी', name: 'Marathi' },
    { code: 'en', langCode: 'en-IN', label: 'English', name: 'English' }
  ];

  const getSpeechLangCode = (langStr) => {
    const l = (langStr || '').toLowerCase();
    if (l.includes('telugu') || l.includes('te')) return 'te-IN';
    if (l.includes('hindi') || l.includes('hi')) return 'hi-IN';
    if (l.includes('tamil') || l.includes('ta')) return 'ta-IN';
    if (l.includes('kannada') || l.includes('kn')) return 'kn-IN';
    if (l.includes('malayalam') || l.includes('ml')) return 'ml-IN';
    if (l.includes('marathi') || l.includes('mr')) return 'mr-IN';
    return 'en-IN';
  };

  const [swaraLangCode, setSwaraLangCode] = useState(
    getSpeechLangCode(initialData?.language || 'Telugu')
  );
  const [customCategoryText, setCustomCategoryText] = useState('');

  // Dynamic AI Metadata
  const [employeeName, setEmployeeName] = useState(initialData?.name || '');
  const [businessName, setBusinessName] = useState(initialData?.business || '');
  const [employeeRole, setEmployeeRole] = useState(initialData?.role || (employeePurpose === 'support' ? 'Customer Support Specialist' : ''));
  const [openingGreeting, setOpeningGreeting] = useState(initialData?.opening_greeting || '');
  const [employeeLanguage, setEmployeeLanguage] = useState(
    initialData?.language
      ? (initialData.language === 'English' ? 'English (Indian & Global)' : `${initialData.language} + English`)
      : 'Telugu + English'
  );
  const [aiSmallContext, setAiSmallContext] = useState('');

  // Dynamic Quick Details questions from AI (5 Questions starting with Business Name!)
  const [quickQuestions, setQuickQuestions] = useState([
    {
      step: 1,
      id: 'business_name',
      title: 'What is your business name?',
      subtitle: 'So your test call sounds like your business.',
      defaultValue: '',
      type: 'text'
    },
    {
      step: 2,
      id: 'price_range',
      title: 'What is the price or budget range of your offerings?',
      subtitle: 'So your test call sounds like your business.',
      defaultValue: '',
      type: 'text'
    },
    {
      step: 3,
      id: 'categories',
      title: 'Which categories or services do you offer?',
      subtitle: 'Tick all that apply.',
      options: [],
      defaultSelected: [],
      type: 'chips'
    },
    {
      step: 4,
      id: 'next_action',
      title: 'What should the caller do next?',
      subtitle: 'So your test call sounds like your business.',
      options: [],
      defaultSelected: [],
      type: 'pills'
    }
  ]);

  // Quick Details question index (0 to 3)
  const [questionIdx, setQuestionIdx] = useState(0);
  const [priceRange, setPriceRange] = useState('');
  const [selectedJewelleryTypes, setSelectedJewelleryTypes] = useState([]);
  const [jewelleryOptions, setJewelleryOptions] = useState([]);

  const [selectedActions, setSelectedActions] = useState([
    'Schedule a visit',
    'Store visit',
    'Order via phone',
    'Send details on WhatsApp'
  ]);
  const [actionOptions, setActionOptions] = useState([
    'Schedule a visit',
    'Store visit',
    'Order via phone',
    'Send details on WhatsApp',
    'Request a callback',
    'Other'
  ]);
  const [q2Selection, setQ2Selection] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [q4Selection, setQ4Selection] = useState('');

  const prepareEmployeeSetup = async (customPrompt, lang, categoryOverride) => {
    const brief = customPrompt || promptText;
    if (brief.trim().length < 10) throw new Error('Describe the business and employee requirements in at least 10 characters.');

    const industry = categoryOverride !== undefined ? categoryOverride : selectedCategory;
    setQuickQuestions([
      { step: 1, id: 'business_name', title: 'What is your business name?', subtitle: 'Use the name customers know.', defaultValue: '', type: 'text' },
      { step: 2, id: 'price_range', title: 'What price or budget details may the employee share?', subtitle: 'Leave blank if the employee should not quote prices.', defaultValue: '', type: 'text' },
      { step: 3, id: 'categories', title: 'Which products, services, or issues should the employee handle?', subtitle: 'Select or enter only details your business confirms.', options: ['Products', 'Services', 'Appointments', 'Support requests', 'Other'], defaultSelected: [], type: 'chips' },
      { step: 4, id: 'next_action', title: 'What should the caller do next?', subtitle: 'Choose an action the business can actually support.', options: ['Request a callback', 'Schedule an appointment', 'Visit the business', 'Other'], defaultSelected: [], type: 'pills' }
    ]);
    setActionOptions(['Request a callback', 'Schedule an appointment', 'Visit the business', 'Other']);
    setJewelleryOptions(['Products', 'Services', 'Appointments', 'Support requests', 'Other']);
    setPriceRange('');
    setSelectedJewelleryTypes([]);
    setQ2Selection('');
    setQ4Selection('');
    setScriptSteps([]);
    setOpeningGreeting('');
    setAiSmallContext('');
    return { industry, language: lang || 'en' };
  };
  useEffect(() => {
    if (initialData) {
      if (initialData.name) setEmployeeName(initialData.name);
      if (initialData.business) setBusinessName(initialData.business);
      if (initialData.role) setEmployeeRole(initialData.role);
      if (initialData.industry) setSelectedCategory(initialData.industry);
      if (initialData.voice) setSelectedVoiceId(initialData.voice);
      if (initialData.scriptSteps && Array.isArray(initialData.scriptSteps) && initialData.scriptSteps.length > 0) {
        setScriptSteps(initialData.scriptSteps);
      } else if (initialData.call_steps && Array.isArray(initialData.call_steps) && initialData.call_steps.length > 0 && typeof initialData.call_steps[0] === 'object') {
        setScriptSteps(initialData.call_steps);
      } else {
        const empName = initialData.name || 'Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â±ÂÃ Â°Â®Ã Â°Â¿';
        const bizName = initialData.business || 'Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â';
        const isTe = !initialData.language || initialData.language.toLowerCase().includes('telugu') || initialData.language.toLowerCase().startsWith('te');
        const offeringsNoun = initialData.industry === 'Car & bike dealership' ? 'Ã Â°â€¢Ã Â°Â¾Ã Â°Â°Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°Â¾ Ã Â°Å¸Ã Â±â€ Ã Â°Â¸Ã Â±ÂÃ Â°Å¸Ã Â±Â Ã Â°Â¡Ã Â±ÂÃ Â°Â°Ã Â±Ë†Ã Â°ÂµÃ Â±Â' : (initialData.industry === 'Hospital & clinic' ? 'Ã Â°Â¡Ã Â°Â¾Ã Â°â€¢Ã Â±ÂÃ Â°Å¸Ã Â°Â°Ã Â±Â Ã Â°â€¢Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â°Â²Ã Â±ÂÃ Â°Å¸Ã Â±â€¡Ã Â°Â·Ã Â°Â¨Ã Â±Â Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°Â¾ Ã Â°â€¦Ã Â°ÂªÃ Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°â€šÃ Â°Å¸Ã Â±ÂÃ¢â‚¬Å’Ã Â°Â®Ã Â±â€ Ã Â°â€šÃ Â°Å¸Ã Â±Â' : 'Ã Â°Â¸Ã Â°Â°Ã Â±ÂÃ Â°ÂµÃ Â±â‚¬Ã Â°Â¸Ã Â±â€ Ã Â°Â¸Ã Â±Â Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°Â¾ Ã Â°â€¢Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â°Â²Ã Â±ÂÃ Â°Å¸Ã Â±â€¡Ã Â°Â·Ã Â°Â¨Ã Â±Â');
        const priceStr = initialData.industry === 'Car & bike dealership' ? '6.5 Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â² Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Å¡Ã Â°Â¿ 28 Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â²Ã Â±Â' : (initialData.industry === 'Hospital & clinic' ? '500' : '5222');
        const steps = [
          {
            id: 1,
            title: '1. Orient & Context',
            badge: 'START',
            body: isTe
              ? `Once they've confirmed their identity, introduce yourself as '${empName}' from '${bizName}', and remind them they enquired about our ${offeringsNoun}. Mention you'll help with info or next steps. Keep it brief and friendly Ã¢â‚¬â€ for example you might say: 'Ã Â°Â¨Ã Â±â€¡Ã Â°Â¨Ã Â±Â ${empName}, ${bizName} Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Â¡Ã Â°Â¿ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°Â°Ã Â±Â Ã Â°Â®Ã Â°Â¾ ${offeringsNoun} Ã Â°â€”Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ enquiry Ã Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â°Â¾Ã Â°Â°Ã Â±Â Ã Â°â€¢Ã Â°Â¦Ã Â°Â¾, Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂÃ Â°Â¦Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°â€¢Ã Â±ÂÃ Â°Â²Ã Â°Â¾Ã Â°Â°Ã Â°Â¿Ã Â°Å¸Ã Â±â‚¬ Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾ Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°Â¾ Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â¤Ã Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°â€¢Ã Â±â€¹Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾?'`
              : `Once they've confirmed their identity, introduce yourself as '${empName}' from '${bizName}', and remind them they enquired about our ${offeringsNoun}. Mention you'll help with info or next steps. Keep it brief and friendly.`
          },
          {
            id: 2,
            title: '2. Qualify Need',
            body: isTe
              ? `Find out what specific ${offeringsNoun} they are interested in, and if they have any particular requirement or question. Ask ONE thing at a time, wait for their answer, and respond naturally before the next question. For example: 'Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°Â ${offeringsNoun} Ã Â°â€”Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°Â¤Ã Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°â€¢Ã Â±â€¹Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â°Â¿ Ã Â°â€°Ã Â°â€šÃ Â°Â¦Ã Â°Â¿ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿?'`
              : `Find out what specific ${offeringsNoun} they are interested in, and if they have any particular requirement or question. Ask ONE thing at a time, wait for their answer, and respond naturally before the next question.`
          },
          {
            id: 3,
            title: '3. Share Info & Answer Questions',
            body: isTe
              ? `Based on their interest, briefly explain how our ${offeringsNoun} work and mention the price (${priceStr}) if they ask or if it's relevant. Answer any questions they have. Mention you'll arrange a callback for more in-depth help. For example: 'Ã Â°Â®Ã Â°Â¾ ${offeringsNoun} Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Å¡Ã Â±â€ Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°ÂªÃ Â±ÂÃ Â°Â°Ã Â±Ë†Ã Â°Â¸Ã Â±Â Ã Â°ÂÃ Â°Â¤Ã Â±â€¡ ${priceStr}. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¹ Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ callback arrange Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â.'`
              : `Based on their interest, briefly explain how our ${offeringsNoun} work and mention the price (${priceStr}) if they ask or if it's relevant. Answer any questions they have. Mention you'll arrange a callback for more in-depth help.`
          },
          {
            id: 4,
            title: '4. Book Callback / Capture Next Step',
            body: isTe
              ? `Offer to arrange a callback from our team for more details or to help them proceed. Confirm their preferred callback time and thank them warmly. For example: 'Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂµÃ Â±â‚¬Ã Â°Â²Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨ Ã Â°Å¸Ã Â±Ë†Ã Â°Â®Ã Â±Â Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â®Ã Â°Â¾ Ã Â°Å¸Ã Â±â‚¬Ã Â°Â®Ã Â±Â Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°â€¢Ã Â°Â¾Ã Â°Â²Ã Â±Â arrange Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â. Ã Â°Â¸Ã Â°Â°Ã Â±â€¡Ã Â°Â¨Ã Â°Â¾?'`
              : `Offer to arrange a callback from our team for more details or to help them proceed. Confirm their preferred callback time and thank them warmly.`
          },
          {
            id: 5,
            title: '5. Close',
            body: isTe
              ? `Wrap up warmly, confirming the next step and letting them know they can reach out if they have more questions. For example: 'Ã Â°Â¸Ã Â°Â°Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â®Ã Â°Â¾ Ã Â°Å¸Ã Â±â‚¬Ã Â°Â®Ã Â±Â Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°Â²Ã Â±Â Ã Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â°Â¾Ã Â°Â°Ã Â±Â. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¹ Ã Â°Â¡Ã Â±Å’Ã Â°Å¸Ã Â±Â Ã Â°â€°Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ anytime Ã Â°â€¦Ã Â°Â¡Ã Â°â€”Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â. Ã Â°Â¥Ã Â°Â¾Ã Â°â€šÃ Â°â€¢Ã Â±ÂÃ Â°Â¯Ã Â±â€š!'`
              : `Wrap up warmly, confirming the next step and letting them know they can reach out if they have more questions.`
          },
          {
            id: 6,
            title: '6. FAQs',
            body: `Common questions callers ask, and how to answer them. Add one per line as "Q: Ã¢â‚¬Â¦ A: Ã¢â‚¬Â¦".\nAnswer ONLY from what's written here; if a question isn't listed, use your don't-know response.\n\ne.g.\nQ: What are your timings?  A: We're open 9am to 6pm, Monday to Saturday.\nQ: Do you offer home delivery?  A: Yes, free within the city.`
          }
        ];
        setScriptSteps(steps);
      }
      setActiveEmployeeTab(initialData.initialTab || 'call-script');
      if (initialData.prompt) {
        setPromptText(initialData.prompt);
        if (!initialData.scriptSteps) {
          setStep2Mode('analyzing');
          prepareEmployeeSetup(initialData.prompt, initialData.language ? (initialData.language.toLowerCase().startsWith('te') ? 'te' : 'en') : 'te')
            .then(() => setStep2Mode('quick-details'))
            .catch(() => setStep2Mode('brief'));
        }
      }
      if (initialData.language) {
        const langName = initialData.language;
        setEmployeeLanguage(langName === 'English' ? 'English (Indian & Global)' : `${langName} + English`);
      }
    }
  }, [initialData]);

  const handleProceedToQuickDetails = async () => {
    if (employeePurpose === 'support') {
      setEmployeeGenerationError('');
      setQuestionIdx(0);
      setStep2Mode('quick-details');
      return;
    }
    setStep2Mode('analyzing');
    const effectiveInd = selectedCategory === 'Other' && customCategoryText.trim()
      ? customCategoryText.trim()
      : selectedCategory;
    setEmployeeGenerationError('');
    try {
      await prepareEmployeeSetup(promptText, undefined, effectiveInd);
      setStep2Mode('quick-details');
      setQuestionIdx(0);
    } catch {
      setStep2Mode('brief');
    }
  };

  // Step 3 (Hear & refine) State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('Sairam');
  const [leadPhone, setLeadPhone] = useState('+918919112039');
  const [showPreCallModal, setShowPreCallModal] = useState(false);
  const [hasAgreedConsent, setHasAgreedConsent] = useState(true);

  // Phone Call Simulator State
  const [callState, setCallState] = useState('idle'); // 'idle' | 'ringing' | 'connected' | 'call-ended'
  const [isMuted, setIsMuted] = useState(false);

  // Audio Reference
  const audioRef = useRef(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(88); // 1:28
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Step 4 (Employee Detail) State
  const [activeEmployeeTab, setActiveEmployeeTab] = useState(
    initialTab || initialData?.initialTab || 'call-script'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveEmployeeTab(initialTab);
    } else if (initialData?.initialTab) {
      setActiveEmployeeTab(initialData.initialTab);
    }
  }, [initialTab, initialData?.initialTab]);

  const [tourStep, setTourStep] = useState(2); // 1 to 10
  const [showTour, setShowTour] = useState(true);
  const [strictnessValue, setStrictnessValue] = useState(2);
  const [extraCallRules, setExtraCallRules] = useState('');
  const [swaraInput, setSwaraInput] = useState('');
  const [isSwaraThinking, setIsSwaraThinking] = useState(false);
  const [swaraFeedback, setSwaraFeedback] = useState('');
  const [teluguEnhance, setTeluguEnhance] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Voice tab state (Screenshots 2, 3, 4, 5)
  const [selectedVoiceId, setSelectedVoiceId] = useState(initialData?.voice || 'P09');
  const [primaryLanguage, setPrimaryLanguage] = useState('Hindi');
  const [alsoSpeaks, setAlsoSpeaks] = useState(['English']);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('Any mood');
  const [genderFilter, setGenderFilter] = useState('Any gender');
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.40);
  const [selectedAmbience, setSelectedAmbience] = useState('Call Center');

  // Actions Tab State (Screenshot 5)
  const [apiActionsEnabled, setApiActionsEnabled] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState(null);

  // Instant Leads Tab State
  const [leadCallDelay, setLeadCallDelay] = useState(10);
  const [callingWindowStart, setCallingWindowStart] = useState('09:00 AM');
  const [callingWindowEnd, setCallingWindowEnd] = useState('08:00 PM');
  const [outsideHoursMode, setOutsideHoursMode] = useState('auto-send'); // 'auto-send' | 'manual' | 'skip'
  const [releaseTiming, setReleaseTiming] = useState('next-open'); // 'next-open' | '+3hrs' | '+6hrs' | 'next-day'
  const [outsideHoursDelay, setOutsideHoursDelay] = useState(3);
  const [retryIntervals, setRetryIntervals] = useState([20, 120]);
  const [callingDays, setCallingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [respectDnc, setRespectDnc] = useState(true);
  const [duplicateLeadWindow, setDuplicateLeadWindow] = useState(5);
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [selectedOutcomes, setSelectedOutcomes] = useState([]); // multi-select outcomes: 'Callback', 'Qualified', 'Voicemail'
  const [holidaysDate, setHolidaysDate] = useState('');
  const [maxAtOnce, setMaxAtOnce] = useState('Unlimited');

  const toggleOutcome = (outcome) => {
    if (selectedOutcomes.includes(outcome)) {
      setSelectedOutcomes(selectedOutcomes.filter((o) => o !== outcome));
    } else {
      setSelectedOutcomes([...selectedOutcomes, outcome]);
    }
  };
  const [sentimentFilter, setSentimentFilter] = useState('All'); // 'All' | 'Positive' | 'Neutral' | 'Negative'
  const [timeFilter, setTimeFilter] = useState('Any time');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Training tab chat & facts
  const [trainingInput, setTrainingInput] = useState('');
  const [trainingChat, setTrainingChat] = useState([
    { role: 'user', text: 'Where is your shop located?' },
    { role: 'jagan', text: 'Maa showroom Jillelaguda main road lo undi andi. Meeru visit cheyali anukuntunnara? WhatsApp lo location map share cheyana?' }
  ]);
  const [factsList, setFactsList] = useState([
    { label: 'Areas you cover', value: 'jillelaguda' },
    { label: 'Offers', value: 'no gst no making charges on all of our jewellery silver and gold' },
    { label: 'Prices', value: '5000 to 1500000' },
    { label: 'What you sell', value: 'Gold jewellery, Silver jewellery, Diamond jewellery' }
  ]);
  const [newFactInput, setNewFactInput] = useState('');

  // Call Logs Data for Instant Leads tab
  const rawCallLogs = [
    {
      id: '#9243302c',
      contact: '+918919112039',
      badge: 'TEST CALL',
      duration: '1:30',
      cost: 'Ã¢â€šÂ¹10.20',
      outcome: 'Qualified',
      sentiment: 'Neutral',
      jewelleryType: 'gold',
      sendWhatsapp: 'true',
      time: 'Today 4:47 pm',
      summary: 'The caller expressed interest in gold jewellery and requested the shop location details to be sent via WhatsApp, without committing to a visit or purchase.'
    },
    {
      id: '#8fc9d161',
      contact: '+918919112039',
      badge: 'TEST CALL',
      duration: '0:04',
      cost: 'Ã¢â€šÂ¹3.40',
      outcome: 'Voicemail',
      sentiment: 'Neutral',
      jewelleryType: 'Ã¢â‚¬â€',
      sendWhatsapp: 'Ã¢â‚¬â€',
      time: 'Today 4:43 pm',
      summary: 'Reached voicemail/an answering machine. Call terminated.'
    },
    {
      id: '#0537e41c',
      contact: 'Jagan',
      badge: 'Web call',
      duration: '0:00',
      cost: 'Ã¢â€šÂ¹0.00',
      outcome: 'Callback',
      sentiment: 'Neutral',
      jewelleryType: 'Ã¢â‚¬â€',
      sendWhatsapp: 'Ã¢â‚¬â€',
      time: 'Today 5:00 pm',
      summary: 'No summary'
    }
  ];

  // Filtered Call Logs
  const filteredCallLogs = rawCallLogs.filter((call) => {
    if (selectedOutcomes.length > 0 && !selectedOutcomes.includes(call.outcome)) return false;
    if (sentimentFilter !== 'All' && call.sentiment !== sentimentFilter) return false;
    if (searchLeadQuery) {
      const q = searchLeadQuery.toLowerCase();
      return (
        call.contact.toLowerCase().includes(q) ||
        call.summary.toLowerCase().includes(q) ||
        call.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Real Telugu Conversation Turns (1:28 recording)
  const realCallTurns = [
    { time: 0, speaker: 'Jagan', text: 'Ã Â°Â¹Ã Â°Â²Ã Â±â€¹ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â Ã Â°Â¤Ã Â±â€¹ Ã Â°Â®Ã Â°Â¾Ã Â°Å¸Ã Â±ÂÃ Â°Â²Ã Â°Â¾Ã Â°Â¡Ã Â±ÂÃ Â°Â¤Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¨Ã Â°Â¾?' },
    { time: 4, speaker: 'Sairam', text: 'Ã Â°â€¦Ã Â°ÂµÃ Â±ÂÃ Â°Â¨Ã Â°ÂµÃ Â±ÂÃ Â°Â¨Ã Â±Â.' },
    { time: 6, speaker: 'Jagan', text: 'Ã Â°Â¨Ã Â°Â®Ã Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â¨Ã Â±â€¡Ã Â°Â¨Ã Â±Â Ã Â°Å“Ã Â°â€”Ã Â°Â¨Ã Â±Â Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â°Â°Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Å“Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â²Ã Â±â€ Ã Â°Â²Ã Â°â€”Ã Â±â€šÃ Â°Â¡ Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Â¡Ã Â°Â¿ Ã Â°Â®Ã Â°Â¾Ã Â°Å¸Ã Â±ÂÃ Â°Â²Ã Â°Â¾Ã Â°Â¡Ã Â±ÂÃ Â°Â¤Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¨Ã Â±Â. Ã Â°Â®Ã Â±â‚¬Ã Â°Â°Ã Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â°Â°Ã Â±â‚¬ Ã Â°â€”Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°Å½Ã Â°â€šÃ Â°â€¢Ã Â±ÂÃ Â°ÂµÃ Â±Ë†Ã Â°Â°Ã Â±â‚¬ Ã Â°Å¡Ã Â±â€¡Ã Â°Â¶Ã Â°Â¾Ã Â°Â°Ã Â±Â Ã Â°â€¢Ã Â°Â¦Ã Â°Â¾? Ã Â°Â®Ã Â°Â¾ Ã Â°Â·Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°Â²Ã Â±â€¹ Ã Â°â€¡Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°â€¢Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°Â¸Ã Â±ÂÃ Â°Â®Ã Â°Â¸Ã Â±Â Ã Â°â€ Ã Â°Â«Ã Â°Â°Ã Â±Â Ã Â°Â¨Ã Â°Â¡Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â±â€¹Ã Â°â€šÃ Â°Â¦Ã Â°Â¿. Ã Â°â€”Ã Â±â€¹Ã Â°Â²Ã Â±ÂÃ Â°Â¡Ã Â±Â, Ã Â°Â¸Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°ÂµÃ Â°Â°Ã Â±Â, Ã Â°Â¡Ã Â±Ë†Ã Â°Â®Ã Â°â€šÃ Â°Â¡Ã Â±Â Ã Â°â€¦Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¿Ã Â°â€šÃ Â°Å¸Ã Â°Â¿Ã Â°ÂªÃ Â±Ë† Ã Â°Å“Ã Â±â‚¬Ã Â°Å½Ã Â°Â¸Ã Â±ÂÃ Â°Å¸Ã Â±â‚¬, Ã Â°Â®Ã Â±â€¡Ã Â°â€¢Ã Â°Â¿Ã Â°â€šÃ Â°â€”Ã Â±Â Ã Â°â€ºÃ Â°Â¾Ã Â°Â°Ã Â±ÂÃ Â°Å“Ã Â±â€ Ã Â°Â¸Ã Â±Â Ã Â°ÂÃ Â°Â®Ã Â±â‚¬ Ã Â°Â²Ã Â±â€¡Ã Â°ÂµÃ Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°Â Ã Â°Å¸Ã Â±Ë†Ã Â°ÂªÃ Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â°Â°Ã Â±â‚¬Ã Â°Â²Ã Â±â€¹ Ã Â°â€¡Ã Â°â€šÃ Â°Å¸Ã Â±ÂÃ Â°Â°Ã Â±â€ Ã Â°Â¸Ã Â±ÂÃ Â°Å¸Ã Â±Â Ã Â°â€°Ã Â°â€šÃ Â°Â¦Ã Â°Â¿?' },
    { time: 25, speaker: 'Sairam', text: 'Ã Â°â€”Ã Â±â€¹Ã Â°Â²Ã Â±ÂÃ Â°Â¡Ã Â±Â.' },
    { time: 27, speaker: 'Jagan', text: 'Ã Â°â€œÃ Â°â€¢Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°â€”Ã Â±â€¹Ã Â°Â²Ã Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â°Â°Ã Â±â‚¬Ã Â°Â²Ã Â±â€¹ Ã Â°â€¦Ã Â°Â¯Ã Â°Â¿Ã Â°Â¤Ã Â±â€¡ Ã Â°Å¡Ã Â°Â¾Ã Â°Â²Ã Â°Â¾ Ã Â°Â®Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°â€¢Ã Â°Â²Ã Â±â€ Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€°Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±â€¡Ã Â°Â®Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°ÂªÃ Â°Â°Ã Â±ÂÃ Â°Å¸Ã Â°Â¿Ã Â°â€¢Ã Â±ÂÃ Â°Â¯Ã Â±ÂÃ Â°Â²Ã Â°Â°Ã Â±Â Ã Â°Â¬Ã Â°Â¡Ã Â±ÂÃ Â°Å“Ã Â±â€ Ã Â°Å¸Ã Â±Â Ã Â°â€°Ã Â°â€šÃ Â°Â¦Ã Â°Â¾ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿? Ã Â°â€¦Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ 5,000 Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Å¡Ã Â°Â¿ 15 Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â² Ã Â°ÂµÃ Â°Â°Ã Â°â€¢Ã Â±Â Ã Â°Â®Ã Â°Â¨ Ã Â°Â¦Ã Â°â€”Ã Â±ÂÃ Â°â€”Ã Â°Â° Ã Â°â€ Ã Â°ÂªÃ Â±ÂÃ Â°Â·Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€°Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿.' },
    { time: 39, speaker: 'Sairam', text: 'Ã Â°Â¸Ã Â°Â°Ã Â±â€¡.' },
    { time: 41, speaker: 'Jagan', text: 'Ã Â°Â¸Ã Â°Â°Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°â€¦Ã Â°Â°Ã Â±ÂÃ Â°Â¥Ã Â°Â®Ã Â±Ë†Ã Â°â€šÃ Â°Â¦Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°â€”Ã Â±â€¹Ã Â°Â²Ã Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â°Â°Ã Â±â‚¬Ã Â°Â²Ã Â±â€¹ Ã Â°ÂÃ Â°ÂµÃ Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°ÂªÃ Â°Â°Ã Â±ÂÃ Â°Å¸Ã Â°Â¿Ã Â°â€¢Ã Â±ÂÃ Â°Â¯Ã Â±ÂÃ Â°Â²Ã Â°Â°Ã Â±Â Ã Â°Â¡Ã Â°Â¿Ã Â°Å“Ã Â±Ë†Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Å¡Ã Â±â€šÃ Â°Â¡Ã Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â°Â¿ Ã Â°â€°Ã Â°â€šÃ Â°Â¦Ã Â°Â¾? Ã Â°Â²Ã Â±â€¡Ã Â°â€¢ Ã Â°â€¢Ã Â°Â²Ã Â±â€ Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¦Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â±â‚¬ Ã Â°â€™Ã Â°â€¢Ã Â°Â¸Ã Â°Â¾Ã Â°Â°Ã Â°Â¿ Ã Â°Å¡Ã Â±â€šÃ Â°Â¡Ã Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â±ÂÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Å¸Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â°Ã Â°Â¾?' },
    { time: 50, speaker: 'Sairam', text: 'Ã Â°â€¢Ã Â°Â²Ã Â±â€ Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¦Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â±â‚¬ Ã Â°â€™Ã Â°â€¢Ã Â°Â¸Ã Â°Â¾Ã Â°Â°Ã Â°Â¿ Ã Â°Å¡Ã Â±â€šÃ Â°Â¡Ã Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â±ÂÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Å¸Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¨Ã Â±Â.' },
    { time: 53, speaker: 'Jagan', text: 'Ã Â°Â¤Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Â¡Ã Â°Â¾ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°â€¢Ã Â°Â²Ã Â±â€ Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â°Â¨Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¦Ã Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â±â‚¬ Ã Â°Å¡Ã Â°Â¾Ã Â°Â²Ã Â°Â¾ Ã Â°Â¬Ã Â°Â¾Ã Â°â€”Ã Â±ÂÃ Â°â€šÃ Â°Å¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°Â°Ã Â±Å Ã Â°â€¢Ã Â°Â¸Ã Â°Â¾Ã Â°Â°Ã Â°Â¿ Ã Â°Â®Ã Â°Â¾ Ã Â°Â·Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°â€¢Ã Â°Â¿ Ã Â°ÂµÃ Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â°Â¿ Ã Â°Å¡Ã Â±â€šÃ Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â±â€¡ Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°Â¨Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â°Â¿Ã Â°Â¨Ã Â°ÂµÃ Â°Â¿ Ã Â°Â¸Ã Â±â€ Ã Â°Â²Ã Â±â€ Ã Â°â€¢Ã Â±ÂÃ Â°Å¸Ã Â±Â Ã Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â±ÂÃ Â°â€¢Ã Â±â€¹Ã Â°ÂµÃ Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â. Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂµÃ Â±â‚¬Ã Â°Â²Ã Â±Ë†Ã Â°Â¤Ã Â±â€¡ Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°Â°Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â±ÂÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Å¸Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â°Ã Â±Â? Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ Ã Â°Â²Ã Â±Å Ã Â°â€¢Ã Â±â€¡Ã Â°Â·Ã Â°Â¨Ã Â±Â Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°ÂµÃ Â°Â¾Ã Â°Å¸Ã Â±ÂÃ Â°Â¸Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°Â²Ã Â±â€¹ Ã Â°ÂªÃ Â°â€šÃ Â°ÂªÃ Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â®Ã Â°â€šÃ Â°Å¸Ã Â°Â¾Ã Â°Â°Ã Â°Â¾?' },
    { time: 64, speaker: 'Sairam', text: 'Ã Â°â€  Ã Â°ÂªÃ Â°â€šÃ Â°ÂªÃ Â°â€šÃ Â°Â¡Ã Â°Â¿.' },
    { time: 66, speaker: 'Jagan', text: 'Ã Â°Â¤Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Â¡Ã Â°Â¾ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â²Ã Â±Å Ã Â°â€¢Ã Â±â€¡Ã Â°Â·Ã Â°Â¨Ã Â±Â Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂµÃ Â°Â¾Ã Â°Å¸Ã Â±ÂÃ Â°Â¸Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°Â²Ã Â±â€¹ Ã Â°ÂªÃ Â°â€šÃ Â°ÂªÃ Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â°Â¾Ã Â°Â¨Ã Â±Â. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¡Ã Â°Â®Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿? Ã Â°Â²Ã Â±â€¡Ã Â°â€¢ Ã Â°Â·Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°â€¢Ã Â°Â¿ Ã Â°ÂµÃ Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±â€¡Ã Â°Å¸Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°ÂÃ Â°Â®Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°Â¹Ã Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°ÂªÃ Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾?' },
    { time: 74, speaker: 'Sairam', text: 'Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â±Â Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â±Â.' },
    { time: 76, speaker: 'Jagan', text: 'Ã Â°Â¸Ã Â°Â°Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿ Ã Â°Â¥Ã Â°Â¾Ã Â°â€šÃ Â°â€¢Ã Â±ÂÃ Â°Â¸Ã Â±Â. Ã Â°Â²Ã Â±Å Ã Â°â€¢Ã Â±â€¡Ã Â°Â·Ã Â°Â¨Ã Â±Â Ã Â°ÂªÃ Â°â€šÃ Â°ÂªÃ Â°Â¿Ã Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¨Ã Â±Â. Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°ÂµÃ Â±â‚¬Ã Â°Â²Ã Â±Ë†Ã Â°Â¤Ã Â±â€¡ Ã Â°â€¦Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°Â·Ã Â°Â¾Ã Â°ÂªÃ Â±Â Ã Â°â€¢Ã Â°Â¿ Ã Â°Â°Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°â€¢Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°Â¸Ã Â±ÂÃ Â°Â®Ã Â°Â¸Ã Â±Â Ã Â°â€ Ã Â°Â«Ã Â°Â°Ã Â±Â Ã Â°Â®Ã Â°Â¿Ã Â°Â¸Ã Â±Â Ã Â°â€¦Ã Â°ÂµÃ Â±ÂÃ Â°ÂµÃ Â°â€¢Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¡Ã Â°Â®Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°Â¡Ã Â±Å’Ã Â°Å¸Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€°Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°â€¢Ã Â°Â¾Ã Â°Â²Ã Â±Â Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°Â¹Ã Â±ÂÃ Â°Â¯Ã Â°Â¾Ã Â°ÂªÃ Â±â‚¬ Ã Â°â€¢Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°Â¸Ã Â±ÂÃ Â°Â®Ã Â°Â¸Ã Â±Â!' }
  ];

  // Script steps on Step 4 (Concise 5 Steps + FAQs matching Outpero reference)
  const [scriptSteps, setScriptSteps] = useState([
    {
      id: 1,
      title: '1. Orient & Context',
      badge: 'START',
      body: "Once they've confirmed their identity, introduce yourself as 'Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â±ÂÃ Â°Â®Ã Â°Â¿' from 'Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â', and remind them they enquired about our services or consultations. Mention you'll help with info or next steps. Keep it brief and friendly Ã¢â‚¬â€ for example you might say: 'Ã Â°Â¨Ã Â±â€¡Ã Â°Â¨Ã Â±Â Ã Â°Â²Ã Â°â€¢Ã Â±ÂÃ Â°Â·Ã Â±ÂÃ Â°Â®Ã Â°Â¿, Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Â¡Ã Â°Â¿ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°Â®Ã Â±â‚¬Ã Â°Â°Ã Â±Â Ã Â°Â®Ã Â°Â¾ Ã Â°Â¸Ã Â°Â°Ã Â±ÂÃ Â°ÂµÃ Â±â‚¬Ã Â°Â¸Ã Â±â€ Ã Â°Â¸Ã Â±Â Ã Â°â€”Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ enquiry Ã Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â°Â¾Ã Â°Â°Ã Â±Â Ã Â°â€¢Ã Â°Â¦Ã Â°Â¾, Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂÃ Â°Â¦Ã Â±Ë†Ã Â°Â¨Ã Â°Â¾ Ã Â°â€¢Ã Â±ÂÃ Â°Â²Ã Â°Â¾Ã Â°Â°Ã Â°Â¿Ã Â°Å¸Ã Â±â‚¬ Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾ Ã Â°Â²Ã Â±â€¡Ã Â°Â¦Ã Â°Â¾ Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â¤Ã Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°â€¢Ã Â±â€¹Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¾?'"
    },
    {
      id: 2,
      title: '2. Qualify Need',
      body: "Find out what specific service or consultation they are interested in, and if they have any particular requirement or question. Ask ONE thing at a time, wait for their answer, and respond naturally before the next question. For example: 'Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°Â Ã Â°Â¸Ã Â°Â°Ã Â±ÂÃ Â°ÂµÃ Â±â‚¬Ã Â°Â¸Ã Â±Â Ã Â°â€”Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°Â¤Ã Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°â€¢Ã Â±â€¹Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â°Â¿ Ã Â°â€°Ã Â°â€šÃ Â°Â¦Ã Â°Â¿ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿?'"
    },
    {
      id: 3,
      title: '3. Share Info & Answer Questions',
      body: "Based on their interest, briefly explain how our services/consultations work and mention the price (5222) if they ask or if it's relevant. Answer any questions they have. Mention you'll arrange a callback for more in-depth help. For example: 'Ã Â°Â®Ã Â°Â¾ Ã Â°Â¸Ã Â°Â°Ã Â±ÂÃ Â°ÂµÃ Â±â‚¬Ã Â°Â¸Ã Â±Â Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Å¡Ã Â±â€ Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°ÂªÃ Â±ÂÃ Â°Â°Ã Â±Ë†Ã Â°Â¸Ã Â±Â Ã Â°ÂÃ Â°Â¤Ã Â±â€¡ Ã Â°Â«Ã Â±Ë†Ã Â°ÂµÃ Â±Â Ã Â°Å¸Ã Â±â€š Ã Â°Å¸Ã Â±â€š Ã Â°Å¸Ã Â±â€š. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¹ Ã Â°Â¡Ã Â±â‚¬Ã Â°Å¸Ã Â±â€ Ã Â°Â¯Ã Â°Â¿Ã Â°Â²Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°ÂµÃ Â°Â¾Ã Â°Â²Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ callback arrange Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â.'"
    },
    {
      id: 4,
      title: '4. Book Callback / Capture Next Step',
      body: "Offer to arrange a callback from our team for more details or to help them proceed. Confirm their preferred callback time and thank them warmly. For example: 'Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°ÂµÃ Â±â‚¬Ã Â°Â²Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨ Ã Â°Å¸Ã Â±Ë†Ã Â°Â®Ã Â±Â Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â®Ã Â°Â¾ Ã Â°Å¸Ã Â±â‚¬Ã Â°Â®Ã Â±Â Ã Â°Â¨Ã Â±ÂÃ Â°â€šÃ Â°Å¡Ã Â°Â¿ Ã Â°â€¢Ã Â°Â¾Ã Â°Â²Ã Â±Â arrange Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â. Ã Â°Â¸Ã Â°Â°Ã Â±â€¡Ã Â°Â¨Ã Â°Â¾?'"
    },
    {
      id: 5,
      title: '5. Close',
      body: "Wrap up warmly, confirming the next step and letting them know they can reach out if they have more questions. For example: 'Ã Â°Â¸Ã Â°Â°Ã Â±â€¡ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿, Ã Â°Â®Ã Â°Â¾ Ã Â°Å¸Ã Â±â‚¬Ã Â°Â®Ã Â±Â Ã Â°Â®Ã Â±â‚¬Ã Â°â€¢Ã Â±Â Ã Â°â€¢Ã Â°Â¾Ã Â°Â²Ã Â±Â Ã Â°Å¡Ã Â±â€¡Ã Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â°Â¾Ã Â°Â°Ã Â±Â. Ã Â°â€¡Ã Â°â€šÃ Â°â€¢Ã Â±â€¹ Ã Â°Â¡Ã Â±Å’Ã Â°Å¸Ã Â±Â Ã Â°â€°Ã Â°â€šÃ Â°Å¸Ã Â±â€¡ anytime Ã Â°â€¦Ã Â°Â¡Ã Â°â€”Ã Â±Å Ã Â°Å¡Ã Â±ÂÃ Â°Å¡Ã Â±Â. Ã Â°Â¥Ã Â°Â¾Ã Â°â€šÃ Â°â€¢Ã Â±ÂÃ Â°Â¯Ã Â±â€š!'"
    },
    {
      id: 6,
      title: '6. FAQs',
      body: "Common questions callers ask, and how to answer them. Add one per line as \"Q: Ã¢â‚¬Â¦ A: Ã¢â‚¬Â¦\".\nAnswer ONLY from what's written here; if a question isn't listed, use your don't-know response.\n\ne.g.\nQ: What are your timings?  A: We're open 9am to 6pm, Monday to Saturday.\nQ: Do you offer home delivery?  A: Yes, free within the city."
    }
  ]);

  const [editingStepId, setEditingStepId] = useState(null);

  // Voices Catalog (Matching Screenshots 2, 3)
  const premiumVoices = [
    { id: 'P09', gender: 'Male', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Professional', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Professional' },
    { id: 'P01', gender: 'Female', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Friendly', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Friendly' },
    { id: 'P07', gender: 'Male', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Calm', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Calm' },
    { id: 'P06', gender: 'Female', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Warm', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Warm' },
    { id: 'P02', gender: 'Female', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Professional', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Professional' },
    { id: 'P15', gender: 'Female', badge: '', desc: 'Native Hindi Ã¢â‚¬Â¢ Clear, approachable Hindi female voice for customer service...', rate: 'Ã¢â€šÂ¹6.8/min', mood: 'Friendly' }
  ];

  const standardVoices = [
    { id: 'S39', gender: 'Female', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Warm', rate: 'Ã¢â€šÂ¹5/min', mood: 'Warm' },
    { id: 'S36', gender: 'Female', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Confident', rate: 'Ã¢â€šÂ¹5/min', mood: 'Confident' },
    { id: 'S47', gender: 'Male', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Confident', rate: 'Ã¢â€šÂ¹5/min', mood: 'Confident' },
    { id: 'S41', gender: 'Male', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Professional', rate: 'Ã¢â€šÂ¹5/min', mood: 'Professional' },
    { id: 'S49', gender: 'Male', badge: 'SARVAM SPECIAL', desc: 'Great Hindi Ã¢â‚¬Â¢ Warm', rate: 'Ã¢â€šÂ¹5/min', mood: 'Warm' },
    { id: 'S130', gender: 'Female', badge: '', desc: 'Native Hindi Ã¢â‚¬Â¢ Professional and clean female voice, with a ...', rate: 'Ã¢â€šÂ¹5/min', mood: 'Professional' }
  ];

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration || 88);
    const handleEnded = () => {
      setIsPlayingAudio(false);
      if (callState === 'connected') endCallToSummary();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [callState]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(true));
    }
  };

  const startIncomingCall = () => {
    setShowPreCallModal(false);
    setCallState('ringing');
    setTimeout(() => {
      setCallState('connected');
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(true));
      }
    }, 2400);
  };

  const endCallToSummary = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
    setCallState('call-ended');

  };

  const handleNextTourStep = () => {
    if (tourStep === 1) {
      setTourStep(2);
    } else if (tourStep === 2) {
      setTourStep(3);
    } else if (tourStep === 3) {
      setTourStep(4);
      setActiveEmployeeTab('training');
    } else if (tourStep === 4) {
      setTourStep(5);
      setActiveEmployeeTab('training');
    } else if (tourStep === 5) {
      setTourStep(6);
    } else if (tourStep === 6) {
      setTourStep(7);
    } else if (tourStep === 7) {
      setTourStep(8);
      setActiveEmployeeTab('voice');
    } else if (tourStep === 8) {
      setTourStep(9);
      setActiveEmployeeTab('voice');
    } else if (tourStep === 9) {
      setTourStep(10);
    } else {
      setShowTour(false);
    }
  };

  const handlePrevTourStep = () => {
    if (tourStep === 10) {
      setTourStep(9);
      setActiveEmployeeTab('voice');
    } else if (tourStep === 9) {
      setTourStep(8);
      setActiveEmployeeTab('voice');
    } else if (tourStep === 8) {
      setTourStep(7);
    } else if (tourStep === 7) {
      setTourStep(6);
    } else if (tourStep === 6) {
      setTourStep(5);
      setActiveEmployeeTab('training');
    } else if (tourStep === 5) {
      setTourStep(4);
      setActiveEmployeeTab('training');
    } else if (tourStep === 4) {
      setTourStep(3);
      setActiveEmployeeTab('call-script');
    } else if (tourStep > 1) {
      setTourStep(tourStep - 1);
    }
  };

  const toggleJewelleryType = (type) => {
    const current = Array.isArray(selectedJewelleryTypes) ? selectedJewelleryTypes : [];
    if (current.includes(type)) {
      setSelectedJewelleryTypes(current.filter((t) => t !== type));
    } else {
      setSelectedJewelleryTypes([...current, type]);
    }
  };

  const toggleAction = (act) => {
    const current = Array.isArray(selectedActions) ? selectedActions : [];
    if (current.includes(act)) {
      setSelectedActions(current.filter((a) => a !== act));
    } else {
      setSelectedActions([...current, act]);
    }
  };

  const handleNextQuestion = () => {
    const totalQ = 4;
    if (questionIdx < totalQ - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      setStep2Mode('planning');
    }
  };

  const handlePrevQuestion = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else {
      setStep2Mode('brief');
    }
  };

  const planPreviewSteps = employeePurpose === 'support'
    ? [
      {
        title: `Greet the caller on behalf of ${businessName || 'your business'}`,
        detail: 'Introduce the support role and ask how you can help.'
      },
      {
        title: 'Identify the customer issue',
        detail: supportIssues.trim()
          ? `Handle only the issue types you listed: ${supportIssues.trim()}`
          : 'Ask what the caller needs help with before offering guidance.'
      },
      {
        title: 'Clarify without requesting sensitive information',
        detail: 'Ask one relevant question at a time. Never request passwords, OTPs, or full payment details.'
      },
      {
        title: 'Use confirmed policies only',
        detail: supportPolicies.trim()
          ? `Use only these approved notes: ${supportPolicies.trim()}`
          : 'No policy answers were supplied. Acknowledge uncertainty and offer human follow-up.'
      },
      {
        title: 'Offer a safe next step',
        detail: `Offer only the selected action: ${q2Selection || 'escalate to a human'}. Do not claim the action is completed.`
      },
      {
        title: 'Summarize and close or escalate',
        detail: 'Confirm what was discussed; escalate urgent, sensitive, or unresolved issues without promising an unapproved timeline.'
      }
    ]
    : [
      {
        title: `Introduce ${employeeName || 'the employee'} from ${businessName || 'your business'}`,
        detail: 'Use the business and employee details provided in this setup.'
      },
      {
        title: 'Understand the caller’s need',
        detail: promptText.trim() || 'Ask the caller what they are interested in.'
      },
      {
        title: 'Respond using confirmed business information',
        detail: 'Do not invent prices, offers, availability, guarantees, or actions. Clarify or offer follow-up when details are missing.'
      },
      {
        title: 'Offer a clear next step',
        detail: `Ask permission before offering: ${q2Selection || 'a relevant follow-up'}.`
      }
    ];

  const generateSalesEmployeeScript = async () => {
    const languageCode = ({ Telugu: 'te', Hindi: 'hi', Tamil: 'ta', Kannada: 'kn', Malayalam: 'ml', Marathi: 'mr', English: 'en' })[
      (employeeLanguage || 'English').split(' + ')[0].replace(' (Indian & Global)', '')
    ] || 'en';
    const response = await fetch('/api/employees/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        prompt: promptText,
        language: languageCode,
        businessName,
        employeeName,
        role: employeeRole || 'Customer Service Representative',
        industry: selectedCategory === 'Other' && customCategoryText.trim()
          ? customCategoryText.trim()
          : (selectedCategory || 'General Business'),
        offerings: effectiveSalesCategories(),
        priceRange,
        nextActions: [q2Selection === 'Other' ? otherNextActionText : q2Selection].filter(Boolean),
        objectionHandling: q4Selection === 'Other' ? otherActionText : q4Selection
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not generate the employee script.');
    if (!Array.isArray(result.call_steps) || result.call_steps.length < 5 || !result.opening_greeting) {
      throw new Error('The AI returned incomplete personalization. No employee was saved.');
    }
    return result;
  };

  const effectiveSalesCategories = () => [
    ...(selectedJewelleryTypes || []).filter(type => type !== 'Other'),
    ...((selectedJewelleryTypes || []).includes('Other') && otherCategoryText ? [otherCategoryText] : [])
  ];

  const handleCompleteBuildToCall = async (startTestCall = false, deployAfterSave = false) => {
    if (isGeneratingEmployee) return;
    const effectiveCategories = employeePurpose === 'support'
      ? supportIssues.split(/[\n,;]+/).map(item => item.trim()).filter(Boolean)
      : [
      ...(selectedJewelleryTypes || []).filter(t => t !== 'Other'),
      ...((selectedJewelleryTypes || []).includes('Other') && otherCategoryText ? [otherCategoryText] : [])
      ];
    const effectiveNextAction = q2Selection === 'Other' && otherNextActionText ? otherNextActionText : q2Selection;

    let finalScriptSteps = scriptSteps;
    let finalOpeningGreeting = '';
    let finalEmployeeName = employeeName;
    let finalBusinessName = businessName;
    let finalEmployeeRole = employeeRole;
    const hasReviewedScript = Boolean(
      (employeeId || initialData?.id) &&
      Array.isArray(scriptSteps) &&
      scriptSteps.length &&
      openingGreeting
    );
    if (hasReviewedScript) {
      finalScriptSteps = scriptSteps;
      finalOpeningGreeting = openingGreeting;
    } else if (employeePurpose === 'support') {
      setEmployeeGenerationError('');
      setIsGeneratingEmployee(true);
      try {
        const languageCode = ({ Telugu: 'te', Hindi: 'hi', Tamil: 'ta', Kannada: 'kn', Malayalam: 'ml', Marathi: 'mr', English: 'en' })[
          (employeeLanguage || 'English').split(' + ')[0].replace(' (Indian & Global)', '')
        ] || 'en';
        const response = await fetch('/api/employees/generate-support-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            prompt: promptText,
            language: languageCode,
            businessName,
            employeeName,
            role: 'Customer Support Specialist',
            industry: 'Customer Support',
            policies: supportPolicies,
            commonIssues: supportIssues.split(/[\n,;]+/).map(item => item.trim()).filter(Boolean),
            nextActions: [q2Selection === 'Other' ? otherNextActionText : q2Selection].filter(Boolean),
            selectedFacts: effectiveCategories
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not generate a customer-support script.');
        if (!Array.isArray(result.call_steps) || !result.opening_greeting) {
          throw new Error('The AI returned an incomplete script. No employee was saved.');
        }
        finalScriptSteps = result.call_steps;
        finalOpeningGreeting = result.opening_greeting;
        finalEmployeeName = result.employee_name || employeeName;
        finalBusinessName = result.business_name || businessName;
        finalEmployeeRole = result.role || 'Customer Support Specialist';
        setScriptSteps(finalScriptSteps);
        setEmployeeName(finalEmployeeName);
        setBusinessName(finalBusinessName);
        setEmployeeRole(finalEmployeeRole);
        setOpeningGreeting(finalOpeningGreeting);
      } catch (error) {
        setEmployeeGenerationError(error.message || 'Could not generate the employee script. Please try again.');
        setIsGeneratingEmployee(false);
        return;
      }
      setIsGeneratingEmployee(false);
    } else {
      setEmployeeGenerationError('');
      setIsGeneratingEmployee(true);
      try {
        const result = await generateSalesEmployeeScript();
        finalScriptSteps = result.call_steps;
        finalOpeningGreeting = result.opening_greeting;
        finalEmployeeName = result.employee_name || employeeName || 'AI Employee';
        finalBusinessName = result.business_name || businessName;
        finalEmployeeRole = result.role || employeeRole || 'Customer Service Representative';
        setScriptSteps(finalScriptSteps);
        setEmployeeName(finalEmployeeName);
        setBusinessName(finalBusinessName);
        setEmployeeRole(finalEmployeeRole);
        setOpeningGreeting(finalOpeningGreeting);
      } catch (error) {
        setEmployeeGenerationError(error.message || 'Could not generate the employee script. Please try again.');
        setIsGeneratingEmployee(false);
        return;
      }
      setIsGeneratingEmployee(false);
    }

    const updatedEmp = {
      id: employeeId || initialData?.id || `emp-${Date.now()}`,
      name: finalEmployeeName || 'Customer Support Specialist',
      type: employeePurpose === 'support' ? 'customer_support' : 'instant_lead',
      role: employeePurpose === 'support' ? finalEmployeeRole : (finalEmployeeRole || 'Sales & Support Consultant'),
      business: finalBusinessName || 'Your Business',
      language: employeeLanguage || 'Telugu + English',
      primary_language: ({ Telugu: 'te', Hindi: 'hi', Tamil: 'ta', Kannada: 'kn', Malayalam: 'ml', Marathi: 'mr', English: 'en' })[
        (employeeLanguage || 'Telugu').split(' + ')[0].replace(' (Indian & Global)', '')
      ] || 'te',
      voice: selectedVoiceId || 'P09',
      industry: employeePurpose === 'support'
        ? 'Customer Support'
        : (selectedCategory === 'Other' && customCategoryText.trim()
          ? customCategoryText.trim()
          : (selectedCategory || finalEmployeeRole || 'General Business')),
      opening_greeting: finalOpeningGreeting || openingGreeting || finalScriptSteps[0]?.body || `Hello, this is ${finalEmployeeName} from ${finalBusinessName}.`,
      prompt_text: employeePurpose === 'support'
        ? [
          promptText,
          `Business name: ${finalBusinessName}`,
          `Customer support policies and approved answers: ${supportPolicies || 'Not provided; do not assume.'}`,
          `Common customer issues: ${supportIssues || 'Not provided.'}`,
          `Allowed next actions: ${effectiveNextAction || 'Human follow-up only.'}`
        ].join('\n')
        : (promptText || businessName),
      purpose: employeePurpose,
      supportPolicies,
      supportIssues,
      scriptSteps: finalScriptSteps,
      call_steps: finalScriptSteps,
      variables: effectiveCategories,
      status: employeePurpose === 'support' ? 'draft' : 'ready',
      created_at: new Date().toISOString()
    };
    
    if (typeof onSaveEmployee !== 'function') {
      setEmployeeGenerationError('Employee saving is unavailable. Please reload the workspace and try again.');
      return;
    }
    try {
      const saved = await onSaveEmployee(updatedEmp);
      if (!saved) {
        setEmployeeGenerationError('The employee script was generated but could not be saved. Please retry after checking the workspace notice.');
        return;
      }
      if (typeof saved === 'string') {
        updatedEmp.id = saved;
        setEmployeeId(saved);
      }
    } catch (err) {
      console.error('Save employee handler failed:', err);
      setEmployeeGenerationError(err.message || 'The employee script was generated but could not be saved. Please try again.');
      return;
    }

    if (onBuildEmployee) {
      onBuildEmployee(updatedEmp, 'call-script');
      return;
    }

    if (deployAfterSave && onNavigate) {
      onNavigate('dashboard');
      return;
    }

    // Always navigate straight to the Call Script tab (Step 4)
    setCurrentStep(4);
    setActiveEmployeeTab('call-script');
  };

  // Industry Templates (Matching User Categories)
  const templates = INDUSTRY_TEMPLATES;

  const handleDeployEmployee = async () => handleCompleteBuildToCall(false, true);

  const handleSwaraSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const instruction = swaraInput.trim();
    if (!instruction) return;
    setIsSwaraThinking(true);
    setSwaraFeedback('Swara is analyzing and rewriting your call flow...');

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          currentScript: scriptSteps,
          userInstruction: instruction,
          businessName: businessName || 'My Business',
          employeeName: employeeName || 'Employee'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.content || "I've updated your call script steps based on your instruction.";
        setSwaraFeedback(replyText);

        if (data.updatedSteps && Array.isArray(data.updatedSteps) && data.updatedSteps.length > 0) {
          setScriptSteps(data.updatedSteps);
        } else {
          // Intelligently enhance scriptSteps based on instruction
          setScriptSteps((prev) => {
            const next = [...prev];
            const lower = instruction.toLowerCase();
            if (lower.includes('friendlier') || lower.includes('warm') || lower.includes('polite')) {
              if (next[0]) {
                next[0].body = `Greet warmly with high energy and genuine Indian courtesy. State you are ${employeeName} from ${businessName}. Greet with: 'Namaskaram! Hope you are having a wonderful day! I am ${employeeName} from ${businessName} calling regarding your recent enquiry...'`;
              }
            } else if (lower.includes('objection') || lower.includes('expensive') || lower.includes('discount') || lower.includes('price')) {
              const objStep = next.find((s) => s.title.toLowerCase().includes('pitch') || s.title.toLowerCase().includes('queries') || s.title.toLowerCase().includes('qualify'));
              if (objStep) {
                objStep.body += `\n[Swara Rule]: Overcome price objections by offering flexible zero-interest payment options and highlight a direct 10% first-order discount code.`;
              }
            } else if (lower.includes('urgency') || lower.includes('today') || lower.includes('close')) {
              const closeStep = next.find((s) => s.title.toLowerCase().includes('close') || s.title.toLowerCase().includes('book'));
              if (closeStep) {
                closeStep.body += `\n[Swara Rule]: Create immediate urgency by mentioning this seasonal offer expires within 48 hours.`;
              }
            } else if (lower.includes('whatsapp') || lower.includes('catalog') || lower.includes('brochure')) {
              const closeStep = next.find((s) => s.title.toLowerCase().includes('close') || s.title.toLowerCase().includes('book'));
              if (closeStep) {
                closeStep.body += `\n[Swara Rule]: Confirm automated delivery of digital catalog and location link directly to their WhatsApp number.`;
              }
            } else {
              if (next[1]) {
                next[1].body += `\n[Swara Update]: ${instruction}`;
              }
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.warn('Swara copilot error:', err);
      setSwaraFeedback(`Swara updated your script steps with: "${instruction}"`);
    } finally {
      setIsSwaraThinking(false);
      setSwaraInput('');
      setTimeout(() => setSwaraFeedback(''), 10000);
    }
  };

  const handleAddFact = (e) => {
    e.preventDefault();
    if (!newFactInput.trim()) return;
    setFactsList([...factsList, { label: 'Custom note', value: newFactInput.trim() }]);
    setNewFactInput('');
  };

  const handleSendTrainingMessage = (e) => {
    e.preventDefault();
    if (!trainingInput.trim()) return;
    const msg = trainingInput.trim();
    setTrainingChat([...trainingChat, { role: 'user', text: msg }]);
    setTrainingInput('');
    setTimeout(() => {
      setTrainingChat((prev) => [
        ...prev,
        {
          role: 'jagan',
          text: 'Ã Â°Â¸Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿Ã Â°Â°Ã Â°Â¾Ã Â°Â®Ã Â±Â Ã Â°Å“Ã Â±ÂÃ Â°ÂµÃ Â±â€ Ã Â°Â²Ã Â±ÂÃ Â°Â²Ã Â°Â°Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â²Ã Â±â€¹ Ã Â°â€¢Ã Â±ÂÃ Â°Â°Ã Â°Â¿Ã Â°Â¸Ã Â±ÂÃ Â°Â®Ã Â°Â¸Ã Â±Â Ã Â°Â¸Ã Â±ÂÃ Â°ÂªÃ Â±â€ Ã Â°Â·Ã Â°Â²Ã Â±Â Ã Â°â€ Ã Â°Â«Ã Â°Â°Ã Â±ÂÃ Â°Â¸Ã Â±Â Ã Â°Â¨Ã Â°Â¡Ã Â±ÂÃ Â°Â¸Ã Â±ÂÃ Â°Â¤Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â¯Ã Â°Â¿ Ã Â°â€¦Ã Â°â€šÃ Â°Â¡Ã Â°Â¿. Ã Â°Å“Ã Â±â‚¬Ã Â°Å½Ã Â°Â¸Ã Â±ÂÃ Â°Å¸Ã Â±â‚¬ Ã Â°Â®Ã Â°Â°Ã Â°Â¿Ã Â°Â¯Ã Â±Â Ã Â°Â®Ã Â±â€¡Ã Â°â€¢Ã Â°Â¿Ã Â°â€šÃ Â°â€”Ã Â±Â Ã Â°â€ºÃ Â°Â¾Ã Â°Â°Ã Â±ÂÃ Â°Å“Ã Â±â‚¬Ã Â°Â²Ã Â±Â Ã Â°ÂªÃ Â±â€šÃ Â°Â°Ã Â±ÂÃ Â°Â¤Ã Â°Â¿Ã Â°â€”Ã Â°Â¾ Ã Â°â€°Ã Â°Å¡Ã Â°Â¿Ã Â°Â¤Ã Â°â€š! Ã Â°Â®Ã Â±â‚¬Ã Â°Â°Ã Â±Â Ã Â°Å½Ã Â°ÂªÃ Â±ÂÃ Â°ÂªÃ Â±ÂÃ Â°Â¡Ã Â±Â Ã Â°ÂµÃ Â°Â¿Ã Â°Å“Ã Â°Â¿Ã Â°Å¸Ã Â±Â Ã Â°Å¡Ã Â±â€¡Ã Â°Â¯Ã Â°Â¾Ã Â°Â²Ã Â°Â¨Ã Â±ÂÃ Â°â€¢Ã Â±ÂÃ Â°â€šÃ Â°Å¸Ã Â±ÂÃ Â°Â¨Ã Â±ÂÃ Â°Â¨Ã Â°Â¾Ã Â°Â°Ã Â±Â?'
        }
      ]);
    }, 900);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <audio ref={audioRef} src="/audio/jagan-test-call.mp3" preload="auto" />

      {/* Global Outpero / Sarvam AI Top Platform Header Bar (Exact match to Screenshots 1-5) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e2e4ed]">
        {/* Left: Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-[320px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employees, pages..."
              className="w-full pl-9 pr-10 py-1.5 rounded-xl border border-[#e2e4ed] bg-white text-[12.5px] text-[#0f0e17] placeholder:text-zinc-400 focus:outline-hidden focus:border-[#7a50dc] shadow-2xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              Ã¢Å’ËœK
            </span>
          </div>
        </div>

        {/* Center / Right: Status Pills & Profile */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Calls Pill */}
          <div className="px-3 py-1 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-right flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[11.5px] font-bold leading-tight">0 on calls now Ã‚Â· 0.0 calls/min</div>
              <div className="text-[9.5px] text-emerald-600/80 leading-tight">0 talking Ã‚Â· 0 ringing</div>
            </div>
          </div>

          {/* Balance Pill */}
          <div className="px-2.5 py-1 rounded-xl bg-white border border-[#e2e4ed] text-[#0f0e17] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            <span>6Ã¢â‚¬â€œ9 min</span>
            <button
              type="button"
              className="w-4 h-4 rounded-full bg-[#7a50dc] text-white flex items-center justify-center text-[10px] hover:bg-[#673fc4] cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Quick Icons */}
          <button type="button" className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer">
            <BookOpen className="w-4 h-4" />
          </button>
          <button type="button" className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer">
            <Compass className="w-4 h-4" />
          </button>
          <div className="relative">
            <button type="button" className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#e2e4ed]">
            <div className="w-7 h-7 rounded-full bg-[#7a50dc] text-white font-bold text-[12px] flex items-center justify-center">
              S
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[12px] font-bold text-[#0f0e17] leading-tight">Sairam</div>
              <div className="text-[10px] text-zinc-500 leading-tight">sairamkondoju9@gmail.com</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
      </div>


      {/* Top Banner (Screenshot 1-5) */}
      {!bannerDismissed && currentStep === 4 && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-[#f2ecfd] border border-[#d8c7fa] flex items-center justify-between text-[12.5px] text-[#4c2889]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7a50dc] shrink-0" />
            <span>
              <strong>New:</strong> your AI employee now answers your phone, and our API connects it to your own tools.{' '}
              <a href="#incoming" className="font-semibold underline hover:text-[#2d1264] ml-1 inline-flex items-center gap-0.5">
                Set up incoming calls Ã¢â€ â€”
              </a>{' '}
              Ã‚Â·{' '}
              <a href="#api" className="font-semibold underline hover:text-[#2d1264] inline-flex items-center gap-0.5">
                Get an API key Ã¢â€ â€”
              </a>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-[#7a50dc] hover:text-[#2d1264] p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation & Workflow Mode Switcher Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e2e4ed]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (currentStep === 4) setCurrentStep(3);
              else if (currentStep === 3) setCurrentStep(2);
              else if (step2Mode === 'quick-details') setStep2Mode('brief');
              else if (onNavigate) onNavigate('dashboard');
            }}
            className="text-[13px] font-medium text-[#6c6b7e] hover:text-[#0f0e17] transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e4ed] bg-white hover:bg-zinc-50 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 4 ? 'Back to Test Call' : currentStep === 3 ? 'Back to Describe' : 'My Employees'}
          </button>

          {/* Stepper Pills for instant testing of all stages */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-[12px] font-semibold">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currentStep === 2 ? 'bg-white text-[#7a50dc] shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Step 2: Describe &amp; Goals
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currentStep === 3 ? 'bg-white text-[#7a50dc] shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Step 3: Simulated Call
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                currentStep === 4 ? 'bg-white text-[#7a50dc] shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Step 4: Employee Studio
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 4 && (
            <button
              type="button"
              onClick={() => {
                setShowTour(true);
                setTourStep(1);
                setActiveEmployeeTab('call-script');
              }}
              className="text-[12.5px] font-semibold text-[#7a50dc] hover:text-[#673fc4] px-3 py-1.5 rounded-xl border border-[#d8c7fa] bg-[#f8f5fe] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              10-Step Guided Tour
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="text-[13px] font-medium text-[#6c6b7e] hover:text-[#0f0e17] transition-colors cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-zinc-100"
          >
            Exit setup
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SETTING UP YOUR FIRST EMPLOYEE TIMELINE (currentStep < 4) */}
        {/* ========================================================================= */}
        {currentStep < 4 && (
          <div className="w-full lg:w-[260px] shrink-0 flex flex-col justify-between self-stretch space-y-8">
            <div>
              <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-5 font-mono">
                SETTING UP YOUR FIRST EMPLOYEE
              </div>

              {/* Vertical Stepper with Connecting Line */}
              <div className="relative pl-3 space-y-7 before:absolute before:left-[21px] before:top-3 before:bottom-3 before:w-[1.5px] before:bg-[#e2e4ed]">
                {/* Step 1: Set them up (Done) */}
                <div className="relative flex items-start gap-3.5">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#7a50dc] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[13px] font-bold text-[#0f0e17] leading-tight">Set them up</div>
                    <div className="text-[11.5px] text-[#6c6b7e]">{employeeRole || 'Role & language'}</div>
                    {/* Small AI Context snippet based on prompt */}
                    {employeePurpose !== 'support' && aiSmallContext && (
                      <div className="mt-1.5 p-2 rounded-xl bg-[#f2ecfd] border border-[#d9c7fa] text-[11px] text-[#5b32ba] leading-snug font-sans">
                        <span className="font-bold flex items-center gap-1 mb-0.5 text-[#7a50dc]">
                          <Sparkles className="w-3 h-3 fill-current" />
                          AI Context:
                        </span>
                        {aiSmallContext}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Describe the job */}
                <div className="relative flex items-start gap-3.5">
                  <div
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      currentStep === 2
                        ? 'border-2 border-[#7a50dc] bg-white ring-4 ring-[#7a50dc]/10'
                        : currentStep > 2
                        ? 'bg-[#7a50dc] text-white'
                        : 'border border-[#cbd0df] bg-white'
                    }`}
                  >
                    {currentStep > 2 ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : currentStep === 2 ? (
                      <div className="w-2 h-2 rounded-full bg-[#7a50dc]" />
                    ) : null}
                  </div>
                  <div>
                    <div
                      className={`text-[13px] font-bold leading-tight ${
                        currentStep === 2 ? 'text-[#0f0e17]' : 'text-[#6c6b7e]'
                      }`}
                    >
                      Describe the job
                    </div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">
                      {step2Mode === 'brief' ? 'Brief description' : `Question ${questionIdx + 1} of 4`}
                    </div>
                  </div>
                </div>

                {/* Step 3: Hear & refine */}
                <div className="relative flex items-start gap-3.5">
                  <div
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      currentStep === 3
                        ? 'border-2 border-[#7a50dc] bg-white ring-4 ring-[#7a50dc]/10'
                        : currentStep > 3
                        ? 'bg-[#7a50dc] text-white'
                        : 'border border-[#cbd0df] bg-white'
                    }`}
                  >
                    {currentStep > 3 ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : currentStep === 3 ? (
                      <div className="w-2 h-2 rounded-full bg-[#7a50dc]" />
                    ) : null}
                  </div>
                  <div>
                    <div
                      className={`text-[13px] font-bold leading-tight ${
                        currentStep === 3 ? 'text-[#0f0e17]' : 'text-[#6c6b7e]'
                      }`}
                    >
                      Hear &amp; refine
                    </div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">Simulate test call</div>
                  </div>
                </div>

                {/* Step 4: Train them */}
                <div className="relative flex items-start gap-3.5">
                  <div
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      currentStep === 4
                        ? 'border-2 border-[#7a50dc] bg-white ring-4 ring-[#7a50dc]/10'
                        : 'border border-[#cbd0df] bg-white'
                    }`}
                  >
                    {currentStep === 4 && <div className="w-2 h-2 rounded-full bg-[#7a50dc]" />}
                  </div>
                  <div>
                    <div
                      className={`text-[13px] font-bold leading-tight ${
                        currentStep === 4 ? 'text-[#0f0e17]' : 'text-[#6c6b7e]'
                      }`}
                    >
                      Train them
                    </div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">Script &amp; Voice Ã¢â€šÂ¹</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Preview Card in Sidebar */}
            <div className="bg-white rounded-2xl p-4 border border-[#e2e4ed] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white font-bold flex items-center justify-center shadow-xs">
                  {(employeeName || 'Jagan').charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#0f0e17]">{employeeName || 'Jagan'}</div>
                  <div className="text-[11.5px] text-[#6c6b7e]">{businessName || 'Sairam Jewellers'}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#f0f1f6] flex items-center justify-between text-[11px] text-[#6c6b7e]">
                <span>Language</span>
                <span className="font-semibold text-[#0f0e17]">{employeeLanguage}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6c6b7e]">
                <span>Voice tier</span>
                <span className="font-semibold text-[#7a50dc]">P09 (Ã¢â€šÂ¹6.8/min)</span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN */}
        <div className="flex-1 w-full space-y-6">
{currentStep === 2 && step2Mode === 'brief' && (
            <div className="space-y-6">
              <div
                className="rounded-3xl p-6 sm:p-9 text-white shadow-2xl relative overflow-hidden"
                style={{
                  background: 'radial-gradient(130% 120% at 85% 0%, #2A174E 0%, #150F2B 55%, #0B0818 100%)'
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-[#a78bfa] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    DESCRIBE THE JOB
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 uppercase">
                    FREE
                  </span>
                </div>

                <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-white font-display mb-2">
                  What should your employee do on calls?
                </h1>
                <p className="text-[14px] text-white/70 max-w-[640px] leading-relaxed mb-4">
                  A few sentences in your own words. We&apos;ll ask about anything a caller would need that&apos;s missing.
                </p>

                <div className="mb-4">
                  <div className="text-xs font-mono uppercase font-bold text-[#a78bfa] tracking-wider mb-2">
                    EMPLOYEE GOAL
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'support', label: 'Customer support' },
                      { id: 'sales', label: 'Sales & enquiries' }
                    ].map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setEmployeePurpose(option.id);
                          setEmployeeGenerationError('');
                          if (option.id === 'support') {
                            if (!businessName || businessName.trim().toLowerCase() === 'sairam jewellers') setBusinessName('');
                            if (!employeeName || employeeName.trim().toLowerCase() === 'jagan') setEmployeeName('');
                            setEmployeeRole('Customer Support Specialist');
                            setQ2Selection('Escalate to a human');
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                          employeePurpose === option.id
                            ? 'bg-[#D99A2B] border-[#D99A2B] text-[#130e26]'
                            : 'bg-white/5 border-white/15 text-white/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRIMARY LANGUAGE SELECTOR (CHOOSE ANY ONE) */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono uppercase font-bold text-[#a78bfa] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      PRIMARY LANGUAGE &bull; CHOOSE ANY ONE
                    </span>
                    <span className="text-white/60 text-[11px]">English is co-supported</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                    {PRIMARY_LANGUAGES.map((lang) => {
                      const isSelected = employeeLanguage.toLowerCase().includes(lang.name.toLowerCase()) ||
                        (lang.name === 'Telugu' && employeeLanguage.toLowerCase().includes('telugu'));
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setEmployeeLanguage(lang.name === 'English' ? 'English (Indian & Global)' : `${lang.name} + English`);
                            setSwaraLangCode(lang.langCode);
                            promptSpeech.setLang(lang.langCode);
                            swaraSpeech.setLang(lang.langCode);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D99A2B] text-[#130e26] font-bold shadow-md shadow-amber-500/20'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Prompt Textarea */}
                <div className="relative rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs p-4 sm:p-5 focus-within:border-[#a78bfa] transition-all">
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Describe what your employee should say, ask, and handle..."
                    className="w-full bg-transparent text-white placeholder-white/40 text-[14.5px] leading-relaxed resize-none focus:outline-hidden"
                  />
                  {employeePurpose === 'support' && (
                    <div className="grid gap-3 mt-3">
                      <label className="text-xs font-semibold text-white/80">
                        Support policies and approved answers
                        <textarea
                          rows={3}
                          value={supportPolicies}
                          onChange={(event) => setSupportPolicies(event.target.value)}
                          placeholder="Add confirmed return/refund rules, support hours, identity checks, and what agents may or may not promise. Leave unknown policies blank."
                          className="mt-1 w-full rounded-xl bg-white/5 border border-white/15 p-3 text-white placeholder-white/40 resize-y"
                        />
                      </label>
                      <label className="text-xs font-semibold text-white/80">
                        Common customer issues
                        <textarea
                          rows={2}
                          value={supportIssues}
                          onChange={(event) => setSupportIssues(event.target.value)}
                          placeholder="For example: order status, damaged item, payment issue, account access. Separate items with commas or new lines."
                          className="mt-1 w-full rounded-xl bg-white/5 border border-white/15 p-3 text-white placeholder-white/40 resize-y"
                        />
                      </label>
                      <p className="text-[11px] text-white/60">
                        The script will not invent policies, confirm account changes, or promise a resolution time. Missing answers are escalated to a human.
                      </p>
                    </div>
                  )}
                  {employeeGenerationError && (
                    <div role="alert" className="mt-3 rounded-xl border border-red-300/40 bg-red-500/15 p-3 text-sm text-red-100">
                      {employeeGenerationError}
                    </div>
                  )}

                  {/* Active Listening Audio Wave Indicator */}
                  {promptSpeech.isListening && (
                    <div className="mt-2 py-2 px-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-between text-xs animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-end gap-1 h-3.5">
                          <span className="w-1 bg-red-400 rounded-full h-3 animate-ping"></span>
                          <span className="w-1 bg-red-300 rounded-full h-3.5"></span>
                          <span className="w-1 bg-red-400 rounded-full h-2"></span>
                        </div>
                        <span className="text-red-300 font-medium">Listening... speak into your microphone</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => promptSpeech.stopListening()}
                        className="text-[11px] font-bold text-red-200 bg-red-500/30 hover:bg-red-500/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Done / Stop
                      </button>
                    </div>
                  )}

                  {/* Microphone Permission Notice or Error Banner */}
                  {promptSpeech.error && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-amber-300">Microphone Notice</div>
                        <p className="text-amber-200/90 leading-relaxed">{promptSpeech.error}</p>
                        {promptSpeech.permissionBlocked && (
                          <div className="text-[11px] text-amber-300/90 bg-black/40 p-2.5 rounded-lg border border-amber-400/25 mt-1">
                            <strong>How to enable microphone in Chrome / Edge:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-0.5 text-amber-200/80">
                              <li>Click the Ã°Å¸â€â€™ lock or Ã°Å¸Å½â„¢Ã¯Â¸Â icon in your browser URL bar.</li>
                              <li>Toggle <strong>Microphone</strong> to <strong>Allow</strong>.</li>
                              <li>Click <em>Voice input</em> again to start dictating.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => promptSpeech.clearError()}
                        className="text-amber-300 hover:text-white p-1 cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Mic and Build Employee Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/10 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          promptSpeech.toggleListening({
                            initialText: promptText,
                            language: promptSpeech.lang,
                            onTranscript: (updated) => setPromptText(updated)
                          });
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-medium ${
                          promptSpeech.isListening
                            ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20'
                            : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
                        }`}
                        title={promptSpeech.isListening ? 'Click to stop listening' : 'Click to dictate prompt with microphone'}
                      >
                        {promptSpeech.isListening ? (
                          <MicOff className="w-4 h-4 text-red-400 animate-pulse" />
                        ) : (
                          <Mic className="w-4 h-4 text-amber-300" />
                        )}
                        <span>{promptSpeech.isListening ? 'Listening...' : 'Voice input'}</span>
                      </button>

                      {/* Confirmed Language Badge (No redundant selection needed in Step 2) */}
                      <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        <span>Language: <strong>{employeeLanguage}</strong></span>
                        <span className="text-white/50 text-[10px] hidden sm:inline">(from Step 1)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToQuickDetails}
                      className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13.5px] px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      Build my employee
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Category Shortcuts */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span>SUGGESTED INDUSTRY SHORTCUTS (OPTIONAL)</span>
                  </div>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs text-[#7a50dc] hover:underline font-semibold cursor-pointer"
                    >
                      Clear category &times;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {templates.map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = selectedCategory === tpl.label;
                    return (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategory(null);
                          } else {
                            setSelectedCategory(tpl.label);
                            if (tpl.text) setPromptText(tpl.text);
                            const def = getIndustryDefaults(tpl.label, employeeLanguage);
                            if (def) {
                              setBusinessName(def.businessName);
                              setPriceRange(def.priceRange);
                              setEmployeeName(def.employeeName);
                              setEmployeeRole(def.role);
                              setSelectedVoiceId(def.voice);
                              setQuickQuestions(def.questions);
                              setJewelleryOptions(def.questions[2].options);
                              setSelectedJewelleryTypes(def.questions[2].defaultSelected);
                              setActionOptions(def.questions[3].options);
                              setQ2Selection(def.questions[3].defaultSelected[0]);
                              setScriptSteps(def.scriptSteps);
                            }
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#f4effe] border-[#7a50dc] shadow-md ring-2 ring-[#7a50dc]/30'
                            : 'bg-white border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isSelected ? 'bg-[#7a50dc] text-white scale-105' : 'bg-[#f2ecfd] text-[#7a50dc] group-hover:scale-105'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[13px] font-bold ${isSelected ? 'text-[#7a50dc]' : 'text-[#0f0e17] group-hover:text-[#7a50dc]'}`}>
                              {tpl.label}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#7a50dc] text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6c6b7e] line-clamp-2 mt-0.5">
                            {tpl.text || 'Enter custom industry / business'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCategory === 'Other' && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#7a50dc] shadow-xs animate-in fade-in duration-200">
                    <label className="text-[12px] font-bold text-[#7a50dc] flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Enter your custom business or industry:</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={customCategoryText}
                      onChange={(e) => setCustomCategoryText(e.target.value)}
                      placeholder="e.g. Jewellery & Gold, Rooftop Solar, Salon & Spa, Chartered Accountant, Fitness Gym..."
                      className="w-full p-2.5 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 focus:outline-none focus:border-[#7a50dc]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2 - INTERMEDIATE: PREPARING EMPLOYEE DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 2 && step2Mode === 'analyzing' && (
            <div
              className="rounded-3xl p-6 sm:p-9 text-white shadow-2xl relative overflow-hidden min-h-[440px] flex items-stretch"
              style={{
                background: 'radial-gradient(130% 120% at 85% 0%, #2A174E 0%, #150F2B 55%, #0B0818 100%)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                {/* Left Mini Column: Building Your Employee Progress */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      BUILDING YOUR EMPLOYEE
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] rounded-full transition-all duration-500 animate-pulse"
                        style={{ width: '25%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-[12.5px]">
                    <div className="flex items-center gap-2.5 text-amber-300 font-bold">
                      <div className="w-5 h-5 rounded-full border-2 border-amber-300 bg-amber-400/20 flex items-center justify-center animate-spin">
                        <Loader2 className="w-3 h-3 text-amber-300" />
                      </div>
                      <span>Preparing your employee details...</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>A few quick details</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>Applying the reusable call flow</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>Choosing a voice</span>
                    </div>
                  </div>

                  {/* Bottom Left Mini Employee Card */}
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {employeeName ? employeeName.charAt(0) : 'E'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-white truncate">{employeeName}</div>
                      <div className="text-[11px] text-white/60 truncate">{businessName}</div>
                    </div>
                  </div>
                </div>

                {/* Right Stage: Centered Radar/Spinner & Reading Notice */}
                <div className="lg:col-span-8 flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-[#a78bfa]/20 border-t-[#D99A2B] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight font-display">
                      Preparing your employee details...
                    </h2>
                    <p className="text-[14px] text-white/60 leading-relaxed">
                      Confirm a few details; AI personalization runs once when you generate the employee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2B: QUICK DETAILS WIZARD (QUESTIONS 1 TO 4) */}
          {/* ========================================================================= */}
          {currentStep === 2 && step2Mode === 'quick-details' && (
            <div
              className="rounded-3xl p-6 sm:p-9 text-white shadow-2xl relative overflow-hidden"
              style={{
                background: 'radial-gradient(130% 120% at 85% 0%, #2A174E 0%, #150F2B 55%, #0B0818 100%)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Mini Column: Building Your Employee Progress */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      BUILDING YOUR EMPLOYEE
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] rounded-full transition-all duration-300"
                        style={{ width: `${((questionIdx + 1) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-[12.5px]">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Setup prepared</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white font-bold">
                      <div className="w-5 h-5 rounded-full border-2 border-[#a78bfa] bg-white/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                      </div>
                      <span>A few quick details</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>Reusable call flow</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>Choosing a voice</span>
                    </div>
                  </div>

                  {/* Bottom Left Mini Employee Card matching screenshot 3 & 5 */}
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {employeeName ? employeeName.charAt(0) : 'E'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-white truncate">{employeeName}</div>
                      <div className="text-[11px] text-white/60 truncate">{businessName}</div>
                    </div>
                  </div>
                </div>

                {/* Right Stage: The 4 Questions */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Top Segmented Progress Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-[11.5px] font-mono uppercase tracking-wider text-white/80 font-bold">
                        A FEW QUICK DETAILS &bull; {questionIdx + 1} OF 4
                      </span>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === questionIdx
                                ? 'w-8 bg-[#E5A93C]'
                                : idx < questionIdx
                                ? 'w-4 bg-[#E5A93C]/70'
                                : 'w-4 bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep2Mode('brief')}
                      className="text-[11.5px] text-[#a78bfa] hover:text-white transition-colors cursor-pointer"
                    >
                      Edit brief
                    </button>
                  </div>
                  {employeeGenerationError && (
                    <div role="alert" className="my-4 rounded-xl border border-red-300/40 bg-red-500/15 p-3 text-sm text-red-100">
                      {employeeGenerationError}
                    </div>
                  )}
                  {isGeneratingEmployee && (
                    <div role="status" className="my-4 text-sm text-amber-200">
                      Generating and validating your employee script with an available AI provider…
                    </div>
                  )}

                  {/* QUESTION 1 OF 5: BUSINESS NAME FIRST */}
                  {questionIdx === 0 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                        {quickQuestions[0]?.title || 'What is your business name?'}
                      </h2>
                      <p className="text-[13.5px] text-white/60">
                        {quickQuestions[0]?.subtitle || 'So your test call sounds like your business.'}
                      </p>

                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder={quickQuestions[0]?.defaultValue || 'e.g. DesignCraft Luxury Interiors, Sanjeevani Clinic, Sai Meadows'}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[15px] focus:outline-hidden focus:border-[#a78bfa]"
                      />
                    </div>
                  )}

                  {/* QUESTION 2: BUSINESS POLICY DETAILS OR SALES PRICE RANGE */}
                  {questionIdx === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                        {employeePurpose === 'support'
                          ? 'What policies and approved answers should the support employee follow?'
                          : (quickQuestions[1]?.title || 'What is the price or budget range of your offerings?')}
                      </h2>
                      <p className="text-[13.5px] text-white/60">
                        {employeePurpose === 'support'
                          ? 'Only provide confirmed policies. Leave unknown topics blank so the employee escalates them.'
                          : (quickQuestions[1]?.subtitle || 'So your test call sounds like your business.')}
                      </p>

                      {employeePurpose === 'support' ? (
                        <textarea
                          rows={5}
                          value={supportPolicies}
                          onChange={(event) => setSupportPolicies(event.target.value)}
                          placeholder="Returns accepted within 30 days if unused. Refunds are reviewed by a human team. Support hours: Monday-Friday, 9am-5pm."
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[15px] focus:outline-hidden focus:border-[#a78bfa] resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          placeholder={quickQuestions[1]?.defaultValue || 'e.g. 5000 to 1500000'}
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[15px] focus:outline-hidden focus:border-[#a78bfa]"
                        />
                      )}
                    </div>
                  )}

                  {/* QUESTION 3: CUSTOMER ISSUES OR SALES CATEGORIES */}
                  {questionIdx === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                        {employeePurpose === 'support'
                          ? 'Which customer problems should this employee handle?'
                          : (quickQuestions[2]?.title || (selectedCategory === 'Car & bike dealership' ? 'What types of cars do you sell?' : 'Which categories or services do you offer?'))}
                      </h2>
                      <p className="text-[13.5px] text-white/60">
                        {employeePurpose === 'support'
                          ? 'List the issue types; the AI will create a troubleshooting and escalation flow for these.'
                          : (quickQuestions[2]?.subtitle || 'Tick all that apply.')}
                      </p>

                      {employeePurpose === 'support' && (
                        <textarea
                          rows={4}
                          value={supportIssues}
                          onChange={(event) => setSupportIssues(event.target.value)}
                          placeholder="Order tracking, damaged or missing item, refund question, payment failure, account access"
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[15px] focus:outline-hidden focus:border-[#a78bfa] resize-y"
                        />
                      )}
                      {employeePurpose !== 'support' && (
                      <div>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {(quickQuestions[2]?.options || (selectedCategory === 'Car & bike dealership' ? ['New cars', 'Used cars', 'Electric cars', 'Luxury cars', 'Commercial vehicles', 'Other'] : jewelleryOptions)).map((type) => {
                          const isSelected = (selectedJewelleryTypes || []).includes(type);
                          return (
                            <div
                              key={type}
                              onClick={() => toggleJewelleryType(type)}
                              className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all select-none ${
                                isSelected
                                  ? 'bg-[#D99A2B]/15 border-[#D99A2B] text-white ring-1 ring-[#D99A2B]/50 font-medium'
                                  : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-[#D99A2B] text-[#130e26]' : 'border border-white/30'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-[13px] font-medium">{type}</span>
                            </div>
                          );
                        })}
                      </div>

                      {(selectedJewelleryTypes || []).includes('Other') && (
                        <div className="pt-2 animate-in fade-in duration-200">
                          <label className="text-[11.5px] font-bold text-amber-300 uppercase tracking-wider font-mono block mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Specify other option:
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              autoFocus
                              value={otherCategoryText}
                              onChange={(e) => setOtherCategoryText(e.target.value)}
                              placeholder="e.g. Vintage classics, Fleet vans, Custom builds..."
                              className="w-full p-3.5 pr-10 rounded-xl bg-white/5 border border-amber-400/50 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                            />
                            {otherCategoryText && (
                              <button
                                type="button"
                                onClick={() => setOtherCategoryText('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                      )}
                    </div>
                  )}

                  {/* QUESTION 4 OF 4: NEXT ACTION */}
                  {questionIdx === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                        {employeePurpose === 'support'
                          ? 'What actions may the support employee offer?'
                          : (quickQuestions[3]?.title || 'What should the caller do next?')}
                      </h2>
                      <p className="text-[13.5px] text-white/60">
                        {employeePurpose === 'support'
                          ? 'Choose a safe next step. The employee will not claim the action is completed.'
                          : (quickQuestions[3]?.subtitle || 'So your test call sounds like your business.')}
                      </p>

                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap gap-2.5">
                          {(employeePurpose === 'support'
                            ? ['Escalate to a human', 'Create a support ticket', 'Share an approved help article', 'Other']
                            : (quickQuestions[3]?.options || actionOptions || ['Schedule a visit', 'Store visit', 'Send details on WhatsApp', 'Request a callback', 'Other'])
                          ).map((opt) => {
                            const isSelected = q2Selection === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setQ2Selection(opt)}
                                className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D99A2B]/15 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-medium'
                                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {q2Selection === 'Other' && (
                          <div className="pt-1 animate-in fade-in duration-200">
                            <label className="text-[11.5px] font-bold text-amber-300 uppercase tracking-wider font-mono block mb-1.5">
                              Specify custom next step:
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                autoFocus
                                value={otherNextActionText}
                                onChange={(e) => setOtherNextActionText(e.target.value)}
                                placeholder="e.g. Schedule a 15-minute test drive, video consultation..."
                                className="w-full p-3.5 pr-10 rounded-xl bg-white/5 border border-amber-400/50 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                              />
                              {otherNextActionText && (
                                <button
                                  type="button"
                                  onClick={() => setOtherNextActionText('')}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer text-[13px] font-medium"
                      >
                        Skip
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingEmployee}
                        onClick={() => handleCompleteBuildToCall(false)}
                        className="text-amber-300/80 hover:text-amber-300 transition-colors cursor-pointer text-[13px] font-semibold hidden sm:inline disabled:opacity-50"
                      >
                        {isGeneratingEmployee ? 'Generating employee script…' : 'Skip all and build'}
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{questionIdx === 3 ? 'Next: Plan Call' : 'Next'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2C: PLANNING THE CALL, STEP BY STEP */}
          {/* ========================================================================= */}
          {currentStep === 2 && step2Mode === 'planning' && (
            <div
              className="rounded-3xl p-6 sm:p-9 text-white shadow-2xl relative overflow-hidden"
              style={{
                background: 'radial-gradient(130% 120% at 85% 0%, #2A174E 0%, #150F2B 55%, #0B0818 100%)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Mini Column: Building Your Employee Progress */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      BUILDING YOUR EMPLOYEE
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] rounded-full transition-all duration-300"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-[12.5px]">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Setup prepared</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>A few quick details</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white font-bold">
                      <div className="w-5 h-5 rounded-full border-2 border-[#a78bfa] bg-white/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#a78bfa] animate-ping" />
                      </div>
                      <span className="text-[#a78bfa]">Reusable call flow</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/40">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                      <span>Choosing a voice</span>
                    </div>
                  </div>

                  {/* Bottom Left Mini Employee Card */}
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {(employeeName || 'Jagan').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-white truncate">{employeeName || 'Jagan'}</div>
                      <div className="text-[11px] text-white/60 truncate">{businessName || 'Sairam Jewellers'}</div>
                    </div>
                  </div>
                </div>

                {/* Right Stage: Call Flow Planning */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[11.5px] font-mono uppercase tracking-wider text-[#a78bfa] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      PLANNING THE CALL, STEP BY STEP &bull; STAGE 3 OF 4
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 font-mono">
                      {employeePurpose === 'support' ? 'BRIEF READY · SCRIPT NOT GENERATED' : 'OUTLINE PREVIEW · SCRIPT NOT GENERATED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                      {employeePurpose === 'support'
                        ? `Support plan for ${employeeName || 'your employee'}`
                        : `Call plan for ${employeeName || 'your employee'}`}
                    </h2>
                    <p className="text-[13.5px] text-white/60 leading-relaxed">
                      {employeePurpose === 'support'
                        ? `This is a planning outline based on your answers for ${businessName || 'your business'}, not the generated employee script. Generate the support script to review its actual wording.`
                        : `This is a planning outline based on the details you supplied for ${businessName || 'your business'}, not a generated script.`}
                    </p>
                  </div>

                  {employeeGenerationError && (
                    <div role="alert" className="rounded-xl border border-red-300/40 bg-red-500/15 p-3 text-sm text-red-100">
                    {employeeGenerationError}
                    </div>
                  )}

                  {/* Planning outline; the provider-generated script appears in the employee editor. */}
                  <div className="space-y-3">
                    {planPreviewSteps.map((st, index) => (
                      <div
                        key={`${index}-${st.title}`}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#a78bfa]/50 transition-all flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#7a50dc]/30 border border-[#a78bfa]/40 text-[#a78bfa] text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-bold text-white">{st.title}</div>
                          <div className="text-[11.5px] text-white/60 mt-0.5 leading-relaxed">{st.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setStep2Mode('quick-details');
                        setQuestionIdx(3);
                      }}
                      className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Details
                    </button>

                    <button
                      type="button"
                      disabled={isGeneratingEmployee}
                      onClick={() => handleCompleteBuildToCall(false)}
                      className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {isGeneratingEmployee
                          ? 'Generating employee script…'
                          : employeePurpose === 'support'
                            ? 'Generate Support Script & Open Employee Review'
                            : `Build AI Employee & Open Call Script (${employeeName || 'Employee'})`}
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2D: CHOOSING A VOICE */}
          {/* ========================================================================= */}
          {currentStep === 2 && step2Mode === 'voice' && (
            <div
              className="rounded-3xl p-6 sm:p-9 text-white shadow-2xl relative overflow-hidden"
              style={{
                background: 'radial-gradient(130% 120% at 85% 0%, #2A174E 0%, #150F2B 55%, #0B0818 100%)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Mini Column: Building Your Employee Progress */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      BUILDING YOUR EMPLOYEE
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] rounded-full transition-all duration-300"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-[12.5px]">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Setup prepared</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>A few quick details</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Reusable call flow</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-white font-bold">
                      <div className="w-5 h-5 rounded-full border-2 border-amber-300 bg-amber-400/20 flex items-center justify-center">
                        <Volume2 className="w-3 h-3 text-amber-300" />
                      </div>
                      <span className="text-amber-300">Choosing a voice</span>
                    </div>
                  </div>

                  {/* Bottom Left Mini Employee Card */}
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {(employeeName || 'Jagan').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-white truncate">{employeeName || 'Jagan'}</div>
                      <div className="text-[11px] text-white/60 truncate">{businessName || 'Sairam Jewellers'}</div>
                    </div>
                  </div>
                </div>

                {/* Right Stage: Voice Selection */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[11.5px] font-mono uppercase tracking-wider text-white/80 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      CHOOSING A VOICE &bull; FINAL STEP
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      {employeeLanguage || 'Telugu + English'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white font-display">
                      Choose a voice for {employeeName || 'Jagan'}
                    </h2>
                    <p className="text-[13.5px] text-white/60 leading-relaxed">
                      Pick how {employeeName || 'Jagan'} speaks on phone calls with callers. You can test and refine anytime.
                    </p>
                  </div>

                  {/* Voices Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      {
                        id: 'P09',
                        name: 'P09 Great Telugu',
                        accent: 'Telugu & English (Native Indian)',
                        engine: 'Cartesia Sonic-2 / Bulbul V4',
                        latency: '412ms',
                        tag: 'Recommended',
                        recommended: true
                      },
                      {
                        id: 'arvind',
                        name: 'Arvind',
                        accent: 'Indian English & Multilingual',
                        engine: 'Ultra-low latency',
                        latency: '430ms',
                        tag: 'Authoritative'
                      },
                      {
                        id: 'pooja',
                        name: 'Pooja',
                        accent: 'Warm & Friendly Hindi/English',
                        engine: 'Expressive Neural Voice',
                        latency: '445ms',
                        tag: 'Customer Care'
                      },
                      {
                        id: 'kavya',
                        name: 'Kavya',
                        accent: 'Conversational Sales Specialist',
                        engine: 'Fast Paced Response',
                        latency: '420ms',
                        tag: 'High Energy'
                      }
                    ].map((v) => {
                      const isSelected = selectedVoiceId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVoiceId(v.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#7a50dc]/30 border-amber-400/80 ring-2 ring-amber-400/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold text-white">{v.name}</span>
                                {v.recommended && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <div className="text-[11.5px] text-white/60 mt-0.5">{v.accent}</div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-amber-400 border-amber-300 text-[#130e26]' : 'border-white/30'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-[11px] text-white/50 font-mono">
                            <span>{v.engine}</span>
                            <span className="text-emerald-400">{v.latency}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ambient Sound Checkbox */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-amber-300" />
                      <div>
                        <div className="text-[12.5px] font-bold text-white">Office background ambience</div>
                        <div className="text-[11px] text-white/50">Subtle background typing &amp; room chatter for 100% human realism</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ambientSoundEnabled}
                      onChange={(e) => setAmbientSoundEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded-sm cursor-pointer"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep2Mode('planning')}
                      className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCompleteBuildToCall(false)}
                        className="text-white/70 hover:text-white px-4 py-2.5 rounded-xl border border-white/15 text-[13px] font-medium transition-all cursor-pointer"
                      >
                        Open in Studio
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCompleteBuildToCall(true)}
                        className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13.5px] px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>Finish &amp; Test Call</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: HEAR & REFINE - INSTAGRAM AD SIMULATOR & TEST CALL */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2 max-w-[650px] mx-auto">
                <div className="inline-flex items-center gap-1.5 text-[#7a50dc] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  THIS IS YOUR CUSTOMER&apos;S PHONE
                </div>
                <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight font-display text-[#0f0e17]">
                  Be your own lead
                </h2>
                <p className="text-[14.5px] text-[#6c6b7e] leading-relaxed">
                  A customer sees your ad on Instagram, taps it and fills your form &mdash; then {employeeName} calls them in seconds. Try it as the customer.
                </p>
              </div>

              {/* The Realistic Instagram Phone Frame */}
              <div className="flex justify-center pt-2">
                <div className="relative w-[340px] sm:w-[370px] rounded-[48px] bg-black p-3.5 shadow-2xl border-[4px] border-[#222]">
                  {/* Phone Speaker Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                    <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                  </div>

                  {/* Inner Screen */}
                  <div className="relative rounded-[38px] overflow-hidden bg-white text-black min-h-[640px] flex flex-col justify-between select-none">
                    {/* Top Status Bar */}
                    <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-black z-20">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2 bg-black rounded-2xs inline-block" />
                        <span className="w-3.5 h-2 border border-black rounded-2xs inline-block relative after:content-[''] after:absolute after:inset-0.5 after:bg-black" />
                      </div>
                    </div>

                    {/* IDLE / INSTAGRAM FEED SCREEN */}
                    {callState === 'idle' && (
                      <div className="flex-1 flex flex-col justify-between relative">
                        <div>
                          {/* Instagram Header */}
                          <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                            <Camera className="w-5 h-5 text-black" />
                            <span className="font-serif italic font-bold text-[19px] tracking-tight">Instagram</span>
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-black" />
                              <Send className="w-5 h-5 text-black -rotate-12" />
                            </div>
                          </div>

                          {/* Stories Row */}
                          <div className="px-3 py-2.5 border-b border-zinc-100 flex items-center gap-3 overflow-x-hidden">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600">
                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                  <div className="w-full h-full rounded-full bg-[#7a50dc] text-white flex items-center justify-center text-xs font-bold">
                                    {(employeeName || 'Jagan').charAt(0)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-medium text-zinc-700">Your ad</span>
                            </div>

                            {['friends', 'deals', 'news'].map((s) => (
                              <div key={s} className="flex flex-col items-center gap-1 opacity-50">
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-200 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-zinc-100" />
                                </div>
                                <span className="text-[10px] text-zinc-400">{s}</span>
                              </div>
                            ))}
                          </div>

                          {/* Sponsored Feed Post */}
                          <div className="pt-2">
                            {/* Post Header */}
                            <div className="px-3.5 py-1.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#7a50dc] text-white text-[10px] font-bold flex items-center justify-center">
                                  {(businessName || 'Business').charAt(0)}
                                </div>
                                <div>
                                  <div className="text-[12px] font-bold text-black leading-none flex items-center gap-1">
                                    {(businessName || 'business').toLowerCase().replace(/\s+/g, '_')}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 leading-none mt-0.5">Sponsored</div>
                                </div>
                              </div>
                              <span className="text-zinc-400 text-xs font-bold">&bull;&bull;&bull;</span>
                            </div>

                            {/* Post Creative Photo Area */}
                            <div className="relative aspect-square w-full bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center text-center p-6 border-y border-zinc-200/60 mt-1.5">
                              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-amber-200/80 flex items-center justify-center mb-2 text-[#d99a2b]">
                                <Sparkles className="w-7 h-7 text-[#7a50dc]" />
                              </div>
                              <div className="text-[15px] font-bold text-zinc-800">{businessName || 'Sairam Jewellers'}</div>
                              <div className="text-[11.5px] text-zinc-600 mt-1 font-medium">
                                {aiSmallContext || `${businessName || 'Business'} Special Enquiry`}
                              </div>
                              <div className="text-[10.5px] text-[#7a50dc] mt-1 font-mono">
                                {employeeRole}
                              </div>
                            </div>

                            {/* Call to Action Banner (Sign Up) */}
                            <div className="p-3 bg-zinc-50 border-b border-zinc-200/60 flex items-center justify-between">
                              <div className="min-w-0 pr-2">
                                <div className="text-[12px] font-bold text-zinc-900 truncate">{employeeName || 'Jagan'}</div>
                                <div className="text-[11px] text-zinc-500 truncate">{employeeRole}</div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowLeadForm(true)}
                                className="relative bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[12.5px] px-4 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 animate-pulse"
                              >
                                Sign Up
                              </button>
                            </div>

                            {/* Likes, Comments & Caption */}
                            <div className="p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Heart className="w-5 h-5 text-zinc-700" />
                                  <MessageCircle className="w-5 h-5 text-zinc-700" />
                                  <Send className="w-5 h-5 text-zinc-700 -rotate-12" />
                                </div>
                                <Bookmark className="w-5 h-5 text-zinc-700" />
                              </div>
                              <div className="text-[11.5px] pt-1 leading-snug">
                                <span className="font-bold text-black mr-1.5">{(businessName || 'business').toLowerCase().replace(/\s+/g, '_')}</span>
                                <span className="text-zinc-700">{employeeRole} &bull; {aiSmallContext}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Instagram Navigation Bar */}
                        <div className="h-11 px-6 border-t border-zinc-100 flex items-center justify-between text-zinc-800">
                          <Home className="w-5 h-5" />
                          <Camera className="w-5 h-5" />
                          <Send className="w-5 h-5" />
                          <Heart className="w-5 h-5" />
                          <div className="w-6 h-6 rounded-full bg-zinc-300" />
                        </div>

                        {/* ===================================================================== */}
                        {/* IN-APP INSTAGRAM BOTTOM SHEET MODAL */}
                        {/* ===================================================================== */}
                        {showLeadForm && (
                          <div className="absolute inset-0 bg-black/40 z-30 flex flex-col justify-end">
                            <div className="bg-white rounded-t-[28px] p-5 shadow-2xl space-y-4 border-t border-zinc-200 animate-in slide-in-from-bottom duration-200">
                              {/* Drag indicator */}
                              <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto" />

                              {/* Form Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#7a50dc] text-white flex items-center justify-center text-xs font-bold">
                                    {(employeeName || 'Jagan').charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-[13.5px] font-bold text-black leading-tight">Get a callback from {employeeName || 'Jagan'}</div>
                                    <div className="text-[11px] text-zinc-500">Fast 15-second response</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowLeadForm(false)}
                                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                <Lock className="w-3 h-3 text-zinc-400" />
                                <span>Your details are shared securely with {businessName || 'our business'}</span>
                              </div>

                              {/* Form Inputs */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                                    Lead Name
                                  </label>
                                  <input
                                    type="text"
                                    value={leadName}
                                    onChange={(e) => setLeadName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:border-[#0095f6]"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                                    Phone number *
                                  </label>
                                  <input
                                    type="text"
                                    value={leadPhone}
                                    onChange={(e) => setLeadPhone(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-hidden focus:border-[#0095f6]"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowLeadForm(false);
                                    setShowPreCallModal(true);
                                  }}
                                  className="w-full py-3 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold text-[13.5px] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
                                >
                                  Submit &rarr;
                                </button>

                                <div className="text-center text-[11px] text-zinc-500 leading-tight">
                                  Submit and your phone rings &mdash; that&apos;s {employeeName} calling your lead.
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RINGING INCOMING CALL SCREEN */}
                    {callState === 'ringing' && (
                      <div className="flex-1 flex flex-col justify-between items-center py-12 px-6 bg-[#0f0e17] text-white">
                        <div className="text-center space-y-3 pt-6">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d99a2b] to-[#f2b94a] text-[#130e26] font-bold text-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                            {(employeeName || 'Jagan').charAt(0)}
                          </div>
                          <div>
                            <div className="text-[22px] font-bold tracking-tight text-white font-display">
                              {employeeName || 'Jagan'}
                            </div>
                            <div className="text-[13px] text-[#a78bfa] font-medium">
                              {businessName || 'Sairam Jewellers'} AI {employeeRole}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-mono mt-1 animate-pulse">
                              Incoming call...
                            </div>
                          </div>
                        </div>

                        <div className="w-full flex items-center justify-around pb-6">
                          <button
                            type="button"
                            onClick={endCallToSummary}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                              <PhoneOff className="w-6 h-6" />
                            </div>
                            <span className="text-[12px] text-white/70">Decline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCallState('connected');
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(true));
                              }
                            }}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-pulse active:scale-95 transition-all">
                              <PhoneCall className="w-6 h-6" />
                            </div>
                            <span className="text-[12px] text-white/70">Accept</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CONNECTED LIVE CALL SCREEN (PLAYING REAL CALL AUDIO) */}
                    {callState === 'connected' && (
                      <div className="flex-1 flex flex-col justify-between bg-[#0f0e1a] text-white p-4.5">
                        {/* Call Top Bar */}
                        <div className="text-center space-y-1 pt-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d99a2b] to-[#f2b94a] text-[#130e26] font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                            {(employeeName || 'Jagan').charAt(0)}
                          </div>
                          <div className="text-[15px] font-bold text-white font-display">{employeeName || 'Jagan'}</div>
                          <div className="text-[11.5px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {formatTimer(Math.floor(audioCurrentTime))} / {formatTimer(audioDuration)} &bull; 412ms TTFT
                          </div>
                        </div>

                        {/* Live Synchronized Telugu Conversation Transcript */}
                        <div className="space-y-2.5 my-auto max-h-[340px] overflow-y-auto px-1">
                          {realCallTurns
                            .filter((turn) => audioCurrentTime >= turn.time)
                            .map((turn, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-2xl text-[12px] leading-relaxed transition-all ${
                                  turn.speaker === 'Jagan'
                                    ? 'bg-[#1e1442] border border-[#a78bfa]/40 text-white rounded-tl-xs mr-3'
                                    : 'bg-white/10 text-white/95 rounded-tr-xs ml-3 border border-white/10'
                                }`}
                              >
                                <div className="text-[9.5px] font-mono font-bold text-white/50 mb-0.5 uppercase flex items-center justify-between">
                                  <span>{turn.speaker === 'Jagan' ? employeeName : turn.speaker}</span>
                                  <span className="text-[9px] text-[#a78bfa]">{formatTimer(turn.time)}</span>
                                </div>
                                {turn.text}
                              </div>
                            ))}
                        </div>

                        {/* Call Actions Bottom Bar */}
                        <div className="flex items-center justify-around pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer ${
                              isMuted ? 'bg-red-500' : 'bg-white/10'
                            }`}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={endCallToSummary}
                            className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                          >
                            <PhoneOff className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play();
                              }
                            }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ===================================================================== */}
                    {/* CALL-ENDED / "HERE'S WHAT JAGAN CAUGHT" SCREEN */}
                    {/* ===================================================================== */}
                    {callState === 'call-ended' && (
                      <div className="flex-1 flex flex-col justify-between bg-white text-[#0f0e17] p-4.5 overflow-y-auto">
                        <div className="space-y-3.5">
                          <button
                            type="button"
                            onClick={() => setCallState('idle')}
                            className="text-[12px] font-medium text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                          </button>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <h3 className="text-[15.5px] font-bold text-zinc-900 font-display">
                                Here&apos;s what {employeeName} caught
                              </h3>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] text-zinc-700">
                              <Smile className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Neutral call &bull; Qualified</span>
                            </div>
                          </div>

                          {/* Details Captured Card */}
                          <div className="p-3.5 rounded-2xl bg-[#faf7fd] border border-[#f0e8fc] space-y-2">
                            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono">
                              <FileText className="w-3.5 h-3.5" />
                              Details captured
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#e5d9fa] text-[#4c2889] font-medium">
                                Category <strong className="font-bold">{(selectedJewelleryTypes || [])[0] || 'Enquiry'}</strong>
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#e5d9fa] text-[#4c2889] font-medium">
                                Action <strong className="font-bold">{(selectedActions || [])[0] || 'Send WhatsApp Details'}</strong>
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-medium">
                                Budget {priceRange}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-medium">
                                Planned Visit Time &mdash;
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-medium">
                                Interest Level &mdash; High
                              </span>
                            </div>
                          </div>

                          {/* AI Call Summary Card */}
                          <div className="p-3.5 rounded-2xl bg-[#faf7fd] border border-[#f0e8fc] space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono">
                              <Sparkles className="w-3.5 h-3.5" />
                              DEMO SIMULATION
                            </div>
                            <p className="text-[11.5px] text-zinc-700 leading-relaxed">
                              This is a local demo preview, not a real customer conversation. No call was placed, no customer outcome was recorded, and no message was sent.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Messaging not sent</div>
                            <p className="mt-1 text-[11.5px] leading-relaxed text-amber-900">
                              WhatsApp delivery requires a separate, configured integration and explicit recipient consent. This demo does not send messages.
                            </p>
                          </div>

                          {/* Listen Back Audio Bar */}
                          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                            <div className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Demo audio
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={toggleAudioPlay}
                                className="w-8 h-8 rounded-full bg-[#7a50dc] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                              >
                                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                              </button>
                              <div className="text-[11px] font-mono text-zinc-700 w-20">
                                {formatTimer(Math.floor(audioCurrentTime))} / {formatTimer(audioDuration)}
                              </div>
                              <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#7a50dc] transition-all"
                                  style={{ width: `${(audioCurrentTime / (audioDuration || 1)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons matching screenshot */}
                        <div className="space-y-2 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStep(4);
                              setTourStep(1);
                              setShowTour(true);
                              setActiveEmployeeTab('call-script');
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#7a50dc] hover:bg-[#673fc4] text-white font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
                          >
                            <FileText className="w-4 h-4" />
                            Change her script
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStep(4);
                              setActiveEmployeeTab('voice');
                            }}
                            className="w-full py-2.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-bold text-[12.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <User className="w-4 h-4 text-zinc-500" />
                            Change her voice
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Step Button after listening to call */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(4);
                    setTourStep(1);
                    setShowTour(true);
                    setActiveEmployeeTab('call-script');
                  }}
                  className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-[14px] px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  Continue to Train them &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: EMPLOYEE DETAIL & SCRIPT STUDIO (EXACT MATCH TO 5 SCREENSHOTS) */}
          {/* ========================================================================= */}
          
          {/* STEP 4: EMPLOYEE DETAIL & SCRIPT STUDIO (EXACT MATCH TO ALL SCREENSHOTS) */}
          {currentStep === 4 && (
<div className="space-y-6 relative">
        {/* Employee Header Profile Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#9a5b32] text-white font-bold text-2xl flex items-center justify-center shadow-xs shrink-0">
                {(employeeName || 'Jagan').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[24px] font-bold text-[#0f0e17] font-display">{employeeName || 'Jagan'}</h1>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Draft
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f2ecfd] text-[#7a50dc] border border-[#e5d9fa] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Instant lead
                  </span>
                </div>
                <div className="text-[13px] text-[#6c6b7e] mt-1 flex items-center gap-2 flex-wrap">
                  <span>{employeeRole}</span>
                  <span>&bull;</span>
                  <span>{businessName}</span>
                  <span>&bull;</span>
                  <span className="text-[#0f0e17] font-semibold">13.6 credits used</span>
                  <span>&bull;</span>
                  <a href="#billing" className="text-[#7a50dc] hover:underline font-medium">
                    View billing &amp; transactions
                  </a>
                </div>
                <div className="text-[11.5px] text-[#6c6b7e] font-mono mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> &mdash;</span>
                  <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> P09 &bull; {employeeLanguage}</span>
                  <span className="text-zinc-400">ID d9afcba2</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                className="p-2.5 rounded-xl border border-[#e2e4ed] hover:bg-[#f6f7fb] text-zinc-600 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('talk-to-employee')}
                className="px-4 py-2 rounded-xl border border-[#e2e4ed] hover:bg-[#f6f7fb] text-[#0f0e17] font-medium text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[#7a50dc]" />
                Talk
              </button>
              <button
                type="button"
                onClick={() => setActiveEmployeeTab('training')}
                className="px-4 py-2 rounded-xl border border-[#e2e4ed] hover:bg-[#f6f7fb] text-[#0f0e17] font-medium text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                Chat
              </button>

              {/* Test Call Button (Highlighted by Guided Tour Step 3) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer ${
                    showTour && tourStep === 3
                      ? 'ring-4 ring-[#7a50dc] ring-offset-2 scale-105 shadow-md'
                      : ''
                  }`}
                >
                  <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                  Test call
                </button>
              </div>

              {/* Not Published Toggle */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#e2e4ed]">
                <span className="text-[12px] text-zinc-500">
                  {isPublished ? 'Published' : 'Not published'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    isPublished ? 'bg-emerald-500' : 'bg-zinc-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isPublished ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-tabs Navigation */}
          <div className="flex items-center gap-1 border-b border-[#e2e4ed] overflow-x-auto pt-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'instant-leads', label: 'Instant leads' },
              { key: 'call-script', label: 'Call script' },
              { key: 'training', label: 'Training' },
              { key: 'actions', label: 'Actions' },
              { key: 'outcomes', label: 'Outcomes' },
              { key: 'voice', label: 'Voice Ã¢â€šÂ¹' },
              { key: 'settings', label: 'Settings' }
            ].map((tab) => {
              const isActive = activeEmployeeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveEmployeeTab(tab.key)}
                  className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[#7a50dc] text-[#7a50dc] font-bold'
                      : 'border-transparent text-[#6c6b7e] hover:text-[#0f0e17]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CALL SCRIPT */}
        {/* ========================================================================= */}
                {/* ========================================================================= */}
        {/* TAB 0: OVERVIEW (EXACT MATCH TO SCREENSHOTS 1, 2, 3) */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'overview' && (
          <div className="space-y-6">
            {/* Helper Info line */}
            <div className="text-[12.5px] text-[#6c6b7e] flex items-center gap-1.5 px-1">
              <Info className="w-4 h-4 text-[#7a50dc]" />
              <span>Everything about {employeeName} in one place.</span>
            </div>

            {/* 4 Top Metric Cards (Screenshot 1) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: LEADS TODAY */}
              <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-2 relative">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7a50dc]" />
                  <span>LEADS TODAY</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-[32px] font-extrabold text-[#0f0e17] leading-none font-display">
                  2
                </div>
                <div className="text-[11.5px] text-[#6c6b7e]">
                  triggered today
                </div>
              </div>

              {/* Card 2: QUALIFIED */}
              <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-2 relative">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>QUALIFIED</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-[32px] font-extrabold text-[#0f0e17] leading-none font-display">
                  1
                </div>
                <div className="text-[11.5px] text-[#6c6b7e]">
                  from today&apos;s leads
                </div>
              </div>

              {/* Card 3: AVG SPEED */}
              <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-2 relative">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>AVG SPEED</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-[32px] font-extrabold text-[#0f0e17] leading-none font-display">
                  &mdash;
                </div>
                <div className="text-[11.5px] text-[#6c6b7e]">
                  speed to lead
                </div>
              </div>

              {/* Card 4: HOT LEADS */}
              <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-2 relative">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>HOT LEADS</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-[32px] font-extrabold text-[#0f0e17] leading-none font-display">
                  0
                </div>
                <div className="text-[11.5px] text-[#6c6b7e]">
                  need follow-up
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS SECTION (Screenshot 1) */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono px-1">
                QUICK ACTIONS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Action 1: Hot leads */}
                <button
                  type="button"
                  onClick={() => { setActiveEmployeeTab('instant-leads'); }}
                  className="bg-white hover:bg-zinc-50 rounded-2xl p-3.5 border border-[#e2e4ed] shadow-2xs flex items-center gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#0f0e17]">Hot leads</span>
                </button>

                {/* Action 2: Needs attention */}
                <button
                  type="button"
                  onClick={() => { setActiveEmployeeTab('instant-leads'); }}
                  className="bg-white hover:bg-zinc-50 rounded-2xl p-3.5 border border-[#e2e4ed] shadow-2xs flex items-center gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#0f0e17]">Needs attention</span>
                </button>

                {/* Action 3: Lead webhook */}
                <button
                  type="button"
                  onClick={() => { setActiveEmployeeTab('instant-leads'); }}
                  className="bg-white hover:bg-zinc-50 rounded-2xl p-3.5 border border-[#e2e4ed] shadow-2xs flex items-center gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7a50dc] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#0f0e17]">Lead webhook</span>
                </button>

                {/* Action 4: Call script */}
                <button
                  type="button"
                  onClick={() => { setActiveEmployeeTab('call-script'); }}
                  className="bg-white hover:bg-zinc-50 rounded-2xl p-3.5 border border-[#e2e4ed] shadow-2xs flex items-center gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#0f0e17]">Call script</span>
                </button>
              </div>
            </div>

            {/* Row 1: Charts (This week's calls & Outcome breakdown) (Screenshot 1 & 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: This week's calls */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="text-[14px] font-bold text-[#0f0e17]">
                  This week&apos;s calls
                </div>
                <div className="h-44 flex items-end justify-between pt-6 px-4 pb-2 border-b border-zinc-100">
                  {[
                    { day: 'Sun', count: 0 },
                    { day: 'Mon', count: 0 },
                    { day: 'Tue', count: 0 },
                    { day: 'Wed', count: 0 },
                    { day: 'Thu', count: 0 },
                    { day: 'Fri', count: 0 },
                    { day: 'Sat', count: 2, active: true }
                  ].map((d) => (
                    <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-7 bg-zinc-100 rounded-t-lg relative flex items-end justify-center h-28">
                        {d.count > 0 && (
                          <div
                            style={{ height: '85%' }}
                            className="w-full bg-gradient-to-t from-[#7a50dc] to-[#a78bfa] rounded-t-lg shadow-sm"
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-zinc-500">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Outcome breakdown Ã‚Â· all time */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="text-[14px] font-bold text-[#0f0e17]">
                  Outcome breakdown &bull; all time
                </div>
                <div className="flex flex-col items-center justify-center pt-2 space-y-4">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#f1f3f9"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      {/* Qualified Segment (50%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#7a50dc"
                        strokeWidth="14"
                        strokeDasharray="119.38 238.76"
                        strokeDashoffset="0"
                        fill="transparent"
                      />
                      {/* Voicemail Segment (50%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#3b82f6"
                        strokeWidth="14"
                        strokeDasharray="119.38 238.76"
                        strokeDashoffset="-119.38"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[28px] font-extrabold text-[#0f0e17] leading-none font-display">
                        2
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">total calls</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 text-[12px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7a50dc]" />
                      <span className="text-zinc-600">Qualified</span>
                      <span className="font-bold text-zinc-900 ml-1">1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                      <span className="text-zinc-600">Voicemail</span>
                      <span className="font-bold text-zinc-900 ml-1">1</span>
                    </div>
                  </div>

                  <div className="text-[11.5px] text-zinc-500">
                    Most common: <strong className="text-[#7a50dc]">Qualified (50%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Recent Calls & Active Modes (Screenshot 2 & 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: RECENT CALLS */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                    RECENT CALLS
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveEmployeeTab('instant-leads')}
                    className="text-[12px] font-semibold text-[#7a50dc] hover:underline cursor-pointer"
                  >
                    View all &rarr;
                  </button>
                </div>

                <div className="divide-y divide-zinc-100">
                  {/* Call 1 */}
                  <div
                    onClick={() => setActiveEmployeeTab('instant-leads')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d97757] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                        {(employeeName || 'Jagan').charAt(0)}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#0f0e17]">{employeeName || 'Jagan'}</div>
                        <div className="text-[11.5px] text-[#6c6b7e]">Today 5:00 pm &bull; 0:00</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]">
                        Callback
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Call 2 */}
                  <div
                    onClick={() => setActiveEmployeeTab('instant-leads')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d97757] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                        J
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#0f0e17]">+918919112039</div>
                        <div className="text-[11.5px] text-[#6c6b7e]">Today 4:47 pm &bull; 1:30</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f2ecfd] text-[#7a50dc] border border-[#d8c7fa]">
                        Qualified
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Call 3 */}
                  <div
                    onClick={() => setActiveEmployeeTab('instant-leads')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d97757] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                        J
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#0f0e17]">+918919112039</div>
                        <div className="text-[11.5px] text-[#6c6b7e]">Today 4:43 pm &bull; 0:04</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]">
                        Voicemail
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: ACTIVE MODES */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                  ACTIVE MODES
                </div>

                <div className="p-4 rounded-2xl border border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#0f0e17]">
                      Calls new leads instantly
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                    On
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEmployeeTab === 'call-script' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
            <div className="lg:col-span-8 space-y-4">

              {/* PROMINENT SWARA VOICE AI COPILOT TOP BAR (Directly on Script Page) */}
              <div className="rounded-3xl p-5 bg-gradient-to-r from-[#1E113B] via-[#2D1654] to-[#160D2E] text-white border-2 border-[#7a50dc]/50 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#7a50dc] text-white flex items-center justify-center shadow-md shrink-0">
                      <Sparkles className="w-5 h-5 fill-current text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-white font-display">Swara Voice AI Copilot</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                          Voice Dictation Active
                        </span>
                      </div>
                      <p className="text-[12px] text-white/70">
                        Speak into your microphone or type changes &mdash; Swara rewrites your employee&apos;s call steps live.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={swaraLangCode}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setSwaraLangCode(newLang);
                        swaraSpeech.setLang(newLang);
                      }}
                      className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl px-2.5 py-2 border border-white/20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/40"
                      title="Select dictation language for Swara"
                    >
                      {PRIMARY_LANGUAGES.map((l) => (
                        <option key={l.langCode} value={l.langCode} className="text-zinc-900 bg-white">
                          {l.label} ({l.name})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        swaraSpeech.toggleListening({
                          initialText: swaraInput,
                          language: swaraLangCode || 'en-IN',
                          onTranscript: (updated) => setSwaraInput(updated)
                        });
                      }}
                      className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        swaraSpeech.isListening
                          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                          : 'bg-white/15 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {swaraSpeech.isListening ? (
                        <>
                          <MicOff className="w-4 h-4 text-white" />
                          <span>Listening... Tap to stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-amber-300" />
                          <span>Tap &amp; Speak to Swara</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Voice Input Prompt Bar */}
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl p-2 border border-white/15">
                  <input
                    type="text"
                    value={swaraInput}
                    onChange={(e) => setSwaraInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSwaraSubmit(); }}
                    placeholder={swaraSpeech.isListening ? 'Listening to your voice...' : 'e.g. "Add a step to ask callers about their budget" or speak your change...'}
                    className="flex-1 bg-transparent px-3 py-1.5 text-[13.5px] text-white placeholder-white/40 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    disabled={isSwaraThinking || !swaraInput.trim()}
                    onClick={handleSwaraSubmit}
                    className="bg-[#7a50dc] hover:bg-[#683ecb] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isSwaraThinking ? 'Updating Script...' : 'Apply to Script'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {swaraSpeech.isListening && (
                  <div className="flex items-center gap-2 text-xs text-red-300 font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>Microphone active &bull; Transcribing your words in real time...</span>
                  </div>
                )}
                {swaraSpeech.error && (
                  <div className="text-xs text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    {swaraSpeech.error}
                  </div>
                )}
              </div>

              <div className="text-[12.5px] text-[#6c6b7e] flex items-center gap-1.5 px-1">
                <Info className="w-4 h-4 text-[#7a50dc]" />
                <span>What {employeeName} says on a call &mdash; the opening line and the steps they follow.</span>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e4ed] shadow-xs space-y-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0f2f8] gap-3">
                  <div>
                    <div className="text-[17px] font-bold text-[#0f0e17] font-display">
                      {employeeName}&apos;s call script
                    </div>
                    <div className="text-[12px] text-[#6c6b7e]">
                      Call your own phone to hear it live.
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[12px] text-[#6c6b7e]">
                    <span className="font-mono">5 steps Ã‚Â· 2,802 / 40,000</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#0f0e17] font-medium">
                      <input
                        type="checkbox"
                        checked={teluguEnhance}
                        onChange={(e) => setTeluguEnhance(e.target.checked)}
                        className="accent-[#7a50dc] rounded"
                      />
                      <span>Telugu enhance</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Script copied to clipboard!')}
                      className="text-[#7a50dc] hover:underline font-medium cursor-pointer"
                    >
                      Copy / paste
                    </button>
                  </div>
                </div>

                {/* OPENS WITH */}
                <div className="space-y-2 p-4.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc]">
                  <div className="text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono">
                    OPENS WITH
                  </div>
                  <div className="text-[16px] text-[#0f0e17] font-medium leading-relaxed">
                    {openingGreeting || scriptSteps[0]?.body || `Hello, this is ${employeeName || 'your support employee'} from ${businessName || 'your business'}.`}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      className="text-[11.5px] px-2 py-1 rounded-md bg-white border border-[#d8c7fa] text-[#7a50dc] font-medium flex items-center gap-1 hover:bg-[#f2ecfd] transition-colors cursor-pointer"
                    >
                      &lt;+ Variable
                    </button>
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Spoken word-for-word the moment the call connects.
                    </span>
                  </div>
                </div>

                {/* 5 SCRIPT STEPS */}
                <div className="space-y-5 pt-2">
                  {scriptSteps.map((step) => (
                    <div
                      key={step.id}
                      className="p-5 rounded-2xl bg-[#fbfbfe] border border-[#e8ebf3] hover:border-[#7a50dc]/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[14.5px] font-bold text-[#0f0e17]">
                            {step.title}
                          </span>
                          {step.badge && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {step.badge}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)}
                          className="text-[11.5px] text-[#7a50dc] hover:underline font-medium cursor-pointer"
                        >
                          {editingStepId === step.id ? 'Done editing' : 'Edit step'}
                        </button>
                      </div>

                      {editingStepId === step.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            className="w-full p-3 rounded-xl border-2 border-[#7a50dc]/50 bg-white text-[13px] text-[#0f0e17] focus:outline-none focus:border-[#7a50dc] leading-relaxed font-sans min-h-[90px]"
                            value={step.body}
                            onChange={(e) => {
                              const newBody = e.target.value;
                              setScriptSteps(prev => prev.map(s => s.id === step.id ? { ...s, body: newBody } : s));
                            }}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingStepId(null)}
                              className="px-3 py-1 rounded-lg bg-[#7a50dc] text-white text-xs font-semibold hover:bg-[#683fc4] cursor-pointer"
                            >
                              Save change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[13px] text-[#3a3f5c] leading-relaxed whitespace-pre-line">
                          {step.body}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-[11.5px] text-[#6c6b7e]">
                        <button
                          type="button"
                          className="px-2 py-0.5 rounded bg-white border border-[#e2e4ed] text-[#7a50dc] font-mono hover:bg-[#f2ecfd] cursor-pointer"
                        >
                          &lt;/&gt; Variable
                        </button>
                        <span>or type @ anywhere in the step</span>
                      </div>
                    </div>
                  ))}

                  {/* Add a step button (Exact from Screenshot 2 & 5) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newStep = {
                          id: scriptSteps.length + 1,
                          title: `${scriptSteps.length + 1}. Custom Step`,
                          body: `Describe instructions for ${employeeName} on this conversation turn...`
                        };
                        setScriptSteps([...scriptSteps, newStep]);
                      }}
                      className="text-[#7a50dc] hover:text-[#673fc4] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                    >
                      <span>+</span> Add a step
                    </button>
                  </div>
                </div>

                {/* When the call ends Card (Screenshot 3 & User Flow) */}
                <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#0f0e17]">
                    <span className="text-purple-600">Ã°Å¸Å¡Â©</span>
                    <span>When the call ends</span>
                  </div>
                  <p className="text-[12px] text-[#6c6b7e] leading-relaxed">
                    {employeeName} decides when to hang up from these rules &mdash; not from reaching any one section, so a caller can always keep talking until they&apos;re genuinely done.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc] space-y-1">
                    <div className="text-[10px] font-mono font-bold text-[#7a50dc] uppercase tracking-wider">
                      BUILT-IN &mdash; ALWAYS ON
                    </div>
                    <div className="text-[12px] text-zinc-800 leading-snug">
                      Ends the call when the purpose is done and the caller has nothing more (they&apos;ve said thanks/bye, or clearly have no further questions).
                    </div>
                  </div>

                  {/* Your extra rules (one per line) */}
                  <div className="space-y-1.5 pt-2 border-t border-[#e2e4ed]">
                    <label className="text-[12.5px] font-bold text-[#0f0e17] block">
                      Your extra rules (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={extraCallRules}
                      onChange={(e) => setExtraCallRules(e.target.value)}
                      placeholder="Leave blank to end only on the built-in rule."
                      className="w-full p-3 rounded-xl border border-[#e2e4ed] text-[12.5px] resize-none focus:outline-hidden focus:border-[#7a50dc] bg-white placeholder-[#9897a9]"
                    />
                  </div>
                </div>

                {/* How strictly employee follows it Card (Prominently Placed Below When the call ends) */}
                <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-[#0f0e17]">
                      How strictly {employeeName} follows it
                    </span>
                    <span className="text-[12px] font-mono text-[#7a50dc] font-bold px-2.5 py-0.5 rounded-full bg-[#f2ecfd] border border-[#d9c7fa]">
                      {strictnessValue}/5 {strictnessValue <= 2 ? 'Flexible' : strictnessValue === 3 ? 'Balanced' : 'Strict'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={strictnessValue}
                    onChange={(e) => setStrictnessValue(Number(e.target.value))}
                    className="w-full accent-[#7a50dc] cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-[#6c6b7e]">
                    <span>Flexible (1)</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>Strict (5)</span>
                  </div>

                  <p className="text-[12px] text-[#6c6b7e] leading-snug pt-1">
                    Treats your steps as a loose guide &mdash; follows the caller&apos;s lead and improvises (never invents facts).
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Swara Copilot & Pre-call Variables */}
            <div className="lg:col-span-4 space-y-5 relative">
              {/* Swara AI Copilot Card (Prominent Top Placement with Voice Recognition) */}
              <div id="swara-copilot-card" className="bg-gradient-to-b from-white to-[#fbf9fe] rounded-3xl p-5 border-2 border-[#7a50dc]/30 shadow-md space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#7a50dc]">
                    <div className="w-7 h-7 rounded-lg bg-[#7a50dc]/15 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#7a50dc] fill-current" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-[#0f0e17] block">Swara Copilot</span>
                      <span className="text-[10.5px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Voice & Text Ready</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7a50dc]/10 text-[#7a50dc] font-mono font-medium">
                    AI Editor
                  </span>
                </div>

                <p className="text-[11.5px] text-[#6c6b7e] leading-relaxed">
                  Speak or type what you want changed &mdash; Swara rewrites the call steps in real time.
                </p>

                {/* Voice Dictation Button with Visual Wave Ring */}
                <div className="flex flex-col items-center py-2 space-y-2">
                  <div className="flex items-center gap-1.5 pb-1">
                    <span className="text-[11px] text-[#6c6b7e] font-medium">Dictate in:</span>
                    <select
                      value={swaraLangCode}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setSwaraLangCode(newLang);
                        swaraSpeech.setLang(newLang);
                      }}
                      className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-md px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7a50dc]"
                      title="Select dictation language for Swara"
                    >
                      {PRIMARY_LANGUAGES.map((l) => (
                        <option key={l.langCode} value={l.langCode}>
                          {l.label} ({l.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      swaraSpeech.toggleListening({
                        initialText: swaraInput,
                        language: swaraLangCode || 'en-IN',
                        onTranscript: (updated) => setSwaraInput(updated)
                      });
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                      swaraSpeech.isListening
                        ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200 scale-105'
                        : 'bg-gradient-to-tr from-[#7a50dc] to-[#a78bfa] text-white hover:scale-105 active:scale-95 shadow-purple-500/25'
                    }`}
                    title={swaraSpeech.isListening ? 'Click to stop listening' : 'Click to dictate changes to Swara'}
                  >
                    {swaraSpeech.isListening ? (
                      <MicOff className="w-7 h-7 text-white" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-[12.5px] font-bold text-[#0f0e17] block">
                      {swaraSpeech.isListening ? 'Listening... say your changes' : 'Tap to speak your change'}
                    </span>
                    <span className="text-[10.5px] text-[#6c6b7e]">
                      {swaraSpeech.isListening ? 'Click microphone to finish dictation' : 'Uses real-time speech recognition'}
                    </span>
                  </div>

                  {swaraSpeech.error && (
                    <span className="text-[11px] text-red-500 text-center px-2 font-medium">{swaraSpeech.error}</span>
                  )}
                </div>

                {/* Text Form Input */}
                <form onSubmit={handleSwaraSubmit} className="space-y-2.5">
                  <textarea
                    rows={2}
                    value={swaraInput}
                    onChange={(e) => setSwaraInput(e.target.value)}
                    placeholder="...or type it: e.g. offer 10% discount on today's booking and handle price objection"
                    className="w-full p-3 rounded-xl border border-[#e2e4ed] text-[12.5px] resize-none focus:outline-hidden focus:border-[#7a50dc] bg-white placeholder-[#9897a9]"
                  />

                  <button
                    type="submit"
                    disabled={isSwaraThinking || (!swaraInput.trim() && !swaraSpeech.isListening)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7a50dc] to-[#9061f9] hover:opacity-95 text-white font-bold text-[12.5px] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSwaraThinking ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Swara is rewriting call flow...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Update call script</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Live Feedback Toast */}
                {swaraFeedback && (
                  <div className="p-3 rounded-xl bg-[#ebf5ff] border border-[#bfdbfe] text-[11.5px] text-[#1e40af] font-medium leading-relaxed animate-in fade-in">
                    Ã¢Å“Â¨ {swaraFeedback}
                  </div>
                )}

                {/* Quick Prompts */}
                <div className="text-[11px] text-[#6c6b7e] space-y-1 pt-1">
                  <div className="font-semibold text-zinc-700">Quick suggestions:</div>
                  <div className="flex flex-wrap gap-1.5 text-[#7a50dc]">
                    <button
                      type="button"
                      onClick={() => {
                        setSwaraInput('Make the opening greeting friendlier with warm festive wishes');
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[#7a50dc] text-[11px] font-medium transition-colors cursor-pointer border border-purple-200/60"
                    >
                      Make friendlier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSwaraInput('Add a strong objection handling clause for price concerns with flexible EMI');
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[#7a50dc] text-[11px] font-medium transition-colors cursor-pointer border border-purple-200/60"
                    >
                      Handle price objection
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSwaraInput('Add automated WhatsApp brochure and live location confirmation before closing');
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[#7a50dc] text-[11px] font-medium transition-colors cursor-pointer border border-purple-200/60"
                    >
                      Send WhatsApp brochure
                    </button>
                  </div>
                </div>
              </div>

              {/* Pre-call variables */}
              <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#0f0e17]">Pre-call variables</span>
                  <a href="#instant-leads" onClick={(e) => { e.preventDefault(); setActiveEmployeeTab('instant-leads'); }} className="text-[12px] text-[#7a50dc] hover:underline font-medium inline-flex items-center gap-0.5">
                    Edit <span className="text-[10px]">Ã¢â€ â€”</span>
                  </a>
                </div>
                <p className="text-[11.5px] text-[#6c6b7e] leading-snug">
                  Drop them into any step with its <strong>Variable</strong> button, or by typing <strong>@</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#ebf5ff] text-[#1e40af] border border-[#bfdbfe]">
                    Lead Name
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#ebf5ff] text-[#1e40af] border border-[#bfdbfe]">
                    Phone number
                  </span>
                </div>
                <p className="text-[11px] text-[#6c6b7e] pt-1">
                  Add, rename and map these on the Instant leads tab. What {employeeName} collects during the call is on the Outcomes tab.
                </p>
              </div>


            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRAINING (SCREENSHOT 1, 2) */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'training' && (
          <div className="space-y-5 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="text-[12.5px] text-[#6c6b7e] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#7a50dc]" />
                <span>Teach {employeeName} facts about your business so every answer is accurate.</span>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="flex items-center gap-1 text-[#0f0e17] font-medium">
                  Ã°Å¸Å½â€œ {factsList.length} things taught
                </span>
                <span className="flex items-center gap-1 text-zinc-500 font-medium">
                  Ã¢Å¡Â Ã¯Â¸Â 0 open from real calls
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('talk-to-employee')}
                  className="px-3.5 py-1.5 rounded-full bg-[#f2ecfd] text-[#7a50dc] font-bold text-[11.5px] flex items-center gap-1 hover:bg-[#e6d8fc] cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Practice with {employeeName}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Facts & Knowledge Base */}
              <div className="lg:col-span-8 space-y-5">
                {/* Tell Jagan something (Highlighted by Tour Step 5) */}
                <div
                  className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 transition-all ${
                    showTour && tourStep === 5
                      ? 'border-[#7a50dc] ring-4 ring-[#7a50dc]/30'
                      : 'border-[#e2e4ed]'
                  }`}
                >
                  <textarea
                    rows={3}
                    value={newFactInput}
                    onChange={(e) => setNewFactInput(e.target.value)}
                    placeholder={`Tell ${employeeName} something Ã¢â‚¬â€ a price, a place, a rule to follow...`}
                    className="w-full p-3.5 rounded-xl border border-[#e2e4ed] text-[13.5px] resize-none focus:outline-hidden focus:border-[#7a50dc]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Figures out fact vs rule &mdash; you review before saving.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-[#e2e4ed] text-zinc-500 hover:bg-[#f6f7fb] cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          factSpeech.toggleListening({
                            initialText: newFactInput,
                            language: swaraLangCode || 'en-IN',
                            onTranscript: (updated) => setNewFactInput(updated)
                          });
                        }}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          factSpeech.isListening
                            ? 'bg-red-500/20 border-red-500/50 text-red-600 animate-pulse'
                            : 'border-[#e2e4ed] text-zinc-500 hover:bg-[#f6f7fb]'
                        }`}
                        title={factSpeech.isListening ? 'Click to stop listening' : 'Click to dictate fact'}
                      >
                        {factSpeech.isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddFact}
                        className="px-5 py-2 rounded-xl bg-[#7a50dc] hover:bg-[#673fc4] text-white font-bold text-[12.5px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Teach
                      </button>
                    </div>
                  </div>
                </div>

                {/* WHAT JAGAN KNOWS */}
                <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                  <div className="text-[11.5px] font-bold text-[#6c6b7e] uppercase tracking-wider font-mono">
                    WHAT {employeeName.toUpperCase()} KNOWS
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <div className="text-[11.5px] font-mono font-bold text-zinc-500">
                        FACTS &bull; {factsList.length}
                      </div>
                      {factsList.map((f, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#f6f7fb] border border-[#e8ebf3] text-[12.5px]">
                          <span className="font-semibold text-zinc-800">{f.label}:</span>{' '}
                          <span className="text-zinc-600">{f.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-[11.5px] font-mono font-bold text-zinc-500">
                        RULES &bull; 0
                      </div>
                      <div className="p-4 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
                        None yet.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Training Live Tester & Struggles */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0f2f8]">
                    <span className="text-[12.5px] font-bold text-[#0f0e17] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#7a50dc]" />
                      Try it (text)
                    </span>
                    <span className="text-[11px] font-mono text-[#6c6b7e]">
                      Ã¢â€šÂ¹0.20 per message
                    </span>
                  </div>

                  <div className="h-56 overflow-y-auto space-y-2 p-1">
                    <div className="p-2.5 text-center text-[11px] text-zinc-400">
                      Ask {employeeName} anything to check what it knows and how it follows your rules.
                    </div>
                    {trainingChat.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-[12px] leading-relaxed ${
                          msg.role === 'jagan'
                            ? 'bg-[#f2ecfd] text-[#331c5f] mr-4'
                            : 'bg-zinc-100 text-zinc-800 ml-4'
                        }`}
                      >
                        <div className="text-[9.5px] font-mono font-bold opacity-60 mb-0.5">
                          {msg.role === 'jagan' ? employeeName : 'You'}
                        </div>
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendTrainingMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={trainingInput}
                      onChange={(e) => setTrainingInput(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e2e4ed] text-xs focus:outline-hidden focus:border-[#7a50dc]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#7a50dc] text-white text-xs font-bold hover:bg-[#673fc4] cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* WHERE JAGAN STRUGGLED (Screenshot 1) */}
                <div
                  className={`bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-2 transition-all ${
                    showTour && tourStep === 4 ? 'ring-4 ring-[#7a50dc] ring-offset-2' : ''
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold text-[#6c6b7e] uppercase tracking-wider">
                    WHERE {employeeName.toUpperCase()} STRUGGLED ON REAL CALLS
                  </div>
                  <p className="text-[11.5px] text-zinc-500 leading-snug">
                    Found automatically from actual conversations &mdash; not guessed.
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 mt-2">
                    No struggles found yet &mdash; {employeeName} is handling calls cleanly.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VOICE Ã¢â€šÂ¹ (SCREENSHOT 4) */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'voice' && (
          <div className="space-y-6">
            {/* Top Subtitle matching Screenshot 2 */}
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#6c6b7e] px-1">
              <Info className="w-4 h-4 text-[#7a50dc] shrink-0" />
              <span>How {employeeName || 'Imran'} sounds &mdash; their voice, speaking speed and language.</span>
            </div>

            {/* PRIMARY LANGUAGE CARD (Matching Screenshot 2) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono">
                <span>PRIMARY LANGUAGE</span>
                <Info className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'Telugu', script: 'Ã Â°Â¤Ã Â±â€ ', label: 'Telugu' },
                  { id: 'Hindi', script: 'Ã Â¤â€¦', label: 'Hindi' },
                  { id: 'Tamil', script: 'Ã Â®â€¦', label: 'Tamil' },
                  { id: 'Kannada', script: 'Ã Â²â€¢', label: 'Kannada' },
                  { id: 'Malayalam', script: 'Ã Â´â€¦', label: 'Malayalam' },
                  { id: 'Marathi', script: 'Ã Â¤â€¦', label: 'Marathi' },
                  { id: 'English', script: 'A', label: 'English' }
                ].map((lang) => {
                  const isSelected = primaryLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setPrimaryLanguage(lang.id)}
                      className={`px-3.5 py-2 rounded-xl text-[12.5px] font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#7a50dc] border-[#7a50dc] text-white shadow-xs'
                          : 'bg-white border-[#e2e4ed] text-[#0f0e17] hover:border-zinc-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {lang.script}
                      </span>
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[12px] text-[#6c6b7e]">
                Every call opens in {primaryLanguage}.
              </div>
            </div>

            {/* ALSO SPEAKS CARD (Matching Screenshot 2) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-3">
              <div className="text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono">
                ALSO SPEAKS
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-[12.5px] font-semibold flex items-center gap-2 bg-[#f4f1fa] border border-[#d8c7fa] text-[#7a50dc] cursor-default"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>English</span>
                  <Lock className="w-3 h-3 text-[#7a50dc]/70" />
                </button>

                {['Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi'].filter(l => l !== primaryLanguage).map((lang) => {
                  const isSelected = alsoSpeaks.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (isSelected) setAlsoSpeaks(alsoSpeaks.filter(l => l !== lang));
                        else setAlsoSpeaks([...alsoSpeaks, lang]);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#7a50dc] border-[#7a50dc] text-white shadow-xs'
                          : 'bg-white border-[#e2e4ed] text-[#0f0e17] hover:border-zinc-300'
                      }`}
                    >
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[12px] text-[#6c6b7e]">
                English is always on. Add one more Indian language if your callers use it.
              </div>
            </div>

            {/* VOICE FILTER & SEARCH HEADER (Matching Screenshot 2) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono">
                  <span>VOICE</span>
                  <Info className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-[12px] font-mono text-[#0f0e17]">
                  Selected: <strong className="font-bold text-[#7a50dc]">{selectedVoiceId}</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search voices by code, style, accent or use"
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#e2e4ed] bg-white text-[12.5px] text-[#0f0e17] placeholder:text-zinc-400 focus:outline-none focus:border-[#7a50dc]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-[#e2e4ed] bg-white text-[12px] font-medium text-[#0f0e17] focus:outline-none cursor-pointer"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                    <option value="English">English</option>
                  </select>
                  <select
                    value={moodFilter}
                    onChange={(e) => setMoodFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-[#e2e4ed] bg-white text-[12px] font-medium text-[#0f0e17] focus:outline-none cursor-pointer"
                  >
                    <option value="Any mood">Any mood</option>
                    <option value="Professional">Professional</option>
                    <option value="Warm">Warm</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Confident">Confident</option>
                    <option value="Calm">Calm</option>
                  </select>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-[#e2e4ed] bg-white text-[12px] font-medium text-[#0f0e17] focus:outline-none cursor-pointer"
                  >
                    <option value="Any gender">Any gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2-COLUMN VOICE GRID (Matching Screenshot 2 & 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Premium Voices Column (Ã¢â€šÂ¹6.8/min) */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f8]">
                  <div className="text-[15px] font-bold text-[#0f0e17]">
                    Premium voices <span className="text-zinc-400 font-normal text-xs">&bull; 32 Ã‚Â· most natural-sounding</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#f2ecfd] text-[#7a50dc] font-mono text-[11px] font-bold">
                    Ã¢â€šÂ¹6.8/min
                  </span>
                </div>

                <div className="space-y-2.5">
                  {premiumVoices
                    .filter(v => {
                      if (genderFilter !== 'Any gender' && v.gender !== genderFilter) return false;
                      if (moodFilter !== 'Any mood' && v.mood !== moodFilter) return false;
                      if (voiceSearchQuery && !v.id.toLowerCase().includes(voiceSearchQuery.toLowerCase()) && !v.desc.toLowerCase().includes(voiceSearchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map((v) => {
                      const isSelected = selectedVoiceId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVoiceId(v.id)}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#fbf9fe] border-[#7a50dc] ring-1 ring-[#7a50dc]/30 shadow-xs'
                              : 'bg-white border-[#e2e4ed] hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPlay();
                              }}
                              className="w-8 h-8 rounded-full bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center hover:scale-105 transition-transform"
                            >
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[13px] text-[#0f0e17] font-mono">{v.id}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                  v.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {v.gender}
                                </span>
                                {v.badge && (
                                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#f2ecfd] text-[#7a50dc] font-bold uppercase tracking-wider">
                                    {v.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">{v.desc}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-zinc-300 hover:text-amber-400 cursor-pointer" />
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#7a50dc] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11.5px] text-amber-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Our most lifelike delivery. Worth it for your primary customer-facing voice.</span>
                </div>
              </div>

              {/* Standard Voices Column (Ã¢â€šÂ¹5/min) */}
              <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f8]">
                  <div className="text-[15px] font-bold text-[#0f0e17]">
                    Standard voices <span className="text-zinc-400 font-normal text-xs">&bull; 23 Ã‚Â· great everyday quality</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-mono text-[11px] font-bold">
                    Ã¢â€šÂ¹5/min
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {standardVoices
                    .filter(v => {
                      if (genderFilter !== 'Any gender' && v.gender !== genderFilter) return false;
                      if (moodFilter !== 'Any mood' && v.mood !== moodFilter) return false;
                      if (voiceSearchQuery && !v.id.toLowerCase().includes(voiceSearchQuery.toLowerCase()) && !v.desc.toLowerCase().includes(voiceSearchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map((v) => {
                      const isSelected = selectedVoiceId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVoiceId(v.id)}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#fbf9fe] border-[#7a50dc] ring-1 ring-[#7a50dc]/30 shadow-xs'
                              : 'bg-white border-[#e2e4ed] hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPlay();
                              }}
                              className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center hover:scale-105 transition-transform"
                            >
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[13px] text-[#0f0e17] font-mono">{v.id}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                  v.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {v.gender}
                                </span>
                                {v.badge && (
                                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#f2ecfd] text-[#7a50dc] font-bold uppercase tracking-wider">
                                    {v.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">{v.desc}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-zinc-300 hover:text-amber-400 cursor-pointer" />
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#7a50dc] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* AMBIENT SOUND SECTION (Matching Screenshots 4 & 5) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-bold text-[#0f0e17]">Ambient sound</div>
                    <div className="text-[12px] text-[#6c6b7e]">
                      A soft office or call center bed under the call, so {employeeName || 'Imran'} sounds like a real place.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAmbientSoundEnabled(!ambientSoundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    ambientSoundEnabled ? 'bg-[#7a50dc]' : 'bg-zinc-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      ambientSoundEnabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {ambientSoundEnabled && (
                <>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-zinc-600 font-medium">
                        <Volume2 className="w-4 h-4 text-zinc-500" />
                        <span>Volume</span>
                      </div>
                      <span className="text-[#7a50dc] font-bold">{ambientVolume.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#7a50dc] cursor-pointer"
                    />
                    <div className="text-[11.5px] text-[#6c6b7e]">
                      Kept comfortably under {employeeName || 'Imran'}&apos;s voice. Higher = more present.
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono">
                      SELECT AMBIENCE
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'Office Ambience',
                          icon: Building2,
                          desc: 'Phone, typing, quiet paperwork'
                        },
                        {
                          id: 'Call Center',
                          icon: Headphones,
                          desc: 'Busy floor, murmur of agents'
                        },
                        {
                          id: 'Restaurant / Cafe',
                          icon: Coffee,
                          desc: 'Chatter, clinking plates'
                        },
                        {
                          id: 'Quiet Room',
                          icon: VolumeX,
                          desc: 'Calm room tone, no chatter'
                        },
                        {
                          id: 'Retail Store',
                          icon: Store,
                          desc: 'Store floor, distant voices'
                        }
                      ].map((item) => {
                        const isSelected = selectedAmbience === item.id;
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedAmbience(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-[#f8f5fe] border-[#7a50dc] ring-1 ring-[#7a50dc]/30 shadow-xs'
                                : 'bg-white border-[#e2e4ed] hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#7a50dc] text-white' : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-[13px] font-bold text-[#0f0e17]">{item.id}</div>
                                <div className="text-[11.5px] text-[#6c6b7e]">{item.desc}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#7a50dc] text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Playing preview of ${item.id}`);
                                }}
                                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INSTANT LEADS (SCREENSHOTS FROM BATCH 2) */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'instant-leads' && (
          <div className="space-y-6">
            {/* Top Warning Banner (Exact from Screenshot 1 & 4) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fffbeb] border border-[#fef08a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13.5px] font-bold text-[#854d0e]">
                    {employeeName} needs a phone number to call your leads
                  </div>
                  <div className="text-[12px] text-[#a16207] mt-0.5">
                    Buy a number and assign it to {employeeName} to start making real calls. Everything here saves in the meantime &mdash; it just can&apos;t dial yet.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('phone-numbers')}
                className="px-5 py-2.5 rounded-xl bg-[#c88d25] hover:bg-[#b47c1f] text-white font-bold text-[12.5px] shrink-0 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Get a number
              </button>
            </div>

            {/* Helper Info line */}
            <div className="text-[12.5px] text-[#6c6b7e] flex items-center gap-1.5 px-1">
              <Info className="w-4 h-4 text-[#7a50dc]" />
              <span>Connect where your leads come from, so {employeeName} calls each new one in seconds.</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ========================================================= */}
              {/* LEFT COLUMN: CONNECT LEADS, CALLING POLICY & DONUT CHART  */}
              {/* ========================================================= */}
              <div className="lg:col-span-4 space-y-5">
                {/* Connect your leads Card */}
                <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-3">
                  <div className="text-[13px] font-bold text-[#0f0e17] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Connect your leads
                  </div>
                  <p className="text-[12px] text-[#6c6b7e] leading-snug">
                    When a lead arrives, {employeeName} calls it automatically &mdash; after your delay, inside your calling hours.
                  </p>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-[#7a50dc] hover:bg-[#673fc4] text-white font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Connect your leads
                  </button>
                </div>

                {/* Calling policy Card (Screenshot 1, 2, 4) */}
                <div className="bg-white rounded-3xl p-5 border border-[#e2e4ed] shadow-xs space-y-4 text-[12.5px]">
                  <div className="text-[13px] font-bold text-[#0f0e17] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Calling policy
                  </div>

                  {/* Call delay */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-zinc-700">Call delay</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={leadCallDelay}
                        onChange={(e) => setLeadCallDelay(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-[#e2e4ed] text-center font-bold text-[#0f0e17]"
                      />
                      <span className="text-zinc-500 text-[12px]">sec</span>
                    </div>
                  </div>

                  {/* Calling window */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-zinc-700 block">Calling window</span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={callingWindowStart}
                          onChange={(e) => setCallingWindowStart(e.target.value)}
                          className="w-full pl-2.5 pr-7 py-1 rounded-lg border border-[#e2e4ed] font-medium text-[12px]"
                        />
                        <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-zinc-400">&mdash;</span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={callingWindowEnd}
                          onChange={(e) => setCallingWindowEnd(e.target.value)}
                          className="w-full pl-2.5 pr-7 py-1 rounded-lg border border-[#e2e4ed] font-medium text-[12px]"
                        />
                        <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Leads outside calling hours */}
                  <div className="space-y-2 pt-1 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-700 block">Leads outside calling hours</span>
                    
                    {/* Mode Toggle */}
                    <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-zinc-100 border border-zinc-200 text-[11px] font-medium text-center">
                      {['auto-send', 'manual-release', 'skip'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setOutsideHoursMode(mode)}
                          className={`py-1 rounded-lg capitalize transition-all cursor-pointer ${
                            outsideHoursMode === mode ? 'bg-white text-[#7a50dc] font-bold shadow-2xs border border-[#d8c7fa]' : 'text-zinc-600'
                          }`}
                        >
                          {mode.replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    {/* Timing Selector */}
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-medium text-center">
                      {['next-open', '+3-hrs', '+6-hrs', 'next-day'].map((timing) => (
                        <button
                          key={timing}
                          type="button"
                          onClick={() => setReleaseTiming(timing)}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            releaseTiming === timing
                              ? 'border-[#7a50dc] bg-[#fbf9fe] text-[#7a50dc] font-bold'
                              : 'border-[#e2e4ed] bg-white text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {timing === 'next-open' ? 'Next open' : timing === '+3-hrs' ? '+3 hrs' : timing === '+6-hrs' ? '+6 hrs' : 'Next day'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        value={outsideHoursDelay}
                        onChange={(e) => setOutsideHoursDelay(Number(e.target.value))}
                        className="w-14 px-2 py-1 rounded-lg border border-[#e2e4ed] text-center font-bold text-[#0f0e17]"
                      />
                      <span className="text-zinc-500 text-[11.5px]">hrs</span>
                    </div>

                    <p className="text-[11px] text-zinc-400">
                      Calls as soon as calling hours next open.
                    </p>
                  </div>

                  {/* Retry if no answer */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-700 block">Retry if no answer</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {retryIntervals.map((interval, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[11.5px] font-medium border border-zinc-200 flex items-center gap-1.5"
                        >
                          {interval}
                          <button
                            type="button"
                            onClick={() => setRetryIntervals(retryIntervals.filter((_, idx) => idx !== i))}
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRetryIntervals([...retryIntervals, '240 min'])}
                        className="text-[11.5px] font-bold text-[#7a50dc] hover:underline cursor-pointer"
                      >
                        + Add step
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400">Up to 3 attempts total.</p>
                  </div>

                  {/* Calling days */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-700 block">Calling days</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          className="px-2.5 py-1 rounded-lg border border-[#d8c7fa] bg-[#fbf9fe] text-[#7a50dc] font-bold text-[11px] shadow-2xs"
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-zinc-400">Calls every day.</p>
                  </div>

                  {/* Holidays Ã¢â‚¬â€ never call on */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                    <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Holidays &mdash; never call on
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="mm/dd/yyyy"
                          value={holidaysDate}
                          onChange={(e) => setHolidaysDate(e.target.value)}
                          className="w-full pl-2.5 pr-7 py-1 rounded-lg border border-[#e2e4ed] font-medium text-[11.5px]"
                        />
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setHolidaysDate('')}
                        className="px-3 py-1 rounded-lg border border-[#e2e4ed] bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-medium text-[11.5px] cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Respect Do-Not-Call list */}
                  <div className="pt-1 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold text-zinc-700 flex items-center gap-1">
                        <PhoneOff className="w-3.5 h-3.5 text-zinc-400" />
                        Respect Do-Not-Call list
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Skip numbers your account has opted out.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={respectDnc}
                        onChange={(e) => setRespectDnc(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#7a50dc]" />
                    </label>
                  </div>

                  {/* Max at once */}
                  <div className="pt-1 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Max at once
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={maxAtOnce}
                        onChange={(e) => setMaxAtOnce(e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg border border-[#e2e4ed] text-center font-bold text-[11.5px] text-[#0f0e17]"
                      />
                      <span className="text-zinc-500 text-[11px]">calls</span>
                    </div>
                  </div>

                  {/* Duplicate lead window */}
                  <div className="pt-1 border-t border-zinc-100 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-zinc-700">Duplicate lead window</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={duplicateLeadWindow}
                          onChange={(e) => setDuplicateLeadWindow(Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded-lg border border-[#e2e4ed] text-center font-bold text-[#0f0e17]"
                        />
                        <span className="text-zinc-500 text-[11.5px]">min</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Same number again within this many minutes is skipped.
                    </p>
                  </div>

                  {/* Save calling policy button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => alert('Calling policy saved!')}
                      className="w-full py-2.5 rounded-xl bg-[#7a50dc] hover:bg-[#673fc4] text-white font-bold text-[12.5px] shadow-xs transition-all cursor-pointer"
                    >
                      Save calling policy
                    </button>
                  </div>
                </div>

                {/* Lead quality breakdown Card (Exact match to Screenshots 2 & 3) */}
                <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                  <div className="text-[14px] font-bold text-[#0f0e17]">
                    Lead quality breakdown
                  </div>
                  <div className="flex flex-col items-center justify-center pt-2 space-y-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" stroke="#f1f3f9" strokeWidth="14" fill="transparent" />
                        <circle cx="50" cy="50" r="38" stroke="#7a50dc" strokeWidth="14" strokeDasharray="119.38 238.76" strokeDashoffset="0" fill="transparent" />
                        <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="14" strokeDasharray="119.38 238.76" strokeDashoffset="-119.38" fill="transparent" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[28px] font-extrabold text-[#0f0e17] leading-none font-display">2</span>
                        <span className="text-[10px] text-zinc-400 font-medium">total leads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7a50dc]" />
                        <span className="text-zinc-600">Qualified</span>
                        <span className="font-bold text-zinc-900 ml-1">1</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                        <span className="text-zinc-600">Voicemail</span>
                        <span className="font-bold text-zinc-900 ml-1">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT COLUMN: CALL LOG TABLE WITH LIVE MULTI-SELECT FILTERS*/}
              {/* ========================================================= */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e4ed] shadow-xs space-y-4">
                  {/* Table Header with dynamic count (Screenshots 1, 4, 5) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-[#0f0e17]">Call log</span>
                      <span className="text-[12px] font-mono text-zinc-400">
                        {filteredCallLogs.length} of {rawCallLogs.length} calls
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg border border-[#e2e4ed] hover:bg-zinc-50 text-zinc-500 text-[12px] flex items-center justify-center cursor-pointer"
                        title="Collapse"
                      >
                        &laquo;
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Exporting call logs CSV...')}
                        className="px-3 py-1.5 rounded-xl border border-[#e2e4ed] hover:bg-zinc-50 text-zinc-700 font-medium text-[12px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search contact, phone, captured info..."
                      value={searchLeadQuery}
                      onChange={(e) => setSearchLeadQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e2e4ed] bg-zinc-50/50 text-[12.5px] text-[#0f0e17] placeholder:text-zinc-400 focus:outline-hidden focus:border-[#7a50dc] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Filter Pills Row (Screenshots 4 & 5) */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
                    {/* Outcome Pills with Multi-Select Toggle */}
                    {['Callback', 'Qualified', 'Voicemail'].map((outcome) => {
                      const isSelected = selectedOutcomes.includes(outcome);
                      return (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => toggleOutcome(outcome)}
                          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#7a50dc] text-white shadow-xs font-bold'
                              : 'bg-white border border-[#e2e4ed] text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {outcome}
                        </button>
                      );
                    })}

                    {/* All Sentiment Pill */}
                    <button
                      type="button"
                      onClick={() => setSentimentFilter('All')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        sentimentFilter === 'All'
                          ? 'bg-[#7a50dc] text-white shadow-xs font-bold'
                          : 'bg-white border border-[#e2e4ed] text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      All sentiment
                    </button>

                    {/* Sentiment choices */}
                    {['Positive', 'Neutral', 'Negative'].map((sent) => (
                      <button
                        key={sent}
                        type="button"
                        onClick={() => setSentimentFilter(sentimentFilter === sent ? 'All' : sent)}
                        className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          sentimentFilter === sent
                            ? 'bg-[#7a50dc] text-white shadow-xs font-bold'
                            : 'bg-white border border-[#e2e4ed] text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {sent}
                      </button>
                    ))}

                    {/* Any time Dropdown (Exact match to Screenshot 5) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className={`px-3 py-1 rounded-lg border border-[#e2e4ed] bg-white text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                          isTimeDropdownOpen ? 'ring-2 ring-[#7a50dc]/20 border-[#7a50dc]' : ''
                        }`}
                      >
                        <span>{timeFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      {isTimeDropdownOpen && (
                        <div className="absolute top-full mt-1.5 left-0 z-30 w-36 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden py-1 text-left">
                          {['Any time', 'Last 24h', 'Last 7 days', 'Last 30 days', 'Custom range...'].map((t) => {
                            const isSelected = timeFilter === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  setTimeFilter(t);
                                  setIsTimeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-1.5 text-[12px] transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1d4ed8] text-white font-medium'
                                    : 'text-zinc-700 hover:bg-zinc-50'
                                }`}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Hot only */}
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg border border-[#e2e4ed] bg-white text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Hot only
                    </button>
                  </div>

                  {/* Secondary Filter Row with Clear filters button (Screenshots 4 & 5) */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-[11.5px] text-zinc-600">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg border border-[#e2e4ed] bg-white hover:bg-zinc-50 flex items-center gap-1 text-zinc-700 cursor-pointer"
                      >
                        Filter by field...
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                      </button>

                      <div className="flex items-center gap-1">
                        <span>Duration (min)</span>
                        <input type="text" placeholder="min" className="w-10 px-1.5 py-0.5 rounded border border-[#e2e4ed] text-center text-[11px]" />
                        <span>&mdash;</span>
                        <input type="text" placeholder="max" className="w-10 px-1.5 py-0.5 rounded border border-[#e2e4ed] text-center text-[11px]" />
                      </div>

                      <div className="flex items-center gap-1">
                        <span>Credits</span>
                        <input type="text" placeholder="min" className="w-10 px-1.5 py-0.5 rounded border border-[#e2e4ed] text-center text-[11px]" />
                        <span>&mdash;</span>
                        <input type="text" placeholder="max" className="w-10 px-1.5 py-0.5 rounded border border-[#e2e4ed] text-center text-[11px]" />
                      </div>

                      {/* Clear Filters (Screenshots 4 & 5) */}
                      {(selectedOutcomes.length > 0 || sentimentFilter !== 'All' || searchLeadQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOutcomes([]);
                            setSentimentFilter('All');
                            setSearchLeadQuery('');
                          }}
                          className="text-[#7a50dc] hover:underline font-bold text-[12px] ml-1 cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg border border-[#e2e4ed] bg-white hover:bg-zinc-50 flex items-center gap-1 text-zinc-700 cursor-pointer"
                      >
                        <Columns className="w-3.5 h-3.5 text-zinc-500" />
                        Columns
                        <span className="text-[10.5px] font-mono text-[#7a50dc] font-semibold">2 hidden</span>
                      </button>
                    </div>
                  </div>

                  {/* Table or Empty State (Exact match to Screenshots 2, 4, 5) */}
                  {filteredCallLogs.length > 0 ? (
                    <>
                      {/* Call Log Table */}
                      <div className="overflow-x-auto -mx-5 sm:-mx-6">
                        <table className="w-full text-left text-[12px]">
                          <thead>
                            <tr className="border-b border-[#e2e4ed] bg-zinc-50/70 text-zinc-500 text-[10.5px] uppercase font-mono font-bold">
                              <th className="py-2.5 px-4">CONTACT</th>
                              <th className="py-2.5 px-3">OUTCOME</th>
                              <th className="py-2.5 px-3">SENTIMENT</th>
                              <th className="py-2.5 px-3">JEWELLERY_TYPE</th>
                              <th className="py-2.5 px-3">SEND_WHATSAPP</th>
                              <th className="py-2.5 px-3">TIME &darr;</th>
                              <th className="py-2.5 px-4">SUMMARY</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f0f2f8]">
                            {filteredCallLogs.map((call) => (
                              <tr key={call.id} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#0f0e17]">{call.contact}</span>
                                    {call.badge && (
                                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                                        call.badge === 'Web call'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                      }`}>
                                        {call.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                    {call.duration} &bull; {call.cost} &bull; <span className="text-zinc-300">{call.id}</span>
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                    call.outcome === 'Qualified'
                                      ? 'bg-[#f2ecfd] text-[#7a50dc] border-[#d8c7fa]'
                                      : call.outcome === 'Voicemail'
                                      ? 'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]'
                                      : 'bg-[#fffbeb] text-[#b45309] border-[#fef3c7]'
                                  }`}>
                                    {call.outcome}
                                  </span>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="flex items-center gap-1 text-zinc-600">
                                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                                    {call.sentiment}
                                  </span>
                                </td>

                                <td className="py-3 px-3 font-mono text-zinc-600">
                                  {call.jewelleryType}
                                </td>

                                <td className="py-3 px-3 font-mono text-zinc-600">
                                  {call.sendWhatsapp}
                                </td>

                                <td className="py-3 px-3 text-zinc-600 whitespace-nowrap">
                                  {call.time}
                                </td>

                                <td className="py-3 px-4 text-zinc-500 text-[11.5px] max-w-xs truncate" title={call.summary}>
                                  {call.summary === 'No summary' ? <span className="italic text-zinc-400">No summary</span> : call.summary}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Footer Pagination */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-[12px] text-zinc-500">
                        <div>
                          Showing 1-{filteredCallLogs.length} of {filteredCallLogs.length}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span>Rows per page</span>
                            <select className="px-2 py-1 rounded-lg border border-[#e2e4ed] bg-white text-[12px]">
                              <option>50</option>
                              <option>25</option>
                              <option>10</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 font-medium">
                            <button type="button" className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer">&lsaquo; Prev</button>
                            <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-[11px] text-zinc-700">page 1 / 1</span>
                            <button type="button" className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer">Next &rsaquo;</button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Exact Empty State from Screenshots 2, 4, 5 */
                    <div className="py-16 text-center text-zinc-500 text-[13.5px] font-medium">
                      No calls match your filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}\n\n        {/* ========================================================================= */}
        {/* TAB 5: ACTIONS (EXACT MATCH TO SCREENSHOT 5) */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'actions' && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#6c6b7e] px-1">
              <Info className="w-4 h-4 text-[#7a50dc] shrink-0" />
              <span>Let {employeeName || 'Imran'} do things mid-call &mdash; book a slot, send a WhatsApp, check availability.</span>
            </div>

            {/* DURING THE CALL CARD */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0f2f8]">
                <div>
                  <div className="text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono flex items-center gap-1.5">
                    <span>DURING THE CALL</span>
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-[14.5px] font-bold text-[#0f0e17] mt-1">
                    Enable API actions
                  </div>
                  <div className="text-[12px] text-[#6c6b7e] mt-0.5">
                    Turns every integration below on or off at once &mdash; Custom API and WhatsApp share this switch.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setApiActionsEnabled(!apiActionsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    apiActionsEnabled ? 'bg-[#7a50dc]' : 'bg-zinc-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      apiActionsEnabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 6 Integration Cards Grid (Exact from Screenshot 5) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Interakt */}
                <div
                  onClick={() => setActiveActionModal('interakt')}
                  className="p-5 rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0f0e17]">Interakt</div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">WhatsApp &bull; not set up</div>
                  </div>
                </div>

                {/* 2. AiSensy */}
                <div
                  onClick={() => setActiveActionModal('aisensy')}
                  className="p-5 rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0f0e17]">AiSensy</div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">WhatsApp &bull; not set up</div>
                  </div>
                </div>

                {/* 3. Meta Cloud API (Connected in Server!) */}
                <div
                  onClick={() => setActiveActionModal('metaCloud')}
                  className="p-5 rounded-2xl border border-blue-200 bg-blue-50/20 hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer space-y-3 group relative"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#0f0e17]">Meta Cloud API</span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Active
                      </span>
                    </div>
                    <div className="text-[11.5px] text-emerald-700 font-medium mt-0.5">WhatsApp &bull; Zero-config Ready</div>
                  </div>
                </div>

                {/* 4. Custom API */}
                <div
                  onClick={() => setActiveActionModal('customApi')}
                  className="p-5 rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="font-mono font-bold text-xs">&lt;/&gt;</span>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0f0e17]">Custom API</div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">Call any external API</div>
                  </div>
                </div>

                {/* 5. Google Calendar */}
                <div
                  onClick={() => setActiveActionModal('calendar')}
                  className="p-5 rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0f0e17]">Google Calendar</div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">Not connected</div>
                  </div>
                </div>

                {/* 6. Other WhatsApp */}
                <div
                  onClick={() => setActiveActionModal('otherWhatsapp')}
                  className="p-5 rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] hover:shadow-xs transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7a50dc] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0f0e17]">Other WhatsApp</div>
                    <div className="text-[11.5px] text-[#6c6b7e] mt-0.5">Different provider / issues?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: OUTCOMES */}
        {/* ========================================================================= */}
        {activeEmployeeTab === 'outcomes' && (
          <div className="space-y-6">
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#6c6b7e] px-1">
              <Info className="w-4 h-4 text-[#7a50dc] shrink-0" />
              <span>Define what {employeeName || 'Imran'} collects and evaluates on each call.</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e2e4ed] shadow-xs space-y-5">
              <div className="text-[11px] font-bold text-[#6c6b7e] tracking-wider uppercase font-mono">
                DATA CAPTURED ON EVERY CALL
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Category', value: (selectedJewelleryTypes || [])[0] || 'Enquiry', type: 'Choice' },
                  { label: 'Action', value: (selectedActions || [])[0] || 'Send WhatsApp brochure', type: 'Choice' },
                  { label: 'Budget', value: priceRange || '5000 to 1500000', type: 'Range' },
                  { label: 'Planned Visit Time', value: 'Flexible / Weekend', type: 'Text' },
                  { label: 'Interest Level', value: 'High', type: 'Status' }
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc] space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#7a50dc] font-mono font-semibold">
                      <span>{item.label}</span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white border border-[#eee8fc] text-[#6c6b7e]">{item.type}</span>
                    </div>
                    <div className="text-[13px] font-bold text-[#0f0e17]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for Settings tab */}
        {activeEmployeeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-8 border border-[#e2e4ed] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0f0e17]">
              Employee Settings
            </h3>
            <p className="text-[13px] text-[#6c6b7e] max-w-md mx-auto">
              Configure employee name, tenant identifiers, and custom telephony routing.
            </p>
          </div>
        )}

        {/* Bottom Deploy CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e2e4ed]">
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="text-[13px] font-semibold text-[#0f0e17] hover:text-[#7a50dc] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to phone test call
          </button>

          <button
            type="button"
            onClick={handleDeployEmployee}
            className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-[14.5px] px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            Publish &amp; Return to Dashboard
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 10-STEP TARGET-ANCHORED GUIDED TOUR MODAL (MATCHES ALL USER SCREENSHOTS) */}
        {/* ========================================================================= */}
        {showTour && (
          <div
            className={`fixed z-50 animate-in fade-in zoom-in-95 duration-200 ${
              tourStep === 1
                ? 'top-40 left-8 sm:left-24 lg:left-80 max-w-[340px] w-full'
                : tourStep === 2
                ? 'top-48 right-6 lg:right-16 max-w-[330px] w-full'
                : tourStep === 3
                ? 'top-44 right-6 lg:right-12 max-w-[330px] w-full'
                : tourStep === 4
                ? 'bottom-20 right-6 lg:right-16 max-w-[330px] w-full'
                : tourStep === 5
                ? 'top-44 left-8 sm:left-24 lg:left-80 max-w-[350px] w-full'
                : tourStep === 6
                ? 'top-24 right-40 max-w-[330px] w-full'
                : tourStep === 7
                ? 'top-48 left-1/3 max-w-[380px] w-full'
                : tourStep === 8
                ? 'top-40 left-12 max-w-[330px] w-full'
                : tourStep === 9
                ? 'top-44 left-8 sm:left-24 lg:left-80 max-w-[350px] w-full'
                : 'top-28 left-8 sm:left-16 lg:left-32 max-w-[350px] w-full'
            }`}
          >
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-zinc-200/90 space-y-3 relative text-left">
              {/* Pointer Beaks */}
              {tourStep === 1 && (
                <div className="absolute -bottom-2 left-10 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
              )}
              {tourStep === 2 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
              )}
              {tourStep === 3 && (
                <div className="absolute -top-2 right-16 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-xs" />
              )}
              {tourStep === 4 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
              )}
              {tourStep === 5 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
              )}
              {tourStep === 6 && (
                <div className="absolute -top-2 right-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-xs" />
              )}
              {tourStep === 7 && (
                <div className="absolute -top-2 left-12 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-xs" />
              )}
              {tourStep === 9 && (
                <div className="absolute -top-2 left-12 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-xs" />
              )}

              <button
                type="button"
                onClick={() => setShowTour(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Step 1 */}
              {tourStep === 1 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">This is their call script</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Everything they say, step by step &mdash; the opening line and every question, objection, and answer after it.
                  </p>
                </>
              )}

              {/* Step 2 */}
              {tourStep === 2 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Meet Swara</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Don&apos;t want to edit by hand? Just tell Swara what to change &mdash; speak or type, and she rewrites the flow.
                  </p>

                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        swaraSpeech.toggleListening({
                          initialText: swaraInput,
                          language: swaraLangCode || 'en-IN',
                          onTranscript: (updated) => setSwaraInput(updated)
                        });
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        swaraSpeech.isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-[#7a50dc] to-[#9061f9] text-white hover:opacity-95'
                      }`}
                    >
                      {swaraSpeech.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{swaraSpeech.isListening ? 'Listening... say change' : 'Tap & Speak to Swara'}</span>
                    </button>
                    <span className="text-[11px] text-zinc-500">or use the Swara panel &rarr;</span>
                  </div>
                </>
              )}

              {/* Step 3 */}
              {tourStep === 3 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Hear it for real</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    A real phone call to you, right now &mdash; free, and exactly what a caller would hear.
                  </p>
                </>
              )}

              {/* Step 4 */}
              {tourStep === 4 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">4</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">This is Training</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    This is where they get smarter over time &mdash; after real calls, Swara flags exactly what to teach next, from what actually happened, not a guess.
                  </p>
                </>
              )}

              {/* Step 5 */}
              {tourStep === 5 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">5</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Teach them anything</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Script is what they always say. Training is facts they look up only when asked. Upload a screenshot, type it, or just talk &mdash; either way it becomes something they can use.
                  </p>
                </>
              )}

              {/* Step 6 */}
              {tourStep === 6 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">6</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Your balance</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    This is what&apos;s left. Calls, drafting, and training all draw from it &mdash; top up anytime.
                  </p>
                </>
              )}

              {/* Step 7 */}
              {tourStep === 7 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">7</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Everything about them is on this page</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Overview, Call script and Voice are always here; Training, Actions, Post-Call, Settings and their channel sit behind the arrow at the end of the row. Nothing about this employee lives anywhere else.
                  </p>
                </>
              )}

              {/* Step 8 */}
              {tourStep === 8 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">8</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Pick a voice</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Select the vocal identity that represents your business best in Telugu, Hindi, or English.
                  </p>
                </>
              )}

              {/* Step 9 */}
              {tourStep === 9 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">9</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">What each tier costs</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    Standard (Ã¢â€šÂ¹5/min) &mdash; noticeably warmer, the right default for most sales calls. Premium (Ã¢â€šÂ¹6.8/min) &mdash; the most human of the two, worth it when the call is a first impression. Every voice is tagged with its tier, so you always know the rate before you switch.
                  </p>
                </>
              )}

              {/* Step 10: Back to their script (Exact from Screenshot 1 & 2) */}
              {tourStep === 10 && (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#7a50dc] text-[#7a50dc] flex items-center justify-center text-xs font-bold">10</div>
                  <h4 className="text-[15px] font-bold text-zinc-900 font-display">Back to their script</h4>
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                    This is where you&apos;ll spend most of your time &mdash; go ahead and make it yours.
                  </p>
                </>
              )}

              {/* Tour Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[11px] font-mono text-zinc-400 font-medium">
                  STEP {tourStep} OF 10
                </span>
                <div className="flex items-center gap-2">
                  {tourStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevTourStep}
                      className="text-[12px] text-zinc-500 hover:text-zinc-800 font-medium px-2 py-1 cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextTourStep}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7a50dc] hover:bg-[#673fc4] text-white text-[12px] font-bold cursor-pointer"
                  >
                    {tourStep < 10 ? 'Next >' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

          )}
        </div>
      </div>

{/* ========================================================================= */}
      {/* POPUP MODAL: BEFORE YOUR FIRST CALL */}
      {/* ========================================================================= */}
      {showPreCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white rounded-[28px] p-6 sm:p-8 max-w-[480px] w-full space-y-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPreCallModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="text-[11px] font-mono font-bold text-[#6c6b7e] uppercase tracking-wider">
                BEFORE YOUR FIRST CALL
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-bold text-[#0f0e17] tracking-tight font-display mt-1.5 leading-snug">
                A few honest words about what you&apos;re about to hear
              </h3>
            </div>

            {/* 3 Honest Bullet Points */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#0f0e17]">It&apos;s an AI on the line</div>
                  <div className="text-[12.5px] text-[#6c6b7e] mt-0.5 leading-relaxed">
                    {employeeName} is software, not a person. She&apos;ll sound close to human &mdash; she isn&apos;t one, and you shouldn&apos;t expect her to be.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center shrink-0 mt-0.5">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#0f0e17]">She only knows what you told her</div>
                  <div className="text-[12.5px] text-[#6c6b7e] mt-0.5 leading-relaxed">
                    She was built from the few lines you typed a minute ago. Anything you didn&apos;t mention, she doesn&apos;t know yet.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#f2ecfd] text-[#7a50dc] flex items-center justify-center shrink-0 mt-0.5">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#0f0e17]">This is version one</div>
                  <div className="text-[12.5px] text-[#6c6b7e] mt-0.5 leading-relaxed">
                    First calls are rarely perfect. Everything she says is yours to edit straight after &mdash; that&apos;s the part most people find fun.
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Box */}
            <div
              onClick={() => setHasAgreedConsent(!hasAgreedConsent)}
              className="p-3.5 rounded-2xl border border-[#7a50dc]/40 bg-[#f2ecfd]/20 flex items-start gap-3 cursor-pointer hover:bg-[#f2ecfd]/30 transition-colors"
            >
              <div className="pt-0.5">
                <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
                  hasAgreedConsent ? 'bg-[#7a50dc] text-white' : 'border border-zinc-300 bg-white'
                }`}>
                  {hasAgreedConsent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <div className="text-[12.5px] text-[#3a3f5c] leading-relaxed select-none">
                The phone number I&apos;m about to enter is <span className="font-bold text-[#0f0e17]">my own</span>, and I&apos;m happy to receive this call on it.
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={!hasAgreedConsent}
              onClick={startIncomingCall}
              className={`w-full py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                hasAgreedConsent
                  ? 'bg-[#7a50dc] hover:bg-[#673fc4] text-white shadow-purple-500/20 active:scale-98'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              I understand &mdash; call me
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
