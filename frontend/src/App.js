// ============================================================
// App.js — Root component, manages top-level view state
// ============================================================

import React, { useState, useRef, useCallback } from "react";
import ResumeInput from "./components/ResumeInput";
import ChatWindow from "./components/ChatWindow";
import FinalReport from "./components/FinalReport";
import ApiKeyInput from "./components/ApiKeyInput";
import DSAProblems from "./components/DSAProblems";
import "./App.css";

// Views: "landing" → "interview" → "report"
// Tab:   "interview" | "dsa"  (visible while in interview/landing)
export default function App() {
  const [view,            setView]           = useState("landing");
  const [activeTab,       setActiveTab]      = useState("interview");
  const [sessionId,       setSessionId]      = useState(null);
  const [resumeData,      setResumeData]     = useState(null);
  const [finalReport,     setFinalReport]    = useState(null);
  const [error,           setError]          = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyError,     setApiKeyError]    = useState(null);

  const wsRef = useRef(null);

  const handleResumeAnalyzed = useCallback((data) => {
    setSessionId(data.sessionId);
    setResumeData(data.resumeData);
    setView("interview");
    setActiveTab("interview");
    setError(null);
  }, []);

  const handleFinalReport = useCallback((report) => {
    setFinalReport(report);
    setView("report");
  }, []);

  const handleRestart = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setView("landing");
    setActiveTab("interview");
    setSessionId(null);
    setResumeData(null);
    setFinalReport(null);
    setError(null);
    setShowApiKeyModal(false);
    setApiKeyError(null);
  }, []);

  const handleApiKeySubmit = useCallback(async (apiKey) => {
    if (!sessionId) return;
    try {
      const response = await fetch("https://ai-voice-interview.onrender.com/set-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, apiKey }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to set API key");
      }
      setApiKeyError(null);
      return true;
    } catch (err) {
      setApiKeyError(err.message);
      throw err;
    }
  }, [sessionId]);

  const handleApiKeyRequired = useCallback(() => {
    setShowApiKeyModal(true);
    setApiKeyError(null);
  }, []);

  const showTabs = view !== "report";

  return (
    <div className="app">
      <div className="bg-orb bg-orb--1" aria-hidden="true" />
      <div className="bg-orb bg-orb--2" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <header className="app-header">
        <button className="logo" onClick={handleRestart} title="Restart">
          <span className="logo-icon">◈</span>
          <span className="logo-text">APEX<span className="logo-accent">AI</span></span>
        </button>

        {showTabs && (
          <nav className="tab-nav" aria-label="Main tabs">
            <button
              className={"tab-btn" + (activeTab === "interview" ? " active" : "")}
              onClick={() => setActiveTab("interview")}
            >
              Interview
            </button>
            <button
              className={"tab-btn" + (activeTab === "dsa" ? " active" : "")}
              onClick={() => setActiveTab("dsa")}
            >
              DSA Problems
            </button>
          </nav>
        )}

        <div className="header-meta">
          {view === "interview" && resumeData && activeTab === "interview" && (
            <>
              <span className="header-chip">{resumeData.experience_level}</span>
              <button className="btn-ghost btn-sm" onClick={handleRestart}>
                ✕ New Session
              </button>
            </>
          )}
          {view === "report" && (
            <button className="btn-ghost btn-sm" onClick={handleRestart}>
              ← Start Over
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      <main className="app-main">
        {showTabs && activeTab === "dsa" && <DSAProblems />}

        {(view === "report" || activeTab === "interview") && (
          <>
            {view === "landing" && (
              <ResumeInput onAnalyzed={handleResumeAnalyzed} onError={setError} />
            )}
            {view === "interview" && sessionId && resumeData && (
              <ChatWindow
                sessionId={sessionId}
                resumeData={resumeData}
                wsRef={wsRef}
                onReport={handleFinalReport}
                onError={setError}
                onApiKeyRequired={handleApiKeyRequired}
              />
            )}
            {view === "report" && finalReport && (
              <FinalReport
                report={finalReport}
                resumeData={resumeData}
                onRestart={handleRestart}
              />
            )}
          </>
        )}

        <ApiKeyInput
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSubmit={handleApiKeySubmit}
          error={apiKeyError}
        />
      </main>
    </div>
  );
}
