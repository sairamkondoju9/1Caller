import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/saira/sarvam/outpero_home.html', 'utf8');

// Nav
const nav = html.match(/<nav[\s\S]*?<\/nav>/i);
if (nav) {
  fs.writeFileSync('C:/Users/saira/sarvam/extracted_nav.html', nav[0], 'utf8');
  console.log('Saved extracted_nav.html');
}

// Hero (usually inside header or first section or main)
const main = html.match(/<main[\s\S]*?<\/main>/i);
if (main) {
  fs.writeFileSync('C:/Users/saira/sarvam/extracted_main.html', main[0], 'utf8');
  console.log('Saved extracted_main.html (length: ' + main[0].length + ')');
}

// Footer
const footer = html.match(/<footer[\s\S]*?<\/footer>/i);
if (footer) {
  fs.writeFileSync('C:/Users/saira/sarvam/extracted_footer.html', footer[0], 'utf8');
  console.log('Saved extracted_footer.html');
}
