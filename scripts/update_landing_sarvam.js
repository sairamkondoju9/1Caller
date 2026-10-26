import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\saira\\sarvam\\client\\src\\views\\LandingPageView.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Header logo
code = code.replace(
  /<a aria-label="Outpero home"[\s\S]*?<\/a>/,
  `<a aria-label="Sarvam AI home" className="shrink-0 mr-3 lg:mr-6 inline-flex items-center min-h-11" href="/">
            <img alt="Sarvam AI" width={140} height={36} className="h-7 lg:h-8 w-auto object-contain" src="/sarvam-logo-black.svg" />
          </a>`
);

// 2. Headline & Subtitle without clipping
code = code.replace(
  /<h1 className="rise rise-2 t-display[\s\S]*?<\/p>/,
  `<h1 className="rise rise-2 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center mt-6 max-w-[1000px] mx-auto text-balance px-4 leading-[1.1] text-ink">
              AI telecalling software.
            </h1>
            <p className="rise rise-3 text-sm sm:text-lg lg:text-xl mt-3 text-muted text-center max-w-xl mx-auto px-4 leading-relaxed">
              India&apos;s most <span className="text-brand-600 font-semibold">natural-sounding</span> voice agents.
            </p>`
);

// 3. CRM preview wordmark
code = code.replace(
  /alt="Outpero"[\s\S]*?src="\/site\/brand\/outpero-wordmark\.png"/,
  'alt="Sarvam AI" width={80} height={18} className="shrink-0 ml-1 h-3.5 w-auto object-contain" src="/sarvam-wordmark-black.svg"'
);

// 4. Section 4 text
code = code.replace('ONE OUTPERO EMPLOYEE', 'ONE SARVAM AI EMPLOYEE');
code = code.replace('Outpero calls within 30 seconds', 'Sarvam AI calls within 30 seconds');
code = code.replace('your Outpero employee', 'your Sarvam employee');

// 5. Developer API section
code = code.replace('Build on Outpero with our API.', 'Build on Sarvam AI with our API.');
code = code.replace('X-Outpero-Lead-Secret: ••••••', 'X-Sarvam-Lead-Secret: ••••••');
code = code.replace(/https:\/\/docs\.outpero\.com(\/#api)?/g, 'https://sarvam.ai');

// 6. Footer logo & copyright
code = code.replace(
  /<div className="col-span-2 lg:col-span-1 max-w-\[300px\]">[\s\S]*?support@outpero\.com\s*<\/a>/,
  `<div className="col-span-2 lg:col-span-1 max-w-[300px]">
              <img alt="Sarvam AI" width={140} height={36} className="h-8 w-auto object-contain" src="/sarvam-logo-black.svg" />
              <p className="text-[14px] leading-relaxed text-muted mt-4">
                AI employees that make your business calls: every lead, every list, in seven Indian languages.
              </p>
              <a href="mailto:support@sarvam.ai" className="inline-flex items-center min-h-11 mt-2 text-[14px] text-ink-2 hover:text-brand-600">
                support@sarvam.ai
              </a>`
);
code = code.replace('© 2026 Outpero · Powered by Sarvam AI', '© 2026 Sarvam Telephony & Voice AI. All rights reserved.');
code = code.replace("useState('outpero')", "useState('sarvam')");

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated LandingPageView.jsx with Sarvam identity & responsive headline!');
