#!/usr/bin/env bash
# Generate 5 PH gallery PNGs from scripted skillgrab runs against a fixture.
# Each captures one stage: banner, detection, plan, install, success.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIX="/tmp/skillgrab-shots-fixture"
OUT="$ROOT/landing/gallery"

mkdir -p "$OUT" "$FIX"

# Fixture: a realistic Next.js + Supabase + Stripe SaaS with marketing hints
cat > "$FIX/package.json" <<'EOF'
{
  "name": "my-saas",
  "description": "SaaS with landing page, pricing, SEO and newsletter",
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "tailwindcss": "^3",
    "@supabase/supabase-js": "^2",
    "stripe": "^14",
    "@clerk/nextjs": "^5"
  }
}
EOF
cat > "$FIX/README.md" <<'EOF'
# My SaaS
Landing page, waitlist, pricing, SEO, outreach, analytics.
EOF
echo '{}' > "$FIX/vercel.json"

# Helper: capture with freeze-point (Node writes to stdout, we screenshot at specific line)
# We use `script` + termshot-style: render with agg, then split frames

# Simpler approach: record full session with asciinema, generate multiple GIFs
# at different --last-frame markers; convert each to PNG via ffmpeg or sips.

# Alternate: just capture the plain text output at 4 checkpoints and render
# each to a styled PNG using a small HTML template + puppeteer... but we'd
# need to install puppeteer.

# Pragmatic approach: record the full asciinema cast, convert to GIF, then
# use ffmpeg to extract 5 specific frames as PNGs.

CAST="$OUT/full.cast"
GIF="$OUT/full.gif"

TERM=xterm-256color asciinema rec --overwrite --quiet --cols 110 --rows 34 -c "bash -c '
cd $FIX
clear
echo
echo \"  \\\$ npx skillgrab --dry-run\"
echo
sleep 1.2
node $ROOT/dist/cli.js --dry-run --yes
echo
sleep 3
'" "$CAST"

# Convert cast → GIF at higher quality
agg --theme monokai --speed 1.4 --cols 110 --rows 34 --font-size 18 "$CAST" "$GIF"

# Extract frames at key moments using ffmpeg (comes with macOS via brew)
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "⚠ ffmpeg not installed. Install: brew install ffmpeg"
  echo "For now, a single frame GIF is at $GIF. Will fallback to sips for PNG."
  # Fallback: just copy last-frame GIF to PNG
  sips -s format png "$GIF" --out "$OUT/05-plan.png" >/dev/null
  exit 0
fi

# Get duration of the gif
DUR="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$GIF")"
echo "Duration: ${DUR}s"

# Extract 5 frames at 15%, 35%, 55%, 75%, 95% of playback
for pct in 0.15 0.35 0.55 0.75 0.95; do
  SEC="$(python3 -c "print($DUR * $pct)")"
  NUM="$(python3 -c "print(int($pct * 100))")"
  OUTPNG="$OUT/frame-${NUM}.png"
  ffmpeg -y -ss "$SEC" -i "$GIF" -frames:v 1 -vf "scale=1280:-1:flags=lanczos" "$OUTPNG" 2>/dev/null
  echo "  $OUTPNG"
done

echo
echo "Generated in: $OUT/"
ls -la "$OUT/"
