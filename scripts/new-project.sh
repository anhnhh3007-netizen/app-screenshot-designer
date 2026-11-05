#!/bin/bash
# Create a new screenshot project OUTSIDE the tool folder, under projectsRoot from config.json.
# Usage: scripts/new-project.sh <app-slug>
# Creates <projectsRoot>/<app-slug>/{input,output} and spec.json from templates/spec.template.json.
set -euo pipefail

TOOL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"
if [ -z "$SLUG" ]; then echo "Usage: $0 <app-slug>" >&2; exit 2; fi
case "$SLUG" in *[!a-z0-9-]*|-*) echo "app-slug must be lowercase letters, digits and dashes: $SLUG" >&2; exit 2;; esac

CONFIG="$TOOL_DIR/config.json"
if [ ! -f "$CONFIG" ]; then
  cp "$TOOL_DIR/config.example.json" "$CONFIG"
  echo "Created $CONFIG from config.example.json (edit projectsRoot if needed)" >&2
fi
ROOT="$(python3 -I -c 'import json,sys,os; print(os.path.expanduser(json.load(open(sys.argv[1]))["projectsRoot"]))' "$CONFIG")"
mkdir -p "$ROOT"
case "$ROOT/" in "$TOOL_DIR/"*) echo "projectsRoot must be outside the tool folder: $ROOT" >&2; exit 1;; esac

DIR="$ROOT/$SLUG"
if [ -e "$DIR" ]; then echo "Project already exists: $DIR" >&2; exit 1; fi
mkdir -p "$DIR/input" "$DIR/output"
sed "s/__SLUG__/$SLUG/" "$TOOL_DIR/templates/spec.template.json" > "$DIR/spec.json"
echo "$DIR"
