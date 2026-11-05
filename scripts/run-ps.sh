#!/bin/bash
# Run an ExtendScript (.jsx) in Adobe Photoshop and print its return value.
# Usage: scripts/run-ps.sh <script.jsx> [arg1 arg2 ...]
# Arguments are passed to the script as the global array ASD_ARGS (paths are made absolute).
# Exit code is 1 when the script returns a string that starts with "ERROR".

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <script.jsx> [args...]" >&2
  exit 2
fi

abspath() {
  if [ -e "$1" ]; then
    echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
  else
    echo "$1"
  fi
}

js_escape() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

SCRIPT="$(abspath "$1")"; shift
if [ ! -f "$SCRIPT" ]; then echo "Script not found: $SCRIPT" >&2; exit 2; fi

ARGS_JS=""
for a in "$@"; do
  v="$(abspath "$a")"
  ARGS_JS="${ARGS_JS}${ARGS_JS:+,}\"$(js_escape "$v")\""
done

WRAPPER="$(mktemp -t asd_run).jsx"
trap 'rm -f "$WRAPPER"' EXIT
cat > "$WRAPPER" <<EOF
var ASD_ARGS = [${ARGS_JS}];
\$.evalFile(new File("$(js_escape "$SCRIPT")"));
EOF

RESULT="$(osascript <<EOF
with timeout of 1800 seconds
  tell application id "com.adobe.Photoshop"
    activate
    do javascript "\$.evalFile(new File('$WRAPPER'))"
  end tell
end timeout
EOF
)"

echo "$RESULT"
case "$RESULT" in
  ERROR*) exit 1 ;;
esac
