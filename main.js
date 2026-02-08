import { MLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.50/+esm";

// ────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────

const MODEL_NAME = "Llama-3-8B-Instruct-q4f32_1-MLC"; // ~4-5GB download, good quality
// Alternatives for faster load / lower RAM:
// "Phi-3-mini-4k-instruct-q4f16_1-MLC" (~2GB)
// "Gemma-2-2b-it-q4f16_1-MLC" (~1.5GB)

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant in a futuristic 3D chat interface. 
Keep responses concise, engaging, and fun. Use markdown for formatting when helpful.`;

const FALLBACK_RESPONSES = {
  greetings: ["Hey there! What's up in this cosmic void?", "Yo! Ready to chat through the stars?", "Hello human, I've been waiting in the nebula..."],
  howareyou: ["Floating through the ether, how about you?", "Processing at lightspeed 😎 You good?", "Existing in multiple dimensions at once. You?"],
  default: [
    "Interesting... tell me more!", 
    "Hmm, processing that one...", 
    "The void echoes your words back at me.", 
    "Fascinating input. What's next?", 
    "I'm just a bunch of particles trying to make sense of it all.",
    "Whoa, deep thoughts detected.",
    "Beep boop. Response incoming.",
    "The matrix is glitching... in a good way."
  ],
  farewell: ["Catch you in another dimension!", "Peace among the stars 🌌", "Logging off to recharge my qubits. Later!"]
};

// ────────────────────────────────────────────────
// DOM ELEMENTS
// ────────────────────────────────────────────────

const sceneContainer = document.getElementById("scene-container");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");

// ────────────────────────────────────────────────
// THREE.JS BACKGROUND
// ────────────────────────────────────────────────

let scene, camera, renderer, particles;

function initThreeJS() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000814);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  sceneContainer.appendChild(renderer.domElement);

  // Particles (star field)
  const particleCount = 8000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i]     = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    const hue = Math.random() * 0.1 + 0.6; // purple-blue range
    colors[i]     = hue;
    colors[i + 1] = hue * 0.7;
    colors[i + 2] = 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Gentle rotation
  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.00015;
    particles.rotation.x += 0.00008;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ────────────────────────────────────────────────
// CHAT UTILS
// ────────────────────────────────────────────────

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.classList.add(isUser ? "user-message" : "bot-message");
  msg.innerHTML = text; // Allows markdown-ish if you later parse
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showStatus(text) {
  statusEl.textContent = text;
  statusEl.style.opacity = text ? 1 : 0;
}

// ────────────────────────────────────────────────
// LLM LOGIC
// ────────────────────────────────────────────────

let engine = null;
let usingLocalLLM = false;

async function initLocalLLM() {
  showStatus("Checking WebGPU support...");
  
  if (!navigator.gpu) {
    showStatus("WebGPU not supported → using fallback mode");
    return false;
  }

  try {
    showStatus("Loading model (may take a few minutes)...");
    engine = await MLCEngine.create({
      model: MODEL_NAME,
      // Optional: more config
      initProgressCallback: (report) => {
        showStatus(`Loading: ${report.text} (${Math.round(report.progress * 100)}%)`);
      }
    });
    usingLocalLLM = true;
    showStatus("Local AI ready! 🚀");
    return true;
  } catch (err) {
    console.error("Local LLM init failed:", err);
    showStatus("Local model failed → fallback mode");
    return false;
  }
}

async function getLocalResponse(prompt) {
  if (!engine) return null;

  try {
    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 256,
      stream: false // Can enable true later for streaming
    });
    return reply.choices[0].message.content.trim();
  } catch (err) {
    console.error("Local inference error:", err);
    return null;
  }
}

function getFallbackResponse(userText) {
  const lower = userText.toLowerCase();

  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return FALLBACK_RESPONSES.greetings[Math.floor(Math.random() * FALLBACK_RESPONSES.greetings.length)];
  }
  if (lower.includes("how are you") || lower.includes("how's it going")) {
    return FALLBACK_RESPONSES.howareyou[Math.floor(Math.random() * FALLBACK_RESPONSES.howareyou.length)];
  }
  if (lower.includes("bye") || lower.includes("goodbye") || lower.includes("later")) {
    return FALLBACK_RESPONSES.farewell[Math.floor(Math.random() * FALLBACK_RESPONSES.farewell.length)];
  }

  return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
}

// ────────────────────────────────────────────────
// MAIN CHAT HANDLER
// ────────────────────────────────────────────────

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  userInput.value = "";

  showStatus(usingLocalLLM ? "Thinking..." : "Generating...");

  let responseText;

  if (usingLocalLLM) {
    responseText = await getLocalResponse(text);
  }

  if (!responseText) {
    // Fallback
    responseText = getFallbackResponse(text);
  }

  addMessage(responseText);
  showStatus("");
}

sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});

// ────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────

async function init() {
  initThreeJS();
  await initLocalLLM();

  // Welcome message
  addMessage("Hey! I'm your cosmic chat companion 🌌<br>Type something to begin.");
}

init();
