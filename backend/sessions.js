// ============================================================
// backend/sessions.js — In-memory session store
// ============================================================

// Each session stores: resumeData, conversationHistory, scores, mode, difficulty
const sessions = new Map();

function createSession(id, resumeData, mode, difficulty, customApiKey = null, model = "llama-3.2-3b") {
  sessions.set(id, {
    id,
    resumeData,
    mode: mode || "hr",
    difficulty: difficulty || "medium",
    conversationHistory: [], // [{role: "user"|"assistant", content: "..."}]
    scores: [],
    questionCount: 0,
    startedAt: Date.now(),
    customApiKey, // Store user-provided API key
    model, // Store selected AI model
  });
  return sessions.get(id);
}

function getSession(id) {
  return sessions.get(id);
}

function updateSession(id, updates) {
  const session = sessions.get(id);
  if (!session) return null;
  Object.assign(session, updates);
  return session;
}

function addMessage(id, role, content) {
  const session = sessions.get(id);
  if (!session) return;
  session.conversationHistory.push({ role, content });
}

function addScore(id, score) {
  const session = sessions.get(id);
  if (!session) return;
  session.scores.push(Number(score));
}

function setApiKey(id, apiKey) {
  const session = sessions.get(id);
  if (!session) return;
  session.customApiKey = apiKey;
}

function deleteSession(id) {
  sessions.delete(id);
}

module.exports = { createSession, getSession, updateSession, addMessage, addScore, setApiKey, deleteSession };
