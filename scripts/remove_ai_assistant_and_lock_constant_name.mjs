import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/saira/OneDrive/Desktop/sarvam-production-ready/sarvam-github-publish';

console.log('--- Removing "AI Assistant" and locking constant auto-assigned employee name ---');

// ============================================================================
// 1. UPDATE server/employeeScript.js
// ============================================================================
const empScriptPath = path.join(projectRoot, 'server/employeeScript.js');
let empScript = fs.readFileSync(empScriptPath, 'utf8');

empScript = empScript.replace(
  /if employeeName is not specified use 'AI Assistant'/g,
  "do NOT include 'AI Assistant'; if employeeName is not specified use 'కావ్య'"
);
empScript = empScript.replace(
  /request\.employeeName \|\| 'Customer Service Representative'/g,
  "request.employeeName || (request.language === 'te' ? 'కావ్య' : 'Kavya')"
);

// In normalizeGeneratedEmployeeScript: strip "AI Assistant" from openingGreeting
if (!empScript.includes('openingGreeting.replace(/AI Assistant/gi')) {
  empScript = empScript.replace(
    'const openingGreeting = normalizeGeneratedText(result?.openingLine, 240);',
    `let openingGreeting = normalizeGeneratedText(result?.openingLine, 240);
  openingGreeting = openingGreeting.replace(/AI Assistant\\s*/gi, '').replace(/\\s+/g, ' ');`
  );
}

fs.writeFileSync(empScriptPath, empScript, 'utf8');
console.log('✓ Updated server/employeeScript.js');

// ============================================================================
// 2. UPDATE server/server.js
// ============================================================================
const serverPath = path.join(projectRoot, 'server/server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

serverContent = serverContent.replace(
  /name \|\| 'AI Assistant'/g,
  "name || (req.body.language === 'te' ? 'కావ్య' : 'Kavya')"
);
serverContent = serverContent.replace(
  /employeeName \|\| 'AI Assistant'/g,
  "employeeName || (language === 'te' ? 'కావ్య' : 'Kavya')"
);

fs.writeFileSync(serverPath, serverContent, 'utf8');
console.log('✓ Updated server/server.js');

// ============================================================================
// 3. UPDATE client/src/views/DashboardView.jsx & root DashboardView.jsx
// ============================================================================
const dashPath = path.join(projectRoot, 'client/src/views/DashboardView.jsx');
let dashContent = fs.readFileSync(dashPath, 'utf8');

// Update pickAutoNameAndVoice for Telugu to use native Telugu names
dashContent = dashContent.replace(
  "const list = ['Siri', 'Vandana', 'Lakshmi', 'Kavya', 'Ananya'];",
  "const list = ['కావ్య', 'లక్ష్మి', 'సిరి', 'వందన', 'అనన్య'];"
);

// Replace all 'AI Assistant' in DashboardView
dashContent = dashContent.replace(
  /employeeName \|\| 'AI Assistant'/g,
  "employeeName || (currentLangObj.code === 'te' ? 'కావ్య' : 'Kavya')"
);

fs.writeFileSync(dashPath, dashContent, 'utf8');
fs.writeFileSync(path.join(projectRoot, 'DashboardView.jsx'), dashContent, 'utf8');
console.log('✓ Updated client/src/views/DashboardView.jsx & root DashboardView.jsx');

// ============================================================================
// 4. UPDATE client/src/views/NewEmployeeView.jsx
// ============================================================================
const newEmpPath = path.join(projectRoot, 'client/src/views/NewEmployeeView.jsx');
let newEmpContent = fs.readFileSync(newEmpPath, 'utf8');

// Replace renderGreetingWithLockedName helper to strip 'AI Assistant' and preserve constant name
const oldHelperPattern = /\/\/ Locked Telecaller Identity Helper in Call Script[\s\S]*?export default function NewEmployeeView/;
const newHelper = `// Locked Constant Telecaller Identity Helper in Call Script (AI Assistant removed)
function renderGreetingWithLockedName(text, callerName) {
  if (!text) return null;
  // Clean any accidental "AI Assistant" string
  const clean = text.replace(/AI Assistant\\s*/gi, '').replace(/\\s+/g, ' ');
  const nameToLock = callerName || 'కావ్య';
  if (!clean.includes(nameToLock)) {
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span>{clean}</span>
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#7a50dc]/15 text-[#7a50dc] font-bold border border-[#7a50dc]/30 text-xs select-none cursor-not-allowed shadow-2xs"
          title="Telecaller name is constant and locked from Employee Profile"
        >
          <Lock className="w-3 h-3 text-[#7a50dc]" />
          {nameToLock}
        </span>
      </span>
    );
  }
  const parts = clean.split(nameToLock);
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <span>{part}</span>
          {index < parts.length - 1 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#7a50dc]/15 text-[#7a50dc] font-bold border border-[#7a50dc]/30 text-xs select-none cursor-not-allowed shadow-2xs"
              title="Telecaller name is constant and locked from Employee Profile"
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

export default function NewEmployeeView`;

newEmpContent = newEmpContent.replace(oldHelperPattern, newHelper);

// Replace any leftover 'AI Assistant' in NewEmployeeView
newEmpContent = newEmpContent.replace(/employeeName \|\| 'AI Assistant'/g, "employeeName || 'కావ్య'");
newEmpContent = newEmpContent.replace(/nameToLock = callerName \|\| 'AI Assistant'/g, "nameToLock = callerName || 'కావ్య'");

// In Step 1 script editor: enforce constant name on saving change so user cannot break it
const oldSaveBtn = `<button
                              type="button"
                              onClick={() => setEditingStepId(null)}
                              className="px-3 py-1 rounded-lg bg-[#7a50dc] text-white text-xs font-semibold hover:bg-[#683fc4] cursor-pointer"
                            >
                              Save change
                            </button>`;

const newSaveBtn = `<button
                              type="button"
                              onClick={() => {
                                if (step.id === 1 || (step.title && step.title.toLowerCase().includes('open'))) {
                                  const constantName = employeeName || 'కావ్య';
                                  let updated = (step.body || '').replace(/AI Assistant\\s*/gi, '').trim();
                                  if (!updated.includes(constantName)) {
                                    updated = \`Use this personalized greeting: "నమస్కారం, \${businessName || 'Our Business'} లో \${constantName}. \${updated.replace(/^Use this personalized greeting:\\s*"?/i, '').replace(/"?\\s*Then ask.*$/i, '')}" Then ask whether it is a convenient time to talk.\`;
                                  }
                                  setScriptSteps(prev => prev.map(s => s.id === step.id ? { ...s, body: updated } : s));
                                }
                                setEditingStepId(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#7a50dc] text-white text-xs font-semibold hover:bg-[#683fc4] cursor-pointer"
                            >
                              Save change
                            </button>`;

newEmpContent = newEmpContent.replace(oldSaveBtn, newSaveBtn);

// In Step 1 display: render with locked name
newEmpContent = newEmpContent.replace(
  `<p className="text-[13px] text-[#3a3f5c] leading-relaxed whitespace-pre-line">\r\n                          {step.body}\r\n                        </p>`,
  `<p className="text-[13px] text-[#3a3f5c] leading-relaxed whitespace-pre-line">\r\n                          {(step.id === 1 || (step.title && step.title.toLowerCase().includes('open')))\r\n                            ? renderGreetingWithLockedName(step.body, employeeName || 'కావ్య')\r\n                            : step.body}\r\n                        </p>`
);

fs.writeFileSync(newEmpPath, newEmpContent, 'utf8');
console.log('✓ Updated client/src/views/NewEmployeeView.jsx');

console.log('--- All changes complete ---');
