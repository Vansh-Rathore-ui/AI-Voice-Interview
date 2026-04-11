// ============================================================
// DSAProblems.js — AI-powered DSA problem generator tab
// Generates LeetCode-style problems via Claude API
// ============================================================

import React, { useState, useCallback } from "react";
import CodeEditor from "./CodeEditor";
import "./DSAProblems.css";

const TOPICS = [
  "Arrays", "Strings", "Linked Lists", "Trees", "Graphs",
  "Dynamic Programming", "Greedy", "Binary Search",
  "Stacks & Queues", "Hashing", "Recursion", "Sorting",
  "Two Pointers", "Sliding Window", "Tries",
];

function badgeClass(d) {
  if (d === "Easy")   return "badge-easy";
  if (d === "Hard")   return "badge-hard";
  return "badge-medium";
}

function truncate(s, n) {
  return s && s.length > n ? s.slice(0, n) + "…" : s;
}

export default function DSAProblems() {
  const [selectedTopics, setSelectedTopics] = useState(["Arrays", "Dynamic Programming"]);
  const [difficulty,     setDifficulty]     = useState("Medium");
  const [numQuestions,   setNumQuestions]   = useState(3);
  const [problems,       setProblems]       = useState([]);
  const [activeIdx,      setActiveIdx]      = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [showEditor,     setShowEditor]     = useState(false);

  const toggleTopic = useCallback((topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== topic);
      }
      const next = prev.length >= 4 ? [...prev.slice(1), topic] : [...prev, topic];
      return next;
    });
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProblems([]);

    const systemPrompt =
      "You are an expert DSA interviewer. Return ONLY valid JSON — no markdown, no backticks, no explanation.";

    const userPrompt = `Generate ${numQuestions} DSA problems. Difficulty: ${difficulty}. Topics: ${selectedTopics.join(", ")}.
Return a JSON array. Each element must have exactly these fields:
{
  "title": string,
  "difficulty": "${difficulty === "Mixed" ? "Easy|Medium|Hard" : difficulty}",
  "topic": string (one of: ${selectedTopics.join(", ")}),
  "description": string (LeetCode-style, 2-4 sentences),
  "input_format": string,
  "output_format": string,
  "constraints": [string, string, string],
  "examples": [
    { "input": string, "output": string, "explanation": string },
    { "input": string, "output": string, "explanation": string }
  ],
  "edge_cases": [string, string, string],
  "approach": string (1-2 sentence hint, NO full solution),
  "time_complexity": string,
  "space_complexity": string
}`;

    try {
      const response = await fetch('/oxlo-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.2-3b",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      }).catch(async (proxyError) => {
        // Fallback to direct API call if proxy fails
        console.warn('Proxy failed, trying direct API:', proxyError);
        return fetch('https://ai-voice-interview.onrender.com/oxlo-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama-3.2-3b",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }
      
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      let parsed = JSON.parse(clean);
      if (!Array.isArray(parsed)) parsed = [parsed];
      setProblems(parsed);
      setActiveIdx(0);
    } catch (err) {
      setError("Failed to generate problems. Please try again.\n" + err.message);
    } finally {
      setLoading(false);
    }
  }, [numQuestions, difficulty, selectedTopics]);

  const active = problems[activeIdx];

  return (
    <div className="dsa-wrap">
      {/* ── Controls ── */}
      <div className="dsa-controls">
        <label>Questions</label>
        <input
          type="number"
          className="dsa-number"
          min={1} max={5}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, Math.min(5, +e.target.value)))}
        />

        <label>Difficulty</label>
        <select
          className="dsa-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {["Easy", "Medium", "Hard", "Mixed"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <div className="dsa-chip-group">
          {TOPICS.map((t) => (
            <button
              key={t}
              className={`dsa-chip${selectedTopics.includes(t) ? " active" : ""}`}
              onClick={() => toggleTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          className="dsa-gen-btn"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "◌ Generating…" : "Generate ◈"}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="dsa-body">
        {/* Sidebar */}
        <div className="dsa-sidebar">
          {problems.length === 0 ? (
            <div className="dsa-sidebar-empty">
              {loading ? "Generating…" : "No problems yet"}
            </div>
          ) : (
            problems.map((p, i) => (
              <button
                key={i}
                className={`dsa-sidebar-item${i === activeIdx ? " active" : ""}`}
                onClick={() => setActiveIdx(i)}
              >
                <span className="si-num">PROBLEM {i + 1}</span>
                <span className="si-title">{truncate(p.title || "Untitled", 30)}</span>
                <span className={`si-badge ${badgeClass(p.difficulty)}`}>
                  {p.difficulty}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="dsa-detail">
          {loading && (
            <div className="dsa-loading">
              <div className="dsa-spinner" />
              <div className="dsa-loading-txt">
                Crafting {numQuestions} {difficulty} problem{numQuestions > 1 ? "s" : ""}…
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="dsa-error">{error}</div>
          )}

          {!loading && !error && !active && (
            <div className="dsa-empty-state">
              <div className="dsa-empty-icon">÷</div>
              <p>Select topics and click Generate</p>
              <p style={{ fontSize: "11px", opacity: 0.6 }}>
                Problems will appear here
              </p>
            </div>
          )}

          {!loading && !error && active && (
            <div>
              {!showEditor ? (
                <ProblemDetail 
                  problem={active} 
                  index={activeIdx} 
                  onSolve={() => setShowEditor(true)}
                />
              ) : (
                <div>
                  <div className="editor-header-nav">
                    <button 
                      className="back-button"
                      onClick={() => setShowEditor(false)}
                    >
                      Back to Problem
                    </button>
                    <h3>Solving: {active.title || `Problem ${activeIdx + 1}`}</h3>
                  </div>
                  <CodeEditor 
                    problem={active}
                    onRunCode={(result) => {
                      console.log('Code executed:', result);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProblemDetail({ problem: p, index, onSolve }) {
  const examples = (p.examples || []).slice(0, 2);
  const edgeCases = p.edge_cases || [];

  return (
    <div className="prob-card">
      {/* Top bar */}
      <div className="prob-topbar">
        <span className="prob-num-label">PROBLEM {index + 1}</span>
        <span className="prob-title">{p.title || "Untitled"}</span>
        <span className={`si-badge ${badgeClass(p.difficulty)}`}>{p.difficulty}</span>
        {p.topic && <span className="topic-tag">{p.topic}</span>}
        <button 
          className="solve-button"
          onClick={onSolve}
        >
          Solve Problem
        </button>
      </div>

      {/* Description */}
      <div className="prob-section">
        <div className="prob-section-label">Description</div>
        <p>{p.description}</p>
      </div>

      {/* Input / Output */}
      <div className="prob-section">
        <div className="prob-section-label">Input / Output Format</div>
        <div className="code-block">
          {"// Input\n"}{p.input_format}
          {"\n\n// Output\n"}{p.output_format}
        </div>
      </div>

      {/* Constraints */}
      <div className="prob-section">
        <div className="prob-section-label">Constraints</div>
        <div className="code-block">
          {(p.constraints || []).map((c, i) => `• ${c}`).join("\n")}
        </div>
      </div>

      {/* Examples */}
      <div className="prob-section">
        <div className="prob-section-label">Examples</div>
        <div className="example-grid">
          {examples.map((ex, i) => (
            <div className="example-box" key={i}>
              <div className="ex-label">EXAMPLE {i + 1}</div>
              <div className="ex-io">
                <span className="ex-in-label">IN  </span>{ex.input}
                {"\n"}
                <span className="ex-out-label">OUT </span>{ex.output}
              </div>
              {ex.explanation && (
                <div className="ex-explanation">{ex.explanation}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Edge Cases */}
      <div className="prob-section">
        <div className="prob-section-label">Hidden Edge Cases</div>
        <div className="edge-wrap">
          <div className="code-block edge-blur">
            {edgeCases.map((e) => `• ${e}`).join("\n") || "• Empty input\n• Max constraints\n• All duplicates"}
          </div>
          <div className="edge-overlay">
            <span className="edge-lock">🔒 Revealed during evaluation</span>
          </div>
        </div>
      </div>

      {/* Approach Hint */}
      <div className="prob-section">
        <div className="prob-section-label">Approach Hint</div>
        <div className="code-block amber-hint">{p.approach}</div>
      </div>

      {/* Complexity */}
      <div className="prob-section">
        <div className="prob-section-label">Optimal Complexity</div>
        <div className="complexity-row">
          <div className="cx-box">
            <div className="cx-label">TIME</div>
            <div className="cx-val">{p.time_complexity || "O(n)"}</div>
          </div>
          <div className="cx-box">
            <div className="cx-label">SPACE</div>
            <div className="cx-val">{p.space_complexity || "O(1)"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
