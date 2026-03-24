import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const edges = [
  [16,6,24,11], [16,6,8,11], [16,6,16,16],
  [24,11,26,20], [8,11,6,20],
  [16,16,26,20], [16,16,6,20],
  [6,20,11,27], [26,20,21,27],
  [16,16,11,27], [16,16,21,27],
  [11,27,21,27],
];
const strongEdges = [[24,11,16,16],[8,11,16,16]];
const threads = [
  'M8 11 C 12 6, 20 16, 24 11',
  'M6 20 C 12 12, 20 28, 26 20',
  'M11 27 C 14 21, 18 21, 21 27',
];
const nodes = [
  [16, 6, 2.5],
  [24, 11, 2],
  [8, 11, 2],
  [16, 16, 3],
  [26, 20, 1.8],
  [6, 20, 1.8],
  [21, 27, 2],
  [11, 27, 2],
];

function buildGraph(color) {
  let out = '';
  for (const [x1,y1,x2,y2] of edges) {
    out += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" opacity="0.5"/>\n`;
  }
  for (const [x1,y1,x2,y2] of strongEdges) {
    out += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.4" opacity="0.6"/>\n`;
  }
  for (const d of threads) {
    out += `  <path fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" d="${d}"/>\n`;
  }
  for (const [cx, cy, r] of nodes) {
    out += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>\n`;
  }
  return out;
}

// 1) Favicon with prefers-color-scheme
const favicon = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">',
  buildGraph('#2563eb'),
  '  <style>',
  '    line, path, circle { transition: all 0.2s; }',
  '    @media (prefers-color-scheme: dark) {',
  '      line { stroke: #93c5fd !important; }',
  '      path { stroke: #93c5fd !important; }',
  '      circle { fill: #93c5fd !important; }',
  '    }',
  '  </style>',
  '</svg>',
].join('\n');

fs.writeFileSync(join(root, 'public', 'favicon.svg'), favicon);
console.log('wrote public/favicon.svg');

// 2) GitHub org logo — blue on white, 512x512
const orgLight = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">',
  '  <rect width="32" height="32" fill="white"/>',
  buildGraph('#2563eb'),
  '</svg>',
].join('\n');
fs.writeFileSync(join(root, 'logo-github-org.svg'), orgLight);
console.log('wrote logo-github-org.svg');

// 3) GitHub org logo — light blue on dark, 512x512
const orgDark = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">',
  '  <rect width="32" height="32" rx="4" fill="#0f172a"/>',
  buildGraph('#93c5fd'),
  '</svg>',
].join('\n');
fs.writeFileSync(join(root, 'logo-github-org-dark.svg'), orgDark);
console.log('wrote logo-github-org-dark.svg');

// 4) Convert to PNG using sharp (already a dependency)
try {
  const sharp = (await import('sharp')).default;
  
  const lightBuf = Buffer.from(orgLight);
  await sharp(lightBuf).resize(512, 512).png().toFile(join(root, 'logo-github-org.png'));
  console.log('wrote logo-github-org.png (512x512)');

  const darkBuf = Buffer.from(orgDark);
  await sharp(darkBuf).resize(512, 512).png().toFile(join(root, 'logo-github-org-dark.png'));
  console.log('wrote logo-github-org-dark.png (512x512)');
} catch (e) {
  console.log('sharp not available for PNG conversion, SVGs only. Run: npx sharp-cli ...');
  console.log(e.message);
}
