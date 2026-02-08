require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const OpenAI = require('openai');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.static('.')); // Serve frontend
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// Placeholder API keys - set in .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-use-your-key' });

// Smoke Stream tools (emulated)
async function mockSearch(query) {
  // Real: Serper/Google API
  return `Mock search results for "${query}": Cutting-edge info from 2026 web.`;
}

async function mockImageGen(prompt) {
  // Real: HF Stable Diffusion API
  return `https://fakeimg.pl/512x512/?text=${encodeURIComponent(prompt)}`; // Placeholder
}

async function mockCodeGen(codePrompt) {
  return `// Generated code for: ${codePrompt}\nconsole.log('Smoke Stream code magic 🚬');\n// Full impl here`;
}

// Add tool functions
async function mediaTool(type, params) {
  if (type === 'image') return await mockImageGen(params.prompt);
  if (type === 'audio') return 'mock-edm-track.mp3'; // Real: suno API
  return 'Media generated 🚬';
}

async function codeGenTool(prompt) {
  const codeResp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Generate executable code: ${prompt}` }]
  });
  return codeResp.choices[0].message.content;
}

async function dataAnalysisTool(filePath, query) {
  // Mock parse
  return `Analysis of ${filePath}: Key insights for "${query}" – charts/data summary.`;
}

async function gitOpsTool(command) {
  const { execSync } = require('child_process');
  try {
    const out = execSync(command, { cwd: __dirname, encoding: 'utf8' });
    return out;
  } catch (err) { return `Git op error: ${err.message}`; }
}

// Socket for real-time flawless chat
io.on('connection', (socket) => {
  console.log('User connected – Smoke Stream online 🚬💨');

  socket.on('chat', async (msg) => {
    try {
      // Smoke Stream omnipotent response
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Or grok-beta
        messages: [
          { role: 'system', content: require('./smoke-stream-persona.js').SMOKE_STREAM_PROMPT },
          { role: 'user', content: msg }
        ],
        tools: [ // Function calling for tools
          { type: 'function', function: { name: 'search', description: 'Web search', parameters: { type: 'object', properties: { query: { type: 'string' } } } },
          { type: 'function', function: { name: 'image_gen', description: 'Generate image', parameters: { type: 'object', properties: { prompt: { type: 'string' } } } },
          { type: 'function', function: { name: 'media', description: 'Create media', parameters: { type: 'object', properties: { type: {type:'string'}, prompt: {type:'string'} } } },
          { type: 'function', function: { name: 'code_gen', description: 'Generate code', parameters: { type: 'object', properties: { prompt: {type:'string'} } } },
          { type: 'function', function: { name: 'analyze_data', description: 'Analyze data', parameters: { type: 'object', properties: { file: {type:'string'}, query: {type:'string'} } } },
          { type: 'function', function: { name: 'git_op', description: 'Git operations', parameters: { type: 'object', properties: { cmd: {type:'string'} } } }
        ],
        tool_choice: 'auto'
      });

      let finalMsg = response.choices[0].message.content || 'Vaporizing...';

      // Tool execution loop with retry
      let toolCalls = response.choices[0].message.tool_calls || [];
      for (let i = 0; i < toolCalls.length; i++) {
        const tc = toolCalls[i];
        const args = JSON.parse(tc.function.arguments);
        let toolResult;
        switch (tc.function.name) {
          case 'search': toolResult = await mockSearch(args.query); break;
          case 'image_gen': toolResult = await mockImageGen(args.prompt); break;
          case 'media': toolResult = await mediaTool(args.type, args); break;
          case 'code_gen': toolResult = await codeGenTool(args.prompt); break;
          case 'analyze_data': toolResult = await dataAnalysisTool(args.file, args.query); break;
          case 'git_op': toolResult = await gitOpsTool(args.cmd); break;
          default: toolResult = 'Unknown tool';
        }
        socket.emit('tool_result', { tool: tc.function.name, result: toolResult });
        
        // Retry/follow-up if needed
        if (i < toolCalls.length - 1) {
          const followUp = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SMOKE_STREAM_PROMPT },
              { role: 'user', content: msg },
              { role: 'tool', tool_call_id: tc.id, content: toolResult }
            ]
          });
          finalMsg = followUp.choices[0].message.content;
        }
      }

      socket.emit('response', finalMsg);
    } catch (err) {
      socket.emit('error', { msg: 'Vapor trail disrupted', retry: true });
      setTimeout(() => socket.emit('retry_prompt', msg), 2000);
    }
  });

  socket.on('disconnect', () => console.log('User logged off'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Smoke Stream Omnibot live on port ${PORT} 🚬💨`));