#!/bin/bash
# View Adobe Stock search thumbnails WITHOUT licensing or keeping them.
# Usage: scripts/stock-peek.sh <renditionURL> [<renditionURL> ...]
# Fetches the public 240px thumbnails (ftcdn.net only) into a fresh temp folder and prints the paths,
# so the agent can open them with Read. Delete the folder afterwards: rm -rf <printed folder>.
# Thumbnails are for looking only: never place them in a design or copy them into a project.
set -euo pipefail
if [ $# -lt 1 ]; then echo "Usage: $0 <renditionURL>..." >&2; exit 2; fi
DIR="$(mktemp -d /tmp/asd-stock-peek.XXXXXX)"
echo "FOLDER $DIR"
i=0
for u in "$@"; do
  i=$((i + 1))
  case "$u" in
    https://t[0-9].ftcdn.net/*) ;;
    *) echo "SKIP (not an Adobe Stock thumbnail): $u" >&2; continue ;;
  esac
  f="$DIR/$(printf '%02d' "$i").jpg"
  if curl -fsSL --max-time 20 -o "$f" "$u"; then echo "$f"; else echo "FAILED $u" >&2; fi
done
