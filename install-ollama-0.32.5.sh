#!/bin/bash
# Downgrade Ollama to 0.32.5 (required for bike color image previews).
# Run in Terminal:  bash install-ollama-0.32.5.sh
set -euo pipefail

ZIP="/tmp/Ollama-darwin-0.32.5.zip"
EXTRACT="/tmp/Ollama-0.32.5-install"
URL="https://github.com/ollama/ollama/releases/download/v0.32.5/Ollama-darwin.zip"

echo "==> Quitting Ollama..."
osascript -e 'quit app "Ollama"' 2>/dev/null || true
sleep 2
pkill -x ollama 2>/dev/null || true
sleep 1

if [ ! -f "$ZIP" ]; then
  echo "==> Downloading Ollama 0.32.5 (~172 MB)..."
  curl -fL --progress-bar -o "$ZIP" "$URL"
else
  echo "==> Using existing download: $ZIP"
fi

echo "==> Extracting..."
rm -rf "$EXTRACT"
mkdir -p "$EXTRACT"
unzip -q "$ZIP" -d "$EXTRACT"

if [ ! -d "$EXTRACT/Ollama.app" ]; then
  echo "ERROR: Ollama.app not found in zip"
  exit 1
fi

echo "==> Installing to /Applications (may ask for password)..."
if [ -d /Applications/Ollama.app ]; then
  sudo rm -rf /Applications/Ollama.app.bak-pre-0.32.5
  sudo mv /Applications/Ollama.app /Applications/Ollama.app.bak-pre-0.32.5
fi
sudo cp -R "$EXTRACT/Ollama.app" /Applications/Ollama.app
sudo xattr -cr /Applications/Ollama.app 2>/dev/null || true

echo "==> Starting Ollama..."
open -a Ollama
sleep 4

echo "==> Version check:"
/Applications/Ollama.app/Contents/Resources/ollama --version
curl -s http://127.0.0.1:11434/api/version || true
echo
echo "Done. You want version 0.32.5 (not 0.32.6)."
echo "Then restart Spring Boot and test bike color change in chat."
