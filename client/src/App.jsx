import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import WelcomeCreditsModal from './components/WelcomeCreditsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { lazyRetry } from './lib/lazyRetry';
import { apiFetch, getAuthHeaders } from './utils/api';

const protectedTabs = new Set([
  'owner-admin', 'dashboard', 'my-employees', 'employee-studio', 'new-employee',
  'talk-to-employee', 'instant-leads', 'bulk-campaigns', 'inbound-desk',
  'leads-results', 'all-conversations', 'train-employees', 'phone-numbers',
  'performance', 'billing', 'settings', 'developers'
]);

// Eagerly imported all views for instant 0ms tab switching and zero 'Loading module...' delay
import LandingPageView from './views/LandingPageView';
import DashboardView from './views/DashboardView';
import NewEmployeeView from './views/NewEmployeeView';
import TalkToEmployeeView from './views/TalkToEmployeeView';
import InstantLeadsView from './views/InstantLeadsView';
import BulkCampaignsView from './views/BulkCampaignsView';
import InboundDeskView from './views/InboundDeskView';
import LeadsResultsView from './views/LeadsResultsView';
import AllConversationsView from './views/AllConversationsView';
import TrainEmployeesView from './views/TrainEmployeesView';
import PhoneNumbersView from './views/PhoneNumbersView';
import PerformanceView from './views/PerformanceView';
import BillingView from './views/BillingView';
import SettingsView from './views/SettingsView';
import DevelopersView from './views/DevelopersView';
import OwnerAdminView from './views/OwnerAdminView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsAndConditionsView from './views/TermsAndConditionsView';
import RefundPolicyView from './views/RefundPolicyView';
import ShippingPolicyView from './views/ShippingPolicyView';
import ContactView from './views/ContactView';
import NotFoundView from './views/NotFoundView';


const CANONICAL_TABS = {
  // Public & Compliance
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'privacy_policy': 'privacy',
  'terms': 'terms',
  'terms-and-conditions': 'terms',
  'terms-of-service': 'terms',
  'tos': 'terms',
  'refund': 'refunds',
  'refunds': 'refunds',
  'refund-policy': 'refunds',
  'cancellation-and-refund-policy': 'refunds',
  'shipping': 'shipping',
  'shipping-policy': 'shipping',
  'shipping-and-delivery': 'shipping',
  'delivery-policy': 'shipping',
  'contact': 'contact',
  'contact-us': 'contact',
  'support': 'contact',
  'help': 'contact',
  'docs': 'developers',
  'documentation': 'developers',

  // Landing & In-Page Sections
  'landing': 'landing',
  'home': 'dashboard',
  'pricing': 'landing',
  'features': 'landing',
  'hear': 'landing',
  'how-it-works': 'landing',
  'demo': 'landing',

  // Application Views
  'dashboard': 'dashboard',
  'app': 'dashboard',
  'ai-employee': 'my-employees',
  'ai-employees': 'my-employees',
  'employee': 'my-employees',
  'employees': 'my-employees',
  'my-employees': 'my-employees',
  'new-employee': 'new-employee',
  'employee-studio': 'employee-studio',
  'talk-to-employee': 'talk-to-employee',
  'instant-leads': 'instant-leads',
  'lead': 'leads-results',
  'leads': 'leads-results',
  'leads-results': 'leads-results',
  'campaign': 'bulk-campaigns',
  'campaigns': 'bulk-campaigns',
  'bulk-campaigns': 'bulk-campaigns',
  'inbound-desk': 'inbound-desk',
  'inbound': 'inbound-desk',
  'call': 'all-conversations',
  'calls': 'all-conversations',
  'conversations': 'all-conversations',
  'history': 'all-conversations',
  'all-conversations': 'all-conversations',
  'train-employees': 'train-employees',
  'train': 'train-employees',
  'training': 'train-employees',
  'phone-numbers': 'phone-numbers',
  'phone': 'phone-numbers',
  'numbers': 'phone-numbers',
  'performance': 'performance',
  'analytics': 'performance',
  'stats': 'performance',
  'billing': 'billing',
  'credits': 'billing',
  'wallet': 'billing',
  'topup': 'billing',
  'recharge': 'billing',
  'settings': 'settings',
  'profile': 'settings',
  'account': 'settings',
  'developers': 'developers',
  'api': 'developers',
  'owner-admin': 'owner-admin',
  'admin': 'owner-admin',
  'owner': 'owner-admin'
};

