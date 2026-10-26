import fs from 'node:fs';
const html = fs.readFileSync('C:/Users/saira/sarvam/outpero_home.html', 'utf8');

const audios = [...html.matchAll(/([a-zA-Z0-9_\-\/.]+\.(?:mp3|wav|m4a|ogg))/gi)].map(m => m[0]);
console.log('Audios found:', [...new Set(audios)]);
