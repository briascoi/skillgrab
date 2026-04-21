#!/usr/bin/env bash
# Record an asciinema demo of skillgrab on a fixture project. Convert to GIF + MP4.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIX="/tmp/skillgrab-demo-fixture"
CAST="$ROOT/landing/demo.cast"
GIF="$ROOT/landing/demo.gif"
MP4="$ROOT/landing/demo.mp4"
INNER="/tmp/skillgrab-demo-inner.sh"

# Build first
echo "Building skillgrab..."
cd "$ROOT" && npm run build --silent

# Create fixture project
mkdir -p "$FIX"
cat > "$FIX/package.json" <<'FIXTURE'
{
  "name": "my-saas",
  "description": "SaaS with landing page, pricing, SEO and newsletter",
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "tailwindcss": "^3",
    "@supabase/supabase-js": "^2",
    "stripe": "^14",
    "@clerk/nextjs": "^5",
    "typescript": "^5"
  }
}
FIXTURE
cat > "$FIX/README.md" <<'FIXTURE'
# My SaaS
Landing page, waitlist, pricing. Focus on SEO and launch growth.
FIXTURE
echo '{}' > "$FIX/vercel.json"
echo '{ "compilerOptions": { "strict": true } }' > "$FIX/tsconfig.json"

# Inner script that asciinema records
cat > "$INNER" <<SCRIPT
#!/usr/bin/env bash
cd $FIX
clear
echo ""
echo "  \$ npx skillgrab --dry-run"
echo ""
sleep 1
node $ROOT/dist/cli.js --dry-run --yes
echo ""
sleep 3
SCRIPT
chmod +x "$INNER"

# Record
echo "Recording..."
TERM=xterm-256color asciinema rec --overwrite --quiet --cols 100 --rows 32 -c "$INNER" "$CAST"

# Convert to GIF
echo "Converting to GIF..."
agg --theme monokai --speed 1.3 --cols 100 --rows 32 "$CAST" "$GIF"

# Convert to MP4
echo "Converting to MP4..."
ffmpeg -y -i "$GIF" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "$MP4" 2>/dev/null

echo ""
echo "Done!"
echo "  $CAST  ($(wc -c < "$CAST" | tr -d ' ') bytes)"
echo "  $GIF   ($(wc -c < "$GIF" | tr -d ' ') bytes)"
echo "  $MP4   ($(wc -c < "$MP4" | tr -d ' ') bytes)"