const resolveCanonicalTab = (tab) => {
  if (!tab) return 'landing';
  const clean = String(tab).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token') || localStorage.getItem('token'));
  return CANONICAL_TABS[clean] || (hasToken ? 'dashboard' : 'landing');
};

const getInitialSession = () => {
  if (typeof window === 'undefined') return { tab: 'landing', user: null, ready: false };
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  let user = null;
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) user = JSON.parse(rawUser);
    if (!user && token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(decodeURIComponent(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
        if (payload && payload.email) {
          user = {
            id: payload.id,
            email: payload.email,
            name: payload.email.split('@')[0],
            role: payload.role || 'client',
            tenant_id: payload.tenant_id || 'default'
          };
        }
      }
    }
  } catch {}

  const p = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const h = window.location.hash.replace(/^#\/?/, '');
  const target = p || h;

  if (target) {
    return { tab: resolveCanonicalTab(target), user, ready: true };
  }

  if (token && user) {
    return { tab: 'dashboard', user, ready: true };
  }

  return { tab: 'landing', user: null, ready: true };
};

export default function App() {
  const [sessionInit] = useState(getInitialSession);
  const [activeTab, setActiveTab] = useState(sessionInit.tab);

  // PushState URL synchronizer to ensure page refresh and browser back/forward buttons work seamlessly
  const navigateTo = (rawTab, updateHistory = true) => {
    const tab = resolveCanonicalTab(rawTab);
    setActiveTab(tab);
    if (updateHistory && typeof window !== 'undefined' && window.history?.pushState) {
      const targetUrl = tab === 'landing' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ tab }, '', targetUrl);
      }
    }
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeCreditsModalOpen, setIsWelcomeCreditsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(sessionInit.user);
  const [authReady, setAuthReady] = useState(sessionInit.ready);
  const [sessionError, setSessionError] = useState('');
  const [pendingTab, setPendingTab] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [workflowNotice, setWorkflowNotice] = useState('');

  const [stats, setStats] = useState({
    activeCalls: 0,
    callsPerMin: '0.0',
    talkingCount: 0,
    ringingCount: 0,
    balanceCredits: 0,
    balanceMinutes: '0.0',
    activeEmployees: 0,
    totalLeads: 0
  });
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for smooth auth expiration without violent page refresh
  useEffect(() => {
    const handleAuthExpired = () => {
      setSessionError('Please sign in to continue.');
      setIsAuthModalOpen(true);
    };
    window.addEventListener('sarvam:auth_expired', handleAuthExpired);
    return () => window.removeEventListener('sarvam:auth_expired', handleAuthExpired);
  }, []);

  // Resolve the stored session before rendering any protected workflow.
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      setAuthReady(true);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.user) {
          setCurrentUser(data.user);
          setSessionError('');
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('token', data.token);
          }
          return;
        }
        if (response.status === 401) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              if (payload.exp && Date.now() < payload.exp * 1000) {
                console.warn('[Auth Verify] Server rejected with 401 but client token exp is still valid. Preserving session.');
                return;
              }
            }
          } catch {}
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('user_role');
          setCurrentUser(null);
          setSessionError('Your session expired. Please sign in again.');
        }
      })
      .catch(error => {
        console.warn('[Auth Verify Network Notice]', error.message);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const refreshStats = () => {
    if (!localStorage.getItem('auth_token')) return;
    apiFetch('/api/stats')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Unable to load workspace stats')))
      .then((data) => setStats(data))
      .catch((err) => {
        console.error('Failed to load stats:', err);
        setWorkflowNotice(err.message || 'Workspace stats could not be loaded. Please retry.');
      });
  };

  const refreshEmployees = () => {
    apiFetch('/api/employees')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Unable to load employees')))
      .then((data) => {
        const employeeList = Array.isArray(data) ? data : [];
        const publishedEmployees = employeeList.filter(employee => ['active', 'ready'].includes(employee.status));
        setEmployees(employeeList);
        setStats(prev => ({ ...prev, activeEmployees: publishedEmployees.length }));
        setSelectedEmployee(previous => {
          const retained = previous && employeeList.find(employee => employee.id === previous.id && employee.status !== 'archived');
          return retained || publishedEmployees[0] || employeeList.find(employee => employee.status === 'draft') || null;
        });
      })
      .catch((err) => {
        console.error('Failed to load employees:', err);
        setWorkflowNotice(err.message || 'Employees could not be loaded. Please retry.');
      });
  };

  const refreshCampaigns = () => {
    apiFetch('/api/campaigns')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Unable to load campaigns')))
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load campaigns:', err);
        setWorkflowNotice(err.message || 'Campaigns could not be loaded. Please retry.');
      });
  };

  const refreshLeads = () => {
    apiFetch('/api/leads')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Unable to load leads')))
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(error => {
        setLeads([]);
        setWorkflowNotice(error.message || 'Unable to load leads. Please retry.');
      });
  };

  useEffect(() => {
    // URL, In-Page Anchors, and Secret Route Check: e.g. /privacy, /terms, #hear, #pricing
    const checkRoutes = () => {
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);

      // URL query check for Razorpay Payment Link redirection
      if (searchParams.get('payment_link') || searchParams.get('order_id')) {
        setActiveTab('billing');
        return;
      }

      // Auth routes: /login, /signin, /sign-in, /auth
      const authRoutes = ['login', 'signin', 'sign-in', 'auth'];
      if (authRoutes.includes(path) || authRoutes.includes(hash)) {
        setActiveTab('landing');
        setIsAuthModalOpen(true);
        return;
      }

      const inPageSections = ['hear', 'pricing', 'channels', 'brief', 'features', 'how-it-works'];

      // Root path '/' or 'index.html'
      if (!path || path === 'index.html') {
        if (!hash || inPageSections.includes(hash)) {
          setActiveTab('landing');
          if (hash) {
            setTimeout(() => {
              const el = document.getElementById(hash);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 60);
          }
          return;
        }

        const tab = resolveCanonicalTab(hash);
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (protectedTabs.has(tab) && !token) {
          setPendingTab(tab);
          setActiveTab('landing');
          setIsAuthModalOpen(true);
        } else {
          setActiveTab(tab);
        }
        return;
      }

      const tab = resolveCanonicalTab(path);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (protectedTabs.has(tab) && !token) {
        setPendingTab(tab);
        setActiveTab('landing');
        setIsAuthModalOpen(true);
      } else {
        setActiveTab(tab);
      }
    };

    checkRoutes();
    window.addEventListener('popstate', checkRoutes);
    window.addEventListener('hashchange', checkRoutes);

    return () => {
      window.removeEventListener('popstate', checkRoutes);
      window.removeEventListener('hashchange', checkRoutes);
    };
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) return;
    refreshStats();
    refreshEmployees();
    refreshCampaigns();
    if (activeTab === 'leads-results') refreshLeads();
  }, [authReady, currentUser, activeTab]);

  useEffect(() => {
    if (!authReady) return;
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (protectedTabs.has(activeTab) && !token && !currentUser) {
      setPendingTab(activeTab);
      setActiveTab('landing');
      setIsAuthModalOpen(true);
    }
  }, [activeTab, authReady, currentUser]);

  // Handlers
  const handleCreateCampaign = async (newCmp) => {
    if (!currentUser) {
      setWorkflowNotice('Sign in before creating a campaign.');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const res = await apiFetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newCmp)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Campaign could not be created');
      refreshCampaigns();
      refreshLeads();
      refreshStats();
      setWorkflowNotice(`Campaign draft created with ${data.leadsCreated || 0} valid contacts. Calling has not started.`);
      return true;
    } catch (err) {
      setWorkflowNotice(err.message || 'Failed to create campaign.');
      return false;
    }
  };

  const handleSaveEmployee = async (empData) => {
    if (!currentUser) {
      setWorkflowNotice('Sign in before saving an AI employee.');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const res = await apiFetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(empData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Employee could not be saved');
      refreshEmployees();
      refreshStats();
      setWorkflowNotice(empData.status === 'draft'
        ? 'Employee draft saved. Review and publish it before campaign use.'
        : 'Employee published successfully.');
      if (empData?.redirectTo) setActiveTab(empData.redirectTo);
      return data.id;
    } catch (err) {
      setWorkflowNotice(err.message || 'Failed to save employee.');
      return false;
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!currentUser) {
      setWorkflowNotice('Sign in before deleting an AI employee.');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const res = await apiFetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete employee');
      refreshEmployees();
      refreshStats();
      setWorkflowNotice('Employee deleted successfully.');
      return true;
    } catch (err) {
      setWorkflowNotice(err.message || 'Failed to delete employee.');
      return false;
    }
  };

  const handleImpersonateTenant = (tenant) => {
    alert(`Switched workspace to: ${tenant.name} (${tenant.id})`);
    setActiveTab('dashboard');
    refreshStats();
    refreshEmployees();
  };

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    const q = query.toLowerCase().trim();
    if (!q) return;

    if (q.includes('bill') || q.includes('credit') || q.includes('recharge') || q.includes('price')) {
      navigateTo('billing');
    } else if (q.includes('number') || q.includes('phone') || q.includes('virtual') || q.includes('140')) {
      setActiveTab('phone-numbers');
    } else if (q.includes('train') || q.includes('faq') || q.includes('knowledge') || q.includes('rag')) {
      setActiveTab('train-employees');
    } else if (q.includes('lead') || q.includes('crm') || q.includes('contact')) {
      setActiveTab('leads-results');
    } else if (q.includes('call') || q.includes('record') || q.includes('transcript')) {
      setActiveTab('all-conversations');
    } else if (q.includes('stat') || q.includes('metric') || q.includes('perf') || q.includes('funnel')) {
      setActiveTab('performance');
    } else if (q.includes('api') || q.includes('dev') || q.includes('webhook') || q.includes('postman')) {
      setActiveTab('developers');
    } else if (q.includes('dnd') || q.includes('setting') || q.includes('trai') || q.includes('pacing')) {
      setActiveTab('settings');
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setSessionError('');
    setAuthReady(true);
    setIsAuthModalOpen(false);
    setIsWelcomeCreditsModalOpen(false);
    setActiveTab(pendingTab || 'dashboard');
    setPendingTab(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleStartFirstCall = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    setIsWelcomeCreditsModalOpen(false);
    setActiveTab('talk-to-employee');
  };

  const handleLookAround = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    setIsWelcomeCreditsModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleDismissBonus = () => {
    localStorage.setItem('sarvam_welcome_credits_claimed', 'true');
    setIsWelcomeCreditsModalOpen(false);
    setActiveTab('dashboard');
  };

  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white text-zinc-950">
        {sessionError && (
          <div role="alert" className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">{sessionError}</p>
            <p className="mt-1 text-xs">Your saved session has not been deleted. Retry after the account service is available, or sign in again.</p>
            <div className="mt-3 flex gap-4">
              <button type="button" className="font-semibold underline" onClick={() => window.location.reload()}>Retry</button>
              <button type="button" className="font-semibold underline" onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_role'); setSessionError(''); setIsAuthModalOpen(true); }}>Sign in again</button>
            </div>
          </div>
        )}
        <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
          <LandingPageView
            onLaunchConsole={(promptText) => {
              if (promptText) setPendingPrompt(promptText);
              const token = localStorage.getItem('auth_token');
              if (!token || !currentUser) {
                setPendingTab('new-employee');
                setIsAuthModalOpen(true);
              } else {
                setActiveTab('new-employee');
              }
            }}
            onTalkToAgent={() => {
              setPendingTab('talk-to-employee');
              if (!currentUser) setIsAuthModalOpen(true);
              else setActiveTab('talk-to-employee');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigate={(tab) => navigateTo(tab)}
          />
        </ErrorBoundary>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <WelcomeCreditsModal
          isOpen={isWelcomeCreditsModalOpen}
          onClose={handleDismissBonus}
          onStartFirstCall={handleStartFirstCall}
          onLookAround={handleLookAround}
        />
      </div>
    );
  }

  if (['privacy', 'privacy-policy', 'privacy_policy'].includes(activeTab)) {
    return (
      <ErrorBoundary onReset={() => navigateTo('dashboard')}>
        <PrivacyPolicyView
            onBack={() => navigateTo('landing')}
            onNavigate={(tab) => navigateTo(tab)}
          />
      </ErrorBoundary>
    );
  }

  if (['terms', 'terms-and-conditions', 'terms-of-service', 'tos'].includes(activeTab)) {
    return (
      <ErrorBoundary onReset={() => navigateTo('dashboard')}>
        <TermsAndConditionsView
            onBack={() => navigateTo('landing')}
            onNavigate={(tab) => navigateTo(tab)}
          />
      </ErrorBoundary>
    );
  }

  if (['refund', 'refunds', 'refund-policy', 'cancellation-and-refund-policy'].includes(activeTab)) {
    return (
      <ErrorBoundary onReset={() => navigateTo('dashboard')}>
        <RefundPolicyView
            onBack={() => navigateTo('landing')}
            onNavigate={(tab) => navigateTo(tab)}
          />
      </ErrorBoundary>
    );
  }

  if (['shipping', 'shipping-policy', 'shipping-and-delivery', 'delivery-policy'].includes(activeTab)) {
    return (
      <ErrorBoundary onReset={() => navigateTo('dashboard')}>
        <ShippingPolicyView
            onBack={() => navigateTo('landing')}
            onNavigate={(tab) => navigateTo(tab)}
          />
      </ErrorBoundary>
    );
  }

  if (['contact', 'contact-us', 'support', 'help'].includes(activeTab)) {
    return (
      <ErrorBoundary onReset={() => navigateTo('dashboard')}>
        <ContactView
            onBack={() => navigateTo('landing')}
            onNavigate={(tab) => navigateTo(tab)}
          />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-zinc-950 antialiased selection:bg-zinc-900/10 selection:text-zinc-950">
      {/* Top Header Navigation (Apple Duo Glass Style) */}
      <Navbar
        stats={stats}
        onOpenBilling={() => navigateTo('billing')}
        onSearch={handleGlobalSearch}
        currentSearch={searchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          teamWorkingCount={stats.activeEmployees}
          currentUser={currentUser}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)] pb-16 bg-white">
          {workflowNotice && (
            <div role="status" className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-8">
              <div className="flex items-center justify-between gap-3">
                <span>{workflowNotice}</span>
                <button type="button" className="font-semibold underline" onClick={() => setWorkflowNotice('')}>Dismiss</button>
              </div>
            </div>
          )}
          {!authReady && (
            <div role="status" className="mx-auto mt-16 max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />
              <p className="text-sm font-semibold text-zinc-900">Checking your session…</p>
              <p className="mt-1 text-xs text-zinc-500">Your workspace will open when sign-in is verified.</p>
            </div>
          )}
          <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
          {/* Secret Admin Portal (Accessible strictly via /adminsairamsecreatelink) */}
          {activeTab === 'owner-admin' && (
            <OwnerAdminView
              onImpersonateTenant={handleImpersonateTenant}
              onNavigate={(tab) => navigateTo(tab)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => navigateTo(tab)}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
              employees={employees}
              stats={stats}
              campaigns={campaigns}
              onQuickAction={(action) => handleQuickAction(action)}
            />
          )}

          {activeTab === 'my-employees' && (
            <DashboardView
              onNavigate={(tab) => navigateTo(tab)}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
              employees={employees}
              stats={stats}
              isMyEmployeesView={true}
            />
          )}

          {activeTab === 'employee-studio' && (
            <NewEmployeeView
              initialStep={4}
              initialData={selectedEmployee}
              initialTab={selectedEmployee?.initialTab || 'call-script'}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onNavigate={(tab) => navigateTo(tab)}
            />
          )}

          {activeTab === 'new-employee' && (
            <NewEmployeeView
              initialStep={2}
              initialData={pendingPrompt ? { prompt: pendingPrompt } : null}
              onSaveEmployee={handleSaveEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
              onNavigate={(tab) => {
                setPendingPrompt(null);
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'talk-to-employee' && (
            <TalkToEmployeeView
              employee={selectedEmployee || employees[0]}
            />
          )}

          {activeTab === 'instant-leads' && (
            <InstantLeadsView
              onNavigate={(tab) => navigateTo(tab)}
            />
          )}

          {activeTab === 'bulk-campaigns' && (
            <BulkCampaignsView
              campaigns={campaigns}
              employees={employees}
              onCreateCampaign={handleCreateCampaign}
              onNavigate={(tab) => navigateTo(tab)}
            />
          )}

          {activeTab === 'inbound-desk' && (
            <InboundDeskView employees={employees} onNavigate={(tab) => navigateTo(tab)} />
          )}

          {activeTab === 'leads-results' && (
            <LeadsResultsView leads={leads} onRefresh={refreshLeads} />
          )}

          {activeTab === 'all-conversations' && (
            <AllConversationsView />
          )}

          {activeTab === 'train-employees' && (
            <TrainEmployeesView
              onNavigate={(tab) => navigateTo(tab)}
            />
          )}

          {activeTab === 'phone-numbers' && (
            <PhoneNumbersView
              onBalanceUpdate={refreshStats}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView />
          )}

          {activeTab === 'billing' && (
            <BillingView
              currentUser={currentUser}
              onBalanceUpdate={refreshStats}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onTriggerWelcomeCredits={() => setIsWelcomeCreditsModalOpen(true)}
            />
          )}

          {activeTab === 'developers' && (
            <DevelopersView />
          )}

          {![
            'dashboard', 'owner-admin', 'my-employees', 'employee-studio', 'new-employee',
            'talk-to-employee', 'instant-leads', 'bulk-campaigns', 'inbound-desk',
            'leads-results', 'all-conversations', 'train-employees', 'phone-numbers',
            'performance', 'billing', 'settings', 'developers'
          ].includes(activeTab) ? (
            <DashboardView
              stats={stats}
              employees={employees}
              campaigns={campaigns}
              onNavigate={(tab) => navigateTo(tab)}
              onQuickAction={(action) => handleQuickAction(action)}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
            />
          ) : null}
          </ErrorBoundary>
        </main>
      </div>

      {/* Google Login & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Welcome ₹50 Free Credits Onboarding Modal */}
      <WelcomeCreditsModal
        isOpen={isWelcomeCreditsModalOpen}
        onClose={handleDismissBonus}
        onStartFirstCall={handleStartFirstCall}
        onLookAround={handleLookAround}
      />
    </div>
  );
}