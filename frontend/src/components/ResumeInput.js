// ============================================================
// components/ResumeInput.js
// Landing page: paste resume, select mode & difficulty, submit
// ============================================================

import React, { useState, useEffect } from "react";
import "./ResumeInput.css";

const MODES = [
  { id: "hr",            label: "HR / Behavioral", icon: "◎", desc: "Culture fit & soft skills" },
  { id: "dsa",           label: "DSA / Coding",    icon: "⟨⟩", desc: "Algorithms & data structures" },
  { id: "system-design", label: "System Design",   icon: "⬡", desc: "Architecture & scalability" },
];

const DIFFICULTIES = [
  { id: "easy",   label: "Junior",   color: "var(--green)" },
  { id: "medium", label: "Mid",      color: "var(--amber)" },
  { id: "hard",   label: "Senior",   color: "var(--red)" },
];

const PLACEHOLDER = `Paste your resume here…

Example:
John Doe
Software Engineer | john@example.com | github.com/johndoe

EXPERIENCE
Senior Developer at TechCorp (2021–Present)
- Built microservices handling 10M req/day using Node.js + Kubernetes
- Led team of 5, reduced deployment time by 60%

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker

PROJECTS
• RealtimeChat — WebSocket-based chat app with 1k users
• MLPipeline — Automated ML training pipeline on GCP

EDUCATION
B.Tech Computer Science, IIT Bangalore (2018–2022)`;

