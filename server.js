// ============================================================
// server.js — Single entry point: Express + WebSocket + Static
// ============================================================

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { analyzeResume, getInterviewResponse, generateFinalReport, getAvailableModels } = require("./backend/ai");
const { executeCode, testCode } = require("./backend/codeExecutor");
const {
  createSession,
  getSession,
  addMessage,
  addScore,
  setApiKey,
  deleteSession,
} = require("./backend/sessions");

const app = express();
const server = http.createServer(app);

// ─── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));

// CORS for outdoor/external API access
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ai-voice-interview.onrender.com',
    'https://vercel.app',
    'https://*.vercel.app'
  ];
  
  // Check if origin is allowed or if it's a development request
  if (!origin || allowedOrigins.includes(origin) || origin?.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, "frontend", "build")));

// ─── REST Routes ───────────────────────────────────────────

/**
 * POST /analyze-resume
 * Body: { resumeText, mode, difficulty }
 * Returns: { sessionId, resumeData }
 */
app.post("/analyze-resume", async (req, res) => {
  try {
    const { resumeText, mode, difficulty, customApiKey, model } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: "Resume text is too short. Please paste a complete resume." });
    }

    console.log("[API] Analyzing resume...");
    const resumeData = await analyzeResume(resumeText, customApiKey, model);
    const sessionId = uuidv4();
    createSession(sessionId, resumeData, mode || "hr", difficulty || "medium", customApiKey, model);

    console.log(`[API] Session created: ${sessionId}`);
    res.json({ sessionId, resumeData });
  } catch (err) {
    console.error("[API] analyzeResume error:", err.message);
    
    if (err.message === "API_KEY_REQUIRED") {
      return res.status(400).json({ error: "API_KEY_REQUIRED", message: "API key is required. Please provide your Oxlo AI API key." });
    }
    if (err.message === "RATE_LIMIT_EXCEEDED") {
      return res.status(429).json({ error: "RATE_LIMIT_EXCEEDED", message: "API rate limit exceeded. Please try again later or use a different API key." });
    }
    if (err.message === "INVALID_API_KEY") {
      return res.status(401).json({ error: "INVALID_API_KEY", message: "Invalid API key. Please check your API key and try again." });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /set-api-key
 * Body: { sessionId, apiKey }
 * Returns: { success: true }
 */
app.post("/set-api-key", async (req, res) => {
  try {
    const { sessionId, apiKey } = req.body;
    
    if (!sessionId || !apiKey) {
      return res.status(400).json({ error: "Session ID and API key are required." });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    setApiKey(sessionId, apiKey);
    console.log(`[API] API key updated for session: ${sessionId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[API] setApiKey error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health — Simple health check
 */
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));

/**
 * POST /oxlo-proxy - Proxy requests to Oxlo AI API
 */
app.post("/oxlo-proxy", async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body;
    
    if (!model || !messages) {
      return res.status(400).json({ error: "Model and messages are required" });
    }

    // Check if API key is available
    const apiKey = process.env.OXLO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Convert Anthropic format to Oxlo AI format
    const oxloMessages = [];
    if (system) {
      oxloMessages.push({ role: "system", content: system });
    }
    oxloMessages.push(...messages);

    const response = await fetch("https://api.oxlo.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "llama-3.2-3b",
        max_tokens: max_tokens || 1000,
        messages: oxloMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: "Oxlo AI API error", details: errorData });
    }

    const data = await response.json();
    
    // Convert Oxlo AI response back to Anthropic format for frontend compatibility
    const anthropicFormat = {
      content: [{
        type: "text",
        text: data.choices?.[0]?.message?.content || ""
      }]
    };
    
    res.json(anthropicFormat);
  } catch (err) {
    console.error("[API] Oxlo AI proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /execute-code - Execute code in real environment
 */
app.post("/execute-code", async (req, res) => {
  try {
    const { language, code, input, testCases } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: "Language and code are required" });
    }

    let result;
    if (testCases && testCases.length > 0) {
      // Run against test cases
      result = await testCode(language, code, testCases);
    } else {
      // Single execution with custom input
      result = await executeCode(language, code, input || '');
    }

    console.log(`[API] Code executed: ${language}, Success: ${result.success || result.summary?.success}`);
    res.json(result);
  } catch (err) {
    console.error("[API] Code execution error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /models — Get available AI models
 */
app.get("/models", (req, res) => {
  res.json(getAvailableModels());
});

/**
 * Catch-all: serve React app for any unmatched route
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

// ─── WebSocket Server ──────────────────────────────────────
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");

  ws.on("message", async (rawMsg) => {
    let msg;
    try {
      msg = JSON.parse(rawMsg.toString());
    } catch {
      sendWS(ws, { type: "error", message: "Invalid JSON message" });
      return;
    }

    const { type, sessionId, payload } = msg;

    try {
      // ── START: Send the opening question ──────────────────
      if (type === "start_interview") {
        const session = getSession(sessionId);
        if (!session) {
          sendWS(ws, { type: "error", message: "Session not found. Please analyze resume first." });
          return;
        }

        console.log(`[WS] Starting interview for session ${sessionId}`);

        // Add a system-style opener to history so AI has context
        addMessage(sessionId, "user", "Hello, I am ready to start the interview.");

        const aiResp = await getInterviewResponse(
          session.resumeData,
          session.conversationHistory,
          session.mode,
          session.difficulty,
          session.customApiKey,
          session.model
        );

        addMessage(sessionId, "assistant", JSON.stringify(aiResp));
        session.questionCount++;

        sendWS(ws, {
          type: "interview_question",
          question: aiResp.question,
          feedback: null,
          score: null,
          questionNumber: session.questionCount,
        });
        return;
      }

      // ── ANSWER: Process answer, return feedback + next question ──
      if (type === "answer") {
        const session = getSession(sessionId);
        if (!session) {
          sendWS(ws, { type: "error", message: "Session not found." });
          return;
        }

        const answer = payload?.text?.trim();
        if (!answer) {
          sendWS(ws, { type: "error", message: "Empty answer received." });
          return;
        }

        console.log(`[WS] Answer received for session ${sessionId}`);

        // Add user answer to history
        addMessage(sessionId, "user", answer);

        // Show "thinking" indicator
        sendWS(ws, { type: "thinking" });

        const aiResp = await getInterviewResponse(
          session.resumeData,
          session.conversationHistory,
          session.mode,
          session.difficulty,
          session.customApiKey,
          session.model
        );

        // Save AI response to history
        addMessage(sessionId, "assistant", JSON.stringify(aiResp));

        if (typeof aiResp.score === "number") {
          addScore(sessionId, aiResp.score);
        }

        session.questionCount++;

        // If interview is complete, trigger report
        if (aiResp.isComplete) {
          sendWS(ws, {
            type: "interview_response",
            feedback: aiResp.feedback,
            score: aiResp.score,
            question: aiResp.question,
            questionNumber: session.questionCount,
          });

          // Small delay then generate report
          setTimeout(async () => {
            try {
              sendWS(ws, { type: "generating_report" });
              const report = await generateFinalReport(
                session.resumeData,
                session.scores,
                session.conversationHistory,
                session.customApiKey,
                session.model
              );
              sendWS(ws, { type: "final_report", report });
            } catch (e) {
              sendWS(ws, { type: "error", message: "Failed to generate report: " + e.message });
            }
          }, 1500);
        } else {
          sendWS(ws, {
            type: "interview_response",
            feedback: aiResp.feedback,
            score: aiResp.score,
            question: aiResp.question,
            questionNumber: session.questionCount,
          });
        }
        return;
      }

      // ── END: Manually end interview ────────────────────────
      if (type === "end_interview") {
        const session = getSession(sessionId);
        if (!session) return;

        sendWS(ws, { type: "generating_report" });
        const report = await generateFinalReport(
          session.resumeData,
          session.scores,
          session.conversationHistory,
          session.customApiKey
        );
        sendWS(ws, { type: "final_report", report });
        return;
      }

    } catch (err) {
      console.error("[WS] Error handling message:", err.message);
      
      // Handle API key specific errors
      if (err.message === "API_KEY_REQUIRED") {
        sendWS(ws, { type: "api_key_required", message: "API key is required. Please provide your Oxlo AI API key." });
      } else if (err.message === "RATE_LIMIT_EXCEEDED") {
        sendWS(ws, { type: "rate_limit_exceeded", message: "API rate limit exceeded. Please try again later or use a different API key." });
      } else if (err.message === "INVALID_API_KEY") {
        sendWS(ws, { type: "invalid_api_key", message: "Invalid API key. Please check your API key and try again." });
      } else {
        sendWS(ws, { type: "error", message: err.message });
      }
    }
  });

  ws.on("close", () => console.log("[WS] Client disconnected"));
  ws.on("error", (e) => console.error("[WS] Error:", e.message));
});

// ─── Helper ───────────────────────────────────────────────
function sendWS(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// ─── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🚀 AI Interviewer running at http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   API Key: ${process.env.OXLO_API_KEY ? "✅ Set" : "❌ Missing — set OXLO_API_KEY"}\n`);
});
