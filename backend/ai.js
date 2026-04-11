// ============================================================
// backend/ai.js — All AI API calls via Oxlo AI
// Oxlo AI uses the OpenAI-compatible chat completions format
// ============================================================

const API_URL = "https://api.oxlo.ai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.2-3b";

// Available models
const AVAILABLE_MODELS = {
  "llama-3.2-3b": {
    name: "Llama 3.2 3B",
    description: "Fast and efficient for interviews",
    maxTokens: 1000
  },
  "mistral-7b": {
    name: "Mistral 7B",
    description: "Good balance of speed and quality",
    maxTokens: 1200
  },
  "deepseek-v3.2": {
    name: "DeepSeek V3.2",
    description: "Advanced reasoning capabilities",
    maxTokens: 1500
  }
};

/**
 * Low-level helper: calls Oxlo AI and returns the assistant reply text.
 * systemPrompt — sets the AI's persona/rules
 * userMessage  — the user turn
 * maxTokens    — cap on response length
 */
async function callAI(systemPrompt, userMessage, maxTokens = 1000, customApiKey = null, model = DEFAULT_MODEL) {
  const apiKey = customApiKey || process.env.OXLO_API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_REQUIRED");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });

  if (response.status === 429) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  if (!response.ok) {
    const err = await response.text();
    if (err.includes("401") || err.includes("Unauthorized")) {
      throw new Error("INVALID_API_KEY");
    }
    throw new Error(`Oxlo AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  // OpenAI-compatible response shape: data.choices[0].message.content
  return data.choices[0].message.content;
}

/**
 * Analyzes a resume and returns structured JSON.
 */
async function analyzeResume(resumeText, customApiKey = null, model = DEFAULT_MODEL) {
  const system = `You are an expert technical recruiter.
Analyze the resume and return ONLY valid JSON. NO OTHER TEXT.
CRITICAL: Your entire response must be a single JSON object. Do not include explanations, apologies, or any text outside the JSON.
JSON format:
{
  "name": "",
  "skills": [],
  "projects": [],
  "strengths": [],
  "weaknesses": [],
  "experience_level": "",
  "questions": ["question1", "question2", "question3", "question4", "question5"],
  "summary": ""
}`;

  const modelConfig = AVAILABLE_MODELS[model] || AVAILABLE_MODELS[DEFAULT_MODEL];
  const raw = await callAI(system, `Resume:\n${resumeText}`, modelConfig.maxTokens, customApiKey, model);

  // Strip any accidental markdown fences and clean up
  let cleaned = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
  
  // Try to extract JSON if there's extra text
  let jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Try to fix truncated JSON by completing it
  if (!cleaned.endsWith('}')) {
    // Count opening vs closing braces
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    const missingBraces = openBraces - closeBraces;
    
    if (missingBraces > 0) {
      cleaned += '}'.repeat(missingBraces);
    }
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error("Failed to parse AI response:", cleaned);
    console.error("Parse error:", parseError.message);
    throw new Error("AI response was not valid JSON. Please try again.");
  }
}

/**
 * Returns the AI interviewer's response to a candidate's answer.
 * conversationHistory — array of { role: "user"|"assistant", content: string }
 * Passed directly as the messages array so the AI has full multi-turn context.
 */
async function getInterviewResponse(resumeData, conversationHistory, mode, difficulty, customApiKey = null, model = DEFAULT_MODEL) {
  const modeInstructions = {
    hr: "Focus on behavioral questions, cultural fit, communication skills, and career goals.",
    dsa: "Focus on data structures, algorithms, time/space complexity, and coding problem-solving ability.",
    "system-design": "Focus on system design, scalability, architecture decisions, trade-offs, and real-world design problems.",
  };

  const difficultyInstructions = {
    easy:   "Ask beginner-friendly questions. Be encouraging and supportive.",
    medium: "Ask intermediate questions. Maintain a professional but approachable tone.",
    hard:   "Ask advanced, challenging questions. Be rigorous and probe deeply into every answer.",
  };

  const systemPrompt = `You are a strict but helpful technical interviewer conducting a ${mode.toUpperCase()} interview.

Candidate Profile:
${JSON.stringify(resumeData, null, 2)}

Interview Mode: ${mode.toUpperCase()}
${modeInstructions[mode] || modeInstructions.hr}

Difficulty: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

CRITICAL: You must respond with ONLY valid JSON. No explanations, no apologies, no text outside the JSON object.

After each answer, return ONLY this JSON (no extra text, no markdown fences):
{
  "feedback": "Specific, constructive feedback on the answer (2-3 sentences)",
  "score": 7,
  "question": "Your next interview question",
  "isComplete": false
}

Set "isComplete": true only when you have asked at least 6 questions and have enough data.
Score must be a number between 1 and 10.
Your entire response must be a single JSON object.`;

  // Full message array: system prompt + entire conversation so far
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${customApiKey || process.env.OXLO_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Oxlo AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  let raw = data.choices[0].message.content.replace(/\`\`\`json|\`\`\`/g, "").trim();
  
  // Try to extract JSON if there's extra text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    raw = jsonMatch[0];
  }
  
  // Try to fix truncated JSON by completing it
  if (!raw.endsWith('}')) {
    // Count opening vs closing braces
    const openBraces = (raw.match(/\{/g) || []).length;
    const closeBraces = (raw.match(/\}/g) || []).length;
    const missingBraces = openBraces - closeBraces;
    
    if (missingBraces > 0) {
      raw += '}'.repeat(missingBraces);
    }
  }
  
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse AI response:", raw);
    console.error("Parse error:", error.message);
    throw new Error("AI response was not valid JSON. Please try again.");
  }
}

/**
 * Generates the final interview evaluation report.
 */
async function generateFinalReport(resumeData, scores, conversationHistory, customApiKey = null, model = DEFAULT_MODEL) {
  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 0;

  const transcript = conversationHistory
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
    .join("\n");

  const system = `You are an expert hiring manager.
Analyze this interview transcript and generate a final evaluation report.
CRITICAL: Return ONLY valid JSON — no extra text, no markdown fences, no explanations.
Your entire response must be a single JSON object.
JSON format:
{
  "overall_score": 7.5,
  "grade": "B+",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "skills_assessment": {"technical": 8, "communication": 7, "problem_solving": 6},
  "recommendation": "Hire",
  "recommendation_reason": "2-3 sentence explanation",
  "improvement_areas": ["area 1", "area 2"]
}
recommendation must be exactly one of: "Hire", "Maybe", or "No Hire".`;

  const userMsg = `Candidate: ${resumeData.name || "Unknown"}
Experience Level: ${resumeData.experience_level}
Average Score: ${avgScore}/10
Individual scores: ${scores.join(", ")}

Interview Transcript:
${transcript}`;

  const modelConfig = AVAILABLE_MODELS[model] || AVAILABLE_MODELS[DEFAULT_MODEL];
  const raw = await callAI(system, userMsg, modelConfig.maxTokens, customApiKey, model);
  let cleaned = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
  
  // Try to extract JSON if there's extra text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Try to fix truncated JSON by completing it
  if (!cleaned.endsWith('}')) {
    // Count opening vs closing braces
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    const missingBraces = openBraces - closeBraces;
    
    if (missingBraces > 0) {
      cleaned += '}'.repeat(missingBraces);
    }
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse final report:", cleaned);
    console.error("Parse error:", error.message);
    // Return a fallback report
    return {
      overall_score: parseFloat(avgScore) || 5.0,
      grade: "C",
      strengths: ["Completed the interview"],
      weaknesses: ["Response processing issues"],
      skills_assessment: {
        technical: 5,
        communication: 5,
        problem_solving: 5
      },
      recommendation: "Maybe",
      recommendation_reason: "Interview completed but had technical difficulties with response processing.",
      improvement_areas: ["Technical communication", "Response clarity"]
    };
  }
}

module.exports = { 
  analyzeResume, 
  getInterviewResponse, 
  generateFinalReport, 
  getAvailableModels: () => AVAILABLE_MODELS,
  DEFAULT_MODEL 
};
