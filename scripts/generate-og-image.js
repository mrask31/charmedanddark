// scripts/generate-og-image.js
// Generates a simple og-default.jpg placeholder
// Run: node scripts/generate-og-image.js
// NOTE: This creates a minimal SVG-based placeholder. Replace with a proper
// branded 1200x630 image when available.

import { writeFileSync } from 'fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#08080F"/>
  <text x="600" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="400" fill="#FFFFFF" letter-spacing="12">CHARMED &amp; DARK</text>
  <text x="600" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="300" fill="#c9a96e" letter-spacing="6">PREMIUM GOTHIC LIFESTYLE</text>
  <line x1="480" y1="370" x2="720" y2="370" stroke="#c9a96e" stroke-width="0.5" opacity="0.5"/>
</svg>`;

writeFileSync('public/og-default.svg', svg);
console.log('Created public/og-default.svg');
console.log('NOTE: Convert to JPG at 1200x630 and save as public/og-default.jpg');
console.log('You can use: https://svgtopng.com or any image editor');
