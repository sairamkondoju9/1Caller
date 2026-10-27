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

// Eagerly imported core views for instant 0ms first-paint and liquid-smooth navigation (Handshake AI standard)
import LandingPageView from './views/LandingPageView';
import DashboardView from './views/DashboardView';

// Code-split secondary dynamic views with auto-retry and cache-busting resilience
const LiveCallSimulator = lazyRetry(() => import('./components/screens/LiveCallSimulator').then(m => ({ default: m.LiveCallSimulator })), 'call-sim');
const AgentFlowBuilder = lazyRetry(() => import('./components/screens/AgentFlowBuilder').then(m => ({ default: m.AgentFlowBuilder })), 'flow-builder');
const FleetManager = lazyRetry(() => import('./components/screens/FleetManager').then(m => ({ default: m.FleetManager })), 'fleet-mgr');
const ExecutiveAnalytics = lazyRetry(() => import('./components/screens/ExecutiveAnalytics').then(m => ({ default: m.ExecutiveAnalytics })), 'analytics');

const NewEmployeeView = lazyRetry(() => import('./views/NewEmployeeView'), 'new-employee');
const TalkToEmployeeView = lazyRetry(() => import('./views/TalkToEmployeeView'), 'talk-employee');
const InstantLeadsView = lazyRetry(() => import('./views/InstantLeadsView'), 'instant-leads');
const BulkCampaignsView = lazyRetry(() => import('./views/BulkCampaignsView'), 'bulk-campaigns');
const InboundDeskView = lazyRetry(() => import('./views/InboundDeskView'), 'inbound-desk');
const LeadsResultsView = lazyRetry(() => import('./views/LeadsResultsView'), 'leads-results');
const AllConversationsView = lazyRetry(() => import('./views/AllConversationsView'), 'all-convos');
const TrainEmployeesView = lazyRetry(() => import('./views/TrainEmployeesView'), 'train-employees');
const PhoneNumbersView = lazyRetry(() => import('./views/PhoneNumbersView'), 'phone-numbers');
const PerformanceView = lazyRetry(() => import('./views/PerformanceView'), 'performance');
const BillingView = lazyRetry(() => import('./views/BillingView'), 'billing');
const SettingsView = lazyRetry(() => import('./views/SettingsView'), 'settings');
const DevelopersView = lazyRetry(() => import('./views/DevelopersView'), 'developers');
const OwnerAdminView = lazyRetry(() => import('./views/OwnerAdminView'), 'owner-admin');
const PrivacyPolicyView = lazyRetry(() => import('./views/PrivacyPolicyView'), 'privacy');
const TermsAndConditionsView = lazyRetry(() => import('./views/TermsAndConditionsView'), 'terms');
const NotFoundView = lazyRetry(() => import('./views/NotFoundView'), 'not-found');

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeCreditsModalOpen, setIsWelcomeCreditsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [pendingTab, setPendingTab] = useState(null);
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

  // Resolve the stored session before rendering any protected workflow.
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthReady(true);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          throw new Error(data.error || 'Your session expired. Please sign in again.');
        }
        if (!response.ok) throw new Error(data.error || 'Could not verify your session. Please retry.');
        return data;
      })
      .then(data => {
        setCurrentUser(data.user || null);
        setSessionError('');
      })
      .catch(error => {
        setCurrentUser(null);
        setSessionError(error.message || 'Could not verify your session.');
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
    // URL and Secret Route Check: e.g. /privacy, /terms, /adminsairamsecreatelink
    const checkRoutes = () => {
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const routeKey = path || hash;
      if (!routeKey || routeKey === 'index.html') {
        return;
      }

      const validTabs = [
        'privacy', 'terms', 'owner-admin', 'dashboard', 'my-employees', 'employee-studio',
        'new-employee', 'talk-to-employee', 'instant-leads', 'bulk-campaigns', 'inbound-desk',
        'leads-results', 'all-conversations', 'train-employees', 'phone-numbers', 'performance',
        'billing', 'settings', 'developers'
      ];

      if (validTabs.includes(routeKey)) {
        setActiveTab(routeKey);
      } else {
        setActiveTab('404');
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
    if (!authReady || !protectedTabs.has(activeTab) || currentUser) return;
    setPendingTab(activeTab);
    setActiveTab('landing');
    setIsAuthModalOpen(true);
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
      setActiveTab('billing');
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
            onLaunchConsole={() => {
              const token = localStorage.getItem('auth_token');
              if (!token || !currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setActiveTab('dashboard');
              }
            }}
            onTalkToAgent={() => {
              setPendingTab('talk-to-employee');
              if (!currentUser) setIsAuthModalOpen(true);
              else setActiveTab('talk-to-employee');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
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

  if (activeTab === 'privacy') {
    return (
      <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-zinc-500 text-xs font-mono">Loading Privacy Policy...</div>}>
          <PrivacyPolicyView
            onBack={() => setActiveTab('dashboard')}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (activeTab === 'terms') {
    return (
      <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-zinc-500 text-xs font-mono">Loading Terms & Conditions...</div>}>
          <TermsAndConditionsView
            onBack={() => setActiveTab('dashboard')}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-zinc-950 antialiased selection:bg-zinc-900/10 selection:text-zinc-950">
      {/* Top Header Navigation (Apple Duo Glass Style) */}
      <Navbar
        stats={stats}
        onOpenBilling={() => setActiveTab('billing')}
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
          <Suspense fallback={<div className="p-8 text-[#6c6b7e] text-xs font-mono">Loading module...</div>}>
          {/* Secret Admin Portal (Accessible strictly via /adminsairamsecreatelink) */}
          {activeTab === 'owner-admin' && (
            <OwnerAdminView
              onImpersonateTenant={handleImpersonateTenant}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
              employees={employees}
              stats={stats}
            />
          )}

          {activeTab === 'my-employees' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
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
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'new-employee' && (
            <NewEmployeeView
              initialStep={2}
              initialData={null}
              onSaveEmployee={handleSaveEmployee}
              onBuildEmployee={(emp, targetTab = 'call-script') => {
                setSelectedEmployee({ ...emp, initialTab: targetTab });
                setActiveTab('employee-studio');
              }}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'talk-to-employee' && (
            <TalkToEmployeeView
              employee={selectedEmployee || employees[0]}
            />
          )}

          {activeTab === 'instant-leads' && (
            <InstantLeadsView
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'bulk-campaigns' && (
            <BulkCampaignsView
              campaigns={campaigns}
              employees={employees}
              onCreateCampaign={handleCreateCampaign}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'inbound-desk' && (
            <InboundDeskView employees={employees} onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'leads-results' && (
            <LeadsResultsView leads={leads} onRefresh={refreshLeads} />
          )}

          {activeTab === 'all-conversations' && (
            <AllConversationsView />
          )}

          {activeTab === 'train-employees' && (
            <TrainEmployeesView
              onNavigate={(tab) => setActiveTab(tab)}
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
            'owner-admin', 'dashboard', 'my-employees', 'employee-studio', 'new-employee',
            'talk-to-employee', 'instant-leads', 'bulk-campaigns', 'inbound-desk',
            'leads-results', 'all-conversations', 'train-employees', 'phone-numbers',
            'performance', 'billing', 'settings', 'developers'
          ].includes(activeTab) && (
            <NotFoundView onNavigate={(tab) => setActiveTab(tab)} />
          )}
          </Suspense>
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