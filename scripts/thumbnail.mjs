#!/usr/bin/env node
// Generate landing/thumbnail.png (1024x1024) for Product Hunt / favicon.
// Designed for legibility at 64px: rounded-square app icon with
// a bold "sg" monogram on gradient, glass highlight, drop shadow.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "landing", "thumbnail.png");

// Direct SVG. No Satori layout — pure design control.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Main tile gradient: indigo → violet → pink, diagonal -->
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="55%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>

    <!-- Glass highlight on top-left -->
    <radialGradient id="glass" cx="0.25" cy="0.2" r="0.7">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <!-- Inner ring glow to add depth -->
    <linearGradient id="ringTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <!-- Drop shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="30"/>
      <feOffset dx="0" dy="40"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Monogram gradient (subtle metallic white) -->
    <linearGradient id="mono" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>

  <!-- Background: deep navy full bleed -->
  <rect width="1024" height="1024" fill="#020617"/>

  <!-- Subtle background glow -->
  <circle cx="250" cy="200" r="380" fill="#6366f1" opacity="0.15"/>
  <circle cx="800" cy="820" r="380" fill="#ec4899" opacity="0.15"/>

  <!-- Main tile -->
  <g filter="url(#shadow)">
    <rect x="96" y="96" width="832" height="832" rx="200" ry="200" fill="url(#tile)"/>
    <!-- Inner 1px ring for definition -->
    <rect x="96.5" y="96.5" width="831" height="831" rx="199.5" ry="199.5"
          fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>
    <!-- Top highlight bar -->
    <rect x="96" y="96" width="832" height="200" rx="200" ry="200" fill="url(#ringTop)" opacity="0.6"/>
    <!-- Glass highlight -->
    <rect x="96" y="96" width="832" height="832" rx="200" ry="200" fill="url(#glass)"/>
  </g>

  <!-- Monogram "sg" — bold, tight, slightly tracked -->
  <g transform="translate(512, 570)">
    <text
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
      font-size="560"
      font-weight="900"
      letter-spacing="-40"
      fill="url(#mono)"
      style="paint-order:stroke fill;">sg</text>
  </g>

  <!-- Subtle caret dot — hints at "command line" without shouting -->
  <circle cx="512" cy="830" r="14" fill="#ffffff" opacity="0.7"/>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1024 },
  font: { loadSystemFonts: true },
}).render().asPng();

await writeFile(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
