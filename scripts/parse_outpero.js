import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/saira/sarvam/outpero_home.html', 'utf8');

const titleMatch = html.match(/<title>(.*?)<\/title>/i);
console.log('TITLE:', titleMatch ? titleMatch[1] : 'None');

// Extract CSS files
const cssMatches = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
console.log('\nCSS files:', cssMatches);

// Extract headings
const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({ tag: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
console.log('\nHEADINGS (' + headings.length + '):');
headings.forEach(h => console.log(` - [${h.tag}] ${h.text}`));

// Extract nav items
const navMatch = html.match(/<nav[\s\S]*?<\/nav>/i);
if (navMatch) {
  console.log('\nNAV CONTENT:');
  const links = [...navMatch[0].matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({
    href: m[1],
    text: m[2].replace(/<[^>]+>/g, '').trim()
  }));
  console.log(links);
  const buttons = [...navMatch[0].matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Nav Buttons:', buttons);
}

// Extract main sections
const sections = [...html.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi)];
console.log('\nTOTAL SECTIONS:', sections.length);

// Extract text content of each section
sections.forEach((sec, idx) => {
  const clean = sec[1].replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();
  console.log(`\n--- SECTION ${idx + 1} (${clean.length} chars) ---`);
  console.log(clean.substring(0, 300) + '...');
});
