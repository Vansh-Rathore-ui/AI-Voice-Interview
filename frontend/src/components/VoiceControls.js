// ============================================================
// VoiceControls.js — Noise-resistant, push-to-talk voice hook
//
// Problems solved:
//  1. Fan/background noise submitting garbage → minimum word
//     count + confidence threshold filtering
//  2. Auto-submit firing too fast → longer silence timer +
//     requires real words, not noise
//  3. Mic not actually hearing user → visual audio level meter
//     using Web Audio API so user can see if mic is picking up
//  4. Push-to-talk mode → hold SPACE or hold the orb button
//     — only listens while held, submits on release
//  5. Filler word cleanup → strips "um", "uh", "hmm" etc.
//  6. Confidence threshold → ignores results below 0.4
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

export const hasSpeechRecognition =
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export const hasSpeechSynthesis = !!window.speechSynthesis;

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Tune these to your environment:
const SILENCE_TIMEOUT_MS     = 6000;  // 6s silence → auto submit (longer for hold-to-talk)
const MIN_CONFIDENCE         = 0.35;  // ignore results below this (noise tends to be low)
const MIN_WORDS_TO_SUBMIT    = 2;     // lower threshold for hold-to-talk
const FILLER_WORDS           = /\b(um+|uh+|hmm+|hm+|ah+|er+|uhh+)\b/gi;

// Clean up transcript: remove filler words + excessive spaces
function cleanText(text) {
  return text.replace(FILLER_WORDS, "").replace(/\s{2,}/g, " ").trim();
}