export default function ResumeInput({ onAnalyzed, onError }) {
  const [resumeText, setResumeText] = useState("");
  const [mode, setMode] = useState("hr");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [customApiKey, setCustomApiKey] = useState("");
  const [useCustomKey, setUseCustomKey] = useState(
    // Show API key option by default in production
    window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  );
  const [selectedModel, setSelectedModel] = useState("llama-3.2-3b");
  const [availableModels, setAvailableModels] = useState({
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
  });

  const handleTextChange = (e) => {
    setResumeText(e.target.value);
    setCharCount(e.target.value.length);
  };

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Use hosted backend
        const response = await fetch("https://ai-voice-interview.onrender.com/models");
        
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data);
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        // Keep default models as fallback
        setAvailableModels([
          { id: "llama-3.2-3b", name: "Llama 3.2 3B", description: "Fast and efficient" },
          { id: "mistral-7b", name: "Mistral 7B", description: "Balanced performance" },
          { id: "deepseek-v3.2", name: "DeepSeek V3.2", description: "Advanced reasoning" }
        ]);
      }
    };
    
    fetchModels();
  }, []);

  const handleSubmit = async () => {
    if (resumeText.trim().length < 50) {
      onError("Please paste a complete resume (at least 50 characters).");
      return;
    }
    if (useCustomKey && !customApiKey.trim()) {
      onError("Please enter your API key or use the default option.");
      return;
    }
    setLoading(true);
    onError(null);

    try {
      const requestBody = {
        resumeText,
        mode,
        difficulty,
        model: selectedModel,
      };

      // Always include customApiKey (null if using default)
      requestBody.customApiKey = useCustomKey ? customApiKey.trim() : null;
      
      // Debug logging
      console.log("API Request:", {
        useCustomKey,
        hasCustomApiKey: !!customApiKey.trim(),
        apiKeyLength: customApiKey.trim().length,
        finalApiKey: requestBody.customApiKey ? "***" : null
      });

      // Use hosted backend
      const response = await fetch("https://ai-voice-interview.onrender.com/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (error.error === "API_KEY_REQUIRED") {
          setUseCustomKey(true);
          throw new Error("API key required. Please provide your Oxlo AI API key.");
        }
        if (error.error === "RATE_LIMIT_EXCEEDED") {
          throw new Error("API rate limit exceeded. Please try again later or use a different API key.");
        }
        if (error.error === "INVALID_API_KEY") {
          throw new Error("Invalid API key. Please check your API key and try again.");
        }
        
        throw new Error(error.message || "Failed to analyze resume");
      }

      const data = await response.json();
      onAnalyzed(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">AI-POWERED INTERVIEW PREP</div>
        <h1 className="hero-title">
          Master Your<br />
          <span className="hero-title-accent">Next Interview</span>
        </h1>
        <p className="hero-subtitle">
          Paste your resume. Our AI conducts a real adaptive interview,<br />
          gives live feedback, and scores every answer.
        </p>

        <div className="hero-stats">
          <div className="stat"><span className="stat-num">AI</span><span className="stat-label">Interviewer</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">3</span><span className="stat-label">Interview Modes</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">🎤</span><span className="stat-label">Voice Support</span></div>
        </div>
      </div>

      {/* Main card */}
      <div className="resume-card">
        {/* Mode selector */}
        <div className="section">
          <label className="section-label">Interview Mode</label>
          <div className="mode-grid">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-btn ${mode === m.id ? "mode-btn--active" : ""}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-label">{m.label}</span>
                <span className="mode-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="section">
          <label className="section-label">Difficulty Level</label>
          <div className="diff-row">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={`diff-btn ${difficulty === d.id ? "diff-btn--active" : ""}`}
                style={difficulty === d.id ? { "--d-color": d.color } : {}}
                onClick={() => setDifficulty(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resume textarea */}
        <div className="section">
          <label className="section-label" htmlFor="resume-input">
            Your Resume
            <span className="char-count">{charCount} chars</span>
          </label>
          <div className="textarea-wrapper">
            <textarea
              id="resume-input"
              className="resume-textarea"
              value={resumeText}
              onChange={handleTextChange}
              placeholder={PLACEHOLDER}
              rows={16}
              disabled={loading}
            />
            {resumeText.length === 0 && (
              <div className="textarea-hint">
                Plain text only — no PDF needed
              </div>
            )}
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="section">
          <label className="section-label">AI Model</label>
          <div className="model-selection">
            {Object.entries(availableModels).map(([modelId, modelInfo]) => (
              <label key={modelId} className="model-option">
                <input
                  type="radio"
                  name="model"
                  value={modelId}
                  checked={selectedModel === modelId}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loading}
                />
                <div className="model-card">
                  <div className="model-name">{modelInfo.name}</div>
                  <div className="model-description">{modelInfo.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* API Key Section */}
        <div className="section">
          <label className="section-label">API Key</label>
          {window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
            <div className="production-notice">
              ⚠️ Production: Default API key has shared limits. Use your own key for unlimited access.
            </div>
          )}
          <div className="api-key-section">
            <label className="radio-group">
              <input
                type="radio"
                checked={!useCustomKey}
                onChange={() => setUseCustomKey(false)}
              />
              <span>Use default API key</span>
            </label>
            <label className="radio-group">
              <input
                type="radio"
                checked={useCustomKey}
                onChange={() => setUseCustomKey(true)}
              />
              <span>Use my own API key</span>
            </label>
          </div>
          
          {useCustomKey && (
            <div className="api-key-input-wrapper">
              <input
                type="password"
                className="api-key-input"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Enter your Oxlo AI API key"
                disabled={loading}
              />
              <div className="api-key-hint">
                Get your API key from <a href="https://oxlo.ai" target="_blank" rel="noopener noreferrer">oxlo.ai</a>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || resumeText.trim().length < 50}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing Resume…
            </>
          ) : (
            <>
              <span className="submit-icon">▶</span>
              Start Interview
            </>
          )}
        </button>

        {loading && (
          <div className="analyzing-status">
            <div className="analyzing-dots">
              <span /><span /><span />
            </div>
            <p>AI is analyzing your resume and crafting personalized questions…</p>
          </div>
        )}
      </div>

      {/* Feature hints */}
      <div className="features-row">
        {["Adaptive questions based on your resume", "Real-time scoring & feedback", "Voice-to-voice interaction", "Detailed final report"].map((f) => (
          <div key={f} className="feature-pill">
            <span className="feature-check">✓</span> {f}
          </div>
        ))}
      </div>
    </div>
  );
}
