import fs from 'node:fs';

async function checkSarvam() {
  try {
    const res = await fetch('https://www.sarvam.ai', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    fs.writeFileSync('sarvam_home.html', text);
    console.log('Saved sarvam_home.html length:', text.length);

    // Look for font mentions
    const fontMatches = [...text.matchAll(/font-[a-zA-Z0-9_-]+:[^;{}]+/gi)].map(m => m[0]);
    console.log('Font rules in HTML:', fontMatches.slice(0, 15));

    // Look for font links or Google fonts
    const links = [...text.matchAll(/<link[^>]+>/gi)].map(m => m[0]).filter(l => l.includes('font') || l.includes('css'));
    console.log('Font/CSS links:', links);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
checkSarvam();
