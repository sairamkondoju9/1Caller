import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/saira/OneDrive/Desktop/sarvam-production-ready/sarvam-github-publish';

console.log('Applying Dashboard cleanup, multi-select next actions, and locked telecaller identity...');

// ============================================================================
// 1. UPDATE client/src/utils/industryData.js
// ============================================================================
const industryDataPath = path.join(projectRoot, 'client/src/utils/industryData.js');
if (fs.existsSync(industryDataPath)) {
  let content = fs.readFileSync(industryDataPath, 'utf8');

  // Replace default options in questions[3] (next_action) with user's 5 exact options
  const targetOptions = `options: [
          'Schedule a site visit for measurement',
          'Send product catalog via email',
          'Request specific design preferences',
          'Confirm delivery timeline expectations',
          'Other'
        ]`;

  content = content.replace(
    /options:\s*\[[\s\S]*?'Other'[\s\S]*?\](?=,\s*defaultSelected:)/g,
    targetOptions
  );

  fs.writeFileSync(industryDataPath, content, 'utf8');
  console.log('✓ Updated client/src/utils/industryData.js');
}

// ============================================================================
// 2. UPDATE server/employeeScript.js
// ============================================================================
const employeeScriptPath = path.join(projectRoot, 'server/employeeScript.js');
if (fs.existsSync(employeeScriptPath)) {
  let content = fs.readFileSync(employeeScriptPath, 'utf8');

  // Ensure prompt explicitly instructs Telugu opening phrasing
  if (!content.includes('మీరు ఏ రకమైన')) {
    content = content.replace(
      /Return JSON only with exactly these fields: openingLine \(one greeting, max 30 words, in the requested language, using the exact business name; if employeeName is not specified, do not invent a person\)/,
      `Return JSON only with exactly these fields: openingLine (one greeting, max 30 words, in the requested language, using the exact business name; for Telugu use the natural phrasing 'నమస్కారం, [Business Name] లో [Employee Name]. మీరు ఏ రకమైన [Topics] గురించి తెలుసుకోవాలనుకుంటున్నారు?'; if employeeName is not specified use 'AI Assistant')`
    );
    fs.writeFileSync(employeeScriptPath, content, 'utf8');
    console.log('✓ Updated server/employeeScript.js prompt guidance');
  }
}

console.log('Step 1 & 2 complete.');
