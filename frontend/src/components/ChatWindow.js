// ============================================================
// ChatWindow.js — Voice-first interview UI (noise-resistant)
//
// Modes:
//   AUTO MODE:  Mic opens after AI speaks → 4s silence → submit
//               (ignores <3 word captures = background noise)
//   PUSH MODE:  Hold the orb button while speaking → release → submit
//               (zero false triggers from background noise)
//
// The audio level meter (green bars) shows you if the mic
// is physically picking up your voice.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVoice, useTTS, hasSpeechRecognition } from "./VoiceControls";
import "./ChatWindow.css";

function getWsUrl() {
  // Use hosted backend
  return `wss://ai-voice-interview.onrender.com`;
}

export default function ChatWindow({ sessionId, resumeData, wsRef, onReport, onError, onApiKeyRequired }) {
  const [messages,        setMessages]        = useState([]);
  const [status,          setStatus]          = useState("connecting");
  const [questionCount,   setQuestionCount]   = useState(0);
  const [scores,          setScores]          = useState([]);
  const [textInput,       setTextInput]       = useState("");
  const [showText,        setShowText]        = useState(false);
  const [pushHeld,        setPushHeld]        = useState(false); // push-to-talk held
  const [micMode,         setMicMode]         = useState("push"); // "auto" | "push"
  // push mode is default — much more reliable in noisy environments

  const chatEndRef  = useRef(null);
  const statusRef   = useRef(status);
  const pushHeldRef = useRef(false);
  useEffect(() => { statusRef.current = status; }, [status]);

  // ── TTS ──────────────────────────────────────────────────
  const { isSpeaking, speak, stop: stopSpeaking } = useTTS();

  // ── STT ──────────────────────────────────────────────────
  const voice = useVoice({
    onFinalTranscript: useCallback((text) => {
      if (statusRef.current === "ready") sendAnswer(text);
      // eslint-disable-next-line
    }, []),
    disabled: status !== "ready",
    isSpeaking,
  });

  // Auto-scroll transcript
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start audio meter on mount so user can see mic level
  useEffect(() => {
    voice.startAudioMeter();
    return () => voice.stopAudioMeter();
    // eslint-disable-next-line
  }, []);

  // AUTO mode: enable persistent listening when ready
  useEffect(() => {
    if (micMode !== "auto") return;
    if (status === "ready" && !isSpeaking && hasSpeechRecognition) {
      voice.setPersistent(true);
    } else {
      voice.setPersistent(false);
    }
    // eslint-disable-next-line
  }, [status, isSpeaking, micMode]);

  // PUSH mode: only listen when button held
  useEffect(() => {
    if (micMode !== "push") return;
    if (pushHeld && status === "ready" && !isSpeaking) {
      voice.startListening({ push: true });
    } else if (!pushHeld) {
      voice.submitAndStop();
    }
    // eslint-disable-next-line
  }, [pushHeld, status, isSpeaking, micMode]);

  // ── WebSocket ─────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("ready");
      ws.send(JSON.stringify({ type: "start_interview", sessionId }));
    };
    ws.onmessage = (e) => handleWsMessage(JSON.parse(e.data));
    ws.onerror   = () => {
      onError(`Cannot connect to ${getWsUrl()}. Is "node server.js" running?`);
      setStatus("error");
    };
    ws.onclose = (e) => {
      if (e.code !== 1000 && e.code !== 1005) console.warn("[WS] close", e.code);
    };
    return () => ws.close();
    // eslint-disable-next-line
  }, [sessionId]);

  const handleWsMessage = useCallback((msg) => {
    switch (msg.type) {
      case "interview_question":
        setStatus("speaking");
        setQuestionCount(msg.questionNumber || 1);
        addMessage({ type: "ai-question", text: msg.question, questionNum: msg.questionNumber });
        speak(msg.question);
        setTimeout(() => setStatus("ready"), 300);
        break;
      case "thinking":
        setStatus("thinking");
        break;
      case "interview_response":
        setStatus("speaking");
        setQuestionCount(msg.questionNumber || 0);
        if (msg.score) setScores(s => [...s, msg.score]);
        if (msg.feedback) addMessage({ type: "ai-feedback", text: msg.feedback, score: msg.score });
        if (msg.question) {
          addMessage({ type: "ai-question", text: msg.question, questionNum: msg.questionNumber });
          speak(`${msg.feedback || ""}. Next question: ${msg.question}`);
        }
        setTimeout(() => setStatus("ready"), 300);
        break;
      case "generating_report":
        setStatus("done");
        voice.stopListening();
        stopSpeaking();
        addMessage({ type: "system", text: "Interview complete! Generating your report…" });
        speak("Excellent! Generating your evaluation report now.");
        break;
      case "final_report":
        onReport(msg.report);
        break;
      case "api_key_required":
        onApiKeyRequired();
        break;
      case "rate_limit_exceeded":
        onError(msg.message);
        break;
      case "invalid_api_key":
        onError(msg.message);
        onApiKeyRequired();
        break;
      case "error":
        onError(msg.message);
        setStatus("ready");
        break;
      default: break;
    }
    // eslint-disable-next-line
  }, [onReport, onError, onApiKeyRequired, speak, stopSpeaking]);

  const addMessage = (m) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...m }]);

  // ── Send answer ───────────────────────────────────────────
  const sendAnswer = useCallback((text) => {
    const trimmed = text?.trim();
    if (!trimmed || !wsRef.current) return;
    voice.stopListening();
    addMessage({ type: "user", text: trimmed });
    setTextInput("");
    setStatus("thinking");
    wsRef.current.send(JSON.stringify({ type: "answer", sessionId, payload: { text: trimmed } }));
    // eslint-disable-next-line
  }, [sessionId, wsRef]);

  // ── Push-to-talk handlers ─────────────────────────────────
  const handlePushStart = useCallback((e) => {
    e.preventDefault();
    if (status !== "ready" || isSpeaking || pushHeldRef.current) return;
    pushHeldRef.current = true;
    setPushHeld(true);
    // Voice will start listening automatically via useEffect
  }, [status, isSpeaking]);

  const handlePushEnd = useCallback((e) => {
    e.preventDefault();
    if (!pushHeldRef.current) return;
    pushHeldRef.current = false;
    setPushHeld(false);
    // Voice will stop listening automatically via useEffect
  }, []);

  // Space bar = push-to-talk in push mode
  useEffect(() => {
    if (micMode !== "push") return;
    const onKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat && !showText) {
        handlePushStart(e);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") handlePushEnd(e);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [micMode, handlePushStart, handlePushEnd, showText]);

  const handleEndInterview = () => {
    voice.stopListening();
    wsRef.current?.send(JSON.stringify({ type: "end_interview", sessionId }));
  };

  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null;

  // Derive orb visual state
  const orbState =
    status === "connecting"   ? "idle" :
    status === "error"        ? "error" :
    isSpeaking                ? "speaking" :
    status === "thinking"     ? "thinking" :
    pushHeld                  ? "listening" :
    voice.isListening         ? "listening" :
    status === "done"         ? "done" :
    "idle";

  // Audio level bars (5 bars driven by audioLevel 0-100)
  const barHeights = [0.4, 0.7, 1.0, 0.7, 0.4].map(mult => {
    const h = Math.round(voice.audioLevel * mult);
    return Math.max(3, Math.min(32, h));
  });

  return (
    <div className="voice-page">

      {/* LEFT — Transcript */}
      <div className="voice-transcript-panel">
        <div className="panel-header">
          <span className="panel-title">Transcript</span>
          {avgScore && <span className="panel-score">Avg <strong>{avgScore}</strong>/10</span>}
        </div>
        <div className="transcript-messages">
          {messages.length === 0 && status === "connecting" && (
            <div className="transcript-empty">
              <div className="mini-spinner" />
              <p>Connecting…</p>
            </div>
          )}
          {status === "error" && (
            <div className="transcript-empty transcript-empty--error">
              <p>⚠ Connection failed</p>
              <code>{getWsUrl()}</code>
            </div>
          )}
          {messages.map(msg => <TranscriptMessage key={msg.id} msg={msg} />)}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* CENTER — Voice orb */}
      <div className="voice-center">

        {/* Candidate badge */}
        <div className="voice-candidate-row">
          <div className="voice-candidate-avatar">
            {(resumeData.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="voice-candidate-name">{resumeData.name || "Candidate"}</div>
            <div className="voice-candidate-level">{resumeData.experience_level}</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${micMode === "push" ? "active" : ""}`}
            onClick={() => { voice.stopListening(); setMicMode("push"); }}
          >
            🔒 Hold to Talk
          </button>
          <button
            className={`mode-toggle-btn ${micMode === "auto" ? "active" : ""}`}
            onClick={() => setMicMode("auto")}
          >
            🎙 Auto Listen
          </button>
        </div>

        {/* Status label */}
        <div className={`voice-status-label voice-status-label--${orbState}`}>
          {orbState === "idle" && micMode === "push" && status === "ready" &&
            "Hold orb (or SPACE) to speak"}
          {orbState === "idle" && micMode === "auto" && status === "ready" &&
            "Mic will open automatically"}
          {orbState === "listening" && micMode === "push" &&
            "🔴 Recording… release when done"}
          {orbState === "listening" && micMode === "auto" &&
            "🎙 Listening — speak your answer"}
          {orbState === "speaking"  && "AI is speaking…"}
          {orbState === "thinking"  && "Analyzing your answer…"}
          {orbState === "connecting"&& "Connecting…"}
          {orbState === "error"     && "Connection error"}
          {orbState === "done"      && "Interview complete"}
        </div>

        {/* ── Main Orb ── */}
        {micMode === "push" ? (
          // PUSH-TO-TALK: hold button
          <button
            className={`voice-orb voice-orb--${orbState} ${pushHeld ? "voice-orb--held" : ""}`}
            onMouseDown={handlePushStart}
            onMouseUp={handlePushEnd}
            onMouseLeave={handlePushEnd}
            onTouchStart={handlePushStart}
            onTouchEnd={handlePushEnd}
            disabled={status !== "ready" || isSpeaking || status === "done" || status === "error"}
            aria-label="Hold to record your answer"
          >
            {voice.isListening && <>
              <span className="orb-ring orb-ring--1" />
              <span className="orb-ring orb-ring--2" />
              <span className="orb-ring orb-ring--3" />
            </>}
            <OrbIcon orbState={orbState} pushHeld={pushHeld} />
            {pushHeld && (
              <div className="orb-waveform">
                {barHeights.map((h, i) => (
                  <span key={i} style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            )}
          </button>
        ) : (
          // AUTO mode: tap to force-start/stop
          <button
            className={`voice-orb voice-orb--${orbState}`}
            onClick={() => {
              if (voice.isListening) {
                const txt = (voice.accumulatedText + " " + voice.interimText).trim();
                voice.stopListening();
                if (txt.split(/\s+/).length >= 3) sendAnswer(txt);
              } else if (status === "ready" && !isSpeaking) {
                voice.startListening({ push: false });
              }
            }}
            disabled={status === "connecting" || status === "thinking" || isSpeaking || status === "done" || status === "error"}
            aria-label="Toggle listening"
          >
            {voice.isListening && <>
              <span className="orb-ring orb-ring--1" />
              <span className="orb-ring orb-ring--2" />
              <span className="orb-ring orb-ring--3" />
            </>}
            <OrbIcon orbState={orbState} pushHeld={false} />
            {voice.isListening && (
              <div className="orb-waveform">
                {barHeights.map((h, i) => (
                  <span key={i} style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            )}
          </button>
        )}

        {/* Mic level meter — always visible so user knows if mic works */}
        <div className="mic-meter-row">
          <span className="mic-meter-label">MIC</span>
          <div className="mic-meter">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`mic-bar ${voice.audioLevel > (i / 20) * 100 ? "mic-bar--active" : ""}`}
                style={{
                  background: i < 12
                    ? "var(--green)"
                    : i < 16
                      ? "var(--amber)"
                      : "var(--red)",
                }}
              />
            ))}
          </div>
          <span className="mic-meter-val">{Math.round(voice.audioLevel)}%</span>
        </div>

        {/* Live transcript box */}
        <div className={`live-transcript ${voice.displayText ? "live-transcript--active" : ""}`}>
          {voice.displayText ? (
            <>
              <span className="live-transcript-text">{voice.displayText}</span>
              {voice.confidencePct > 0 && (
                <span className={`live-transcript-conf ${voice.confidencePct < 50 ? "low-conf" : ""}`}>
                  {voice.confidencePct < 50 ? "⚠ Low confidence — try speaking clearer" : `${voice.confidencePct}% confidence`}
                </span>
              )}
            </>
          ) : (
            <span className="live-transcript-hint">
              {!hasSpeechRecognition
                ? "⚠ Voice not supported — use text below"
                : micMode === "push"
                  ? "Hold the orb while you speak, release to submit"
                  : "Your speech will appear here…"}
            </span>
          )}
        </div>

        {/* Silence timer bar (auto mode only) */}
        {micMode === "auto" && voice.isListening && voice.accumulatedText && (
          <div className="silence-bar">
            <div className="silence-bar-fill" key={voice.accumulatedText} />
            <span className="silence-bar-label">Auto-submitting after 4s silence</span>
          </div>
        )}

        {/* Bottom controls */}
        <div className="voice-bottom-row">
          <div className="voice-qcounter">Q{questionCount}</div>

          <button className="toggle-text-btn" onClick={() => setShowText(s => !s)}>
            {showText ? "Hide text" : "⌨ Type instead"}
          </button>

          {status !== "done" && scores.length >= 2 && (
            <button className="end-btn-voice" onClick={handleEndInterview}>
              End & Report
            </button>
          )}
        </div>

        {/* Text fallback */}
        {showText && (
          <div className="text-fallback">
            <textarea
              className="text-fallback-input"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAnswer(textInput);
                }
              }}
              placeholder="Type your answer… (Enter to send)"
              rows={3}
              disabled={status !== "ready"}
            />
            <button
              className="text-fallback-send"
              onClick={() => sendAnswer(textInput)}
              disabled={status !== "ready" || !textInput.trim()}
            >Send ↵</button>
          </div>
        )}
      </div>

      {/* RIGHT — Resume sidebar */}
      <div className="voice-sidebar">
        <div className="sidebar-section-title">Skills</div>
        <div className="sidebar-skill-tags">
          {(resumeData.skills || []).slice(0, 12).map((s, i) => (
            <span key={i} className="sidebar-skill-tag">{s}</span>
          ))}
        </div>

        {(resumeData.strengths || []).length > 0 && <>
          <div className="sidebar-section-title sidebar-section-title--green">Strengths</div>
          {resumeData.strengths.slice(0, 3).map((s, i) => (
            <div key={i} className="sidebar-list-item sidebar-list-item--green">
              <span className="sli-dot" />{s}
            </div>
          ))}
        </>}

        {(resumeData.weaknesses || []).length > 0 && <>
          <div className="sidebar-section-title sidebar-section-title--amber">Focus Areas</div>
          {resumeData.weaknesses.slice(0, 3).map((s, i) => (
            <div key={i} className="sidebar-list-item sidebar-list-item--amber">
              <span className="sli-dot" />{s}
            </div>
          ))}
        </>}

        {avgScore && (
          <div className="sidebar-score-block">
            <div className="sidebar-section-title">Live Score</div>
            <div className="sidebar-score-num">{avgScore}<span>/10</span></div>
            <div className="sidebar-score-bar">
              <div className="sidebar-score-fill" style={{ width: `${(avgScore / 10) * 100}%` }} />
            </div>
            <div className="sidebar-score-count">{scores.length} answered</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Orb icon subcomponent ─────────────────────────────────
function OrbIcon({ orbState, pushHeld }) {
  if (orbState === "speaking") return (
    <svg className="orb-icon" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
  if (orbState === "thinking") return (
    <div className="orb-icon orb-thinking">
      <span/><span/><span/>
    </div>
  );
  // Mic icon — red when recording
  return (
    <svg
      className="orb-icon"
      viewBox="0 0 24 24"
      width="36"
      height="36"
      fill={pushHeld || orbState === "listening" ? "var(--accent)" : "currentColor"}
    >
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.93V20H9v2h6v-2h-2v-2.07A7 7 0 0019 11h-2z"/>
    </svg>
  );
}

// ── Transcript message component ──────────────────────────
function TranscriptMessage({ msg }) {
  const sc = msg.score >= 8 ? "var(--green)" : msg.score >= 5 ? "var(--amber)" : "var(--red)";
  if (msg.type === "system") return <div className="tm-system">◈ {msg.text}</div>;
  if (msg.type === "user") return (
    <div className="tm tm--user">
      <span className="tm-label">You</span>
      <p className="tm-text">{msg.text}</p>
    </div>
  );
  if (msg.type === "ai-question") return (
    <div className="tm tm--ai">
      <span className="tm-label">Q{msg.questionNum}</span>
      <p className="tm-text">{msg.text}</p>
    </div>
  );
  if (msg.type === "ai-feedback") return (
    <div className="tm tm--feedback">
      <div className="tm-feedback-header">
        <span className="tm-label">Feedback</span>
        {msg.score != null && <span className="tm-score" style={{ color: sc }}>{msg.score}/10</span>}
      </div>
      <p className="tm-text">{msg.text}</p>
    </div>
  );
  return null;
}
