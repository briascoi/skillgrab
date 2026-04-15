#!/usr/bin/env bash
# Record an asciinema demo of skillgrab on a fixture project. Convert to GIF.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIX="/tmp/skillgrab-demo-fixture"
CAST="$ROOT/landing/demo.cast"
GIF="$ROOT/landing/demo.gif"
INNER="/tmp/skillgrab-demo-inner.sh"

mkdir -p "$FIX"
cat > "$FIX/package.json" <<'EOF'
{
  "name": "my-saas",
  "description": "SaaS with landing page, pricing, SEO and newsletter",
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "tailwindcss": "^3",
    "@supabase/supabase-js": "^2",
    "stripe": "^14"
  }
}
EOF
cat > "$FIX/README.md" <<'EOF'
# My SaaS
Landing page, waitlist, pricing. Focus on SEO and launch growth.
EOF
echo '{}' > "$FIX/vercel.json"

cat > "$INNER" <<EOF
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
EOF
chmod +x "$INNER"

TERM=xterm-256color asciinema rec --overwrite --quiet --cols 100 --rows 28 -c "$INNER" "$CAST"

agg --theme monokai --speed 1.3 --cols 100 --rows 28 "$CAST" "$GIF"

echo "Wrote: $CAST ($(wc -c < "$CAST") bytes)"
echo "Wrote: $GIF ($(wc -c < "$GIF") bytes)"
