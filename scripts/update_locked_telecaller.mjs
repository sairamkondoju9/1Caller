import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/saira/OneDrive/Desktop/sarvam-production-ready/sarvam-github-publish';
const newEmpPath = path.join(projectRoot, 'client/src/views/NewEmployeeView.jsx');
let content = fs.readFileSync(newEmpPath, 'utf8');

// Target OPENS WITH block
const targetOpens = `{/* OPENS WITH */}
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
                      &lt;+ Variable
                    </button>
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Spoken word-for-word the moment the call connects.
                    </span>
                  </div>
                </div>`;

const replacementOpens = `{/* OPENS WITH (Telecaller name locked) */}
                <div className="space-y-2 p-4.5 rounded-2xl bg-[#faf9fe] border border-[#eee8fc]">
                  <div className="flex items-center justify-between">
                    <div className="text-[10.5px] font-bold text-[#7a50dc] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#7a50dc]" />
                      <span>OPENS WITH</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 select-none">
                      <Lock className="w-2.5 h-2.5" />
                      Telecaller Identity Locked
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
                      &lt;+ Variable
                    </button>
                    <span className="text-[11.5px] text-[#6c6b7e]">
                      Spoken word-for-word the moment the call connects. Telecaller identity is locked from employee profile and un-editable in script.
                    </span>
                  </div>
                </div>`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetOpens.replace(/\r\n/g, '\n');
if (normContent.includes(normTarget)) {
  content = normContent.replace(normTarget, replacementOpens).replace(/\n/g, '\r\n');
  console.log('✓ Successfully replaced OPENS WITH block with locked telecaller identity');
} else {
  console.error('Target not found in content, checking snippet:');
  const idx = normContent.indexOf('OPENS WITH');
  console.log(normContent.slice(idx - 50, idx + 350));
}

// Also update Step 1 script editing to show the telecaller identity locked banner
const stepEditTarget = `{editingStepId === step.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea`;

const stepEditReplacement = `{editingStepId === step.id ? (
                        <div className="space-y-2 pt-1">
                          {(step.id === 1 || (step.title && step.title.toLowerCase().includes('open'))) && (
                            <div className="text-[11px] font-mono text-[#7a50dc] flex items-center gap-1.5 bg-[#f4effe] px-2.5 py-1.5 rounded-lg border border-[#e2d5fc]">
                              <Lock className="w-3 h-3 text-[#7a50dc]" />
                              <span>Telecaller identity <strong>"{employeeName || 'AI Assistant'}"</strong> is locked from Employee Profile and un-editable in this script.</span>
                            </div>
                          )}
                          <textarea`;

const normContent2 = content.replace(/\r\n/g, '\n');
const normStepEdit = stepEditTarget.replace(/\r\n/g, '\n');
if (normContent2.includes(normStepEdit)) {
  content = normContent2.replace(normStepEdit, stepEditReplacement).replace(/\n/g, '\r\n');
  console.log('✓ Successfully added Step 1 locked telecaller banner in script editor');
}

fs.writeFileSync(newEmpPath, content, 'utf8');
console.log('✓ Saved client/src/views/NewEmployeeView.jsx');
