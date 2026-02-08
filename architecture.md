# Smoke Stream Omnibot Architecture

## Overview
Full-stack web app transforming existing 3D client-side chat into omnipotent AI:
- **Frontend**: Enhanced index.html/main.js/style.css → Smoky 420-hacker UI (neon green/purple gradients, vaporwave smoke particles, subtle cannabis leaf patterns, glitch effects). Voice I/O (SpeechRecognition/Synthesis), camera/file upload.
- **Backend**: New server.js (Node/Express + Socket.io) → Real-time WebSocket chat. OpenAI/Grok proxy (API key env var). Tool modules: search (Serper mock), images (HF Stable Diffusion), code gen, git/media ops.
- **Omnipotence**: Backend emulates "do anything" via API calls (placeholders). Smoke Stream persona: Chill media-hacker god, versatile, innovative, user-centric.
- **Flawless UX**: Error retries, loading states, guidance. Responsive/PWA-ready.
- **Deploy**: Vercel/Netlify (frontend) + Render/Heroku (backend). GitHub push.

## Data Flow
User msg → Frontend (voice/text) → Socket.io → Backend (AI + tools) → Stream response → 3D particles react.

## Tech
- FE: Three.js (nebula → smoke), Web Speech API, getUserMedia.
- BE: Express, Socket.io, OpenAI SDK, node-fetch (tools).
- NPM: express socket.io openai dotenv cors helmet.

Ready for impl.