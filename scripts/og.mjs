#!/usr/bin/env node
// Generate landing/og.png (1200x630) with Satori + Resvg.
// Usage: node scripts/og.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "landing", "og.png");

// Fetch Inter font weights from Google Fonts CSS → TTF.
async function loadFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const m = css.match(/src: url\((https:\/\/[^)]+?\.ttf)\)/);
  if (!m) throw new Error(`font url not found for weight ${weight}`);
  const buf = await (await fetch(m[1])).arrayBuffer();
  return Buffer.from(buf);
}

const [regular, semibold, extrabold] = await Promise.all([loadFont(400), loadFont(600), loadFont(800)]);

// JSX-free Satori layout (plain React.createElement-style objects).
const node = {
  type: "div",
  props: {
    style: {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px",
      background:
        "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.35), transparent 45%), radial-gradient(circle at 85% 20%, rgba(236,72,153,0.3), transparent 45%), #020617",
      color: "#f1f5f9",
      fontFamily: "Inter",
    },
    children: [
      // Top row: wordmark
      {
        type: "div",
        props: {
          style: { display: "flex", alignItems: "center", gap: "18px" },
          children: [
            {
              type: "div",
              props: {
                style: {
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                },
              },
            },
            {
              type: "div",
              props: {
                style: { fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em" },
                children: "skillgrab",
              },
            },
          ],
        },
      },
      // Middle: tagline
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column", gap: "28px", alignItems: "flex-start" },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "88px",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  maxWidth: "1050px",
                },
                children: [
                  { type: "div", props: { style: { display: "flex" }, children: "One command." } },
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        background: "linear-gradient(90deg, #a5b4fc, #f0abfc, #fda4af)",
                        backgroundClip: "text",
                        color: "transparent",
                      },
                      children: "The right AI skills for your project.",
                    },
                  },
                ],
              },
            },
            // Command chip
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  padding: "18px 28px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(15, 23, 42, 0.7)",
                  fontFamily: "Inter",
                  fontSize: "32px",
                  fontWeight: 600,
                },
                children: [
                  { type: "span", props: { style: { color: "#64748b" }, children: "$" } },
                  { type: "span", props: { style: { color: "#e2e8f0" }, children: "npx skillgrab" } },
                ],
              },
            },
          ],
        },
      },
      // Footer
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "22px",
            color: "#94a3b8",
          },
          children: [
            { type: "div", props: { children: "briascoi.github.io/skillgrab" } },
            { type: "div", props: { children: "built by @briascoi" } },
          ],
        },
      },
    ],
  },
};

const svg = await satori(node, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: semibold, weight: 600, style: "normal" },
    { name: "Inter", data: extrabold, weight: 800, style: "normal" },
  ],
});

const png = new Resvg(svg).render().asPng();
await writeFile(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
