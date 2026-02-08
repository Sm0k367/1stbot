# BotChat – Futuristic 3D AI Chat Interface

A beautiful, real-time 3D chat experience powered entirely by the browser.

- **Local AI** using [web-llm](https://github.com/mlc-ai/web-llm) (runs Llama-3 / Phi-3 / Gemma directly in-browser via WebGPU — no server, no API keys, no cost)
- Gorgeous particle nebula background with Three.js
- Smart fallback to keyword-based responses when WebGPU is unavailable
- 100% client-side • completely free for you and every user • no backend required

Live demo: https://sm0k367.github.io/botchat/

https://github.com/sm0k367/botchat/assets/123456789/abcdef12-3456-7890-abcd-ef1234567890  
*(replace with a real short video/GIF if you record one — highly recommended)*

## Features

- Real local LLM inference in supported browsers (Chrome/Edge desktop most reliable)
- No account, no login, no API keys ever
- Cross-Origin Isolation enabled so SharedArrayBuffer + WebGPU work properly
- Semi-transparent futuristic UI with gradient messages
- Particle starfield / nebula background that gently rotates
- Mobile responsive (though local LLM works best on desktop)
- Fallback mode always available (fun, random replies based on keywords)

## How It Works

1. On page load → tries to initialize web-llm (downloads ~2–5 GB quantized model once, cached afterward)
2. If WebGPU + SharedArrayBuffer available → full local AI chat (private, fast after load)
3. If not → falls back to simple rule-based responses (zero latency, always works)
4. All computation happens in the user's browser — nothing is sent to any server

## Tech Stack

- **Frontend** — HTML/CSS/Three.js (CDN)
- **Local LLM** — [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) (from official CDN)
- **3D** — three@0.168.0 (minified CDN)
- **Cross-Origin Isolation** — custom lightweight service worker (`coi-serviceworker.js`)
- **Hosting** — GitHub Pages or Vercel (static, free tier)

## Quick Start (Local Development)

1. Clone the repo

```bash
git clone https://github.com/sm0k367/botchat.git
cd botchat

Serve locally (recommended: use a simple static server)

bash

# Option 1: with npm (if you have Node.js)
npm install -g serve
serve -s .
# or use the script in package.json: npm start

bash

# Option 2: Python (no install needed on most systems)
python -m http.server 8000

Open http://localhost:8000 (or the port shown)

Important: Open in Chrome or Edge for best WebGPU support.
Local model loading can take 2–10 minutes the first time (depends on internet speed and device).
Deployment (Free Forever)GitHub Pages (simplest)Go to repo → Settings → Pages
Source: Deploy from a branch → main (or gh-pages) → / (root)
Save → wait ~1–2 min → your site is live at https://<username>.github.io/botchat/

Vercel (faster CDN, custom domain easy)Go to https://vercel.com → Sign up / Log in (free with GitHub)
New Project → Import your GitHub repo
No configuration needed (it detects static site automatically)
Deploy → done in ~30 seconds

Both options are completely free with generous limits — no credit card required.Model Options (edit in main.js)Current default (good balance of quality/size):js

const MODEL_NAME = "Llama-3-8B-Instruct-q4f32_1-MLC";

Faster / lighter alternatives (change in main.js):js

// ~2 GB download, lower RAM usage, still very capable
const MODEL_NAME = "Phi-3-mini-4k-instruct-q4f16_1-MLC";

// Even smaller (~1.5 GB), quickest load
const MODEL_NAME = "Gemma-2-2b-it-q4f16_1-MLC";

TroubleshootingSymptom
Likely Cause
Fix / Workaround
"WebGPU not supported"
Browser or device doesn't support it
Use Chrome/Edge on desktop; fallback still works
Model fails to load / stuck at XX%
Slow connection / low RAM
Try smaller model (Phi-3 or Gemma), better Wi-Fi
"SharedArrayBuffer is not defined"
Missing Cross-Origin Isolation
Make sure coi-serviceworker.js is present & registered
Very slow responses
First inference on weak GPU
Normal for local; subsequent chats are faster
Fallback responses only
WebGPU unavailable
Intended behavior — still usable & fun

ContributingPull requests welcome!
Ideas: better fallback replies, streaming output, model selector UI, dark/light theme toggle, PWA manifest, etc.LicenseMIT License — feel free to fork, modify, use commercially, whatever you want.Made with  by @Sm0ken42O
Star  if you like it!

