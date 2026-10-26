import fs from 'node:fs';
const html = fs.readFileSync('C:/Users/saira/sarvam/outpero_home.html', 'utf8');

const imgs = [...html.matchAll(/url=%2F([^&"']+)/gi)].map(m => decodeURIComponent(m[1]));
console.log('Images found:', [...new Set(imgs)]);