// ── useVoice hook ─────────────────────────────────────────
export function useVoice({ onFinalTranscript, disabled, isSpeaking }) {
  const [isListening,     setIsListening]     = useState(false);
  const [interimText,     setInterimText]     = useState("");
  const [accumulatedText, setAccumulated]     = useState("");
  const [confidence,      setConfidence]      = useState(0);
  const [audioLevel,      setAudioLevel]      = useState(0); // 0-100, from mic
  const [mode,            setMode]            = useState("push"); // "auto" | "push"
  const [persistentListening, setPersistentListening] = useState(false); // don't stop during user turn

  const recognitionRef    = useRef(null);
  const silenceTimerRef   = useRef(null);
  const accumulatedRef    = useRef("");
  const isListeningRef    = useRef(false);
  const shouldRestartRef  = useRef(false);
  const onFinalRef        = useRef(onFinalTranscript);
  const audioContextRef   = useRef(null);
  const analyserRef       = useRef(null);
  const animFrameRef      = useRef(null);
  const micStreamRef      = useRef(null);
  const pushModeRef       = useRef(false);
  const persistentRef     = useRef(false);

  useEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);

  // ── Audio level meter (Web Audio API) ───────────────────
  // This lets user SEE that their mic is active + picking up sound
  const startAudioMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // removes speaker feedback
          noiseSuppression: true,   // removes background noise
          autoGainControl:  true,   // normalizes quiet voices
        }
      });
      micStreamRef.current = stream;

      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source   = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current     = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 2)); // scale to 0-100
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("[Voice] Audio meter failed:", e.message);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // ── Build SpeechRecognition instance ────────────────────
  useEffect(() => {
    if (!hasSpeechRecognition) return;

    const r = new SpeechRecognitionAPI();
    r.continuous      = true;   // don't cut off on natural pauses
    r.interimResults  = true;   // show partial results in real time
    r.maxAlternatives = 5;      // consider more options for better accuracy
    r.lang            = "en-US";

    r.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    r.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);

      let interimChunk = "";
      let finalChunk   = "";
      let bestConf     = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // Pick highest-confidence alternative
        let best = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > best.confidence) best = result[j];
        }

        // Skip very low confidence results (usually noise)
        if (!result.isFinal && best.confidence > 0 && best.confidence < MIN_CONFIDENCE) {
          continue;
        }

        if (result.isFinal) {
          finalChunk += best.transcript + " ";
          bestConf    = Math.max(bestConf, best.confidence || 0.8);
        } else {
          interimChunk += best.transcript;
          bestConf      = Math.max(bestConf, best.confidence || 0.5);
        }
      }

      if (finalChunk.trim()) {
        const updated = (accumulatedRef.current + " " + finalChunk).trim();
        accumulatedRef.current = updated;
        setAccumulated(updated);
        setInterimText("");
      } else if (interimChunk) {
        setInterimText(interimChunk);
      }

      if (bestConf > 0) setConfidence(bestConf);

      // In push-to-talk mode, don't auto-submit — wait for button release
      if (pushModeRef.current) return;

      // Auto-submit timer (only if we actually have real words)
      silenceTimerRef.current = setTimeout(() => {
        const raw  = (accumulatedRef.current + " " + interimChunk).trim();
        const clean = cleanText(raw);
        const words = clean.split(/\s+/).filter(Boolean);

        if (words.length >= MIN_WORDS_TO_SUBMIT) {
          shouldRestartRef.current = false;
          _stopRecognition(r);
          accumulatedRef.current = "";
          setAccumulated("");
          setInterimText("");
          onFinalRef.current(clean);
        } else {
          // Not enough real words — likely noise, ignore and keep listening
          accumulatedRef.current = "";
          setAccumulated("");
          setInterimText("");
          console.log("[Voice] Ignored short/noisy capture:", raw);
        }
      }, SILENCE_TIMEOUT_MS);
    };

    r.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      setInterimText("");

      // Auto-restart if mic should stay open and not in persistent mode
      if (shouldRestartRef.current && !persistentRef.current) {
        setTimeout(() => {
          try { r.start(); } catch (_) {}
        }, 100);
      }
    };

    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") {
        console.error("[Voice] Microphone permission denied");
        shouldRestartRef.current = false;
      }
      console.warn("[Voice] error:", e.error);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognitionRef.current = r;
    return () => { shouldRestartRef.current = false; r.abort(); };
  // eslint-disable-next-line
  }, []);

  // Stop mic when AI is speaking (avoids echo/feedback) - but not in persistent mode
  useEffect(() => {
    if (isSpeaking && isListeningRef.current && !persistentRef.current) {
      clearTimeout(silenceTimerRef.current);
      shouldRestartRef.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
    }
  }, [isSpeaking]);

  function _stopRecognition(r) {
    clearTimeout(silenceTimerRef.current);
    shouldRestartRef.current = false;
    setIsListening(false);
    isListeningRef.current = false;
    try { r.stop(); } catch (_) {}
  }

  // ── Public API ───────────────────────────────────────────
  const startListening = useCallback((opts = {}) => {
    if (!recognitionRef.current || isListeningRef.current || disabled) return;
    pushModeRef.current    = opts.push || false;
    persistentRef.current = opts.persistent || false;
    accumulatedRef.current = "";
    setAccumulated("");
    setInterimText("");
    setConfidence(0);
    setPersistentListening(opts.persistent || false);
    shouldRestartRef.current = !opts.push && !opts.persistent; // don't auto-restart in push or persistent mode
    try { recognitionRef.current.start(); } catch (e) {
      console.warn("[Voice] start failed:", e.message);
    }
  }, [disabled]);

  const stopListening = useCallback(() => {
    persistentRef.current = false;
    setPersistentListening(false);
    if (recognitionRef.current) _stopRecognition(recognitionRef.current);
  }, []);

  const setPersistent = useCallback((persistent) => {
    persistentRef.current = persistent;
    setPersistentListening(persistent);
    if (persistent && !isListeningRef.current && !disabled) {
      startListening({ persistent: true });
    } else if (!persistent && isListeningRef.current) {
      stopListening();
    }
  }, [disabled, startListening, stopListening]);

  // Push-to-talk: release → submit whatever was captured
  const submitAndStop = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    const raw   = (accumulatedRef.current + " " + (recognitionRef.current ? "" : "")).trim();
    const clean = cleanText(accumulatedRef.current);
    const words = clean.split(/\s+/).filter(Boolean);

    if (recognitionRef.current) _stopRecognition(recognitionRef.current);

    accumulatedRef.current = "";
    setAccumulated("");
    setInterimText("");

    if (words.length >= MIN_WORDS_TO_SUBMIT) {
      onFinalRef.current(clean);
    }
  }, []);

  const displayText = accumulatedText
    ? accumulatedText + (interimText ? " " + interimText : "")
    : interimText;

  return {
    isListening,
    displayText,
    accumulatedText,
    interimText,
    confidencePct: Math.round(confidence * 100),
    audioLevel,
    mode, setMode,
    persistentListening,
    startListening,
    stopListening,
    submitAndStop,
    setPersistent,
    startAudioMeter,
    stopAudioMeter,
    supported: hasSpeechRecognition,
  };
}

// ── useTTS hook ───────────────────────────────────────────
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text) => {
    if (!hasSpeechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utter   = new SpeechSynthesisUtterance(text);
    utter.rate    = 0.92;
    utter.pitch   = 1.0;
    utter.volume  = 1.0;
    utter.lang    = "en-US";

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return (
        voices.find(v => v.name === "Google US English") ||
        voices.find(v => v.name.includes("Samantha")) ||
        voices.find(v => v.lang === "en-US" && v.localService === false) ||
        voices.find(v => v.lang.startsWith("en-US")) ||
        voices.find(v => v.lang.startsWith("en"))
      );
    };

    // Voices may not be loaded yet on first call
    const voice = pickVoice();
    if (voice) utter.voice = voice;

    utter.onstart  = () => { setIsSpeaking(true);  isSpeakingRef.current = true; };
    utter.onend    = () => { setIsSpeaking(false); isSpeakingRef.current = false; };
    utter.onerror  = () => { setIsSpeaking(false); isSpeakingRef.current = false; };

    // Chrome bug: synthesis sometimes stops mid-sentence
    // Workaround: resume every 10s
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
    }, 10000);
    utter.onend   = () => { clearInterval(keepAlive); setIsSpeaking(false); isSpeakingRef.current = false; };
    utter.onerror = () => { clearInterval(keepAlive); setIsSpeaking(false); isSpeakingRef.current = false; };

    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  return { isSpeaking, speak, stop };
}
