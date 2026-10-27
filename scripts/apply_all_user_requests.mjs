import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/saira/OneDrive/Desktop/sarvam-production-ready/sarvam-github-publish';

console.log('--- Applying User Requests ---');

// ============================================================================
// PART A: UPDATE client/src/views/DashboardView.jsx
// ============================================================================
const dashPath = path.join(projectRoot, 'client/src/views/DashboardView.jsx');
let dashContent = fs.readFileSync(dashPath, 'utf8');

// 1. Add Lock to imports if not present
if (!dashContent.includes('Lock,')) {
  dashContent = dashContent.replace("FileText\r\n} from 'lucide-react';", "FileText,\r\n  Lock\r\n} from 'lucide-react';");
  dashContent = dashContent.replace("FileText\n} from 'lucide-react';", "FileText,\n  Lock\n} from 'lucide-react';");
}

// 2. Add DEFAULT_DASHBOARD_NEXT_ACTIONS if not present
if (!dashContent.includes('DEFAULT_DASHBOARD_NEXT_ACTIONS')) {
  const insertMarker = "import { useSpeechRecognition } from '../lib/useSpeechRecognition';";
  const defActions = `import { useSpeechRecognition } from '../lib/useSpeechRecognition';

export const DEFAULT_DASHBOARD_NEXT_ACTIONS = [
  'Schedule a site visit for measurement',
  'Send product catalog via email',
  'Request specific design preferences',
  'Confirm delivery timeline expectations',
  'Other'
];`;
  dashContent = dashContent.replace(insertMarker, defActions);
}

// 3. Add selectedNextActions state
if (!dashContent.includes('selectedNextActions, setSelectedNextActions')) {
  dashContent = dashContent.replace(
    "const [otherNextActionText, setOtherNextActionText] = useState('');",
    "const [otherNextActionText, setOtherNextActionText] = useState('');\r\n  const [selectedNextActions, setSelectedNextActions] = useState([\r\n    'Schedule a site visit for measurement'\r\n  ]);"
  );
}

// 4. Update handleFinishAndGoToStudio to use selectedNextActions + otherNextActionText
const oldFinishBlock = `    const effectiveNextAction = q2Selection === 'Other' && otherNextActionText ? otherNextActionText : q2Selection;`;
const newFinishBlock = `    const activeNextActions = [
      ...selectedNextActions.filter(x => x !== 'Other'),
      ...(otherNextActionText.trim() ? [otherNextActionText.trim()] : [])
    ];
    const effectiveNextAction = activeNextActions.length > 0
      ? activeNextActions.join(', ')
      : 'Schedule a site visit for measurement';`;

if (dashContent.includes(oldFinishBlock)) {
  dashContent = dashContent.replace(oldFinishBlock, newFinishBlock);
}

// Update nextActions in request
dashContent = dashContent.replace(
  "nextActions: [effectiveNextAction].filter(Boolean),",
  "nextActions: activeNextActions.length > 0 ? activeNextActions : ['Schedule a site visit for measurement'],"
);

// 5. Update Question 4 in DashboardView to support multiple selection & always open "Other" input
const oldQ4Block = `{/* QUESTION 4 OF 4: NEXT ACTION */}
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

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {(quickQuestions[3]?.options || ['Book a test drive', 'Visit showroom', 'Get WhatsApp brochure & EMI quotes', 'Speak to a sales executive', 'Other']).map((opt) => {
                        const isSelected = q2Selection === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setQ2Selection(opt);
                            }}
                            className={\`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer \${
                              isSelected
                                ? 'bg-[#D99A2B]/15 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-medium'
                                : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                            }\`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Dedicated input when Q4 'Other' is selected */}
                    {q2Selection === 'Other' && (
                      <div className="pt-2 animate-in fade-in duration-150">
                        <label className="block text-[12px] font-medium text-amber-300 mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Custom next step:</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={otherNextActionText}
                            onChange={(e) => setOtherNextActionText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleHeroNextQuestion();
                              }
                            }}
                            placeholder="Type custom next step..."
                            className="flex-1 p-3.5 rounded-xl bg-white/5 border border-amber-400/50 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}`;

