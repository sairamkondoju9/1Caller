
export function pickAutoNameAndVoice(langStr) {
  const l = (langStr || '').toLowerCase();
  if (l.includes('telugu') || l.includes('te')) {
    const list = ['Priya', 'Kavya', 'Sravani', 'Ananya', 'Harika'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'P09', label: 'P09 · Warm Telugu Voice' };
  }
  if (l.includes('hindi') || l.includes('hi')) {
    const list = ['Imran', 'Pooja', 'Aarav', 'Rohan', 'Neha'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'H01', label: 'H01 · Fluent Hindi Professional' };
  }
  if (l.includes('tamil') || l.includes('ta')) {
    const list = ['Priya', 'Deepa', 'Karthik', 'Anitha'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'T01', label: 'T01 · Expressive Tamil Specialist' };
  }
  if (l.includes('kannada') || l.includes('kn')) {
    const list = ['Sahana', 'Varun', 'Deepa', 'Kiran'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'K01', label: 'K01 · Natural Kannada Voice' };
  }
  if (l.includes('malayalam') || l.includes('ml')) {
    const list = ['Anjali', 'Rahul', 'Reshma'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'M01', label: 'M01 · Clear Malayalam Advisor' };
  }
  if (l.includes('marathi') || l.includes('mr')) {
    const list = ['Swati', 'Omkar', 'Pooja', 'Tanvi'];
    const name = list[Math.floor(Math.random() * list.length)];
    return { name, voice: 'MR01', label: 'MR01 · Polished Marathi Executive' };
  }
  const list = ['Lakshmi', 'Sarah', 'Alex', 'Rohan'];
  const name = list[Math.floor(Math.random() * list.length)];
  return { name, voice: 'E01', label: 'E01 · Global English Professional' };
}

import React, { useState, useEffect, useCallback } from 'react';
import TrialCallModal from '../components/TrialCallModal';
import { INDUSTRY_TEMPLATES, getIndustryDefaults } from '../utils/industryData';
import { getAuthHeaders } from '../utils/api';
import {
  Sparkles,
  X,
  Zap,
  Megaphone,
  PhoneIncoming,
  CreditCard,
  Phone,
  MessageSquare,
  Database,
  UserPlus,
  Trash2,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Check,
  Volume2,
  Loader2,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  GraduationCap,
  Award,
  Users,
  PhoneCall,
  ChevronRight,
  ExternalLink,
  Building2,
  Stethoscope,
  Car,
  Store,
  Hammer,
  HelpCircle,
  Globe,
  FileText,
  Lock
} from 'lucide-react';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';

export const DEFAULT_DASHBOARD_NEXT_ACTIONS = [
  'Schedule a site visit for measurement',
  'Send product catalog via email',
  'Request specific design preferences',
  'Confirm delivery timeline expectations',
  'Other'
];

