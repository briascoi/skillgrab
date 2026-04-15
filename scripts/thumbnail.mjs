#!/usr/bin/env node
// Generate landing/thumbnail.png (1024x1024) for Product Hunt / favicon.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "landing", "thumbnail.png");

async function loadFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const m = css.match(/src: url\((https:\/\/[^)]+?\.ttf)\)/);
  if (!m) throw new Error(`font url not found for weight ${weight}`);
  const buf = await (await fetch(m[1])).arrayBuffer();
  return Buffer.from(buf);
}

const [semibold, extrabold] = await Promise.all([loadFont(600), loadFont(800)]);

const node = {
  type: "div",
  props: {
    style: {
      width: "1024px",
      height: "1024px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.55), transparent 55%), radial-gradient(circle at 75% 85%, rgba(236,72,153,0.45), transparent 55%), #020617",
      color: "#f1f5f9",
      fontFamily: "Inter",
      padding: "80px",
    },
    children: [
      // Square mark
      {
        type: "div",
        props: {
          style: {
            width: "240px",
            height: "240px",
            borderRadius: "56px",
            background: "linear-gradient(135deg, #818cf8, #ec4899)",
            boxShadow: "0 40px 80px -20px rgba(236,72,153,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "160px",
            fontWeight: 800,
            color: "#0f172a",
          },
          children: "s",
        },
      },
      // Wordmark
      {
        type: "div",
        props: {
          style: {
            marginTop: "64px",
            fontSize: "120px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          },
          children: "skillgrab",
        },
      },
      // Command chip
      {
        type: "div",
        props: {
          style: {
            marginTop: "48px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "22px 36px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15, 23, 42, 0.65)",
            fontSize: "44px",
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
};

const svg = await satori(node, {
  width: 1024,
  height: 1024,
  fonts: [
    { name: "Inter", data: semibold, weight: 600, style: "normal" },
    { name: "Inter", data: extrabold, weight: 800, style: "normal" },
  ],
});

const png = new Resvg(svg).render().asPng();
await writeFile(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