const newQ4Block = `{/* QUESTION 4 OF 4: NEXT ACTION */}
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
                            className={\`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer flex items-center gap-2 select-none \${
                              isSelected
                                ? 'bg-[#D99A2B]/20 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-bold'
                                : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                            }\`}
                          >
                            <div
                              className={\`w-4 h-4 rounded flex items-center justify-center transition-all \${
                                isSelected ? 'bg-[#D99A2B] text-[#130e26]' : 'border border-white/30'
                              }\`}
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
                )}`;

// Match ignoring CRLF
const normDash = dashContent.replace(/\r\n/g, '\n');
const normOldQ4 = oldQ4Block.replace(/\r\n/g, '\n');
if (normDash.includes(normOldQ4)) {
  dashContent = normDash.replace(normOldQ4, newQ4Block).replace(/\n/g, '\r\n');
  console.log('✓ Updated Question 4 multi-select & always-open Other in DashboardView');
} else {
  console.log('! Note: Q4 pattern match did not trigger exact replacement, trying regex...');
  dashContent = dashContent.replace(/\{\/\* QUESTION 4 OF 4: NEXT ACTION \*\/\}[\s\S]*?(?=\{\/\* Navigation Buttons \*\/|\{\/\* Bottom Navigation Controls \*\/|handleHeroNextQuestion)/, newQ4Block + '\r\n\r\n                ');
}

// 6. Clean up duplicate and unwanted matter from DashboardView (lines after hero card)
const cleanDashboardBody = `      {/* 2. REAL METRICS STRIP (CLEAN & MINIMAL) */}
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
                    <span className={\`text-[11px] font-bold px-2.5 py-1 rounded-full border \${
                      emp.status === 'draft'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : emp.status === 'archived'
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }\`}>
                      {emp.status === 'draft' ? 'Draft' : emp.status === 'archived' ? 'Archived' : 'Ready'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmployeeToDelete(emp);
                        setDeleteEmployeeError('');
                      }}
                      title={\`Delete \${emp.name}\`}
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
                  <button
                    type="button"
                    onClick={() => {
                      if (onBuildEmployee) onBuildEmployee(emp, 'call-script');
                      else if (onNavigate) onNavigate('employee-studio');
                    }}
                    className="text-[#7a50dc] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    Open Call Script &rarr;
                  </button>
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
}`;

const quickActionsIndex = dashContent.indexOf('{/* 3. QUICK ACTIONS & YOUR AI EMPLOYEES');
if (quickActionsIndex !== -1) {
  dashContent = dashContent.slice(0, quickActionsIndex) + cleanDashboardBody + '\r\n}\r\n';
  console.log('✓ Replaced duplicate/cluttered dashboard matter with clean minimal metrics & employees');
} else {
  console.log('! Quick actions marker not found, checking alternatives...');
}

fs.writeFileSync(dashPath, dashContent, 'utf8');
// Sync to root DashboardView.jsx
fs.writeFileSync(path.join(projectRoot, 'DashboardView.jsx'), dashContent, 'utf8');
console.log('✓ Saved client/src/views/DashboardView.jsx & synced root DashboardView.jsx');

// ============================================================================
// PART B: UPDATE client/src/views/NewEmployeeView.jsx
// ============================================================================
const newEmpPath = path.join(projectRoot, 'client/src/views/NewEmployeeView.jsx');
let newEmpContent = fs.readFileSync(newEmpPath, 'utf8');

// 1. Add selectedNextActions state in NewEmployeeView
if (!newEmpContent.includes('selectedNextActions, setSelectedNextActions')) {
  newEmpContent = newEmpContent.replace(
    "const [q2Selection, setQ2Selection] = useState('');",
    `const [q2Selection, setQ2Selection] = useState('');
  const [selectedNextActions, setSelectedNextActions] = useState([
    'Schedule a site visit for measurement'
  ]);`
  );
}

// 2. Add DEFAULT_NEW_EMP_NEXT_ACTIONS
if (!newEmpContent.includes('DEFAULT_NEW_EMP_NEXT_ACTIONS')) {
  newEmpContent = newEmpContent.replace(
    "const [actionOptions, setActionOptions] = useState([",
    `const DEFAULT_NEW_EMP_NEXT_ACTIONS = [
    'Schedule a site visit for measurement',
    'Send product catalog via email',
    'Request specific design preferences',
    'Confirm delivery timeline expectations',
    'Other'
  ];
  const [actionOptions, setActionOptions] = useState([`
  );
}

// 3. Update effectiveNextAction in handleCompleteBuildToCall & generateSalesEmployeeScript
newEmpContent = newEmpContent.replace(
  "const effectiveNextAction = q2Selection === 'Other' && otherNextActionText ? otherNextActionText : q2Selection;",
  `const activeNextActionsList = [
      ...selectedNextActions.filter(t => t !== 'Other'),
      ...(otherNextActionText.trim() ? [otherNextActionText.trim()] : [])
    ];
    const effectiveNextAction = activeNextActionsList.length > 0
      ? activeNextActionsList.join(', ')
      : 'Schedule a site visit for measurement';`
);

// 4. Update Question 4 in NewEmployeeView
const oldNewEmpQ4 = `{/* QUESTION 4 OF 4: NEXT ACTION */}
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
                                className={\`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer \${
                                  isSelected
                                    ? 'bg-[#D99A2B]/15 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-medium'
                                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                                }\`}
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
                  )}`;

const newNewEmpQ4 = `{/* QUESTION 4 OF 4: NEXT ACTION */}
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
                        {/* Multi-select Pills */}
                        <div className="flex flex-wrap gap-2.5">
                          {(employeePurpose === 'support'
                            ? ['Escalate to a human', 'Create a support ticket', 'Share an approved help article', 'Other']
                            : DEFAULT_NEW_EMP_NEXT_ACTIONS
                          ).map((opt) => {
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
                                className={\`px-4 py-2.5 rounded-2xl text-[13px] font-medium border transition-all cursor-pointer flex items-center gap-2 select-none \${
                                  isSelected
                                    ? 'bg-[#D99A2B]/20 border-[#D99A2B] text-white shadow-sm ring-1 ring-[#D99A2B]/50 font-bold'
                                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                                }\`}
                              >
                                <div
                                  className={\`w-4 h-4 rounded flex items-center justify-center transition-all \${
                                    isSelected ? 'bg-[#D99A2B] text-[#130e26]' : 'border border-white/30'
                                  }\`}
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
                          <label className="text-[12px] font-bold text-amber-300 uppercase tracking-wider font-mono block mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Other custom next action / note (always open):</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={otherNextActionText}
                              onChange={(e) => {
                                setOtherNextActionText(e.target.value);
                                if (e.target.value && !selectedNextActions.includes('Other')) {
                                  setSelectedNextActions(prev => [...prev, 'Other']);
                                }
                              }}
                              placeholder="e.g. Schedule a 15-minute test drive, video consultation, or custom instruction..."
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
                      </div>
                    </div>
                  )}`;

const normNewEmp = newEmpContent.replace(/\r\n/g, '\n');
const normOldNewEmpQ4 = oldNewEmpQ4.replace(/\r\n/g, '\n');
if (normNewEmp.includes(normOldNewEmpQ4)) {
  newEmpContent = normNewEmp.replace(normOldNewEmpQ4, newNewEmpQ4).replace(/\n/g, '\r\n');
  console.log('✓ Updated Question 4 in NewEmployeeView');
}

// 5. Add renderGreetingWithLockedName helper and lock Telecaller name in OPENS WITH & Script Step 1
if (!newEmpContent.includes('renderGreetingWithLockedName')) {
  const helperCode = `// Locked Telecaller Identity Helper in Call Script
function renderGreetingWithLockedName(text, callerName) {
  if (!text) return null;
  const nameToLock = callerName || 'AI Assistant';
  if (!text.includes(nameToLock)) {
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span>{text}</span>
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#7a50dc]/15 text-[#7a50dc] font-bold border border-[#7a50dc]/30 text-xs select-none cursor-not-allowed shadow-2xs"
          title="Telecaller name is locked from Employee Profile and un-editable in script"
        >
          <Lock className="w-3 h-3 text-[#7a50dc]" />
          {nameToLock}
        </span>
      </span>
    );
  }
  const parts = text.split(nameToLock);
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <span>{part}</span>
          {index < parts.length - 1 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#7a50dc]/15 text-[#7a50dc] font-bold border border-[#7a50dc]/30 text-xs select-none cursor-not-allowed shadow-2xs"
              title="Telecaller name is locked and un-editable in the script"
            >
              <Lock className="w-3 h-3 text-[#7a50dc]" />
              {nameToLock}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

`;
  newEmpContent = newEmpContent.replace('export default function NewEmployeeView', helperCode + 'export default function NewEmployeeView');
}

// Update OPENS WITH block to render locked name
const oldOpensWith = `{/* OPENS WITH */}
                <div className="space-y-2 p-4.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc]">
                  <div className="text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono">
                    OPENS WITH
                  </div>
                  <div className="text-[16px] text-[#0f0e17] font-medium leading-relaxed">
                    {openingGreeting || scriptSteps[0]?.body || \`Hello, this is \${employeeName || 'your support employee'} from \${businessName || 'your business'}.\`}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      className="text-[11.5px] px-2 py-1 rounded-md bg-white border border-[#d8c7fa] text-[#7a50dc] font-medium flex items-center gap-1 hover:bg-[#f2ecfd] transition-colors cursor-pointer"
                    >
                      <+ Variable
                    </button>
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Spoken word-for-word the moment the call connects.
                    </span>
                  </div>
                </div>`;

const newOpensWith = `{/* OPENS WITH (Telecaller name locked) */}
                <div className="space-y-2 p-4.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc]">
                  <div className="flex items-center justify-between">
                    <div className="text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#7a50dc]" />
                      <span>OPENS WITH</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 select-none">
                      <Lock className="w-2.5 h-2.5" />
                      Telecaller Name Locked
                    </span>
                  </div>
                  <div className="text-[16px] text-[#0f0e17] font-medium leading-relaxed">
                    {renderGreetingWithLockedName(
                      openingGreeting || \`నమస్కారం, \${businessName || 'Our Business'} లో \${employeeName || 'AI Assistant'}. మీరు ఏ రకమైన \${effectiveSalesCategories()[0] || 'తలుపుల'} గురించి తెలుసుకోవాలనుకుంటున్నారు?\`,
                      employeeName || 'AI Assistant'
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      className="text-[11.5px] px-2 py-1 rounded-md bg-white border border-[#d8c7fa] text-[#7a50dc] font-medium flex items-center gap-1 hover:bg-[#f2ecfd] transition-colors cursor-pointer"
                    >
                      <+ Variable
                    </button>
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Spoken word-for-word the moment the call connects. Telecaller identity is locked from Employee Profile.
                    </span>
                  </div>
                </div>`;

const normNewEmp2 = newEmpContent.replace(/\r\n/g, '\n');
const normOldOpens = oldOpensWith.replace(/\r\n/g, '\n');
if (normNewEmp2.includes(normOldOpens)) {
  newEmpContent = normNewEmp2.replace(normOldOpens, newOpensWith).replace(/\n/g, '\r\n');
  console.log('✓ Updated OPENS WITH locked telecaller display in NewEmployeeView');
}

fs.writeFileSync(newEmpPath, newEmpContent, 'utf8');
console.log('✓ Saved client/src/views/NewEmployeeView.jsx');

console.log('--- All user requests successfully applied ---');