export default function DashboardView({
  onNavigate,
  onBuildEmployee,
  onSaveEmployee,
  onDeleteEmployee,
  employees = [],
  stats = {},
  isMyEmployeesView = false
}) {
  const [selectedMode, setSelectedMode] = useState('instant'); // 'instant' | 'bulk' | 'inbound'
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');
  const initialRealEstate = getIndustryDefaults('Real estate', 'te');
  const [promptText, setPromptText] = useState(INDUSTRY_TEMPLATES[0].text);
  const [selectedIndustry, setSelectedIndustry] = useState('Real estate');
  const [customIndustryText, setCustomIndustryText] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [employeeBuildError, setEmployeeBuildError] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
  const [deleteEmployeeError, setDeleteEmployeeError] = useState('');
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d'
  const [callFilter, setCallFilter] = useState('all'); // 'all' | 'positive' | 'neutral' | 'negative'
  const [summaryData, setSummaryData] = useState(null);
  const [callsList, setCallsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const speech = useSpeechRecognition();

  // Multi-Language Definition: Indian Regional + Mandated English
  const languages = [
    { code: 'te', langCode: 'te-IN', label: 'తెలుగు', name: 'Telugu' },
    { code: 'hi', langCode: 'hi-IN', label: 'हिन्दी', name: 'Hindi' },
    { code: 'ta', langCode: 'ta-IN', label: 'தமிழ்', name: 'Tamil' },
    { code: 'kn', langCode: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { code: 'ml', langCode: 'ml-IN', label: 'മലയാളം', name: 'Malayalam' },
    { code: 'mr', langCode: 'mr-IN', label: 'मराठी', name: 'Marathi' },
    { code: 'en', langCode: 'en-IN', label: 'English', name: 'English' }
  ];

  const currentLangObj = languages.find(l => l.name === selectedLanguage) || languages[0];

  const industries = INDUSTRY_TEMPLATES;

  // Fetch strictly REAL metrics from backend
  const fetchDashboardData = useCallback((signal) => {
    setIsLoading(true);
    setDashboardError('');
    fetch(`/api/dashboard-summary?range=${timeRange}`, { headers: getAuthHeaders(), signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Dashboard metrics are temporarily unavailable.');
        return data;
      })
      .then((data) => {
        setSummaryData(data);
        setCallsList(Array.isArray(data.recentCalls) ? data.recentCalls : []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Failed to load real dashboard summary:', err);
        setSummaryData(null);
        setCallsList([]);
        setDashboardError(err.message || 'Dashboard metrics are temporarily unavailable.');
        setIsLoading(false);
      });
  }, [timeRange]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  // Handle language switch & update speech recognition
  const handleSelectLanguage = (langObj) => {
    setSelectedLanguage(langObj.name);
    speech.setLang(langObj.langCode);
    if (speech.isListening) {
      speech.stopListening();
      setTimeout(() => {
        speech.startListening({
          initialText: promptText,
          language: langObj.langCode,
          onTranscript: (updated) => setPromptText(updated)
        });
      }, 100);
    }
  };

  const handleSelectIndustry = (ind) => {
    setSelectedIndustry(ind.label);
    const pText = ind.text || ind.samplePrompt || '';
    if (pText) {
      setPromptText(pText);
    }
    const def = getIndustryDefaults(ind.label, currentLangObj.code);
    if (def) {
      setBusinessName(def.businessName);
      setPriceRange(def.priceRange);
      setEmployeeName(def.employeeName);
      setEmployeeRole(def.role);
      setSelectedVoice(def.voice);
      setQuickQuestions(def.questions);
      if (def.questions?.[2]?.defaultSelected) {
        setSelectedDetailsToCollect(def.questions[2].defaultSelected);
      }
      if (def.questions?.[3]?.defaultSelected?.[0]) {
        setQ2Selection(def.questions[3].defaultSelected[0]);
      }
    }
  };

  // In-Place Obsidian Luxury Builder States (Matching Screenshots 1-5 Exactly)
  const [heroStage, setHeroStage] = useState('idle'); // 'idle' | 'analyzing' | 'quick-details' | 'planning' | 'voice'
  const [questionIdx, setQuestionIdx] = useState(0);
  const [quickQuestions, setQuickQuestions] = useState(initialRealEstate.questions);
  const [priceRange, setPriceRange] = useState(initialRealEstate.priceRange);
  const [q2Selection, setQ2Selection] = useState(initialRealEstate.questions[3].defaultSelected[0]);
  const [otherNextActionText, setOtherNextActionText] = useState('');
  const [selectedNextActions, setSelectedNextActions] = useState([
    'Schedule a site visit for measurement'
  ]);
  const [selectedDetailsToCollect, setSelectedDetailsToCollect] = useState(initialRealEstate.questions[2].defaultSelected);
  const [otherCategoryText, setOtherCategoryText] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [q4Selection, setQ4Selection] = useState('Explain value');
  const [otherActionText, setOtherActionText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('P09');
  const [employeeName, setEmployeeName] = useState(initialRealEstate.employeeName);
  const [businessName, setBusinessName] = useState(initialRealEstate.businessName);
  const [employeeRole, setEmployeeRole] = useState(initialRealEstate.role);
  const toggleDetail = (item) => {
    if (selectedDetailsToCollect.includes(item)) {
      setSelectedDetailsToCollect(selectedDetailsToCollect.filter(d => d !== item));
    } else {
      setSelectedDetailsToCollect([...selectedDetailsToCollect, item]);
    }
  };

  const handleHeroNextQuestion = () => {
    const totalQ = quickQuestions.length > 0 ? quickQuestions.length : 4;
    if (questionIdx < totalQ - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      handleFinishAndGoToStudio('call-script');
    }
  };

  const handleHeroPrevQuestion = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else {
      setHeroStage('idle');
    }
  };

  const handleBuild = async () => {
    if (promptText.trim().length < 10) {
      setEmployeeBuildError('Describe the business and employee requirements in at least 10 characters.');
      return;
    }

    const autoPick = pickAutoNameAndVoice(selectedLanguage);
    setEmployeeBuildError('');
    setEmployeeName(autoPick.name);
    setSelectedVoice(autoPick.voice);
    setBusinessName('');
    setPriceRange('');
    setSelectedDetailsToCollect([]);
    setQ2Selection('');
    setQ4Selection('');
    setHeroStage('analyzing');

    try {
      const response = await fetch('/api/employees/build-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          stage: 'analyze',
          prompt: promptText,
          language: currentLangObj.code,
          industry: selectedIndustry === 'Other' && customIndustryText.trim() ? customIndustryText.trim() : (selectedIndustry || '')
        })
      });
      const analysis = await response.json();
      if (response.ok && analysis.stage === 'analyze') {
        if (analysis.role) setEmployeeRole(analysis.role);
        setQuickQuestions([
          { step: 1, id: 'business_name', title: 'What is your business name?', subtitle: 'So your test call sounds like your business.', defaultValue: '', type: 'text' },
          { step: 2, id: 'price_range', title: (analysis.questions && analysis.questions[0]) || 'What is your price or budget range?', subtitle: 'So your test call sounds like your business.', defaultValue: '', type: 'text' },
          { step: 3, id: 'categories', title: (analysis.questions && analysis.questions[1]) || (selectedIndustry === 'Car & bike dealership' ? 'What types of cars do you sell?' : 'Which categories or services do you offer?'), subtitle: 'Tick all that apply.', options: (analysis.offerings && analysis.offerings.length) ? [...analysis.offerings, 'Other'] : ['Products', 'Services', 'Appointments', 'Other'], defaultSelected: [], type: 'chips' },
          { step: 4, id: 'next_action', title: (analysis.questions && analysis.questions[2]) || 'What should the customer do next?', subtitle: 'So your test call sounds like your business.', options: (analysis.nextActions && analysis.nextActions.length) ? [...analysis.nextActions, 'Other'] : ['Schedule a visit', 'Store visit', 'Send details on WhatsApp', 'Request a callback', 'Other'], defaultSelected: [], type: 'pills' }
        ]);
      } else {
        setQuickQuestions(previous => previous.map(question => ({
          ...question,
          defaultValue: '',
          defaultSelected: []
        })));
      }
    } catch (err) {
      console.warn('AI analysis skipped, using template defaults:', err.message);
      setQuickQuestions(previous => previous.map(question => ({
        ...question,
        defaultValue: '',
        defaultSelected: []
      })));
    } finally {
      setQuestionIdx(0);
      setHeroStage('quick-details');
    }
  };
  const handleFinishAndGoToStudio = async (targetTab = 'call-script') => {
    if (isBuilding) return;
    const effectiveIndustry = selectedIndustry === 'Other' && customIndustryText.trim()
      ? customIndustryText.trim()
      : selectedIndustry;
    const activeNextActions = [
      ...selectedNextActions.filter(x => x !== 'Other'),
      ...(otherNextActionText.trim() ? [otherNextActionText.trim()] : [])
    ];
    const effectiveNextAction = activeNextActions.length > 0
      ? activeNextActions.join(', ')
      : 'Schedule a site visit for measurement';
    const effectiveObjection = q4Selection === 'Other' && otherActionText ? otherActionText : q4Selection;
    const effectiveCategories = [
      ...selectedDetailsToCollect.filter(detail => detail !== 'Other'),
      ...(selectedDetailsToCollect.includes('Other') && otherCategoryText ? [otherCategoryText] : [])
    ];
    const bizName = businessName.trim();
    const empName = employeeName || pickAutoNameAndVoice(selectedLanguage).name;
    if (bizName.length < 2) {
      setEmployeeBuildError('Enter your business name before generating the employee.');
      setHeroStage('quick-details');
      setQuestionIdx(0);
      return;
    }

    setEmployeeBuildError('');
    setIsBuilding(true);
    try {
      const response = await fetch('/api/employees/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          prompt: promptText,
          language: currentLangObj.code,
          businessName: bizName,
          employeeName: empName,
          role: employeeRole || 'Sales and Customer Service Representative',
          industry: effectiveIndustry || 'General Business',
          offerings: effectiveCategories,
          priceRange,
          nextActions: activeNextActions.length > 0 ? activeNextActions : ['Schedule a site visit for measurement'],
          objectionHandling: effectiveObjection
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate the employee script.');
      if (!Array.isArray(result.call_steps) || result.call_steps.length < 5 || !result.opening_greeting) {
        throw new Error('The AI returned incomplete personalization. No employee was saved.');
      }

      const newEmp = {
        name: result.employee_name || empName,
        role: result.role || employeeRole || 'Sales and Customer Service Representative',
        business: result.business_name || bizName,
        language: currentLangObj.name === 'English' ? 'English (Indian & Global)' : `${currentLangObj.name} + English`,
        voice: selectedVoice || 'P09',
        industry: effectiveIndustry,
        prompt: promptText,
        initialTab: targetTab,
        scriptSteps: result.call_steps,
        call_steps: result.call_steps,
        variables: effectiveCategories,
        opening_greeting: result.opening_greeting,
        primary_language: currentLangObj.code,
        prompt_text: promptText
      };

      const saved = await onSaveEmployee?.(newEmp);
      if (!saved) return;
      if (typeof saved === 'string') newEmp.id = saved;

      if (onBuildEmployee) {
        onBuildEmployee(newEmp, targetTab);
      } else if (onNavigate) {
        onNavigate('employee-studio');
      }
    } catch (error) {
      setEmployeeBuildError(error.message || 'Could not generate the employee script. Please try again.');
      setHeroStage('quick-details');
    } finally {
      setIsBuilding(false);
    }
  };
  const handleFinishAndTestCall = async () => {
    return handleFinishAndGoToStudio('call-script');
  };

  // Primary employee in the authenticated workspace
  const primaryEmployee = employees[0] || null;

  // Safe real metrics values (strictly no fake numbers)
  const metrics = summaryData?.atAGlance || {
    callsHandled: 0,
    customersReached: 0,
    qualified: 0,
    talkTimeFormatted: '0 min',
    avgConversationFormatted: '0s',
    customersServed: 0
  };

  const summary = summaryData?.summary || {
    handledConversations: 0,
    unansweredCalls: 0,
    workAutomatedMin: 0,
    activeEmployeesCount: employees.filter(employee => ['active', 'ready'].includes(employee.status)).length,
    minutesLeft: 0,
    conversationsLeft: 0
  };

  const trends = summaryData?.trends || {
    callsOverTime: [],
    busiestHours: [],
    channels: []
  };

  const filteredCalls = callsList.filter((c) => {
    if (callFilter === 'all') return true;
    return (c.sentiment || '').toLowerCase() === callFilter.toLowerCase();
  });
  const chartSeries = trends.callsOverTime || [];
  const chartMax = Math.max(1, ...chartSeries.map(item => Number(item.count) || 0));
  const chartPoints = chartSeries.map((item, index) => {
    const x = chartSeries.length > 1 ? (index / (chartSeries.length - 1)) * 350 : 175;
    const y = 115 - ((Number(item.count) || 0) / chartMax) * 100;
    return `${x},${y}`;
  });
  const chartLine = chartPoints.length ? `M ${chartPoints.join(' L ')}` : 'M 0,115 L 350,115';
  const chartArea = `${chartLine} L 350,115 L 0,115 Z`;
  const busiestChannel = trends.channels?.[0] || null;
  const dashboardInsights = summaryData?.insights || [];

  if (isMyEmployeesView) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 font-sans text-[#0f0e17]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e4ed]">
          <div>
            <h1 className="text-2xl font-bold font-display text-[#0f0e17]">My AI Employees</h1>
            <p className="text-sm text-[#6c6b7e] mt-0.5">Click any employee to view their call script, adjust rules, and run live test calls.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('new-employee')}
            className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer w-fit"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Employee</span>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd0df] bg-white p-8 text-center">
            <h2 className="text-base font-semibold text-[#0f0e17]">No AI employees yet</h2>
            <p className="mt-1 text-sm text-[#6c6b7e]">Create an employee, review the script, then publish it before assigning it to a campaign.</p>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('new-employee')}
              className="sarvam-btn-primary mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Create employee
            </button>
          </div>
        ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="w-full bg-white rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between space-y-4 text-left relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => {
                    if (onBuildEmployee) onBuildEmployee(emp, 'call-script');
                    else if (onNavigate) onNavigate('employee-studio');
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7a50dc] to-[#a78bfa] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#0f0e17] group-hover:text-[#7a50dc] transition-colors truncate">{emp.name}</h3>
                    <p className="text-xs text-[#6c6b7e] truncate">{emp.industry || 'Sales Specialist'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    emp.status === 'draft'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : emp.status === 'archived'
                        ? 'bg-slate-50 text-slate-600 border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {emp.status === 'draft' ? 'Review draft' : emp.status === 'archived' ? 'Archived' : 'Ready'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmployeeToDelete(emp);
                      setDeleteEmployeeError('');
                    }}
                    title={`Delete ${emp.name}`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0f2f8] flex items-center justify-between text-xs text-[#6c6b7e]">
                <span className="font-mono text-[11px] text-[#7a50dc] font-semibold">{emp.primary_language === 'te' || (emp.language && emp.language.includes('Telugu')) ? 'Telugu + English' : 'Multilingual'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrialCallEmployee(emp);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11.5px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Trial Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBuildEmployee) onBuildEmployee(emp, 'call-script');
                      else if (onNavigate) onNavigate('employee-studio');
                    }}
                    className="text-[#7a50dc] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    Script &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        }

        {/* Delete Confirmation Modal */}
        {employeeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 font-display">Delete AI Employee?</h3>
                  <p className="text-xs text-zinc-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900">{employeeToDelete.name}</strong> ({employeeToDelete.industry || employeeToDelete.role || 'AI Employee'})? This employee, their opening greeting, and all customized call script steps will be permanently deleted.
              </p>
              {deleteEmployeeError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {deleteEmployeeError}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={isDeletingEmployee}
                  onClick={() => { setEmployeeToDelete(null); setDeleteEmployeeError(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingEmployee}
                  onClick={async () => {
                    setIsDeletingEmployee(true);
                    setDeleteEmployeeError('');
                    try {
                      if (onDeleteEmployee) {
                        const ok = await onDeleteEmployee(employeeToDelete.id);
                        if (ok) {
                          setEmployeeToDelete(null);
                        } else {
                          setDeleteEmployeeError('Failed to delete employee. Please try again.');
                        }
                      } else {
                        setDeleteEmployeeError('Delete function unavailable.');
                      }
                    } catch (err) {
                      setDeleteEmployeeError(err.message || 'Failed to delete employee.');
                    } finally {
                      setIsDeletingEmployee(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isDeletingEmployee ? 'Deleting...' : 'Delete Employee'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-7 font-sans text-[#0f0e17]">
      {/* 1. NEXT EMPLOYEE SETUP ACTION */}
      {employees.length > 0 && employees.some(employee => employee.status === 'draft') ? (
      <div className="apple-glass p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(15,14,23,0.03),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl border border-white/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#ea580c] shadow-xs shrink-0">
            {employees.some(employee => employee.status === 'draft')
              ? <FileText className="w-5 h-5 text-[#ea580c]" />
              : <Sparkles className="w-5 h-5 text-[#ea580c]" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0f0e17] font-display">
              {employees.some(employee => employee.status === 'draft') ? 'Review your employee draft' : 'Create your first AI employee'}
            </h4>
            <p className="text-xs text-[#3a3f5c] font-sans">
              {employees.some(employee => employee.status === 'draft')
                ? 'Check the generated script and publish it before using it in a campaign.'
                : 'Build and review an employee before assigning it to a campaign.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate(employees.some(employee => employee.status === 'draft') ? 'my-employees' : 'new-employee')}
          className="sarvam-btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
        >
          {employees.some(employee => employee.status === 'draft') ? 'Review draft' : 'Create employee'}
        </button>
      </div>
      ) : null}

      {dashboardError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <p>{dashboardError}</p>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="rounded-lg border border-red-300 px-3 py-2 font-semibold hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {/* 2. MAIN HERO CARD: OBSIDIAN LUXURY STAGE BUILDER (Matching Outpero Screenshots Exactly) */}
      <div className="apple-glass-stage p-6 sm:p-7 text-white relative overflow-hidden rounded-3xl shadow-xl">
        {/* ========================================================================= */}
        {/* MODE A: IDLE / BRIEF PROMPT TEXTAREA (SCREENSHOT 1) */}
        {/* ========================================================================= */}
        {heroStage === 'idle' && (
          <div>
            {/* Top Header Tag */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#cbd0df] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#cbd0df]" />
                DESCRIBE THE JOB &bull; WE BUILD THE EMPLOYEE
              </span>
              <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/15 px-2.5 py-0.5 rounded-full border border-[#16a34a]/30 font-mono">
                BUILD &amp; TEST
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight mb-1 text-white font-display">
              Build your AI employee
            </h2>
            <p className="text-xs text-white/70 mb-5 font-sans">
              Describe the job in a few sentences. You only pay for the calls they make.
            </p>

            {/* Mode Selector & Languages Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-white/10">
              {/* Modes */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode('instant')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedMode === 'instant'
                      ? 'bg-[#0f0e17] text-white border border-amber-400/50 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 border border-transparent'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Instant Lead Calling
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('bulk')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedMode === 'bulk'
                      ? 'bg-[#0f0e17] text-white border border-amber-400/50 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 border border-transparent'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Bulk Calling
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('inbound')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedMode === 'inbound'
                      ? 'bg-[#0f0e17] text-white border border-amber-400/50 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 border border-transparent'
                  }`}
                >
                  <PhoneIncoming className="w-3.5 h-3.5" />
                  Inbound Calling
                </button>
              </div>

              {/* Languages Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-white/60 uppercase mr-1 tracking-wider font-semibold">
                  PRIMARY :
                </span>
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.name;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/30 scale-105 ring-2 ring-white/80'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      title={`Select ${lang.name} as primary language`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Bilingual Banner */}
            <div className="mb-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Your employee talks in{' '}
                  <strong className="text-white underline decoration-amber-400 decoration-2">
                    {currentLangObj.name === 'English' ? 'English (Indian & Global English)' : `${currentLangObj.name} + English`}
                  </strong>
                  {currentLangObj.name !== 'English' && (
                    <span className="text-white/70 ml-1.5">
                      &mdash; English is mandated and automatically supported for natural code-switching.
                    </span>
                  )}
                </span>
              </div>

              <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md hidden sm:inline-block">
                {currentLangObj.code.toUpperCase()} + EN
              </span>
            </div>

            {/* Prompt Input Box */}
            <div className="relative mb-4">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. balaji digital express mobile shop in vijayawada"
                className="w-full bg-[#181335]/90 border border-white/15 rounded-xl p-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#a78bfa] transition-all resize-none font-normal leading-relaxed shadow-inner"
              />

              {/* Active Listening Indicator */}
              {speech.isListening && (
                <div className="mt-2 py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-between text-xs text-red-200 animate-pulse">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    Listening in <strong>{currentLangObj.name}</strong>... speak into your microphone
                  </span>
                  <button
                    type="button"
                    onClick={() => speech.stopListening()}
                    className="font-bold underline text-red-300 hover:text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Microphone Error Banner */}
              {speech.error && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
                  <span>{speech.error}</span>
                  <button
                    type="button"
                    onClick={() => speech.clearError()}
                    className="ml-2 font-bold hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Industry Chips & Build Action */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    speech.toggleListening({
                      initialText: promptText,
                      language: currentLangObj.langCode,
                      onTranscript: (updated) => setPromptText(updated)
                    });
                  }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                    speech.isListening
                      ? 'bg-red-500 text-white border border-red-400 shadow-md shadow-red-500/30 animate-pulse font-bold'
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                  title={speech.isListening ? 'Click to stop listening' : `Dictate prompt in ${currentLangObj.name}`}
                >
                  {speech.isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-amber-300" />}
                  {speech.isListening && <span>Listening...</span>}
                </button>

                {industries.map((ind, i) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.label;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectIndustry(ind)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f0e17] text-white border border-amber-400/40 shadow-xs font-bold'
                          : 'bg-white/10 text-white/80 hover:bg-white/15 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#cbd0df]" />
                      {ind.label}
                    </button>
                  );
                })}
              </div>

              {selectedIndustry === 'Other' && (
                <div className="w-full mt-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2.5 border border-amber-400/50">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0 ml-1" />
                    <input
                      type="text"
                      autoFocus
                      value={customIndustryText}
                      onChange={(e) => setCustomIndustryText(e.target.value)}
                      placeholder="Type your industry or business: e.g. Jewellery, Salon & Spa, Solar, CA & Tax, Gym..."
                      className="flex-1 bg-transparent text-white placeholder-white/40 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {employeeBuildError && (
                <div role="alert" className="w-full rounded-xl border border-red-300/40 bg-red-500/15 p-3 text-sm text-red-100">
                  {employeeBuildError}
                </div>
              )}
              <button
                type="button"
                onClick={handleBuild}
                disabled={!promptText.trim() || isBuilding}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-98 ${
                  promptText.trim() && !isBuilding
                    ? 'sarvam-btn-primary shadow-lg shadow-[#D99A2B]/20'
                    : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {isBuilding ? 'Drafting flow...' : 'Build my employee'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE B: READING YOUR BRIEF SPINNER (STAGE 1) */}
        {/* ========================================================================= */}
        {heroStage === 'analyzing' && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#a78bfa] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                BUILD YOUR AI EMPLOYEE
              </span>
              <button
                type="button"
                onClick={() => setHeroStage('idle')}
                className="text-[11.5px] text-[#a78bfa] hover:text-white transition-colors cursor-pointer"
              >
                Edit brief
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[340px]">
              {/* Left Column: Progress Stepper */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
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
                    <span>Preparing employee setup...</span>
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
                    <span>Reusable call flow</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-white/40">
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                    <span>Choosing a voice</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Spinner Notice */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-[#a78bfa]/20 border-t-[#D99A2B] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-[22px] font-bold text-white tracking-tight font-display">
                    Preparing employee setup...
                  </h3>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    The call flow stays fixed; AI personalization runs after you confirm the details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE C: QUICK DETAILS WIZARD (SCREENSHOTS 2, 3, 4, 5) */}
        {/* ========================================================================= */}
        {heroStage === 'quick-details' && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#a78bfa] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                BUILD YOUR AI EMPLOYEE
              </span>
              <button
                type="button"
                onClick={() => setHeroStage('idle')}
                className="text-[11.5px] text-[#a78bfa] hover:text-white transition-colors cursor-pointer"
              >
                Edit brief
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Progress Stepper Sub-Card */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
                <div>
                  <div className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    BUILDING YOUR EMPLOYEE
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] rounded-full transition-all duration-300"
                      style={{ width: `${((questionIdx + 1) / 5) * 100}%` }}
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

                {/* Mini Employee Badge */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-white truncate">{employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')}</div>
                    <div className="text-[10.5px] text-white/60 truncate">{businessName || 'My Business'}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Questions 1 to 5 */}
              <div className="lg:col-span-8 space-y-6">
                {employeeBuildError && (
                  <div role="alert" className="rounded-xl border border-red-300/40 bg-red-500/15 p-3 text-sm text-red-100">
                    {employeeBuildError}
                  </div>
                )}
                {isBuilding && (
                  <div role="status" className="text-sm text-amber-200">
                    Generating short AI personalization and assembling the fixed call flow…
                  </div>
                )}
                {/* Segmented Bar Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/80 font-bold">
                      A FEW QUICK DETAILS · {questionIdx + 1} OF 4
                    </span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === questionIdx
                              ? 'w-7 bg-[#E5A93C]'
                              : idx < questionIdx
                              ? 'w-3.5 bg-[#E5A93C]/70'
                              : 'w-3.5 bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHeroStage('idle')}
                    className="text-[11.5px] text-[#a78bfa] hover:text-white transition-colors cursor-pointer"
                  >
                    Edit brief
                  </button>
                </div>

                {/* QUESTION 1 OF 5: BUSINESS NAME FIRST */}
                {questionIdx === 0 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                      {quickQuestions[0]?.title || 'What is your business name?'}
                    </h3>
                    <p className="text-[13px] text-white/60">
                      {quickQuestions[0]?.subtitle || 'So your test call sounds like your business.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder={quickQuestions[0]?.defaultValue || 'e.g. DesignCraft Luxury Interiors, Sanjeevani Clinic, Sai Meadows'}
                        className="flex-1 p-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[14.5px] focus:outline-none focus:border-[#a78bfa]"
                      />
                      <button
                        type="button"
                        onClick={handleHeroNextQuestion}
                        className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* QUESTION 2 OF 5: PRICE / BUDGET RANGE */}
                {questionIdx === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                      {quickQuestions[1]?.title || 'What is your price or budget range?'}
                    </h3>
                    <p className="text-[13px] text-white/60">
                      {quickQuestions[1]?.subtitle || 'So your test call sounds like your business.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        placeholder={quickQuestions[1]?.defaultValue || 'e.g. 5000 to 500000'}
                        className="flex-1 p-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-[14.5px] focus:outline-none focus:border-[#a78bfa]"
                      />
                      <button
                        type="button"
                        onClick={handleHeroNextQuestion}
                        className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* QUESTION 3 OF 4: CATEGORIES / TYPES (TICK ALL THAT APPLY) */}
                {questionIdx === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                        {quickQuestions[2]?.title || (selectedIndustry === 'Car & bike dealership' ? 'What types of cars do you sell?' : 'Which categories or services do you offer?')}
                      </h3>
                      <p className="text-[13px] text-white/60 mt-1">
                        {quickQuestions[2]?.subtitle || 'Tick all that apply.'}
                      </p>
                    </div>

                    {/* Rounded Checkbox Pills matching Outpero screenshot */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {(quickQuestions[2]?.options || ['New cars', 'Used cars', 'Electric cars', 'Luxury cars', 'Commercial vehicles', 'Other']).map((item) => {
                        const isSelected = selectedDetailsToCollect.includes(item);
                        return (
                          <div
                            key={item}
                            onClick={() => toggleDetail(item)}
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
                            <span className="text-[13px] font-medium">{item}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dedicated input when Q3 'Other' is checked */}
                    {selectedDetailsToCollect.includes('Other') && (
                      <div className="pt-2 animate-in fade-in duration-150">
                        <label className="block text-[12px] font-medium text-amber-300 mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Specify other option:</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={otherCategoryText}
                          onChange={(e) => setOtherCategoryText(e.target.value)}
                          placeholder="e.g. Vintage classics, Fleet vans, Custom builds..."
                          className="w-full p-3.5 rounded-xl bg-white/5 border border-amber-400/50 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* QUESTION 4 OF 4: NEXT ACTION */}
                {questionIdx === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                        {quickQuestions[3]?.title || 'What should the customer do next?'}
                      </h3>
                      <p className="text-[13px] text-white/60 mt-1">
                        {quickQuestions[3]?.subtitle || 'So your test call sounds like your business.'}
                      </p>
                    </div>

                    {/* Multi-select Pills */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {DEFAULT_DASHBOARD_NEXT_ACTIONS.map((opt) => {
                        const isSelected = selectedNextActions.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedNextActions(prev => {
                                if (prev.includes(opt)) {
                                  return prev.filter(x => x !== opt);
                                } else {
                                  return [...prev, opt];
                                }
                              });
                            }}
                            className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer flex items-center gap-2 select-none ${
                              isSelected
                                ? 'bg-[#D99A2B]/20 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-bold'
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
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ALWAYS OPEN: Other input tab */}
                    <div className="pt-2 animate-in fade-in duration-150">
                      <label className="block text-[12px] font-medium text-amber-300 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Other / Custom Next Action (always open):</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={otherNextActionText}
                          onChange={(e) => {
                            setOtherNextActionText(e.target.value);
                            if (e.target.value && !selectedNextActions.includes('Other')) {
                              setSelectedNextActions(prev => [...prev, 'Other']);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleHeroNextQuestion();
                            }
                          }}
                          placeholder="Type custom next step or special instruction..."
                          className="flex-1 p-3.5 rounded-xl bg-white/5 border border-amber-400/50 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                        />
                        {otherNextActionText && (
                          <button
                            type="button"
                            onClick={() => setOtherNextActionText('')}
                            className="p-2 text-white/50 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    {questionIdx > 0 && (
                      <button
                        type="button"
                        onClick={handleHeroPrevQuestion}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBuilding}
                      onClick={() => {
                        if (questionIdx === 3) {
                          handleFinishAndGoToStudio('call-script');
                        } else {
                          handleHeroNextQuestion();
                        }
                      }}
                      className="text-white/60 hover:text-white transition-colors cursor-pointer text-[13px] font-medium disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleFinishAndGoToStudio('call-script')}
                      className="text-amber-300/80 hover:text-amber-300 transition-colors cursor-pointer text-[13px] font-semibold"
                    >
                      Skip all and build
                    </button>

                    <button
                      type="button"
                      disabled={isBuilding}
                      onClick={handleHeroNextQuestion}
                      className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{questionIdx === 3 ? (isBuilding ? 'Building employee…' : 'Build AI Employee') : 'Next'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE D: PLANNING THE CALL, STEP BY STEP */}
        {/* ========================================================================= */}
        {heroStage === 'planning' && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#a78bfa] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                REVIEW THE REUSABLE CALL FLOW &bull; STAGE 3 OF 4
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                STATIC FLOW PREVIEW
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Progress Stepper */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
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

                {/* Mini Employee Badge */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-white truncate">{employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')}</div>
                    <div className="text-[10.5px] text-white/60 truncate">{businessName || 'My Business'}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Drafted Call Steps */}
              <div className="lg:col-span-8 space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                    Call flow drafted for {employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')}
                  </h3>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    Based on your details ({q2Selection === 'Other' && otherNextActionText ? otherNextActionText : q2Selection}, {priceRange}), here is how {employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')} will guide conversations:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      num: 1,
                      title: `1. Introduce & Offer (${businessName || 'business'})`,
                      desc: `Greet warmly and confirm lead enquiry. State role as ${employeeRole || 'Sales Specialist'}.`
                    },
                    {
                      num: 2,
                      title: `2. Qualify details & budget`,
                      desc: `Inquire interest and collect: ${[...selectedDetailsToCollect.filter(d => d !== 'Other'), ...(selectedDetailsToCollect.includes('Other') && otherCategoryText ? [otherCategoryText] : [])].join(', ') || 'customer details'}.`
                    },
                    {
                      num: 3,
                      title: `3. Handle objection: "${(q4Selection === 'Other' && otherActionText) ? otherActionText : (q4Selection || 'Explain value')}"`,
                      desc: (q4Selection === 'Other' && otherActionText)
                        ? `Address customer pricing concerns with: ${otherActionText}.`
                        : q4Selection && q4Selection.toLowerCase().includes('emi')
                        ? 'Overcome price concerns with flexible EMI options and transparent value.'
                        : `Address customer pricing concerns with: ${q4Selection || 'transparent value and quality assurance'}.`
                    },
                    {
                      num: 4,
                      title: `4. Close with: "${(q2Selection === 'Other' && otherNextActionText) ? otherNextActionText : (q2Selection || 'Place an order')}"`,
                      desc: `Confirm next step and immediately deliver WhatsApp catalog or order confirmation.`
                    }
                  ].map((s) => (
                    <div
                      key={s.num}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#7a50dc]/30 border border-[#a78bfa]/40 text-[#a78bfa] text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {s.num}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-white">{s.title}</div>
                        <div className="text-[11.5px] text-white/60 mt-0.5 leading-relaxed">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroStage('quick-details');
                      setQuestionIdx(3);
                    }}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleFinishAndGoToStudio('call-script')}
                      className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium text-[13px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#a78bfa]" />
                      <span>Edit Script</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinishAndGoToStudio('call-script')}
                      className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-[13px] px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Build AI Employee &amp; Open Call Script ({employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')})</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE E: CHOOSING A VOICE (FINAL STAGE) */}
        {/* ========================================================================= */}
        {heroStage === 'voice' && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                CHOOSING A VOICE &bull; FINAL STEP
              </span>
              <span className="text-[11px] text-amber-300 font-mono">
                {currentLangObj.name} + English
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Progress Stepper */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
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

                {/* Mini Employee Badge */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-white truncate">{employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')}</div>
                    <div className="text-[10.5px] text-white/60 truncate">{businessName || 'My Business'}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Voice Selection Cards */}
              <div className="lg:col-span-8 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-white font-display">
                    Choose a voice for {employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')}
                  </h3>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    Pick how {employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')} speaks on phone calls with callers. You can test and refine anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    {
                      id: 'P09',
                      name: 'P09 Great Telugu',
                      accent: `${currentLangObj.name} & English (Native Indian)`,
                      engine: 'Cartesia Sonic-2 / Bulbul V4',
                      latency: '412ms',
                      recommended: true
                    },
                    {
                      id: 'arvind',
                      name: 'Arvind',
                      accent: 'Indian English & Multilingual',
                      engine: 'Ultra-low latency',
                      latency: '430ms'
                    },
                    {
                      id: 'pooja',
                      name: 'Pooja',
                      accent: 'Warm & Friendly Hindi/English',
                      engine: 'Expressive Neural Voice',
                      latency: '445ms'
                    },
                    {
                      id: 'kavya',
                      name: 'Kavya',
                      accent: 'Conversational Sales Specialist',
                      engine: 'Fast Paced Response',
                      latency: '420ms'
                    }
                  ].map((v) => {
                    const isSelected = selectedVoice === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#7a50dc]/30 border-amber-400/90 ring-1 ring-amber-400/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-bold text-white">{v.name}</span>
                              {v.recommended && (
                                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/60 mt-0.5">{v.accent}</div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                              isSelected ? 'bg-amber-400 border-amber-300 text-[#130e26]' : 'border-white/30'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10 text-[10.5px] text-white/50 font-mono">
                          <span>{v.engine}</span>
                          <span className="text-emerald-400">{v.latency}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setHeroStage('planning')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[13px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishAndTestCall}
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
        )}
      </div>

            {/* 2. REAL METRICS STRIP (CLEAN & MINIMAL) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e2e4ed] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6c6b7e]">
            <span className="text-xs font-medium">Calls Handled</span>
            <Phone className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-[#0f0e17]">
            {metrics.callsHandled}
          </div>
          <div className="text-[11px] text-[#6c6b7e]">
            Real completed conversations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e4ed] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6c6b7e]">
            <span className="text-xs font-medium">Active AI Employees</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-display text-[#7a50dc]">
            {employees.filter(e => ['active', 'ready'].includes(e.status)).length || employees.length}
          </div>
          <div className="text-[11px] text-[#6c6b7e]">
            Trained and on duty
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e4ed] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#6c6b7e]">
            <span className="text-xs font-medium">Total Talk Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-[#0f0e17]">
            {metrics.talkTimeFormatted || '0 min'}
          </div>
          <div className="text-[11px] text-[#6c6b7e]">
            Customer call duration
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e4ed] shadow-xs space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6c6b7e]">
              <span className="text-xs font-medium">Calling Balance</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-display text-[#0f0e17] mt-1.5">
              ₹{Number(stats?.balanceCredits ?? 0).toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('billing')}
            className="text-xs font-bold text-[#7a50dc] hover:text-[#5b32ba] flex items-center gap-1 cursor-pointer w-fit pt-1"
          >
            + Add credits &rarr;
          </button>
        </div>
      </div>

      {/* 3. MY AI EMPLOYEES (FOCUSED & CLEAN) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e2e4ed]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-display text-[#0f0e17]">My AI Employees</h2>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7a50dc] border border-[#d9c7fa]">
              {employees.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('new-employee')}
            className="bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] hover:from-[#c88d25] hover:to-[#e5ae40] text-[#130e26] font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer w-fit"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Employee</span>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd0df] bg-white p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7a50dc] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0f0e17]">No AI employees created yet</h3>
              <p className="mt-1 text-xs text-[#6c6b7e]">Use the builder above or click below to launch your first voice telecaller.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('new-employee')}
              className="sarvam-btn-primary rounded-xl px-4 py-2 text-xs font-semibold"
            >
              Build an Employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="w-full bg-white rounded-2xl border border-[#e2e4ed] hover:border-[#7a50dc] p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between space-y-4 text-left relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => {
                      if (onBuildEmployee) onBuildEmployee(emp, 'call-script');
                      else if (onNavigate) onNavigate('employee-studio');
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7a50dc] to-[#a78bfa] text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#0f0e17] group-hover:text-[#7a50dc] transition-colors truncate">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-[#6c6b7e] truncate">{emp.industry || 'Sales Specialist'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      emp.status === 'draft'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : emp.status === 'archived'
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {emp.status === 'draft' ? 'Draft' : emp.status === 'archived' ? 'Archived' : 'Ready'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmployeeToDelete(emp);
                        setDeleteEmployeeError('');
                      }}
                      title={`Delete ${emp.name}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f0f2f8] flex items-center justify-between text-xs text-[#6c6b7e]">
                  <span className="font-mono text-[11px] text-[#7a50dc] font-semibold">
                    {emp.primary_language === 'te' || (emp.language && emp.language.includes('Telugu')) ? 'Telugu + English' : 'Multilingual'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrialCallEmployee(emp);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11.5px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Trial Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onBuildEmployee) onBuildEmployee(emp, 'call-script');
                        else if (onNavigate) onNavigate('employee-studio');
                      }}
                      className="text-[#7a50dc] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      Script &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Available directly on Dashboard) */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Delete AI Employee?</h3>
                <p className="text-xs text-zinc-500">This action permanently deletes this employee.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-zinc-900">{employeeToDelete.name}</strong>?
              All associated call scripts, voice configurations, and prompt rules will be permanently removed.
            </p>

            {deleteEmployeeError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                {deleteEmployeeError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setEmployeeToDelete(null);
                  setDeleteEmployeeError('');
                }}
                disabled={isDeletingEmployee}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingEmployee}
                onClick={async () => {
                  setIsDeletingEmployee(true);
                  setDeleteEmployeeError('');
                  try {
                    if (onDeleteEmployee) {
                      const ok = await onDeleteEmployee(employeeToDelete.id);
                      if (ok) {
                        setEmployeeToDelete(null);
                      } else {
                        setDeleteEmployeeError('Failed to delete employee. Please try again.');
                      }
                    } else {
                      setDeleteEmployeeError('Delete function unavailable.');
                    }
                  } catch (err) {
                    setDeleteEmployeeError(err.message || 'Failed to delete employee.');
                  } finally {
                    setIsDeletingEmployee(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeletingEmployee ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
